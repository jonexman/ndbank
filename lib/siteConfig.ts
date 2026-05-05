/** Used for `<title>`, Open Graph, footer, and on-page brand. Override at build time if needed (e.g. Netlify env). */
const siteTitle =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_NAME?.trim()
    ? process.env.NEXT_PUBLIC_SITE_NAME.trim()
    : "Monzo UK";

export const siteConfig = {
  title: siteTitle,
  description:
    "Digital banking platform for secure payments, deposits, loans and investment services.",
  phone: "+44 800 123 4567",
  address: "United Kingdom",
  adminEmail: "support@monzobankuk.example",
  icon: "/logo.png"
} as const satisfies {
  title: string;
  description: string;
  phone: string;
  address: string;
  adminEmail: string;
  icon: string;
};

