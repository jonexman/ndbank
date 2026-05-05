import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ tx_ref: string }> }
) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tx_ref } = await context.params;
  if (!tx_ref) {
    return NextResponse.json({ error: "Transaction ref required" }, { status: 400 });
  }

  const { data: tx, error } = await supabase
    .from("transactions")
    .select("id, account_id, type, amount, currency, status, tx_ref, tx_region, recipient_account, created_at")
    .eq("tx_ref", tx_ref)
    .single();

  if (error || !tx) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("account_number, user_id")
    .eq("id", tx.account_id)
    .single();

  let bank_holder: string | null = null;
  if (account?.user_id) {
    const { data: user } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", account.user_id)
      .single();
    bank_holder = user?.full_name ?? null;
  }

  return NextResponse.json({
    tx_ref: tx.tx_ref,
    principal: Number(tx.amount),
    tx_type: tx.type,
    tx_date: tx.created_at,
    currency: tx.currency,
    status: tx.status ?? "completed",
    recipient_account: tx.recipient_account ?? account?.account_number ?? null,
    bank_holder,
  });
}
