import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cheques, error } = await supabase
    .from("cheques")
    .select("id, user_id, cheque_number, amount, currency, payee, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch cheques" }, { status: 500 });
  }

  const userIds = [...new Set((cheques ?? []).map((c) => c.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, usercode")
    .in("id", userIds);
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const formatted = (cheques ?? []).map((c) => ({
    ...c,
    userid: c.user_id,
    usercode: userMap.get(c.user_id)?.usercode,
    date: c.created_at,
  }));

  return NextResponse.json({ cheques: formatted });
}
