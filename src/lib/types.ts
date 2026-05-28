import type {
  Product,
  Status,
  SubsidyLikelihood,
} from "./constants";

// 企業
export type Company = {
  id: string;
  corporate_number: string | null;       // 法人番号
  name: string;                          // 顧客名
  employee_count: number | null;         // 従業員数
  head_area: string | null;              // 本社エリア（都道府県）
  head_address: string | null;           // 本社住所
  postal_code: string | null;            // 郵便番号
  current_products: Product[];           // 現状取引商材
  is_subsidy_flag: boolean;              // 補助金フラグ
  subsidy_likelihood: SubsidyLikelihood; // 補助金対象可能性
  target_products: Product[];            // 対象になりそうな商材
  next_action: string | null;            // ネクストアクション
  owner: string | null;                  // 担当者
  status: Status;                        // ステータス
  memo: string | null;                   // メモ
  last_contact_at: string | null;        // 最終接触日 (YYYY-MM-DD)
  next_action_at: string | null;         // 次回対応予定日 (YYYY-MM-DD)
  hubspot_company_id: string | null;     // HubSpot会社ID
  created_at: string;                    // ISO 8601
  updated_at: string;                    // ISO 8601
};

export type CompanyInput = Omit<Company, "id" | "created_at" | "updated_at">;

// ユーザー（将来の拡張用に最低限のフィールド）
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
  action: string;  // create / update / delete / import など
  detail: string | null;
  created_at: string;
};

// 一覧画面のフィルタ
export type CompanyFilter = {
  q?: string;                  // 顧客名検索
  corporate_number?: string;   // 法人番号検索
  head_area?: string;          // 本社エリア
  subsidy_flag_only?: boolean; // 補助金フラグONのみ
  likelihood?: SubsidyLikelihood;
  product?: Product;           // 対象商材
  status?: Status;
  owner?: string;
};
