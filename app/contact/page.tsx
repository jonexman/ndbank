import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default function ContactPage() {
  return (
    <SectionLayout
      eyebrow="Contact"
      title="Get in touch"
      subtitle="We are here for you. How can we help?"
    >
      <div className="grid md:grid-cols-3 gap-6">
        <div className="group bg-slate-50 rounded-xl p-7 border border-slate-100 hover:border-primary/15 transition-all">
          <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors text-sm">A</div>
          <h3 className="text-lg font-semibold text-navy mb-2">Address</h3>
          <p className="text-gray-500">{siteConfig.address}</p>
        </div>
        <div className="group bg-slate-50 rounded-xl p-7 border border-slate-100 hover:border-primary/15 transition-all">
          <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors text-sm">@</div>
          <h3 className="text-lg font-semibold text-navy mb-2">Mail Us</h3>
          <a
            href={`mailto:${siteConfig.adminEmail}`}
            className="text-primary font-medium hover:underline"
          >
            {siteConfig.adminEmail}
          </a>
        </div>
        <div className="group bg-slate-50 rounded-xl p-7 border border-slate-100 hover:border-primary/15 transition-all">
          <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors text-sm">T</div>
          <h3 className="text-lg font-semibold text-navy mb-2">Telephone</h3>
          <a href={`tel:${siteConfig.phone}`} className="text-primary font-medium hover:underline">
            {siteConfig.phone}
          </a>
        </div>
      </div>
    </SectionLayout>
  );
}
