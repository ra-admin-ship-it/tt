// 補助金対象可能性の選択肢
export const SUBSIDY_LIKELIHOOD_OPTIONS = ["高", "中", "低", "未確認"] as const;
export type SubsidyLikelihood = (typeof SUBSIDY_LIKELIHOOD_OPTIONS)[number];

// ステータスの選択肢
export const STATUS_OPTIONS = [
  "未対応",
  "確認中",
  "資料送付済み",
  "セミナー案内済み",
  "交流会案内済み",
  "商談化",
  "提案中",
  "受注見込み",
  "受注済み",
  "失注",
  "保留",
  "対象外",
] as const;
export type Status = (typeof STATUS_OPTIONS)[number];

// 対象商材の選択肢
export const PRODUCT_OPTIONS = [
  "AccessRPO",
  "ヤギオファー",
  "オートハント",
  "求人ボックス",
  "Note記事代行",
  "TORERU",
  "Wantedly運用",
  "アボネクト",
  "成果報酬型求人ボックス運用",
  "セカオピ",
  "採用LP制作",
  "RPO",
  "HP制作",
  "その他（自由入力）",
] as const;
export type Product = (typeof PRODUCT_OPTIONS)[number];

// 本社エリア（都道府県）
export const PREFECTURE_OPTIONS = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;
export type Prefecture = (typeof PREFECTURE_OPTIONS)[number];

// ===== 補助金スクリーニング用の追加選択肢 =====

// 補助金対象判定（自動更新用）
export const SUBSIDY_JUDGMENT_OPTIONS = [
  "未確認",
  "対象可能性あり",
  "対象外",
  "要確認",
] as const;
export type SubsidyJudgment = (typeof SUBSIDY_JUDGMENT_OPTIONS)[number];

// 常用雇用者有無
export const PERMANENT_EMPLOYEE_OPTIONS = ["あり", "なし", "不明"] as const;
export type PermanentEmployee = (typeof PERMANENT_EMPLOYEE_OPTIONS)[number];

// 常用雇用継続期間
export const EMPLOYMENT_CONTINUATION_OPTIONS = ["1年以上", "1年未満", "不明"] as const;
export type EmploymentContinuation = (typeof EMPLOYMENT_CONTINUATION_OPTIONS)[number];

// 雇用形態（複数選択）
export const EMPLOYMENT_TYPE_OPTIONS = [
  "正社員",
  "契約社員",
  "パート",
  "アルバイト",
  "業務委託のみ",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPE_OPTIONS)[number];

// 決算書提出状況
export const FINANCIAL_DOC_OPTIONS = [
  "未依頼",
  "依頼済",
  "1期受領",
  "3期受領",
  "受領不可",
] as const;
export type FinancialDocStatus = (typeof FINANCIAL_DOC_OPTIONS)[number];

// 売上規模区分
export const REVENUE_SCALE_OPTIONS = [
  "〜1,000万円",
  "1,000万〜3,000万円",
  "3,000万〜5,000万円",
  "5,000万〜1億円",
  "1億円以上",
] as const;
export type RevenueScale = (typeof REVENUE_SCALE_OPTIONS)[number];

// 給与科目有無
export const SALARY_ACCOUNT_OPTIONS = ["あり", "なし", "未確認"] as const;
export type SalaryAccountStatus = (typeof SALARY_ACCOUNT_OPTIONS)[number];

// 人件費判定
export const LABOR_COST_JUDGMENT_OPTIONS = [
  "給与計上あり",
  "外注中心",
  "判定保留",
] as const;
export type LaborCostJudgment = (typeof LABOR_COST_JUDGMENT_OPTIONS)[number];

// 希望補助金種別（複数選択）
export const DESIRED_SUBSIDY_TYPE_OPTIONS = [
  "持続化補助金",
  "ものづくり補助金",
  "事業再構築補助金",
  "IT導入補助金",
  "省力化補助金",
  "その他",
] as const;
export type DesiredSubsidyType = (typeof DESIRED_SUBSIDY_TYPE_OPTIONS)[number];

// 補助金活用目的（複数選択）
export const SUBSIDY_PURPOSE_OPTIONS = [
  "採用",
  "設備投資",
  "システム導入",
  "広告宣伝",
  "新規事業",
  "その他",
] as const;
export type SubsidyPurpose = (typeof SUBSIDY_PURPOSE_OPTIONS)[number];

// 坪田先生一次判定
export const SCREENING_FIRST_JUDGMENT_OPTIONS = [
  "A：提案推奨",
  "B：条件付き提案",
  "C：情報不足",
  "D：対象外",
] as const;
export type ScreeningFirstJudgment = (typeof SCREENING_FIRST_JUDGMENT_OPTIONS)[number];

// 補助金提案可否
export const SUBSIDY_PROPOSAL_OPTIONS = ["提案可能", "提案保留", "提案不可"] as const;
export type SubsidyProposalStatus = (typeof SUBSIDY_PROPOSAL_OPTIONS)[number];

// 一次判定の色分け
export const SCREENING_BADGE_CLASS: Record<ScreeningFirstJudgment, string> = {
  "A：提案推奨": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "B：条件付き提案": "bg-amber-100 text-amber-800 border-amber-200",
  "C：情報不足": "bg-slate-100 text-slate-700 border-slate-200",
  "D：対象外": "bg-rose-100 text-rose-800 border-rose-200",
};

export const SUBSIDY_JUDGMENT_BADGE_CLASS: Record<SubsidyJudgment, string> = {
  未確認: "bg-gray-100 text-gray-600 border-gray-200",
  対象可能性あり: "bg-emerald-100 text-emerald-800 border-emerald-200",
  対象外: "bg-rose-100 text-rose-800 border-rose-200",
  要確認: "bg-amber-100 text-amber-800 border-amber-200",
};

// 補助金対象可能性ごとの色（Tailwindクラス）
export const LIKELIHOOD_BADGE_CLASS: Record<SubsidyLikelihood, string> = {
  高: "bg-red-100 text-red-800 border-red-200",
  中: "bg-amber-100 text-amber-800 border-amber-200",
  低: "bg-slate-100 text-slate-700 border-slate-200",
  未確認: "bg-gray-50 text-gray-500 border-gray-200",
};

// ステータスごとの色
export const STATUS_BADGE_CLASS: Record<Status, string> = {
  未対応: "bg-gray-100 text-gray-700 border-gray-200",
  確認中: "bg-blue-100 text-blue-800 border-blue-200",
  資料送付済み: "bg-indigo-100 text-indigo-800 border-indigo-200",
  セミナー案内済み: "bg-violet-100 text-violet-800 border-violet-200",
  交流会案内済み: "bg-purple-100 text-purple-800 border-purple-200",
  商談化: "bg-teal-100 text-teal-800 border-teal-200",
  提案中: "bg-cyan-100 text-cyan-800 border-cyan-200",
  受注見込み: "bg-emerald-100 text-emerald-800 border-emerald-200",
  受注済み: "bg-green-200 text-green-900 border-green-300",
  失注: "bg-rose-100 text-rose-800 border-rose-200",
  保留: "bg-yellow-100 text-yellow-800 border-yellow-200",
  対象外: "bg-stone-100 text-stone-700 border-stone-200",
};
