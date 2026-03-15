"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { siteConfig } from "../lib/siteConfig";
import { LanguageSwitcher } from "./LanguageSwitcher";

const navPaths = ["/", "/personal", "/corporate", "/deposits", "/loans", "/cards", "/contact"];

export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations("common");
  const tNav = useTranslations("nav");
  const navLabels = [tNav("home"), tNav("personal"), tNav("corporate"), tNav("deposits"), tNav("loans"), tNav("cards"), tNav("contact")];
  const navItems = navPaths.map((href, i) => ({ href, label: navLabels[i] }));

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rtl:left-auto rtl:right-4"
      >
        {t("skipToContent")}
      </a>
      {/* Top bar - UBA red accent */}
      <div className="h-1 bg-gradient-to-r from-primary-dark via-primary to-primary-light" aria-hidden />
      <header className="sticky top-0 z-50 bg-white text-navy shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-[72px] gap-2 sm:gap-4 min-h-[3.5rem]">
            <Link href="/" className="flex items-center shrink-0 group min-w-0">
              <Image src={siteConfig.icon} alt={siteConfig.title} width={120} height={40} className="h-8 sm:h-9 lg:h-10 w-auto transition-opacity group-hover:opacity-90" priority />
            </Link>

            <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main">
              {navItems.map(({ href, label }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-navy/80 hover:text-navy hover:bg-slate-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              <LanguageSwitcher />
              <Link
                href="/dashboard/signin"
                className="hidden lg:inline text-sm font-medium text-navy/85 hover:text-navy px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-primary hover:bg-primary-dark text-white shadow-[0_4px_14px_rgba(196,30,58,0.35)] hover:shadow-[0_6px_20px_rgba(196,30,58,0.4)] transition-all whitespace-nowrap"
              >
                {t("eBanking")}
              </Link>
              <Link
                href="/dashboard/signup"
                className="hidden lg:inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-300 text-navy hover:bg-slate-50 transition-colors"
              >
                {t("signUp")}
              </Link>
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((o) => !o)}
                className="lg:hidden p-2.5 -mr-2 rounded-lg text-navy/80 hover:text-navy hover:bg-slate-100 transition-colors touch-manipulation"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
                aria-label={mobileMenuOpen ? t("closeMenu") : t("openMenu")}
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav panel */}
        <div
          id="mobile-nav"
          className={`lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg overflow-hidden transition-[max-height] duration-300 ease-out ${
            mobileMenuOpen ? "max-h-[calc(100vh-4rem)]" : "max-h-0"
          }`}
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-6rem)]" aria-label="Main">
            {navItems.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3.5 rounded-xl text-base font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-navy/80 hover:text-navy hover:bg-slate-100"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <div className="pt-4 mt-4 border-t border-slate-200 flex flex-col gap-2">
              <Link
                href="/dashboard/signin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3.5 rounded-xl text-base font-medium text-navy/80 hover:text-navy hover:bg-slate-100"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/dashboard/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center px-4 py-3.5 rounded-xl text-base font-medium border border-slate-300 text-navy hover:bg-slate-50"
              >
                {t("signUp")}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1 min-w-0">{children}</main>

      <footer className="bg-navy text-gray-300">
        <div className="h-1 bg-gradient-to-r from-primary-dark via-primary to-primary-light" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <Image src={siteConfig.icon} alt={siteConfig.title} width={140} height={44} className="h-10 sm:h-11 w-auto mb-4 sm:mb-5 opacity-95" />
              <p className="text-sm leading-relaxed text-gray-400 max-w-xs">{siteConfig.description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{tNav("quickLinks")}</h4>
              <ul className="space-y-3">
                {["/personal", "/corporate", "/deposits", "/loans"].map((path, i) => (
                  <li key={path}>
                    <Link href={path} className="text-sm text-gray-400 hover:text-primary-light transition-colors">
                      {[tNav("personal"), tNav("corporate"), tNav("deposits"), tNav("loans")][i]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">{tNav("contact")}</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>{siteConfig.address}</li>
                <li>
                  <a href={`tel:${siteConfig.phone}`} className="hover:text-primary-light transition-colors">
                    {siteConfig.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${siteConfig.adminEmail}`} className="hover:text-primary-light transition-colors">
                    {siteConfig.adminEmail}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-white/10 text-center text-xs sm:text-sm text-gray-500 px-2">
            © {siteConfig.title} {new Date().getFullYear()} — All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
