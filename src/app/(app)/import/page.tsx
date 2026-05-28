import { ImportClient } from "./ImportClient";
import { CSV_COLUMNS } from "@/lib/csv";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-1">CSVインポート</h1>
      <p className="text-sm text-slate-600 mb-5">
        CSVファイルをアップロードして企業情報を一括登録・更新します。
      </p>

      <section className="card p-5 mb-4">
        <h2 className="font-semibold mb-2">仕様</h2>
        <ul className="text-sm list-disc pl-5 space-y-1 text-slate-700">
          <li>1行目はヘッダー行（カラム名）にしてください</li>
          <li>法人番号が既存と一致する企業は <span className="font-semibold">更新</span> されます</li>
          <li>法人番号が空欄の行は、顧客名で重複チェックして同名があれば更新されます</li>
          <li>商材の複数指定は <code className="bg-slate-100 px-1 rounded">|</code> 区切り（例：<code className="bg-slate-100 px-1 rounded">採用支援|HP制作</code>）</li>
          <li>補助金フラグは <code className="bg-slate-100 px-1 rounded">ON</code> / <code className="bg-slate-100 px-1 rounded">OFF</code></li>
          <li>日付は <code className="bg-slate-100 px-1 rounded">YYYY-MM-DD</code></li>
        </ul>
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-brand-700">
            対応カラム一覧（{CSV_COLUMNS.length}カラム）
          </summary>
          <p className="text-xs text-slate-600 mt-2">
            {CSV_COLUMNS.join(", ")}
          </p>
        </details>
      </section>

      <ImportClient />
    </div>
  );
}
