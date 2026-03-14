import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { authorized } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    email,
    password,
    firstname,
    lastname,
    balance = 0,
    currency = "USD",
    canTransfer = true,
  } = body;

  if (!email || !password || !firstname || !lastname) {
    return NextResponse.json(
      { error: "Email, password, first name and last name are required" },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const fullName = `${firstname} ${lastname}`.trim();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      firstname,
      lastname,
      preferred_currency: currency || "USD",
      account_type: "savings",
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "User creation failed" }, { status: 500 });
  }

  const { data: userRow } = await (admin.from("users") as any)
    .select("usercode, bank_number")
    .eq("id", userId)
    .single();
  const dbUser = userRow as { usercode?: string; bank_number?: string } | null;

  // Admin client has no DB schema types; update payload is valid at runtime
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from("users") as any)
    .update({
      can_transfer: !!canTransfer,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  const initialBalance = Math.max(0, parseFloat(String(balance)) || 0);
  if (initialBalance > 0) {
    await (admin.from("accounts") as any)
      .update({ balance: initialBalance })
      .eq("user_id", userId)
      .eq("currency", currency || "USD");
  }

  return NextResponse.json({
    success: true,
    userId,
    email: data.user?.email,
    usercode: dbUser?.usercode ?? "—",
    bankNumber: dbUser?.bank_number ?? "—",
  });
}
