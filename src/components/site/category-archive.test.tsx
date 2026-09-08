import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryArchiveView } from "@/components/site/category-archive";
import type { ArticlePreview } from "@/lib/homepage";

// The rail's newsletter panel pulls in a server action, which has no place in a
// layout test — the form's own behaviour is covered where that action lives.
vi.mock("@/components/site/newsletter-form", () => ({
  NewsletterForm: () => <form data-testid="bulten-formu" />,
}));

function article(id: string, title: string): ArticlePreview {
  return {
    id,
    slug: `haber-${id}`,
    title,
    summary: `${title} özeti`,
    topic: "Gündem",
    topicSlug: "gundem",
    location: "İzmir",
    publishedLabel: "27 Ağustos",
    readingTime: "1 dk",
    mediaTone: "sky",
  };
}

const facets = {
  topics: [
    { name: "Gündem", slug: "gundem" },
    { name: "Ekonomi", slug: "ekonomi" },
  ],
  locations: [
    { name: "İzmir", slug: "izmir" },
    { name: "Aydın", slug: "aydin" },
  ],
};

function renderView(overrides: Partial<Parameters<typeof CategoryArchiveView>[0]> = {}) {
  return render(
    <CategoryArchiveView
      eyebrow="Haber dosyası"
      title="Gündem"
      description="Ege Bölgesi gündemi ve kamusal yaşam."
      kind="topic"
      slug="gundem"
      tone="sky"
      entries={[article("1", "Birinci haber"), article("2", "İkinci haber")]}
      facets={facets}
      basePath="/kategori/gundem"
      currentPage={1}
      totalPages={2}
      total={8}
      {...overrides}
    />,
  );
}

describe("CategoryArchiveView", () => {
  it("ilk sayfada manşet haberi öne çıkarır", () => {
    const { container } = renderView();

    // The lead is the only entry carrying the feature treatment; the rest are rows.
    expect(container.querySelectorAll('[class*="articleCardfeature"]')).toHaveLength(1);
    expect(container.querySelectorAll('[class*="articleCardlist"]')).toHaveLength(1);
  });

  it("sonraki sayfalarda manşet yerine sıradan satırlar gösterir", () => {
    // A hero on page 2 of an archive is noise, not hierarchy.
    const { container } = renderView({ currentPage: 2 });

    expect(container.querySelectorAll('[class*="articleCardfeature"]')).toHaveLength(0);
    expect(container.querySelectorAll('[class*="articleCardlist"]')).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent("Sayfa 2 / 2");
  });

  it("bulunulan dosyayı rafta işaretler", () => {
    renderView();
    const rail = screen.getByRole("complementary");

    expect(within(rail).getByRole("link", { name: "Gündem" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(rail).getByRole("link", { name: "Ekonomi" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("şehir arşivinde dosya değil şehir çipini işaretler", () => {
    renderView({ kind: "location", slug: "izmir", title: "İzmir" });
    const rail = screen.getByRole("complementary");

    expect(within(rail).getByRole("link", { name: "İzmir" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(rail).getByRole("link", { name: "Gündem" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("açıklamayı yalnızca bir kez yazar", () => {
    // The rail used to repeat the lede verbatim, printing the same sentence twice.
    renderView();

    expect(screen.getAllByText("Ege Bölgesi gündemi ve kamusal yaşam.")).toHaveLength(1);
  });

  it("sayımı sessiz bir satıra indirir", () => {
    renderView();

    expect(screen.getByRole("status")).toHaveTextContent("8 haber · 2 sayfa");
  });

  it("boş arşivde bile rafı gösterir, böylece sayfa çıkmaz sokak olmaz", () => {
    renderView({ entries: [], total: 0, totalPages: 1 });

    // One live region, not two: the count reports the emptiness.
    expect(screen.getByRole("status")).toHaveTextContent("Henüz yayınlanmış haber yok");
    expect(screen.getByText("Bu dosyada henüz bir haber yok.")).toBeTruthy();
    expect(
      within(screen.getByRole("complementary")).getByRole("link", { name: "Ekonomi" }),
    ).toBeTruthy();
  });

  it("bağlantı hatasında boş arşiv demez", () => {
    renderView({ entries: [], total: 0, loadError: true });

    expect(screen.getByRole("alert")).toHaveTextContent("Haber akışına şu anda ulaşamıyoruz.");
    expect(screen.queryByText("Bu dosyada henüz bir haber yok.")).toBeNull();
  });
});
