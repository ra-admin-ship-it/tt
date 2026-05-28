import Link from "next/link";
import { listCompanies, listOwners } from "@/lib/db/repository";
import { PREFECTURE_OPTIONS } from "@/lib/constants";
import type { CompanyFilter } from "@/lib/types";
import type { Product, Status, SubsidyLikelihood } from "@/lib/constants";
import { CompanyListFilters } from "./CompanyListFilters";
import { LikelihoodBadge, StatusBadge, SubsidyFlag } from "@/components/Badge";

export const dynamic = "force-dynamic";

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  function s(k: string) {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  }
  const filter: CompanyFilter = {
    q: s("q") || undefined,
    corporate_number: s("corporate_number") || undefined,
    head_area: s("head_area") || undefined,
    subsidy_flag_only: s("subsidy_flag_only") === "1",
    likelihood: (s("likelihood") as SubsidyLikelihood) || undefined,
    product: (s("product") as Product) || undefined,
    status: (s("status") as Status) || undefined,
    owner: s("owner") || undefined,
  };
  const [companies, owners] = await Promise.all([listCompanies(filter), listOwners()]);

  // 現在のフィルタをCSVエクスポートURLに渡す
  const exportParams = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) {
    if (v === undefined || v === false || v === null || v === "") continue;
    exportParams.set(k, typeof v === "boolean" ? "1" : String(v));
  }
  const exportHref = `/api/companies/export?${exportParams.toString()}`;

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">企業一覧</h1>
          <p className="text-sm text-slate-600">
            登録 {companies.length} 件
          </p>
        </div>
        <div className="flex gap-2">
          <a href={exportHref} className="btn-secondary">
            <span>📤</span>
            <span>CSVエクスポート</span>
          </a>
          <Link href="/companies/new" className="btn-primary">
            <span>＋</span>
            <span>企業を登録</span>
          </Link>
        </div>
      </div>

      <CompanyListFilters
        initial={filter}
        prefectures={Array.from(PREFECTURE_OPTIONS)}
        owners={owners}
      />

      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-th">顧客名</th>
              <th className="table-th">法人番号</th>
              <th className="table-th">本社エリア</th>
              <th className="table-th">従業員数</th>
              <th className="table-th">対象商材</th>
              <th className="table-th">補助金可能性</th>
              <th className="table-th">補助金フラグ</th>
              <th className="table-th">ステータス</th>
              <th className="table-th">担当者</th>
              <th className="table-th">ネクストアクション</th>
              <th className="table-th">次回対応予定日</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {companies.length === 0 && (
              <tr>
                <td className="table-td text-slate-500" colSpan={11}>
                  該当する企業がありません。
                </td>
              </tr>
            )}
            {companies.map((c) => {
              const overdue =
                c.next_action_at &&
                c.next_action_at < new Date().toISOString().slice(0, 10);
              return (
                <tr
                  key={c.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={undefined}
                >
                  <td className="table-td font-medium">
                    <Link href={`/companies/${c.id}`} className="text-brand-700 hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="table-td text-slate-600">
                    {c.corporate_number || "—"}
                  </td>
                  <td className="table-td">{c.head_area || "—"}</td>
                  <td className="table-td">
                    {c.employee_count != null ? c.employee_count.toLocaleString() : "—"}
                  </td>
                  <td className="table-td">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {c.target_products.slice(0, 3).map((p) => (
                        <span key={p} className="badge bg-slate-100 text-slate-700 border-slate-200">{p}</span>
                      ))}
                      {c.target_products.length > 3 && (
                        <span className="text-xs text-slate-500">+{c.target_products.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="table-td"><LikelihoodBadge value={c.subsidy_likelihood} /></td>
                  <td className="table-td"><SubsidyFlag on={c.is_subsidy_flag} /></td>
                  <td className="table-td"><StatusBadge value={c.status} /></td>
                  <td className="table-td">{c.owner || "—"}</td>
                  <td className="table-td max-w-[200px] truncate" title={c.next_action ?? ""}>
                    {c.next_action || "—"}
                  </td>
                  <td className={"table-td " + (overdue ? "text-rose-700 font-semibold" : "")}>
                    {c.next_action_at || "—"}
                    {overdue && <span className="ml-1 text-xs">(期限超過)</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
