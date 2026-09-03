/**
 * Haber formunun tek doğrulama kaynağı ve durum makinesi.
 *
 * Supabase'e dokunmaz, `server-only` değildir: hem sunucu eylemi hem istemci
 * formu aynı etiketleri ve aynı kalıpları okuyor.
 */
import { z } from "zod";
import { sanitizeHref } from "@/lib/article-links";
import type { Database } from "@/lib/supabase/database.types";
import { normalizeTurkish } from "@/lib/turkish";

export type ArticleStatus = Database["public"]["Enums"]["article_status"];
export type ArticleType = Database["public"]["Enums"]["article_type"];

export const articleStatuses = [
  "DRAFT",
  "IN_REVIEW",
  "SCHEDULED",
  "PUBLISHED",
  "ARCHIVED",
] as const satisfies readonly ArticleStatus[];

export const articleStatusLabels: Record<ArticleStatus, string> = {
  DRAFT: "Taslak",
  IN_REVIEW: "İncelemede",
  SCHEDULED: "Zamanlanmış",
  PUBLISHED: "Yayımlandı",
  ARCHIVED: "Arşivlendi",
};

export const articleTypes = [
  "NEWS",
  "OPINION",
  "INTERVIEW",
  "PHOTO_STORY",
] as const satisfies readonly ArticleType[];

export const articleTypeLabels: Record<ArticleType, string> = {
  NEWS: "Haber",
  OPINION: "Görüş",
  INTERVIEW: "Söyleşi",
  PHOTO_STORY: "Fotoğraf öyküsü",
};

export function parseArticleStatus(value: unknown): ArticleStatus | undefined {
  return articleStatuses.find((status) => status === value);
}

/** Şemadaki `articles_slug_format` kontrolüyle birebir aynı kalıp. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** `articles.slug` sütununda pratik üst sınır; veritabanı `text` sınırsız. */
export const SLUG_MAX_LENGTH = 200;

/**
 * Başlıktan adres üretir.
 *
 * `normalizeTurkish` küçük harfe indirip birleşen imleri attığı için "ş" → "s",
 * "ğ" → "g", "ı" → "i" olur; geriye kalan her şey tireye dönüşür. Sonuç ya
 * `SLUG_PATTERN`'e uyar ya da boştur — ikincisini şema yakalar.
 *
 * Kesme işareti tireye değil hiçliğe düşüyor: Türkçe başlıklarda çok geçen
 * "Çeşme'de" adreste "cesmede" olmalı, "cesme-de" değil.
 */
export function slugify(value: string): string {
  return normalizeTurkish(value)
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/, "");
}

/**
 * Türkiye 2016'dan beri kalıcı olarak UTC+03:00; yaz saati uygulaması yok.
 * `datetime-local` alanları ofset taşımadığı için editörün gördüğü duvar saati
 * bu sabit ofsetle yorumlanıyor.
 */
export const EDITORIAL_UTC_OFFSET = "+03:00";

