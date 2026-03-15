import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SectionLayout } from "@/components/SectionLayout";

export default async function PersonalPage() {
  const t = await getTranslations("personalPage");
  return (
    <SectionLayout eyebrow={t("eyebrow")} title={t("title")}>
      <p className="text-gray-600 max-w-2xl mb-8">
        {t("description")}
      </p>
      <Link href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors">
        {t("openAccount")}
      </Link>
    </SectionLayout>
  );
}
