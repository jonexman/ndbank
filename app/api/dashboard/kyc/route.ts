import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/supabase/db";

const BUCKET = "kyc-documents";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  return map[mime] ?? "bin";
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getUserProfile(supabase, authUser.id);
  if (!profile) {
    return NextResponse.json({
      kycStatus: "none",
      kycRejectionReason: null,
      documents: null,
    });
  }

  const kycDoc = profile.kyc_document as string | null;
  const docs = kycDoc ? (typeof kycDoc === "string" ? JSON.parse(kycDoc) : kycDoc) : null;
  const kycStatus = (profile as { kyc_status?: string }).kyc_status ?? "none";
  const kycRejectionReason = (profile as { kyc_rejection_reason?: string }).kyc_rejection_reason ?? null;
  const kycSubmittedAt = (profile as { kyc_submitted_at?: string }).kyc_submitted_at ?? null;

  let signedUrls: Record<string, string> | null = null;
  if (docs && typeof docs === "object") {
    signedUrls = {};
    for (const [key, path] of Object.entries(docs)) {
      if (path && typeof path === "string") {
        const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
        if (data?.signedUrl) signedUrls[key] = data.signedUrl;
      }
    }
  }

  return NextResponse.json({
    kycStatus,
    kycRejectionReason,
    kycSubmittedAt,
    documents: signedUrls,
    hasDocuments: !!docs && Object.keys(docs).length > 0,
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getUserProfile(supabase, authUser.id);
  const currentStatus = (profile as { kyc_status?: string })?.kyc_status ?? "none";
  if (currentStatus === "pending") {
    return NextResponse.json({ error: "KYC already under review" }, { status: 400 });
  }
  if (currentStatus === "approved") {
    return NextResponse.json({ error: "Account already verified" }, { status: 400 });
  }

  const formData = await req.formData();
  const idDoc = formData.get("id_doc") as File | null;
  const addressDoc = formData.get("address_doc") as File | null;
  const selfie = formData.get("selfie") as File | null;

  if (!idDoc?.size || !addressDoc?.size || !selfie?.size) {
    return NextResponse.json(
      { error: "All three documents are required: ID, proof of address, and selfie" },
      { status: 400 }
    );
  }

  const files = [
    { file: idDoc, key: "id_doc" },
    { file: addressDoc, key: "address_doc" },
    { file: selfie, key: "selfie" },
  ];

  for (const { file } of files) {
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large: ${file.name} (max 5MB)` }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.name} (allowed: JPEG, PNG, WebP, PDF)` }, { status: 400 });
    }
  }

  const prefix = authUser.id;
  const docPaths: Record<string, string> = {};
  const ts = Date.now();

  for (const { file, key } of files) {
    const ext = extFromMime(file.type);
    const path = `${prefix}/${key}_${ts}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error } = await supabase.storage.from(BUCKET).upload(path, buf, {
      contentType: file.type,
      upsert: true,
    });
    if (error) {
      return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
    }
    docPaths[key] = path;
  }

  const kycDocument = JSON.stringify({
    ...docPaths,
    submitted_at: new Date().toISOString(),
  });

  const { error } = await supabase
    .from("user_profiles")
    .update({
      kyc_document: kycDocument,
      kyc_status: "pending",
      kyc_rejection_reason: null,
      kyc_submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", authUser.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "KYC documents submitted for review" });
}
