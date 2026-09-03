import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NewsEditor } from "@/components/admin/news-editor";
import type { ArticleBodyBlock } from "@/lib/articles";

/** Yazma yüzeyi: `editorProps` ile verilen erişilebilir ad üzerinden bulunuyor. */
function getSurface() {
  return screen.getByRole("textbox", { name: "Haber metni" });
}

async function mountEditor(defaultBlocks: ArticleBodyBlock[] = []) {
  const onChange = vi.fn<(blocks: ArticleBodyBlock[]) => void>();
  render(<NewsEditor defaultBlocks={defaultBlocks} onChange={onChange} />);

  // `immediatelyRender: false` yüzünden editör ilk çizimde değil, ilk
  // etkiden sonra kuruluyor.
  await screen.findByRole("toolbar", { name: "Metin biçimlendirme" });
  return { onChange, user: userEvent.setup() };
}

describe("NewsEditor", () => {
  it("kayıtlı blokları yazma yüzeyine yükler", async () => {
    await mountEditor([
      { type: "heading", level: 2, text: "Ne değişti" },
      { type: "paragraph", text: "Hat açıldı." },
    ]);

    expect(getSurface()).toHaveTextContent("Ne değişti");
    expect(getSurface().querySelector("h2")).not.toBeNull();
  });

  it("yazılan metni blok olarak yukarı verir", async () => {
    const { onChange, user } = await mountEditor();

    await user.click(getSurface());
    await user.keyboard("Hat açıldı.");

    expect(onChange).toHaveBeenLastCalledWith([{ type: "paragraph", text: "Hat açıldı." }]);
  });

  it("araç çubuğu düğmesi biçimi uygular ve basılı durumunu gösterir", async () => {
    const { onChange, user } = await mountEditor();

    expect(screen.getByRole("button", { name: "Kalın" })).toHaveAttribute("aria-pressed", "false");

    await user.click(getSurface());
    await user.keyboard("Hat");
    await user.keyboard("{Control>}a{/Control}");
    await user.click(screen.getByRole("button", { name: "Kalın" }));

    expect(screen.getByRole("button", { name: "Kalın" })).toHaveAttribute("aria-pressed", "true");
    expect(onChange).toHaveBeenLastCalledWith([
      { type: "paragraph", text: "Hat", spans: [{ text: "Hat", bold: true }] },
    ]);
  });

  it("markdown kısayolu ara başlık açar", async () => {
    const { onChange, user } = await mountEditor();

    await user.click(getSurface());
    await user.keyboard("## Ne değişti");

    expect(onChange).toHaveBeenLastCalledWith([{ type: "heading", level: 2, text: "Ne değişti" }]);
  });

  it("alıntı kaynağı alanı yalnızca imleç alıntıdayken görünür", async () => {
    const { onChange, user } = await mountEditor();

    expect(screen.queryByLabelText("Alıntı kaynağı")).toBeNull();

    await user.click(getSurface());
    await user.keyboard("> Üç durak eklendi.");

    const attribution = await screen.findByLabelText("Alıntı kaynağı");
    await user.type(attribution, "Daire başkanı");

    expect(onChange).toHaveBeenLastCalledWith([
      { type: "quote", text: "Üç durak eklendi.", attribution: "Daire başkanı" },
    ]);
  });

  it("geçersiz bağlantı adresini reddeder ve uyarır", async () => {
    const { user } = await mountEditor();

    await user.click(getSurface());
    await user.keyboard("kaynak");
    await user.keyboard("{Control>}a{/Control}");
    await user.click(screen.getByRole("button", { name: "Bağlantı" }));

    await user.type(screen.getByLabelText("Bağlantı adresi"), "ftp://ege.dev");
    await user.click(screen.getByRole("button", { name: "Ekle" }));

    expect(
      screen.getByText("Bağlantı adresi http(s), mailto ya da site içi / ile başlamalı."),
    ).toBeInTheDocument();
    expect(getSurface().querySelector("a")).toBeNull();
  });

  it("kelime ve karakter sayacını gösterir", async () => {
    const { user } = await mountEditor();

    await user.click(getSurface());
    await user.keyboard("Hat açıldı");

    expect(screen.getByText("2 kelime")).toBeInTheDocument();
    expect(screen.getByText("~1 dk okuma")).toBeInTheDocument();
  });
});
