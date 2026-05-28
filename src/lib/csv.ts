import Papa from "papaparse";
import iconv from "iconv-lite";
import type { Company } from "./types";
import {
  PRODUCT_OPTIONS,
  STATUS_OPTIONS,
  SUBSIDY_LIKELIHOOD_OPTIONS,
  type Product,
  type Status,
  type SubsidyLikelihood,
} from "./constants";

// 出力するカラム順序とCSVヘッダの定義
export const CSV_COLUMNS = [
  "法人番号",
  "顧客名",
  "従業員数",
  "本社エリア",
  "本社住所",
  "郵便番号",
  "現状取引商材",
  "補助金フラグ",
  "補助金対象可能性",
  "対象になりそうな商材",
  "ネクストアクション",
  "担当者",
  "ステータス",
  "メモ",
  "最終接触日",
  "次回対応予定日",
  "HubSpot会社ID",
  "作成日",
  "更新日",
] as const;

function joinList(arr: string[]): string {
  return arr.join("|");
}

function splitList(v: string): string[] {
  return v
    .split(/[|;,、\/]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function companiesToCsv(companies: Company[]): Buffer {
  const rows = companies.map((c) => ({
    法人番号: c.corporate_number ?? "",
    顧客名: c.name,
    従業員数: c.employee_count != null ? String(c.employee_count) : "",
    本社エリア: c.head_area ?? "",
    本社住所: c.head_address ?? "",
    郵便番号: c.postal_code ?? "",
    現状取引商材: joinList(c.current_products),
    補助金フラグ: c.is_subsidy_flag ? "ON" : "OFF",
    補助金対象可能性: c.subsidy_likelihood,
    対象になりそうな商材: joinList(c.target_products),
    ネクストアクション: c.next_action ?? "",
    担当者: c.owner ?? "",
    ステータス: c.status,
    メモ: c.memo ?? "",
    最終接触日: c.last_contact_at ?? "",
    次回対応予定日: c.next_action_at ?? "",
    HubSpot会社ID: c.hubspot_company_id ?? "",
    作成日: c.created_at,
    更新日: c.updated_at,
  }));
  const csv = Papa.unparse(rows, { columns: CSV_COLUMNS as unknown as string[] });
  // BOM付きUTF-8 でExcelでの文字化けを抑止
  return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(csv, "utf-8")]);
}

// インポート時にCSVバイト列を読む（UTF-8/UTF-8-BOM/Shift_JIS対応）
export function parseCsvBuffer(buf: Buffer): Record<string, string>[] {
  // BOM判定
  let text: string;
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    text = buf.slice(3).toString("utf-8");
  } else {
    // まずUTF-8として読んで、置換文字が多ければShift_JISとして再読
    const asUtf8 = buf.toString("utf-8");
    const replacementCount = (asUtf8.match(/�/g) ?? []).length;
    if (replacementCount > 3) {
      text = iconv.decode(buf, "Shift_JIS");
    } else {
      text = asUtf8;
    }
  }
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

function asLikelihood(v: string | undefined): SubsidyLikelihood {
  const t = (v ?? "").trim();
  return (SUBSIDY_LIKELIHOOD_OPTIONS as readonly string[]).includes(t)
    ? (t as SubsidyLikelihood)
    : "未確認";
}

function asStatus(v: string | undefined): Status {
  const t = (v ?? "").trim();
  return (STATUS_OPTIONS as readonly string[]).includes(t)
    ? (t as Status)
    : "未対応";
}

function asProducts(v: string | undefined): Product[] {
  if (!v) return [];
  const set = new Set<Product>();
  for (const item of splitList(v)) {
    if ((PRODUCT_OPTIONS as readonly string[]).includes(item)) {
      set.add(item as Product);
    }
  }
  return Array.from(set);
}

function asInt(v: string | undefined): number | null {
  const t = (v ?? "").trim().replace(/[,，]/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function asDate(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  if (!t) return null;
  const m = t.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) {
    const mm = m[2].padStart(2, "0");
    const dd = m[3].padStart(2, "0");
    return `${m[1]}-${mm}-${dd}`;
  }
  return null;
}

function asBool(v: string | undefined): boolean {
  const t = (v ?? "").trim().toLowerCase();
  return ["on", "true", "1", "○", "yes", "y"].includes(t);
}

export type CsvRowParsed = {
  corporate_number: string | null;
  name: string;
  employee_count: number | null;
  head_area: string | null;
  head_address: string | null;
  postal_code: string | null;
  current_products: Product[];
  is_subsidy_flag: boolean;
  subsidy_likelihood: SubsidyLikelihood;
  target_products: Product[];
  next_action: string | null;
  owner: string | null;
  status: Status;
  memo: string | null;
  last_contact_at: string | null;
  next_action_at: string | null;
  hubspot_company_id: string | null;
};

export function normalizeCsvRow(row: Record<string, string>): {
  data?: CsvRowParsed;
  error?: string;
} {
  const name = (row["顧客名"] ?? "").trim();
  const corp = (row["法人番号"] ?? "").trim().replace(/[^0-9]/g, "");

  if (!name && !corp) {
    return { error: "顧客名と法人番号の両方が空です" };
  }
  if (!name) {
    return { error: "顧客名が空です" };
  }

  return {
    data: {
      corporate_number: corp || null,
      name,
      employee_count: asInt(row["従業員数"]),
      head_area: (row["本社エリア"] ?? "").trim() || null,
      head_address: (row["本社住所"] ?? "").trim() || null,
      postal_code: (row["郵便番号"] ?? "").trim() || null,
      current_products: asProducts(row["現状取引商材"]),
      is_subsidy_flag: asBool(row["補助金フラグ"]),
      subsidy_likelihood: asLikelihood(row["補助金対象可能性"]),
      target_products: asProducts(row["対象になりそうな商材"]),
      next_action: (row["ネクストアクション"] ?? "").trim() || null,
      owner: (row["担当者"] ?? "").trim() || null,
      status: asStatus(row["ステータス"]),
      memo: (row["メモ"] ?? "").trim() || null,
      last_contact_at: asDate(row["最終接触日"]),
      next_action_at: asDate(row["次回対応予定日"]),
      hubspot_company_id: (row["HubSpot会社ID"] ?? "").trim() || null,
    },
  };
}
