// JSONファイルベースのリポジトリ実装
// 同期処理だが、外部APIは非同期に揃えて使う側を統一する
import { randomUUID } from "node:crypto";
import type {
  ActivityLog,
  Company,
  CompanyFilter,
  CompanyInput,
} from "@/lib/types";
import { readDb, withDb } from "./store";

function matches(c: Company, filter: CompanyFilter): boolean {
  const q = filter.q?.trim();
  const cn = filter.corporate_number?.trim();
  if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
  if (cn && !(c.corporate_number ?? "").includes(cn)) return false;
  if (filter.head_area && c.head_area !== filter.head_area) return false;
  if (filter.subsidy_flag_only && !c.is_subsidy_flag) return false;
  if (filter.likelihood && c.subsidy_likelihood !== filter.likelihood) return false;
  if (filter.product && !c.target_products.includes(filter.product)) return false;
  if (filter.status && c.status !== filter.status) return false;
  if (filter.owner && c.owner !== filter.owner) return false;
  return true;
}

export async function listCompanies(filter: CompanyFilter = {}): Promise<Company[]> {
  const db = readDb();
  return db.companies
    .filter((c) => matches(c, filter))
    .sort((a, b) => (b.updated_at > a.updated_at ? 1 : -1));
}

export async function getCompany(id: string): Promise<Company | null> {
  const db = readDb();
  return db.companies.find((c) => c.id === id) ?? null;
}

export async function findCompanyByCorporateNumber(
  corporateNumber: string
): Promise<Company | null> {
  const db = readDb();
  return db.companies.find((c) => c.corporate_number === corporateNumber) ?? null;
}

export async function findCompanyByName(name: string): Promise<Company | null> {
  const db = readDb();
  return db.companies.find((c) => c.name === name) ?? null;
}

export async function createCompany(input: CompanyInput): Promise<Company> {
  const now = new Date().toISOString();
  const company: Company = {
    id: randomUUID(),
    ...input,
    created_at: now,
    updated_at: now,
  };
  withDb((db) => {
    db.companies.push(company);
    db.activity_logs.push({
      id: randomUUID(),
      company_id: company.id,
      user_id: null,
      action: "create",
      detail: `企業「${company.name}」を登録`,
      created_at: now,
    });
  });
  return company;
}

export async function updateCompany(
  id: string,
  input: Partial<CompanyInput>
): Promise<Company | null> {
  let updated: Company | null = null;
  withDb((db) => {
    const idx = db.companies.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const now = new Date().toISOString();
    db.companies[idx] = {
      ...db.companies[idx],
      ...input,
      updated_at: now,
    };
    updated = db.companies[idx];
    db.activity_logs.push({
      id: randomUUID(),
      company_id: id,
      user_id: null,
      action: "update",
      detail: `企業「${db.companies[idx].name}」を更新`,
      created_at: now,
    });
  });
  return updated;
}

export async function deleteCompany(id: string): Promise<boolean> {
  let deleted = false;
  withDb((db) => {
    const idx = db.companies.findIndex((c) => c.id === id);
    if (idx < 0) return;
    const target = db.companies[idx];
    db.companies.splice(idx, 1);
    db.activity_logs.push({
      id: randomUUID(),
      company_id: id,
      user_id: null,
      action: "delete",
      detail: `企業「${target.name}」を削除`,
      created_at: new Date().toISOString(),
    });
    deleted = true;
  });
  return deleted;
}

export async function listActivityLogs(companyId?: string): Promise<ActivityLog[]> {
  const db = readDb();
  return db.activity_logs
    .filter((l) => (companyId ? l.company_id === companyId : true))
    .sort((a, b) => (b.created_at > a.created_at ? 1 : -1));
}

export async function listOwners(): Promise<string[]> {
  const db = readDb();
  const owners = new Set<string>();
  for (const c of db.companies) {
    if (c.owner) owners.add(c.owner);
  }
  return Array.from(owners).sort();
}
