import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import { prisma } from "@/lib/db";

export async function NavBar() {
  const session = await auth();
  const user = session?.user;
  const locale = await getLocale();
  const databaseUser = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, isPrimaryAdmin: true, emailVerifiedAt: true },
      })
    : null;
  const canUseApp = Boolean(
    databaseUser?.emailVerifiedAt ||
      (databaseUser?.role === "ADMIN" && databaseUser.isPrimaryAdmin)
  );

  return (
    <header className="border-b border-neutral-muted bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex items-center justify-between gap-4 py-3.5">
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
          <div className="flex items-center gap-3 text-sm">
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
        </div>
        {user && (
          <nav className="flex items-center gap-5 border-t border-neutral-muted py-2.5 text-sm">
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
    </header>
  );
}
