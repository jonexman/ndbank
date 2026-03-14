"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "../lib/siteConfig";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/personal", label: "Personal" },
  { href: "/corporate", label: "Corporate" },
  { href: "/deposits", label: "Deposits" },
  { href: "/loans", label: "Loans" },
  { href: "/cards", label: "Cards" },
  { href: "/contact", label: "Contact" },
];

export function MainLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {/* Top bar - UBA red accent */}
      <div className="h-1 bg-gradient-to-r from-primary-dark via-primary to-primary-light" aria-hidden />
      <header className="sticky top-0 z-50 bg-white text-navy shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px] gap-4">
            <Link href="/" className="flex items-center shrink-0 group">
              <Image src={siteConfig.icon} alt={siteConfig.title} width={120} height={40} className="h-9 lg:h-10 w-auto transition-opacity group-hover:opacity-90" priority />
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

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard/signin"
                className="hidden sm:inline text-sm font-medium text-navy/85 hover:text-navy px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary hover:bg-primary-dark text-white shadow-[0_4px_14px_rgba(196,30,58,0.35)] hover:shadow-[0_6px_20px_rgba(196,30,58,0.4)] transition-all"
              >
                E-Banking
              </Link>
              <Link
                href="/dashboard/signup"
                className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium border border-slate-300 text-navy hover:bg-slate-50 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">{children}</main>

      <footer className="bg-navy text-gray-300">
        <div className="h-1 bg-gradient-to-r from-primary-dark via-primary to-primary-light" aria-hidden />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            <div className="lg:col-span-1">
              <Image src={siteConfig.icon} alt={siteConfig.title} width={140} height={44} className="h-11 w-auto mb-5 opacity-95" />
              <p className="text-sm leading-relaxed text-gray-400 max-w-xs">{siteConfig.description}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-3">
                {["/personal", "/corporate", "/deposits", "/loans"].map((path, i) => (
                  <li key={path}>
                    <Link href={path} className="text-sm text-gray-400 hover:text-primary-light transition-colors">
                      {["Personal", "Corporate", "Deposits", "Loans"][i]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact</h4>
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
          <div className="mt-14 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            © {siteConfig.title} {new Date().getFullYear()} — All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
