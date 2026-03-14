import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET() {
  const { authorized, supabase } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: users, error } = await supabase
    .from("users")
    .select("id, email, full_name, bank_number, usercode, can_transfer, verified, roles, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }

  const { data: accounts } = await supabase.from("accounts").select("user_id, balance, currency");
  const accountMap = new Map<string, { balance: number; currency: string }>();
  for (const a of accounts ?? []) {
    const key = a.user_id;
    if (a.currency === "USD" && !accountMap.has(key)) {
      accountMap.set(key, { balance: Number(a.balance), currency: a.currency });
    }
  }

  const formatted = (users ?? []).map((u) => ({
    id: u.id,
    usercode: u.usercode,
    email: u.email,
    firstname: (u.full_name || "").split(" ")[0] ?? "",
    lastname: (u.full_name || "").split(" ").slice(1).join(" ") ?? "",
    bankNumber: u.bank_number,
    balance: accountMap.get(u.id)?.balance ?? 0,
    currency: accountMap.get(u.id)?.currency ?? "USD",
    canTransfer: u.can_transfer,
    verified: u.verified,
    roles: u.roles ?? ["member"],
  }));

  return NextResponse.json({ users: formatted });
}
