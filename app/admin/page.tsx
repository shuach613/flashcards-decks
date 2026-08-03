import Link from "next/link";
import { requireAdmin } from "@/lib/authz";
import { ensureDefaultCertificates } from "@/lib/certificates-server";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { CopyLinkButton } from "./copy-link-button";
import { CreateDeckForm } from "./create-deck-form";
import { deleteDeck } from "./actions";

export default async function AdminPage() {
  await requireAdmin();
  await ensureDefaultCertificates();
  const locale = await getLocale();

  const [decks, certificates] = await Promise.all([
    prisma.deck.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { cards: true } }, certificate: true },
    }),
    prisma.certificate.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          {t(locale, "admin.title")}
        </h1>
        <Link
          href="/admin/certificates"
          className="text-sm font-medium text-evergreen underline underline-offset-4"
        >
          {t(locale, "admin.manageCertificates")}
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h2 className="mb-3 font-semibold text-evergreen">
          {t(locale, "admin.newDeck")}
        </h2>
        <CreateDeckForm certificates={certificates} locale={locale} />
      </div>

      <ul className="flex flex-col gap-3">
        {decks.map((deck) => (
          <li
            key={deck.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-sand bg-white p-4 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
          >
            <div>
              <p className="font-semibold text-evergreen">{deck.title}</p>
              <p className="text-sm text-dark-gray">
                /decks/{deck.slug} · {tc(locale, "deck.cardCount", deck._count.cards)} ·{" "}
                {deck.certificate?.name ?? t(locale, "common.uncategorized")} ·{" "}
                {t(locale, `language.${deck.language}` as "language.EN" | "language.DE")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <CopyLinkButton slug={deck.slug} locale={locale} />
              <Link
                href={`/admin/decks/${deck.slug}`}
                className="rounded-full border border-evergreen/20 px-4 py-1.5 text-sm font-medium text-evergreen transition hover:bg-evergreen/5"
              >
                {t(locale, "common.edit")}
              </Link>
              <form action={deleteDeck.bind(null, deck.id)}>
                <button
                  type="submit"
                  className="rounded-full border border-sunset-orange/30 px-4 py-1.5 text-sm font-medium text-sunset-orange transition hover:bg-sunset-orange/5"
                >
                  {t(locale, "common.delete")}
                </button>
              </form>
            </div>
          </li>
        ))}
        {decks.length === 0 && <p className="text-dark-gray">{t(locale, "admin.noDecks")}</p>}
      </ul>
    </div>
  );
}
