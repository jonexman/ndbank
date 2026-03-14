import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserById,
  getAccountByUserId,
  getTransferOtpByTxRef,
  updateTransferOtpStatus,
  getUserTransferCodes,
} from "@/lib/supabase/db";
import { verifyCode } from "@/lib/auth/codes";

type CompleteBody = {
  tx_ref: string;
  codes?: Record<string, string>;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as CompleteBody;

  const dbUser = await getUserById(supabase, authUser.id);
  if (!dbUser?.verified) {
    return NextResponse.json(
      { status: "error", message: "Your account must be verified before you can complete a transfer. Please complete KYC." },
      { status: 400 }
    );
  }

  const otpRow = await getTransferOtpByTxRef(supabase, body.tx_ref, authUser.id);
  if (!otpRow) {
    return NextResponse.json(
      { status: "error", message: "Transfer request not found or expired." },
      { status: 404 }
    );
  }

  if (new Date(otpRow.expires_at) < new Date()) {
    await updateTransferOtpStatus(supabase, otpRow.id, "expired");
    return NextResponse.json(
      { status: "error", message: "Transfer request has expired. Please initiate a new transfer." },
      { status: 400 }
    );
  }

  const userCodes = await getUserTransferCodes(supabase, authUser.id);

  if (userCodes.length > 0) {
    if (!body.codes || typeof body.codes !== "object") {
      return NextResponse.json(
        { status: "error", message: "Transfer codes are required." },
        { status: 400 }
      );
    }

    for (const uc of userCodes) {
      const provided = body.codes[uc.code_type] ?? body.codes[uc.code_type.toLowerCase()];
      if (!provided) {
        return NextResponse.json(
          { status: "error", message: `Missing ${uc.code_type} code.` },
          { status: 400 }
        );
      }
      if (!verifyCode(provided, uc.code_hash)) {
        return NextResponse.json(
          { status: "error", message: `Invalid ${uc.code_type} code.` },
          { status: 400 }
        );
      }
    }
  } else {
    return NextResponse.json(
      { status: "error", message: "This transfer requires admin approval. Please wait for your bank to process it." },
      { status: 400 }
    );
  }

  const senderAccount = await getAccountByUserId(supabase, authUser.id, otpRow.currency);
  if (!senderAccount) {
    return NextResponse.json({ status: "error", message: "Account not found." }, { status: 404 });
  }

  if (Number(senderAccount.balance) < Number(otpRow.amount)) {
    return NextResponse.json(
      { status: "error", message: "Insufficient funds. Balance has changed since initiation." },
      { status: 400 }
    );
  }

  // Transfer remains pending until admin approves; do not execute process_transfer here
  return NextResponse.json(
    {
      status: "success",
      tx_ref: otpRow.tx_ref,
      message: "Transfer submitted successfully. It will remain processing until admin approval.",
    },
    { status: 200 }
  );
}
