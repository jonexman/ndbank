/**
 * Legacy transfer endpoint - use /api/transfer/initiate and /api/transfer/complete instead.
 * Transfers now require: verified account, transfer enabled, PIN, and OTP (based on user settings).
 */
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      status: "error",
      message: "Please use the transfer form. Transfers now require PIN and verification.",
    },
    { status: 410 }
  );
}
