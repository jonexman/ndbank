import { SectionLayout } from "@/components/SectionLayout";
import { getTranslations } from "next-intl/server";

export default async function CreditsPage() {
  const t = await getTranslations("depositsPage");
  return (
    <SectionLayout
      eyebrow="Credits"
      title="Building digital experiences that matter"
      subtitle="Insured investment accounts with competitive rates."
    >
      <div className="max-w-3xl space-y-6 text-gray-600 mb-10">
        <p>
          This is an insured investment account which pays higher interest and provides check writing
          privileges. You receive monthly statements along with images of your cancelled checks.
        </p>
        <p>
          Money Market Account earns interest when your daily collected balance is $1000 or more.
          Interest is compounded and paid monthly.
        </p>
        <p>
          Our Small Business Checking is the best value for businesses. No minimum balance. Monthly
          fee $10. Up to 100 checks per month with no check fee.
        </p>
      </div>
      <a href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors">
        {t("goToEBanking")}
      </a>
    </SectionLayout>
  );
}
