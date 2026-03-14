import Link from "next/link";
import { SectionLayout } from "@/components/SectionLayout";

export default function CardsPage() {
  const cardTypes = [
    { title: "Debit Card", desc: "Amount is directly deducted from your linked bank account." },
    { title: "Credit Card", desc: "Comes with a predetermined credit limit based on your credit history and income." },
    { title: "Prepaid Card", desc: "Use funds you've already loaded onto the card." },
    { title: "Virtual Card", desc: "Designed for online and card-not-present transactions." },
    { title: "Master Card", desc: "A global payment network facilitating electronic funds transfers." },
    { title: "Visa Card", desc: "Visa operates an extensive payment network for secure electronic transactions." },
  ];

  return (
    <SectionLayout eyebrow="Cards Payments" title="Card Services">
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
        Apply for a card via E-Banking
      </Link>
    </SectionLayout>
  );
}
