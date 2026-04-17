import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { PAID_COOKIE, USER_COOKIE } from "@/lib/constants";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/" },
  providers: [
    CredentialsProvider({
      name: "Access Code",
      credentials: {
        code: { label: "Access Code", type: "password" },
      },
      async authorize(credentials) {
        const expected = process.env.DEMO_ACCESS_CODE;
        if (!expected || credentials?.code !== expected) {
          return null;
        }

        return { id: "demo-user", name: "Demo User" };
      },
    }),
  ],
};

export async function getOrCreateUserId() {
  const store = await cookies();
  const existing = store.get(USER_COOKIE)?.value;

  if (existing) {
    return existing;
  }

  const generated = randomUUID();
  store.set(USER_COOKIE, generated, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });

  return generated;
}

export async function hasPaidAccess() {
  const store = await cookies();
  return store.get(PAID_COOKIE)?.value === "1";
}

export async function requirePaidAccess() {
  const paid = await hasPaidAccess();
  if (!paid) {
    redirect("/?upgrade=1");
  }
}
