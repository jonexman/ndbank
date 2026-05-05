import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, account_id, amount, currency, status, tx_ref, description, created_at")
    .eq("type", "deposit")
    .order("created_at", { ascending: false })
    .limit(200);

  const accountIds = [...new Set((transactions ?? []).map((t) => t.account_id))];
  const { data: accounts } = await supabase
    .from("accounts")
    .select("id, user_id")
    .in("id", accountIds);
  const { data: users } = await supabase
    .from("users")
    .select("id, usercode, email")
    .in("id", [...new Set((accounts ?? []).map((a) => a.user_id))]);

  const accountMap = new Map((accounts ?? []).map((a) => [a.id, a]));
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const deposits = (transactions ?? []).map((t) => {
    const acc = accountMap.get(t.account_id);
    const usr = acc ? userMap.get(acc.user_id) : null;
    return {
      id: t.id,
      tx_ref: t.tx_ref,
      userid: usr?.id,
      usercode: usr?.usercode,
      usd_amount: t.amount,
      status: t.status,
      paid: t.status === "completed" ? t.amount : 0,
      date: t.created_at,
    };
  });

  return NextResponse.json({ deposits });
}
