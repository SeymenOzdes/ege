import { describe, expect, it } from "vitest";
import {
  ARCHIVE_PAGE_SIZE,
  getCategoryArchive,
  getAuthorArticles,
  getAuthorBySlug,
  getLatestArticles,
  getRelatedArticles,
  paginateEntries,
  parsePageNumber,
} from "@/lib/archives";

describe("getLatestArticles", () => {
  it("orders the full catalog newest-first", () => {
    expect(getLatestArticles().map((article) => article.slug)).toEqual([
      "izmirin-kiyi-rotalari",
      "zeytinin-yeni-hasat-hikayesi",
      "antik-kentlerde-yaz-aksamlari",
      "ege-hattinda-rayli-ulasim",
      "kiyi-koylerinde-deniz-nobetleri",
      "yerel-tasarim-atolyeleri",
      "gediz-ovasinda-toprak-takibi",
      "mahallede-ortak-sofra",
      "mahalle-pazarlarinda-yerel-urun",
    ]);
  });
});

describe("getCategoryArchive", () => {
  it("resolves topics case-insensitively with their seeded names", () => {
    const topic = getCategoryArchive("gundem");

    expect(topic?.kind).toBe("topic");
    expect(topic?.name).toBe("Gündem");
    expect(topic?.description).toContain("kamusal yaşam");
    expect(topic?.articles.map((article) => article.slug)).toEqual([
      "izmirin-kiyi-rotalari",
      "ege-hattinda-rayli-ulasim",
    ]);

    expect(getCategoryArchive("YASAM")?.name).toBe("Yaşam");
  });

  it("falls back to provinces so header city links work", () => {
    const city = getCategoryArchive("izmir");

    expect(city?.kind).toBe("location");
    expect(city?.name).toBe("İzmir");
    expect(city?.description).toBeNull();
    expect(city?.articles.map((article) => article.slug)).toEqual([
      "izmirin-kiyi-rotalari",
      "mahallede-ortak-sofra",
    ]);
  });

  it("keeps unknown slugs unresolved for permanent not-found handling", () => {
    expect(getCategoryArchive("spor")).toBeUndefined();
  });
});

describe("author archives", () => {
  it("exposes the demo staff authors", () => {
    expect(getAuthorBySlug("ece-aksoy")?.role).toBe("Yerel yaşam muhabiri");
    expect(getAuthorBySlug("ELIF-DEMIR")?.slug).toBe("elif-demir");
    expect(getAuthorBySlug("bilinmeyen-yazar")).toBeUndefined();
  });

  it("lists an author's stories newest-first", () => {
    expect(getAuthorArticles("ece-aksoy").map((article) => article.slug)).toEqual([
      "antik-kentlerde-yaz-aksamlari",
      "kiyi-koylerinde-deniz-nobetleri",
      "mahallede-ortak-sofra",
      "mahalle-pazarlarinda-yerel-urun",
    ]);
  });

  it("returns an empty list for authors without stories", () => {
    expect(getAuthorArticles("kerem-aydin").length).toBeGreaterThan(0);
    expect(getAuthorArticles("bos-yazar")).toEqual([]);
  });
});

describe("getRelatedArticles", () => {
  it("excludes the current story and honours the limit", () => {
    const related = getRelatedArticles("mahallede-ortak-sofra");

    expect(related).toHaveLength(2);
    expect(related.map((article) => article.slug)).not.toContain("mahallede-ortak-sofra");
  });
});

describe("archive pagination", () => {
  const catalog = getLatestArticles();

  it("splits the timeline into six-entry pages", () => {
    const first = paginateEntries(catalog, 1);
    expect(first).toBeDefined();
    expect(first!.entries).toHaveLength(ARCHIVE_PAGE_SIZE);
    expect(first!.totalPages).toBe(2);
    expect(first!.total).toBe(catalog.length);

    const second = paginateEntries(catalog, 2);
    expect(second).toBeDefined();
    expect(second!.entries.length).toBeGreaterThan(0);
    const firstIds = new Set(first!.entries.map((entry) => entry.id));
    expect(second!.entries.every((entry) => !firstIds.has(entry.id))).toBe(true);
  });

  it("rejects out-of-range pages so routes render not-found", () => {
    expect(paginateEntries(catalog, 99)).toBeUndefined();
    expect(paginateEntries([], 3)).toBeUndefined();
  });

  it("normalizes non-positive page numbers onto the first page", () => {
    expect(paginateEntries(catalog, 0)).toEqual(paginateEntries(catalog, 1));
    expect(paginateEntries(catalog, -5)).toEqual(paginateEntries(catalog, 1));
  });

  it("serves a single empty page instead of failing", () => {
    const only = paginateEntries([], 1);

    expect(only).toEqual({ entries: [], currentPage: 1, totalPages: 1, total: 0 });
  });

  it("normalizes raw query values defensively", () => {
    expect(parsePageNumber(undefined)).toBe(1);
    expect(parsePageNumber("")).toBe(1);
    expect(parsePageNumber("abc")).toBe(1);
    expect(parsePageNumber("-4")).toBe(1);
    expect(parsePageNumber("3")).toBe(3);
  });
});