/**
 * TipTap belgesi ↔ `articles.body` jsonb dizisi çevirisi.
 *
 * Bu modül bilerek TipTap import etmiyor: belge yapısı aşağıdaki `TiptapNode`
 * ile yapısal olarak tanımlanıyor, böylece çeviri saf TypeScript kalıyor ve
 * `article-body.test.ts` içinde DOM'suz test edilebiliyor. TipTap'i import eden
 * tek dosya `news-editor.tsx`.
 *
 * Okuma tarafı `parseArticleBody` (`@/lib/articles`) ile aynı birliği daraltır;
 * iki taraf birbirine karşı test edilir. Bu modül `server-only` değildir ve
 * Supabase'e dokunmaz.
 */
import { sanitizeHref } from "@/lib/article-links";
import type { ArticleBodyBlock, ArticleInlineSpan, ArticleListItem } from "@/lib/articles";

/** `editor.getJSON()` çıktısının bu çevirinin ihtiyaç duyduğu kadarı. */
export type TiptapMark = { type: string; attrs?: Record<string, unknown> };

export type TiptapNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  marks?: TiptapMark[];
  content?: TiptapNode[];
  text?: string;
};

type InlineContent = { text: string; spans?: ArticleInlineSpan[] };

function hasFormatting(span: ArticleInlineSpan): boolean {
  return Boolean(span.bold || span.italic || span.underline || span.strike || span.href);
}

function sameFormatting(a: ArticleInlineSpan, b: ArticleInlineSpan): boolean {
  return (
    a.bold === b.bold &&
    a.italic === b.italic &&
    a.underline === b.underline &&
    a.strike === b.strike &&
    a.href === b.href
  );
}

/** TipTap satır içi düğümleri → parçalar. Satır sonu boşluğa iner: blok modelinde satır yok. */
function toSpans(nodes: readonly TiptapNode[] | undefined): ArticleInlineSpan[] {
  return (nodes ?? []).flatMap((node): ArticleInlineSpan[] => {
    if (node.type === "hardBreak") return [{ text: " " }];
    if (typeof node.text !== "string" || node.text === "") return [];

    const span: ArticleInlineSpan = { text: node.text };
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") span.bold = true;
      else if (mark.type === "italic") span.italic = true;
      else if (mark.type === "underline") span.underline = true;
      else if (mark.type === "strike") span.strike = true;
      else if (mark.type === "link") {
        const href = sanitizeHref(mark.attrs?.href);
        if (href !== undefined) span.href = href;
      }
    }

    return [span];
  });
}

/**
 * Aynı biçimdeki komşu parçaları birleştirir.
 *
 * Reddedilen bir bağlantı iki parçayı aynı biçime düşürebiliyor; birleştirme
 * hem jsonb'yi küçültüyor hem de "tek işaretsiz parça" kuralının daha sık
 * çalışmasını sağlıyor.
 */
function mergeSpans(spans: readonly ArticleInlineSpan[]): ArticleInlineSpan[] {
  return spans.reduce<ArticleInlineSpan[]>((merged, span) => {
    const previous = merged.at(-1);
    if (previous && sameFormatting(previous, span)) {
      merged[merged.length - 1] = { ...previous, text: previous.text + span.text };
      return merged;
    }
    merged.push(span);
    return merged;
  }, []);
}

/**
 * Baştaki ve sondaki boşluğu kırpar.
 *
 * Kırpma metin üzerinde değil parçalar üzerinde yapılıyor: `text` her zaman
 * parçaların birleşimi olmalı, yoksa kaydedilen `body_text` ile çizilen metin
 * ayrışırdı.
 */
function trimSpans(spans: readonly ArticleInlineSpan[]): ArticleInlineSpan[] {
  const trimmed = spans.map((span) => ({ ...span }));

  while (trimmed.length > 0) {
    trimmed[0].text = trimmed[0].text.replace(/^\s+/, "");
    if (trimmed[0].text !== "") break;
    trimmed.shift();
  }

  while (trimmed.length > 0) {
    const last = trimmed[trimmed.length - 1];
    last.text = last.text.replace(/\s+$/, "");
    if (last.text !== "") break;
    trimmed.pop();
  }

  return trimmed;
}

/** Boş kalan blok `undefined` döner ve çağıran onu düşürür. */
function toInlineContent(nodes: readonly TiptapNode[] | undefined): InlineContent | undefined {
  const spans = trimSpans(mergeSpans(toSpans(nodes)));
  if (spans.length === 0) return undefined;

  const text = spans.map((span) => span.text).join("");
  // Tek ve işaretsiz parçada `spans` hiç yazılmıyor: TipTap öncesi kaydedilmiş
  // satırlar dokunulmadan kaydedildiğinde aynı jsonb'yi üretiyor.
  return spans.length === 1 && !hasFormatting(spans[0]) ? { text } : { text, spans };
}

/**
 * Bir blok düğümünün alt bloklarını tek bir satır içi akışa indirger.
 *
 * Çok paragraflı bir alıntı tek bir alıntı bloğuna iniyor; paragraf sınırı
 * boşluğa dönüşsün diye araya satır sonu düğümü konuyor.
 */
