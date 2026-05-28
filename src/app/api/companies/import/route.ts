import { NextResponse } from "next/server";
import {
  createCompany,
  findCompanyByCorporateNumber,
  findCompanyByName,
  updateCompany,
} from "@/lib/db/repository";
import { normalizeCsvRow, parseCsvBuffer } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "ファイルが選択されていません" }, { status: 400 });
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const rows = parseCsvBuffer(buf);

  let createdCount = 0;
  let updatedCount = 0;
  const errors: { row: number; reason: string }[] = [];

  for (let idx = 0; idx < rows.length; idx++) {
    const row = rows[idx];
    const lineNo = idx + 2; // ヘッダー行を1としたときの実データ行
    const { data, error } = normalizeCsvRow(row);
    if (!data) {
      errors.push({ row: lineNo, reason: error ?? "不正な行" });
      continue;
    }
    try {
      const corp = data.corporate_number;
      const existing = corp
        ? await findCompanyByCorporateNumber(corp)
        : await findCompanyByName(data.name);
      if (existing) {
        await updateCompany(existing.id, data);
        updatedCount++;
      } else {
        await createCompany(data);
        createdCount++;
      }
    } catch (e: any) {
      errors.push({ row: lineNo, reason: e?.message ?? "保存エラー" });
    }
  }

  return NextResponse.json({
    total: rows.length,
    created: createdCount,
    updated: updatedCount,
    failed: errors.length,
    errors: errors.slice(0, 50),
  });
}
