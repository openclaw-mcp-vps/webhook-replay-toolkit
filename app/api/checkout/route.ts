import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLemonCheckoutUrl, verifyCheckoutToken } from "@/lib/lemonsqueezy";

const checkoutSchema = z.object({
  userId: z.string().min(8),
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    const origin = request.nextUrl.origin;
    const checkoutUrl = await createLemonCheckoutUrl(parsed.data.userId, parsed.data.email, origin);

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Checkout creation failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const success = request.nextUrl.searchParams.get("success");
  const userId = request.nextUrl.searchParams.get("user");
  const sig = request.nextUrl.searchParams.get("sig");

  if (success !== "1" || !userId || !sig || !verifyCheckoutToken(userId, sig)) {
    return NextResponse.redirect(new URL("/?checkout=failed", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("wrt_paid", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
