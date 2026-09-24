import { requireUser } from "@/lib/authz";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { deckAccessWhere } from "@/lib/tracks-server";
import { ChangeEmailForm, DeleteAccountForm, ResetProgressList } from "./settings-forms";
import { SettingsSubnav, type SettingsTab } from "./settings-subnav";
import { ResendVerificationForm } from "./settings-forms";

function getTab(value: string | undefined): SettingsTab {
  return value === "learning" || value === "removal" ? value : "account";
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; verification?: string }>;
}) {
  const user = await requireUser();
  const locale = await getLocale();
  const { tab: requestedTab } = await searchParams;
  const tab = getTab(requestedTab);
  const databaseUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, isPrimaryAdmin: true, emailVerifiedAt: true },
  });
  if (!databaseUser) return null;
  const isVerified = Boolean(
    databaseUser.emailVerifiedAt ||
      (databaseUser.role === "ADMIN" && databaseUser.isPrimaryAdmin)
  );

  if (!isVerified) {
    return (
      <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
          {t(locale, "settings.title")}
        </h1>
        <section className="rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
          <h2 className="text-lg font-bold text-evergreen">
            {t(locale, "settings.activationRequired")}
          </h2>
          <p className="mt-2 text-sm text-dark-gray">
            {t(locale, "settings.activationBody")}
          </p>
          <p className="mt-3 text-sm text-dark-gray">
            {t(locale, "settings.activationInstructions")}
          </p>
          <ResendVerificationForm locale={locale} />
        </section>
      </div>
    );
  }

  const decks =
    tab === "learning"
      ? await prisma.deck.findMany({
          where: deckAccessWhere(databaseUser),
          orderBy: { title: "asc" },
          select: { id: true, title: true, difficulty: true },
        })
      : [];

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
        {t(locale, "settings.title")}
      </h1>
      <SettingsSubnav active={tab} locale={locale} />

      {tab === "account" && (
        <section className="rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
          <h2 className="text-lg font-bold text-evergreen">
            {t(locale, "settings.account")}
          </h2>
          <p className="mt-1 text-sm text-dark-gray">
            {t(locale, "settings.accountBody")}
          </p>
          <div className="mt-5 flex flex-col gap-3 rounded-xl bg-cream px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-dark-gray uppercase">
                {t(locale, "settings.currentEmail")}
              </p>
              <p className="mt-1 font-medium text-evergreen">{user.email}</p>
            </div>
            <button
              type="button"
              disabled
              className="rounded-full border border-evergreen/20 px-4 py-1.5 text-sm font-semibold text-evergreen opacity-60"
            >
              {t(locale, "settings.changeEmail")}
            </button>
          </div>
          <p className="mt-3 text-sm text-dark-gray">{t(locale, "settings.changeEmailBody")}</p>
          <ChangeEmailForm locale={locale} />
        </section>
      )}

      {tab === "learning" && (
        <section className="rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
          <h2 className="text-lg font-bold text-evergreen">
            {t(locale, "settings.learning")}
          </h2>
          <p className="mt-1 text-sm text-dark-gray">
            {t(locale, "settings.learningBody")}
          </p>
          <p className="mt-4 text-sm text-dark-gray">{t(locale, "settings.resetProgressBody")}</p>
          <ResetProgressList decks={decks} locale={locale} />
        </section>
      )}

      {tab === "removal" && (
        <section className="rounded-2xl border border-sunset-orange/30 bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
          <h2 className="text-lg font-bold text-sunset-orange">
            {t(locale, "settings.accountRemoval")}
          </h2>
          <p className="mt-1 text-sm text-dark-gray">
            {t(locale, "settings.accountRemovalBody")}
          </p>
          <DeleteAccountForm locale={locale} />
        </section>
      )}
    </div>
  );
}
