import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccountByUserId } from "@/lib/supabase/db";
import { createTransaction } from "@/lib/supabase/db";

const PAYMENT_METHODS = [
  { id: 1, medium: "crypto" as const, name: "Bitcoin", detail: "BTC", network: "bitcoin" },
  { id: 2, medium: "bank" as const, name: "Bank Transfer", detail: "Wire", network: null },
];

type DepositRequestBody = {
  methodId: number;
  usd_amount: number;
  rate: number;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as DepositRequestBody;
  const method = PAYMENT_METHODS.find((m) => m.id === body.methodId);
  if (!method) {
    return NextResponse.json(
      { status: "error", message: "Invalid deposit method." },
      { status: 400 }
    );
  }

  const account = await getAccountByUserId(supabase, authUser.id, "USD");
  if (!account) {
    return NextResponse.json(
      { status: "error", message: "Account not found." },
      { status: 404 }
    );
  }

  const rate = Number(body.rate) || 0;
  const txRef = `TNX${Date.now().toString(16).toUpperCase()}`;

  const { data: tx, error } = await createTransaction(
    supabase,
    account.id,
    "deposit",
    body.usd_amount,
    "USD",
    {
      tx_ref: txRef,
      status: "pending",
      description: `Deposit via ${method.name} - ${body.usd_amount} USD`,
    }
  );

  if (error) {
    return NextResponse.json(
      { status: "error", message: "Deposit failed. Please try again." },
      { status: 500 }
    );
  }

  const message =
    method.medium !== "bank"
      ? `Your deposit of ${body.usd_amount} USD has been submitted.`
      : `Your bank deposit of ${body.usd_amount} USD has been submitted.`;

  return NextResponse.json(
    {
      status: "success",
      tx_ref: txRef,
      message: `${message} Reference ID: ${txRef}. You will be credited once the deposit is confirmed.`,
    },
    { status: 201 }
  );
}
