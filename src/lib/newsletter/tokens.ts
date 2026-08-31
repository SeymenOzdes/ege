import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Bülten bağlantılarındaki tek kullanımlık jeton. Veritabanına jetonun kendisi
 * değil SHA-256 özeti yazılır; e-postadaki ham değer yalnızca alıcıda kalır.
 */
export function createToken(): string {
  return randomBytes(32).toString("base64url");
}

export function digestToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Base64url alfabesi dışındaki girdiyi veritabanına hiç sormadan eler. */
export function isTokenShaped(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{16,512}$/.test(value);
}

/** İki özeti sabit sürede karşılaştırır. */
export function digestsMatch(first: string, second: string): boolean {
  const a = Buffer.from(first, "utf8");
  const b = Buffer.from(second, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
