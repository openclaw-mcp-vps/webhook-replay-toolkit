import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions, getServerSession } from "next-auth";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/"
  },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        name: { label: "Name", type: "text" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const name = credentials?.name?.trim();

        if (!email) {
          return null;
        }

        const user = await db.user.upsert({
          where: { email },
          create: { email, name: name || email.split("@")[0] },
          update: { name: name || undefined }
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    }
  }
};

export function auth() {
  return getServerSession(authOptions);
}
