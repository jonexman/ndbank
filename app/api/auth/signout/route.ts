import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp, getClientUserAgent } from "@/lib/utils/ip";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  await supabase.auth.signOut();

  if (userId) {
    const admin = createAdminClient();
    if (admin) {
      const ip = getClientIp(req);
      const userAgent = getClientUserAgent(req);
      await (admin.from("user_activity_log") as any).insert({
        user_id: userId,
        event_type: "logout",
        ip_address: ip,
        user_agent: userAgent,
      });
    }
  }

  return NextResponse.json({ success: true });
}
