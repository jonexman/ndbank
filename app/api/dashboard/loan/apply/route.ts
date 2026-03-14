import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { amount, duration, loanType, reason } = body;
  if (!amount || !duration || !loanType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const loanId = Math.random().toString(36).slice(2, 8);

  const { data: loan, error } = await supabase
    .from("loans")
    .insert({
      user_id: authUser.id,
      amount: Number(amount),
      duration,
      loan_type: loanType,
      reason: reason ?? null,
      loan_id: loanId,
      status: "pending",
      funded: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Loan application failed" }, { status: 500 });
  }

  return NextResponse.json({
    status: "success",
    loan: {
      id: loan.id,
      amount: loan.amount,
      duration: loan.duration,
      loan_type: loan.loan_type,
      loan_id: loan.loan_id,
      status: loan.status,
      funded: loan.funded,
      date: loan.created_at,
    },
  });
}
