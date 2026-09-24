import { createHash } from "node:crypto";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const locale = await getLocale();
  const token = String((await searchParams).token ?? "");
  const tokenHash = token ? createHash("sha256").update(token).digest("hex") : "";
  const verificationToken = tokenHash
    ? await prisma.verificationToken.findUnique({ where: { tokenHash } })
    : null;

  let message = t(locale, "settings.verificationInvalid");
  if (verificationToken) {
    if (verificationToken.expiresAt <= new Date()) {
      if (verificationToken.attempt >= 2) {
        await prisma.user.deleteMany({ where: { id: verificationToken.userId, emailVerifiedAt: null } });
        message = t(locale, "settings.verificationDeleted");
      } else {
        await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
        message = t(locale, "settings.verificationExpired");
      }
    } else {
      await prisma.$transaction([
        prisma.user.updateMany({
          where: { id: verificationToken.userId, emailVerifiedAt: null },
          data: { emailVerifiedAt: new Date() },
        }),
        prisma.verificationToken.deleteMany({ where: { userId: verificationToken.userId } }),
      ]);
      message = t(locale, "settings.verificationSuccess");
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="rounded-2xl border border-sand bg-white p-8 text-center shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          {t(locale, "settings.activationRequired")}
        </h1>
        <p className="mt-4 text-sm text-dark-gray">{message}</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-evergreen px-5 py-2.5 font-semibold text-white"
        >
          {t(locale, "nav.logIn")}
        </Link>
      </div>
    </div>
  );
}
