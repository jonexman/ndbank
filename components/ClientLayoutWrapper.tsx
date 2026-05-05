"use client";

import { usePathname } from "next/navigation";
import { MainLayout } from "./MainLayout";
import { ReactNode } from "react";

export function ClientLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // No public header/footer for admin or dashboard (client panel)
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) return <>{children}</>;
  return <MainLayout>{children}</MainLayout>;
}
