import Image from "next/image";
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { LanguageToggle } from "@/components/language-toggle";

export async function NavBar() {
  const session = await auth();
  const user = session?.user;
  const locale = await getLocale();

  return (
    <header className="border-b border-sand bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-6">
        <div className="flex items-center justify-between gap-4 py-3.5">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            aria-label={`${t(locale, "home.title")} · MSIT`}
          >
            <Image
              src="/msit-logomark.svg"
              alt="MSIT"
              width={92}
              height={33}
              className="h-auto w-[76px] sm:w-[92px]"
              priority
            />
            <span
              className="hidden h-6 w-px bg-sand sm:block"
              aria-hidden="true"
            />
            <span className="hidden font-semibold text-evergreen sm:inline">
              {t(locale, "home.title")}
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <span className="hidden text-dark-gray sm:inline">{user.email}</span>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    className="rounded-full border border-evergreen/20 px-4 py-1.5 font-medium text-evergreen transition hover:bg-evergreen hover:text-white"
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
                  className="font-medium text-evergreen underline-offset-4 hover:underline"
                >
                  {t(locale, "nav.logIn")}
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-evergreen px-4 py-1.5 font-medium text-white transition hover:brightness-110"
                >
                  {t(locale, "nav.signUp")}
                </Link>
              </>
            )}
            <LanguageToggle current={locale} />
          </div>
        </div>
        {user && (
          <nav className="flex items-center gap-5 border-t border-sand py-2.5 text-sm">
            <Link
              href="/"
              className="font-medium text-evergreen underline-offset-4 hover:underline"
            >
              {t(locale, "nav.myDecks")}
            </Link>
            <Link
              href="/decks"
              className="font-medium text-evergreen underline-offset-4 hover:underline"
            >
              {t(locale, "nav.allDecks")}
            </Link>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="font-medium text-evergreen underline-offset-4 hover:underline"
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
