import "./globals.css";
import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { AppProviders } from "@/components/app/providers";

const displayFont = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const bodyFont = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "SparConnect",
  description: "Organise structured sparring between gyms."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${displayFont.variable} ${bodyFont.variable} bg-canvas text-white antialiased font-body`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
