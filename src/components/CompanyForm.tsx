"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PREFECTURE_OPTIONS,
  PRODUCT_OPTIONS,
  STATUS_OPTIONS,
  SUBSIDY_LIKELIHOOD_OPTIONS,
  type Product,
  type Status,
  type SubsidyLikelihood,
} from "@/lib/constants";
import type { Company } from "@/lib/types";

type FormState = {
  corporate_number: string;
  name: string;
  employee_count: string;
  head_area: string;
  head_address: string;
  postal_code: string;
  current_products: Product[];
  is_subsidy_flag: boolean;
  subsidy_likelihood: SubsidyLikelihood;
  target_products: Product[];
  next_action: string;
  owner: string;
  status: Status;
  memo: string;
  last_contact_at: string;
  next_action_at: string;
  hubspot_company_id: string;
};

function toForm(c?: Company | null): FormState {
  return {
    corporate_number: c?.corporate_number ?? "",
    name: c?.name ?? "",
    employee_count: c?.employee_count != null ? String(c.employee_count) : "",
    head_area: c?.head_area ?? "",
    head_address: c?.head_address ?? "",
    postal_code: c?.postal_code ?? "",
    current_products: c?.current_products ?? [],
    is_subsidy_flag: c?.is_subsidy_flag ?? false,
    subsidy_likelihood: c?.subsidy_likelihood ?? "未確認",
    target_products: c?.target_products ?? [],
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
    employee_count: s.employee_count.trim() === "" ? null : Number(s.employee_count),
    head_area: s.head_area || null,
    head_address: s.head_address.trim() || null,
    postal_code: s.postal_code.trim() || null,
    current_products: s.current_products,
    is_subsidy_flag: s.is_subsidy_flag,
    subsidy_likelihood: s.subsidy_likelihood,
    target_products: s.target_products,
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

  function toggleProduct(field: "current_products" | "target_products", p: Product) {
    setState((s) => {
      const set = new Set(s[field]);
      if (set.has(p)) set.delete(p);
      else set.add(p);
      return { ...s, [field]: Array.from(set) };
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
      {/* セクション: 基本情報 */}
      <section className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">基本情報</h2>

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
            {houjinMsg && (
              <p className="mt-1 text-xs text-slate-600">{houjinMsg}</p>
            )}
          </div>

          <div>
            <label className="label">郵便番号</label>
            <input
              className="input"
              value={state.postal_code}
              onChange={(e) => update("postal_code", e.target.value)}
              placeholder="100-0001"
            />
          </div>

          <div className="md:col-span-2">
            <label className="label">顧客名 <span className="text-rose-600">*</span></label>
            <input
              className="input"
              value={state.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">従業員数</label>
            <input
              type="number"
              min={0}
              className="input"
              value={state.employee_count}
              onChange={(e) => update("employee_count", e.target.value)}
            />
          </div>

          <div>
            <label className="label">本社エリア</label>
            <select
              className="input"
              value={state.head_area}
              onChange={(e) => update("head_area", e.target.value)}
            >
              <option value="">未選択</option>
              {PREFECTURE_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="label">本社住所</label>
            <input
              className="input"
              value={state.head_address}
              onChange={(e) => update("head_address", e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <label className="label">現状取引商材（複数選択可）</label>
            <ProductSelector
              selected={state.current_products}
              onToggle={(p) => toggleProduct("current_products", p)}
            />
          </div>
        </div>
      </section>

      {/* セクション: 補助金情報 */}
      <section className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">補助金情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input
              id="subsidy_flag"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300"
              checked={state.is_subsidy_flag}
              onChange={(e) => update("is_subsidy_flag", e.target.checked)}
            />
            <label htmlFor="subsidy_flag" className="text-sm font-medium">
              補助金フラグ
            </label>
          </div>

          <div>
            <label className="label">補助金対象可能性</label>
            <select
              className="input"
              value={state.subsidy_likelihood}
              onChange={(e) => update("subsidy_likelihood", e.target.value as SubsidyLikelihood)}
            >
              {SUBSIDY_LIKELIHOOD_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="label">対象になりそうな商材（複数選択可）</label>
            <ProductSelector
              selected={state.target_products}
              onToggle={(p) => toggleProduct("target_products", p)}
            />
          </div>
        </div>
      </section>

      {/* セクション: 対応情報 */}
      <section className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">対応情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">ステータス</label>
            <select
              className="input"
              value={state.status}
              onChange={(e) => update("status", e.target.value as Status)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">担当者</label>
            <input
              className="input"
              value={state.owner}
              onChange={(e) => update("owner", e.target.value)}
              placeholder="氏名"
            />
          </div>

          <div>
            <label className="label">HubSpot会社ID</label>
            <input
              className="input"
              value={state.hubspot_company_id}
              onChange={(e) => update("hubspot_company_id", e.target.value)}
              placeholder="（将来連携用）"
            />
          </div>

          <div className="md:col-span-3">
            <label className="label">ネクストアクション</label>
            <input
              className="input"
              value={state.next_action}
              onChange={(e) => update("next_action", e.target.value)}
              placeholder="例：来週セミナー案内を送付"
            />
          </div>

          <div>
            <label className="label">最終接触日</label>
            <input
              type="date"
              className="input"
              value={state.last_contact_at}
              onChange={(e) => update("last_contact_at", e.target.value)}
            />
          </div>

          <div>
            <label className="label">次回対応予定日</label>
            <input
              type="date"
              className="input"
              value={state.next_action_at}
              onChange={(e) => update("next_action_at", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* セクション: メモ */}
      <section className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-4">メモ</h2>
        <textarea
          className="input min-h-[120px]"
          value={state.memo}
          onChange={(e) => update("memo", e.target.value)}
          placeholder="商談メモや背景情報"
        />
      </section>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.back()}
        >
          キャンセル
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "保存中..." : mode === "create" ? "登録する" : "更新する"}
        </button>
      </div>
    </form>
  );
}

function ProductSelector({
  selected,
  onToggle,
}: {
  selected: Product[];
  onToggle: (p: Product) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRODUCT_OPTIONS.map((p) => {
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
