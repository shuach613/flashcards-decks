import Link from "next/link";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { SignupForm } from "./signup-form";
import { ensureDefaultTracks } from "@/lib/tracks-server";
import { prisma } from "@/lib/db";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const target = callbackUrl ?? "/";
  const locale = await getLocale();
  await ensureDefaultTracks();
  const tracks = await prisma.track.findMany({
    orderBy: { order: "asc" },
    include: {
      categories: {
        include: { category: true },
        orderBy: { category: { order: "asc" } },
      },
    },
  });

  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="rounded-2xl border border-sand bg-white p-8 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
          {t(locale, "auth.signupTitle")}
        </h1>
        <SignupForm
          callbackUrl={target}
          locale={locale}
          tracks={tracks.map((track) => ({
            id: track.id,
            name: track.name,
            categoryNames: track.categories.map(
              (item) => item.category.name
            ),
          }))}
        />
      </div>
      <p className="mt-4 text-center text-sm text-dark-gray">
        {t(locale, "auth.haveAccount")}{" "}
        <Link
          className="font-medium text-evergreen underline underline-offset-4"
          href={`/login?callbackUrl=${encodeURIComponent(target)}`}
        >
          {t(locale, "nav.logIn")}
        </Link>
      </p>
    </div>
  );
}
