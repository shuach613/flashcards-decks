"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";

export type FormState = { error?: string } | undefined;

export async function createCertificate(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const existing = await prisma.certificate.findUnique({ where: { name } });
  if (existing) return { error: "A certificate with that name already exists." };

  const last = await prisma.certificate.findFirst({ orderBy: { order: "desc" } });
  await prisma.certificate.create({
    data: { name, order: (last?.order ?? -1) + 1 },
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/admin");
}
