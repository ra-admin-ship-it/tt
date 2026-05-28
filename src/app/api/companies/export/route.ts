import { listCompanies } from "@/lib/db/repository";
import { companiesToCsv } from "@/lib/csv";
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
  const companies = await listCompanies(filter);
  const csv = companiesToCsv(companies);
  const filename = `companies_${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
