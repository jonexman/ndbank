import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, canAccessUser } from "@/lib/admin/auth";
import { getUserByUsercode } from "@/lib/supabase/db";
import {
  getUserTransferCodes,
  createUserTransferCode,
  updateUserTransferCode,
  deleteUserTransferCode,
} from "@/lib/supabase/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateAndHashCode } from "@/lib/auth/codes";

const VALID_TYPES = /^[a-z0-9_]+$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ usercode: string }> }
) {
  const { authorized, supabase, isSuperAdmin } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!canAccessUser(isSuperAdmin, user.roles as string[] | null)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const codes = await getUserTransferCodes(supabase, user.id);
  const list = codes.map((c) => ({
    id: c.id,
    code_type: c.code_type,
    sort_order: c.sort_order,
    current_code: c.current_plain_code ?? null,
  }));

  return NextResponse.json({ codes: list });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ usercode: string }> }
) {
  const { authorized, supabase, isSuperAdmin } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { usercode } = await params;
  const user = await getUserByUsercode(supabase, usercode);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!canAccessUser(isSuperAdmin, user.roles as string[] | null)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const action = body.action as "create" | "update" | "delete" | "reorder";

  if (action === "create") {
    const { code_type } = body;
    if (!code_type || typeof code_type !== "string") {
      return NextResponse.json({ error: "code_type required" }, { status: 400 });
    }
    const type = code_type.trim().toUpperCase().replace(/\s+/g, "_");
    if (!VALID_TYPES.test(type)) {
      return NextResponse.json({ error: "Invalid code type" }, { status: 400 });
    }

    const codes = await getUserTransferCodes(supabase, user.id);
    const maxOrder = codes.length > 0 ? Math.max(...codes.map((c) => c.sort_order)) : 0;

    const { plain, hash } = generateAndHashCode(6);
    const adminSupabase = createAdminClient();
    const client = adminSupabase ?? supabase;
    const { data, error } = await createUserTransferCode(client, {
      user_id: user.id,
      code_type: type,
      code_hash: hash,
      sort_order: maxOrder + 1,
      current_plain_code: plain,
    });

    if (error) {
      if (error.message?.includes("unique") || error.message?.includes("duplicate")) {
        return NextResponse.json({ error: "This code type already exists for this user" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      code: { id: data?.id, code_type: type, sort_order: data?.sort_order, current_code: plain },
    });
  }

  if (action === "update") {
    const { id, sort_order } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: { sort_order?: number } = {};
    if (sort_order !== undefined) {
      updates.sort_order = parseInt(String(sort_order), 10);
      if (isNaN(updates.sort_order)) return NextResponse.json({ error: "Invalid sort_order" }, { status: 400 });
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const { error } = await updateUserTransferCode(supabase, id, updates);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (action === "reorder") {
    const { order } = body;
    if (!Array.isArray(order)) return NextResponse.json({ error: "order array required" }, { status: 400 });
    const codes = await getUserTransferCodes(supabase, user.id);
    const ids = new Set(codes.map((c) => c.id));
    for (let i = 0; i < order.length; i++) {
      const id = order[i]?.id ?? order[i];
      if (id && ids.has(id)) {
        await updateUserTransferCode(supabase, id, { sort_order: i + 1 });
      }
    }
    return NextResponse.json({ success: true });
  }

  if (action === "delete") {
    const { id } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { error } = await deleteUserTransferCode(supabase, id, user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
