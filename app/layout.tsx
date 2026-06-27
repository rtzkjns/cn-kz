import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "./globals.css";

// Clean modern UI sans with full Cyrillic — friendly, geometric, polished.
const sans = Onest({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CN-KZ — Грузоперевозки Хоргос → СНГ",
  description: "Маркетплейс грузоперевозок Китай → СНГ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
