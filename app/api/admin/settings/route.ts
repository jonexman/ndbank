import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

const SITE_OPTIONS: Record<string, string> = {
  site_title: "Alpha Bank",
  site_description: "E-Banking",
};

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ options: SITE_OPTIONS });
}
