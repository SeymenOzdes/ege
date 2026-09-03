import { describe, expect, it } from "vitest";
import {
  blocksToTiptapDoc,
  tiptapDocToBlocks,
  toBodyText,
  type TiptapNode,
} from "@/lib/admin/article-body";
import { parseArticleBody, type ArticleBodyBlock } from "@/lib/articles";

const blocks: ArticleBodyBlock[] = [
  { type: "paragraph", text: "İzmir'de sabah trafiği erken açıldı." },
  { type: "heading", level: 2, text: "Ne değişti" },
  {
    type: "paragraph",
    text: "Hat, Bornova'dan geçiyor.",
    spans: [{ text: "Hat, " }, { text: "Bornova", bold: true }, { text: "'dan geçiyor." }],
  },
  { type: "heading", level: 3, text: "Sefer saatleri" },
  {
    type: "list",
    ordered: false,
    items: [{ text: "İlk sefer 06.00" }, { text: "Son sefer 23.30" }],
  },
  {
    type: "list",
    ordered: true,
    items: [{ text: "Durak eklendi" }],
  },
  {
    type: "quote",
    text: "Hat boyunca üç durak eklendi.",
    attribution: "Ulaşım daire başkanı",
  },
];

/** Editörden gelen bir belgeyi elle kurmak için küçük yardımcı. */
function text(value: string, marks?: TiptapNode["marks"]): TiptapNode {
  return marks ? { type: "text", text: value, marks } : { type: "text", text: value };
}

describe("blocksToTiptapDoc ↔ tiptapDocToBlocks", () => {
  it("her blok türünü kayıpsız geri verir", () => {
    expect(tiptapDocToBlocks(blocksToTiptapDoc(blocks))).toEqual(blocks);
  });

  it("gövdesiz haberde editöre boş bir paragraf verir", () => {
    // Boş bir `doc` ProseMirror şemasına uymuyor; editör kurulurken patlardı.
    expect(blocksToTiptapDoc([])).toEqual({ type: "doc", content: [{ type: "paragraph" }] });
    expect(tiptapDocToBlocks(blocksToTiptapDoc([]))).toEqual([]);
  });
});

