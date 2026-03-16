import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, canAccessUser } from "@/lib/admin/auth";
import { getUserByUsercode } from "@/lib/supabase/db";

const ALLOWED_ROLES = ["member", "administrator", "super-admin"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ usercode: string }> }
) {
  const body = await req.json();
  const { roles } = body;
  const wantsSuperAdmin = Array.isArray(roles) && roles.includes("super-admin");

  const { authorized, supabase, isSuperAdmin } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (wantsSuperAdmin && !isSuperAdmin) {
    return NextResponse.json({ error: "Only super-admin can assign super-admin role" }, { status: 403 });
  }

  const { usercode } = await params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!canAccessUser(isSuperAdmin, user.roles as string[] | null)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!Array.isArray(roles)) {
    return NextResponse.json({ error: "roles must be an array" }, { status: 400 });
  }

  const validRoles = roles.filter((r: string) => ALLOWED_ROLES.includes(r));
  if (validRoles.length === 0) {
    return NextResponse.json({ error: "At least one valid role required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("users")
    .update({ roles: validRoles, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update roles" }, { status: 500 });
  }

  return NextResponse.json({ success: true, roles: validRoles });
}
