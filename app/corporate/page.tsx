import { SectionLayout } from "@/components/SectionLayout";

export default function CorporatePage() {
  return (
    <SectionLayout
      eyebrow="Corporate banking"
      title="Corporate banking"
      subtitle="End-to-end solutions for companies that need reliable day-to-day banking, flexible financing and expert advice."
    >
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        {[
          { title: "Secure financial services", text: "Our relationship managers and digital tools help you address your most pressing money questions." },
          { title: "Good investments", text: "Choose from a range of investment options to put your company's liquidity to work." },
          { title: "Accumulation goals", text: "Keep funds invested, reinvest income and capital gains for long-term growth." },
        ].map((item) => (
          <div
            key={item.title}
            className="group bg-slate-50 rounded-xl p-7 border border-slate-100 hover:border-primary/15 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors" aria-hidden />
            <h3 className="text-lg font-semibold text-navy mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </SectionLayout>
  );
}
