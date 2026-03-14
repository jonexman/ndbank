import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: exchanges, error } = await supabase
    .from("exchanges")
    .select("id, user_id, paid_amount, paid_currency, expected_amount, expected_currency, status, funded, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch exchanges" }, { status: 500 });
  }

  const userIds = [...new Set((exchanges ?? []).map((e) => e.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, usercode")
    .in("id", userIds);
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const formatted = (exchanges ?? []).map((e) => ({
    ...e,
    userid: e.user_id,
    usercode: userMap.get(e.user_id)?.usercode,
    date: e.created_at,
  }));

  return NextResponse.json({ exchanges: formatted });
}
