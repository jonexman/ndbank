import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: cards, error } = await supabase
    .from("cards")
    .select("id, user_id, card_type, vendor, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
  }

  const userIds = [...new Set((cards ?? []).map((c) => c.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("id, usercode, full_name")
    .in("id", userIds);
  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const formatted = (cards ?? []).map((c) => ({
    ...c,
    userid: c.user_id,
    usercode: userMap.get(c.user_id)?.usercode,
    date: c.created_at,
  }));

  return NextResponse.json({ cards: formatted });
}
