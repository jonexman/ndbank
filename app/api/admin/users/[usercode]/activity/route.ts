import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, canAccessUser } from "@/lib/admin/auth";
import { getUserByUsercode } from "@/lib/supabase/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ usercode: string }> }
) {
  const { authorized, supabase, isSuperAdmin } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!canAccessUser(isSuperAdmin, user.roles as string[] | null)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data } = await supabase
    .from("user_activity_log")
    .select("id, event_type, ip_address, user_agent, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  return NextResponse.json({
    user: { usercode: user.usercode, full_name: user.full_name },
    activity: data ?? [],
  });
}
