"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";

function selectedCategoryIds(formData: FormData) {
  return [...new Set(formData.getAll("categoryIds").map(String).filter(Boolean))];
}

async function categoryIdsAreValid(categoryIds: string[]) {
  if (categoryIds.length === 0) return true;
  return (
    (await prisma.category.count({
      where: { id: { in: categoryIds } },
    })) === categoryIds.length
  );
}

export async function createTrack(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const categoryIds = selectedCategoryIds(formData);

  if (!name) redirect("/admin/track-settings?error=name");
  const [existing, validCategories, lastTrack] = await Promise.all([
    prisma.track.findUnique({ where: { name } }),
    categoryIdsAreValid(categoryIds),
    prisma.track.findFirst({ orderBy: { order: "desc" }, select: { order: true } }),
  ]);
  if (existing) redirect("/admin/track-settings?error=duplicate");
  if (!validCategories) redirect("/admin/track-settings?error=invalid");

  await prisma.$transaction(async (tx) => {
    const track = await tx.track.create({
      data: {
        key: `CUSTOM_${crypto.randomUUID()}`,
        name,
        order: (lastTrack?.order ?? -1) + 1,
      },
    });
    if (categoryIds.length > 0) {
      await tx.trackCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          trackId: track.id,
          categoryId,
        })),
      });
    }
  });

  redirect("/admin/track-settings?created=1");
}

export async function updateTrack(trackId: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const categoryIds = selectedCategoryIds(formData);
  const query = new URLSearchParams({ track: trackId });

  if (!name) {
    query.set("error", "name");
    redirect(`/admin/track-settings?${query}`);
  }

  const [track, conflict, validCategories] = await Promise.all([
    prisma.track.findUnique({ where: { id: trackId }, select: { id: true } }),
    prisma.track.findFirst({
      where: { name, NOT: { id: trackId } },
      select: { id: true },
    }),
    categoryIdsAreValid(categoryIds),
  ]);
  if (!track || !validCategories) {
    query.set("error", "invalid");
    redirect(`/admin/track-settings?${query}`);
  }
  if (conflict) {
    query.set("error", "duplicate");
    redirect(`/admin/track-settings?${query}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.track.update({ where: { id: trackId }, data: { name } });
    await tx.trackCategory.deleteMany({ where: { trackId } });
    if (categoryIds.length > 0) {
      await tx.trackCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          trackId,
          categoryId,
        })),
      });
    }
  });

  query.set("saved", "1");
  redirect(`/admin/track-settings?${query}`);
}
