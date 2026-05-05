/**
 * Admin auth helpers.
 * Verifies the current user has super-admin or administrator role.
 */
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return { authorized: false as const, user: null, supabase };
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, email, full_name, roles")
    .eq("id", authUser.id)
    .single();

  if (!dbUser) {
    return { authorized: false as const, user: null, supabase };
  }

  const roles = (dbUser.roles ?? []) as string[];
  const isAdmin = roles.includes("super-admin") || roles.includes("administrator");
  const isSuperAdmin = roles.includes("super-admin");

  return {
    authorized: isAdmin,
    isSuperAdmin,
    roles,
    user: isAdmin ? { id: dbUser.id, email: dbUser.email, full_name: dbUser.full_name } : null,
    supabase,
  };
}

export async function requireSuperAdmin() {
  const result = await requireAdmin();
  return {
    ...result,
    authorized: result.authorized && result.isSuperAdmin,
  };
}

/** Admins (non–super-admin) must not view or edit super-admin users. */
export function canAccessUser(adminIsSuperAdmin: boolean, targetUserRoles: string[] | null): boolean {
  const roles = targetUserRoles ?? [];
  if (roles.includes("super-admin")) return adminIsSuperAdmin;
  return true;
}
