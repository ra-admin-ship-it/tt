-- 提案担当者カラム追加
alter table public.companies
  add column if not exists proposal_owner text;

create index if not exists companies_proposal_owner_idx on public.companies (proposal_owner);
