/**
 * Blok editörünün seri hâle getirme / çözümleme çifti.
 *
 * Okuma tarafı `parseArticleBody` (`@/lib/articles`) ile aynı birliği daraltır;
 * iki taraf birbirine karşı test edilir (`article-body.test.ts`). Bu modül
 * `server-only` değildir ve Supabase'e dokunmaz: `body-block-editor.tsx` bir
 * istemci bileşeni ve bu tipleri buradan okuyor.
 */
import type { ArticleBodyBlock } from "@/lib/articles";

export const bodyBlockTypes = ["paragraph", "heading", "quote"] as const;

export type BodyBlockType = (typeof bodyBlockTypes)[number];

export const bodyBlockLabels: Record<BodyBlockType, string> = {
  paragraph: "Paragraf",
  heading: "Ara başlık",
  quote: "Alıntı",
};

/**
 * Editördeki bir blok. Her alan string: yarım yazılmış bir alıntı, türü
 * değiştirilip geri alındığında da yerinde kalsın diye `attribution` alıntı
 * olmayan bloklarda da taşınır.
 */
export type BodyBlockDraft = {
  type: BodyBlockType;
  text: string;
  attribution: string;
};

export function isBodyBlockType(value: unknown): value is BodyBlockType {
  return bodyBlockTypes.includes(value as BodyBlockType);
}

export function createBodyBlockDraft(type: BodyBlockType = "paragraph"): BodyBlockDraft {
  return { type, text: "", attribution: "" };
}

/**
 * Editör blokları → `articles.body` jsonb dizisi.
 *
 * Boş metinli blok düşer: editör bir blok ekleyip doldurmadan kaydettiğinde
 * `parseArticleBody` zaten onu okuma tarafında atardı, kaydetmemek daha dürüst.
 */
export function toBodyBlocks(drafts: readonly BodyBlockDraft[]): ArticleBodyBlock[] {
  return drafts.flatMap((draft): ArticleBodyBlock[] => {
    const text = draft.text.trim();
    if (text === "") return [];

    if (draft.type === "quote") {
      return [{ type: "quote", text, attribution: draft.attribution.trim() }];
    }

    return [{ type: draft.type, text }];
  });
}

/** `articles.body` çözümlenmiş hâli → editör blokları. */
export function toBodyDrafts(blocks: readonly ArticleBodyBlock[]): BodyBlockDraft[] {
  return blocks.map((block) => ({
    type: block.type,
    text: block.text,
    attribution: block.type === "quote" ? block.attribution : "",
  }));
}

/**
 * `articles.body_text` — `search_vector`'ın indekslediği ve `countWords`'ün
 * ölçtüğü düz metin. Alıntının kaynağı da giriyor: bir haber, içinde konuşan
 * kişinin adıyla da aranabilmeli.
 */
export function toBodyText(blocks: readonly ArticleBodyBlock[]): string {
  return blocks
    .map((block) =>
      block.type === "quote" && block.attribution
        ? `${block.text} ${block.attribution}`
        : block.text,
    )
    .join("\n\n");
}

/**
 * Bir bloğu bir sıra yukarı veya aşağı taşır. Dizinin ucundan taşma isteği
 * diziyi olduğu gibi döndürür, böylece editördeki ilk/son bloğun düğmesi
 * basıldığında hiçbir şey olmaz.
 */
export function moveBodyBlock(
  drafts: readonly BodyBlockDraft[],
  index: number,
  offset: number,
): BodyBlockDraft[] {
  const target = index + offset;
  if (index < 0 || index >= drafts.length || target < 0 || target >= drafts.length) {
    return [...drafts];
  }

  const next = [...drafts];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
