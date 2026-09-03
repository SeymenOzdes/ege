"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { createArticle, updateArticle, transitionArticle } from "@/lib/admin/article-actions";
import {
  articleStatusLabels,
  articleTypeLabels,
  articleTypes,
  getAllowedTransitions,
  slugify,
  toEditorialLocalInput,
} from "@/lib/admin/article-schema";
import type { AdminArticleRecord, ArticleFormOptions } from "@/lib/admin/articles";
import type { ArticleBodyBlock } from "@/lib/articles";
import { HeroMediaPicker } from "@/components/admin/hero-media-picker";
import { articleBodyClassName, BodyBlock } from "@/components/site/article-body";

/**
 * TipTap yalnızca istemcide ve yalnızca bu form açıldığında yükleniyor.
 * `ssr: false` bir istemci bileşeninin içinde geçerli (Next 16 lazy-loading
 * kılavuzu); kamusal sayfaların paketine editörden hiçbir şey girmiyor.
 */
const NewsEditor = dynamic(
  () => import("@/components/admin/news-editor").then((module) => module.NewsEditor),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-96 place-items-center rounded-[24px] border border-[var(--color-line)] bg-white text-sm text-[var(--color-ink-muted)] shadow-sm">
        Editör yükleniyor…
      </div>
    ),
  },
);

/** Otomatik taslak yazma gecikmesi. */
const DRAFT_SAVE_DELAY = 5000;

type StoredDraft = {
  savedAt: string;
  title: string;
  slug: string;
  summary: string;
  blocks: ArticleBodyBlock[];
};

function draftStorageKey(articleId: string | undefined) {
  return `ege:haber-taslak:${articleId ?? "yeni"}`;
}

/**
 * Yerel taslağı okur. Depolama kapalı, kota dolu ya da kayıt bozuksa
 * `undefined` döner: otomatik taslak bir kolaylık, formu düşürmemeli.
 */
function readStoredDraft(key: string): StoredDraft | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return undefined;

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return undefined;

    const draft = parsed as StoredDraft;
    return typeof draft.savedAt === "string" && Array.isArray(draft.blocks) ? draft : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Açılış anındaki yerel taslağı bir kez okuyup donduran dış depo.
 *
 * `useSyncExternalStore` ile okunuyor: sunucu anlık görüntüsü `undefined`
 * olduğu için hidrasyon uyuşmazlığı olmuyor ve depoyu okumak için efekt
 * içinden `setState` çağırmak gerekmiyor. Anlık görüntü bilerek donuyor —
 * otomatik kayıt aynı anahtarı beş saniyede bir güncelliyor ve canlı okunsaydı
 * kullanıcı yazarken kurtarma şeridi geri gelirdi.
 */
function createDraftStore(key: string) {
  let hasRead = false;
  let snapshot: StoredDraft | undefined;

  return {
    subscribe: () => () => undefined,
    getSnapshot: () => {
      if (!hasRead) {
        hasRead = true;
        snapshot = readStoredDraft(key);
      }
      return snapshot;
    },
  };
}

