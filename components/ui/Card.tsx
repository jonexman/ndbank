import { ReactNode, HTMLAttributes } from "react";
import Link from "next/link";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  asLink?: string;
  variant?: "default" | "elevated" | "outlined";
}

export function Card({ children, hover, asLink, variant = "default", className = "", ...props }: CardProps) {
  const base = "bg-white rounded-2xl p-6 transition-all duration-200";
  const variants = {
    default: "shadow-card border border-slate-200/60",
    elevated: "shadow-cardElevated border border-slate-100",
    outlined: "border-2 border-slate-200 shadow-none",
  };
  const hoverClass = hover ? "hover:shadow-cardHover hover:border-primary/30 hover:-translate-y-0.5" : "";

  const content = (
    <div className={`${base} ${variants[variant]} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );

  if (asLink) {
    return (
      <Link href={asLink} className="block group">
        {content}
      </Link>
    );
  }
  return content;
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
}

export function CardHeader({ title, subtitle, badge }: CardHeaderProps) {
  return (
    <div className="mb-4">
      {badge && <div className="mb-3">{badge}</div>}
      <h3 className="text-lg font-semibold text-navy font-heading">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function CardBadge({ children, variant = "primary" }: { children: ReactNode; variant?: "primary" | "success" | "warning" }) {
  const colors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success-light text-success-dark",
    warning: "bg-amber-500/10 text-amber-600",
  };
  return (
    <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl font-semibold text-sm ${colors[variant]}`}>
      {children}
    </span>
  );
}

/** Banking-style balance/stat card */
export function BalanceCard({
  label,
  amount,
  currency,
  icon,
  className = "",
}: {
  label: string;
  amount: string | number;
  currency: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <Card variant="elevated" className={`${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</p>
          <p className="balance-display mt-1">
            {currency === "USD" && "$"}
            {typeof amount === "number" ? amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) : amount}{" "}
            {currency}
          </p>
        </div>
        {icon && (
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
