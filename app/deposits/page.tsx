import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default function DepositsPage() {
  const depositTypes = [
    {
      title: "Current Deposit",
      text: "Current account is safer, more flexible and suitable for personal and business purposes. Withdraw or transfer by cheque with unlimited amount.",
    },
    {
      title: "Savings Deposit",
      text: "Savings account is convenient for daily transactions, deposits, withdrawals and fund transfers.",
    },
    {
      title: "Fixed Deposit",
      text: "Fixed deposit is safer, more attractive and suitable for longer-term high-yield deposit redeemed on maturity date.",
    },
    {
      title: "Save-i Account",
      text: "Save-i account ties savings or fixed deposit to special insurance for accidental coverage.",
    },
  ];

  return (
    <SectionLayout eyebrow="Deposits" title="Deposit Options">
      <div className="space-y-6 max-w-3xl mb-10">
        {depositTypes.map((item, i) => (
          <div key={item.title} className="flex gap-4 p-6 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/15 transition-colors">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">{i + 1}</div>
            <div>
              <h3 className="text-lg font-semibold text-navy mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.text}</p>
            </div>
          </div>
        ))}
        <p className="text-gray-600 mt-8">
          For urgent banking or inquiries, {siteConfig.title} offers Tele-banking 24/7.{" "}
          <a href="/dashboard" className="font-semibold text-primary hover:underline">
            Go to E-Banking
          </a>
        </p>
      </div>
    </SectionLayout>
  );
}
