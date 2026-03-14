import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getUserByUsercode, getUserProfile } from "@/lib/supabase/db";
import { getAccountsByUserId } from "@/lib/supabase/db";
import { CURRENCIES, GENDERS, RELIGIONS, RELATIONSHIPS, COUNTRIES } from "@/lib/admin/options";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ usercode: string }> }
) {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = await getUserProfile(supabase, user.id);
  const accounts = await getAccountsByUserId(supabase, user.id);
  const usdAccount = accounts.find((a) => a.currency === "USD");

  return NextResponse.json({
    user: {
      id: user.id,
      usercode: user.usercode,
      email: user.email,
      firstname: profile?.firstname ?? (user.full_name || "").split(" ")[0] ?? "",
      lastname: profile?.lastname ?? (user.full_name || "").split(" ").slice(1).join(" ") ?? "",
      bankNumber: user.bank_number,
      balance: usdAccount ? Number(usdAccount.balance) : 0,
      currency: usdAccount?.currency ?? "USD",
      roles: user.roles ?? ["member"],
      register_time: user.created_at ?? "",
      last_seen: "",
    },
    profile: profile ?? {},
    meta: {
      accountType: profile?.account_type ?? "savings",
      transferCodeOtp: profile?.transfer_code_otp ?? false,
      emailOtp: profile?.email_otp ?? false,
      kycDocument: profile?.kyc_document ?? null,
    },
    options: {
      currencies: CURRENCIES,
      countries: COUNTRIES,
      genders: GENDERS,
      religions: RELIGIONS,
      relationships: RELATIONSHIPS,
    },
  });
}

export async function POST(req: NextRequest, context: { params: Promise<{ usercode: string }> }) {
  const { authorized, supabase, isSuperAdmin } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await context.params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const body = await req.json();

  if (body.roles !== undefined && !isSuperAdmin) {
    return NextResponse.json({ error: "Only super-admin can change access control" }, { status: 403 });
  }

  const userUpdates: Record<string, unknown> = {};
  if (body.email !== undefined) userUpdates.email = body.email;
  if (body.full_name !== undefined) userUpdates.full_name = body.full_name;
  else if (body.firstname !== undefined || body.lastname !== undefined) {
    const profile = await getUserProfile(supabase, user.id);
    const fn = body.firstname ?? profile?.firstname ?? "";
    const ln = body.lastname ?? profile?.lastname ?? "";
    userUpdates.full_name = `${fn} ${ln}`.trim() || user.full_name;
  }
  if (body.canTransfer !== undefined) userUpdates.can_transfer = body.canTransfer;
  if (body.verified !== undefined) userUpdates.verified = body.verified;
  if (body.roles !== undefined && Array.isArray(body.roles)) userUpdates.roles = body.roles;
  userUpdates.updated_at = new Date().toISOString();

  if (Object.keys(userUpdates).length > 1) {
    await supabase.from("users").update(userUpdates).eq("id", user.id);
  }

  const profileUpdates: Record<string, unknown> = {};
  if (body.firstname !== undefined) profileUpdates.firstname = body.firstname;
  if (body.lastname !== undefined) profileUpdates.lastname = body.lastname;
  if (body.phone !== undefined) profileUpdates.phone = body.phone;
  if (body.birthdate !== undefined) profileUpdates.birthdate = body.birthdate;
  if (body.gender !== undefined) profileUpdates.gender = body.gender;
  if (body.address !== undefined) profileUpdates.address = body.address;
  if (body.city !== undefined) profileUpdates.city = body.city;
  if (body.state !== undefined) profileUpdates.state = body.state;
  if (body.country !== undefined) profileUpdates.country = body.country;
  if (body.zipcode !== undefined) profileUpdates.zipcode = body.zipcode;
  if (body.nok_name !== undefined) profileUpdates.nok_name = body.nok_name;
  if (body.nok_relationship !== undefined) profileUpdates.nok_relationship = body.nok_relationship;
  if (body.nok_address !== undefined) profileUpdates.nok_address = body.nok_address;
  if (body.accountType !== undefined) profileUpdates.account_type = body.accountType;
  if (body.transferCodeOtp !== undefined) profileUpdates.transfer_code_otp = body.transferCodeOtp;
  if (body.emailOtp !== undefined) profileUpdates.email_otp = body.emailOtp;
  profileUpdates.updated_at = new Date().toISOString();

  if (Object.keys(profileUpdates).length > 1) {
    await supabase
      .from("user_profiles")
      .update(profileUpdates)
      .eq("user_id", user.id);
  }

  if (body.balance !== undefined && body.currency) {
    const amt = parseFloat(String(body.balance));
    const accounts = await getAccountsByUserId(supabase, user.id);
    const acc = accounts.find((a) => a.currency === (body.currency || "USD"));
    if (acc) {
      await supabase
        .from("accounts")
        .update({ balance: amt, updated_at: new Date().toISOString() })
        .eq("id", acc.id);
    }
  }

  return NextResponse.json({ success: true, message: "User updated" });
}
