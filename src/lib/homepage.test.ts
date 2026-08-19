import { describe, expect, it } from "vitest";
import { getHomepageContent } from "@/lib/homepage";

describe("getHomepageContent", () => {
  it("returns the complete demo homepage contract", async () => {
    const content = await getHomepageContent();

    expect(content.featured).toHaveLength(3);
    expect(content.secondary).toHaveLength(2);
    expect(content.latest.length).toBeGreaterThanOrEqual(6);
    expect(content.topicSections.map((section) => section.slug)).toEqual([
      "gundem",
      "ekonomi",
      "kultur-sanat",
      "yasam",
    ]);
  });

  it("keeps article links and media tones ready for the future data adapter", async () => {
    const content = await getHomepageContent();
    const articles = [
      ...content.featured,
      ...content.secondary,
      ...content.latest,
      ...content.topicSections.flatMap((section) => [section.lead, ...section.stories]),
    ];

    expect(articles.every((article) => article.slug.length > 0)).toBe(true);
    expect(articles.every((article) => article.mediaTone.length > 0)).toBe(true);
    expect(articles.every((article) => article.readingTime.endsWith("dk"))).toBe(true);
  });
});
