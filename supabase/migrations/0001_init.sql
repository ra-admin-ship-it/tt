-- 補助金見込み顧客管理ツール 初期スキーマ
-- Supabase SQL Editor 上でこのファイルの内容をそのまま実行してください。

-- ========================================
-- users（将来のユーザー管理用、初期版では未使用でも作っておく）
-- ========================================
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text not null default '',
  created_at  timestamptz not null default now()
);

-- ========================================
-- companies
-- ========================================
create table if not exists public.companies (
  id                  uuid primary key default gen_random_uuid(),
  corporate_number    text,
  name                text not null,
  employee_count      integer,
  head_area           text,
  head_address        text,
  postal_code         text,
  current_products    text[] not null default '{}',
  is_subsidy_flag     boolean not null default false,
  subsidy_likelihood  text not null default '未確認',
  target_products     text[] not null default '{}',
  next_action         text,
  owner               text,
  status              text not null default '未対応',
  memo                text,
  last_contact_at     date,
  next_action_at      date,
  hubspot_company_id  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists companies_corporate_number_idx on public.companies (corporate_number);
create index if not exists companies_status_idx           on public.companies (status);
create index if not exists companies_owner_idx            on public.companies (owner);
create index if not exists companies_head_area_idx        on public.companies (head_area);
create index if not exists companies_updated_at_idx       on public.companies (updated_at desc);

-- updated_at の自動更新トリガー
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_companies_updated_at on public.companies;
create trigger trg_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

-- ========================================
-- activity_logs
-- ========================================
create table if not exists public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid references public.companies(id) on delete cascade,
  user_id     uuid references public.users(id) on delete set null,
  action      text not null,
  detail      text,
  created_at  timestamptz not null default now()
);

create index if not exists activity_logs_company_id_idx on public.activity_logs (company_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);

-- ========================================
-- RLS（行レベルセキュリティ）
-- 本アプリは Service Role Key を使うサーバー側からのみアクセスするため、
-- anon / authenticated は触らせない設計。
-- RLS を有効にして、anon に対するポリシーは作成しない。
-- ========================================
alter table public.users         enable row level security;
alter table public.companies     enable row level security;
alter table public.activity_logs enable row level security;
