import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getUserById,
  getAccountByUserId,
  getTransferOtpByTxRef,
  updateTransferOtpStatus,
  setTransferOtpUserCompleted,
  getUserTransferCodes,
  updateUserTransferCode,
  insertTransferCodeValidation,
  getValidatedCodeTypesForTransfer,
  deleteTransferCodeValidations,
} from "@/lib/supabase/db";
import { verifyCode, generateAndHashCode } from "@/lib/auth/codes";

type Body = { tx_ref: string; code_type: string; value: string };

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Body;
  const { tx_ref, code_type, value } = body;
  if (!tx_ref || !code_type || value == null || value === "") {
    return NextResponse.json(
      { status: "error", message: "tx_ref, code_type and value are required." },
      { status: 400 }
    );
  }

  const dbUser = await getUserById(supabase, authUser.id);
  if (!dbUser?.verified) {
    return NextResponse.json(
      { status: "error", message: "Your account must be verified before you can complete a transfer." },
      { status: 400 }
    );
  }

  const otpRow = await getTransferOtpByTxRef(supabase, tx_ref, authUser.id);
  if (!otpRow) {
    return NextResponse.json(
      { status: "error", message: "Transfer request not found or expired." },
      { status: 404 }
    );
  }

  if (new Date(otpRow.expires_at) < new Date()) {
    await updateTransferOtpStatus(supabase, otpRow.id, "expired");
    return NextResponse.json(
      { status: "error", message: "Transfer request has expired." },
      { status: 400 }
    );
  }

  const userCodes = await getUserTransferCodes(supabase, authUser.id);
  if (userCodes.length === 0) {
    return NextResponse.json(
      { status: "error", message: "This transfer requires admin approval." },
      { status: 400 }
    );
  }

  const codeTypeNormalized = code_type.trim().toUpperCase().replace(/\s+/g, "_");
  const uc = userCodes.find((c) => c.code_type === codeTypeNormalized || c.code_type.toLowerCase() === code_type.toLowerCase());
  if (!uc) {
    return NextResponse.json(
      { status: "error", message: `Unknown code type: ${code_type}` },
      { status: 400 }
    );
  }

  if (!verifyCode(value, uc.code_hash)) {
    return NextResponse.json(
      { status: "error", message: `Invalid ${uc.code_type} code.` },
      { status: 400 }
    );
  }

  const { error: insertErr } = await insertTransferCodeValidation(supabase, tx_ref, authUser.id, uc.code_type);
  const errWithCode = insertErr as { code?: string; message?: string } | null;
  const isDuplicate =
    errWithCode?.code === "23505" || (errWithCode?.message?.toLowerCase().includes("unique") ?? false);
  if (insertErr && !isDuplicate) {
    return NextResponse.json(
      { status: "error", message: "Failed to record validation. Please try again." },
      { status: 500 }
    );
  }

  const validated = await getValidatedCodeTypesForTransfer(supabase, tx_ref, authUser.id);
  const required = userCodes.map((c) => c.code_type);
  const allValidated = required.every((t) => validated.includes(t));

  if (allValidated) {
    const senderAccount = await getAccountByUserId(supabase, authUser.id, otpRow.currency);
    if (!senderAccount) {
      return NextResponse.json({ status: "error", message: "Account not found." }, { status: 404 });
    }
    const totalDebit = Number(otpRow.amount) + Number(otpRow.fee_amount ?? 0);
    if (Number(senderAccount.balance) < totalDebit) {
      return NextResponse.json(
        { status: "error", message: "Insufficient funds. Balance has changed." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();
    const updateResult = adminSupabase
      ? await setTransferOtpUserCompleted(adminSupabase, otpRow.id)
      : { error: new Error("Server configuration error") };
    if (updateResult.error) {
      return NextResponse.json(
        { status: "error", message: "Failed to submit transfer. Please try again." },
        { status: 500 }
      );
    }

    if (adminSupabase) {
      for (const c of userCodes) {
        const { plain, hash } = generateAndHashCode(6);
        await updateUserTransferCode(adminSupabase, c.id, { code_hash: hash, current_plain_code: plain });
      }
      await deleteTransferCodeValidations(adminSupabase, tx_ref, authUser.id);
    }

    return NextResponse.json({
      status: "success",
      completed: true,
      tx_ref: otpRow.tx_ref,
      message: "Transfer submitted successfully. It will remain processing until admin approval.",
    });
  }

  const sorted = [...userCodes].sort((a, b) => a.sort_order - b.sort_order);
  const nextType = sorted.find((c) => !validated.includes(c.code_type))?.code_type ?? null;

  return NextResponse.json({
    status: "success",
    completed: false,
    next: nextType,
  });
}
