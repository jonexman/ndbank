"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const settingsNav = [
  { href: "/admin/settings", label: "Overview" },
  { href: "/admin/settings/general", label: "General" },
  { href: "/admin/settings/email", label: "Email" },
  { href: "/admin/settings/users", label: "Users" },
  { href: "/admin/settings/config", label: "Config" },
  { href: "/admin/settings/config/account-types", label: "Account Types" },
  { href: "/admin/settings/currencies", label: "Currencies" },
  { href: "/admin/settings/transfer-charges", label: "Transfer charges" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.error || !d.isSuperAdmin) {
          router.replace("/admin");
        } else {
          setAllowed(true);
        }
      })
      .catch(() => router.replace("/admin"));
  }, [router]);

  if (allowed !== true) {
    return (
      <div className="flex items-center justify-center min-h-[280px]">
        <p className="text-slate-500">Checking access...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav
        className="flex flex-wrap gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 w-fit"
        aria-label="Settings sections"
      >
        {settingsNav.map((item) => {
          const isActive =
            item.href === "/admin/settings"
              ? pathname === "/admin/settings"
              : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white text-navy shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-navy hover:bg-white/60"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
