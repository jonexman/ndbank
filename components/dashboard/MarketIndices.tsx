"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type IndexItem = {
  symbol: string;
  name: string;
  description: string;
  price: number;
  change: number;
  changePercent: number;
  live: boolean;
};

export function MarketIndices() {
  const t = useTranslations("clientDashboard");
  const [indices, setIndices] = useState<IndexItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/indices")
      .then((r) => r.json())
      .then((d) => setIndices(d.indices ?? []))
      .catch(() => setIndices([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-navy font-heading mb-4">{t("marketIndices")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (indices.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="text-lg font-semibold text-navy font-heading mb-4">{t("marketIndices")}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {indices.map((idx) => (
          <div
            key={idx.symbol}
            className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate" title={idx.description}>
              {idx.name}
            </p>
            <p className="text-lg font-bold text-navy font-heading mt-0.5">
              {idx.live && idx.price > 0
                ? idx.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "—"}
            </p>
            {idx.live && idx.price > 0 && (
              <p
                className={`text-sm font-medium mt-1 ${
                  idx.change >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {idx.change >= 0 ? "+" : ""}
                {idx.change.toFixed(2)} ({idx.changePercent >= 0 ? "+" : ""}
                {idx.changePercent.toFixed(2)}%)
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
