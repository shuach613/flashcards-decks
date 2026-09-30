import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function findUserWithValidPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { mfaDevice: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
  return user;
}
