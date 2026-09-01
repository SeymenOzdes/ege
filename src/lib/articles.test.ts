import { describe, expect, it } from "vitest";
import { getArticleMetadata, parseArticleBody, type ArticleDetail } from "@/lib/articles";
import { makePreview } from "@/test/previews";

// `getArticleBySlug` reads Supabase and is covered end-to-end against the seeded
// local stack. These tests pin the two pure pieces around it: the jsonb body
// narrowing and the metadata builder.

function makeArticle(overrides: Partial<ArticleDetail> = {}): ArticleDetail {
  return {
    ...makePreview(1, { slug: "mahalle-pazarlarinda-yerel-urun", title: "Mahalle pazarları" }),
    author: { name: "Ece Aksoy", slug: "ece-aksoy", role: "Yerel yaşam muhabiri" },
    publishedAt: "2026-08-18T08:37:00+03:00",
    publishedDisplay: "18 Ağustos 2026, 08:37",
    body: [],
    related: [],
    ...overrides,
  };
}

describe("parseArticleBody", () => {
  it("keeps the three block kinds the renderer understands", () => {
    const blocks = parseArticleBody([
      { type: "paragraph", text: "Gövde metni." },
      { type: "heading", text: "Ara başlık" },
      { type: "quote", text: "Alıntı", attribution: "Nermin Karaca" },
    ]);

    expect(blocks).toEqual([
      { type: "paragraph", text: "Gövde metni." },
      { type: "heading", text: "Ara başlık" },
      { type: "quote", text: "Alıntı", attribution: "Nermin Karaca" },
    ]);
  });

  it("drops malformed blocks instead of failing the whole article", () => {
    const blocks = parseArticleBody([
      { type: "paragraph", text: "Sağlam paragraf." },
      { type: "video", url: "https://example.com" },
      { type: "paragraph", text: "" },
      { type: "quote", text: "Kaynaksız alıntı" },
      null,
      "düz metin",
    ]);

    expect(blocks).toEqual([{ type: "paragraph", text: "Sağlam paragraf." }]);
  });

  it("treats a non-array body as empty", () => {
    expect(parseArticleBody(null)).toEqual([]);
    expect(parseArticleBody({ type: "paragraph", text: "tek blok" })).toEqual([]);
  });
});

describe("getArticleMetadata", () => {
  it("builds canonical and social metadata from the article", () => {
    const article = makeArticle();
    const metadata = getArticleMetadata(article);

    expect(metadata.title).toBe(article.title);
    expect(metadata.description).toBe(article.summary);
    expect(metadata.alternates?.canonical).toBe(`/haber/${article.slug}`);
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      title: article.title,
      publishedTime: article.publishedAt,
      authors: ["Ece Aksoy"],
    });
  });

  it("omits image metadata while no hero asset is attached", () => {
    const metadata = getArticleMetadata(makeArticle());

    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
  });

  it("carries the hero through once one exists", () => {
    const metadata = getArticleMetadata(
      makeArticle({
        hero: {
          src: "https://cdn.example.com/hero.webp",
          alt: "Manisa'da bir mahalle pazarı",
          caption: "Pazar sabahı",
          credit: "Ege'nin Nabzı",
          width: 1586,
          height: 992,
        },
      }),
    );

    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://cdn.example.com/hero.webp",
        width: 1586,
        height: 992,
        alt: "Manisa'da bir mahalle pazarı",
      },
    ]);
    expect(metadata.twitter?.images).toEqual(["https://cdn.example.com/hero.webp"]);
  });
});
