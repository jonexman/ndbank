import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default async function ContactPage() {
  const t = await getTranslations("contactPage");
  return (
    <SectionLayout eyebrow={t("eyebrow")} title={t("title")}>
      <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl">
        <div>
          <h3 className="font-semibold text-navy mb-2">{t("address")}</h3>
          <p className="text-gray-600 text-sm">{siteConfig.address}</p>
        </div>
        <div>
          <h3 className="font-semibold text-navy mb-2">{t("phone")}</h3>
          <a href={`tel:${siteConfig.phone}`} className="text-primary hover:underline">
            {siteConfig.phone}
          </a>
        </div>
        <div>
          <h3 className="font-semibold text-navy mb-2">{t("email")}</h3>
          <a href={`mailto:${siteConfig.adminEmail}`} className="text-primary hover:underline">
            {siteConfig.adminEmail}
          </a>
        </div>
      </div>
    </SectionLayout>
  );
}
