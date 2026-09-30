import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { MfaLoginForm } from "./form";

export default async function MfaPage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("mfa-challenge")?.value) redirect("/login");
  const locale = await getLocale();
  return (
    <div className="mx-auto mt-16 max-w-sm px-6">
      <div className="rounded-2xl border border-neutral-muted bg-white p-8 shadow-[0_2px_8px_rgba(25,51,37,0.08)]">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-brand-primary">
          {t(locale, "auth.mfaTitle")}
        </h1>
        <p className="mb-6 text-sm text-text-muted">{t(locale, "auth.mfaBody")}</p>
        <MfaLoginForm locale={locale} />
      </div>
    </div>
  );
}
