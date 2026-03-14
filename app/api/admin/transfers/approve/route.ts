import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

type Body = { tx_ref: string };

export async function POST(req: NextRequest) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Body;
  if (!body.tx_ref) {
    return NextResponse.json({ success: false, error: "tx_ref required" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("admin_approve_transfer", {
    p_tx_ref: body.tx_ref,
  });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const result = data as { success?: boolean; error?: string; tx_ref?: string };
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Approval failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, tx_ref: result.tx_ref });
}
