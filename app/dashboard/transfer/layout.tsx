"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function TransferLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSwitch = pathname === "/dashboard/transfer/local" || pathname === "/dashboard/transfer/international";
  const isLocal = pathname === "/dashboard/transfer/local";

  if (!showSwitch) return <>{children}</>;

  return (
    <div>
      <div className="mb-6">
        <div
          role="tablist"
          className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200"
          aria-label="Transfer type"
        >
          <Link
            href="/dashboard/transfer/local"
            role="tab"
            aria-selected={isLocal}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              isLocal
                ? "bg-white text-navy shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-navy hover:bg-slate-50"
            }`}
          >
            Local Transfer
          </Link>
          <Link
            href="/dashboard/transfer/international"
            role="tab"
            aria-selected={!isLocal}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              !isLocal
                ? "bg-white text-navy shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-navy hover:bg-slate-50"
            }`}
          >
            International Transfer
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
