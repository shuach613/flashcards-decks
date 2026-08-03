import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LANGUAGES } from "@/lib/certificates";
import { prisma } from "@/lib/db";

type DeckRow = { id: string; slug: string; title: string; language: string };

function groupByLanguage(decks: DeckRow[]) {
  return LANGUAGES.map((language) => ({
    language,
    decks: decks.filter((d) => d.language === language.value),
  })).filter((group) => group.decks.length > 0);
}

export default async function AllDecksPage() {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/decks")}`);
  }

  const [certificates, uncategorized] = await Promise.all([
    prisma.certificate.findMany({
      orderBy: { order: "asc" },
      include: { decks: { orderBy: [{ language: "asc" }, { title: "asc" }] } },
    }),
    prisma.deck.findMany({
      where: { certificateId: null },
      orderBy: [{ language: "asc" }, { title: "asc" }],
    }),
  ]);

  const sections = [
    ...certificates
      .filter((certificate) => certificate.decks.length > 0)
      .map((certificate) => ({
        name: certificate.name,
        groups: groupByLanguage(certificate.decks),
      })),
    ...(uncategorized.length > 0
      ? [{ name: "Uncategorized", groups: groupByLanguage(uncategorized) }]
      : []),
  ];

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-evergreen">
        All Decks
      </h1>
      {sections.length === 0 ? (
        <p className="text-dark-gray">No decks yet.</p>
      ) : (
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.name}>
              <h2 className="mb-3 text-lg font-bold text-evergreen">
                {section.name}
              </h2>
              <div className="flex flex-col gap-4">
                {section.groups.map((group) => (
                  <div key={group.language.value}>
                    <h3 className="mb-2 text-xs font-semibold tracking-wide text-dark-gray uppercase">
                      {group.language.label}
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {group.decks.map((deck) => (
                        <li key={deck.id}>
                          <Link
                            href={`/decks/${deck.slug}`}
                            className="block rounded-2xl border border-sand bg-white px-4 py-3 font-medium text-evergreen shadow-[0_2px_8px_rgba(25,51,37,0.08)] transition hover:bg-evergreen/5"
                          >
                            {deck.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
