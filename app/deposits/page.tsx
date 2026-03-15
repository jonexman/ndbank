import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default async function DepositsPage() {
  const t = await getTranslations("depositsPage");
  const depositTypes = [
    { title: t("currentDeposit"), text: t("currentDepositText") },
    { title: t("savingsDeposit"), text: t("savingsDepositText") },
    { title: t("fixedDeposit"), text: t("fixedDepositText") },
    { title: t("saveiAccount"), text: t("saveiAccountText") },
  ];

  return (
    <SectionLayout eyebrow={t("eyebrow")} title={t("title")}>
      <div className="space-y-4 sm:space-y-6 max-w-3xl mb-8 sm:mb-10">
        {depositTypes.map((item, i) => (
          <div key={i} className="flex gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/15 transition-colors">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">{i + 1}</div>
            <div>
              <h3 className="text-lg font-semibold text-navy mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
        <p className="text-gray-600 mt-8">
          {t("telebankingNote", { title: siteConfig.title })}{" "}
          <a href="/dashboard" className="font-semibold text-primary hover:underline">
            {t("goToEBanking")}
          </a>
        </p>
      </div>
    </SectionLayout>
  );
}
