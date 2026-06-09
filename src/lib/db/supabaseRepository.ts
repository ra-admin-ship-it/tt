// Supabase版リポジトリ実装
import type {
  ActivityLog,
  Company,
  CompanyFilter,
  CompanyInput,
} from "@/lib/types";
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
} from "@/lib/constants";
import { getSupabaseAdmin } from "./supabaseClient";

// 配列フィルタの共通ヘルパー
function filterAllowed<T extends string>(arr: any[], allow: readonly T[]): T[] {
  const set = new Set(allow);
  return (arr ?? []).filter(
    (v): v is T => typeof v === "string" && (set as Set<string>).has(v)
  );
}

function asOption<T extends string>(v: any, allow: readonly T[], fallback: T): T {
  return (allow as readonly string[]).includes(v) ? (v as T) : fallback;
}

function asOptionOrNull<T extends string>(v: any, allow: readonly T[]): T | null {
  return (allow as readonly string[]).includes(v) ? (v as T) : null;
}

// DBの行（生）→ Company（ドメイン型）への正規化
function rowToCompany(r: any): Company {
  return {
    id: r.id,
    corporate_number: r.corporate_number ?? null,
    name: r.name,
    employee_count: r.employee_count ?? null,
    head_area: r.head_area ?? null,
    head_address: r.head_address ?? null,
    postal_code: r.postal_code ?? null,
    current_products: filterAllowed<Product>(r.current_products ?? [], PRODUCT_OPTIONS),

    is_subsidy_flag: !!r.is_subsidy_flag,
    subsidy_likelihood: asOption<SubsidyLikelihood>(
      r.subsidy_likelihood,
      SUBSIDY_LIKELIHOOD_OPTIONS,
      "未確認"
    ),
    target_products: filterAllowed<Product>(r.target_products ?? [], PRODUCT_OPTIONS),

    // ①
    subsidy_judgment: asOption<SubsidyJudgment>(
      r.subsidy_judgment,
      SUBSIDY_JUDGMENT_OPTIONS,
      "未確認"
    ),
    permanent_employee: asOption<PermanentEmployee>(
      r.permanent_employee,
      PERMANENT_EMPLOYEE_OPTIONS,
      "不明"
    ),
    employment_continuation: asOption<EmploymentContinuation>(
      r.employment_continuation,
      EMPLOYMENT_CONTINUATION_OPTIONS,
      "不明"
    ),
    employment_types: filterAllowed<EmploymentType>(
      r.employment_types ?? [],
      EMPLOYMENT_TYPE_OPTIONS
    ),

    // ②
    financial_doc_status: asOption<FinancialDocStatus>(
      r.financial_doc_status,
      FINANCIAL_DOC_OPTIONS,
      "未依頼"
    ),
    revenue_recent: r.revenue_recent ?? null,
    revenue_2periods_ago: r.revenue_2periods_ago ?? null,
    revenue_3periods_ago: r.revenue_3periods_ago ?? null,
    revenue_scale: asOptionOrNull<RevenueScale>(r.revenue_scale, REVENUE_SCALE_OPTIONS),

    // ③
    salary_account_status: asOption<SalaryAccountStatus>(
      r.salary_account_status,
      SALARY_ACCOUNT_OPTIONS,
      "未確認"
    ),
    salary_account_name: r.salary_account_name ?? null,
    labor_cost_annual: r.labor_cost_annual ?? null,
    outsourcing_cost_annual: r.outsourcing_cost_annual ?? null,
    labor_cost_judgment: asOptionOrNull<LaborCostJudgment>(
      r.labor_cost_judgment,
      LABOR_COST_JUDGMENT_OPTIONS
    ),

    // ④
    desired_subsidy_types: filterAllowed<DesiredSubsidyType>(
      r.desired_subsidy_types ?? [],
      DESIRED_SUBSIDY_TYPE_OPTIONS
    ),
    desired_subsidy_amount: r.desired_subsidy_amount ?? null,
    planned_investment_amount: r.planned_investment_amount ?? null,
    subsidy_purposes: filterAllowed<SubsidyPurpose>(
      r.subsidy_purposes ?? [],
      SUBSIDY_PURPOSE_OPTIONS
    ),

    // ⑤
    screening_first_judgment: asOptionOrNull<ScreeningFirstJudgment>(
      r.screening_first_judgment,
      SCREENING_FIRST_JUDGMENT_OPTIONS
    ),
    judgment_reason: r.judgment_reason ?? null,
    subsidy_proposal_status: asOptionOrNull<SubsidyProposalStatus>(
      r.subsidy_proposal_status,
      SUBSIDY_PROPOSAL_OPTIONS
    ),
    proposal_owner: r.proposal_owner ?? null,

    // ⑥
    subsidy_hearing_memo: r.subsidy_hearing_memo ?? null,
    special_notes: r.special_notes ?? null,

    // 既存・対応情報
    next_action: r.next_action ?? null,
    owner: r.owner ?? null,
    status: asOption<Status>(r.status, STATUS_OPTIONS, "未対応"),
    memo: r.memo ?? null,
    last_contact_at: r.last_contact_at ?? null,
    next_action_at: r.next_action_at ?? null,
    hubspot_company_id: r.hubspot_company_id ?? null,

    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

// Company の入力 → DBへのINSERT/UPDATE用ペイロード（フィールドはそのままでもOKだが明示）
function toRow(input: Partial<CompanyInput>): Record<string, unknown> {
  // 不要なundefinedプロパティを取り除いて返す
  const row: Record<string, unknown> = { ...input };
  for (const key of Object.keys(row)) {
    if (row[key] === undefined) delete row[key];
  }
  return row;
}

function buildSelectQuery(filter: CompanyFilter) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("companies").select("*").order("updated_at", { ascending: false });
  if (filter.q) {
    query = query.ilike("name", `%${filter.q}%`);
  }
  if (filter.corporate_number) {
    query = query.ilike("corporate_number", `%${filter.corporate_number}%`);
  }
  if (filter.head_area) query = query.eq("head_area", filter.head_area);
  if (filter.subsidy_flag_only) query = query.eq("is_subsidy_flag", true);
  if (filter.likelihood) query = query.eq("subsidy_likelihood", filter.likelihood);
  if (filter.status) query = query.eq("status", filter.status);
  if (filter.owner) query = query.eq("owner", filter.owner);
  if (filter.product) {
    query = query.contains("target_products", [filter.product]);
  }
  return query;
}

export async function listCompanies(filter: CompanyFilter = {}): Promise<Company[]> {
  const { data, error } = await buildSelectQuery(filter);
  if (error) throw error;
  return (data ?? []).map(rowToCompany);
}

export async function getCompany(id: string): Promise<Company | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("companies").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? rowToCompany(data) : null;
}

