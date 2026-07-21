import type { Metadata } from "next";
import { Golos_Text, Geist_Mono } from "next/font/google";
import "./globals.css";

// «Тракт» redesign: Golos Text — a Cyrillic-native humanist sans (consumer-app warmth,
// not a dev-tool grotesk). Geist Mono is kept ONLY for raw IDs (order/plate numbers).
const sans = Golos_Text({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CN-KZ — Грузоперевозки по всей СНГ",
  description: "Маркетплейс грузоперевозок по всей СНГ — из любого города в любой",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