describe("tiptapDocToBlocks", () => {
  it("boş ve yalnızca boşluktan oluşan blokları düşürür", () => {
    const doc: TiptapNode = {
      type: "doc",
      content: [
        { type: "paragraph" },
        { type: "paragraph", content: [text("   ")] },
        { type: "paragraph", content: [text("Kalan")] },
      ],
    };

    expect(tiptapDocToBlocks(doc)).toEqual([{ type: "paragraph", text: "Kalan" }]);
  });

  it("baştaki ve sondaki boşluğu parçalar üzerinden kırpar", () => {
    // Metin üzerinde kırpılsaydı `text`, parçaların birleşimi olmaktan çıkardı.
    const [block] = tiptapDocToBlocks({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [text("  Yeni "), text("hat", [{ type: "bold" }]), text(" açıldı  ")],
        },
      ],
    });

    expect(block).toEqual({
      type: "paragraph",
      text: "Yeni hat açıldı",
      spans: [{ text: "Yeni " }, { text: "hat", bold: true }, { text: " açıldı" }],
    });
  });

  it("tek ve işaretsiz parçada `spans` yazmaz", () => {
    // TipTap öncesi kaydedilmiş satırlar dokunulmadan kaydedildiğinde aynı
    // jsonb'yi üretmeli; yoksa her açıp kapama gövdeyi şişirirdi.
    const [block] = tiptapDocToBlocks({
      type: "doc",
      content: [{ type: "paragraph", content: [text("Düz metin")] }],
    });

    expect(block).toEqual({ type: "paragraph", text: "Düz metin" });
    expect(block).not.toHaveProperty("spans");
  });

  it("aynı biçimdeki komşu parçaları birleştirir", () => {
    const [block] = tiptapDocToBlocks({
      type: "doc",
      content: [{ type: "paragraph", content: [text("İki "), text("parça")] }],
    });

    expect(block).toEqual({ type: "paragraph", text: "İki parça" });
  });

  it("bütün işaretleri ve bağlantıyı taşır", () => {
    const [block] = tiptapDocToBlocks({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            text("a", [{ type: "bold" }, { type: "italic" }]),
            text("b", [{ type: "underline" }, { type: "strike" }]),
            text("c", [{ type: "link", attrs: { href: "https://ege.dev" } }]),
          ],
        },
      ],
    });

    expect(block).toEqual({
      type: "paragraph",
      text: "abc",
      spans: [
        { text: "a", bold: true, italic: true },
        { text: "b", underline: true, strike: true },
        { text: "c", href: "https://ege.dev" },
      ],
    });
  });

  it("güvensiz bağlantıyı düşürür, güvenli olanı korur", () => {
    const [block] = tiptapDocToBlocks({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            text("kötü", [{ type: "link", attrs: { href: "javascript:alert(1)" } }]),
            text(" | "),
            text("iyi", [{ type: "link", attrs: { href: "/haber/tramvay" } }]),
          ],
        },
      ],
    });

    expect(block).toEqual({
      type: "paragraph",
      text: "kötü | iyi",
      spans: [{ text: "kötü | " }, { text: "iyi", href: "/haber/tramvay" }],
    });
  });

  it("ara başlık düzeyini 2 ve 3 ile sınırlar", () => {
    const [two, three] = tiptapDocToBlocks({
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [text("Bir")] },
        { type: "heading", attrs: { level: 3 }, content: [text("Üç")] },
      ],
    });

    expect(two).toEqual({ type: "heading", level: 2, text: "Bir" });
    expect(three).toEqual({ type: "heading", level: 3, text: "Üç" });
  });

  it("alıntının kaynağını düğüm özniteliğinden okur ve paragrafları birleştirir", () => {
    const [block] = tiptapDocToBlocks({
      type: "doc",
      content: [
        {
          type: "blockquote",
          attrs: { attribution: "  Ulaşım daire başkanı  " },
          content: [
            { type: "paragraph", content: [text("İlk cümle.")] },
            { type: "paragraph", content: [text("İkinci cümle.")] },
          ],
        },
      ],
    });

    expect(block).toEqual({
      type: "quote",
      text: "İlk cümle. İkinci cümle.",
      attribution: "Ulaşım daire başkanı",
    });
  });

  it("satır sonunu boşluğa indirir", () => {
    const [block] = tiptapDocToBlocks({
      type: "doc",
      content: [{ type: "paragraph", content: [text("Bir"), { type: "hardBreak" }, text("iki")] }],
    });

    expect(block).toEqual({ type: "paragraph", text: "Bir iki" });
  });

  it("iç içe listeyi düzleştirir", () => {
    // Blok modelinde iç içe liste yok; içeriği kaybetmektense düzleştirmek yeğ.
    const [block] = tiptapDocToBlocks({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [text("Üst madde")] },
                {
                  type: "bulletList",
                  content: [
                    {
                      type: "listItem",
                      content: [{ type: "paragraph", content: [text("Alt madde")] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(block).toEqual({
      type: "list",
      ordered: false,
      items: [{ text: "Üst madde" }, { text: "Alt madde" }],
    });
  });

  it("tanımadığı düğümü sessizce atar", () => {
    expect(
      tiptapDocToBlocks({
        type: "doc",
        content: [{ type: "horizontalRule" }, { type: "paragraph", content: [text("Kalan")] }],
      }),
    ).toEqual([{ type: "paragraph", text: "Kalan" }]);
  });
});

describe("okuma ve yazma tarafı", () => {
  it("`parseArticleBody` yazılan diziyi olduğu gibi geri verir", () => {
    // İki taraf ayrışırsa editörün kaydettiği bir blok haber sayfasında sessizce
    // kaybolurdu; bu test o ayrışmayı yakalıyor.
    expect(parseArticleBody(blocks)).toEqual(blocks);
  });

  it("TipTap'ten önce kaydedilmiş satırları okumayı sürdürür", () => {
    const legacy = [
      { type: "paragraph", text: "Eski paragraf" },
      { type: "heading", text: "Eski ara başlık" },
      { type: "quote", text: "Eski alıntı", attribution: "Kaynak" },
    ];

    expect(parseArticleBody(legacy)).toEqual([
      { type: "paragraph", text: "Eski paragraf" },
      // `level` taşımayan bir ara başlık H2 sayılıyor.
      { type: "heading", level: 2, text: "Eski ara başlık" },
      { type: "quote", text: "Eski alıntı", attribution: "Kaynak" },
    ]);
  });

  it("eski satır editörde açılıp aynen kaydedilirse aynı jsonb'yi üretir", () => {
    const legacy = [{ type: "paragraph", text: "Eski paragraf" }];
    const reopened = tiptapDocToBlocks(blocksToTiptapDoc(parseArticleBody(legacy)));

    expect(reopened).toEqual(legacy);
  });

  it("eski ara başlık editörde açılıp aynen kaydedilince örtük H2'yi açık yazar", () => {
    // Paragraf/alıntının aksine ara başlık bayt bayt aynı kalmıyor: H2/H3 desteği
    // `level`'ı zorunlu bir alana çevirdi, bu yüzden okuma tarafındaki örtük
    // varsayım (level yoksa H2) tekrar yazılırken açık hale geliyor. Anlam
    // değişmiyor — render ve arama metni etkilenmiyor — ama depodaki jsonb
    // artık girdiyle bayt bayt eşleşmiyor; bu, gerçek bir haberi yeniden
    // kaydederek doğrulandı.
    const legacy = [{ type: "heading", text: "Eski ara başlık" }];
    const reopened = tiptapDocToBlocks(blocksToTiptapDoc(parseArticleBody(legacy)));

    expect(reopened).toEqual([{ type: "heading", level: 2, text: "Eski ara başlık" }]);
  });

  it("okuma tarafı da güvensiz bağlantıyı süzer", () => {
    const stored = [
      {
        type: "paragraph",
        text: "tıkla",
        spans: [{ text: "tıkla", href: "javascript:alert(1)" }],
      },
    ];

    expect(parseArticleBody(stored)).toEqual([
      { type: "paragraph", text: "tıkla", spans: [{ text: "tıkla" }] },
    ]);
  });

  it("`text` ile `spans` ayrışmışsa metni parçalardan yeniden üretir", () => {
    const stored = [{ type: "paragraph", text: "yalan", spans: [{ text: "doğru" }] }];

    expect(parseArticleBody(stored)).toEqual([
      { type: "paragraph", text: "doğru", spans: [{ text: "doğru" }] },
    ]);
  });
});

describe("toBodyText", () => {
  it("arama vektörünün okuyacağı düz metni üretir", () => {
    expect(toBodyText(blocks)).toBe(
      [
        "İzmir'de sabah trafiği erken açıldı.",
        "Ne değişti",
        "Hat, Bornova'dan geçiyor.",
        "Sefer saatleri",
        "İlk sefer 06.00\nSon sefer 23.30",
        "Durak eklendi",
        "Hat boyunca üç durak eklendi. Ulaşım daire başkanı",
      ].join("\n\n"),
    );
  });

  it("gövdesi olmayan haberde boş kalır", () => {
    expect(toBodyText([])).toBe("");
  });
});
