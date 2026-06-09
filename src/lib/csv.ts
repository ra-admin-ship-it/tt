import Papa from "papaparse";
import iconv from "iconv-lite";
import type { Company } from "./types";
import {
  DESIRED_SUBSIDY_TYPE_OPTIONS,
  EMPLOYMENT_CONTINUATION_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FINANCIAL_DOC_OPTIONS,
  LABOR_COST_JUDGMENT_OPTIONS,
  PERMANENT_EMPLOYEE_OPTIONS,
  PRODUCT_OPTIONS,
  REVENUE_SCALE_OPTIONS,
  SALARY_ACCOUNT_OPTIONS,
  SCREENING_FIRST_JUDGMENT_OPTIONS,
  STATUS_OPTIONS,
  SUBSIDY_JUDGMENT_OPTIONS,
  SUBSIDY_LIKELIHOOD_OPTIONS,
  SUBSIDY_PROPOSAL_OPTIONS,
  SUBSIDY_PURPOSE_OPTIONS,
  type DesiredSubsidyType,
  type EmploymentContinuation,
  type EmploymentType,
  type FinancialDocStatus,
  type LaborCostJudgment,
  type PermanentEmployee,
  type Product,
  type RevenueScale,
  type SalaryAccountStatus,
  type ScreeningFirstJudgment,
  type Status,
  type SubsidyJudgment,
  type SubsidyLikelihood,
  type SubsidyProposalStatus,
  type SubsidyPurpose,
} from "./constants";

