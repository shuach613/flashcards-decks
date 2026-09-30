import Link from "next/link";
import { t, type Locale } from "@/lib/i18n";

export function AdminSubnav({
  active,
  locale,
}: {
  active: "decks" | "students" | "tracks" | "track-settings" | "audit";
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
    { href: "/admin/audit-log", label: t(locale, "admin.auditLog"), id: "audit" },
  ] as const;

  return (
    <nav
      className="mb-8 grid grid-cols-2 gap-2 rounded-2xl border border-neutral-muted bg-white p-1.5 shadow-[0_2px_8px_rgba(25,51,37,0.08)] sm:grid-cols-5"
      aria-label={t(locale, "admin.navigation")}
    >
      {links.map((link) => (
        <Link
          key={link.id}
          href={link.href}
          aria-current={active === link.id ? "page" : undefined}
          className={`flex min-h-11 items-center justify-center rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition sm:min-h-0 sm:px-4 ${
            active === link.id
              ? "bg-brand-primary text-white"
              : "text-brand-primary hover:bg-brand-primary/5"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
