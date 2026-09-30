import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyMfaChallenge } from "@/lib/mfa";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        mfaChallenge: { label: "MFA challenge", type: "text" },
        mfaCode: { label: "MFA code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        const mfaChallenge = credentials?.mfaChallenge;
        const mfaCode = credentials?.mfaCode;
        if (typeof email !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          include: { mfaDevice: true },
        });
        if (!user) return null;

        if (typeof mfaChallenge === "string" && typeof mfaCode === "string") {
          const challengedUser = await verifyMfaChallenge(mfaChallenge, mfaCode);
          if (!challengedUser || challengedUser.id !== user.id) return null;
        } else {
          if (typeof password !== "string") return null;
          const valid = await bcrypt.compare(password, user.passwordHash);
          if (!valid || user.mfaDevice?.enabledAt) return null;
        }

        if (!user.emailVerifiedAt && !(user.role === "ADMIN" && user.isPrimaryAdmin)) {
          const token = await prisma.verificationToken.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: { expiresAt: true },
          });
          if (user.verificationAttempts >= 2 && (!token || token.expiresAt <= new Date())) {
            await prisma.user.delete({ where: { id: user.id } });
            return null;
          }
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
          isPrimaryAdmin: user.isPrimaryAdmin,
          sessionVersion: user.sessionVersion,
          mfaEnabled: Boolean(user.mfaDevice?.enabledAt),
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  // Do not set a persistent maxAge: the session cookie should disappear when
  // the browser closes, while an open browser session can remain active.
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.emailVerifiedAt = (user as { emailVerifiedAt: string | null }).emailVerifiedAt;
        token.isPrimaryAdmin = (user as { isPrimaryAdmin: boolean }).isPrimaryAdmin;
        token.sessionVersion = (user as { sessionVersion: number }).sessionVersion;
        token.mfaEnabled = (user as { mfaEnabled: boolean }).mfaEnabled;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.emailVerifiedAt = (token.emailVerifiedAt as string | null) ?? null;
        session.user.isPrimaryAdmin = token.isPrimaryAdmin as boolean;
        session.user.sessionVersion = token.sessionVersion as number;
        session.user.mfaEnabled = token.mfaEnabled as boolean;
      }
      return session;
    },
  },
});
