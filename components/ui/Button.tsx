import { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const base = "inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-primary-dark to-primary-light text-white hover:opacity-95 hover:shadow-lg focus:ring-primary",
  secondary: "bg-navy text-white hover:bg-navy-dark focus:ring-navy",
  outline: "border-2 border-primary text-primary hover:bg-primary/10 focus:ring-primary",
  ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
};
const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  asChild?: boolean;
  href?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  asChild,
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (asChild && href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
