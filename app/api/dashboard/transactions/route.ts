import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTransactionsByUserId, getPendingTransferOtpsByUserId } from "@/lib/supabase/db";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "15", 10), 100);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * limit;

  const [rawTx, pendingOtps] = await Promise.all([
    getTransactionsByUserId(supabase, authUser.id, limit + 1, offset),
    getPendingTransferOtpsByUserId(supabase, authUser.id),
  ]);

  const hasMore = rawTx.length > limit;
  const transactions = rawTx.slice(0, limit).map((t) => ({
    tx_ref: t.tx_ref,
    principal: Number(t.amount),
    tx_type: t.type,
    tx_date: t.created_at,
    currency: t.currency,
    status: t.status ?? "completed",
    recipient_account: t.recipient_account ?? null,
  }));

  const pendingSubmitted = pendingOtps.filter((p) => (p as { user_completed_at?: string | null }).user_completed_at != null);
  const pendingTransfers = pendingSubmitted.map((p) => ({
    tx_ref: p.tx_ref,
    principal: Number(p.amount),
    tx_type: "debit" as const,
    tx_date: p.created_at,
    currency: p.currency,
    status: "awaiting_admin" as const,
    recipient_account: p.recipient_account,
  }));

  return NextResponse.json({
    transactions,
    pendingTransfers,
    hasMore,
    page,
  });
}
