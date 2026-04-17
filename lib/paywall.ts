import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "wrt_paid";
const COOKIE_TTL_SEC = 60 * 60 * 24 * 30;

type Payload = {
  userId: string;
  exp: number;
};

function getSecret(): string {
  return process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ?? "local-dev-secret";
}

function encode(payload: Payload): string {
  const raw = JSON.stringify(payload);
  const body = Buffer.from(raw).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

function decode(value: string): Payload | null {
  try {
    const [body, sig] = value.split(".");
    if (!body || !sig) {
      return null;
    }

    const expected = createHmac("sha256", getSecret()).update(body).digest("hex");
    if (sig.length !== expected.length) {
      return null;
    }
    const valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!valid) {
      return null;
    }

    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as Payload;
    if (Date.now() > parsed.exp) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function setPaidCookie(userId: string): Promise<void> {
  const payload: Payload = {
    userId,
    exp: Date.now() + COOKIE_TTL_SEC * 1000
  };

  const token = encode(payload);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_TTL_SEC,
    path: "/"
  });
}

export async function hasPaidAccess(userId: string): Promise<boolean> {
  const jar = await cookies();
  const value = jar.get(COOKIE_NAME)?.value;
  if (!value) {
    return false;
  }
  const decoded = decode(value);
  return decoded?.userId === userId;
}
