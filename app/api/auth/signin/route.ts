import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, getClientUserAgent } from "@/lib/utils/ip";
import {
  getRecentFailedLoginAttemptCount,
  insertUserActivityLog,
} from "@/lib/supabase/db";

const MAX_LOGIN_ATTEMPTS = 4;
const LOCKOUT_WINDOW_MINUTES = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { login, password } = body;
    if (!login || !password) {
      return NextResponse.json({ error: "Login and password required" }, { status: 400 });
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    let email = login;
    if (!login.includes("@") && /^\d+$/.test(login)) {
      const { data: emailFromBank } = await supabase.rpc("get_email_by_bank_number", {
        bank_num: login,
      });
      if (!emailFromBank) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }
      email = emailFromBank;
    }

    const identifier = String(email).trim().toLowerCase();

    if (admin) {
      const failedCount = await getRecentFailedLoginAttemptCount(
        admin,
        identifier,
        LOCKOUT_WINDOW_MINUTES
      );
      if (failedCount >= MAX_LOGIN_ATTEMPTS) {
        return NextResponse.json(
          {
            error: "Too many failed login attempts. Please try again in 30 minutes.",
          },
          { status: 429 }
        );
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    const ip = getClientIp(req);
    const userAgent = getClientUserAgent(req);

    if (error) {
      if (admin) {
        await insertUserActivityLog(admin, {
          event_type: "login_failed",
          attempted_identifier: identifier,
          ip_address: ip,
          user_agent: userAgent,
        });
      }
      return NextResponse.json(
        { error: error.message || "Invalid credentials" },
        { status: 401 }
      );
    }

    const userId = data.user?.id;
    let redirectTo: string | undefined;
    if (userId) {
      const { data: dbUser } = await supabase
        .from("users")
        .select("login_disabled, roles")
        .eq("id", userId)
        .single();
      const row = dbUser as { login_disabled?: boolean; roles?: string[] } | null;
      if (row?.login_disabled) {
        await supabase.auth.signOut();
        return NextResponse.json(
          { error: "Your account has been disabled. Please contact support." },
          { status: 403 }
        );
      }
      const roles = (row?.roles ?? []) as string[];
      if (roles.includes("super-admin") || roles.includes("administrator")) {
        redirectTo = "/admin";
      }
    }

    if (userId && admin) {
      await insertUserActivityLog(admin, {
        user_id: userId,
        event_type: "login",
        ip_address: ip,
        user_agent: userAgent,
      });
    }

    return NextResponse.json({
      userId: data.user?.id,
      email: data.user?.email,
      ...(redirectTo && { redirectTo }),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sign in failed" },
      { status: 500 }
    );
  }
}
