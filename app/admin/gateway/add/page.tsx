"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";

export default function AddGatewayPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    medium: "crypto",
    network: "",
    detail: "{}",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "success", msg: "Payment method added (mock)." });
    setTimeout(() => router.push("/admin/gateway"), 1500);
  };

  return (
    <div>
      <PageHeader title="Add Payment Method" backHref="/admin/gateway" subtitle="Add a new gateway payment method" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          {status && (
            <div className="p-4 rounded-xl text-sm bg-emerald-50 text-emerald-800">{status.msg}</div>
          )}
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Bitcoin"
            required
          />
          <Select
            label="Medium"
            value={form.medium}
            onChange={(e) => setForm({ ...form, medium: e.target.value })}
            options={[
              { value: "crypto", label: "Crypto" },
              { value: "bank", label: "Bank" },
            ]}
          />
          <Input
            label="Network (optional)"
            value={form.network}
            onChange={(e) => setForm({ ...form, network: e.target.value })}
            placeholder="e.g. BTC"
          />
          <Input
            label="Detail (JSON)"
            value={form.detail}
            onChange={(e) => setForm({ ...form, detail: e.target.value })}
            placeholder='{"wallet":"..."}'
          />
          <div className="flex gap-2">
            <Button type="submit">Add</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
