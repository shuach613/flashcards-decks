import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    emailVerifiedAt: string | null;
    isPrimaryAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      emailVerifiedAt: string | null;
      isPrimaryAdmin: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    emailVerifiedAt: string | null;
    isPrimaryAdmin: boolean;
  }
}
