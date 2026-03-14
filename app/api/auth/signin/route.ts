import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, getClientUserAgent } from "@/lib/utils/ip";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, password } = body;
    if (!login || !password) {
      return NextResponse.json({ error: "Login and password required" }, { status: 400 });
    }

    const supabase = await createClient();

    let email = login;
  // If login looks like account number (digits only), look up email via RPC
  if (!login.includes("@") && /^\d+$/.test(login)) {
    const { data: emailFromBank } = await supabase.rpc("get_email_by_bank_number", {
      bank_num: login,
    });
    if (!emailFromBank) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    email = emailFromBank;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message || "Invalid credentials" },
      { status: 401 }
    );
  }

  const userId = data.user?.id;
  if (userId) {
    const admin = createAdminClient();
    if (admin) {
      const ip = getClientIp(req);
      const userAgent = getClientUserAgent(req);
      await (admin.from("user_activity_log") as any).insert({
        user_id: userId,
        event_type: "login",
        ip_address: ip,
        user_agent: userAgent,
      });
    }
  }

  return NextResponse.json({
      userId: data.user?.id,
      email: data.user?.email,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sign in failed" },
      { status: 500 }
    );
  }
}
