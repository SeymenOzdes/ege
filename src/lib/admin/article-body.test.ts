import { describe, expect, it } from "vitest";
import {
  createBodyBlockDraft,
  moveBodyBlock,
  toBodyBlocks,
  toBodyDrafts,
  toBodyText,
  type BodyBlockDraft,
} from "@/lib/admin/article-body";
import { parseArticleBody } from "@/lib/articles";

const drafts: BodyBlockDraft[] = [
  { type: "paragraph", text: "İzmir'de sabah trafiği erken açıldı.", attribution: "" },
  { type: "heading", text: "Ne değişti", attribution: "" },
  { type: "quote", text: "Hat boyunca üç durak eklendi.", attribution: "Ulaşım daire başkanı" },
];

describe("toBodyBlocks", () => {
  it("boş metinli blokları düşürür", () => {
    expect(
      toBodyBlocks([
        drafts[0],
        { type: "paragraph", text: "   ", attribution: "" },
        createBodyBlockDraft("heading"),
      ]),
    ).toEqual([{ type: "paragraph", text: "İzmir'de sabah trafiği erken açıldı." }]);
  });

  it("alıntı olmayan blokta taşınan kaynağı kaydetmez", () => {
    // Editör tür değiştirip geri aldığında `attribution` yerinde kalır; jsonb'ye
    // yalnızca alıntılarda yazılmalı.
    expect(toBodyBlocks([{ type: "paragraph", text: "Metin", attribution: "Artık" }])).toEqual([
      { type: "paragraph", text: "Metin" },
    ]);
  });
});

describe("okuma ve yazma tarafı", () => {
  it("`parseArticleBody` yazılan diziyi olduğu gibi geri verir", () => {
    // İki taraf ayrışırsa editörün kaydettiği bir blok haber sayfasında sessizce
    // kaybolurdu; bu test o ayrışmayı yakalıyor.
    const stored = toBodyBlocks(drafts);
    expect(parseArticleBody(stored)).toEqual(stored);
  });

  it("kaydedilip yeniden açılan haber aynı blokları gösterir", () => {
    expect(toBodyDrafts(parseArticleBody(toBodyBlocks(drafts)))).toEqual(drafts);
  });
});

describe("toBodyText", () => {
  it("arama vektörünün okuyacağı düz metni üretir", () => {
    expect(toBodyText(toBodyBlocks(drafts))).toBe(
      "İzmir'de sabah trafiği erken açıldı.\n\nNe değişti\n\nHat boyunca üç durak eklendi. Ulaşım daire başkanı",
    );
  });

  it("gövdesi olmayan haberde boş kalır", () => {
    expect(toBodyText([])).toBe("");
  });
});

describe("moveBodyBlock", () => {
  it("bloğu komşusuyla yer değiştirir", () => {
    expect(moveBodyBlock(drafts, 0, 1).map((block) => block.type)).toEqual([
      "heading",
      "paragraph",
      "quote",
    ]);
  });

  it("dizinin ucundan taşma isteğini yok sayar", () => {
    expect(moveBodyBlock(drafts, 0, -1)).toEqual(drafts);
    expect(moveBodyBlock(drafts, 2, 1)).toEqual(drafts);
  });
});
