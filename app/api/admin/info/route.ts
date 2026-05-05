import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    server: "Next.js (Node.js)",
    nodeVersion: process.version,
    platform: process.platform,
    paths: {
      cwd: process.cwd(),
      execPath: process.execPath,
    },
    env: {
      nodeEnv: process.env.NODE_ENV || "development",
    },
    config: {
      db: "Supabase (PostgreSQL)",
    },
  });
}
