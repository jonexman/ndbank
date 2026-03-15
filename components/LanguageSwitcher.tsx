"use client";

import { useLocale } from "next-intl";
import { localeNames } from "@/i18n/config";

export function LanguageSwitcher() {
  const locale = useLocale();
  const currentName = localeNames[locale as keyof typeof localeNames] ?? locale.toUpperCase();

  return (
    <div
      className="relative shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-500 bg-slate-100 border border-slate-200 cursor-not-allowed pointer-events-none select-none"
      aria-label="Language (read-only)"
    >
      <span className="hidden sm:inline">{currentName}</span>
      <span className="sm:hidden" aria-hidden="true">{locale.toUpperCase()}</span>
      <svg className="w-3.5 h-3.5 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
