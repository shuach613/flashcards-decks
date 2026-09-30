import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { prisma } from "@/lib/db";
import { MfaPrompt } from "@/components/mfa-prompt";

export async function NavBar() {
  const session = await auth();
  const user = session?.user;
  const locale = await getLocale();
  const databaseUser = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, isPrimaryAdmin: true, emailVerifiedAt: true, mfaDevice: { select: { enabledAt: true } }, mfaPromptDismissedAt: true },
      })
    : null;
  const canUseApp = Boolean(
    databaseUser?.emailVerifiedAt ||
      (databaseUser?.role === "ADMIN" && databaseUser.isPrimaryAdmin)
  );

  return (
    <header className="border-b border-neutral-muted bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-6">
        <div className="relative flex items-center justify-between gap-3 py-3 sm:gap-4 sm:py-3.5">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            aria-label={`${t(locale, "home.title")} · ShuachCloud`}
          >
            <Image
              src="/shuachcloud-logo.png"
              alt="ShuachCloud"
              width={64}
              height={64}
              className="size-12 rounded-xl object-cover sm:size-14"
              priority
            />
            <span
              className="hidden h-6 w-px bg-surface-muted sm:block"
              aria-hidden="true"
            />
            <span className="hidden font-semibold text-brand-primary sm:inline">
              {t(locale, "home.title")}
            </span>
          </Link>
          <div className="hidden items-center gap-3 text-sm md:flex">
            {user ? (
              <>
                <span className="hidden text-text-muted sm:inline">{user.email}</span>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    className="rounded-full border border-brand-primary/20 px-4 py-1.5 font-medium text-brand-primary transition hover:bg-brand-primary hover:text-white"
                    type="submit"
                  >
                    {t(locale, "nav.logOut")}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="font-medium text-brand-primary underline-offset-4 hover:underline"
                >
                  {t(locale, "nav.logIn")}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-brand-primary px-4 py-1.5 font-medium text-white transition hover:brightness-110"
                >
                  {t(locale, "nav.signUp")}
                </Link>
              </>
            )}
            <LanguageToggle current={locale} />
            <ThemeToggle />
          </div>
          <details className="relative md:hidden">
            <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-brand-primary/20 text-xl font-bold text-brand-primary [&::-webkit-details-marker]:hidden">
              <span aria-hidden="true">☰</span>
              <span className="sr-only">Open navigation</span>
            </summary>
            <div className="absolute right-0 top-14 z-20 w-64 rounded-2xl border border-neutral-muted bg-white p-3 shadow-[0_6px_20px_rgba(25,51,37,0.14)]">
              <div className="flex flex-col gap-1 text-sm">
                {user ? (
                  <>
                    {canUseApp && (
                      <>
                        <Link href="/" className="rounded-xl px-3 py-3 font-medium text-brand-primary hover:bg-brand-primary/5">
                          {t(locale, "nav.myDecks")}
                        </Link>
                        <Link href="/decks" className="rounded-xl px-3 py-3 font-medium text-brand-primary hover:bg-brand-primary/5">
                          {t(locale, "nav.allDecks")}
                        </Link>
                      </>
                    )}
                    <Link href="/settings" className="rounded-xl px-3 py-3 font-medium text-brand-primary hover:bg-brand-primary/5">
                      {t(locale, "nav.settings")}
                    </Link>
                    {canUseApp && user.role === "ADMIN" && (
                      <Link href="/admin" className="rounded-xl px-3 py-3 font-medium text-brand-primary hover:bg-brand-primary/5">
                        {t(locale, "nav.admin")}
                      </Link>
                    )}
                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                      }}
                    >
                      <button type="submit" className="w-full rounded-xl px-3 py-3 text-left font-medium text-brand-primary hover:bg-brand-primary/5">
                        {t(locale, "nav.logOut")}
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="rounded-xl px-3 py-3 font-medium text-brand-primary hover:bg-brand-primary/5">
                      {t(locale, "nav.logIn")}
                    </Link>
                    <Link href="/signup" className="rounded-xl bg-brand-primary px-3 py-3 font-medium text-white">
                      {t(locale, "nav.signUp")}
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-neutral-muted px-2 pt-3">
                <LanguageToggle current={locale} />
                <ThemeToggle />
              </div>
            </div>
          </details>
        </div>
        {user && (
          <nav className="hidden items-center gap-5 border-t border-neutral-muted py-2.5 text-sm md:flex">
            {canUseApp && (
              <>
                <Link
                  href="/"
                  className="font-medium text-brand-primary underline-offset-4 hover:underline"
                >
                  {t(locale, "nav.myDecks")}
                </Link>
                <Link
                  href="/decks"
                  className="font-medium text-brand-primary underline-offset-4 hover:underline"
                >
                  {t(locale, "nav.allDecks")}
                </Link>
              </>
            )}
            <Link
              href="/settings"
              className="font-medium text-brand-primary underline-offset-4 hover:underline"
            >
              {t(locale, "nav.settings")}
            </Link>
            {canUseApp && user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="font-medium text-brand-primary underline-offset-4 hover:underline"
              >
                {t(locale, "nav.admin")}
              </Link>
            )}
          </nav>
        )}
      </div>
      {user && databaseUser && !databaseUser.mfaDevice?.enabledAt && !databaseUser.mfaPromptDismissedAt && (
        <MfaPrompt locale={locale} />
      )}
    </header>
  );
}
