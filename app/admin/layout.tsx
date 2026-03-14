"use client";

import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";
import { AdminAuthWrapper } from "@/components/admin/AdminAuthWrapper";
import { useAuth } from "@/components/providers/AuthProvider";

const Icons = {
  overview: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  tools: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  management: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  gateway: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  finance: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  configure: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  dashboard: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  home: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  logout: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

type NavItem =
  | { href: string; label: string; icon: keyof typeof Icons }
  | { label: string; icon: keyof typeof Icons; children: { href: string; label: string }[] };

const adminNav: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "overview" },
  {
    label: "Users",
    icon: "users",
    children: [
      { href: "/admin/users", label: "Clients" },
      { href: "/admin/users/new", label: "New User" },
      { href: "/admin/kyc", label: "KYC Verification" },
    ],
  },
  {
    label: "Tools",
    icon: "tools",
    children: [
      { href: "/admin/info", label: "Info" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
  {
    label: "Managements",
    icon: "management",
    children: [
      { href: "/admin/management/cards", label: "Cards" },
      { href: "/admin/management/loans", label: "Loans" },
      { href: "/admin/management/currencies", label: "Currencies" },
      { href: "/admin/management/exchanges", label: "Exchanges" },
    ],
  },
  {
    label: "Gateway",
    icon: "gateway",
    children: [
      { href: "/admin/gateway", label: "Payment Methods" },
      { href: "/admin/gateway/add", label: "Add Method" },
    ],
  },
  {
    label: "Finance",
    icon: "finance",
    children: [
      { href: "/admin/finance/transfers", label: "Transactions" },
      { href: "/admin/finance/pending-transfers", label: "Pending Transfers" },
      { href: "/admin/finance/deposits", label: "Deposits" },
      { href: "/admin/finance/cheques", label: "Cheques" },
    ],
  },
  {
    label: "Configure",
    icon: "configure",
    children: [
      { href: "/admin/config", label: "Config Hub" },
      { href: "/admin/config/account-types", label: "Account Types" },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  const isSectionActive = (children: { href: string }[]) =>
    children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

  return (
    <AdminAuthWrapper>
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-navy flex flex-col shrink-0 overflow-y-auto">
        <div className="flex items-center gap-2 p-6 border-b border-white/10">
          <Image src={siteConfig.icon} alt={siteConfig.title} width={96} height={32} className="h-8 w-auto" />
          <Link href="/admin" className="text-xl font-bold text-white font-heading">
            Admin
          </Link>
        </div>
        <p className="px-4 py-2 text-xs text-white/50">Use the menu below to navigate the admin area</p>
        <nav className="flex-1 p-4 overflow-y-auto" aria-label="Admin navigation">
          <div className="space-y-1">
            {adminNav.map((item, idx) =>
              "href" in item && item.href ? (
                <div key={item.href} className={idx > 0 ? "pt-4 mt-4 border-t border-white/10" : ""}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border-l-2 -ml-px pl-4 ${
                      isActive(item.href, item.href === "/admin")
                        ? "text-white bg-white/10 border-primary-light"
                        : "border-transparent text-white/85 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {Icons[item.icon]}
                    {item.label}
                  </Link>
                </div>
              ) : "children" in item ? (
                <div key={item.label} className="pt-4 mt-4 border-t border-white/10">
                  <p
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                      isSectionActive(item.children) ? "text-white" : "text-white/60"
                    }`}
                  >
                    {Icons[item.icon]}
                    {item.label}
                  </p>
                  <div className="space-y-0.5">
                    {item.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`flex items-center gap-2 px-4 py-2.5 ml-2 rounded-lg text-sm transition-all border-l-2 pl-4 ${
                          isActive(c.href)
                            ? "text-white bg-white/10 border-primary-light"
                            : "border-transparent text-white/85 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-0.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {Icons.dashboard}
            Dashboard
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {Icons.home}
            Visit main site
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex w-full items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {Icons.logout}
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
    </AdminAuthWrapper>
  );
}