export async function findCompanyByCorporateNumber(
  corporateNumber: string
): Promise<Company | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("corporate_number", corporateNumber)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCompany(data) : null;
}

export async function findCompanyByName(name: string): Promise<Company | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("name", name)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToCompany(data) : null;
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("companies")
    .insert(toRow(input))
    .select("*")
    .single();
  if (error) throw error;
  const company = rowToCompany(data);
  await supabase.from("activity_logs").insert({
    company_id: company.id,
    action: "create",
    detail: `企業「${company.name}」を登録`,
  });
  return company;
}

export async function updateCompany(
  id: string,
  input: Partial<CompanyInput>
): Promise<Company | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("companies")
    .update(toRow(input))
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const company = rowToCompany(data);
  await supabase.from("activity_logs").insert({
    company_id: id,
    action: "update",
    detail: `企業「${company.name}」を更新`,
  });
  return company;
}

export async function deleteCompany(id: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const target = await getCompany(id);
  if (!target) return false;
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
  return true;
}

export async function listActivityLogs(companyId?: string): Promise<ActivityLog[]> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("activity_logs").select("*").order("created_at", { ascending: false });
  if (companyId) query = query.eq("company_id", companyId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    company_id: r.company_id,
    user_id: r.user_id ?? null,
    action: r.action,
    detail: r.detail ?? null,
    created_at: r.created_at,
  }));
}

export async function listOwners(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("companies")
    .select("owner")
    .not("owner", "is", null);
  if (error) throw error;
  const set = new Set<string>();
  for (const r of data ?? []) if (r.owner) set.add(r.owner);
  return Array.from(set).sort();
}
