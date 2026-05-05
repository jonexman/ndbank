import { ReactNode } from "react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, backHref, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
      <div>
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary mb-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-navy font-heading tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1.5 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
