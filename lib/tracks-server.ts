import "server-only";
import { prisma } from "@/lib/db";
import { ensureDefaultCertificates } from "@/lib/certificates-server";
import { DEFAULT_TRACKS } from "@/lib/tracks";

export async function ensureDefaultTracks() {
  await ensureDefaultCertificates();

  for (const definition of DEFAULT_TRACKS) {
    const track = await prisma.track.upsert({
      where: { key: definition.key },
      create: {
        key: definition.key,
        name: definition.name,
        order: definition.order,
      },
      update: {
        name: definition.name,
        order: definition.order,
      },
    });

    const certificates = await prisma.certificate.findMany({
      where: { name: { in: [...definition.certificateNames] } },
      select: { id: true },
    });

    for (const certificate of certificates) {
      await prisma.trackCertificate.upsert({
        where: {
          trackId_certificateId: {
            trackId: track.id,
            certificateId: certificate.id,
          },
        },
        create: { trackId: track.id, certificateId: certificate.id },
        update: {},
      });
    }
  }
}

export function deckAccessWhere(user: { id: string; role: string }) {
  if (user.role === "ADMIN") return {};

  return {
    certificate: {
      tracks: {
        some: {
          track: {
            users: { some: { userId: user.id } },
          },
        },
      },
    },
  };
}

export async function userHasTracks(userId: string) {
  return (await prisma.userTrack.count({ where: { userId } })) > 0;
}
