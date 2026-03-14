"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Input, Select, Button, PageHeader } from "@/components/ui";

export default function EditGatewayPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [data, setData] = useState<{ id: number; name: string; medium: string; network?: string; detail: string } | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    fetch(`/api/admin/gateway/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [id]);

  if (!data) {
    return (
      <div>
        <PageHeader title="Edit Payment Method" backHref="/admin/gateway" subtitle="Loading..." />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "success", msg: "Payment method updated (mock)." });
  };

  return (
    <div>
      <PageHeader title={`Edit: ${data.name}`} backHref="/admin/gateway" subtitle={`ID ${data.id}`} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          {status && (
            <div className="p-4 rounded-xl text-sm bg-emerald-50 text-emerald-800">{status.msg}</div>
          )}
          <Input
            label="Name"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
          />
          <Select
            label="Medium"
            value={data.medium}
            onChange={(e) => setData({ ...data, medium: e.target.value })}
            options={[
              { value: "crypto", label: "Crypto" },
              { value: "bank", label: "Bank" },
            ]}
          />
          <Input
            label="Network"
            value={data.network ?? ""}
            onChange={(e) => setData({ ...data, network: e.target.value })}
          />
          <Input
            label="Detail (JSON)"
            value={data.detail}
            onChange={(e) => setData({ ...data, detail: e.target.value })}
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Link href="/admin/gateway">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
