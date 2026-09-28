import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleCard, type ArticleCardVariant } from "@/components/site/article-card";
import type { ArticlePreview } from "@/lib/homepage";
import styles from "@/components/site/homepage.module.css";

// `feed` and `timeline` are the two variants that branch inside the component
// rather than in CSS alone: `feed` swaps its footer's reading time for month and
// year, `timeline` drops its picture.
// Four surfaces still render `timeline`, so its shape is pinned here too.

function article(overrides: Partial<ArticlePreview> = {}): ArticlePreview {
  return {
    id: "1",
    slug: "ege-limaninda-yeni-hat",
    title: "Ege limanında yeni hat açıldı",
    summary: "Yeni hattın bölge ihracatına katkısı bekleniyor.",
    topic: "Ekonomi",
    topicSlug: "ekonomi",
    location: "İzmir",
    publishedLabel: "27 Ağustos",
    publishedAt: "2026-08-27T06:18:00.000Z",
    readingTime: "4 dk",
    hero: {
      src: "https://example.test/liman.jpg",
      alt: "Liman görüntüsü",
      objectPosition: "50% 50%",
    },
    mediaTone: "sky",
    ...overrides,
  };
}

const VARIANTS: ArticleCardVariant[] = [
  "feature",
  "feed",
  "list",
  "result",
  "secondary",
  "timeline",
  "topic",
];

describe("ArticleCard", () => {
  it.each(VARIANTS)("%s varyantının stil bloğu gerçekten var", (variant) => {
    /*
     * The class is assembled from the variant name at render time, so a variant
     * whose block was never written — or was renamed in the stylesheet alone —
     * silently ships as `class="undefined"`. `styles.latestTimeline` did exactly
     * that. This only holds because `vitest.config.mts` processes CSS modules;
     * with the default stub every name here would be truthy.
     */
    expect(styles[`articleCard${variant}`]).toBeTypeOf("string");
  });

  it("feed satırı küçük görseli ve altbilgide ay-yıl tarihini gösterir", () => {
    const { container } = render(<ArticleCard article={article()} variant="feed" />);

    // No gutter column any more: picture and text are the only grid children.
    expect(container.querySelector("article")?.children).toHaveLength(2);
    const date = container.querySelector("time");
    expect(date).toHaveTextContent("Ağustos 2026");
    expect(date).toHaveAttribute("datetime", "2026-08-27T06:18:00.000Z");
    // The kicker carries the topic alone; the city is left out of this row.
    expect(screen.getByText("Ekonomi")).toBeInTheDocument();
    expect(screen.queryByText("İzmir")).not.toBeInTheDocument();

    expect(screen.getByAltText("Liman görüntüsü")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Ege limanında yeni hat açıldı",
    );
    // Headline only: the row carries no summary.
    expect(
      screen.queryByText("Yeni hattın bölge ihracatına katkısı bekleniyor."),
    ).not.toBeInTheDocument();
  });

  it("feed satırının altbilgisi tarihi tekrar etmez", () => {
    render(<ArticleCard article={article()} variant="feed" />);

    // The footer carries month and year instead of the reading time.
    expect(screen.queryByText(/27 Ağustos ·/)).not.toBeInTheDocument();
    expect(screen.queryByText(/okuma/)).not.toBeInTheDocument();
    expect(screen.getByText("Ağustos 2026")).toBeInTheDocument();
  });

  it("tarihsiz haberde tarih göstermez", () => {
    const { container } = render(
      <ArticleCard
        article={article({ publishedLabel: "", publishedAt: undefined })}
        variant="feed"
      />,
    );

    expect(container.querySelector("time")).toBeNull();
  });

  it("tarihsiz haberde altbilgide öksüz ayraç bırakmaz", () => {
    // Every variant but `feed` prints the date in its footer, and " · 4 dk okuma"
    // with nothing before the bullet reads as a rendering bug.
    render(
      <ArticleCard
        article={article({ publishedLabel: "", publishedAt: undefined })}
        variant="list"
      />,
    );

    expect(screen.getByText(/okuma/)).toHaveTextContent(/^4 dk okuma$/);
  });

  it("küçük görsel için kart genişliğinde bir dosya istemez", () => {
    // The thumbnail is a 176px column; the card default would fetch 480px for it.
    const { container } = render(<ArticleCard article={article()} variant="feed" />);

    expect(container.querySelector("img")).toHaveAttribute(
      "sizes",
      "(max-width: 699px) 88px, 176px",
    );
  });

  it("görseli olmayan haberde yer adını taşıyan renk yüzeyine düşer", () => {
    render(<ArticleCard article={article({ hero: undefined })} variant="feed" />);

    expect(screen.getByRole("img", { name: "İzmir için görsel alanı" })).toBeInTheDocument();
  });

  it("arama satırı konu, şehir ve tarihi tek satırda verir, okuma süresi göstermez", () => {
    const { container } = render(<ArticleCard article={article()} variant="result" />);

    const date = container.querySelector("time");
    expect(date).toHaveTextContent("27 Ağustos");
    expect(date).toHaveAttribute("datetime", "2026-08-27T06:18:00.000Z");
    expect(screen.getByText("Ekonomi")).toBeInTheDocument();
    expect(screen.getByText("İzmir")).toBeInTheDocument();
    expect(screen.queryByText(/okuma/)).not.toBeInTheDocument();

    expect(container.querySelector("img")).toHaveAttribute(
      "sizes",
      "(max-width: 699px) 96px, 160px",
    );
  });

  it("arama satırı verilen vurgulu özeti özetin yerine koyar", () => {
    render(<ArticleCard article={article()} variant="result" excerpt={<p>vurgulu özet</p>} />);

    expect(screen.getByText("vurgulu özet")).toBeInTheDocument();
    expect(
      screen.queryByText("Yeni hattın bölge ihracatına katkısı bekleniyor."),
    ).not.toBeInTheDocument();
  });

  it("tarihsiz arama satırında tarih ayracı bırakmaz", () => {
    const { container } = render(
      <ArticleCard
        article={article({ publishedLabel: "", publishedAt: undefined })}
        variant="result"
      />,
    );

    expect(container.querySelector("time")).toBeNull();
  });

  it("timeline satırı görselsiz kalır ve tarihi altbilgisinde tutar", () => {
    const { container } = render(<ArticleCard article={article()} variant="timeline" />);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("time")).toBeNull();
    expect(screen.getByText(/27 Ağustos · 4 dk okuma/)).toBeInTheDocument();
  });
});
