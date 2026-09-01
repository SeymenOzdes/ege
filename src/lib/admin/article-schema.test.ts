import { describe, expect, it } from "vitest";
import {
  SLUG_PATTERN,
  articleFormSchema,
  canTransition,
  getAllowedTransitions,
  readArticleForm,
  slugify,
  toEditorialInstant,
  toEditorialLocalInput,
} from "@/lib/admin/article-schema";

function buildFormData(overrides: Record<string, string> = {}, blocks = true) {
  const formData = new FormData();
  const fields: Record<string, string> = {
    title: "Bornova'da yeni tramvay hattı açıldı",
    slug: "bornovada-yeni-tramvay-hatti-acildi",
    summary: "Hat, sabah saatlerinde ilk seferini yaptı.",
    articleType: "NEWS",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);

  if (blocks) {
    formData.append("blockType", "paragraph");
    formData.append("blockText", "İlk sefer sabah 06.00'da yapıldı.");
    formData.append("blockAttribution", "");
  }

  return formData;
}

describe("slugify", () => {
  it("Türkçe harfleri şemanın kabul ettiği ASCII adrese indirger", () => {
    expect(slugify("Çeşme'de Ilık Bir Güz Şöleni")).toBe("cesmede-ilik-bir-guz-soleni");
    expect(SLUG_PATTERN.test(slugify("Çeşme'de Ilık Bir Güz Şöleni"))).toBe(true);
  });

  it("noktalama ve fazla boşluğu tek tireye indirir, uçlarda tire bırakmaz", () => {
    expect(slugify("  --Ege'nin   Nabzı!!  ")).toBe("egenin-nabzi");
  });

  it("harf içermeyen başlıkta boş döner", () => {
    // Boş adres `SLUG_PATTERN`'e uymaz; şema editörden elle adres ister.
    expect(slugify("!!! ???")).toBe("");
  });
});

describe("editoryal saat dönüşümü", () => {
  it("`datetime-local` değerini UTC+03:00 olarak yorumlar", () => {
    expect(toEditorialInstant("2026-09-01T14:30")).toBe("2026-09-01T11:30:00.000Z");
  });

  it("eksik biçimi reddeder", () => {
    expect(toEditorialInstant("2026-09-01")).toBeNull();
    expect(toEditorialInstant("")).toBeNull();
  });

  it("ISO anını aynı duvar saatine geri çevirir", () => {
    expect(toEditorialLocalInput("2026-09-01T11:30:00.000Z")).toBe("2026-09-01T14:30");
    expect(toEditorialLocalInput(null)).toBe("");
  });
});

describe("canTransition", () => {
  it("plandaki akışı izler", () => {
    expect(canTransition("DRAFT", "IN_REVIEW")).toBe(true);
    expect(canTransition("IN_REVIEW", "PUBLISHED")).toBe(true);
    expect(canTransition("SCHEDULED", "PUBLISHED")).toBe(true);
    expect(canTransition("PUBLISHED", "ARCHIVED")).toBe(true);
    expect(canTransition("ARCHIVED", "DRAFT")).toBe(true);
  });

  it("taslağın incelemeyi atlayıp yayına çıkmasına izin vermez", () => {
    expect(canTransition("DRAFT", "PUBLISHED")).toBe(false);
    expect(canTransition("DRAFT", "SCHEDULED")).toBe(false);
  });

  it("yayımlanmış haberi taslağa geri almaz", () => {
    // Adres kamuya açılmıştır; geri çekme yolu arşivlemedir.
    expect(getAllowedTransitions("PUBLISHED")).toEqual(["ARCHIVED"]);
  });
});

describe("articleFormSchema", () => {
  it("formu şemanın beklediği değerlere çevirir", () => {
    const parsed = articleFormSchema.parse(readArticleForm(buildFormData()));

    expect(parsed.title).toBe("Bornova'da yeni tramvay hattı açıldı");
    expect(parsed.summary).toBe("Hat, sabah saatlerinde ilk seferini yaptı.");
    expect(parsed.blocks).toEqual([
      { type: "paragraph", text: "İlk sefer sabah 06.00'da yapıldı.", attribution: "" },
    ]);
  });

  it("boş metin alanlarını null yapar, boş ilişki alanlarını da", () => {
    const parsed = articleFormSchema.parse(
      readArticleForm(buildFormData({ summary: "", seoTitle: "", topicId: "" })),
    );

    expect(parsed.summary).toBeNull();
    expect(parsed.seoTitle).toBeNull();
    expect(parsed.topicId).toBeNull();
  });

  it("son dakika işareti yokken bitiş saatini düşürür", () => {
    // `articles_breaking_expiry` bu bileşimi zaten reddederdi.
    const parsed = articleFormSchema.parse(
      readArticleForm(buildFormData({ breakingExpiresAt: "2026-09-01T18:00" })),
    );

    expect(parsed.isBreaking).toBe(false);
    expect(parsed.breakingExpiresAt).toBeNull();
  });

  it("son dakika işaretliyken bitiş saatini korur", () => {
    const formData = buildFormData({ breakingExpiresAt: "2026-09-01T18:00" });
    formData.set("isBreaking", "on");

    const parsed = articleFormSchema.parse(readArticleForm(formData));
    expect(parsed.breakingExpiresAt).toBe("2026-09-01T15:00:00.000Z");
  });

  it("şema kalıbına uymayan adresi reddeder", () => {
    const result = articleFormSchema.safeParse(
      readArticleForm(buildFormData({ slug: "Büyük Slug" })),
    );
    expect(result.success).toBe(false);
  });

  it("gövdesiz haberi reddeder", () => {
    const result = articleFormSchema.safeParse(readArticleForm(buildFormData({}, false)));
    expect(result.success).toBe(false);
  });

  it("kaynağı yazılmamış alıntıyı reddeder", () => {
    const formData = buildFormData({}, false);
    formData.append("blockType", "quote");
    formData.append("blockText", "Hat boyunca üç durak eklendi.");
    formData.append("blockAttribution", "");

    const result = articleFormSchema.safeParse(readArticleForm(formData));
    expect(result.success).toBe(false);
  });
});
