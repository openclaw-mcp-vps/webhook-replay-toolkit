import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createPaidCookieValue, paidCookieName } from "@/lib/paywall";

const checkoutSchema = z.object({
  action: z.enum(["create", "unlock"])
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = checkoutSchema.parse(await request.json());

  if (body.action === "create") {
    const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;
    const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;

    if (!storeId || !productId) {
      return NextResponse.json({ error: "Missing Lemon Squeezy configuration" }, { status: 500 });
    }

    const checkoutUrl = `https://checkout.lemonsqueezy.com/buy/${productId}?checkout[custom][user_id]=${session.user.id}`;

    return NextResponse.json({ checkoutUrl });
  }

  const cookieStore = await cookies();
  cookieStore.set(paidCookieName, createPaidCookieValue(session.user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return NextResponse.json({ status: "unlocked" });
}
