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
