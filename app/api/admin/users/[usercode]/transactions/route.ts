import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getUserByUsercode, getTransactionsByUserId, getTransactionsByAccountId, getAccountsByUserId } from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
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

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("account_id");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "15", 10), 100);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * limit;
  const includePending = searchParams.get("pending") !== "false";

  if (accountId) {
    const accounts = await getAccountsByUserId(supabase, user.id);
    if (!accounts.some((a) => a.id === accountId)) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }
  }

  const transactions = accountId
    ? await getTransactionsByAccountId(supabase, accountId, limit + 1, offset)
    : await getTransactionsByUserId(supabase, user.id, limit + 1, offset);

  const hasMore = transactions.length > limit;
  const pageData = transactions.slice(0, limit);

  const formatted = pageData.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    currency: t.currency,
    status: t.status,
    description: t.description,
    tx_ref: t.tx_ref,
    recipient_account: t.recipient_account,
    created_at: t.created_at,
  }));

  let pending: Array<{ tx_ref: string; otp_code: string; recipient_account: string; amount: number; currency: string; tx_region: string; expires_at: string }> = [];
  if (includePending && !accountId) {
    const adminSupabase = createAdminClient();
    if (adminSupabase) {
      const { data: pt } = await adminSupabase
        .from("transfer_otps")
        .select("tx_ref, otp_code, recipient_account, amount, currency, tx_region, expires_at")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      pending = (pt ?? []).map((r) => ({
        tx_ref: r.tx_ref,
        otp_code: r.otp_code,
        recipient_account: r.recipient_account,
        amount: Number(r.amount),
        currency: r.currency,
        tx_region: r.tx_region,
        expires_at: r.expires_at,
      }));
    }
  }

  return NextResponse.json({ transactions: formatted, pending, hasMore, page });
}
