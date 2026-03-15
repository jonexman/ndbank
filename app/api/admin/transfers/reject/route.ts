import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

type Body = { tx_ref: string };

export async function POST(req: NextRequest) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Body;
  if (!body.tx_ref) {
    return NextResponse.json({ success: false, error: "tx_ref required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("transfer_otps")
    .update({ status: "rejected" })
    .eq("tx_ref", body.tx_ref)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json(
      { success: false, error: "Transfer not found or already processed" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, tx_ref: body.tx_ref });
}
