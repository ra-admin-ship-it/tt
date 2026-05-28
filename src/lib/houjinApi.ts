// 国税庁 法人番号システムWeb-API クライアント
// https://www.houjin-bangou.nta.go.jp/webapi/
// 注: type=12 のレスポンスは XML/UTF-8。JSONではない。
//
// 取得できる項目: 法人番号 / 商号 / 所在地（都道府県・市区町村・番地）/ 郵便番号 など登記情報のみ
// 取得できない項目: 従業員数 / 資本金 / 業種 / 売上 などの企業活動情報
//   → これらが必要な場合は別途 gBizINFO API（経産省・無料）等を併用する必要がある
//     https://info.gbiz.go.jp/hojin/api

import { PREFECTURE_OPTIONS } from "./constants";

export type HoujinInfo = {
  corporate_number: string;
  name: string;
  postal_code: string | null;
  prefecture: string | null;
  address: string;
};

export class HoujinApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 500, code = "houjin_api_error") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function normalizePrefecture(name: string | null): string | null {
  if (!name) return null;
  for (const p of PREFECTURE_OPTIONS) {
    if (name.startsWith(p)) return p;
  }
  return null;
}

// 簡易XMLタグ抽出（要素単位）
function pickTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  if (!m) return "";
  return decodeXmlEntities(m[1]);
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// 7桁の郵便番号を XXX-XXXX 形式に
function formatPostalCode(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, "");
  if (digits.length === 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return digits || null;
}

export async function fetchByCorporateNumber(corporateNumber: string): Promise<HoujinInfo> {
  const appId = process.env.HOUJIN_BANGOU_APP_ID;
  if (!appId) {
    throw new HoujinApiError(
      "法人番号APIのアプリケーションIDが未設定です。.env.local の HOUJIN_BANGOU_APP_ID を設定してください。",
      500,
      "app_id_missing"
    );
  }
  const sanitized = corporateNumber.replace(/[^0-9]/g, "");
  if (sanitized.length !== 13) {
    throw new HoujinApiError("法人番号は13桁の数字で入力してください", 400, "invalid_corporate_number");
  }

  const url = new URL("https://api.houjin-bangou.nta.go.jp/4/num");
  url.searchParams.set("id", appId);
  url.searchParams.set("number", sanitized);
  url.searchParams.set("type", "12"); // XML/UTF-8
  url.searchParams.set("history", "0");

  let res: Response;
  try {
    res = await fetch(url.toString(), { cache: "no-store" });
  } catch {
    throw new HoujinApiError("法人番号APIへの接続に失敗しました", 502, "network_error");
  }
  if (!res.ok) {
    throw new HoujinApiError(`法人番号API エラー (${res.status})`, 502, "upstream_error");
  }
  const text = await res.text();

  // count要素を確認
  const countMatch = text.match(/<count>(\d+)<\/count>/);
  const count = countMatch ? Number(countMatch[1]) : 0;
  const corpMatch = text.match(/<corporation>[\s\S]*?<\/corporation>/);
  if (count === 0 || !corpMatch) {
    throw new HoujinApiError("該当する法人が見つかりませんでした", 404, "not_found");
  }
  const corp = corpMatch[0];
  const name = pickTag(corp, "name");
  const postCode = pickTag(corp, "postCode");
  const prefectureName = pickTag(corp, "prefectureName");
  const cityName = pickTag(corp, "cityName");
  const streetNumber = pickTag(corp, "streetNumber");
  const address = `${prefectureName}${cityName}${streetNumber}`.trim();

  return {
    corporate_number: sanitized,
    name,
    postal_code: formatPostalCode(postCode),
    prefecture: normalizePrefecture(prefectureName),
    address,
  };
}
