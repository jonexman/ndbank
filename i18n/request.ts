import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale) {
    const store = await cookies();
    locale = (store.get("NEXT_LOCALE")?.value as "en" | "ar") || routing.defaultLocale;
  }
  if (!routing.locales.includes(locale as "en" | "ar")) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: "Africa/Dakar",
    now: new Date(),
  };
});
