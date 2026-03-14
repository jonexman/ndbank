import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default function LoansPage() {
  const loanTypes = [
    "Car Loan",
    "Business Growth Loan",
    "House / Logistics Loan",
    "Contract Execution Loan",
    "Security Grant Loan",
    "Educational Loan",
  ];

  return (
    <SectionLayout
      eyebrow="Loans"
      title={`${siteConfig.title} Loan Profile`}
      subtitle={`${siteConfig.title} makes installment loans at all full-service bank locations.`}
    >
      <div className="max-w-3xl space-y-6 text-gray-600 mb-8">
        <p>
          Auto loans (new or used), recreational vehicles, boats, and leisure vehicles. We also offer
          Personal Loans for dream vacations or emergencies.
        </p>
        <p>
          Loans can fund personal expenses, homes (mortgage), cars (auto), education (student) or
          business. Borrowers submit an application; the bank evaluates and sets terms if approved.
        </p>
      </div>
      <div className="bg-slate-50 rounded-xl p-8 border border-slate-100 max-w-md">
        <h4 className="font-semibold text-navy mb-5 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary rounded-full" />
          Available Loans
        </h4>
        <ul className="space-y-3 text-gray-600">
          {loanTypes.map((loan) => (
            <li key={loan} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              {loan}
            </li>
          ))}
        </ul>
        <a href="/dashboard/loan/apply" className="inline-flex mt-6 font-semibold text-primary hover:underline">
          Apply for a loan →
        </a>
      </div>
    </SectionLayout>
  );
}
