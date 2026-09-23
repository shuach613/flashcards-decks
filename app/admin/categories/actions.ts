"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";

export type FormState = { error?: string } | undefined;

export async function createCategory(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const locale = await getLocale();
  const name = String(formData.get("name") ?? "").trim();
  const trackIds = [
    ...new Set(formData.getAll("trackIds").map(String).filter(Boolean)),
  ];
  if (!name) return { error: t(locale, "category.nameRequired") };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { error: t(locale, "category.nameExists") };

  const validTrackCount = await prisma.track.count({
    where: { id: { in: trackIds } },
  });
  if (validTrackCount !== trackIds.length) {
    return { error: t(locale, "category.invalidTracks") };
  }

  const last = await prisma.category.findFirst({ orderBy: { order: "desc" } });
  await prisma.category.create({
    data: {
      name,
      order: (last?.order ?? -1) + 1,
      ...(trackIds.length > 0
        ? { tracks: { create: trackIds.map((trackId) => ({ trackId })) } }
        : {}),
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/admin/track-settings");
}
