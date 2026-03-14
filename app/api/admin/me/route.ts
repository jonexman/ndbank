import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, isSuperAdmin, user } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    isSuperAdmin: !!isSuperAdmin,
    email: user?.email ?? null,
    fullName: user?.full_name ?? null,
  });
}
