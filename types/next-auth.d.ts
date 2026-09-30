import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    emailVerifiedAt: string | null;
    isPrimaryAdmin: boolean;
    sessionVersion: number;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      emailVerifiedAt: string | null;
      isPrimaryAdmin: boolean;
      sessionVersion: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    emailVerifiedAt: string | null;
    isPrimaryAdmin: boolean;
    sessionVersion: number;
  }
}
