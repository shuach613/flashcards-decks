import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";

export function AdminSubnav({
  active,
  locale,
}: {
  active: "decks" | "students" | "tracks" | "track-settings";
  locale: Locale;
}) {
  const links = [
    { href: "/admin", label: t(locale, "admin.deckManagement"), id: "decks" },
    {
      href: "/admin/students",
      label: t(locale, "admin.studentOverview"),
      id: "students",
    },
    {
      href: "/admin/tracks",
      label: t(locale, "admin.studentTrackAssignments"),
      id: "tracks",
    },
    {
      href: "/admin/track-settings",
      label: t(locale, "admin.trackConfiguration"),
      id: "track-settings",
    },
  ] as const;

  return (
    <nav
      className="mb-8 grid grid-cols-2 gap-2 rounded-2xl border border-sand bg-white p-1.5 shadow-[0_2px_8px_rgba(25,51,37,0.08)] sm:grid-cols-4"
      aria-label={t(locale, "admin.navigation")}
    >
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          aria-current={active === link.id ? "page" : undefined}
          className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition ${
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
