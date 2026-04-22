import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { findActiveAccessGrantByEmail } from "@/lib/db";
import { ACCESS_COOKIE_MAX_AGE_SECONDS, ACCESS_COOKIE_NAME, ACCESS_COOKIE_VALUE } from "@/lib/paywall";

const claimSchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    const body = claimSchema.parse(await request.json());
    const grant = await findActiveAccessGrantByEmail(body.email);

    if (!grant) {
      return NextResponse.json(
        {
          error:
            "No active subscription found for that email yet. Complete checkout first and ensure your Stripe webhook points to /api/lemonsqueezy/webhook."
        },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set({
      name: ACCESS_COOKIE_NAME,
      value: ACCESS_COOKIE_VALUE,
      path: "/",
      maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Invalid request body" }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not verify access"
      },
      { status: 500 }
    );
  }
}
