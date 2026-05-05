import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserById,
  getAccountByUserId,
  getTransactionsByUserId,
  getPendingTransferOtpsByUserId,
  getUserProfile,
} from "@/lib/supabase/db";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = authUser.id;
  let dbUser = await getUserById(supabase, userId);

  // Backfill: if user exists in auth but not in public.users (e.g. signed up before trigger), create profile via RPC
  if (!dbUser && authUser.email) {
    const fullName = (authUser.user_metadata?.full_name as string) ?? authUser.email?.split("@")[0] ?? "User";
    await supabase.rpc("ensure_user_profile", {
      p_user_id: authUser.id,
      p_email: authUser.email,
      p_full_name: fullName,
    });
    dbUser = await getUserById(supabase, userId);
  }

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const account = await getAccountByUserId(supabase, userId, "USD");
  const profile = await getUserProfile(supabase, userId);
  const transactions = await getTransactionsByUserId(supabase, userId, 20);
  const pendingOtps = await getPendingTransferOtpsByUserId(supabase, userId);

  const accountType = (profile as { account_type?: string })?.account_type ?? "savings";
  const kycStatus = (profile as { kyc_status?: string })?.kyc_status ?? "none";

  const txFormatted = transactions.map((t) => ({
    tx_ref: t.tx_ref,
    principal: Number(t.amount),
    tx_type: t.type,
    tx_date: t.created_at,
    currency: t.currency,
    status: t.status ?? "completed",
    recipient_account: t.recipient_account ?? null,
  }));

  const pendingSubmitted = pendingOtps.filter((p) => (p as { user_completed_at?: string | null }).user_completed_at != null);
  const pendingFormatted = pendingSubmitted.map((p) => ({
    tx_ref: p.tx_ref,
    principal: Number(p.amount),
    tx_type: "debit" as const,
    tx_date: p.created_at,
    currency: p.currency,
    status: "awaiting_admin" as const,
    recipient_account: p.recipient_account,
  }));

  const currencies = [
    { code: "USD", name: "US Dollar", symbol: "$", rate: 1 },
    { code: "GBP", name: "Pound Sterling", symbol: "£", rate: 0.8 },
    { code: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
  ];

  return NextResponse.json({
    user: {
      id: dbUser.id,
      email: dbUser.email,
      firstname: (dbUser.full_name || "").split(" ")[0] || dbUser.full_name,
      lastname: (dbUser.full_name || "").split(" ").slice(1).join(" ") || "",
      bank_number: dbUser.bank_number,
      account_number: account?.account_number ?? dbUser.bank_number,
      account_type: accountType,
      balance: account ? Number(account.balance) : 0,
      currency: account?.currency ?? "USD",
      kycStatus,
    },
    currencies,
    transactions: txFormatted,
    pendingTransfers: pendingFormatted,
  });
}