function formatDraftTime(savedAt: string) {
  const date = new Date(savedAt);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

const fieldClassName =
  "w-full rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 font-normal";

const cardClassName =
  "grid gap-5 rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm sm:p-7";

function Field({
  children,
  hint,
  htmlFor,
  label,
}: {
  children: ReactNode;
  hint?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-sm text-[var(--color-ink-muted)]">{hint}</p> : null}
    </div>
  );
}

function RelationSelect({
  id,
  name,
  options,
  defaultValue,
  placeholder,
}: {
  id: string;
  name: string;
  options: Array<{ id: string; name: string }>;
  defaultValue: string | null;
  placeholder: string;
}) {
  return (
    <select className={fieldClassName} defaultValue={defaultValue ?? ""} id={id} name={name}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

/**
 * Yeni haber ve düzenleme sayfalarının paylaştığı form.
 *
 * Yayına çıkmamış bir haber kamuya açık sayfada görünmüyor
 * (`articles_public_select` taslakları gizliyor), bu yüzden sağdaki önizleme
 * editörün taslağını görebildiği tek yer. Önizleme haber detayıyla aynı
 * `BodyBlock` bileşenini ve aynı tipografiyi kullanıyor.
 */
export function ArticleForm({
  article,
  defaultBreaking = false,
  notice,
  options,
}: {
  article?: AdminArticleRecord;
  defaultBreaking?: boolean;
  notice?: string;
  options: ArticleFormOptions;
}) {
  const isEdit = article !== undefined;
  const storageKey = draftStorageKey(article?.id);
  const initialBlocks = useMemo(() => article?.blocks ?? [], [article]);

  const [blocks, setBlocks] = useState<ArticleBodyBlock[]>(initialBlocks);
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [summary, setSummary] = useState(article?.summary ?? "");
  const [isBreaking, setIsBreaking] = useState(article?.isBreaking ?? defaultBreaking);
  const [message, setMessage] = useState<string | undefined>(notice);
  const [isPending, setIsPending] = useState(false);
  const [draftDismissed, setDraftDismissed] = useState(false);
  // Editör içeriği yalnızca kurulumda okunuyor; taslak geri yüklendiğinde
  // `generation` değişiyor ve bileşen yeni tohumla yeniden kuruluyor.
  const [editorSeed, setEditorSeed] = useState<{
    blocks: readonly ArticleBodyBlock[];
    generation: number;
  }>(() => ({ blocks: initialBlocks, generation: 0 }));

  // Gönderim, önizlemenin geciktirilmiş kopyasını değil bu referansı okur:
  // kaydedilen gövde her koşulda editörün son hâli olmalı.
  const blocksRef = useRef<ArticleBodyBlock[]>(initialBlocks);
  const submittedRef = useRef(false);

  const previewBlocks = useDeferredValue(blocks);

  const handleBlocksChange = useCallback((next: ArticleBodyBlock[]) => {
    blocksRef.current = next;
    setBlocks(next);
  }, []);

  const draftStore = useMemo(() => createDraftStore(storageKey), [storageKey]);
  const storedDraft = useSyncExternalStore(
    draftStore.subscribe,
    draftStore.getSnapshot,
    () => undefined,
  );

  // Kaydedilmiş sürüm taslaktan yeniyse taslak eskimiştir: başka bir yerden
  // kaydedilmiş, bu kopya geride kalmıştır.
  const isStale =
    article !== undefined &&
    storedDraft !== undefined &&
    Date.parse(storedDraft.savedAt) <= Date.parse(article.updatedAt);

  const recoverable = draftDismissed || isStale ? undefined : storedDraft;

  // Sessiz otomatik kayıt. Kurtarma şeridi açıkken duruyor: kullanıcı henüz
  // hangi sürümü istediğini söylemedi, altındaki kaydı değiştirmek yanlış olur.
  useEffect(() => {
    if (recoverable !== undefined) return;
    if (title.trim() === "" && blocks.length === 0) return;

    const timer = window.setTimeout(() => {
      if (submittedRef.current) return;

      try {
        const draft: StoredDraft = {
          savedAt: new Date().toISOString(),
          title,
          slug,
          summary,
          blocks: blocksRef.current,
        };
        window.localStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // Kota dolu ya da depolama kapalı: otomatik taslak sessizce devre dışı.
      }
    }, DRAFT_SAVE_DELAY);

    return () => window.clearTimeout(timer);
  }, [blocks, recoverable, slug, storageKey, summary, title]);

  function restoreDraft() {
    if (!recoverable) return;

    setTitle(recoverable.title);
    setSlug(recoverable.slug);
    setSlugTouched(true);
    setSummary(recoverable.summary);
    handleBlocksChange(recoverable.blocks);
    setEditorSeed((seed) => ({ blocks: recoverable.blocks, generation: seed.generation + 1 }));
    setDraftDismissed(true);
  }

  function discardDraft() {
    window.localStorage.removeItem(storageKey);
    setDraftDismissed(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("body", JSON.stringify(blocksRef.current));

    // Kaydetmeye başladığımız an kurtarma kopyası gereksiz: içerik sunucuya
    // gidiyor. Kayıt başarısız olursa aşağıda geri açılıyor.
    submittedRef.current = true;
    window.localStorage.removeItem(storageKey);

    setIsPending(true);
    setMessage(undefined);

    // `createArticle` başarıda yönlendirdiği için bu söz çözülmez; hata
    // döndüğünde aşağıdaki satırlar çalışır.
    const result = isEdit ? await updateArticle(formData) : await createArticle(formData);

    submittedRef.current = false;
    setMessage(result.error ?? result.success ?? "İşlem tamamlanamadı.");
    setIsPending(false);
  }

  async function handleTransition(targetStatus: string) {
    if (!article) return;

    setIsPending(true);
    setMessage(undefined);

    const result = await transitionArticle(article.id, targetStatus);
    setMessage(result.error ?? result.success ?? "Durum güncellenemedi.");
    setIsPending(false);
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <form className="grid gap-6" onSubmit={handleSubmit}>
        {isEdit ? <input name="articleId" type="hidden" value={article.id} /> : null}

        {recoverable ? (
          <div
            className="flex flex-wrap items-center gap-3 rounded-[18px] border border-[var(--color-ochre)] bg-[var(--color-paper)] px-4 py-3 text-sm"
            role="status"
          >
            <span className="font-semibold">
              Kaydedilmemiş bir taslak bulundu ({formatDraftTime(recoverable.savedAt)}).
            </span>
            <button
              className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-teal)]"
              onClick={restoreDraft}
              type="button"
            >
              Geri yükle
            </button>
            <button
              className="rounded-full border border-[var(--color-line)] px-4 py-2 text-xs font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
              onClick={discardDraft}
              type="button"
            >
              Yok say
            </button>
          </div>
        ) : null}

        <section className={cardClassName}>
          <Field htmlFor="article-title" label="Başlık">
            <input
              className={fieldClassName}
              id="article-title"
              maxLength={200}
              name="title"
              onChange={(event) => {
                setTitle(event.target.value);
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
              required
              type="text"
              value={title}
            />
          </Field>

          <Field
            hint={
              isEdit
                ? "Yayımlanmış bir haberin adresi değiştirilirse eski adresten yenisine kalıcı yönlendirme kaydedilir."
                : "Başlıktan türetiliyor; elle değiştirirseniz artık güncellenmez."
            }
            htmlFor="article-slug"
            label="Adres (slug)"
          >
            <input
              className={fieldClassName}
              id="article-slug"
              maxLength={200}
              name="slug"
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              required
              type="text"
              value={slug}
            />
          </Field>

          <Field htmlFor="article-summary" label="Özet">
            <textarea
              className={`${fieldClassName} min-h-24`}
              id="article-summary"
              maxLength={500}
              name="summary"
              onChange={(event) => setSummary(event.target.value)}
              value={summary}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field htmlFor="article-type" label="Tür">
              <select
                className={fieldClassName}
                defaultValue={article?.articleType ?? "NEWS"}
                id="article-type"
                name="articleType"
              >
                {articleTypes.map((type) => (
                  <option key={type} value={type}>
                    {articleTypeLabels[type]}
                  </option>
                ))}
              </select>
            </Field>
            <Field htmlFor="article-author" label="Yazar">
              <RelationSelect
                defaultValue={article?.authorId ?? null}
                id="article-author"
                name="authorId"
                options={options.authors}
                placeholder="Haber merkezi"
              />
            </Field>
            <Field htmlFor="article-topic" label="Konu">
              <RelationSelect
                defaultValue={article?.topicId ?? null}
                id="article-topic"
                name="topicId"
                options={options.topics}
                placeholder="Seçilmedi"
              />
            </Field>
            <Field htmlFor="article-location" label="Şehir">
              <RelationSelect
                defaultValue={article?.locationId ?? null}
                id="article-location"
                name="locationId"
                options={options.locations}
                placeholder="Seçilmedi"
              />
            </Field>
          </div>
        </section>

        <NewsEditor
          defaultBlocks={editorSeed.blocks}
          key={editorSeed.generation}
          onChange={handleBlocksChange}
        />

        <section className={cardClassName}>
          <div>
            <p className="eyebrow text-[var(--color-teal)]">Görseller</p>
            <h2 className="font-editorial mt-2 text-3xl">Medya</h2>
          </div>
          <HeroMediaPicker
            defaultValue={article?.heroMediaId ?? null}
            description="Haber detayında ve kartlarda görünen ana görsel."
            label="Manşet görseli"
            name="heroMediaId"
            options={options.media}
          />
          <HeroMediaPicker
            defaultValue={article?.socialMediaId ?? null}
            description="Yalnızca paylaşım kartlarında kullanılır; boş bırakılırsa manşet görseli kullanılır."
            label="Sosyal medya görseli"
            name="socialMediaId"
            options={options.media}
          />
        </section>

        <section className={cardClassName}>
          <div>
            <p className="eyebrow text-[var(--color-teal)]">Yayın</p>
            <h2 className="font-editorial mt-2 text-3xl">Zamanlama ve SEO</h2>
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold">
            <input
              checked={isBreaking}
              className="size-5"
              name="isBreaking"
              onChange={(event) => setIsBreaking(event.target.checked)}
              type="checkbox"
            />
            Son dakika olarak işaretle
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              hint="Boş bırakılırsa şerit elle kaldırılana kadar kalır."
              htmlFor="article-breaking-expires"
              label="Son dakika bitişi"
            >
              <input
                className={fieldClassName}
                defaultValue={toEditorialLocalInput(article?.breakingExpiresAt)}
                disabled={!isBreaking}
                id="article-breaking-expires"
                name="breakingExpiresAt"
                type="datetime-local"
              />
            </Field>
            <Field
              hint="Zamanlanmış duruma geçmek için ileri bir tarih kaydedin."
              htmlFor="article-scheduled"
              label="Planlanan yayın"
            >
              <input
                className={fieldClassName}
                defaultValue={toEditorialLocalInput(article?.scheduledAt)}
                id="article-scheduled"
                name="scheduledAt"
                type="datetime-local"
              />
            </Field>
          </div>

          <Field
            hint="Boş bırakılırsa haberin kendi başlığı kullanılır."
            htmlFor="article-seo-title"
            label="SEO başlığı"
          >
            <input
              className={fieldClassName}
              defaultValue={article?.seoTitle ?? ""}
              id="article-seo-title"
              maxLength={200}
              name="seoTitle"
              type="text"
            />
          </Field>
          <Field htmlFor="article-seo-description" label="SEO açıklaması">
            <textarea
              className={`${fieldClassName} min-h-20`}
              defaultValue={article?.seoDescription ?? ""}
              id="article-seo-description"
              maxLength={320}
              name="seoDescription"
            />
          </Field>
        </section>

        {message ? (
          <p
            aria-live="polite"
            className="rounded-[18px] bg-[var(--color-paper)] px-4 py-3 text-sm"
            role="status"
          >
            {message}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-teal)] disabled:cursor-wait disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Kaydediliyor…" : isEdit ? "Değişiklikleri kaydet" : "Taslağı oluştur"}
          </button>
          {isEdit ? (
            <span className="text-sm text-[var(--color-ink-muted)]">
              Durum: {articleStatusLabels[article.status]}
            </span>
          ) : null}
        </div>
      </form>

      <aside className="grid content-start gap-6">
        {isEdit ? (
          <section className={cardClassName}>
            <div>
              <p className="eyebrow text-[var(--color-teal)]">Editoryal akış</p>
              <h2 className="font-editorial mt-2 text-3xl">Durum</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
                Durum işlemleri kaydedilmiş içerik üzerinde çalışır; önce değişikliklerinizi
                kaydedin.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {getAllowedTransitions(article.status).map((status) => (
                <button
                  className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] disabled:cursor-wait disabled:opacity-60"
                  disabled={isPending}
                  key={status}
                  onClick={() => handleTransition(status)}
                  type="button"
                >
                  {articleStatusLabels[status]}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className={`${cardClassName} xl:sticky xl:top-6`}>
          <div>
            <p className="eyebrow text-[var(--color-teal)]">Önizleme</p>
            <h2 className="font-editorial mt-2 text-3xl">{title || "Başlıksız haber"}</h2>
            {summary ? (
              <p className="mt-3 leading-7 text-[var(--color-ink-muted)]">{summary}</p>
            ) : null}
          </div>

          {previewBlocks.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">
              Gövde boş. Yazdıkça burada haber sayfasındaki gibi görünecek.
            </p>
          ) : (
            <div className={`${articleBodyClassName} max-h-[32rem] overflow-y-auto`}>
              {previewBlocks.map((block, index) => (
                <BodyBlock block={block} index={index} key={`${block.type}-${index}`} />
              ))}
            </div>
          )}
        </section>
      </aside>
    </div>
  );
}
