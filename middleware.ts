import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PAID_COOKIE, USER_COOKIE } from "@/lib/constants";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get(USER_COOKIE)?.value;
  const paid = request.cookies.get(PAID_COOKIE)?.value === "1";
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard") && !paid) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("upgrade", "1");
    const response = NextResponse.redirect(url);

    if (!userId) {
      response.cookies.set(USER_COOKIE, crypto.randomUUID(), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  }

  if (!userId) {
    const response = NextResponse.next();
    response.cookies.set(USER_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
