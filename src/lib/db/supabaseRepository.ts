// Supabase版リポジトリ実装
import type {
  ActivityLog,
  Company,
  CompanyFilter,
  CompanyInput,
} from "@/lib/types";
import {
  PRODUCT_OPTIONS,
  STATUS_OPTIONS,
  SUBSIDY_LIKELIHOOD_OPTIONS,
  type Product,
  type Status,
  type SubsidyLikelihood,
} from "@/lib/constants";
import { getSupabaseAdmin } from "./supabaseClient";

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
    current_products: filterProducts(r.current_products ?? []),
    is_subsidy_flag: !!r.is_subsidy_flag,
    subsidy_likelihood: asLikelihood(r.subsidy_likelihood),
    target_products: filterProducts(r.target_products ?? []),
    next_action: r.next_action ?? null,
    owner: r.owner ?? null,
    status: asStatus(r.status),
    memo: r.memo ?? null,
    last_contact_at: r.last_contact_at ?? null,
    next_action_at: r.next_action_at ?? null,
    hubspot_company_id: r.hubspot_company_id ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function filterProducts(arr: any[]): Product[] {
  const allow = new Set(PRODUCT_OPTIONS as readonly string[]);
  return arr.filter((v): v is Product => typeof v === "string" && allow.has(v));
}
function asLikelihood(v: any): SubsidyLikelihood {
  return (SUBSIDY_LIKELIHOOD_OPTIONS as readonly string[]).includes(v)
    ? (v as SubsidyLikelihood)
    : "未確認";
}
function asStatus(v: any): Status {
  return (STATUS_OPTIONS as readonly string[]).includes(v) ? (v as Status) : "未対応";
}

function buildSelectQuery(filter: CompanyFilter) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("companies").select("*").order("updated_at", { ascending: false });
  if (filter.q) {
    // 部分一致（ILIKEで大文字小文字区別なし）
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
    // target_products text[] に対する contains 検索
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
    .insert({
      corporate_number: input.corporate_number,
      name: input.name,
      employee_count: input.employee_count,
      head_area: input.head_area,
      head_address: input.head_address,
      postal_code: input.postal_code,
      current_products: input.current_products,
      is_subsidy_flag: input.is_subsidy_flag,
      subsidy_likelihood: input.subsidy_likelihood,
      target_products: input.target_products,
      next_action: input.next_action,
      owner: input.owner,
      status: input.status,
      memo: input.memo,
      last_contact_at: input.last_contact_at,
      next_action_at: input.next_action_at,
      hubspot_company_id: input.hubspot_company_id,
    })
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
    .update(input)
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
  // ログ用に名前を取得
  const target = await getCompany(id);
  if (!target) return false;
  const { error } = await supabase.from("companies").delete().eq("id", id);
  if (error) throw error;
  // companies削除時にcascadeでactivity_logsも消えるため、削除ログは別途残せない
  // 必要なら別テーブルに保存する設計に変更可能
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
