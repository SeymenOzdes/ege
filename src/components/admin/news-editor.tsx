"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUUpLeftIcon } from "@phosphor-icons/react/dist/ssr/ArrowUUpLeft";
import { ArrowUUpRightIcon } from "@phosphor-icons/react/dist/ssr/ArrowUUpRight";
import { EraserIcon } from "@phosphor-icons/react/dist/ssr/Eraser";
import { LinkIcon } from "@phosphor-icons/react/dist/ssr/Link";
import { LinkBreakIcon } from "@phosphor-icons/react/dist/ssr/LinkBreak";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/ssr/ListBullets";
import { ListNumbersIcon } from "@phosphor-icons/react/dist/ssr/ListNumbers";
import { QuotesIcon } from "@phosphor-icons/react/dist/ssr/Quotes";
import { TextBIcon } from "@phosphor-icons/react/dist/ssr/TextB";
import { TextHThreeIcon } from "@phosphor-icons/react/dist/ssr/TextHThree";
import { TextHTwoIcon } from "@phosphor-icons/react/dist/ssr/TextHTwo";
import { TextItalicIcon } from "@phosphor-icons/react/dist/ssr/TextItalic";
import { TextStrikethroughIcon } from "@phosphor-icons/react/dist/ssr/TextStrikethrough";
import { TextUnderlineIcon } from "@phosphor-icons/react/dist/ssr/TextUnderline";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, Extension, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { blocksToTiptapDoc, tiptapDocToBlocks } from "@/lib/admin/article-body";
import { sanitizeHref } from "@/lib/article-links";
import type { ArticleBodyBlock } from "@/lib/articles";
import { articleBodyClassName } from "@/components/site/article-body";
import styles from "./news-editor.module.css";

/** Ortalama okuma hızı; künyedeki süreyle aynı varsayım. */
const WORDS_PER_MINUTE = 200;

/**
 * Yumuşak uzunluk hedefi. Sayaç bunun üstünde uyarı rengine geçiyor ama yazmayı
 * kesmiyor: bir haberin ne zaman uzadığını editör bilir, editörün aracı değil.
 */
const BODY_CHARACTER_TARGET = 5000;

const toolButtonClassName =
  "inline-flex size-9 items-center justify-center rounded-full border border-[var(--color-line)] bg-white transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] disabled:cursor-not-allowed disabled:opacity-40 aria-pressed:border-[var(--color-teal)] aria-pressed:bg-[var(--color-teal)] aria-pressed:text-white";

const fieldClassName =
  "w-full rounded-[18px] border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm font-normal";

/**
 * Alıntının kaynağını `blockquote` düğümünün bir özniteliğinde taşır.
 *
 * Blockquote'un metin dışında alanı yok ve kaynak, alıntının bir parçası —
 * ayrı bir blok değil. Global öznitelik yolu, `@tiptap/extension-blockquote`'u
 * doğrudan bağımlılığa çevirmeden ve bir NodeView yazmadan bunu çözüyor;
 * öznitelik `data-attribution` olarak seri hâle geliyor.
 */
const QuoteAttribution = Extension.create({
  name: "quoteAttribution",

  addGlobalAttributes() {
    return [
      {
        types: ["blockquote"],
        attributes: {
          attribution: {
            default: "",
            parseHTML: (element) => element.getAttribute("data-attribution") ?? "",
            renderHTML: (attributes) =>
              attributes.attribution ? { "data-attribution": attributes.attribution } : {},
          },
        },
      },
    ];
  },
});

