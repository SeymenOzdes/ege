"use client";

import {
  bodyBlockLabels,
  bodyBlockTypes,
  createBodyBlockDraft,
  isBodyBlockType,
  moveBodyBlock,
  type BodyBlockDraft,
  type BodyBlockType,
} from "@/lib/admin/article-body";

const fieldClassName =
  "w-full rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal";

const toolButtonClassName =
  "rounded-full border border-[var(--color-line)] px-3 py-1.5 text-xs font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Blok tabanlı gövde editörü — yeni bir bağımlılık eklemeden.
 *
 * Her blok üç paralel alan gönderiyor: `blockType`, `blockText` ve
 * `blockAttribution`. Alıntı olmayan bloklarda kaynak alanı gizleniyor ama
 * formda kalıyor; kaldırılsaydı `readArticleForm` içindeki diziler kayardı.
 */
export function BodyBlockEditor({
  blocks,
  onChange,
}: {
  blocks: BodyBlockDraft[];
  onChange: (blocks: BodyBlockDraft[]) => void;
}) {
  function updateBlock(index: number, patch: Partial<BodyBlockDraft>) {
    onChange(blocks.map((block, current) => (current === index ? { ...block, ...patch } : block)));
  }

  function addBlock(type: BodyBlockType) {
    onChange([...blocks, createBodyBlockDraft(type)]);
  }

  return (
    <section
      aria-labelledby="article-body-heading"
      className="grid gap-4 rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm sm:p-7"
    >
      <div>
        <p className="eyebrow text-[var(--color-teal)]">Gövde</p>
        <h2 className="font-editorial mt-2 text-3xl" id="article-body-heading">
          Haber metni
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
          Metin paragraf, ara başlık ve alıntı bloklarından kuruluyor. Boş bırakılan bloklar
          kaydedilmez.
        </p>
      </div>

      <ol className="grid gap-4">
        {blocks.map((block, index) => (
          <li
            className="grid gap-3 rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] p-4"
            key={index}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="text-[var(--color-ink-muted)]">{index + 1}.</span>
                {/* Etiket `aria-label` ile veriliyor, sarmalayıcı `label` ile değil:
                    sarmalayan bir etiket seçeneklerin metnini de erişilebilir ada
                    katar ve "Blok türüParagrafAra başlıkAlıntı" ortaya çıkar. */}
                <select
                  aria-label={`${index + 1}. blok türü`}
                  className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-sm font-semibold"
                  name="blockType"
                  onChange={(event) => {
                    const value = event.target.value;
                    if (isBodyBlockType(value)) updateBlock(index, { type: value });
                  }}
                  value={block.type}
                >
                  {bodyBlockTypes.map((type) => (
                    <option key={type} value={type}>
                      {bodyBlockLabels[type]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className={toolButtonClassName}
                  disabled={index === 0}
                  onClick={() => onChange(moveBodyBlock(blocks, index, -1))}
                  type="button"
                >
                  ↑ Yukarı
                </button>
                <button
                  className={toolButtonClassName}
                  disabled={index === blocks.length - 1}
                  onClick={() => onChange(moveBodyBlock(blocks, index, 1))}
                  type="button"
                >
                  ↓ Aşağı
                </button>
                <button
                  className={toolButtonClassName}
                  disabled={blocks.length === 1}
                  onClick={() => onChange(blocks.filter((_, current) => current !== index))}
                  type="button"
                >
                  Kaldır
                </button>
              </div>
            </div>

            <textarea
              aria-label={`${index + 1}. blok — ${bodyBlockLabels[block.type]} metni`}
              className={`${fieldClassName} ${block.type === "heading" ? "min-h-12" : "min-h-28"}`}
              name="blockText"
              onChange={(event) => updateBlock(index, { text: event.target.value })}
              placeholder={block.type === "heading" ? "Ara başlık" : "Bu bloğun metnini yazın…"}
              value={block.text}
            />

            {/* Gizli olsa da formda kalıyor: diziler indekse göre eşleşiyor. */}
            <div hidden={block.type !== "quote"}>
              <label className="grid gap-2 text-sm font-semibold">
                {`${index + 1}. blok — alıntının kaynağı`}
                <input
                  className={fieldClassName}
                  maxLength={200}
                  name="blockAttribution"
                  onChange={(event) => updateBlock(index, { attribution: event.target.value })}
                  placeholder="Konuşan kişi veya kurum"
                  type="text"
                  value={block.attribution}
                />
              </label>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-2">
        {bodyBlockTypes.map((type) => (
          <button
            className="rounded-full border border-dashed border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
            key={type}
            onClick={() => addBlock(type)}
            type="button"
          >
            + {bodyBlockLabels[type]}
          </button>
        ))}
      </div>
    </section>
  );
}
