/**
 * Supabase client for Next.js middleware.
 * Refreshes the session for every request.
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const isSignInOrSignUp =
    request.nextUrl.pathname === "/dashboard/signin" ||
    request.nextUrl.pathname === "/dashboard/signup";

  if (isDashboard && !isSignInOrSignUp && !user) {
    const signInUrl = new URL("/dashboard/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  if (isAdmin && !user) {
    const signInUrl = new URL("/dashboard/signin", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return supabaseResponse;
}
