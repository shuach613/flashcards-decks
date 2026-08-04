import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { userHasTracks } from "@/lib/tracks-server";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

export async function requireTrackedUser(callbackUrl = "/") {
  const user = await requireUser();
  if (user.role !== "ADMIN" && !(await userHasTracks(user.id))) {
    redirect(`/choose-track?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}
