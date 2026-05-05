import { ReactNode } from "react";

interface SectionLayoutProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function SectionLayout({ eyebrow, title, subtitle, children }: SectionLayoutProps) {
  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-l-4 border-primary pl-4 sm:pl-6 mb-6 sm:mb-8">
          {eyebrow && (
            <p className="text-primary font-semibold text-xs uppercase tracking-[0.2em] mb-2">{eyebrow}</p>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy font-heading leading-tight">{title}</h1>
          {subtitle && <p className="text-gray-600 max-w-2xl mt-3 sm:mt-4 text-sm sm:text-base">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
