"use client";

import { useEffect, useState } from "react";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";

export default function ExchangePage() {
  const [currencies, setCurrencies] = useState<{ code: string; name: string; rate: number }[]>([]);
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("GBP");
  const [fromAmount, setFromAmount] = useState("");
  const [result, setResult] = useState<{ expected: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard/exchange")
      .then((r) => r.json())
      .then((d) => setCurrencies(d.currencies ?? []))
      .catch(() => setCurrencies([]));
  }, []);

  const toOptions = currencies.filter((c) => c.code !== fromCurrency);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    const amt = parseFloat(fromAmount);
    if (!amt || amt <= 0) return;
    setLoading(true);
    const res = await fetch("/api/dashboard/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromCurrency, toCurrency, fromAmount: amt }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.exchange) setResult({ expected: data.exchange.expected_amount });
  }

  return (
    <div>
      <PageHeader title="Currency Exchange" backHref="/dashboard" subtitle="Convert between currencies" />
      <Card variant="elevated" className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                min="0"
                required
              />
            </div>
            <div className="w-28">
              <Select
                label="From"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                options={currencies.map((c) => ({ value: c.code, label: c.code }))}
              />
            </div>
          </div>
          <Select
            label="To"
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            options={toOptions.map((c) => ({ value: c.code, label: `${c.code} - ${c.name}` }))}
          />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Processing..." : "Get Quote"}
          </Button>
          {result && (
            <div className="form-alert-success">
              You will receive: <strong>{result.expected.toFixed(2)} {toCurrency}</strong>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
}
