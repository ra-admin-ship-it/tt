"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteCompanyButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm(`「${name}」を削除します。よろしいですか？`)) return;
    setBusy(true);
    const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("削除に失敗しました");
      setBusy(false);
      return;
    }
    router.replace("/companies");
    router.refresh();
  }

  return (
    <button className="btn-danger" onClick={handleDelete} disabled={busy}>
      {busy ? "削除中..." : "削除"}
    </button>
  );
}
