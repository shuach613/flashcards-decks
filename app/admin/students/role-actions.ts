"use server";

import { revalidatePath } from "next/cache";
import { requirePrimaryAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";

export async function setUserAdmin(userId: string, makeAdmin: boolean) {
  const primaryAdmin = await requirePrimaryAdmin();
  if (primaryAdmin.id === userId) return;

  await prisma.user.updateMany({
    where: { id: userId, isPrimaryAdmin: false },
    data: { role: makeAdmin ? "ADMIN" : "USER" },
  });

  revalidatePath("/admin/students");
}

export async function deleteUser(userId: string) {
  const primaryAdmin = await requirePrimaryAdmin();
  if (primaryAdmin.id === userId) return;

  await prisma.user.deleteMany({
    where: { id: userId, isPrimaryAdmin: false },
  });

  revalidatePath("/admin/students");
}

export async function transferPrimaryAdmin(targetUserId: string) {
  const primaryAdmin = await requirePrimaryAdmin();
  if (primaryAdmin.id === targetUserId) return;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, isPrimaryAdmin: true },
  });

  if (!targetUser || targetUser.role !== "ADMIN" || targetUser.isPrimaryAdmin) {
    return;
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: primaryAdmin.id },
      data: { isPrimaryAdmin: false },
    });
    await transaction.user.update({
      where: { id: targetUser.id },
      data: { isPrimaryAdmin: true },
    });
  });

  revalidatePath("/admin/students");
}
