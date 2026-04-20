import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { createUser } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(80)
});

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
}

function createSubdomain(base: string): string {
  const suffix = randomBytes(2).toString("hex");
  return `${base}-${suffix}`;
}

function createCaptureKey(): string {
  return `whk_${randomBytes(18).toString("hex")}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const passwordHash = await bcrypt.hash(parsed.password, 12);
    const emailPrefix = parsed.email.split("@")[0] || "webhooks";
    const baseSubdomain = slugify(emailPrefix) || "webhooks";

    let lastError: unknown;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      try {
        await createUser({
          email: parsed.email,
          name: parsed.name,
          passwordHash,
          subdomain: createSubdomain(baseSubdomain),
          captureKey: createCaptureKey()
        });

        return NextResponse.json({ ok: true });
      } catch (error) {
        const maybeCode = (error as { code?: string })?.code;

        if (maybeCode !== "23505") {
          throw error;
        }

        lastError = error;
      }
    }

    throw lastError;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid registration fields", details: error.issues },
        { status: 400 }
      );
    }

    const maybeCode = (error as { code?: string })?.code;

    if (maybeCode === "23505") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
