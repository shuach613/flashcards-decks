"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/authz";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";

export type FormState = { error?: string } | undefined;

export async function createCertificate(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();
  const locale = await getLocale();
  const name = String(formData.get("name") ?? "").trim();
  const trackIds = [
    ...new Set(formData.getAll("trackIds").map(String).filter(Boolean)),
  ];
  if (!name) return { error: t(locale, "cert.nameRequired") };

  const existing = await prisma.certificate.findUnique({ where: { name } });
  if (existing) return { error: t(locale, "cert.nameExists") };

  const validTrackCount = await prisma.track.count({
    where: { id: { in: trackIds } },
  });
  if (validTrackCount !== trackIds.length) {
    return { error: t(locale, "cert.invalidTracks") };
  }

  const last = await prisma.certificate.findFirst({ orderBy: { order: "desc" } });
  await prisma.certificate.create({
    data: {
      name,
      order: (last?.order ?? -1) + 1,
      ...(trackIds.length > 0
        ? { tracks: { create: trackIds.map((trackId) => ({ trackId })) } }
        : {}),
    },
  });

  revalidatePath("/admin/certificates");
  revalidatePath("/admin");
  revalidatePath("/admin/track-settings");
}
