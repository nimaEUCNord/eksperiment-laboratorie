import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Eksperiment Laboratorie",
    template: "%s · Eksperiment Laboratorie",
  },
  description:
    "Fysikforsøg og interaktive simulationer til HTX. Mekanik, el og magnetisme – samlet ét sted.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-white text-slate-900">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
