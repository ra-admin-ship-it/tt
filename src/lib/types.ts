import type {
  DesiredSubsidyType,
  EmploymentContinuation,
  EmploymentType,
  FinancialDocStatus,
  LaborCostJudgment,
  PermanentEmployee,
  Product,
  RevenueScale,
  SalaryAccountStatus,
  ScreeningFirstJudgment,
  Status,
  SubsidyJudgment,
  SubsidyLikelihood,
  SubsidyProposalStatus,
  SubsidyPurpose,
} from "./constants";

// 企業
export type Company = {
  id: string;

  // 基本情報
  corporate_number: string | null;
  name: string;
  employee_count: number | null;
  head_area: string | null;
  head_address: string | null;
  postal_code: string | null;
  current_products: Product[];

  // 旧・補助金情報（互換維持）
  is_subsidy_flag: boolean;
  subsidy_likelihood: SubsidyLikelihood;
  target_products: Product[];

  // 大分類① 雇用関連
  subsidy_judgment: SubsidyJudgment;                       // 補助金対象判定
  permanent_employee: PermanentEmployee;                   // 常用雇用者有無
  employment_continuation: EmploymentContinuation;         // 常用雇用継続期間
  employment_types: EmploymentType[];                      // 雇用形態（複数）

  // 大分類② 決算情報
  financial_doc_status: FinancialDocStatus;                // 決算書提出状況
  revenue_recent: number | null;                           // 直近期売上高
  revenue_2periods_ago: number | null;                     // 前々期売上高
  revenue_3periods_ago: number | null;                     // 3期前売上高
  revenue_scale: RevenueScale | null;                      // 売上規模区分

  // 大分類③ 人件費判定
  salary_account_status: SalaryAccountStatus;              // 決算書上の給与科目有無
  salary_account_name: string | null;                      // 給与科目名称
  labor_cost_annual: number | null;                        // 人件費年間総額
  outsourcing_cost_annual: number | null;                  // 外注費年間総額
  labor_cost_judgment: LaborCostJudgment | null;           // 人件費判定

  // 大分類④ 補助金ニーズ
  desired_subsidy_types: DesiredSubsidyType[];             // 希望補助金種別（複数）
  desired_subsidy_amount: number | null;                   // 希望補助金額
  planned_investment_amount: number | null;                // 投資予定額
  subsidy_purposes: SubsidyPurpose[];                      // 補助金活用目的（複数）

  // 大分類⑤ スクリーニング結果
  screening_first_judgment: ScreeningFirstJudgment | null; // 坪田先生一次判定
  judgment_reason: string | null;                          // 判定理由
  subsidy_proposal_status: SubsidyProposalStatus | null;   // 補助金提案可否
  proposal_owner: string | null;                           // 提案担当者

  // 大分類⑥ 商談メモ
  subsidy_hearing_memo: string | null;                     // 補助金ヒアリングメモ
  special_notes: string | null;                            // 特記事項

  // 既存・対応情報
  next_action: string | null;
  owner: string | null;
  status: Status;
  memo: string | null;
  last_contact_at: string | null;
  next_action_at: string | null;
  hubspot_company_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanyInput = Omit<Company, "id" | "created_at" | "updated_at">;

// ユーザー
export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

// 活動ログ
export type ActivityLog = {
  id: string;
  company_id: string;
  user_id: string | null;
  action: string;
  detail: string | null;
  created_at: string;
};

// 一覧画面のフィルタ
export type CompanyFilter = {
  q?: string;
  corporate_number?: string;
  head_area?: string;
  subsidy_flag_only?: boolean;
  likelihood?: SubsidyLikelihood;
  product?: Product;
  status?: Status;
  owner?: string;
};
