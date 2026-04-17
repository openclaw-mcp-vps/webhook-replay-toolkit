import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const subdomainMatch = host.match(/^([a-z0-9_-]+)\.hooks\./i);

  if (subdomainMatch && request.method === "POST" && request.nextUrl.pathname === "/") {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/api/webhooks/capture/${subdomainMatch[1]}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const isPaid = request.cookies.get("wrt_paid")?.value === "1";
    if (!isPaid) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      redirectUrl.searchParams.set("paywall", "1");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
