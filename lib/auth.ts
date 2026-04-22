import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80).optional()
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? "dev-auth-secret",
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        return {
          id: parsed.data.email.toLowerCase(),
          email: parsed.data.email.toLowerCase(),
          name: parsed.data.name ?? parsed.data.email.split("@")[0]
        };
      }
    })
  ],
  pages: {
    signIn: "/"
  }
});
