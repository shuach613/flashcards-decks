import type { Metadata } from "next";
import { Wix_Madefor_Display } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import { getLocale } from "@/lib/i18n-server";
import "./globals.css";

const wixMadeforDisplay = Wix_Madefor_Display({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-wix-madefor-display",
});

export const metadata: Metadata = {
  title: "ShuachCloud Flashcard Decks",
  description: "Study flashcard decks, Anki-style.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${wixMadeforDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
