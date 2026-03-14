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

  const { data: pending = [], error } = await supabase
    .from("transfer_otps")
    .select("*")
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  const users = new Map<string, { email: string; full_name: string }>();
  for (const p of pending) {
    if (!users.has(p.user_id)) {
      const { data } = await supabase
        .from("users")
        .select("email, full_name")
        .eq("id", p.user_id)
        .single();
      if (data) users.set(p.user_id, { email: data.email, full_name: data.full_name });
    }
  }

  if (error) {
    return NextResponse.json({ error: error.message, pending: [] });
  }

  const list = (pending as Array<{ id: string; user_id: string; tx_ref: string; otp_code: string; recipient_account: string; amount: number; currency: string; tx_region: string; status: string; created_at: string; expires_at: string }>).map((p) => ({
    id: p.id,
    tx_ref: p.tx_ref,
    user_id: p.user_id,
    user_email: users.get(p.user_id)?.email ?? "",
    user_name: users.get(p.user_id)?.full_name ?? "",
    recipient_account: p.recipient_account,
    amount: Number(p.amount),
    currency: p.currency,
    tx_region: p.tx_region,
    otp_code: p.otp_code,
    status: p.status,
    created_at: p.created_at,
    expires_at: p.expires_at,
  }));

  return NextResponse.json({ pending: list });
}
