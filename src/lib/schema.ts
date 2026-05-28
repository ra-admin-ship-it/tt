import { z } from "zod";
import {
  PRODUCT_OPTIONS,
  STATUS_OPTIONS,
  SUBSIDY_LIKELIHOOD_OPTIONS,
} from "./constants";

export const companyInputSchema = z.object({
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
  head_area: z.string().nullable().optional().transform((v) => v || null),
  head_address: z.string().nullable().optional().transform((v) => v || null),
  postal_code: z.string().nullable().optional().transform((v) => v || null),
  current_products: z.array(z.enum(PRODUCT_OPTIONS)).default([]),
  is_subsidy_flag: z.boolean().default(false),
  subsidy_likelihood: z.enum(SUBSIDY_LIKELIHOOD_OPTIONS).default("未確認"),
  target_products: z.array(z.enum(PRODUCT_OPTIONS)).default([]),
  next_action: z.string().nullable().optional().transform((v) => v || null),
  owner: z.string().nullable().optional().transform((v) => v || null),
  status: z.enum(STATUS_OPTIONS).default("未対応"),
  memo: z.string().nullable().optional().transform((v) => v || null),
  last_contact_at: z.string().nullable().optional().transform((v) => v || null),
  next_action_at: z.string().nullable().optional().transform((v) => v || null),
  hubspot_company_id: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v || null),
});

export type CompanyInputParsed = z.infer<typeof companyInputSchema>;
