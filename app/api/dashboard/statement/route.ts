import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserById, getTransactionsByUserId } from "@/lib/supabase/db";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");

  const dbUser = await getUserById(supabase, authUser.id);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let transactions = await getTransactionsByUserId(supabase, authUser.id, 500);

  if (month) {
    const [y, m] = month.split("-").map(Number);
    transactions = transactions.filter((t) => {
      const d = new Date(t.created_at);
      return d.getFullYear() === y && d.getMonth() + 1 === m;
    });
  }

  const txFormatted = transactions.map((t) => ({
    tx_ref: t.tx_ref,
    principal: Number(t.amount),
    tx_type: t.type,
    tx_date: t.created_at,
    currency: t.currency,
  }));

  return NextResponse.json({
    user: {
      firstname: (dbUser.full_name || "").split(" ")[0],
      lastname: (dbUser.full_name || "").split(" ").slice(1).join(" "),
      bank_number: dbUser.bank_number,
    },
    transactions: txFormatted,
  });
}
