import { t, type Locale } from "@/lib/i18n";

export function LanguageIndicator({
  language,
  locale,
}: {
  language: string;
  locale: Locale;
}) {
  const isGerman = language === "DE";
  const label = t(locale, isGerman ? "language.DE" : "language.EN");

  return (
    <span title={label} aria-label={label} role="img">
      {isGerman ? "🇩🇪" : "🇬🇧"}
    </span>
  );
}
