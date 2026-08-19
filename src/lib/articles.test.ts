import { describe, expect, it } from "vitest";
import { articleSlugs, getArticleBySlug, getArticleMetadata } from "@/lib/articles";

describe("article detail data", () => {
  it("resolves the sample article by its stable slug", async () => {
    const article = await getArticleBySlug("mahalle-pazarlarinda-yerel-urun");

    expect(article).toMatchObject({
      title: "Mahalle pazarlarında yerel ürün için yeni dayanışma ağı",
      topic: "Yaşam",
      location: "Manisa",
      readingTime: "4 dk",
    });
    expect(article?.hero.src).toBe("/images/mahalle-pazari-dayanisma.png");
    expect(article?.hero.alt).toContain("Manisa");
    expect(article?.body.length).toBeGreaterThan(5);
  });

  it("returns undefined for unknown slugs", async () => {
    await expect(getArticleBySlug("olmayan-haber")).resolves.toBeUndefined();
    expect(articleSlugs).toEqual(["mahalle-pazarlarinda-yerel-urun"]);
  });

  it("builds canonical and social metadata from the article", async () => {
    const article = await getArticleBySlug("mahalle-pazarlarinda-yerel-urun");
    expect(article).toBeDefined();

    const metadata = getArticleMetadata(article!);

    expect(metadata.title).toBe(article!.title);
    expect(metadata.description).toBe(article!.summary);
    expect(metadata.alternates?.canonical).toBe(`/haber/${article!.slug}`);
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      title: article!.title,
      publishedTime: article!.publishedAt,
    });
  });
});
