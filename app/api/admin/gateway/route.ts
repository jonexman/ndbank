import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

const PAYMENT_METHODS = [
  { id: 1, medium: "crypto", network: "bitcoin", name: "Bitcoin", detail: "BTC" },
  { id: 2, medium: "bank", network: null, name: "Bank Transfer", detail: "Wire" },
];

export async function GET() {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ paymentMethods: PAYMENT_METHODS });
}