function flattenBlockContent(children: readonly TiptapNode[] | undefined): TiptapNode[] {
  return (children ?? []).flatMap((child, index) => {
    if (child.type !== "paragraph" && child.type !== "heading") return [];
    const inner = child.content ?? [];
    return index === 0 ? inner : [{ type: "hardBreak" }, ...inner];
  });
}

/**
 * Liste maddeleri; iç içe listeler düzleştirilerek aynı diziye katılıyor.
 * Blok modelinde iç içe liste yok ve içeriği kaybetmektense düzleştirmek yeğ.
 */
function collectListItems(list: TiptapNode): ArticleListItem[] {
  return (list.content ?? []).flatMap((item): ArticleListItem[] => {
    if (item.type !== "listItem") return [];

    const children = item.content ?? [];
    const inline = toInlineContent(flattenBlockContent(children));
    const nested = children
      .filter((child) => child.type === "bulletList" || child.type === "orderedList")
      .flatMap(collectListItems);

    return inline ? [inline, ...nested] : nested;
  });
}

function toBodyBlock(node: TiptapNode): ArticleBodyBlock[] {
  if (node.type === "bulletList" || node.type === "orderedList") {
    const items = collectListItems(node);
    return items.length > 0 ? [{ type: "list", ordered: node.type === "orderedList", items }] : [];
  }

  if (node.type === "blockquote") {
    const inline = toInlineContent(flattenBlockContent(node.content));
    if (!inline) return [];

    const attribution = node.attrs?.attribution;
    return [
      {
        type: "quote",
        attribution: typeof attribution === "string" ? attribution.trim() : "",
        ...inline,
      },
    ];
  }

  const inline = toInlineContent(node.content);
  if (!inline) return [];

  if (node.type === "paragraph") return [{ type: "paragraph", ...inline }];
  if (node.type === "heading") {
    return [{ type: "heading", level: node.attrs?.level === 3 ? 3 : 2, ...inline }];
  }

  return [];
}

/**
 * `editor.getJSON()` → `articles.body` jsonb dizisi.
 *
 * Boş blok düşer: editör bir paragraf açıp doldurmadan kaydettiğinde
 * `parseArticleBody` zaten onu okuma tarafında atardı, kaydetmemek daha dürüst.
 */
export function tiptapDocToBlocks(doc: TiptapNode | null | undefined): ArticleBodyBlock[] {
  return (doc?.content ?? []).flatMap(toBodyBlock);
}

function toInlineNodes(content: InlineContent): TiptapNode[] {
  const spans = content.spans ?? [{ text: content.text }];

  return spans.flatMap((span): TiptapNode[] => {
    if (span.text === "") return [];

    const marks: TiptapMark[] = [];
    if (span.bold) marks.push({ type: "bold" });
    if (span.italic) marks.push({ type: "italic" });
    if (span.underline) marks.push({ type: "underline" });
    if (span.strike) marks.push({ type: "strike" });
    if (span.href) marks.push({ type: "link", attrs: { href: span.href } });

    return [{ type: "text", text: span.text, ...(marks.length > 0 ? { marks } : {}) }];
  });
}

function toTiptapNode(block: ArticleBodyBlock): TiptapNode {
  if (block.type === "list") {
    return {
      type: block.ordered ? "orderedList" : "bulletList",
      content: block.items.map((item) => ({
        type: "listItem",
        content: [{ type: "paragraph", content: toInlineNodes(item) }],
      })),
    };
  }

  if (block.type === "quote") {
    return {
      type: "blockquote",
      attrs: { attribution: block.attribution },
      content: [{ type: "paragraph", content: toInlineNodes(block) }],
    };
  }

  if (block.type === "heading") {
    return { type: "heading", attrs: { level: block.level }, content: toInlineNodes(block) };
  }

  return { type: "paragraph", content: toInlineNodes(block) };
}

/**
 * Kayıtlı bloklar → editörün açılış belgesi.
 *
 * Gövdesi olmayan haberde tek bir boş paragraf veriliyor; boş bir `doc`
 * ProseMirror şemasına uymuyor ve editör kurulurken hata verirdi.
 */
export function blocksToTiptapDoc(blocks: readonly ArticleBodyBlock[]): TiptapNode {
  const content = blocks.map(toTiptapNode);
  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}

/**
 * `articles.body_text` — `search_vector`'ın indekslediği ve `countWords`'ün
 * ölçtüğü düz metin. Alıntının kaynağı da giriyor: bir haber, içinde konuşan
 * kişinin adıyla da aranabilmeli. Liste maddeleri satır satır katılıyor.
 */
export function toBodyText(blocks: readonly ArticleBodyBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === "list") return block.items.map((item) => item.text).join("\n");
      if (block.type === "quote" && block.attribution) {
        return `${block.text} ${block.attribution}`;
      }
      return block.text;
    })
    .join("\n\n");
}
