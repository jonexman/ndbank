import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default function InsurancePage() {
  return (
    <SectionLayout
      eyebrow="Insurance"
      title="You can insure everything"
      subtitle="Protect your home, possessions and lifestyle."
    >
      <div className="max-w-3xl space-y-6 text-gray-600 mb-10">
        <p>
          Home Insurance to suit your home and lifestyle. Choose from extra options for the right
          level of cover to protect your home, possessions and lifestyle.
        </p>
        <p>
          Money Market Account earns interest when your daily balance is $1000 or more. Interest is
          compounded and paid monthly. Minimum opening deposit $1000 at your nearest {siteConfig.title}{" "}
          location.
        </p>
        <p>
          Our Small Business Checking: no minimum balance, $10 monthly fee, up to 100 checks per
          month with no check fee.
        </p>
      </div>
      <a href="/dashboard" className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors">
        Get a quote
      </a>
    </SectionLayout>
  );
}
