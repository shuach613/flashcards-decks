"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";

function selectedCertificateIds(formData: FormData) {
  return [...new Set(formData.getAll("certificateIds").map(String).filter(Boolean))];
}

async function certificateIdsAreValid(certificateIds: string[]) {
  if (certificateIds.length === 0) return true;
  return (
    (await prisma.certificate.count({
      where: { id: { in: certificateIds } },
    })) === certificateIds.length
  );
}

export async function createTrack(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const certificateIds = selectedCertificateIds(formData);

  if (!name) redirect("/admin/track-settings?error=name");
  const [existing, validCertificates, lastTrack] = await Promise.all([
    prisma.track.findUnique({ where: { name } }),
    certificateIdsAreValid(certificateIds),
    prisma.track.findFirst({ orderBy: { order: "desc" }, select: { order: true } }),
  ]);
  if (existing) redirect("/admin/track-settings?error=duplicate");
  if (!validCertificates) redirect("/admin/track-settings?error=invalid");

  await prisma.$transaction(async (tx) => {
    const track = await tx.track.create({
      data: {
        key: `CUSTOM_${crypto.randomUUID()}`,
        name,
        order: (lastTrack?.order ?? -1) + 1,
      },
    });
    if (certificateIds.length > 0) {
      await tx.trackCertificate.createMany({
        data: certificateIds.map((certificateId) => ({
          trackId: track.id,
          certificateId,
        })),
      });
    }
  });

  redirect("/admin/track-settings?created=1");
}

export async function updateTrack(trackId: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const certificateIds = selectedCertificateIds(formData);
  const query = new URLSearchParams({ track: trackId });

  if (!name) {
    query.set("error", "name");
    redirect(`/admin/track-settings?${query}`);
  }

  const [track, conflict, validCertificates] = await Promise.all([
    prisma.track.findUnique({ where: { id: trackId }, select: { id: true } }),
    prisma.track.findFirst({
      where: { name, NOT: { id: trackId } },
      select: { id: true },
    }),
    certificateIdsAreValid(certificateIds),
  ]);
  if (!track || !validCertificates) {
    query.set("error", "invalid");
    redirect(`/admin/track-settings?${query}`);
  }
  if (conflict) {
    query.set("error", "duplicate");
    redirect(`/admin/track-settings?${query}`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.track.update({ where: { id: trackId }, data: { name } });
    await tx.trackCertificate.deleteMany({ where: { trackId } });
    if (certificateIds.length > 0) {
      await tx.trackCertificate.createMany({
        data: certificateIds.map((certificateId) => ({
          trackId,
          certificateId,
        })),
      });
    }
  });

  query.set("saved", "1");
  redirect(`/admin/track-settings?${query}`);
}
