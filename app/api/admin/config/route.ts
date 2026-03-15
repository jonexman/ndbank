import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin/auth";

const ACCOUNT_TYPES = [
  { id: 1, name: "Savings", code: "SAV", min_balance: 100, description: "Standard savings account" },
  { id: 2, name: "Current", code: "CUR", min_balance: 500, description: "Current/checking account" },
  { id: 3, name: "Premium", code: "PRM", min_balance: 5000, description: "Premium tier account" },
];

const TRANSFER_CODES = [
  { id: 1, code: "IMF", name: "International Monetary Fee", description: "Cross-border transfer fee", rate: 0.01 },
  { id: 2, code: "COT", name: "Commission on Turnover", description: "Transaction commission", rate: 0.005 },
  { id: 3, code: "TAX", name: "Tax", description: "Applicable tax", rate: 0 },
];

const SITE_OPTIONS = [
  { key: "site_title", value: "Alpha Bank" },
  { key: "site_description", value: "E-Banking" },
];

export async function GET() {
  const { authorized } = await requireSuperAdmin();
  if (!authorized) {
    return NextResponse.json({ error: "Super-admin only" }, { status: 403 });
  }

  return NextResponse.json({
    accountTypes: ACCOUNT_TYPES,
    transferCodes: TRANSFER_CODES,
    siteOptions: SITE_OPTIONS,
  });
}
