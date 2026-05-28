"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PRODUCT_OPTIONS,
  STATUS_OPTIONS,
  SUBSIDY_LIKELIHOOD_OPTIONS,
} from "@/lib/constants";
import type { CompanyFilter } from "@/lib/types";

export function CompanyListFilters({
  initial,
  prefectures,
  owners,
}: {
  initial: CompanyFilter;
  prefectures: string[];
  owners: string[];
}) {
  const router = useRouter();
  const [f, setF] = useState<CompanyFilter>(initial);

  function apply(next: CompanyFilter) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.corporate_number) params.set("corporate_number", next.corporate_number);
    if (next.head_area) params.set("head_area", next.head_area);
    if (next.subsidy_flag_only) params.set("subsidy_flag_only", "1");
    if (next.likelihood) params.set("likelihood", next.likelihood);
    if (next.product) params.set("product", next.product);
    if (next.status) params.set("status", next.status);
    if (next.owner) params.set("owner", next.owner);
    router.push(`/companies?${params.toString()}`);
  }

  function reset() {
    setF({});
    router.push("/companies");
  }

  function update<K extends keyof CompanyFilter>(k: K, v: CompanyFilter[K]) {
    setF((s) => ({ ...s, [k]: v }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(f);
      }}
      className="card p-4 mb-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="label">顧客名で検索</label>
          <input
            className="input"
            value={f.q ?? ""}
            onChange={(e) => update("q", e.target.value)}
            placeholder="顧客名"
          />
        </div>
        <div>
          <label className="label">法人番号で検索</label>
          <input
            className="input"
            value={f.corporate_number ?? ""}
            onChange={(e) => update("corporate_number", e.target.value)}
            placeholder="13桁の数字"
          />
        </div>
        <div>
          <label className="label">本社エリア</label>
          <select
            className="input"
            value={f.head_area ?? ""}
            onChange={(e) => update("head_area", e.target.value || undefined)}
          >
            <option value="">指定なし</option>
            {prefectures.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">担当者</label>
          <select
            className="input"
            value={f.owner ?? ""}
            onChange={(e) => update("owner", e.target.value || undefined)}
          >
            <option value="">指定なし</option>
            {owners.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">対象商材</label>
          <select
            className="input"
            value={f.product ?? ""}
            onChange={(e) => update("product", (e.target.value || undefined) as any)}
          >
            <option value="">指定なし</option>
            {PRODUCT_OPTIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">補助金対象可能性</label>
          <select
            className="input"
            value={f.likelihood ?? ""}
            onChange={(e) => update("likelihood", (e.target.value || undefined) as any)}
          >
            <option value="">指定なし</option>
            {SUBSIDY_LIKELIHOOD_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">ステータス</label>
          <select
            className="input"
            value={f.status ?? ""}
            onChange={(e) => update("status", (e.target.value || undefined) as any)}
          >
            <option value="">指定なし</option>
            {STATUS_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!f.subsidy_flag_only}
              onChange={(e) => update("subsidy_flag_only", e.target.checked)}
            />
            補助金フラグONのみ表示
          </label>
        </div>
      </div>
      <div className="flex gap-2 justify-end mt-3">
        <button type="button" className="btn-secondary" onClick={reset}>
          リセット
        </button>
        <button type="submit" className="btn-primary">
          絞り込む
        </button>
      </div>
    </form>
  );
}
