import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export type ActivityRow = {
  id: string;
  user_id: string | null;
  event_type: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  attempted_identifier: string | null;
  users?: { usercode: string | null; email: string } | null;
};

export async function GET(req: NextRequest) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const eventType = searchParams.get("event_type")?.trim() || undefined;
  const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)), 500);
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));

  let query = supabase
    .from("user_activity_log")
    .select("id, user_id, event_type, ip_address, user_agent, created_at, attempted_identifier, users(usercode, email)", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (eventType && ["login", "logout", "login_failed"].includes(eventType)) {
    query = query.eq("event_type", eventType);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const raw = (data ?? []) as Array<{
    id: string;
    user_id: string | null;
    event_type: string;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    attempted_identifier: string | null;
    users?: { usercode: string | null; email: string } | Array<{ usercode: string | null; email: string }>;
  }>;
  const activity: ActivityRow[] = raw.map((row) => ({
    ...row,
    users: Array.isArray(row.users) ? row.users[0] ?? null : row.users ?? null,
  }));

  return NextResponse.json({
    activity,
    total: count ?? 0,
  });
}
