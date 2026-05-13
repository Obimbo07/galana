import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { ThemeInit } from "@/components/theme-init";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Galana Group — At Galana You Dream We Deliver",
  description:
    "Precast concrete, drainage, paving and roofing solutions across Kenya and East Africa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${cormorant.variable}`}>
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
