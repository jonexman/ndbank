import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    { count: totalUsers },
    { data: transactions },
    { data: deposits },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("transactions").select("type, amount, account_id"),
    supabase
      .from("transactions")
      .select("status")
      .eq("type", "deposit"),
  ]);

  const debits = (transactions ?? []).filter((t) => t.type === "debit");
  const credits = (transactions ?? []).filter((t) => t.type === "credit");
  const totalDebits = debits.reduce((s, t) => s + Number(t.amount), 0);
  const totalCredits = credits.reduce((s, t) => s + Number(t.amount), 0);

  const approvedDeposits = (deposits ?? []).filter((d) => d.status === "completed").length;
  const pendingDeposits = (deposits ?? []).filter((d) => d.status === "pending").length;
  const declinedDeposits = (deposits ?? []).filter((d) => d.status === "failed" || d.status === "cancelled").length;

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalDebits,
    totalCredits,
    totalTransactions: transactions?.length ?? 0,
    approvedDeposits,
    pendingDeposits,
    declinedDeposits,
  });
}
