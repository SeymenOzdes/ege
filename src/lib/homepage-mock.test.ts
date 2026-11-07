import { describe, expect, it } from "vitest";
import { FEATURED_COUNT, emptyHomepageContent } from "@/lib/homepage";
import { fillMockHeroes, padFeaturedWithMock } from "@/lib/homepage-mock";
import { MOCK_NEWS_STORIES } from "@/lib/mock-news";
import { makePreview, makePreviews } from "@/test/previews";

describe("padFeaturedWithMock", () => {
  it("fills the carousel and gives every added slide a photo", () => {
    const content = padFeaturedWithMock({
      ...emptyHomepageContent,
      featured: makePreviews(3).map((article) => ({ ...article, kicker: article.topic })),
    });

    expect(content.featured).toHaveLength(FEATURED_COUNT);
    expect(content.featured[3].slug).toBe(MOCK_NEWS_STORIES[0].slug);
    expect(content.featured.slice(3).every((slide) => Boolean(slide.hero?.src))).toBe(true);
  });

  it("leaves a full carousel untouched", () => {
    const featured = makePreviews(FEATURED_COUNT).map((article) => ({
      ...article,
      kicker: article.topic,
    }));

    expect(padFeaturedWithMock({ ...emptyHomepageContent, featured }).featured).toBe(featured);
  });
});

describe("fillMockHeroes", () => {
  it("attaches the matching photo to a seeded story and leaves unknown ones alone", () => {
    const known = makePreview(1, { slug: "izmirin-kiyi-rotalari" });
    const unknown = makePreview(2, { slug: "bilinmeyen-haber" });

    const content = fillMockHeroes({
      ...emptyHomepageContent,
      latest: [known, unknown],
    });

    expect(content.latest[0].hero?.src).toBe("/images/haberler/izmir-kiyi-rotalari.jpg");
    expect(content.latest[1].hero).toBeUndefined();
  });

  it("keeps a real hero instead of replacing it", () => {
    const hero = {
      src: "/images/haberler/gercek.jpg",
      alt: "Gerçek görsel",
      objectPosition: "50% 50%",
    };
    const article = makePreview(1, { slug: "izmirin-kiyi-rotalari", hero });

    expect(fillMockHeroes({ ...emptyHomepageContent, latest: [article] }).latest[0].hero).toBe(
      hero,
    );
  });
});
