import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionLayout } from "@/components/SectionLayout";

export default async function CardsPage() {
  const t = await getTranslations("cardsPage");
  const cardTypes = [
    { title: t("debitCard"), desc: t("debitCardDesc") },
    { title: t("creditCard"), desc: t("creditCardDesc") },
    { title: t("prepaidCard"), desc: t("prepaidCardDesc") },
    { title: t("virtualCard"), desc: t("virtualCardDesc") },
    { title: t("masterCard"), desc: t("masterCardDesc") },
    { title: t("visaCard"), desc: t("visaCardDesc") },
  ];

  return (
    <SectionLayout eyebrow={t("eyebrow")} title={t("title")}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {cardTypes.map((c) => (
          <div
            key={c.title}
            className="group bg-slate-50 rounded-xl p-7 border border-slate-100 hover:border-primary/15 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors" aria-hidden />
            <h3 className="text-lg font-semibold text-navy mb-2">{c.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
      <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors">
        {t("applyViaEBanking")}
      </Link>
    </SectionLayout>
  );
}
