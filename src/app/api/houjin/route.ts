import { NextResponse } from "next/server";
import { HoujinApiError, fetchByCorporateNumber } from "@/lib/houjinApi";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const number = url.searchParams.get("number") ?? "";
  try {
    const info = await fetchByCorporateNumber(number);
    return NextResponse.json(info);
  } catch (e) {
    if (e instanceof HoujinApiError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: e.status });
    }
    return NextResponse.json({ error: "unknown_error" }, { status: 500 });
  }
}
