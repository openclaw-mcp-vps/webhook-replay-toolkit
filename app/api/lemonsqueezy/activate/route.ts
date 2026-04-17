import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureDb, pool } from "@/lib/db";
import { PAID_COOKIE, USER_COOKIE } from "@/lib/constants";

export async function GET(req: Request) {
  const store = await cookies();
  const userId = store.get(USER_COOKIE)?.value;

  if (!userId) {
    return NextResponse.redirect(new URL("/?upgrade=1", req.url));
  }

  await ensureDb();

  const result = await pool.query<{ status: string }>(
    "SELECT status FROM subscriptions WHERE user_id = $1 LIMIT 1",
    [userId],
  );

  const status = result.rows[0]?.status;

  if (status === "active") {
    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set(PAID_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  }

  return NextResponse.redirect(new URL("/?payment=pending", req.url));
}
