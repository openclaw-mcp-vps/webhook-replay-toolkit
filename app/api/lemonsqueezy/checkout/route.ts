import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLemonCheckoutUrl } from "@/lib/lemonsqueezy";
import { USER_COOKIE } from "@/lib/constants";

export async function GET(req: Request) {
  const store = await cookies();
  const userId = store.get(USER_COOKIE)?.value ?? randomUUID();

  const checkoutUrl = getLemonCheckoutUrl(userId);
  if (!checkoutUrl) {
    return NextResponse.redirect(new URL("/?checkout=unavailable", req.url));
  }

  const response = NextResponse.redirect(checkoutUrl);
  response.cookies.set(USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return response;
}
