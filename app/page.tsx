import Link from "next/link";
import { siteConfig } from "../lib/siteConfig";

export default function HomePage() {
  return (
    <>
      {/* Hero - red */}
      <section className="relative bg-gradient-to-br from-primary-dark via-primary to-primary-light text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6">
                {siteConfig.title}
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-[3.25rem] font-bold font-heading leading-[1.15] mb-6 text-white">
                Bank with confidence, harvest the rewards
              </h1>
              <p className="text-white/90 text-lg leading-relaxed max-w-xl mb-10">
                Mutual fund from {siteConfig.title} Asset Management that invests in corporate
                bonds in dollars, euros and pounds, helping you grow your money securely.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/dashboard/signup"
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg font-semibold bg-white text-primary hover:bg-white/95 transition-colors"
                >
                  Open An Account
                </Link>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="inline-flex items-center justify-center px-7 py-3.5 rounded-lg font-medium border border-white/40 text-white hover:bg-white/10 transition-colors"
                >
                  Need help? Call {siteConfig.phone}
                </a>
              </div>
            </div>
            <aside className="relative bg-white rounded-2xl p-8 lg:p-10 shadow-xl text-navy">
              <h3 className="text-xl font-semibold mb-3 text-navy">Online & mobile banking</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                Secure access to all your accounts, payments and investments in a single place.
              </p>
              <div className="space-y-5">
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-gray-600 text-sm">24/7 access</span>
                  <span className="text-base font-semibold text-primary">Anytime, anywhere</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-200">
                  <span className="text-gray-600 text-sm">Multi-currency</span>
                  <span className="text-base font-semibold text-primary">USD, EUR, XOF</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 text-sm">Security</span>
                  <span className="text-base font-semibold text-primary">Bank-grade encryption</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <div className="h-1 bg-primary-dark" aria-hidden />
      </section>

      {/* Banking features */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-primary font-semibold text-xs uppercase tracking-[0.2em] mb-2">
                Banking with ease
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-navy font-heading">
                Make your online transactions safely
              </h2>
            </div>
            <p className="text-gray-600 max-w-xl text-sm">
              Find out what to look out for when transacting online and how we keep you safe.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { badge: "FX", title: "Online FX conversion", text: "Convert between major currencies instantly with transparent, real-time rates." },
              { badge: "Bulk", title: "Bulk payments", text: "Pay salaries, suppliers and partners in one go, with full control and tracking." },
              { badge: "Secure", title: "Privacy & security", text: "Multi-factor authentication, encryption and continuous monitoring." },
            ].map((item) => (
              <div
                key={item.badge}
                className="group bg-white rounded-xl p-7 shadow-sm border border-slate-200/80 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary font-bold flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  {item.badge}
                </div>
                <h3 className="text-lg font-semibold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to get started */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-primary font-semibold text-xs uppercase tracking-[0.2em] mb-3">
              Bank with us
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-navy font-heading">
              For convenience in the digital age
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
            {[
              { step: "01", title: `Come to ${siteConfig.title}`, text: "Open your first account, get your debit card and access codes straight from your mobile." },
              { step: "02", title: "Log in to web banking", text: "Get full control of your transactions and products from your computer." },
              { step: "03", title: "Get a quick loan", text: "Secure a consumer loan of up to $10,000 online with a fully digital application." },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-slate-50 rounded-xl p-8 border border-slate-100 hover:border-primary/15 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary text-white font-bold flex items-center justify-center mb-6 group-hover:bg-primary-dark transition-colors">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-navy mb-3">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Link
              href="/dashboard/signup"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg font-semibold bg-primary hover:bg-primary-dark text-white transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
