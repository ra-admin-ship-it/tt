"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "ダッシュボード", icon: "📊" },
  { href: "/companies", label: "企業一覧", icon: "🏢" },
  { href: "/companies/new", label: "企業登録", icon: "➕" },
  { href: "/import", label: "CSVインポート", icon: "📥" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/login", { method: "DELETE" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 bg-slate-900 text-slate-100 min-h-screen flex flex-col">
      <div className="px-4 py-5 border-b border-slate-700">
        <div className="text-xs text-brand-300 font-semibold tracking-wider">SUBSIDY CRM</div>
        <div className="text-sm font-bold mt-0.5">補助金見込み顧客</div>
      </div>
      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          const active = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href) && item.href !== "/companies/new" && item.href !== "/companies");
          const isExact = pathname === item.href ||
            (item.href === "/companies" && /^\/companies(\/[^/]+)?$/.test(pathname) && !pathname.startsWith("/companies/new"));
          const isHighlight = pathname === item.href || isExact ||
            (item.href === "/companies" && pathname.startsWith("/companies/") && !pathname.startsWith("/companies/new"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2 px-4 py-2.5 text-sm transition-colors " +
                (isHighlight
                  ? "bg-brand-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white")
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <button onClick={handleLogout} className="w-full text-left text-xs text-slate-400 hover:text-white px-2 py-1.5">
          ログアウト
        </button>
      </div>
    </aside>
  );
}
