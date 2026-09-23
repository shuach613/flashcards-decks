import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { userHasTracks } from "@/lib/tracks-server";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const databaseUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (databaseUser?.role !== "ADMIN") redirect("/");
  return { ...user, role: databaseUser.role };
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
  const user = await requireUser();
  const databaseUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (databaseUser?.role !== "ADMIN" && !(await userHasTracks(user.id))) {
    redirect(`/choose-track?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return { ...user, role: databaseUser?.role ?? "USER" };
}
