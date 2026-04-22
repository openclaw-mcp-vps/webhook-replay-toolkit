import { NextResponse } from "next/server";

import { ACCESS_COOKIE_NAME } from "@/lib/paywall";

export async function GET() {
  const response = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));

  response.cookies.set({
    name: ACCESS_COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return response;
}
