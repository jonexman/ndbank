import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getUserById,
  getAccountByUserId,
  getUserProfile,
  getUserTransferCodes,
  createTransferOtp,
} from "@/lib/supabase/db";
import { verifyPin } from "@/lib/auth/pin";

const OTP_EXPIRY_HOURS = 24;

type InitiateBody = {
  tx_region: string;
  bank_account: string;
  amount: number;
  currency: string;
  pin: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as InitiateBody;

  const dbUser = await getUserById(supabase, authUser.id);
  if (!dbUser) {
    return NextResponse.json({ status: "error", message: "User not found." }, { status: 404 });
  }

  if (!dbUser.verified) {
    return NextResponse.json(
      { status: "error", message: "Your account must be verified before you can transfer. Please complete KYC." },
      { status: 400 }
    );
  }

  if (!dbUser.can_transfer) {
    return NextResponse.json(
      { status: "error", message: "Transfer is not activated on your account. Please contact support." },
      { status: 400 }
    );
  }

  const profile = await getUserProfile(supabase, authUser.id);
  if (!profile?.pin_hash) {
    return NextResponse.json(
      { status: "error", message: "PIN is not set. Please contact support." },
      { status: 400 }
    );
  }

  if (!verifyPin(body.pin ?? "", profile.pin_hash)) {
    return NextResponse.json({ status: "error", message: "Invalid PIN." }, { status: 400 });
  }

  const validAccount = (body.tx_region === "international")
    ? body.bank_account.length <= 34 && /^[A-Za-z0-9]+$/.test(body.bank_account)
    : body.bank_account.length <= 20 && /^[0-9]+$/.test(body.bank_account);
  if (!validAccount) {
    return NextResponse.json(
      { status: "error", message: "The account number does not follow any financial institution standard." },
      { status: 400 }
    );
  }

  const senderAccount = await getAccountByUserId(supabase, authUser.id, body.currency);
  if (!senderAccount) {
    return NextResponse.json({ status: "error", message: "Account not found." }, { status: 404 });
  }

  const isInternational = body.tx_region === "international";
  let chargePct = 0;
  const admin = createAdminClient();
  if (admin) {
    const { data: rows } = await admin
      .from("site_options")
      .select("key, value")
      .in("key", ["local_transfer_charge_pct", "international_transfer_charge_pct"]);
    type SiteOptionRow = { key: string; value: string | null };
    const opts: Record<string, string> = {};
    for (const r of (rows ?? []) as SiteOptionRow[]) opts[r.key] = r.value ?? "0";
    chargePct = parseFloat(isInternational ? opts.international_transfer_charge_pct ?? "0" : opts.local_transfer_charge_pct ?? "0") || 0;
  }
  const feeAmount = Math.round(body.amount * (chargePct / 100) * 100) / 100;
  const totalDebit = body.amount + feeAmount;

  const balance = Number(senderAccount.balance);
  if (balance < totalDebit) {
    return NextResponse.json(
      { status: "error", message: `Insufficient funds. You need ${totalDebit.toFixed(2)} ${body.currency} (${body.amount.toFixed(2)} + ${feeAmount.toFixed(2)} fee) to initiate this transfer.` },
      { status: 400 }
    );
  }

  const userCodes = await getUserTransferCodes(supabase, authUser.id);
  const hasCodes = userCodes.length > 0;

  const txRef = `TNX${Date.now().toString(16).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_HOURS * 60 * 60 * 1000).toISOString();

  const { data: otpRow, error: insertError } = await createTransferOtp(supabase, {
    user_id: authUser.id,
    tx_ref: txRef,
    otp_code: null,
    recipient_account: body.bank_account,
    amount: body.amount,
    currency: body.currency,
    tx_region: body.tx_region,
    expires_at: expiresAt,
    fee_amount: feeAmount,
    user_completed_at: hasCodes ? null : new Date().toISOString(),
  });

  if (insertError || !otpRow) {
    return NextResponse.json(
      { status: "error", message: "Failed to initiate transfer. Please try again." },
      { status: 500 }
    );
  }

  const codeTypes = userCodes.map((c) => ({ type: c.code_type, order: c.sort_order }));

  return NextResponse.json(
    {
      status: "success",
      tx_ref: txRef,
      requires_codes: hasCodes,
      code_types: codeTypes,
      fee_amount: feeAmount,
      charge_pct: chargePct,
      total_debit: totalDebit,
      message: hasCodes
        ? `Enter your ${codeTypes.map((c) => c.type).join(", ")} code(s) to complete the transfer.`
        : "Transfer submitted for admin approval.",
    },
    { status: 201 }
  );
}
