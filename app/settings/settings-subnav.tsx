import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";

export type SettingsTab = "account" | "learning" | "removal";

export function SettingsSubnav({
  active,
  locale,
}: {
  active: SettingsTab;
  locale: Locale;
}) {
  const links = [
    { href: "/settings?tab=account", label: t(locale, "settings.account"), id: "account" },
    { href: "/settings?tab=learning", label: t(locale, "settings.learning"), id: "learning" },
    {
      href: "/settings?tab=removal",
      label: t(locale, "settings.accountRemoval"),
      id: "removal",
    },
  ] as const;

  return (
    <nav
      className="mb-8 grid grid-cols-1 gap-2 rounded-2xl border border-sand bg-white p-1.5 shadow-[0_2px_8px_rgba(25,51,37,0.08)] sm:grid-cols-3"
      aria-label={t(locale, "settings.navigation")}
    >
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          aria-current={active === link.id ? "page" : undefined}
          className={`rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
            active === link.id
              ? "bg-evergreen text-white"
              : "text-evergreen hover:bg-evergreen/5"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
