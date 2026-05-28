import { getDataSourceName } from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const houjinAppIdSet = !!process.env.HOUJIN_BANGOU_APP_ID;
  const dataSource = getDataSourceName();
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-1">設定</h1>
      <p className="text-sm text-slate-600 mb-6">
        初期版の設定確認画面です。実際の設定値は <code className="bg-slate-100 px-1 rounded">.env.local</code> で管理します。
      </p>

      <section className="card p-5 mb-4">
        <h2 className="font-semibold mb-3">認証</h2>
        <dl className="text-sm space-y-2">
          <div className="flex">
            <dt className="w-40 text-slate-500">ログイン方式</dt>
            <dd>簡易ログイン（パスワード1個 + Cookie）</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-slate-500">パスワード環境変数</dt>
            <dd><code className="bg-slate-100 px-1 rounded">APP_PASSWORD</code></dd>
          </div>
        </dl>
      </section>

      <section className="card p-5 mb-4">
        <h2 className="font-semibold mb-3">法人番号API</h2>
        <dl className="text-sm space-y-2">
          <div className="flex">
            <dt className="w-40 text-slate-500">提供元</dt>
            <dd>国税庁 法人番号システムWeb-API</dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-slate-500">Application ID</dt>
            <dd>
              {houjinAppIdSet ? (
                <span className="badge bg-emerald-100 text-emerald-800 border-emerald-200">設定済み</span>
              ) : (
                <span className="badge bg-amber-100 text-amber-800 border-amber-200">未設定</span>
              )}
              <span className="ml-2 text-xs text-slate-500"><code className="bg-slate-100 px-1 rounded">HOUJIN_BANGOU_APP_ID</code> を .env.local に設定してください</span>
            </dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-slate-500">登録ページ</dt>
            <dd><a className="text-brand-700 underline" href="https://www.houjin-bangou.nta.go.jp/webapi/" target="_blank" rel="noreferrer">https://www.houjin-bangou.nta.go.jp/webapi/</a></dd>
          </div>
        </dl>
      </section>

      <section className="card p-5 mb-4">
        <h2 className="font-semibold mb-3">データストア</h2>
        <dl className="text-sm space-y-2">
          <div className="flex">
            <dt className="w-40 text-slate-500">現在の保存先</dt>
            <dd>
              {dataSource === "supabase" ? (
                <>
                  <span className="badge bg-emerald-100 text-emerald-800 border-emerald-200">Supabase</span>
                  <span className="ml-2 text-xs text-slate-500">PostgreSQL（クラウド）</span>
                </>
              ) : (
                <>
                  <span className="badge bg-slate-100 text-slate-700 border-slate-200">ローカルJSON</span>
                  <span className="ml-2 text-xs text-slate-500"><code className="bg-slate-100 px-1 rounded">data/db.json</code></span>
                </>
              )}
            </dd>
          </div>
          <div className="flex">
            <dt className="w-40 text-slate-500">切替方法</dt>
            <dd className="text-xs text-slate-600">
              <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> と
              <code className="bg-slate-100 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> を設定するとSupabaseに自動切替
            </dd>
          </div>
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold mb-3">将来拡張予定</h2>
        <ul className="text-sm list-disc pl-5 space-y-1 text-slate-700">
          <li>HubSpot会社IDとの連携</li>
          <li>MCP連携</li>
          <li>補助金対象可能性の自動判定ロジック</li>
          <li>Supabase Auth によるユーザー管理</li>
          <li>従業員数・資本金・業種の自動取得（gBizINFO API 併用案）</li>
        </ul>
      </section>
    </div>
  );
}
