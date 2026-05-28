import { NextResponse } from "next/server";
import { deleteCompany, getCompany, updateCompany } from "@/lib/db/repository";
import { companyInputSchema } from "@/lib/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const company = await getCompany(params.id);
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ company });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = companyInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力値が不正です", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const updated = await updateCompany(params.id, parsed.data);
  if (!updated) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ company: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ok = await deleteCompany(params.id);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
