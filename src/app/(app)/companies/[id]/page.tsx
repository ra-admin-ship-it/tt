import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, listActivityLogs } from "@/lib/db/repository";
import { LikelihoodBadge, StatusBadge, SubsidyFlag } from "@/components/Badge";
import {
  SCREENING_BADGE_CLASS,
  SUBSIDY_JUDGMENT_BADGE_CLASS,
} from "@/lib/constants";
import { DeleteCompanyButton } from "./DeleteCompanyButton";

export const dynamic = "force-dynamic";

function yen(n: number | null): string {
  if (n == null) return "—";
  return "¥" + n.toLocaleString();
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const c = await getCompany(params.id);
  if (!c) notFound();
  const logs = (await listActivityLogs(c.id)).slice(0, 20);

  function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="grid grid-cols-12 py-2 border-b border-slate-100 last:border-0">
        <dt className="col-span-5 text-sm text-slate-500">{label}</dt>
        <dd className="col-span-7 text-sm text-slate-900 break-words">{children}</dd>
      </div>
    );
  }

  function ChipsRow({ label, values }: { label: string; values: string[] }) {
    return (
      <Row label={label}>
        {values.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {values.map((v) => (
              <span key={v} className="badge bg-slate-100 text-slate-700 border-slate-200">{v}</span>
            ))}
          </div>
        ) : "—"}
      </Row>
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
            <Row label="従業員数">{c.employee_count != null ? c.employee_count.toLocaleString() + " 名" : "—"}</Row>
            <Row label="本社エリア">{c.head_area || "—"}</Row>
            <Row label="郵便番号">{c.postal_code || "—"}</Row>
            <Row label="本社住所">{c.head_address || "—"}</Row>
            <ChipsRow label="現状取引商材" values={c.current_products} />
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">① 雇用関連</h2>
          <dl>
            <Row label="補助金対象判定">
              <span className={"badge " + SUBSIDY_JUDGMENT_BADGE_CLASS[c.subsidy_judgment]}>{c.subsidy_judgment}</span>
            </Row>
            <Row label="常用雇用者有無">{c.permanent_employee}</Row>
            <Row label="常用雇用継続期間">{c.employment_continuation}</Row>
            <ChipsRow label="雇用形態" values={c.employment_types} />
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">② 決算情報</h2>
          <dl>
            <Row label="決算書提出状況">{c.financial_doc_status}</Row>
            <Row label="売上規模区分">{c.revenue_scale || "—"}</Row>
            <Row label="直近期売上高">{yen(c.revenue_recent)}</Row>
            <Row label="前々期売上高">{yen(c.revenue_2periods_ago)}</Row>
            <Row label="3期前売上高">{yen(c.revenue_3periods_ago)}</Row>
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">③ 人件費判定</h2>
          <dl>
            <Row label="決算書上の給与科目有無">{c.salary_account_status}</Row>
            <Row label="給与科目名称">{c.salary_account_name || "—"}</Row>
            <Row label="人件費年間総額">{yen(c.labor_cost_annual)}</Row>
            <Row label="外注費年間総額">{yen(c.outsourcing_cost_annual)}</Row>
            <Row label="人件費判定">{c.labor_cost_judgment || "—"}</Row>
          </dl>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">④ 補助金ニーズ</h2>
          <dl>
            <ChipsRow label="希望補助金種別" values={c.desired_subsidy_types} />
            <Row label="希望補助金額">{yen(c.desired_subsidy_amount)}</Row>
            <Row label="投資予定額">{yen(c.planned_investment_amount)}</Row>
            <ChipsRow label="補助金活用目的" values={c.subsidy_purposes} />
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
          <h2 className="font-semibold mb-3">⑤ スクリーニング結果</h2>
          <dl>
            <Row label="坪田先生 一次判定">
              {c.screening_first_judgment ? (
                <span className={"badge " + SCREENING_BADGE_CLASS[c.screening_first_judgment]}>{c.screening_first_judgment}</span>
              ) : "—"}
            </Row>
            <Row label="補助金提案可否">{c.subsidy_proposal_status || "—"}</Row>
            <Row label="判定理由">
              <p className="whitespace-pre-wrap">{c.judgment_reason || "—"}</p>
            </Row>
          </dl>
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold mb-3">⑥ 商談メモ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">補助金ヒアリングメモ</div>
              <p className="text-sm whitespace-pre-wrap text-slate-800 min-h-[60px]">
                {c.subsidy_hearing_memo || <span className="text-slate-400">（未入力）</span>}
              </p>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">特記事項</div>
              <p className="text-sm whitespace-pre-wrap text-slate-800 min-h-[60px]">
                {c.special_notes || <span className="text-slate-400">（未入力）</span>}
              </p>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">補助金情報（概況）</h2>
          <dl>
            <Row label="補助金フラグ"><SubsidyFlag on={c.is_subsidy_flag} /></Row>
            <Row label="補助金対象可能性"><LikelihoodBadge value={c.subsidy_likelihood} /></Row>
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

        <section className="card p-5 lg:col-span-2">
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
