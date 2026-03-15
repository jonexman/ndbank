import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("transfer_otps")
    .select("*")
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  type Row = { user_id: string; id: string; tx_ref: string; otp_code: string; recipient_account: string; amount: number; currency: string; tx_region: string; status: string; fee_amount?: number; user_completed_at: string | null; created_at: string; expires_at: string };
  const pending: Row[] = data ?? [];

  const users = new Map<string, { email: string; full_name: string; usercode: string }>();
  for (const p of pending) {
    if (!users.has(p.user_id)) {
      const { data: userData } = await supabase
        .from("users")
        .select("email, full_name, usercode")
        .eq("id", p.user_id)
        .single();
      const u = userData as { email: string; full_name: string; usercode: string } | null;
      if (u) users.set(p.user_id, { email: u.email, full_name: u.full_name, usercode: u.usercode ?? "" });
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message, pending: [] });
  }

  const list = pending.map((p) => ({
    id: p.id,
    tx_ref: p.tx_ref,
    user_id: p.user_id,
    user_usercode: users.get(p.user_id)?.usercode ?? "",
    user_email: users.get(p.user_id)?.email ?? "",
    user_name: users.get(p.user_id)?.full_name ?? "",
    recipient_account: p.recipient_account,
    amount: Number(p.amount),
    fee_amount: Number(p.fee_amount ?? 0),
    currency: p.currency,
    tx_region: p.tx_region,
    otp_code: p.otp_code,
    status: p.status,
    created_at: p.created_at,
    expires_at: p.expires_at,
    awaiting_user: p.user_completed_at == null,
  }));

  return NextResponse.json({ pending: list });
}
