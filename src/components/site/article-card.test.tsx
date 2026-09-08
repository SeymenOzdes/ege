import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleCard } from "@/components/site/article-card";
import type { ArticlePreview } from "@/lib/homepage";

// `feed` and `timeline` are the two variants that branch inside the component
// rather than in CSS alone, and they branch in opposite directions: `feed` leads
// with a dateline and a thumbnail, `timeline` has neither picture nor gutter.
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

describe("ArticleCard", () => {
  it("feed satırı tarihi kendi sütununda, küçük görselin yanında gösterir", () => {
    const { container } = render(<ArticleCard article={article()} variant="feed" />);

    const dateline = container.querySelector("time");
    expect(dateline).not.toBeNull();
    expect(dateline).toHaveTextContent("27 Ağustos");

    expect(screen.getByAltText("Liman görüntüsü")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      "Ege limanında yeni hat açıldı",
    );
    expect(screen.getByText("Yeni hattın bölge ihracatına katkısı bekleniyor.")).toBeInTheDocument();
  });

  it("feed satırının altbilgisi tarihi tekrar etmez", () => {
    render(<ArticleCard article={article()} variant="feed" />);

    // The gutter already carries it, so only the reading time is left below.
    expect(screen.queryByText(/27 Ağustos ·/)).not.toBeInTheDocument();
    expect(screen.getByText(/4 dk okuma/)).toBeInTheDocument();
  });

  it("görseli olmayan haberde yer adını taşıyan renk yüzeyine düşer", () => {
    render(<ArticleCard article={article({ hero: undefined })} variant="feed" />);

    expect(screen.getByRole("img", { name: "İzmir için görsel alanı" })).toBeInTheDocument();
  });

  it("timeline satırı görselsiz kalır ve tarihi altbilgisinde tutar", () => {
    const { container } = render(<ArticleCard article={article()} variant="timeline" />);

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("time")).toBeNull();
    expect(screen.getByText(/27 Ağustos · 4 dk okuma/)).toBeInTheDocument();
  });
});
