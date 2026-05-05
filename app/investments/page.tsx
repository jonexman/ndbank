import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default function InvestmentsPage() {
  const products = [
    "Asset Management",
    "Issuing House (Capital Raising)",
    "Business & Financial Advisory",
    "Export Financing",
    "Project Finance",
  ];

  return (
    <SectionLayout
      eyebrow="Investments Growth"
      title={`${siteConfig.title} Investments`}
      subtitle="Investment group delivers a wide range of investment products and services."
    >
      <div className="max-w-3xl space-y-6 text-gray-600 mb-10">
        <div>
          <p className="font-semibold text-navy mb-2">Products & Services</p>
          <ul className="space-y-1 list-disc list-inside">
            {products.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <p>
          <strong>Asset Management:</strong> Portfolio management for private individuals and
          institutional investors. Minimum initial deposit $500,000.
        </p>
        <p>
          <strong>Benefits:</strong> Optimum growth, liquidity, preservation of value, flexible
          subscription, quarterly reports, confidentiality, bridge finance up to 70%, safety.
        </p>
      </div>
      <a href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors">
        Explore investments
      </a>
    </SectionLayout>
  );
}
