import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

const PAYMENT_METHODS = [
  { id: 1, medium: "crypto", network: "bitcoin", name: "Bitcoin", detail: "BTC" },
  { id: 2, medium: "bank", network: null, name: "Bank Transfer", detail: "Wire" },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const method = PAYMENT_METHODS.find((m) => String(m.id) === id);
  if (!method) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(method);
}
