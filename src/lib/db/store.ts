import fs from "node:fs";
import path from "node:path";
import type { ActivityLog, Company, User } from "@/lib/types";

// JSONファイルベースの簡易ストア
// 後でSupabaseに移行する際は、このファイルと同じインターフェースを持つ
// supabase版を作って repository.ts で差し替える想定。

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

type DbShape = {
  companies: Company[];
  users: User[];
  activity_logs: ActivityLog[];
};

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function defaultDb(): DbShape {
  return { companies: [], users: [], activity_logs: [] };
}

function load(): DbShape {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = defaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw) as DbShape;
    // 互換性のためデフォルト構造で埋める
    return {
      companies: data.companies ?? [],
      users: data.users ?? [],
      activity_logs: data.activity_logs ?? [],
    };
  } catch (e) {
    console.error("DB load error, reset:", e);
    const initial = defaultDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

function save(db: DbShape) {
  ensureDir();
  const tmp = DB_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmp, DB_FILE);
}

// すべての読み書きをこの関数を介して行うとロックの単位がそろう
export function withDb<T>(fn: (db: DbShape) => T): T {
  const db = load();
  const result = fn(db);
  save(db);
  return result;
}

export function readDb(): DbShape {
  return load();
}