function ToolButton({
  children,
  disabled,
  label,
  onClick,
  pressed,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className={toolButtonClassName}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-6 w-px bg-[var(--color-line)]" />;
}

function EditorToolbar({ editor }: { editor: Editor }) {
  // `null` iken bağlantı satırı kapalı; boş dizge yeni bağlantı demek.
  const [linkDraft, setLinkDraft] = useState<string | null>(null);
  const [linkError, setLinkError] = useState(false);

  const state = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      bold: instance.isActive("bold"),
      italic: instance.isActive("italic"),
      underline: instance.isActive("underline"),
      strike: instance.isActive("strike"),
      headingTwo: instance.isActive("heading", { level: 2 }),
      headingThree: instance.isActive("heading", { level: 3 }),
      quote: instance.isActive("blockquote"),
      bulletList: instance.isActive("bulletList"),
      orderedList: instance.isActive("orderedList"),
      link: instance.isActive("link"),
      linkHref: String(instance.getAttributes("link").href ?? ""),
      attribution: String(instance.getAttributes("blockquote").attribution ?? ""),
      canUndo: instance.can().undo(),
      canRedo: instance.can().redo(),
    }),
  });

  function applyLink() {
    const href = sanitizeHref(linkDraft);
    if (href === undefined) {
      setLinkError(true);
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    setLinkDraft(null);
    setLinkError(false);
  }

  function removeLink() {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkDraft(null);
    setLinkError(false);
  }

  return (
    <div className="sticky top-0 z-10 grid gap-2 rounded-t-[18px] border-b border-[var(--color-line)] bg-[var(--color-paper)] p-2.5">
      <div
        aria-label="Metin biçimlendirme"
        className="flex flex-wrap items-center gap-1.5"
        role="toolbar"
      >
        <ToolButton
          label="Kalın"
          onClick={() => editor.chain().focus().toggleBold().run()}
          pressed={state.bold}
        >
          <TextBIcon size={17} />
        </ToolButton>
        <ToolButton
          label="İtalik"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          pressed={state.italic}
        >
          <TextItalicIcon size={17} />
        </ToolButton>
        <ToolButton
          label="Altı çizili"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          pressed={state.underline}
        >
          <TextUnderlineIcon size={17} />
        </ToolButton>
        <ToolButton
          label="Üstü çizili"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          pressed={state.strike}
        >
          <TextStrikethroughIcon size={17} />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Ara başlık"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          pressed={state.headingTwo}
        >
          <TextHTwoIcon size={17} />
        </ToolButton>
        <ToolButton
          label="Alt başlık"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          pressed={state.headingThree}
        >
          <TextHThreeIcon size={17} />
        </ToolButton>
        <ToolButton
          label="Alıntı"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          pressed={state.quote}
        >
          <QuotesIcon size={17} />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Madde listesi"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          pressed={state.bulletList}
        >
          <ListBulletsIcon size={17} />
        </ToolButton>
        <ToolButton
          label="Numaralı liste"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          pressed={state.orderedList}
        >
          <ListNumbersIcon size={17} />
        </ToolButton>

        <Divider />

        <ToolButton
          label="Bağlantı"
          onClick={() => {
            setLinkDraft((open) => (open === null ? state.linkHref : null));
            setLinkError(false);
          }}
          pressed={state.link}
        >
          <LinkIcon size={17} />
        </ToolButton>
        <ToolButton disabled={!state.link} label="Bağlantıyı kaldır" onClick={removeLink}>
          <LinkBreakIcon size={17} />
        </ToolButton>

        <Divider />

        <ToolButton
          disabled={!state.canUndo}
          label="Geri al"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <ArrowUUpLeftIcon size={17} />
        </ToolButton>
        <ToolButton
          disabled={!state.canRedo}
          label="Yinele"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <ArrowUUpRightIcon size={17} />
        </ToolButton>
        <ToolButton
          label="Biçimi temizle"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        >
          <EraserIcon size={17} />
        </ToolButton>
      </div>

      {linkDraft !== null ? (
        <div className="grid gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold" htmlFor="article-link-href">
              Bağlantı adresi
            </label>
            <input
              autoFocus
              className={`${fieldClassName} sm:w-80`}
              id="article-link-href"
              onChange={(event) => {
                setLinkDraft(event.target.value);
                setLinkError(false);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                // Form gönderimi tetiklenmesin: bu alan haberin kaydedileceği
                // formun içinde duruyor.
                event.preventDefault();
                applyLink();
              }}
              placeholder="https://…"
              type="url"
              value={linkDraft}
            />
            <button
              className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-teal)]"
              onClick={applyLink}
              type="button"
            >
              Ekle
            </button>
            <button
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
              onClick={() => setLinkDraft(null)}
              type="button"
            >
              Vazgeç
            </button>
          </div>
          {linkError ? (
            <p aria-live="polite" className="text-xs font-semibold text-[var(--color-ochre)]">
              Bağlantı adresi http(s), mailto ya da site içi / ile başlamalı.
            </p>
          ) : null}
        </div>
      ) : null}

      {state.quote ? (
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold" htmlFor="article-quote-attribution">
            Alıntı kaynağı
          </label>
          <input
            className={`${fieldClassName} sm:w-80`}
            id="article-quote-attribution"
            maxLength={200}
            // `focus()` bilerek zincire katılmıyor: katılsaydı her tuş vuruşunda
            // odak bu alandan alınıp yazma yüzeyine giderdi.
            onChange={(event) =>
              editor.commands.updateAttributes("blockquote", { attribution: event.target.value })
            }
            placeholder="Konuşan kişi veya kurum"
            type="text"
            value={state.attribution}
          />
        </div>
      ) : null}
    </div>
  );
}

