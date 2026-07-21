import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

// «Signal» v3 (inDrive-system replication): Manrope — a geometric grotesque with heavy
// weights + full Cyrillic — carries display / price / titles / buttons (numerals heaviest).
// Inter carries body & addresses for neutral long-text readability.
const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="ru" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
