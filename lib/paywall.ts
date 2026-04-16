import crypto from "crypto";
import { cookies } from "next/headers";

const PAID_COOKIE = "wrt_paid";

function signValue(value: string) {
  const secret = process.env.NEXTAUTH_SECRET || "dev-secret";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function createPaidCookieValue(userId: string) {
  const payload = `${userId}:${Date.now()}`;
  return `${payload}.${signValue(payload)}`;
}

export async function hasPaidAccess(userId?: string) {
  if (!userId) {
    return false;
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(PAID_COOKIE)?.value;
  if (!raw) {
    return false;
  }

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) {
    return false;
  }

  if (signValue(payload) !== signature) {
    return false;
  }

  const [cookieUserId] = payload.split(":");
  return cookieUserId === userId;
}

export const paidCookieName = PAID_COOKIE;