const LOCAL_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** `datetime-local` değeri → ISO anı. Biçim tutmuyorsa `null`. */
export function toEditorialInstant(value: string): string | null {
  if (!LOCAL_INPUT_PATTERN.test(value)) return null;

  const date = new Date(`${value}:00${EDITORIAL_UTC_OFFSET}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** ISO anı → aynı duvar saatini gösteren `datetime-local` değeri. */
export function toEditorialLocalInput(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const shifted = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 16);
}

const allowedTransitions: Record<ArticleStatus, readonly ArticleStatus[]> = {
  DRAFT: ["IN_REVIEW", "ARCHIVED"],
  IN_REVIEW: ["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"],
  SCHEDULED: ["DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"],
  // Yayımlanmış bir haber taslağa geri alınmaz: adres kamuya açılmıştır,
  // geri çekme yolu arşivlemedir. `redirects` de bu varsayıma dayanıyor.
  PUBLISHED: ["ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

export function canTransition(from: ArticleStatus, to: ArticleStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function getAllowedTransitions(from: ArticleStatus): ArticleStatus[] {
  return [...allowedTransitions[from]];
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === "" ? null : value));

const optionalUuid = z
  .union([z.literal(""), z.uuid()])
  .transform((value) => (value === "" ? null : value));

const optionalInstant = z
  .string()
  .trim()
  .refine((value) => value === "" || toEditorialInstant(value) !== null, {
    message: "Tarih ve saati eksiksiz girin.",
  })
  .transform((value) => (value === "" ? null : toEditorialInstant(value)));

const EMPTY_BLOCK_MESSAGE = "Boş blok kaydedilemez; ya doldurun ya da kaldırın.";

const inlineSpanSchema = z.object({
  text: z.string(),
  bold: z.literal(true).optional(),
  italic: z.literal(true).optional(),
  underline: z.literal(true).optional(),
  strike: z.literal(true).optional(),
  href: z
    .string()
    .refine((value) => sanitizeHref(value) !== undefined, {
      message: "Bağlantı adresi http(s), mailto ya da site içi / ile başlamalı.",
    })
    .optional(),
});

/** Paragraf, ara başlık, alıntı ve liste maddesinin paylaştığı satır içi gövde. */
const inlineShape = {
  text: z.string(),
  spans: z.array(inlineSpanSchema).optional(),
};

type InlineValue = { text: string; spans?: { text: string }[] };

/**
 * `text`'i parçalardan yeniden üretir.
 *
 * İstemciden gelen `text` ile `spans` ayrışmış olabilir; ayrışırsa `body_text`
 * ve onun beslediği `search_vector` haberin gerçek metnini göstermezdi. Tek
 * doğruluk kaynağı parçalar, `text` onlardan türetiliyor.
 */
function withDerivedText<T extends InlineValue>(value: T): T {
  return value.spans
    ? { ...value, text: value.spans.map((span) => span.text).join("") }
    : { ...value, text: value.text.trim() };
}

const listItemSchema = z
  .object(inlineShape)
  .transform(withDerivedText)
  .refine((item) => item.text.trim() !== "", { message: EMPTY_BLOCK_MESSAGE });

const bodyBlockSchema = z
  .discriminatedUnion("type", [
    z.object({ type: z.literal("paragraph"), ...inlineShape }),
    z.object({
      type: z.literal("heading"),
      level: z.union([z.literal(2), z.literal(3)]),
      ...inlineShape,
    }),
    z.object({
      type: z.literal("quote"),
      attribution: z
        .string()
        .trim()
        .min(1, "Alıntının kime ait olduğunu yazın.")
        .max(200, "Alıntının kaynağı en fazla 200 karakter olabilir."),
      ...inlineShape,
    }),
    z.object({
      type: z.literal("list"),
      ordered: z.boolean(),
      items: z.array(listItemSchema).min(1, EMPTY_BLOCK_MESSAGE),
    }),
  ])
  .transform((block) => (block.type === "list" ? block : withDerivedText(block)))
  .refine((block) => block.type === "list" || block.text.trim() !== "", {
    message: EMPTY_BLOCK_MESSAGE,
  });

export const articleFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(4, "Başlık en az 4 karakter olmalı.")
      .max(200, "Başlık en fazla 200 karakter olabilir."),
    slug: z
      .string()
      .trim()
      .max(SLUG_MAX_LENGTH)
      .regex(SLUG_PATTERN, "Adres yalnızca küçük harf, rakam ve tire içerebilir."),
    summary: optionalText(500),
    articleType: z.enum(articleTypes),
    authorId: optionalUuid,
    topicId: optionalUuid,
    locationId: optionalUuid,
    heroMediaId: optionalUuid,
    socialMediaId: optionalUuid,
    seoTitle: optionalText(200),
    seoDescription: optionalText(320),
    isBreaking: z.boolean(),
    breakingExpiresAt: optionalInstant,
    scheduledAt: optionalInstant,
    blocks: z.array(bodyBlockSchema).min(1, "Haber gövdesi en az bir blok içermeli."),
  })
  // `articles_breaking_expiry` son dakika işaretlenmemiş bir haberde bitiş
  // saatine izin vermiyor. Hata vermek yerine alan sessizce düşürülüyor:
  // işareti kaldıran editör zaten süreyi de kaldırmış sayılır.
  .transform((value) => ({
    ...value,
    breakingExpiresAt: value.isBreaking ? value.breakingExpiresAt : null,
  }));

export type ArticleFormValues = z.output<typeof articleFormSchema>;

/**
 * Gövde tek bir `body` alanından okunuyor.
 *
 * Satır içi biçimlendirme geldikten sonra paralel `FormData` dizileri
 * yetmiyordu; editör bloklarını JSON olarak gönderiyor. Bozuk JSON burada
 * sessizce boş diziye düşüyor ve aşağıdaki `min(1)` kuralının Türkçe hatasını
 * alıyor — kullanıcıya "gövde boş" demek, "JSON çözümlenemedi" demekten yeğ.
 */
function readBodyBlocks(formData: FormData): unknown {
  const raw = formData.get("body");
  if (typeof raw !== "string") return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** `FormData` → şemanın beklediği ham nesne. */
export function readArticleForm(formData: FormData): unknown {
  return {
    title: formData.get("title") ?? "",
    slug: formData.get("slug") ?? "",
    summary: formData.get("summary") ?? "",
    articleType: formData.get("articleType") ?? "NEWS",
    authorId: formData.get("authorId") ?? "",
    topicId: formData.get("topicId") ?? "",
    locationId: formData.get("locationId") ?? "",
    heroMediaId: formData.get("heroMediaId") ?? "",
    socialMediaId: formData.get("socialMediaId") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    isBreaking: formData.get("isBreaking") !== null,
    breakingExpiresAt: formData.get("breakingExpiresAt") ?? "",
    scheduledAt: formData.get("scheduledAt") ?? "",
    blocks: readBodyBlocks(formData),
  };
}

/** İlk sorunun mesajı; form tek satırlık bir uyarı gösteriyor. */
export function getFirstIssueMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Form bilgilerini kontrol edip tekrar deneyin.";
}
