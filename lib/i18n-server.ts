import "server-only";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

const COOKIE_NAME = "locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === "de" ? "de" : "en";
}
