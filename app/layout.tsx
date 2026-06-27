import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Jeton design language: geometric-humanist sans (Manrope — Sequel Sans stand-in
// with Cyrillic support), airy positive tracking on display type.
const sans = Manrope({
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
