import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { DM_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import { siteConfig } from "../lib/siteConfig";
import { ClientLayoutWrapper } from "../components/ClientLayoutWrapper";
import { AuthProvider } from "../components/providers/AuthProvider";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: siteConfig.icon
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

