import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type CardApplyBody = {
  cardType: string;
  cardVendor: "visa" | "mastercard";
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as CardApplyBody;

  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 3);
  const expiry = `${(expiryDate.getMonth() + 1).toString().padStart(2, "0")}/${String(
    expiryDate.getFullYear()
  ).slice(-2)}`;

  const { data: card, error } = await supabase
    .from("cards")
    .insert({
      user_id: authUser.id,
      card_type: body.cardType,
      vendor: body.cardVendor,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Card application failed" }, { status: 500 });
  }

  return NextResponse.json(
    {
      status: "success",
      message: "Your application was successful.",
      card: {
        id: card.id,
        card_type: card.card_type,
        vendor: card.vendor,
        status: card.status,
        card_number: `****${Math.floor(1000 + Math.random() * 9000)}`,
        expiry,
      },
    },
    { status: 201 }
  );
}
