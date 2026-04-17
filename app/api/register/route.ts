import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

function buildSubdomain(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${slug || "dev"}-${suffix}`;
}

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration payload." }, { status: 400 });
  }

  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 10);
  await createUser({
    email: parsed.data.email,
    name: parsed.data.name,
    passwordHash,
    captureSubdomain: buildSubdomain(parsed.data.name)
  });

  return NextResponse.json({ ok: true });
}
