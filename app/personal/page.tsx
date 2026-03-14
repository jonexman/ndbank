import { siteConfig } from "@/lib/siteConfig";
import { SectionLayout } from "@/components/SectionLayout";

export default function PersonalPage() {
  return (
    <SectionLayout
      eyebrow="Personal / Private Banking"
      title="Our Personal Checking Account"
    >
      <div className="max-w-3xl space-y-5 text-gray-600 mb-14">
        <p>
          Anyone who opens a personal checking account may apply for a free CheckCard. It works like
          a check anywhere VISA is accepted, and serves as an ATM card at any affiliated terminal.
        </p>
        <p>
          There is no fee for withdrawals at our ATMs. No charge or annual fee for using the
          CheckCard. All purchases are identified on your monthly statement.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: "Secure financial services", text: "Whether you're facing retirement or looking to better understand investment ideas, we can help." },
          { title: "Good investments", text: "If you're not sure the best place to park your money long-term, we have investment options." },
          { title: "Accumulation goals", text: "The goal is to keep funds invested, reinvest income and capital gains." },
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
      <div className="mt-12">
        <a
          href="/dashboard/signup"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors"
        >
          Open an account
        </a>
      </div>
    </SectionLayout>
  );
}
