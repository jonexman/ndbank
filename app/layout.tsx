import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { DM_Sans, Outfit, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { siteConfig } from "../lib/siteConfig";
import { ClientLayoutWrapper } from "../components/ClientLayoutWrapper";
import { AuthProvider } from "../components/providers/AuthProvider";
import { HtmlLangDir } from "../components/HtmlLangDir";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
  icons: {
    icon: siteConfig.icon
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html suppressHydrationWarning className={`${dmSans.variable} ${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <HtmlLangDir locale={locale}>
            <AuthProvider>
              <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
            </AuthProvider>
          </HtmlLangDir>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

