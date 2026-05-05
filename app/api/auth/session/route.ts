import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    const { data: dbUser } = await supabase
      .from("users")
      .select("login_disabled")
      .eq("id", user.id)
      .single();
    if ((dbUser as { login_disabled?: boolean } | null)?.login_disabled) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { user: null, loginDisabled: true, error: "Your account has been disabled. Please contact support." },
        { status: 403 }
      );
    }
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { user: null, error: err instanceof Error ? err.message : "Session error" },
      { status: 500 }
    );
  }
}
