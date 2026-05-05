import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default async function LoansPage() {
  const t = await getTranslations("loansPage");
  const loanTypes = [
    t("carLoan"),
    t("businessGrowthLoan"),
    t("houseLogisticsLoan"),
    t("contractExecutionLoan"),
    t("securityGrantLoan"),
    t("educationalLoan"),
  ];

  return (
    <SectionLayout
      eyebrow={t("eyebrow")}
      title={t("title", { title: siteConfig.title })}
      subtitle={t("subtitle", { title: siteConfig.title })}
    >
      <div className="max-w-3xl space-y-4 sm:space-y-6 text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
        <p>{t("intro1")}</p>
        <p>{t("intro2")}</p>
      </div>
      <div className="bg-slate-50 rounded-xl p-5 sm:p-8 border border-slate-100 max-w-md w-full">
        <h4 className="font-semibold text-navy mb-5 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full" />
          {t("availableLoans")}
        </h4>
        <ul className="space-y-3 text-gray-600">
          {loanTypes.map((loan) => (
            <li key={loan} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              {loan}
            </li>
          ))}
        </ul>
        <a href="/dashboard/loan/apply" className="inline-flex mt-6 font-semibold text-primary hover:underline">
          {t("applyForLoan")}
        </a>
      </div>
    </SectionLayout>
  );
}
