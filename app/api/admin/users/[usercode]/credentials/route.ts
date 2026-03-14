import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getUserByUsercode, getUserProfile, getAccountsByUserId } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPin } from "@/lib/auth/pin";
import { CURRENCIES } from "@/lib/admin/options";

const KYC_BUCKET = "kyc-documents";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ usercode: string }> }
) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = await getUserProfile(supabase, user.id);
  const accounts = await getAccountsByUserId(supabase, user.id);
  const balanceByCurrency = new Map(accounts.map((a) => [a.currency, Number(a.balance)]));

  const prof = profile as { kyc_status?: string; kyc_rejection_reason?: string; kyc_document?: string } | null;
  const kycStatus = prof?.kyc_status ?? "none";
  const kycRejectionReason = prof?.kyc_rejection_reason ?? null;
  let kycDocuments: Record<string, string> | null = null;
  const kycDocRaw = prof?.kyc_document;
  if (kycDocRaw) {
    try {
      const parsed = typeof kycDocRaw === "string" ? JSON.parse(kycDocRaw) : kycDocRaw;
      const adminSupabase = createAdminClient();
      if (adminSupabase && parsed && typeof parsed === "object") {
        kycDocuments = {};
        for (const [key, path] of Object.entries(parsed)) {
          if (path && typeof path === "string" && !key.startsWith("submitted")) {
            const { data } = await adminSupabase.storage.from(KYC_BUCKET).createSignedUrl(path, 3600);
            if (data?.signedUrl) kycDocuments[key] = data.signedUrl;
          }
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  const balances = CURRENCIES.map((c) => ({
    code: c.code,
    name: c.name,
    symbol: c.symbol,
    balance: balanceByCurrency.get(c.code) ?? 0,
  }));

  const adminSupabase = createAdminClient();
  let pendingTransfers: Array<{ tx_ref: string; otp_code: string; recipient_account: string; amount: number; currency: string; tx_region: string; expires_at: string }> = [];
  if (adminSupabase) {
    const { data: pt } = await adminSupabase
      .from("transfer_otps")
      .select("tx_ref, otp_code, recipient_account, amount, currency, tx_region, expires_at")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    pendingTransfers = (pt ?? []).map((r) => ({
      tx_ref: r.tx_ref,
      otp_code: r.otp_code,
      recipient_account: r.recipient_account,
      amount: Number(r.amount),
      currency: r.currency,
      tx_region: r.tx_region,
      expires_at: r.expires_at,
    }));
  }

  return NextResponse.json({
    user: {
      id: user.id,
      usercode: user.usercode,
      firstname: profile?.firstname ?? (user.full_name || "").split(" ")[0] ?? "",
      lastname: profile?.lastname ?? (user.full_name || "").split(" ").slice(1).join(" ") ?? "",
      bankNumber: user.bank_number,
      canTransfer: user.can_transfer,
      verified: user.verified,
    },
    meta: {
      accountType: profile?.account_type ?? "savings",
      kycDocument: profile?.kyc_document ?? null,
      kycStatus,
      kycRejectionReason,
      kycDocuments,
    },
    currencies: CURRENCIES,
    balances,
    pendingTransfers,
  });
}

export async function POST(req: NextRequest, context: { params: Promise<{ usercode: string }> }) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await context.params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const action = body.action as string;

  if (action === "modify") {
    const userUpdates: Record<string, unknown> = {
      can_transfer: body.canTransfer ?? user.can_transfer,
      verified: body.verified ?? user.verified,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("users").update(userUpdates).eq("id", user.id);

    await supabase
      .from("user_profiles")
      .update({ updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return NextResponse.json({ success: true, message: "Banking settings updated" });
  }

  if (action === "kyc") {
    const kycAction = body.kycAction as string;
    const reason = body.reason as string | undefined;
    if (kycAction !== "approve" && kycAction !== "reject") {
      return NextResponse.json({ error: "Invalid KYC action" }, { status: 400 });
    }

    const profileUpdates: Record<string, unknown> = {
      kyc_status: kycAction === "approve" ? "approved" : "rejected",
      kyc_rejection_reason: kycAction === "reject" ? (reason || "Documents did not meet requirements") : null,
      updated_at: new Date().toISOString(),
    };
    await supabase.from("user_profiles").update(profileUpdates).eq("user_id", user.id);

    if (kycAction === "approve") {
      await supabase.from("users").update({ verified: true, updated_at: new Date().toISOString() }).eq("id", user.id);
    } else {
      await supabase.from("users").update({ verified: false, updated_at: new Date().toISOString() }).eq("id", user.id);
    }

    return NextResponse.json({ success: true, message: `KYC ${kycAction === "approve" ? "approved" : "rejected"}` });
  }

  if (action === "reset_password") {
    const password = body.password as string;
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    const adminSupabase = createAdminClient();
    if (!adminSupabase) {
      return NextResponse.json(
        { error: "Password reset unavailable. Set SUPABASE_SERVICE_ROLE_KEY in environment." },
        { status: 500 }
      );
    }
    const { error } = await adminSupabase.auth.admin.updateUserById(user.id, { password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: "Password reset successfully" });
  }

  if (action === "reset_pin") {
    const pin = body.pin as string;
    if (!pin || typeof pin !== "string" || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
      return NextResponse.json({ error: "PIN must be 4–6 digits" }, { status: 400 });
    }
    const pin_hash = hashPin(pin);
    await supabase
      .from("user_profiles")
      .update({ pin_hash, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    return NextResponse.json({ success: true, message: "PIN reset successfully" });
  }

  if (action === "balance") {
    const amount = parseFloat(body.amount);
    const currency = body.currency || "USD";
    const txType = body.tx_type === "credit" ? "credit" : "debit";
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const accounts = await getAccountsByUserId(supabase, user.id);
    const acc = accounts.find((a) => a.currency === currency);
    if (!acc) {
      return NextResponse.json({ error: "Account not found for currency" }, { status: 404 });
    }

    const currentBalance = Number(acc.balance);
    const delta = txType === "credit" ? amount : -amount;
    const newBalance = Math.max(0, currentBalance + delta);

    await supabase
      .from("accounts")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", acc.id);

    const txRef = `ADM${Date.now().toString(16).toUpperCase()}`;
    await supabase.from("transactions").insert({
      account_id: acc.id,
      type: txType,
      amount: amount,
      currency,
      status: "completed",
      description: body.description || `Admin balance ${txType}`,
      tx_ref: txRef,
    });

    return NextResponse.json({ success: true, message: "Balance updated" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