export const CSV_COLUMNS = [
  // 基本
  "法人番号",
  "顧客名",
  "従業員数",
  "本社エリア",
  "本社住所",
  "郵便番号",
  "現状取引商材",

  // ① 雇用関連
  "補助金対象判定",
  "常用雇用者有無",
  "常用雇用継続期間",
  "雇用形態",

  // ② 決算情報
  "決算書提出状況",
  "直近期売上高",
  "前々期売上高",
  "3期前売上高",
  "売上規模区分",

  // ③ 人件費判定
  "決算書上の給与科目有無",
  "給与科目名称",
  "人件費年間総額",
  "外注費年間総額",
  "人件費判定",

  // ④ 補助金ニーズ
  "希望補助金種別",
  "希望補助金額",
  "投資予定額",
  "補助金活用目的",
  "対象になりそうな商材",

  // ⑤ スクリーニング
  "坪田先生一次判定",
  "判定理由",
  "補助金提案可否",
  "提案担当者",

  // ⑥ 商談メモ
  "補助金ヒアリングメモ",
  "特記事項",

  // 旧・概況
  "補助金フラグ",
  "補助金対象可能性",

  // 対応情報
  "ネクストアクション",
  "担当者",
  "ステータス",
  "メモ",
  "最終接触日",
  "次回対応予定日",
  "HubSpot会社ID",

  // メタ
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

function numCell(n: number | null): string {
  return n == null ? "" : String(n);
}

export function companiesToCsv(companies: Company[]): Buffer {
  const rows = companies.map((c) => ({
    法人番号: c.corporate_number ?? "",
    顧客名: c.name,
    従業員数: numCell(c.employee_count),
    本社エリア: c.head_area ?? "",
    本社住所: c.head_address ?? "",
    郵便番号: c.postal_code ?? "",
    現状取引商材: joinList(c.current_products),

    補助金対象判定: c.subsidy_judgment,
    常用雇用者有無: c.permanent_employee,
    常用雇用継続期間: c.employment_continuation,
    雇用形態: joinList(c.employment_types),

    決算書提出状況: c.financial_doc_status,
    直近期売上高: numCell(c.revenue_recent),
    前々期売上高: numCell(c.revenue_2periods_ago),
    "3期前売上高": numCell(c.revenue_3periods_ago),
    売上規模区分: c.revenue_scale ?? "",

    決算書上の給与科目有無: c.salary_account_status,
    給与科目名称: c.salary_account_name ?? "",
    人件費年間総額: numCell(c.labor_cost_annual),
    外注費年間総額: numCell(c.outsourcing_cost_annual),
    人件費判定: c.labor_cost_judgment ?? "",

    希望補助金種別: joinList(c.desired_subsidy_types),
    希望補助金額: numCell(c.desired_subsidy_amount),
    投資予定額: numCell(c.planned_investment_amount),
    補助金活用目的: joinList(c.subsidy_purposes),
    対象になりそうな商材: joinList(c.target_products),

    坪田先生一次判定: c.screening_first_judgment ?? "",
    判定理由: c.judgment_reason ?? "",
    補助金提案可否: c.subsidy_proposal_status ?? "",
    提案担当者: c.proposal_owner ?? "",

    補助金ヒアリングメモ: c.subsidy_hearing_memo ?? "",
    特記事項: c.special_notes ?? "",

    補助金フラグ: c.is_subsidy_flag ? "ON" : "OFF",
    補助金対象可能性: c.subsidy_likelihood,

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
  return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(csv, "utf-8")]);
}

export function parseCsvBuffer(buf: Buffer): Record<string, string>[] {
  let text: string;
  if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    text = buf.slice(3).toString("utf-8");
  } else {
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

// ---- バリューパーサ ----
function pickOption<T extends string>(v: string | undefined, allow: readonly T[], fallback: T): T {
  const t = (v ?? "").trim();
  return (allow as readonly string[]).includes(t) ? (t as T) : fallback;
}
function pickOptionOrNull<T extends string>(v: string | undefined, allow: readonly T[]): T | null {
  const t = (v ?? "").trim();
  return (allow as readonly string[]).includes(t) ? (t as T) : null;
}
function pickArray<T extends string>(v: string | undefined, allow: readonly T[]): T[] {
  if (!v) return [];
  const set = new Set<T>();
  for (const item of splitList(v)) {
    if ((allow as readonly string[]).includes(item)) set.add(item as T);
  }
  return Array.from(set);
}

function asInt(v: string | undefined): number | null {
  const t = (v ?? "").trim().replace(/[,，¥￥\s円]/g, "");
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

  subsidy_judgment: SubsidyJudgment;
  permanent_employee: PermanentEmployee;
  employment_continuation: EmploymentContinuation;
  employment_types: EmploymentType[];

  financial_doc_status: FinancialDocStatus;
  revenue_recent: number | null;
  revenue_2periods_ago: number | null;
  revenue_3periods_ago: number | null;
  revenue_scale: RevenueScale | null;

  salary_account_status: SalaryAccountStatus;
  salary_account_name: string | null;
  labor_cost_annual: number | null;
  outsourcing_cost_annual: number | null;
  labor_cost_judgment: LaborCostJudgment | null;

  desired_subsidy_types: DesiredSubsidyType[];
  desired_subsidy_amount: number | null;
  planned_investment_amount: number | null;
  subsidy_purposes: SubsidyPurpose[];

  screening_first_judgment: ScreeningFirstJudgment | null;
  judgment_reason: string | null;
  subsidy_proposal_status: SubsidyProposalStatus | null;
  proposal_owner: string | null;

  subsidy_hearing_memo: string | null;
  special_notes: string | null;

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
  if (!name && !corp) return { error: "顧客名と法人番号の両方が空です" };
  if (!name) return { error: "顧客名が空です" };

  return {
    data: {
      corporate_number: corp || null,
      name,
      employee_count: asInt(row["従業員数"]),
      head_area: (row["本社エリア"] ?? "").trim() || null,
      head_address: (row["本社住所"] ?? "").trim() || null,
      postal_code: (row["郵便番号"] ?? "").trim() || null,
      current_products: pickArray(row["現状取引商材"], PRODUCT_OPTIONS),

      is_subsidy_flag: asBool(row["補助金フラグ"]),
      subsidy_likelihood: pickOption(row["補助金対象可能性"], SUBSIDY_LIKELIHOOD_OPTIONS, "未確認"),
      target_products: pickArray(row["対象になりそうな商材"], PRODUCT_OPTIONS),

      subsidy_judgment: pickOption(row["補助金対象判定"], SUBSIDY_JUDGMENT_OPTIONS, "未確認"),
      permanent_employee: pickOption(row["常用雇用者有無"], PERMANENT_EMPLOYEE_OPTIONS, "不明"),
      employment_continuation: pickOption(row["常用雇用継続期間"], EMPLOYMENT_CONTINUATION_OPTIONS, "不明"),
      employment_types: pickArray(row["雇用形態"], EMPLOYMENT_TYPE_OPTIONS),

      financial_doc_status: pickOption(row["決算書提出状況"], FINANCIAL_DOC_OPTIONS, "未依頼"),
      revenue_recent: asInt(row["直近期売上高"]),
      revenue_2periods_ago: asInt(row["前々期売上高"]),
      revenue_3periods_ago: asInt(row["3期前売上高"]),
      revenue_scale: pickOptionOrNull(row["売上規模区分"], REVENUE_SCALE_OPTIONS),

      salary_account_status: pickOption(row["決算書上の給与科目有無"], SALARY_ACCOUNT_OPTIONS, "未確認"),
      salary_account_name: (row["給与科目名称"] ?? "").trim() || null,
      labor_cost_annual: asInt(row["人件費年間総額"]),
      outsourcing_cost_annual: asInt(row["外注費年間総額"]),
      labor_cost_judgment: pickOptionOrNull(row["人件費判定"], LABOR_COST_JUDGMENT_OPTIONS),

      desired_subsidy_types: pickArray(row["希望補助金種別"], DESIRED_SUBSIDY_TYPE_OPTIONS),
      desired_subsidy_amount: asInt(row["希望補助金額"]),
      planned_investment_amount: asInt(row["投資予定額"]),
      subsidy_purposes: pickArray(row["補助金活用目的"], SUBSIDY_PURPOSE_OPTIONS),

      screening_first_judgment: pickOptionOrNull(row["坪田先生一次判定"], SCREENING_FIRST_JUDGMENT_OPTIONS),
      judgment_reason: (row["判定理由"] ?? "").trim() || null,
      subsidy_proposal_status: pickOptionOrNull(row["補助金提案可否"], SUBSIDY_PROPOSAL_OPTIONS),
      proposal_owner: (row["提案担当者"] ?? "").trim() || null,

      subsidy_hearing_memo: (row["補助金ヒアリングメモ"] ?? "").trim() || null,
      special_notes: (row["特記事項"] ?? "").trim() || null,

      next_action: (row["ネクストアクション"] ?? "").trim() || null,
      owner: (row["担当者"] ?? "").trim() || null,
      status: pickOption(row["ステータス"], STATUS_OPTIONS, "未対応"),
      memo: (row["メモ"] ?? "").trim() || null,
      last_contact_at: asDate(row["最終接触日"]),
      next_action_at: asDate(row["次回対応予定日"]),
      hubspot_company_id: (row["HubSpot会社ID"] ?? "").trim() || null,
    },
  };
}
