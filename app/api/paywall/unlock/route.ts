import { NextResponse } from "next/server";
import { getAppSession } from "@/lib/auth";
import { setPaidCookie } from "@/lib/paywall";

export async function GET() {
  const session = await getAppSession();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  await setPaidCookie(session.user.id);
  return NextResponse.redirect(
    new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  );
}
