import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/db/supabaseClient";

// Vercel Cron Jobs から毎日叩かれて Supabase の自動 pause を防ぐ
// vercel.json の crons 設定で /api/cron/keepalive が毎日0時(UTC)に呼ばれる
//
// 認証：Vercel Cron はリクエストに Authorization: Bearer ${CRON_SECRET} を付ける
// CRON_SECRET を Vercel の Environment Variables に登録しておくこと

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // 認証チェック（CRON_SECRET 未設定なら誰でも叩けてしまうが、何もしない無害なエンドポイントなのでOK）
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: "supabase not configured" });
  }

  try {
    // 軽量クエリ：companies テーブルに対してCOUNTだけ取る
    const supabase = getSupabaseAdmin();
    const { count, error } = await supabase
      .from("companies")
      .select("id", { count: "exact", head: true });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      ts: new Date().toISOString(),
      count: count ?? 0,
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "error" }, { status: 500 });
  }
}
