import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin/auth";

const DEFAULT_OPTIONS: Record<string, string> = {
  site_title: "Alpha Bank",
  site_tagline: "",
  site_description: "E-Banking",
  admin_email: "",
  smtp_host: "",
  smtp_port: "",
  smtp_user: "",
  smtp_pass: "",
  user_affiliation: "0",
  user_require_email_confirmation: "0",
  user_lock_email: "0",
  user_reconfirm_email: "0",
  user_default_role: "member",
  user_auto_trash_unverified_after_day: "7",
  user_disable_signup: "0",
  local_transfer_charge_pct: "0",
  international_transfer_charge_pct: "0",
};

const ALLOWED_KEYS = new Set(Object.keys(DEFAULT_OPTIONS));

function mergeOptions(dbRows: { key: string; value: string }[]): Record<string, string> {
  const out = { ...DEFAULT_OPTIONS };
  for (const row of dbRows) {
    if (ALLOWED_KEYS.has(row.key)) {
      out[row.key] = row.value ?? "";
    }
  }
  return out;
}

export async function GET() {
  const { authorized, supabase } = await requireSuperAdmin();
  if (!authorized || !supabase) {
    return NextResponse.json({ error: "Super-admin only" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("site_options")
    .select("key, value");

  if (error) {
    return NextResponse.json(
      { error: "Failed to load settings", details: error.message },
      { status: 500 }
    );
  }

  const options = mergeOptions((data ?? []).map((r) => ({ key: r.key, value: r.value ?? "" })));
  return NextResponse.json({ options });
}

export async function PATCH(request: Request) {
  const { authorized, supabase } = await requireSuperAdmin();
  if (!authorized || !supabase) {
    return NextResponse.json({ error: "Super-admin only" }, { status: 403 });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const options = (body.options ?? body) as unknown as Record<string, unknown>;
  if (!options || typeof options !== "object") {
    return NextResponse.json({ error: "Missing options object" }, { status: 400 });
  }

  const toUpsert: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(options)) {
    if (!ALLOWED_KEYS.has(key)) continue;
    const str = value == null ? "" : String(value);
    toUpsert.push({ key, value: str });
  }

  if (toUpsert.length === 0) {
    return NextResponse.json({ options: mergeOptions([]) });
  }

  for (const row of toUpsert) {
    const { error: upsertError } = await supabase
      .from("site_options")
      .upsert({ key: row.key, value: row.value }, { onConflict: "key" });
    if (upsertError) {
      return NextResponse.json(
        { error: "Failed to save settings", details: upsertError.message },
        { status: 500 }
      );
    }
  }

  const { data: updated } = await supabase.from("site_options").select("key, value");
  const optionsOut = mergeOptions((updated ?? []).map((r) => ({ key: r.key, value: r.value ?? "" })));
  return NextResponse.json({ options: optionsOut });
}
