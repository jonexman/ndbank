"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const segmentLabels: Record<string, string> = {
  dashboard: "nav.dashboard",
  account: "nav.account",
  profile: "nav.profile",
  statement: "nav.statement",
  kyc: "nav.kyc",
  security: "nav.security",
  transfer: "nav.transfer",
  local: "nav.local",
  international: "nav.international",
  history: "nav.history",
  monetary: "nav.monetary",
  deposit: "nav.deposit",
  cards: "nav.cards",
  exchange: "nav.exchange",
  loan: "nav.loan",
  apply: "nav.apply",
  status: "nav.status",
  receipt: "Receipt",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations("client");
  if (!pathname || pathname === "/dashboard") return null;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length <= 1) return null;

  const items: { href: string; label: string }[] = [];
  let href = "";
  for (let i = 0; i < segments.length; i++) {
    href += (href ? "/" : "") + segments[i];
    const seg = segments[i];
    const key = segmentLabels[seg];
    let label: string;
    if (key?.startsWith("nav.")) label = t(key as "nav.dashboard");
    else if (key) label = key;
    else if (seg.length === 36 || /^[a-f0-9-]{36}$/i.test(seg)) label = "Receipt";
    else label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
    items.push({ href: "/" + href, label });
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1.5">
            {i > 0 && (
              <span className="text-slate-300" aria-hidden>
                /
              </span>
            )}
            {i === items.length - 1 ? (
              <span className="font-medium text-navy">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
