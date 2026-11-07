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
  resolvePublishTarget,
  slugify,
  toEditorialInstant,
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
  const formRef = useRef<HTMLFormElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const [scheduledAt, setScheduledAt] = useState(() =>
    toEditorialLocalInput(article?.scheduledAt),
  );

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

  // Formun o anki halini yerel taslağa yazar. Hem otomatik kayıt hem de
  // başarısız gönderim sonrası geri yazma bunu kullanıyor.
  const writeDraft = useCallback(() => {
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
  }, [slug, storageKey, summary, title]);

  // Sessiz otomatik kayıt. Kurtarma şeridi açıkken duruyor: kullanıcı henüz
  // hangi sürümü istediğini söylemedi, altındaki kaydı değiştirmek yanlış olur.
  useEffect(() => {
    if (recoverable !== undefined) return;
    if (title.trim() === "" && blocks.length === 0) return;

    const timer = window.setTimeout(() => {
      if (submittedRef.current) return;
      writeDraft();
    }, DRAFT_SAVE_DELAY);

    return () => window.clearTimeout(timer);
    // `slug`, `summary` ve `storageKey` writeDraft kimliğiyle zaten izleniyor.
  }, [blocks, recoverable, title, writeDraft]);

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
    // Hangi düğmeye basıldığı (`intent`) gönderen düğmeden okunuyor.
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const formData = new FormData(event.currentTarget, submitter);
    formData.set("body", JSON.stringify(blocksRef.current));

    if (formData.get("intent") === "publish" && blocksRef.current.length === 0) {
      setMessage("Yayımlamadan önce haber metnini yazın.");
      return;
    }

    // Kaydetmeye başladığımız an kurtarma kopyası gereksiz: içerik sunucuya gidiyor.
    // Başarılı oluşturma `redirect` attığı için bu satırdan sonrası hiç çalışmaz,
    // dolayısıyla silme burada kalmalı; başarısızlıkta aşağıda geri yazılıyor.
    submittedRef.current = true;
    window.localStorage.removeItem(storageKey);

    setIsPending(true);
    setMessage(undefined);

    // `createArticle` başarıda yönlendirdiği için bu söz çözülmez; hata
    // döndüğünde aşağıdaki satırlar çalışır.
    const result = isEdit ? await updateArticle(formData) : await createArticle(formData);

    submittedRef.current = false;

    // Kayıt reddedildi (örneğin çift slug). Otomatik kayıt efekti yalnızca
    // kullanıcı yeniden yazdığında tetiklendiği için kurtarma kopyasını hemen geri
    // yazıyoruz: aksi halde sekme bu noktada kapanırsa gövde tamamen kaybolur.
    if (result.error) writeDraft();

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

  // Cmd/Ctrl+S: yayın durumunu değiştirmeden kaydeder.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!isPending) formRef.current?.requestSubmit(saveButtonRef.current ?? undefined);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPending]);

  const isPublished = article?.status === "PUBLISHED";
  const scheduledInstant = toEditorialInstant(scheduledAt);
  const willSchedule = resolvePublishTarget(scheduledInstant) === "SCHEDULED";
  const publishLabel = willSchedule ? "Zamanla" : "Yayımla";

  // Yayımlama ana düğmede; yan panelde yalnızca geri alma işlemleri kalıyor.
  const sideTransitions = article
    ? getAllowedTransitions(article.status).filter(
        (status) => status === "DRAFT" || status === "ARCHIVED",
      )
    : [];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <form className="grid gap-6" onSubmit={handleSubmit} ref={formRef}>
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
              autoFocus={!isEdit}
              className={`${fieldClassName} text-lg font-semibold`}
              id="article-title"
              maxLength={200}
              name="title"
              onChange={(event) => {
                setTitle(event.target.value);
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
              placeholder="Haberin başlığı"
              required
              type="text"
              value={title}
            />
          </Field>

          <Field
            hint="Kartlarda ve başlığın altında görünen kısa giriş. İsteğe bağlı."
            htmlFor="article-summary"
            label="Özet (spot)"
          >
            <textarea
              className={`${fieldClassName} min-h-20`}
              id="article-summary"
              maxLength={500}
              name="summary"
              onChange={(event) => setSummary(event.target.value)}
              value={summary}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field htmlFor="article-topic" label="Kategori">
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
        </section>

        <HeroMediaPicker
          defaultValue={article?.heroMediaId ?? null}
          description="Haber sayfasında ve kartlarda görünen ana görsel."
          fallbackAltText={title}
          label="Haber görseli"
          name="heroMediaId"
          options={options.media}
        />

        <NewsEditor
          defaultBlocks={editorSeed.blocks}
          key={editorSeed.generation}
          onChange={handleBlocksChange}
        />

        <details className={`${cardClassName} group`}>
          <summary className="cursor-pointer list-none text-sm font-semibold">
            <span className="mr-2 inline-block transition group-open:rotate-90">›</span>
            Diğer ayarlar
            <span className="ml-2 font-normal text-[var(--color-ink-muted)]">
              (adres, yazar, zamanlama, SEO — isteğe bağlı)
            </span>
          </summary>

          <div className="grid gap-5 pt-2">
            <Field
              hint={
                isEdit
                  ? "Yayımlanmış bir haberin adresi değiştirilirse eski adresten yenisine kalıcı yönlendirme kaydedilir."
                  : "Başlıktan otomatik oluşturulur; elle değiştirirseniz artık güncellenmez."
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
                type="text"
                value={slug}
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
              <Field
                hint="İleri bir tarih girerseniz “Yayımla” düğmesi haberi o saate zamanlar."
                htmlFor="article-scheduled"
                label="İleri tarihte yayımla"
              >
                <input
                  className={fieldClassName}
                  id="article-scheduled"
                  name="scheduledAt"
                  onChange={(event) => setScheduledAt(event.target.value)}
                  type="datetime-local"
                  value={scheduledAt}
                />
              </Field>
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
            </div>

            <HeroMediaPicker
              defaultValue={article?.socialMediaId ?? null}
              description="Yalnızca paylaşım kartlarında kullanılır; boş bırakılırsa haber görseli kullanılır."
              fallbackAltText={title}
              label="Sosyal medya görseli"
              name="socialMediaId"
              options={options.media}
            />

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
            <Field
              htmlFor="article-seo-description"
              label="SEO açıklaması"
            >
              <textarea
                className={`${fieldClassName} min-h-20`}
                defaultValue={article?.seoDescription ?? ""}
                id="article-seo-description"
                maxLength={320}
                name="seoDescription"
              />
            </Field>
          </div>
        </details>

        <div className="sticky bottom-0 z-10 -mx-1 grid gap-3 rounded-[20px] border border-[var(--color-line)] bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
          {message ? (
            <p aria-live="polite" className="text-sm" role="status">
              {message}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {isPublished ? (
              <button
                className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-teal)] disabled:cursor-wait disabled:opacity-60"
                disabled={isPending}
                name="intent"
                ref={saveButtonRef}
                type="submit"
                value="save"
              >
                {isPending ? "Kaydediliyor…" : "Değişiklikleri yayına al"}
              </button>
            ) : (
              <>
                <button
                  className="rounded-full bg-[var(--color-teal)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-ink)] disabled:cursor-wait disabled:opacity-60"
                  disabled={isPending}
                  name="intent"
                  type="submit"
                  value="publish"
                >
                  {isPending ? "Gönderiliyor…" : publishLabel}
                </button>
                <button
                  className="rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] disabled:cursor-wait disabled:opacity-60"
                  disabled={isPending}
                  name="intent"
                  ref={saveButtonRef}
                  type="submit"
                  value="save"
                >
                  Taslak olarak kaydet
                </button>
              </>
            )}
            <span className="text-sm text-[var(--color-ink-muted)]">
              {isEdit ? `Durum: ${articleStatusLabels[article.status]}` : "Henüz kaydedilmedi"}
              {willSchedule && !isPublished && scheduledInstant
                ? ` · ${formatDraftTime(scheduledInstant)} için zamanlanacak`
                : ""}
            </span>
            {isPublished ? (
              <a
                className="ml-auto text-sm font-semibold text-[var(--color-teal)] hover:underline"
                href={`/haber/${article.slug}`}
                rel="noreferrer"
                target="_blank"
              >
                Sitede gör ↗
              </a>
            ) : null}
          </div>
        </div>
      </form>

      <aside className="grid content-start gap-6">
        {sideTransitions.length > 0 ? (
          <section className={cardClassName}>
            <div>
              <h2 className="font-editorial text-2xl">Durum</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-ink-muted)]">
                Şu an: {articleStatusLabels[article!.status]}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sideTransitions.map((status) => (
                <button
                  className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)] disabled:cursor-wait disabled:opacity-60"
                  disabled={isPending}
                  key={status}
                  onClick={() => handleTransition(status)}
                  type="button"
                >
                  {status === "DRAFT"
                    ? "Taslağa geri al"
                    : isPublished
                      ? "Yayından kaldır"
                      : "Arşivle"}
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
