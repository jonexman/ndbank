import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: loans, error } = await supabase
    .from("loans")
    .select("*")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
  }

  const formatted = (loans ?? []).map((l) => ({
    id: l.id,
    amount: Number(l.amount),
    duration: l.duration,
    loan_type: l.loan_type,
    loan_id: l.loan_id,
    status: l.status,
    date: l.created_at,
  }));

  return NextResponse.json({ loans: formatted });
}
