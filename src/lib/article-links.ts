/**
 * Gövde metnindeki bağlantıların tek doğrulama noktası.
 *
 * Üç yerde çağrılıyor: editör bir bağlantı yazarken (`news-editor.tsx`), form
 * kaydedilirken (`article-schema.ts`) ve kayıtlı gövde okunurken
 * (`parseArticleBody`). Üçü de aynı kuralı uygulasın diye burada duruyor —
 * `articles.ts` `server-only`, `article-body.ts` değil; ikisinin de import
 * edebileceği tarafsız bir modül gerekiyordu.
 */

/** `<a href>` alanına yazılmasına izin verilen şemalar. */
const allowedProtocols = new Set(["http:", "https:", "mailto:"]);

/**
 * Bir bağlantı adresini normalleştirir; güvenli değilse `undefined` döner.
 *
 * `javascript:` ve `data:` buradan geçemez — editörden gelen metin sonunda bir
 * `href` özniteliğine yazılıyor ve React'in kendi uyarısına güvenmek yetmez.
 * Site içi yollar (`/haber/...`) olduğu gibi korunuyor; `//baska-site` ise
 * protokolsüz bir dış adres olduğu için reddediliyor.
 */
export function sanitizeHref(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const trimmed = value.trim();
  if (trimmed === "") return undefined;

  if (trimmed.startsWith("//")) return undefined;
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const url = new URL(trimmed);
    return allowedProtocols.has(url.protocol) ? trimmed : undefined;
  } catch {
    return undefined;
  }
}

/** Site içi yollar aynı sekmede açılır; dış adresler yeni sekmede. */
export function isExternalHref(href: string): boolean {
  return !href.startsWith("/");
}
