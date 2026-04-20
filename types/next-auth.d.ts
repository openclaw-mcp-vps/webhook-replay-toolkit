import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      captureKey: string;
      subdomain: string;
      paid: boolean;
    };
  }

  interface User {
    id: string;
    captureKey: string;
    subdomain: string;
    paid: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    captureKey: string;
    subdomain: string;
    paid: boolean;
  }
}
