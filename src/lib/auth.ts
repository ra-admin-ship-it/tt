import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "subsidy_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14日

function getSecret(): string {
  return process.env.SESSION_SECRET || "dev-fallback-secret";
}

function getPassword(): string {
  return process.env.APP_PASSWORD || "dev";
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

// payload: "1.timestamp"
export function issueSessionToken(): string {
  const payload = `1.${Date.now()}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [v, ts, sig] = parts;
  if (v !== "1") return false;
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  // 期限チェック
  if (Date.now() - tsNum > SESSION_MAX_AGE_SECONDS * 1000) return false;
  // 署名確認
  const expected = sign(`${v}.${ts}`);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkPassword(input: string): boolean {
  const expected = getPassword();
  if (input.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export const SESSION_COOKIE = COOKIE_NAME;
export const SESSION_MAX_AGE = SESSION_MAX_AGE_SECONDS;
