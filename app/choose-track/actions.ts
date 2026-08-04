"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/authz";
import { prisma } from "@/lib/db";
import { ensureDefaultTracks, userHasTracks } from "@/lib/tracks-server";

export type ChooseTrackState = { error?: string } | undefined;

function safeCallbackUrl(value: FormDataEntryValue | null) {
  const callbackUrl = String(value ?? "/");
  return callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
    ? callbackUrl
    : "/";
}

export async function chooseTrack(
  _previousState: ChooseTrackState,
  formData: FormData
): Promise<ChooseTrackState> {
  const user = await requireUser();
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"));

  if (user.role === "ADMIN" || (await userHasTracks(user.id))) {
    redirect(callbackUrl);
  }

  const trackId = String(formData.get("trackId") ?? "");
  if (!trackId) {
    return { error: "Choose a track to continue." };
  }

  await ensureDefaultTracks();
  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track) return { error: "That track is not available." };

  await prisma.userTrack.create({
    data: { userId: user.id, trackId: track.id },
  });

  redirect(callbackUrl);
}
