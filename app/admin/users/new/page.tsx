"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";

export default function NewUserPage() {
  const router = useRouter();
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    bankNumber: "",
    balance: "0",
    currency: "USD",
    canTransfer: "true",
    verified: "false",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setStatus({ type: "success", msg: "Users sign up via the dashboard. Use Supabase Admin API for programmatic user creation." });
    setTimeout(() => router.push("/admin/users"), 1500);
  };

  return (
    <div>
      <PageHeader title="Create User" backHref="/admin/users" subtitle="Add a new user" />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          {status && (
            <div
              className={`p-4 rounded-xl text-sm ${
                status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"
              }`}
            >
              {status.msg}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-5">
            <Input
              label="First Name"
              value={form.firstname}
              onChange={(e) => setForm({ ...form, firstname: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={form.lastname}
              onChange={(e) => setForm({ ...form, lastname: e.target.value })}
              required
            />
          </div>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Bank Account Number"
            value={form.bankNumber}
            onChange={(e) => setForm({ ...form, bankNumber: e.target.value })}
            placeholder="e.g. 1043346123"
          />
          <div className="grid sm:grid-cols-2 gap-5">
            <Input
              label="Initial Balance"
              type="number"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
            <Select
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              options={[
                { value: "USD", label: "USD" },
                { value: "GBP", label: "GBP" },
                { value: "EUR", label: "EUR" },
              ]}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label="Can Transfer"
              value={form.canTransfer}
              onChange={(e) => setForm({ ...form, canTransfer: e.target.value })}
              options={[
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
            />
            <Select
              label="Verified"
              value={form.verified}
              onChange={(e) => setForm({ ...form, verified: e.target.value })}
              options={[
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create User</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
