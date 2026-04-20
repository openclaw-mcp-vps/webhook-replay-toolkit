import { NextResponse } from "next/server";
import { setPaymentStatus } from "@/lib/db";
import {
  PAID_COOKIE_MAX_AGE,
  PAYWALL_COOKIE_NAME,
  createPaidCookieValue,
  verifyCheckoutStateToken
} from "@/lib/paywall";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const verified = verifyCheckoutStateToken(state);

  if (!verified.valid || !verified.userId) {
    return NextResponse.redirect(new URL("/?checkout=invalid", url.origin));
  }

  await setPaymentStatus({
    userId: verified.userId,
    status: "active"
  });

  const response = NextResponse.redirect(
    new URL("/dashboard?checkout=success", url.origin)
  );

  response.cookies.set({
    name: PAYWALL_COOKIE_NAME,
    value: createPaidCookieValue(verified.userId),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: PAID_COOKIE_MAX_AGE
  });

  return response;
}
