import "server-only";
import { prisma } from "@/lib/db";
import { DEFAULT_CERTIFICATES } from "@/lib/certificates";

export async function ensureDefaultCertificates() {
  for (const certificate of DEFAULT_CERTIFICATES) {
    await prisma.certificate.upsert({
      where: { name: certificate.name },
      create: certificate,
      update: {},
    });
  }
}
