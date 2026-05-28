"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm({ from }: { from?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || "ログインに失敗しました");
        setLoading(false);
        return;
      }
      const target = from && from.startsWith("/") ? from : "/dashboard";
      router.replace(target);
      router.refresh();
    } catch {
      setError("通信エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="password">パスワード</label>
        <input
          id="password"
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
      </div>
      {error && (
        <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
          {error}
        </div>
      )}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}
