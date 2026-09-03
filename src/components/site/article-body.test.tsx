import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BodyBlock } from "@/components/site/article-body";
import type { ArticleBodyBlock } from "@/lib/articles";

function renderBlock(block: ArticleBodyBlock, index = 1) {
  return render(<BodyBlock block={block} index={index} />);
}

describe("BodyBlock", () => {
  it("`spans` yokken metni düz basar", () => {
    // TipTap'ten önce kaydedilmiş bloklar bu yoldan geçiyor.
    renderBlock({ type: "paragraph", text: "Hat açıldı." });

    expect(screen.getByText("Hat açıldı.")).toBeInTheDocument();
    expect(document.querySelector("strong")).toBeNull();
  });

  it("işaretleri kendi etiketlerine çıkarır", () => {
    renderBlock({
      type: "paragraph",
      text: "abcd",
      spans: [
        { text: "a", bold: true },
        { text: "b", italic: true },
        { text: "c", underline: true },
        { text: "d", strike: true },
      ],
    });

    expect(screen.getByText("a").tagName).toBe("STRONG");
    expect(screen.getByText("b").tagName).toBe("EM");
    expect(screen.getByText("c").tagName).toBe("U");
    expect(screen.getByText("d").tagName).toBe("S");
  });

  it("ara başlık düzeyini etiketleştirir", () => {
    renderBlock({ type: "heading", level: 3, text: "Sefer saatleri" });
    expect(screen.getByRole("heading", { level: 3, name: "Sefer saatleri" })).toBeInTheDocument();
  });

  it("madde ve numaralı listeyi doğru etikete çizer", () => {
    const { unmount } = renderBlock({
      type: "list",
      ordered: false,
      items: [{ text: "İlk sefer" }, { text: "Son sefer" }],
    });

    expect(document.querySelector("ul")).not.toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    unmount();

    renderBlock({ type: "list", ordered: true, items: [{ text: "Durak eklendi" }] });
    expect(document.querySelector("ol")).not.toBeNull();
  });

  it("alıntıyı kaynağıyla birlikte çizer", () => {
    renderBlock({ type: "quote", text: "Üç durak eklendi.", attribution: "Daire başkanı" });

    expect(screen.getByText("Daire başkanı").tagName).toBe("CITE");
    expect(screen.getByRole("blockquote")).toHaveTextContent("Üç durak eklendi.");
  });

  it("dış bağlantıyı yeni sekmede ve `noopener` ile açar", () => {
    renderBlock({
      type: "paragraph",
      text: "kaynak",
      spans: [{ text: "kaynak", href: "https://ege.dev/rapor" }],
    });

    const link = screen.getByRole("link", { name: "kaynak" });
    expect(link).toHaveAttribute("href", "https://ege.dev/rapor");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("site içi bağlantıyı aynı sekmede bırakır", () => {
    renderBlock({
      type: "paragraph",
      text: "haber",
      spans: [{ text: "haber", href: "/haber/tramvay" }],
    });

    expect(screen.getByRole("link", { name: "haber" })).not.toHaveAttribute("target");
  });

  it("güvensiz adresi hiçbir koşulda `href`'e yazmaz", () => {
    // Çağıranlar zaten süzüyor; bu bileşen DOM'a yazan son halka olduğu için
    // süzgeç burada da duruyor.
    renderBlock({
      type: "paragraph",
      text: "tıkla",
      spans: [{ text: "tıkla", href: "javascript:alert(1)" }],
    });

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText("tıkla")).toBeInTheDocument();
  });
});
