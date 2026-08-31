import { describe, expect, it } from "vitest";
import { createToken, digestToken, digestsMatch, isTokenShaped } from "@/lib/newsletter/tokens";

describe("createToken", () => {
  it("produces a url-safe token with no padding", () => {
    const token = createToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it("does not repeat", () => {
    const tokens = new Set(Array.from({ length: 200 }, createToken));
    expect(tokens.size).toBe(200);
  });
});

describe("digestToken", () => {
  it("is stable for the same input", () => {
    const token = createToken();
    expect(digestToken(token)).toBe(digestToken(token));
  });

  it("returns a 64-character hex digest that is not the token itself", () => {
    const token = createToken();
    const digest = digestToken(token);
    expect(digest).toMatch(/^[0-9a-f]{64}$/);
    expect(digest).not.toContain(token);
  });

  it("differs for different tokens", () => {
    expect(digestToken("a")).not.toBe(digestToken("b"));
  });
});

describe("isTokenShaped", () => {
  it("accepts a generated token", () => {
    expect(isTokenShaped(createToken())).toBe(true);
  });

  it("rejects anything that cannot be a token", () => {
    for (const value of [
      undefined,
      null,
      42,
      "",
      "kısa",
      "has space",
      "sql';--",
      "a".repeat(600),
    ]) {
      expect(isTokenShaped(value)).toBe(false);
    }
  });
});

describe("digestsMatch", () => {
  it("matches identical digests and rejects others", () => {
    const digest = digestToken(createToken());
    expect(digestsMatch(digest, digest)).toBe(true);
    expect(digestsMatch(digest, digestToken(createToken()))).toBe(false);
  });

  it("handles length mismatches without throwing", () => {
    expect(digestsMatch("abc", "abcd")).toBe(false);
  });
});
