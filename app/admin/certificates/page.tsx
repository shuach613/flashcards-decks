import Link from "next/link";
import { requireAdmin } from "@/lib/authz";
import { ensureDefaultCertificates } from "@/lib/certificates-server";
import { t, tc } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { prisma } from "@/lib/db";
import { CertificateForm } from "./certificate-form";

export default async function AdminCertificatesPage() {
  await requireAdmin();
  await ensureDefaultCertificates();
  const locale = await getLocale();

  const certificates = await prisma.certificate.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { decks: true } } },
  });

  return (
    <div className="mx-auto mt-12 max-w-2xl px-6 pb-16">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-evergreen">
          {t(locale, "cert.title")}
        </h1>
        <Link
          href="/admin"
          className="text-sm font-medium text-evergreen underline underline-offset-4"
        >
          {t(locale, "cert.backToDecks")}
        </Link>
      </div>

      <div className="mb-8 rounded-2xl border border-sand bg-white p-5 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h2 className="mb-3 font-semibold text-evergreen">
          {t(locale, "cert.addCertificate")}
        </h2>
        <p className="mb-3 text-sm text-dark-gray">{t(locale, "cert.addHint")}</p>
        <CertificateForm locale={locale} />
      </div>

      <ul className="flex flex-col gap-3">
        {certificates.map((certificate) => (
          <li
            key={certificate.id}
            className="flex items-center justify-between gap-4 rounded-2xl border border-sand bg-white p-4 shadow-[0_2px_8px_rgba(25,51,37,0.08)]"
          >
            <p className="font-semibold text-evergreen">{certificate.name}</p>
            <p className="text-sm text-dark-gray">
              {tc(locale, "cert.deckCount", certificate._count.decks)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
