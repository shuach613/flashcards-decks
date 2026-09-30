"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit-log";

export async function updateStudentTracks(
  userId: string,
  email: string,
  formData: FormData
) {
  const admin = await requireAdmin();
  const requestedTrackIds = formData
    .getAll("trackIds")
    .map(String)
    .filter(Boolean);
  const query = new URLSearchParams({ email });

  if (requestedTrackIds.length === 0) {
    query.set("error", "required");
    redirect(`/admin/tracks?${query}`);
  }

  const [student, validTrackCount] = await Promise.all([
    prisma.user.findFirst({
      where: { id: userId, role: "USER" },
      select: { id: true },
    }),
    prisma.track.count({ where: { id: { in: requestedTrackIds } } }),
  ]);

  if (!student || validTrackCount !== new Set(requestedTrackIds).size) {
    query.set("error", "invalid");
    redirect(`/admin/tracks?${query}`);
  }

  await prisma.$transaction([
    prisma.userTrack.deleteMany({ where: { userId } }),
    prisma.userTrack.createMany({
      data: [...new Set(requestedTrackIds)].map((trackId) => ({
        userId,
        trackId,
      })),
    }),
  ]);

  await writeAuditLog(admin, {
    action: "STUDENT_TRACKS_UPDATED",
    targetType: "USER",
    targetId: student.id,
    metadata: { trackIds: [...new Set(requestedTrackIds)] },
  });

  query.set("saved", "1");
  redirect(`/admin/tracks?${query}`);
}
