// Edge Runtime (middleware) 用のセッショントークン検証
// node:crypto に依存せず Web Crypto API のみで動作する

export const SESSION_COOKIE = "subsidy_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

function getSecret(): string {
  return process.env.SESSION_SECRET || "dev-fallback-secret";
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) return new Uint8Array();
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

export async function verifySessionTokenEdge(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [v, ts, sig] = parts;
  if (v !== "1") return false;
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  if (Date.now() - tsNum > SESSION_MAX_AGE_SECONDS * 1000) return false;

  const enc = new TextEncoder();
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(getSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const sigBytes = hexToBytes(sig);
    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes,
      enc.encode(`${v}.${ts}`)
    );
  } catch {
    return false;
  }
}
