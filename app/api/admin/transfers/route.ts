import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("id, account_id, type, amount, currency, status, tx_ref, tx_region, recipient_account, description, created_at")
    .in("type", ["debit", "credit", "transfer"])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch transfers" }, { status: 500 });
  }

  const accountIds = [...new Set((transactions ?? []).map((t) => t.account_id))];
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, account_number, user_id")
    .in("id", accountIds);
  const { data: users } = await supabase
    .from("users")
    .select("id, usercode, full_name")
    .in("id", [...new Set((accounts ?? []).map((a) => a.user_id))]);

  const accountMap = new Map((accounts ?? []).map((a) => [a.id, a]));
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const formatted = (transactions ?? []).map((t) => {
    const acc = accountMap.get(t.account_id);
    const usr = acc ? userMap.get(acc.user_id) : null;
    return {
      id: t.id,
      tx_ref: t.tx_ref,
      amount: t.amount,
      currency: t.currency,
      tx_type: t.type,
      status: t.status ?? "completed",
      tx_date: t.created_at,
      tx_region: t.tx_region ?? "local",
      bank_account: t.recipient_account ?? acc?.account_number,
      usercode: usr?.usercode,
      bank_holder: usr?.full_name,
    };
  });

  return NextResponse.json({ transfers: formatted });
}
