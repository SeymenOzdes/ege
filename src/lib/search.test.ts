import { describe, expect, it } from "vitest";
import { normalizeTurkish } from "@/lib/turkish";
import { searchArticles } from "@/lib/search";

describe("normalizeTurkish", () => {
  it("lowercases with Turkish casing rules (I → ı, İ → i)", () => {
    expect(normalizeTurkish("IZMIR")).toBe(normalizeTurkish("İzmir"));
    expect(normalizeTurkish("İZMİR")).toBe(normalizeTurkish("izmir"));
  });

  it("folds diacritics so ASCII input matches Turkish text", () => {
    expect(normalizeTurkish("zeytin")).toBe(normalizeTurkish("ZeytİN"));
    expect(normalizeTurkish("kultur-sanat")).toBe(normalizeTurkish("Kültür-Sanat"));
  });

  it("collapses whitespace", () => {
    expect(normalizeTurkish("  izmir   körfez ")).toBe("izmir korfez");
  });
});

describe("searchArticles", () => {
  it("finds articles regardless of Turkish character casing or diacritics", () => {
    for (const query of ["izmir", "IZMIR", "İzmir", "i̇zmir"]) {
      const results = searchArticles(query);
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((hit) => hit.location === "İzmir")).toBe(true);
    }
  });

  it("matches by topic words like zeytin against Zeytinin titles", () => {
    const results = searchArticles("zeytin");
    expect(results).toHaveLength(1);
    expect(results[0].slug).toBe("zeytinin-yeni-hasat-hikayesi");
  });

  it("requires every token to match", () => {
    const results = searchArticles("izmir kıyı");
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((hit) =>
        normalizeTurkish(`${hit.title} ${hit.summary ?? ""} ${hit.location}`).includes("izmir"),
      ),
    ).toBe(true);
    expect(searchArticles("izmir antarktika")).toHaveLength(0);
  });

  it("returns empty results for blank queries", () => {
    expect(searchArticles("")).toEqual([]);
    expect(searchArticles("   ")).toEqual([]);
  });

  it("ranks title matches above metadata-only matches", () => {
    const results = searchArticles("izmir");
    expect(results[0].matchedIn === "title" || results[0].matchedIn === "summary").toBe(true);
    expect(results[0].slug).toBe("izmirin-kiyi-rotalari");
  });
});