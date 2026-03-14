import { ReactNode } from "react";

interface SectionLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SectionLayout({ eyebrow, title, subtitle, children }: SectionLayoutProps) {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l-4 border-primary pl-6 mb-8">
          {eyebrow && (
            <p className="text-primary font-semibold text-xs uppercase tracking-[0.2em] mb-2">{eyebrow}</p>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold text-navy font-heading">{title}</h1>
          {subtitle && <p className="text-gray-600 max-w-2xl mt-4 text-base">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
