// リポジトリのファサード
// 環境変数 NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が両方セットされていれば
// Supabase を、そうでなければローカルJSONを使う。
//
// すべての関数は async に統一されているので、呼び出し側は実装の差異を意識しなくてよい。

import type {
  ActivityLog,
  Company,
  CompanyFilter,
  CompanyInput,
} from "@/lib/types";
import { isSupabaseConfigured } from "./supabaseClient";
import * as jsonRepo from "./jsonRepository";
import * as supabaseRepo from "./supabaseRepository";

function impl() {
  return isSupabaseConfigured() ? supabaseRepo : jsonRepo;
}

export function listCompanies(filter?: CompanyFilter): Promise<Company[]> {
  return impl().listCompanies(filter);
}
export function getCompany(id: string): Promise<Company | null> {
  return impl().getCompany(id);
}
export function findCompanyByCorporateNumber(corporateNumber: string): Promise<Company | null> {
  return impl().findCompanyByCorporateNumber(corporateNumber);
}
export function findCompanyByName(name: string): Promise<Company | null> {
  return impl().findCompanyByName(name);
}
export function createCompany(input: CompanyInput): Promise<Company> {
  return impl().createCompany(input);
}
export function updateCompany(id: string, input: Partial<CompanyInput>): Promise<Company | null> {
  return impl().updateCompany(id, input);
}
export function deleteCompany(id: string): Promise<boolean> {
  return impl().deleteCompany(id);
}
export function listActivityLogs(companyId?: string): Promise<ActivityLog[]> {
  return impl().listActivityLogs(companyId);
}
export function listOwners(): Promise<string[]> {
  return impl().listOwners();
}

// データソース名を返す（設定画面表示用）
export function getDataSourceName(): "supabase" | "json" {
  return isSupabaseConfigured() ? "supabase" : "json";
}
