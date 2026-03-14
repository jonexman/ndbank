"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { siteConfig } from "@/lib/siteConfig";

const noSidebarPaths = ["/dashboard/signin", "/dashboard/signup"];

/* Heroicons outline style - 20x20 */
const Icons = {
  dashboard: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  transfer: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  wallet: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  loan: (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

type DashboardNavItem =
  | { href: string; label: string; icon: keyof typeof Icons }
  | { label: string; icon: keyof typeof Icons; children: { href: string; label: string }[] };

const dashboardNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  {
    label: "Account",
    icon: "user",
    children: [
      { href: "/dashboard/account", label: "Profile" },
      { href: "/dashboard/account/statement", label: "Statement" },
      { href: "/dashboard/account/kyc", label: "KYC" },
      { href: "/dashboard/account/security", label: "Security" },
    ],
  },
  {
    label: "Transfer",
    icon: "transfer",
    children: [
      { href: "/dashboard/transfer/local", label: "Local" },
      { href: "/dashboard/transfer/international", label: "International" },
      { href: "/dashboard/transfer/history", label: "History" },
    ],
  },
  {
    label: "Monetary",
    icon: "wallet",
    children: [
      { href: "/dashboard/deposit", label: "Deposit" },
      { href: "/dashboard/cards", label: "Cards" },
      { href: "/dashboard/monetary/exchange", label: "Exchange" },
    ],
  },
  {
    label: "Loan",
    icon: "loan",
    children: [
      { href: "/dashboard/loan/apply", label: "Apply" },
      { href: "/dashboard/loan/status", label: "Status" },
    ],
  },
];

function NavLink({
  href,
  label,
  icon,
  isActive,
  className = "",
  onNavigate,
}: {
  href: string;
  label: string;
  icon?: keyof typeof Icons;
  isActive: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border-l-2 -ml-px pl-4 ${
        isActive
          ? "bg-primary/10 text-primary border-primary"
          : "border-transparent text-navy/80 hover:text-navy hover:bg-slate-100"
      } ${className}`}
    >
      {icon && Icons[icon]}
      {label}
    </Link>
  );
}

const kycPath = "/dashboard/account/kyc";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, email, userId, isLoading } = useAuth();
  const showSidebar = !noSidebarPaths.some((p) => pathname === p);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!showSidebar || !userId || isLoading || pathname === kycPath) return;
    fetch("/api/dashboard/kyc")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.kycStatus && d.kycStatus !== "approved") {
          router.replace(kycPath);
        }
      })
      .catch(() => {});
  }, [showSidebar, userId, isLoading, pathname, router]);

  const closeSidebar = () => setSidebarOpen(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isSectionActive = (children: { href: string }[]) =>
    children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64
          bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm
          transform transition-transform duration-200 ease-out
          lg:transform-none lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Image src={siteConfig.icon} alt={siteConfig.title} width={96} height={32} className="h-8 w-auto" />
            <span className="text-xl font-bold text-navy font-heading tracking-tight">E-Banking</span>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 -mr-2 rounded-lg text-navy/80 hover:text-navy hover:bg-slate-100"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto" aria-label="Dashboard navigation">
          <div className="space-y-1">
            {dashboardNav.map((item, idx) =>
              "href" in item && item.href ? (
                <div key={item.href} className={idx > 0 ? "pt-4 mt-4 border-t border-slate-100" : ""}>
                  <NavLink
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive(item.href, true)}
                    onNavigate={closeSidebar}
                  />
                </div>
              ) : "children" in item ? (
                <div key={item.label} className="pt-4 mt-4 border-t border-slate-100">
                  <p
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                      isSectionActive(item.children) ? "text-primary" : "text-navy/50"
                    }`}
                  >
                    {Icons[item.icon]}
                    {item.label}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {item.children.map((c) => (
                      <NavLink
                        key={c.href}
                        href={c.href}
                        label={c.label}
                        isActive={isActive(c.href)}
                        className="ml-2"
                        onNavigate={closeSidebar}
                      />
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-0.5">
          {email && (
            <p className="px-4 py-2 text-xs text-slate-500 truncate" title={email}>
              Signed in as {email}
            </p>
          )}
          <Link
            href="/"
            onClick={closeSidebar}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm text-navy/80 hover:text-navy hover:bg-slate-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Visit main site
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm text-navy/80 hover:text-navy hover:bg-slate-100 transition-colors text-left"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-navy hover:bg-slate-100"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src={siteConfig.icon} alt={siteConfig.title} width={84} height={28} className="h-7 w-auto" />
            <span className="text-lg font-bold text-navy font-heading">{siteConfig.title}</span>
          </Link>
          <div className="w-10" />
        </header>

        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
