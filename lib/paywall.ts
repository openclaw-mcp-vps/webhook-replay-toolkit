import { createHmac, timingSafeEqual } from "node:crypto";

export const PAYWALL_COOKIE_NAME = "wrt_paid";

const PAID_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 45;
const CHECKOUT_STATE_TTL_SECONDS = 60 * 30;

function getSecret(): string {
  return (
    process.env.PAYWALL_COOKIE_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "local-dev-insecure-secret"
  );
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createPaidCookieValue(userId: string): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${userId}.${issuedAt}`;
  const signature = sign(`paid:${payload}`);
  return Buffer.from(`${payload}.${signature}`, "utf8").toString("base64url");
}

export function verifyPaidCookieValue(
  value: string | undefined,
  userId: string
): boolean {
  if (!value) {
    return false;
  }

  let decoded: string;

  try {
    decoded = Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const [cookieUserId, issuedAtRaw, signature] = decoded.split(".");

  if (!cookieUserId || !issuedAtRaw || !signature) {
    return false;
  }

  if (cookieUserId !== userId) {
    return false;
  }

  const issuedAt = Number(issuedAtRaw);

  if (!Number.isFinite(issuedAt)) {
    return false;
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - issuedAt;

  if (ageSeconds < 0 || ageSeconds > PAID_COOKIE_TTL_SECONDS) {
    return false;
  }

  const expected = sign(`paid:${cookieUserId}.${issuedAtRaw}`);

  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function createCheckoutStateToken(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + CHECKOUT_STATE_TTL_SECONDS;
  const payload = `${userId}.${expiresAt}`;
  const signature = sign(`checkout:${payload}`);
  return Buffer.from(`${payload}.${signature}`, "utf8").toString("base64url");
}

export function verifyCheckoutStateToken(value: string | null): {
  valid: boolean;
  userId?: string;
} {
  if (!value) {
    return { valid: false };
  }

  let decoded: string;

  try {
    decoded = Buffer.from(value, "base64url").toString("utf8");
  } catch {
    return { valid: false };
  }

  const [userId, expiresAtRaw, signature] = decoded.split(".");

  if (!userId || !expiresAtRaw || !signature) {
    return { valid: false };
  }

  const expiresAt = Number(expiresAtRaw);

  if (!Number.isFinite(expiresAt)) {
    return { valid: false };
  }

  if (Math.floor(Date.now() / 1000) > expiresAt) {
    return { valid: false };
  }

  const expected = sign(`checkout:${userId}.${expiresAtRaw}`);

  try {
    const isValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );

    if (!isValid) {
      return { valid: false };
    }
  } catch {
    return { valid: false };
  }

  return { valid: true, userId };
}

export const PAID_COOKIE_MAX_AGE = PAID_COOKIE_TTL_SECONDS;
