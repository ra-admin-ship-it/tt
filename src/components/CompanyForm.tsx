"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DESIRED_SUBSIDY_TYPE_OPTIONS,
  EMPLOYMENT_CONTINUATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FINANCIAL_DOC_OPTIONS,
  LABOR_COST_JUDGMENT_OPTIONS,
  PERMANENT_EMPLOYEE_OPTIONS,
  PREFECTURE_OPTIONS,
  PRODUCT_OPTIONS,
  REVENUE_SCALE_OPTIONS,
  SALARY_ACCOUNT_OPTIONS,
  SCREENING_FIRST_JUDGMENT_OPTIONS,
  STATUS_OPTIONS,
  SUBSIDY_JUDGMENT_OPTIONS,
  SUBSIDY_LIKELIHOOD_OPTIONS,
  SUBSIDY_PROPOSAL_OPTIONS,
  SUBSIDY_PURPOSE_OPTIONS,
  type DesiredSubsidyType,
  type EmploymentContinuation,
  type EmploymentType,
  type FinancialDocStatus,
  type LaborCostJudgment,
  type PermanentEmployee,
  type Product,
  type RevenueScale,
  type SalaryAccountStatus,
  type ScreeningFirstJudgment,
  type Status,
  type SubsidyJudgment,
  type SubsidyLikelihood,
  type SubsidyProposalStatus,
  type SubsidyPurpose,
} from "@/lib/constants";
import type { Company } from "@/lib/types";

type FormState = {
  // 基本
  corporate_number: string;
  name: string;
  employee_count: string;
  head_area: string;
  head_address: string;
  postal_code: string;
  current_products: Product[];

  // 旧・補助金
  is_subsidy_flag: boolean;
  subsidy_likelihood: SubsidyLikelihood;
  target_products: Product[];

  // ①
  subsidy_judgment: SubsidyJudgment;
  permanent_employee: PermanentEmployee;
  employment_continuation: EmploymentContinuation;
  employment_types: EmploymentType[];

  // ②
  financial_doc_status: FinancialDocStatus;
  revenue_recent: string;
  revenue_2periods_ago: string;
  revenue_3periods_ago: string;
  revenue_scale: RevenueScale | "";

  // ③
  salary_account_status: SalaryAccountStatus;
  salary_account_name: string;
  labor_cost_annual: string;
  outsourcing_cost_annual: string;
  labor_cost_judgment: LaborCostJudgment | "";

  // ④
  desired_subsidy_types: DesiredSubsidyType[];
  desired_subsidy_amount: string;
  planned_investment_amount: string;
  subsidy_purposes: SubsidyPurpose[];

  // ⑤
  screening_first_judgment: ScreeningFirstJudgment | "";
  judgment_reason: string;
  subsidy_proposal_status: SubsidyProposalStatus | "";
  proposal_owner: string;

  // ⑥
  subsidy_hearing_memo: string;
  special_notes: string;

  // 既存・対応情報
  next_action: string;
  owner: string;
  status: Status;
  memo: string;
  last_contact_at: string;
  next_action_at: string;
  hubspot_company_id: string;
};