function EditorMeters({ editor }: { editor: Editor }) {
  const { characters, words } = useEditorState({
    editor,
    selector: ({ editor: instance }) => ({
      characters: instance.storage.characterCount.characters(),
      words: instance.storage.characterCount.words(),
    }),
  });

  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  const isLong = characters > BODY_CHARACTER_TARGET;

  return (
    <p
      aria-live="polite"
      className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--color-line)] px-4 py-2.5 text-xs font-semibold text-[var(--color-ink-muted)]"
    >
      <span>{words} kelime</span>
      <span>~{minutes} dk okuma</span>
      <span className={isLong ? "text-[var(--color-ochre)]" : undefined}>
        {characters} / {BODY_CHARACTER_TARGET} karakter
      </span>
    </p>
  );
}

/**
 * Haber gövdesinin editörü.
 *
 * Tek akışlı bir belge gibi yazılıyor ama veri blok blok saklanıyor: her
 * güncellemede `tiptapDocToBlocks` belgeyi `articles.body`'nin şemasına
 * indirgiyor ve `onChange` ile yukarı veriyor. `defaultBlocks` yalnızca ilk
 * kurulumda okunuyor; içeriği dışarıdan değiştirmek gerekiyorsa bileşen
 * `key` ile yeniden kurulmalı (bkz. `article-form.tsx` taslak geri yükleme).
 */
export function NewsEditor({
  defaultBlocks,
  onChange,
}: {
  defaultBlocks: readonly ArticleBodyBlock[];
  onChange: (blocks: ArticleBodyBlock[]) => void;
}) {
  const changeRef = useRef(onChange);
  useEffect(() => {
    changeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    // Next sunucuda da çizmeye çalışır ve ProseMirror'ın DOM'u ile sunucudan
    // gelen işaretleme uyuşmaz; bu bayrak olmadan hidrasyon hatası alınır.
    immediatelyRender: false,
    content: blocksToTiptapDoc(defaultBlocks),
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Haber metninde yeri yok; açık kalsalar yapıştırma yoluyla gövdeye
        // sızarlar ve blok modelinde karşılıkları olmadığı için sessizce düşerlerdi.
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          autolink: true,
          protocols: ["http", "https", "mailto"],
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
      QuoteAttribution,
      Placeholder.configure({ placeholder: "Haber metnini yazın…" }),
      // `limit` verilmiyor: sayaç uyarır, yazmayı kesmez.
      CharacterCount,
    ],
    editorProps: {
      attributes: {
        "aria-label": "Haber metni",
        "aria-multiline": "true",
        class: `${articleBodyClassName} ${styles.editor}`,
        role: "textbox",
      },
    },
    onUpdate: ({ editor: instance }) => changeRef.current(tiptapDocToBlocks(instance.getJSON())),
  });

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
          Doğrudan yazın: <code>##</code> ara başlık, <code>###</code> alt başlık, <code>&gt;</code>{" "}
          alıntı, <code>-</code> madde listesi, <code>1.</code> numaralı liste açar. Word ve Google
          Dokümanlar&apos;dan yapıştırılan metin temizlenerek alınır.
        </p>
      </div>

      <div className="overflow-hidden rounded-[18px] border border-[var(--color-line)] bg-white">
        {editor ? <EditorToolbar editor={editor} /> : null}
        <EditorContent editor={editor} />
        {editor ? <EditorMeters editor={editor} /> : null}
      </div>
    </section>
  );
}
