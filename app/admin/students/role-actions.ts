"use server";

import { revalidatePath } from "next/cache";
import { requirePrimaryAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit-log";

export async function setUserAdmin(userId: string, makeAdmin: boolean) {
  const primaryAdmin = await requirePrimaryAdmin();
  if (primaryAdmin.id === userId) return;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, isPrimaryAdmin: true },
  });
  if (!target || target.isPrimaryAdmin) return;

  await prisma.user.updateMany({
    where: { id: userId, isPrimaryAdmin: false },
    data: { role: makeAdmin ? "ADMIN" : "USER", sessionVersion: { increment: 1 } },
  });

  await writeAuditLog(primaryAdmin, {
    action: makeAdmin ? "ADMIN_GRANTED" : "ADMIN_REVOKED",
    targetType: "USER",
    targetId: target.id,
    metadata: { email: target.email },
  });

  revalidatePath("/admin/students");
}

export async function deleteUser(userId: string) {
  const primaryAdmin = await requirePrimaryAdmin();
  if (primaryAdmin.id === userId) return;

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, isPrimaryAdmin: true },
  });
  if (!target || target.isPrimaryAdmin) return;

  await writeAuditLog(primaryAdmin, {
    action: "USER_DELETED",
    targetType: "USER",
    targetId: target.id,
    metadata: { email: target.email },
  });

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
    select: { id: true, email: true, role: true, isPrimaryAdmin: true },
  });

  if (!targetUser || targetUser.role !== "ADMIN" || targetUser.isPrimaryAdmin) {
    return;
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.user.update({
      where: { id: primaryAdmin.id },
      data: { isPrimaryAdmin: false, sessionVersion: { increment: 1 } },
    });
    await transaction.user.update({
      where: { id: targetUser.id },
      data: { isPrimaryAdmin: true, sessionVersion: { increment: 1 } },
    });
  });

  await writeAuditLog(primaryAdmin, {
    action: "PRIMARY_ADMIN_TRANSFERRED",
    targetType: "USER",
    targetId: targetUser.id,
    metadata: { previousPrimaryAdmin: primaryAdmin.email, newPrimaryAdmin: targetUser.email },
  });

  revalidatePath("/admin/students");
}