function n2s(v: number | null | undefined): string {
  return v == null ? "" : String(v);
}
function s2n(v: string): number | null {
  const t = v.replace(/[,，\s]/g, "");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function toForm(c?: Company | null): FormState {
  return {
    corporate_number: c?.corporate_number ?? "",
    name: c?.name ?? "",
    employee_count: n2s(c?.employee_count),
    head_area: c?.head_area ?? "",
    head_address: c?.head_address ?? "",
    postal_code: c?.postal_code ?? "",
    current_products: c?.current_products ?? [],

    is_subsidy_flag: c?.is_subsidy_flag ?? false,
    subsidy_likelihood: c?.subsidy_likelihood ?? "未確認",
    target_products: c?.target_products ?? [],

    subsidy_judgment: c?.subsidy_judgment ?? "未確認",
    permanent_employee: c?.permanent_employee ?? "不明",
    employment_continuation: c?.employment_continuation ?? "不明",
    employment_types: c?.employment_types ?? [],

    financial_doc_status: c?.financial_doc_status ?? "未依頼",
    revenue_recent: n2s(c?.revenue_recent),
    revenue_2periods_ago: n2s(c?.revenue_2periods_ago),
    revenue_3periods_ago: n2s(c?.revenue_3periods_ago),
    revenue_scale: c?.revenue_scale ?? "",

    salary_account_status: c?.salary_account_status ?? "未確認",
    salary_account_name: c?.salary_account_name ?? "",
    labor_cost_annual: n2s(c?.labor_cost_annual),
    outsourcing_cost_annual: n2s(c?.outsourcing_cost_annual),
    labor_cost_judgment: c?.labor_cost_judgment ?? "",

    desired_subsidy_types: c?.desired_subsidy_types ?? [],
    desired_subsidy_amount: n2s(c?.desired_subsidy_amount),
    planned_investment_amount: n2s(c?.planned_investment_amount),
    subsidy_purposes: c?.subsidy_purposes ?? [],

    screening_first_judgment: c?.screening_first_judgment ?? "",
    judgment_reason: c?.judgment_reason ?? "",
    subsidy_proposal_status: c?.subsidy_proposal_status ?? "",
    proposal_owner: c?.proposal_owner ?? "",

    subsidy_hearing_memo: c?.subsidy_hearing_memo ?? "",
    special_notes: c?.special_notes ?? "",

    next_action: c?.next_action ?? "",
    owner: c?.owner ?? "",
    status: c?.status ?? "未対応",
    memo: c?.memo ?? "",
    last_contact_at: c?.last_contact_at ?? "",
    next_action_at: c?.next_action_at ?? "",
    hubspot_company_id: c?.hubspot_company_id ?? "",
  };
}

function toPayload(s: FormState) {
  return {
    corporate_number: s.corporate_number.trim() || null,
    name: s.name.trim(),
    employee_count: s2n(s.employee_count),
    head_area: s.head_area || null,
    head_address: s.head_address.trim() || null,
    postal_code: s.postal_code.trim() || null,
    current_products: s.current_products,

    is_subsidy_flag: s.is_subsidy_flag,
    subsidy_likelihood: s.subsidy_likelihood,
    target_products: s.target_products,

    subsidy_judgment: s.subsidy_judgment,
    permanent_employee: s.permanent_employee,
    employment_continuation: s.employment_continuation,
    employment_types: s.employment_types,

    financial_doc_status: s.financial_doc_status,
    revenue_recent: s2n(s.revenue_recent),
    revenue_2periods_ago: s2n(s.revenue_2periods_ago),
    revenue_3periods_ago: s2n(s.revenue_3periods_ago),
    revenue_scale: s.revenue_scale || null,

    salary_account_status: s.salary_account_status,
    salary_account_name: s.salary_account_name.trim() || null,
    labor_cost_annual: s2n(s.labor_cost_annual),
    outsourcing_cost_annual: s2n(s.outsourcing_cost_annual),
    labor_cost_judgment: s.labor_cost_judgment || null,

    desired_subsidy_types: s.desired_subsidy_types,
    desired_subsidy_amount: s2n(s.desired_subsidy_amount),
    planned_investment_amount: s2n(s.planned_investment_amount),
    subsidy_purposes: s.subsidy_purposes,

    screening_first_judgment: s.screening_first_judgment || null,
    judgment_reason: s.judgment_reason || null,
    subsidy_proposal_status: s.subsidy_proposal_status || null,
    proposal_owner: s.proposal_owner.trim() || null,

    subsidy_hearing_memo: s.subsidy_hearing_memo || null,
    special_notes: s.special_notes || null,

    next_action: s.next_action.trim() || null,
    owner: s.owner.trim() || null,
    status: s.status,
    memo: s.memo || null,
    last_contact_at: s.last_contact_at || null,
    next_action_at: s.next_action_at || null,
    hubspot_company_id: s.hubspot_company_id.trim() || null,
  };
}

export function CompanyForm({
  initial,
  mode,
}: {
  initial?: Company | null;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [state, setState] = useState<FormState>(toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [houjinLoading, setHoujinLoading] = useState(false);
  const [houjinMsg, setHoujinMsg] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function toggleInArray<T extends string>(
    field: keyof FormState,
    value: T
  ) {
    setState((s) => {
      const arr = s[field] as unknown as T[];
      const set = new Set(arr);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...s, [field]: Array.from(set) as any };
    });
  }

  async function fetchHoujin() {
    const number = state.corporate_number.replace(/[^0-9]/g, "");
    setHoujinMsg(null);
    if (number.length !== 13) {
      setHoujinMsg("法人番号は13桁の数字で入力してください");
      return;
    }
    setHoujinLoading(true);
    try {
      const res = await fetch(`/api/houjin?number=${number}`);
      const data = await res.json();
      if (!res.ok) {
        setHoujinMsg(data?.error || "取得に失敗しました（手入力で登録できます）");
        return;
      }
      setState((s) => ({
        ...s,
        corporate_number: data.corporate_number,
        name: data.name || s.name,
        head_area: data.prefecture || s.head_area,
        head_address: data.address || s.head_address,
        postal_code: data.postal_code || s.postal_code,
      }));
      setHoujinMsg("会社情報を取得しました");
    } catch {
      setHoujinMsg("通信エラーが発生しました（手入力で登録できます）");
    } finally {
      setHoujinLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!state.name.trim()) {
      setError("顧客名は必須です");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const payload = toPayload(state);
      const url =
        mode === "create" ? "/api/companies" : `/api/companies/${initial!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "保存に失敗しました");
        setSaving(false);
        return;
      }
      const id = data.company.id;
      router.replace(`/companies/${id}`);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 基本情報 */}
      <Section title="基本情報">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="label">法人番号</label>
            <div className="flex gap-2">
              <input
                className="input"
                value={state.corporate_number}
                onChange={(e) => update("corporate_number", e.target.value)}
                placeholder="13桁の数字"
                inputMode="numeric"
              />
              <button
                type="button"
                className="btn-secondary shrink-0"
                onClick={fetchHoujin}
                disabled={houjinLoading}
              >
                {houjinLoading ? "取得中..." : "会社情報を取得"}
              </button>
            </div>
            {houjinMsg && <p className="mt-1 text-xs text-slate-600">{houjinMsg}</p>}
          </div>
          <div>
            <label className="label">郵便番号</label>
            <input className="input" value={state.postal_code} onChange={(e) => update("postal_code", e.target.value)} placeholder="100-0001" />
          </div>
          <div className="md:col-span-2">
            <label className="label">顧客名 <span className="text-rose-600">*</span></label>
            <input className="input" value={state.name} onChange={(e) => update("name", e.target.value)} required />
          </div>
          <div>
            <label className="label">本社エリア</label>
            <select className="input" value={state.head_area} onChange={(e) => update("head_area", e.target.value)}>
              <option value="">未選択</option>
              {PREFECTURE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="label">本社住所</label>
            <input className="input" value={state.head_address} onChange={(e) => update("head_address", e.target.value)} />
          </div>
          <div className="md:col-span-3">
            <label className="label">現状取引商材（複数選択可）</label>
            <ChipSelector options={PRODUCT_OPTIONS} selected={state.current_products} onToggle={(v) => toggleInArray<Product>("current_products", v)} />
          </div>
        </div>
      </Section>

      {/* ① 雇用関連 */}
      <Section title="① 雇用関連">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">補助金対象判定（自動更新用）</label>
            <select className="input" value={state.subsidy_judgment} onChange={(e) => update("subsidy_judgment", e.target.value as SubsidyJudgment)}>
              {SUBSIDY_JUDGMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">常用雇用者有無</label>
            <select className="input" value={state.permanent_employee} onChange={(e) => update("permanent_employee", e.target.value as PermanentEmployee)}>
              {PERMANENT_EMPLOYEE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">常用雇用継続期間</label>
            <select className="input" value={state.employment_continuation} onChange={(e) => update("employment_continuation", e.target.value as EmploymentContinuation)}>
              {EMPLOYMENT_CONTINUATION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">従業員数</label>
            <input type="number" min={0} className="input" value={state.employee_count} onChange={(e) => update("employee_count", e.target.value)} placeholder="例：5" />
          </div>
          <div className="md:col-span-3">
            <label className="label">雇用形態（複数選択可）</label>
            <ChipSelector options={EMPLOYMENT_TYPE_OPTIONS} selected={state.employment_types} onToggle={(v) => toggleInArray<EmploymentType>("employment_types", v)} />
          </div>
        </div>
      </Section>

      {/* ② 決算情報 */}
      <Section title="② 決算情報">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">決算書提出状況</label>
            <select className="input" value={state.financial_doc_status} onChange={(e) => update("financial_doc_status", e.target.value as FinancialDocStatus)}>
              {FINANCIAL_DOC_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">売上規模区分（自動計算推奨）</label>
            <select className="input" value={state.revenue_scale} onChange={(e) => update("revenue_scale", e.target.value as RevenueScale | "")}>
              <option value="">未選択</option>
              {REVENUE_SCALE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div></div>
          <CurrencyField label="直近期売上高（円）" value={state.revenue_recent} onChange={(v) => update("revenue_recent", v)} />
          <CurrencyField label="前々期売上高（円）" value={state.revenue_2periods_ago} onChange={(v) => update("revenue_2periods_ago", v)} />
          <CurrencyField label="3期前売上高（円）" value={state.revenue_3periods_ago} onChange={(v) => update("revenue_3periods_ago", v)} />
        </div>
      </Section>

      {/* ③ 人件費判定 */}
      <Section title="③ 人件費判定">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">決算書上の給与科目有無</label>
            <select className="input" value={state.salary_account_status} onChange={(e) => update("salary_account_status", e.target.value as SalaryAccountStatus)}>
              {SALARY_ACCOUNT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">給与科目名称</label>
            <input className="input" value={state.salary_account_name} onChange={(e) => update("salary_account_name", e.target.value)} placeholder="例：給与手当 / 従業員給与 / 給料賃金" />
          </div>
          <CurrencyField label="人件費年間総額（円）" value={state.labor_cost_annual} onChange={(v) => update("labor_cost_annual", v)} />
          <CurrencyField label="外注費年間総額（円）" value={state.outsourcing_cost_annual} onChange={(v) => update("outsourcing_cost_annual", v)} />
          <div>
            <label className="label">人件費判定</label>
            <select className="input" value={state.labor_cost_judgment} onChange={(e) => update("labor_cost_judgment", e.target.value as LaborCostJudgment | "")}>
              <option value="">未選択</option>
              {LABOR_COST_JUDGMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">※補助金スクリーニングで重要</p>
          </div>
        </div>
      </Section>

      {/* ④ 補助金ニーズ */}
      <Section title="④ 補助金ニーズ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <label className="label">希望補助金種別（複数選択可）</label>
            <ChipSelector options={DESIRED_SUBSIDY_TYPE_OPTIONS} selected={state.desired_subsidy_types} onToggle={(v) => toggleInArray<DesiredSubsidyType>("desired_subsidy_types", v)} />
          </div>
          <CurrencyField label="希望補助金額（円）" value={state.desired_subsidy_amount} onChange={(v) => update("desired_subsidy_amount", v)} />
          <CurrencyField label="投資予定額（円）" value={state.planned_investment_amount} onChange={(v) => update("planned_investment_amount", v)} />
          <div></div>
          <div className="md:col-span-3">
            <label className="label">補助金活用目的（複数選択可）</label>
            <ChipSelector options={SUBSIDY_PURPOSE_OPTIONS} selected={state.subsidy_purposes} onToggle={(v) => toggleInArray<SubsidyPurpose>("subsidy_purposes", v)} />
          </div>
          <div className="md:col-span-3">
            <label className="label">対象になりそうな商材（複数選択可）</label>
            <ChipSelector options={PRODUCT_OPTIONS} selected={state.target_products} onToggle={(v) => toggleInArray<Product>("target_products", v)} />
          </div>
        </div>
      </Section>

      {/* ⑤ スクリーニング結果 */}
      <Section title="⑤ スクリーニング結果">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">坪田先生 一次判定</label>
            <select className="input" value={state.screening_first_judgment} onChange={(e) => update("screening_first_judgment", e.target.value as ScreeningFirstJudgment | "")}>
              <option value="">未判定</option>
              {SCREENING_FIRST_JUDGMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">補助金提案可否</label>
            <select className="input" value={state.subsidy_proposal_status} onChange={(e) => update("subsidy_proposal_status", e.target.value as SubsidyProposalStatus | "")}>
              <option value="">未選択</option>
              {SUBSIDY_PROPOSAL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">提案担当者</label>
            <input className="input" value={state.proposal_owner} onChange={(e) => update("proposal_owner", e.target.value)} placeholder="氏名" />
          </div>
          <div className="md:col-span-3">
            <label className="label">判定理由</label>
            <textarea className="input min-h-[100px]" value={state.judgment_reason} onChange={(e) => update("judgment_reason", e.target.value)} placeholder="判定の根拠を記入" />
          </div>
        </div>
      </Section>

      {/* ⑥ 商談メモ */}
      <Section title="⑥ 商談メモ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">補助金ヒアリングメモ</label>
            <textarea className="input min-h-[140px]" value={state.subsidy_hearing_memo} onChange={(e) => update("subsidy_hearing_memo", e.target.value)} placeholder="補助金関連のヒアリング内容" />
          </div>
          <div>
            <label className="label">特記事項</label>
            <textarea className="input min-h-[140px]" value={state.special_notes} onChange={(e) => update("special_notes", e.target.value)} placeholder="その他の特記事項" />
          </div>
        </div>
      </Section>

      {/* 既存・補助金情報（概況） */}
      <Section title="補助金情報（概況）">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input id="subsidy_flag" type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={state.is_subsidy_flag} onChange={(e) => update("is_subsidy_flag", e.target.checked)} />
            <label htmlFor="subsidy_flag" className="text-sm font-medium">補助金フラグ</label>
          </div>
          <div>
            <label className="label">補助金対象可能性</label>
            <select className="input" value={state.subsidy_likelihood} onChange={(e) => update("subsidy_likelihood", e.target.value as SubsidyLikelihood)}>
              {SUBSIDY_LIKELIHOOD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </Section>

      {/* 対応情報 */}
      <Section title="対応情報">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">ステータス</label>
            <select className="input" value={state.status} onChange={(e) => update("status", e.target.value as Status)}>
              {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="label">担当者</label>
            <input className="input" value={state.owner} onChange={(e) => update("owner", e.target.value)} placeholder="氏名" />
          </div>
          <div>
            <label className="label">HubSpot会社ID</label>
            <input className="input" value={state.hubspot_company_id} onChange={(e) => update("hubspot_company_id", e.target.value)} placeholder="（将来連携用）" />
          </div>
          <div className="md:col-span-3">
            <label className="label">ネクストアクション</label>
            <input className="input" value={state.next_action} onChange={(e) => update("next_action", e.target.value)} placeholder="例：来週セミナー案内を送付" />
          </div>
          <div>
            <label className="label">最終接触日</label>
            <input type="date" className="input" value={state.last_contact_at} onChange={(e) => update("last_contact_at", e.target.value)} />
          </div>
          <div>
            <label className="label">次回対応予定日</label>
            <input type="date" className="input" value={state.next_action_at} onChange={(e) => update("next_action_at", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* メモ */}
      <Section title="メモ">
        <textarea className="input min-h-[120px]" value={state.memo} onChange={(e) => update("memo", e.target.value)} placeholder="商談メモや背景情報" />
      </Section>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">{error}</div>
      )}
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>キャンセル</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? "保存中..." : mode === "create" ? "登録する" : "更新する"}</button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold text-slate-800 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ChipSelector<T extends string>({
  options,
  selected,
  onToggle,
}: {
  options: readonly T[];
  selected: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((p) => {
        const on = selected.includes(p);
        return (
          <button
            type="button"
            key={p}
            onClick={() => onToggle(p)}
            className={
              "px-2.5 py-1 text-xs rounded-full border transition-colors " +
              (on
                ? "bg-brand-600 border-brand-600 text-white"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50")
            }
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        className="input text-right tabular-nums"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="例：50000000"
      />
    </div>
  );
}
