import { NextResponse } from "next/server";
import { createCompany, listCompanies } from "@/lib/db/repository";
import { companyInputSchema } from "@/lib/schema";
import type { CompanyFilter } from "@/lib/types";
import type { Product, Status, SubsidyLikelihood } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const filter: CompanyFilter = {
    q: url.searchParams.get("q") || undefined,
    corporate_number: url.searchParams.get("corporate_number") || undefined,
    head_area: url.searchParams.get("head_area") || undefined,
    subsidy_flag_only: url.searchParams.get("subsidy_flag_only") === "1",
    likelihood: (url.searchParams.get("likelihood") as SubsidyLikelihood) || undefined,
    product: (url.searchParams.get("product") as Product) || undefined,
    status: (url.searchParams.get("status") as Status) || undefined,
    owner: url.searchParams.get("owner") || undefined,
  };
  const list = await listCompanies(filter);
  return NextResponse.json({ companies: list });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = companyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力値が不正です", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const company = await createCompany(parsed.data);
  return NextResponse.json({ company }, { status: 201 });
}
