import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userHasTracks } from "@/lib/tracks-server";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireVerifiedUser() {
  const user = await requireUser();
  const databaseUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, isPrimaryAdmin: true, emailVerifiedAt: true },
  });

  if (!databaseUser) redirect("/login");
  const isExempt = databaseUser.role === "ADMIN" && databaseUser.isPrimaryAdmin;
  if (!databaseUser.emailVerifiedAt && !isExempt) {
    redirect("/settings?verification=pending");
  }

  return { ...user, ...databaseUser };
}

export async function requireAdmin() {
  const user = await requireVerifiedUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function requirePrimaryAdmin() {
  const user = await requireUser();
  const databaseUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, role: true, isPrimaryAdmin: true },
  });

  if (!databaseUser?.isPrimaryAdmin || databaseUser.role !== "ADMIN") {
    redirect("/");
  }

  return databaseUser;
}

export async function requireTrackedUser(callbackUrl = "/") {
  const user = await requireVerifiedUser();
  if (user.role !== "ADMIN" && !(await userHasTracks(user.id))) {
    redirect(`/choose-track?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}
