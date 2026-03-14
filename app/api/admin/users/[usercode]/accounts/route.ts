import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getUserByUsercode, getAccountsByUserId } from "@/lib/supabase/db";
import { CURRENCIES } from "@/lib/admin/options";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ usercode: string }> }
) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const accounts = await getAccountsByUserId(supabase, user.id);

  return NextResponse.json({
    user: {
      id: user.id,
      usercode: user.usercode,
      full_name: user.full_name,
      bank_number: user.bank_number,
    },
    accounts: accounts.map((a) => ({
      id: a.id,
      currency: a.currency,
      account_number: a.account_number,
      balance: Number(a.balance),
      created_at: a.created_at,
    })),
    currencies: CURRENCIES,
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ usercode: string }> }) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();
  const action = body.action as string;

  if (action === "balance") {
    const accountId = body.account_id as string;
    const amount = parseFloat(body.amount);
    const txType = body.tx_type === "credit" ? "credit" : "debit";
    const description = body.description as string | undefined;

    if (!accountId || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid account or amount" }, { status: 400 });
    }

    const accounts = await getAccountsByUserId(supabase, user.id);
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const currentBalance = Number(acc.balance);
    const delta = txType === "credit" ? amount : -amount;
    const newBalance = Math.max(0, currentBalance + delta);

    await supabase
      .from("accounts")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", acc.id);

    const txRef = `ADM${Date.now().toString(16).toUpperCase()}`;
    await supabase.from("transactions").insert({
      account_id: acc.id,
      type: txType,
      amount: amount,
      currency: acc.currency,
      status: "completed",
      description: description || `Admin balance ${txType}`,
      tx_ref: txRef,
    });

    return NextResponse.json({ success: true, message: "Balance updated" });
  }

  if (action === "add_account") {
    const currency = (body.currency as string)?.toUpperCase();
    if (!currency || !CURRENCIES.some((c) => c.code === currency)) {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    const accounts = await getAccountsByUserId(supabase, user.id);
    if (accounts.some((a) => a.currency === currency)) {
      return NextResponse.json({ error: "Account already exists for this currency" }, { status: 400 });
    }

    const accountNumber = user.bank_number
      ? `${user.bank_number}-${currency}`
      : `${user.id.slice(0, 8)}-${currency}`;

    const { error } = await supabase.from("accounts").insert({
      user_id: user.id,
      currency,
      balance: 0,
      account_number: accountNumber,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, message: `${currency} account created` });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
