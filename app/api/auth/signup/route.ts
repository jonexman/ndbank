import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashPin } from "@/lib/auth/pin";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    email,
    password,
    pin,
    firstname,
    lastname,
    phone,
    birthdate,
    gender,
    religion,
    address,
    state,
    city,
    country,
    zipcode,
    nok_firstname,
    nok_lastname,
    nok_relationship,
    nok_address,
    preferred_currency = "USD",
    account_type = "savings",
    agreed_to_terms = false,
  } = body;

  if (!email || !password || !firstname || !lastname) {
    return NextResponse.json(
      { error: "Email, password, first name and last name are required" },
      { status: 400 }
    );
  }

  if (!pin || typeof pin !== "string" || pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin)) {
    return NextResponse.json(
      { error: "PIN must be 4–6 digits" },
      { status: 400 }
    );
  }

  if (!agreed_to_terms) {
    return NextResponse.json(
      { error: "You must agree to the Terms of Service & Privacy Policy" },
      { status: 400 }
    );
  }

  const pin_hash = hashPin(pin);
  const fullName = `${firstname} ${lastname}`.trim();

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      firstname,
      lastname,
      phone: phone || null,
      birthdate: birthdate || null,
      gender: gender || null,
      religion: religion || null,
      address: address || null,
      state: state || null,
      city: city || null,
      country: country || null,
      zipcode: zipcode || null,
      nok_firstname: nok_firstname || null,
      nok_lastname: nok_lastname || null,
      nok_relationship: nok_relationship || null,
      nok_address: nok_address || null,
      preferred_currency,
      account_type,
      agreed_to_terms,
      pin_hash,
    },
  });

  if (error) {
    if (error.message.includes("already") || error.message.toLowerCase().includes("registered")) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  const bankNumber = data.user?.user_metadata?.bank_number ?? "pending";

  return NextResponse.json({
    userId,
    email: data.user?.email,
    bankNumber,
  });
}
