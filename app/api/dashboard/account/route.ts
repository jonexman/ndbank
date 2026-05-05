import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getUserById,
  getAccountByUserId,
  getUserProfile,
} from "@/lib/supabase/db";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = authUser.id;
  const dbUser = await getUserById(supabase, userId);
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const account = await getAccountByUserId(supabase, userId, "USD");
  const profile = await getUserProfile(supabase, userId);

  const profileFormatted = profile
    ? {
        userid: userId,
        firstname: profile.firstname,
        lastname: profile.lastname,
        bio: profile.bio,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        phone: profile.phone,
        nok_name: profile.nok_name,
        nok_phone: profile.nok_phone,
        nok_relationship: profile.nok_relationship,
        nok_address: profile.nok_address,
        verified: dbUser.verified,
      }
    : {
        userid: userId,
        bio: "",
        address: "",
        city: "",
        state: "",
        country: "",
        phone: "",
        nok_name: "",
        nok_phone: "",
        nok_relationship: "",
        nok_address: "",
        verified: dbUser.verified,
      };

  return NextResponse.json({
    user: {
      id: dbUser.id,
      usercode: dbUser.usercode,
      email: dbUser.email,
      firstname: profile?.firstname ?? (dbUser.full_name || "").split(" ")[0],
      lastname: profile?.lastname ?? (dbUser.full_name || "").split(" ").slice(1).join(" "),
      bank_number: dbUser.bank_number,
      balance: account ? Number(account.balance) : 0,
      currency: account?.currency ?? "USD",
      verified: dbUser.verified,
      canTransfer: dbUser.can_transfer,
    },
    profile: profileFormatted,
  });
}
