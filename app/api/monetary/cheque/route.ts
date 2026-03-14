import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ChequeDepositBody = {
  cheque_number: string;
  amount: number;
  currency: string;
  payee: string;
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as ChequeDepositBody;
  const { cheque_number, amount, currency, payee } = body;

  if (!cheque_number?.trim() || !amount || amount <= 0 || !payee?.trim()) {
    return NextResponse.json(
      { status: "error", message: "Cheque number, amount and payee are required." },
      { status: 400 }
    );
  }

  const { data: cheque, error } = await supabase
    .from("cheques")
    .insert({
      user_id: authUser.id,
      cheque_number: cheque_number.trim(),
      amount: Number(amount),
      currency: currency || "USD",
      payee: payee.trim(),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { status: "error", message: "Cheque deposit failed. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      status: "success",
      cheque_id: cheque.id,
      message: `Cheque #${cheque_number} for ${amount} ${currency || "USD"} has been submitted for clearing. You will be credited once it clears (typically 3–5 business days).`,
    },
    { status: 201 }
  );
}
