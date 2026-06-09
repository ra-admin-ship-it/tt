-- 補助金スクリーニング項目を追加
-- companies テーブルに大分類①〜⑥の列を追加します。
-- Supabase Studio の SQL Editor で実行してください。

alter table public.companies
  -- ① 雇用関連
  add column if not exists subsidy_judgment        text not null default '未確認',
  add column if not exists permanent_employee      text not null default '不明',
  add column if not exists employment_continuation text not null default '不明',
  add column if not exists employment_types        text[] not null default '{}',

  -- ② 決算情報
  add column if not exists financial_doc_status    text not null default '未依頼',
  add column if not exists revenue_recent          bigint,
  add column if not exists revenue_2periods_ago    bigint,
  add column if not exists revenue_3periods_ago    bigint,
  add column if not exists revenue_scale           text,

  -- ③ 人件費判定
  add column if not exists salary_account_status   text not null default '未確認',
  add column if not exists salary_account_name     text,
  add column if not exists labor_cost_annual       bigint,
  add column if not exists outsourcing_cost_annual bigint,
  add column if not exists labor_cost_judgment     text,

  -- ④ 補助金ニーズ
  add column if not exists desired_subsidy_types       text[] not null default '{}',
  add column if not exists desired_subsidy_amount      bigint,
  add column if not exists planned_investment_amount   bigint,
  add column if not exists subsidy_purposes            text[] not null default '{}',

  -- ⑤ スクリーニング結果
  add column if not exists screening_first_judgment text,
  add column if not exists judgment_reason          text,
  add column if not exists subsidy_proposal_status  text,

  -- ⑥ 商談メモ
  add column if not exists subsidy_hearing_memo text,
  add column if not exists special_notes        text;

-- 検索に使いそうな列にインデックスを追加
create index if not exists companies_subsidy_judgment_idx     on public.companies (subsidy_judgment);
create index if not exists companies_screening_first_idx      on public.companies (screening_first_judgment);
create index if not exists companies_subsidy_proposal_idx     on public.companies (subsidy_proposal_status);
