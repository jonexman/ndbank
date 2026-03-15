import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAwaitingCodesTransfersByUserId, getUserTransferCodes } from "@/lib/supabase/db";

/**
 * Returns transfers that are awaiting the user's transfer codes (not yet submitted to admin).
 * Used by the dashboard to show "Complete your transfer" and by transfer pages to resume by tx_ref.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getAwaitingCodesTransfersByUserId(supabase, authUser.id);
  const userCodes = await getUserTransferCodes(supabase, authUser.id);
  const codeTypes = userCodes.map((c) => ({ type: c.code_type, order: c.sort_order }));

  const awaiting = rows.map((r) => ({
    tx_ref: r.tx_ref,
    amount: Number(r.amount),
    currency: r.currency,
    tx_region: r.tx_region,
    recipient_account: r.recipient_account,
    fee_amount: Number(r.fee_amount ?? 0),
    code_types: codeTypes,
  }));

  return NextResponse.json({ awaiting });
}
