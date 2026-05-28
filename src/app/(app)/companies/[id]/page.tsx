import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, listActivityLogs } from "@/lib/db/repository";
import { LikelihoodBadge, StatusBadge, SubsidyFlag } from "@/components/Badge";
import { DeleteCompanyButton } from "./DeleteCompanyButton";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const c = await getCompany(params.id);
  if (!c) notFound();
  const logs = (await listActivityLogs(c.id)).slice(0, 20);

  function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="grid grid-cols-12 py-2 border-b border-slate-100 last:border-0">
        <dt className="col-span-4 text-sm text-slate-500">{label}</dt>
        <dd className="col-span-8 text-sm text-slate-900 break-words">{children}</dd>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="text-sm text-slate-500 mb-2">
        <Link href="/companies" className="hover:underline">企業一覧</Link>
        <span className="mx-2">/</span>
        <span>{c.name}</span>
      </div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{c.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {c.corporate_number ? `法人番号: ${c.corporate_number}` : "法人番号未登録"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/companies/${c.id}/edit`} className="btn-primary">編集</Link>
          <DeleteCompanyButton id={c.id} name={c.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card p-5">
          <h2 className="font-semibold mb-3">基本情報</h2>
          <dl>
            <Row label="法人番号">{c.corporate_number || "—"}</Row>
            <Row label="顧客名">{c.name}</Row>
            <Row label="従業員数">
              {c.employee_count != null ? c.employee_count.toLocaleString() + " 名" : "—"}
            </Row>
            <Row label="本社エリア">{c.head_area || "—"}</Row>
            <Row label="郵便番号">{c.postal_code || "—"}</Row>
            <Row label="本社住所">{c.head_address || "—"}</Row>
            <Row label="現状取引商材">
              {c.current_products.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {c.current_products.map((p) => (
                    <span key={p} className="badge bg-slate-100 text-slate-700 border-slate-200">{p}</span>
                  ))}
                </div>
              ) : "—"}
            </Row>
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">補助金情報</h2>
          <dl>
            <Row label="補助金フラグ"><SubsidyFlag on={c.is_subsidy_flag} /></Row>
            <Row label="補助金対象可能性"><LikelihoodBadge value={c.subsidy_likelihood} /></Row>
            <Row label="対象になりそうな商材">
              {c.target_products.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {c.target_products.map((p) => (
                    <span key={p} className="badge bg-brand-50 text-brand-800 border-brand-200">{p}</span>
                  ))}
                </div>
              ) : "—"}
            </Row>
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">対応情報</h2>
          <dl>
            <Row label="ステータス"><StatusBadge value={c.status} /></Row>
            <Row label="担当者">{c.owner || "—"}</Row>
            <Row label="ネクストアクション">{c.next_action || "—"}</Row>
            <Row label="最終接触日">{c.last_contact_at || "—"}</Row>
            <Row label="次回対応予定日">{c.next_action_at || "—"}</Row>
            <Row label="HubSpot会社ID">{c.hubspot_company_id || "—"}</Row>
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">メモ</h2>
          <p className="text-sm whitespace-pre-wrap text-slate-800 min-h-[80px]">
            {c.memo || <span className="text-slate-400">（未入力）</span>}
          </p>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold mb-3">アクティビティ</h2>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">アクティビティはまだありません。</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((l) => (
                <li key={l.id} className="text-sm flex gap-3">
                  <span className="text-slate-400 shrink-0 w-44">
                    {new Date(l.created_at).toLocaleString("ja-JP")}
                  </span>
                  <span className="badge bg-slate-100 text-slate-700 border-slate-200">{l.action}</span>
                  <span>{l.detail}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5 lg:col-span-2 text-xs text-slate-500">
          <div>登録日: {new Date(c.created_at).toLocaleString("ja-JP")}</div>
          <div>更新日: {new Date(c.updated_at).toLocaleString("ja-JP")}</div>
        </section>
      </div>
    </div>
  );
}
