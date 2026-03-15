import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "../lib/siteConfig";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  return (
    <>
      {/* Hero - red */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24 xl:py-28">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 lg:gap-20 items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-4 sm:mb-6">
                {siteConfig.title}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold font-heading leading-[1.15] mb-4 sm:mb-6 text-white">
                {t("heroTitle")}
              </h1>
              <p className="text-white/90 text-base sm:text-lg leading-relaxed max-w-xl mb-8 sm:mb-10">
                {t("heroSubtitle", { title: siteConfig.title })}
              </p>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link
                  href="/dashboard/signup"
                  className="inline-flex items-center justify-center px-5 py-3 sm:px-7 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold bg-white text-primary hover:bg-white/95 transition-colors touch-manipulation"
                >
                  {tCommon("openAccount")}
                </Link>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="inline-flex items-center justify-center px-5 py-3 sm:px-7 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium border border-white/40 text-white hover:bg-white/10 transition-colors touch-manipulation"
                >
                  {tCommon("needHelp")} {siteConfig.phone}
                </a>
              </div>
            </div>
            <aside className="relative bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl text-navy min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-navy">{t("onlineBanking")}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6 sm:mb-8">
                {t("onlineBankingDesc")}
              </p>
              <div className="space-y-5">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-gray-600 text-sm">{t("access24")}</span>
                  <span className="text-base font-semibold text-primary">{t("anytimeAnywhere")}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-gray-600 text-sm">{t("multiCurrency")}</span>
                  <span className="text-base font-semibold text-primary">{t("currencies")}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 text-sm">{t("security")}</span>
                  <span className="text-base font-semibold text-primary">{t("bankGradeEncryption")}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <div className="h-1 bg-primary-dark" aria-hidden />
      </section>

      {/* Banking features */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 sm:gap-6 mb-10 sm:mb-14">
            <div className="min-w-0">
              <p className="text-primary font-semibold text-xs uppercase tracking-[0.2em] mb-2">
                {t("bankingWithEase")}
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy font-heading leading-tight">
                {t("transactionsTitle")}
              </h2>
            </div>
            <p className="text-gray-600 max-w-xl text-sm">
              {t("transactionsSubtitle")}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[
              { badge: t("fxBadge"), title: t("fxTitle"), text: t("fxText") },
              { badge: t("bulkBadge"), title: t("bulkTitle"), text: t("bulkText") },
              { badge: t("secureBadge"), title: t("secureTitle"), text: t("secureText") },
            ].map((item) => (
              <div
                key={item.badge}
                className="group bg-white rounded-xl p-5 sm:p-7 shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  {item.badge}
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to get started */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <p className="text-primary font-semibold text-xs uppercase tracking-[0.2em] mb-2 sm:mb-3">
              {t("bankWithUs")}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-navy font-heading leading-tight">
              {t("convenienceTitle")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {[
              { step: "01", title: t("step1Title", { title: siteConfig.title }), text: t("step1Text") },
              { step: "02", title: t("step2Title"), text: t("step2Text") },
              { step: "03", title: t("step3Title"), text: t("step3Text") },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-slate-50 rounded-xl p-6 sm:p-8 border border-slate-100 hover:border-primary/15 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary text-white font-bold flex items-center justify-center mb-6 group-hover:bg-primary-dark transition-colors">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-navy mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 sm:mt-14 text-center">
            <Link
              href="/dashboard/signup"
              className="inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 rounded-lg text-sm sm:text-base font-semibold bg-primary hover:bg-primary-dark text-white transition-colors touch-manipulation"
            >
              {tCommon("getStarted")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
