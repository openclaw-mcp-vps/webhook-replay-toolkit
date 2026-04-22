import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE_NAME, hasActiveAccessCookie } from "@/lib/paywall";

function unauthorizedResponse(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Paid access required." }, { status: 401 });
  }

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("paywall", "1");
  return NextResponse.redirect(redirectUrl);
}

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (!hasActiveAccessCookie(cookie)) {
    return unauthorizedResponse(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/webhooks", "/api/replay"]
};
