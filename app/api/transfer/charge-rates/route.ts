import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Returns transfer charge percentages for local and international transfers.
 * Used by the dashboard to show fee before initiating. Authenticated users only.
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { local_transfer_charge_pct: 0, international_transfer_charge_pct: 0 },
      { status: 200 }
    );
  }

  const { data: rows } = await admin
    .from("site_options")
    .select("key, value")
    .in("key", ["local_transfer_charge_pct", "international_transfer_charge_pct"]);

  type SiteOptionRow = { key: string; value: string | null };
  const opts: Record<string, string> = {};
  for (const r of (rows ?? []) as SiteOptionRow[]) {
    opts[r.key] = r.value ?? "0";
  }
  const local = parseFloat(opts.local_transfer_charge_pct ?? "0") || 0;
  const international = parseFloat(opts.international_transfer_charge_pct ?? "0") || 0;

  return NextResponse.json({
    local_transfer_charge_pct: local,
    international_transfer_charge_pct: international,
  });
}
