import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: loans, error } = await supabase
    .from("loans")
    .select("id, user_id, amount, duration, loan_type, reason, loan_id, status, funded, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 });
  }

  const userIds = [...new Set((loans ?? []).map((l) => l.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, usercode, full_name")
    .in("id", userIds);
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const formatted = (loans ?? []).map((l) => ({
    ...l,
    userid: l.user_id,
    usercode: userMap.get(l.user_id)?.usercode,
    date: l.created_at,
  }));

  return NextResponse.json({ loans: formatted });
}
