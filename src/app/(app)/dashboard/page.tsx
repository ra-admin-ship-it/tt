import Link from "next/link";
import { listCompanies } from "@/lib/db/repository";
import {
  PRODUCT_OPTIONS,
  STATUS_OPTIONS,
  type Product,
  type Status,
} from "@/lib/constants";

export const dynamic = "force-dynamic";

function StatCard({
  title,
  value,
  href,
  tone = "default",
}: {
  title: string;
  value: number;
  href?: string;
  tone?: "default" | "warn" | "accent" | "good";
}) {
  const toneClass =
    tone === "warn"
      ? "text-rose-700"
      : tone === "accent"
      ? "text-brand-700"
      : tone === "good"
      ? "text-emerald-700"
      : "text-slate-900";
  const inner = (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="text-sm text-slate-500">{title}</div>
      <div className={"text-3xl font-bold mt-1 " + toneClass}>
        {value.toLocaleString()}
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function DashboardPage() {
  const companies = await listCompanies();
  const today = new Date().toISOString().slice(0, 10);

  const total = companies.length;
  const flagOn = companies.filter((c) => c.is_subsidy_flag).length;
  const high = companies.filter((c) => c.subsidy_likelihood === "高").length;
  const untouched = companies.filter((c) => c.status === "未対応").length;
  const negotiating = companies.filter((c) => c.status === "商談化").length;
  const won = companies.filter((c) => c.status === "受注済み").length;
  const overdue = companies.filter(
    (c) => c.next_action_at && c.next_action_at < today
  ).length;

  // 対象商材別カウント
  const productCounts: { product: Product; count: number }[] = PRODUCT_OPTIONS.map(
    (p) => ({
      product: p,
      count: companies.filter((c) => c.target_products.includes(p)).length,
    })
  )
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);

  // ステータス別カウント
  const statusCounts: { status: Status; count: number }[] = STATUS_OPTIONS.map(
    (s) => ({
      status: s,
      count: companies.filter((c) => c.status === s).length,
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">ダッシュボード</h1>
      <p className="text-sm text-slate-600 mb-5">
        集計は最新の登録データから算出しています。
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard title="登録企業数" value={total} href="/companies" />
        <StatCard
          title="補助金フラグON"
          value={flagOn}
          tone="accent"
          href="/companies?subsidy_flag_only=1"
        />
        <StatCard
          title="対象可能性「高」"
          value={high}
          tone="accent"
          href="/companies?likelihood=%E9%AB%98"
        />
        <StatCard
          title="未対応"
          value={untouched}
          href="/companies?status=%E6%9C%AA%E5%AF%BE%E5%BF%9C"
        />
        <StatCard
          title="商談化"
          value={negotiating}
          tone="good"
          href="/companies?status=%E5%95%86%E8%AB%87%E5%8C%96"
        />
        <StatCard
          title="受注済み"
          value={won}
          tone="good"
          href="/companies?status=%E5%8F%97%E6%B3%A8%E6%B8%88%E3%81%BF"
        />
        <StatCard
          title="次回対応日 期限超過"
          value={overdue}
          tone="warn"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="card p-5">
          <h2 className="font-semibold mb-3">対象商材別の企業数</h2>
          {productCounts.length === 0 ? (
            <p className="text-sm text-slate-500">対象商材が登録された企業がまだありません。</p>
          ) : (
            <ul className="space-y-1.5">
              {productCounts.map((p) => (
                <BarRow
                  key={p.product}
                  label={p.product}
                  value={p.count}
                  max={productCounts[0].count}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <h2 className="font-semibold mb-3">ステータス別の件数</h2>
          <ul className="space-y-1.5">
            {statusCounts.map((s) => (
              <BarRow
                key={s.status}
                label={s.status}
                value={s.count}
                max={Math.max(...statusCounts.map((s) => s.count), 1)}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function BarRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <li className="text-sm">
      <div className="flex justify-between mb-0.5">
        <span>{label}</span>
        <span className="tabular-nums text-slate-600">{value} 件</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded">
        <div className="h-full bg-brand-500 rounded" style={{ width: `${pct}%` }} />
      </div>
    </li>
  );
}
