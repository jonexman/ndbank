"use client";

import { useEffect, ReactNode } from "react";

export function HtmlLangDir({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  }, [locale]);
  return <>{children}</>;
}
