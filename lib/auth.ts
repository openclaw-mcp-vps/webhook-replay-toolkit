import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { getPaymentStatus, getUserByEmail } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login"
  },
  providers: [
    CredentialsProvider({
      name: "Email + Password",
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await getUserByEmail(parsed.data.email);

        if (!user) {
          return null;
        }

        const validPassword = await bcrypt.compare(
          parsed.data.password,
          user.password_hash
        );

        if (!validPassword) {
          return null;
        }

        const paymentStatus = await getPaymentStatus(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          subdomain: user.subdomain,
          captureKey: user.capture_key,
          paid: paymentStatus === "active"
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.captureKey = user.captureKey;
        token.subdomain = user.subdomain;
        token.paid = user.paid;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.captureKey = token.captureKey;
        session.user.subdomain = token.subdomain;
        session.user.paid = Boolean(token.paid);
      }

      return session;
    }
  }
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
