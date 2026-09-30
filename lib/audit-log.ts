import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/app/generated/prisma/client";

export type AuditActor = { id?: string | null; email?: string | null };
type AuditLogClient = {
  auditLog: { create(args: Prisma.AuditLogCreateArgs): Promise<unknown> };
};

export async function writeAuditLog(
  actor: AuditActor,
  entry: {
    action: string;
    targetType: string;
    targetId?: string | null;
    metadata?: Record<string, unknown>;
  },
  client: AuditLogClient = prisma
) {
  await client.auditLog.create({
    data: {
      actorUserId: actor.id ?? null,
      actorEmail: actor.email ?? "unknown",
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId ?? null,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    },
  });
}
