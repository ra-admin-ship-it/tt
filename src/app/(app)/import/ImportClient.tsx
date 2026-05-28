"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type ImportResult = {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: { row: number; reason: string }[];
};

export function ImportClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/companies/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "インポートに失敗しました");
      } else {
        setResult(data);
        router.refresh();
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={handleUpload} className="card p-5 mb-4">
        <label className="label">CSVファイル</label>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-brand-600 file:text-white file:text-sm hover:file:bg-brand-700"
        />
        {file && (
          <p className="text-xs text-slate-500 mt-2">
            選択中: {file.name}（{(file.size / 1024).toFixed(1)} KB）
          </p>
        )}
        <div className="flex justify-end mt-4">
          <button type="submit" className="btn-primary" disabled={!file || busy}>
            {busy ? "取り込み中..." : "取り込み実行"}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2 mb-4">
          {error}
        </div>
      )}

      {result && (
        <section className="card p-5">
          <h2 className="font-semibold mb-3">取り込み結果</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 rounded p-3">
              <div className="text-xs text-slate-500">合計行数</div>
              <div className="text-xl font-bold">{result.total}</div>
            </div>
            <div className="bg-emerald-50 rounded p-3">
              <div className="text-xs text-emerald-700">新規登録</div>
              <div className="text-xl font-bold text-emerald-800">{result.created}</div>
            </div>
            <div className="bg-blue-50 rounded p-3">
              <div className="text-xs text-blue-700">更新</div>
              <div className="text-xl font-bold text-blue-800">{result.updated}</div>
            </div>
            <div className="bg-rose-50 rounded p-3">
              <div className="text-xs text-rose-700">失敗</div>
              <div className="text-xl font-bold text-rose-800">{result.failed}</div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">エラー内容（最大50件表示）</div>
              <ul className="text-xs space-y-1 max-h-60 overflow-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="text-rose-700">
                    {e.row}行目: {e.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </>
  );
}
