import { z } from "zod";
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
} from "./constants";

const optionalText = z
  .string()
  .nullable()
  .optional()
  .transform((v) => v || null);

const optionalNumber = z
  .union([z.number().nonnegative(), z.null()])
  .optional()
  .transform((v) => (v === undefined ? null : v));

export const companyInputSchema = z.object({
  // 基本
  corporate_number: z
    .string()
    .trim()
    .max(13, "法人番号は13桁以内")
    .nullable()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  name: z.string().trim().min(1, "顧客名は必須です").max(200),
  employee_count: z
    .union([z.number().int().nonnegative(), z.null()])
    .optional()
    .transform((v) => (v === undefined ? null : v)),
  head_area: optionalText,
  head_address: optionalText,
  postal_code: optionalText,
  current_products: z.array(z.enum(PRODUCT_OPTIONS)).default([]),

  // 旧・補助金情報（互換）
  is_subsidy_flag: z.boolean().default(false),
  subsidy_likelihood: z.enum(SUBSIDY_LIKELIHOOD_OPTIONS).default("未確認"),
  target_products: z.array(z.enum(PRODUCT_OPTIONS)).default([]),

  // ① 雇用関連
  subsidy_judgment: z.enum(SUBSIDY_JUDGMENT_OPTIONS).default("未確認"),
  permanent_employee: z.enum(PERMANENT_EMPLOYEE_OPTIONS).default("不明"),
  employment_continuation: z.enum(EMPLOYMENT_CONTINUATION_OPTIONS).default("不明"),
  employment_types: z.array(z.enum(EMPLOYMENT_TYPE_OPTIONS)).default([]),

  // ② 決算情報
  financial_doc_status: z.enum(FINANCIAL_DOC_OPTIONS).default("未依頼"),
  revenue_recent: optionalNumber,
  revenue_2periods_ago: optionalNumber,
  revenue_3periods_ago: optionalNumber,
  revenue_scale: z
    .enum(REVENUE_SCALE_OPTIONS)
    .nullable()
    .optional()
    .transform((v) => v ?? null),

  // ③ 人件費判定
  salary_account_status: z.enum(SALARY_ACCOUNT_OPTIONS).default("未確認"),
  salary_account_name: optionalText,
  labor_cost_annual: optionalNumber,
  outsourcing_cost_annual: optionalNumber,
  labor_cost_judgment: z
    .enum(LABOR_COST_JUDGMENT_OPTIONS)
    .nullable()
    .optional()
    .transform((v) => v ?? null),

  // ④ 補助金ニーズ
  desired_subsidy_types: z.array(z.enum(DESIRED_SUBSIDY_TYPE_OPTIONS)).default([]),
  desired_subsidy_amount: optionalNumber,
  planned_investment_amount: optionalNumber,
  subsidy_purposes: z.array(z.enum(SUBSIDY_PURPOSE_OPTIONS)).default([]),

  // ⑤ スクリーニング
  screening_first_judgment: z
    .enum(SCREENING_FIRST_JUDGMENT_OPTIONS)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  judgment_reason: optionalText,
  subsidy_proposal_status: z
    .enum(SUBSIDY_PROPOSAL_OPTIONS)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  proposal_owner: optionalText,

  // ⑥ 商談メモ
  subsidy_hearing_memo: optionalText,
  special_notes: optionalText,

  // 既存・対応情報
  next_action: optionalText,
  owner: optionalText,
  status: z.enum(STATUS_OPTIONS).default("未対応"),
  memo: optionalText,
  last_contact_at: optionalText,
  next_action_at: optionalText,
  hubspot_company_id: optionalText,
});

export type CompanyInputParsed = z.infer<typeof companyInputSchema>;
