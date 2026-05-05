import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

const userRowFields = "id, usercode, email, full_name, bank_number, verified";

type KycUser = {
  id: string;
  usercode: string | null;
  email: string;
  full_name: string;
  bank_number: string | null;
  verified: boolean;
  kyc_submitted_at: string | null;
  kyc_rejection_reason: string | null;
};

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pending: KycUser[] = [];
  const rejected: KycUser[] = [];
  const notSubmitted: KycUser[] = [];

  const { data: profiles, error } = await supabase
    .from("user_profiles")
    .select("user_id, kyc_status, kyc_submitted_at, kyc_rejection_reason");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const userIds = [...new Set((profiles ?? []).map((p) => p.user_id))];
  if (userIds.length === 0) {
    const { data: allUsers } = await supabase.from("users").select(userRowFields);
    const users = allUsers ?? [];
    for (const u of users) {
      notSubmitted.push({
        id: u.id,
        usercode: u.usercode,
        email: u.email,
        full_name: u.full_name,
        bank_number: u.bank_number,
        verified: u.verified,
        kyc_submitted_at: null,
        kyc_rejection_reason: null,
      });
    }
    return NextResponse.json({ pending: [], rejected, notSubmitted });
  }

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select(userRowFields)
    .in("id", userIds);

  if (usersError || !users) {
    return NextResponse.json({ pending: [], rejected, notSubmitted: [] });
  }

  const userMap = new Map(users.map((u) => [u.id, u]));

  for (const p of profiles ?? []) {
    const u = userMap.get(p.user_id);
    if (!u) continue;
    const row: KycUser = {
      id: u.id,
      usercode: u.usercode,
      email: u.email,
      full_name: u.full_name,
      bank_number: u.bank_number,
      verified: u.verified,
      kyc_submitted_at: p.kyc_submitted_at,
      kyc_rejection_reason: p.kyc_rejection_reason,
    };
    const status = p.kyc_status ?? "none";
    if (status === "pending") pending.push(row);
    else if (status === "rejected") rejected.push(row);
    else if (status === "none" || status === null || status === "") notSubmitted.push(row);
  }

  const includedUserIds = new Set([...pending, ...rejected, ...notSubmitted].map((u) => u.id));
  const { data: allUsers } = await supabase.from("users").select(userRowFields);
  for (const u of allUsers ?? []) {
    if (!includedUserIds.has(u.id)) {
      notSubmitted.push({
        id: u.id,
        usercode: u.usercode,
        email: u.email,
        full_name: u.full_name,
        bank_number: u.bank_number,
        verified: u.verified,
        kyc_submitted_at: null,
        kyc_rejection_reason: null,
      });
    }
  }

  return NextResponse.json({
    pending: pending.sort(
      (a, b) => new Date(b.kyc_submitted_at ?? 0).getTime() - new Date(a.kyc_submitted_at ?? 0).getTime()
    ),
    rejected,
    notSubmitted: notSubmitted.sort((a, b) => (a.full_name ?? "").localeCompare(b.full_name ?? "")),
  });
}
