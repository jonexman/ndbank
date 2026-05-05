import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", rate: 1 },
  { code: "GBP", name: "Pound Sterling", symbol: "£", rate: 0.8 },
  { code: "EUR", name: "Euro", symbol: "€", rate: 0.92 },
];

export async function GET() {
  return NextResponse.json({ currencies: CURRENCIES });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { fromCurrency, toCurrency, fromAmount } = body;
  const from = CURRENCIES.find((c) => c.code === fromCurrency);
  const to = CURRENCIES.find((c) => c.code === toCurrency);
  if (!from || !to || !fromAmount) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const usdValue = fromAmount * Number(from.rate);
  const expectedAmount = usdValue / Number(to.rate);

  const { data: ex, error } = await supabase
    .from("exchanges")
    .insert({
      user_id: authUser.id,
      paid_amount: fromAmount,
      paid_currency: fromCurrency,
      usd_value: usdValue,
      expected_amount: expectedAmount,
      expected_currency: toCurrency,
      status: "pending",
      funded: 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Exchange failed" }, { status: 500 });
  }

  return NextResponse.json({
    status: "success",
    exchange: {
      id: ex.id,
      paid_amount: ex.paid_amount,
      paid_currency: ex.paid_currency,
      expected_amount: ex.expected_amount,
      expected_currency: ex.expected_currency,
      status: ex.status,
      funded: ex.funded,
      date: ex.created_at,
    },
  });
}
