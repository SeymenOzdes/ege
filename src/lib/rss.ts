/**
 * RSS 2.0 üreticisi.
 *
 * Bağımlılık eklemek yerine elle yazıldı: besleme sabit bir şablon ve tek
 * değişkeni haber listesi. Saf tutuldu (Supabase yok, `server-only` yok), böylece
 * kaçış ve tarih biçimi birim testinden geçiyor — bir beslemede en çok kırılan
 * iki şey bunlar.
 */

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

/**
 * XML 1.0'ın kabul ettiği karakter aralığı. Tab (09), satır sonu (0A) ve satır
 * başı (0D) dışındaki kontrol karakterleri, yalnız kalmış vekil (surrogate)
 * kod noktaları ve FFFE/FFFF geçersizdir.
 *
 * Karakter sınıfı yerine kod noktası karşılaştırması: kontrol karakterlerini
 * bir regex düzgüsüne gömmek onları kaynak dosyada görünmez kılıyor.
 */
function isValidXmlCodePoint(code: number): boolean {
  if (code === 0x09 || code === 0x0a || code === 0x0d) return true;
  if (code >= 0x20 && code <= 0xd7ff) return true;
  if (code >= 0xe000 && code <= 0xfffd) return true;
  return code >= 0x10000;
}

/**
 * XML metin düğümü kaçışı.
 *
 * Tek `replace` çağrısı kullanılıyor: `&` ayrı bir geçişte değiştirilseydi
 * sonradan üretilen `&lt;` yeniden kaçırılıp `&amp;lt;` olurdu.
 *
 * Geçersiz karakterler düşürülüyor. Veritabanından gelen bir başlıkta
 * bulunmamalı, ama bulunursa beslemenin tamamı ayrıştırılamaz hâle gelir — bir
 * karakter kaybetmek beslemeyi kaybetmekten iyidir.
 */
export function escapeXml(value: string): string {
  let cleaned = "";
  for (const character of value) {
    if (isValidXmlCodePoint(character.codePointAt(0) ?? 0)) cleaned += character;
  }

  return cleaned.replace(/[&<>"']/g, (character) => XML_ESCAPES[character] ?? character);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/**
 * RSS 2.0 tarihleri RFC 822 ister; ISO 8601 kabul edilmez.
 *
 * Gün ve ay adları elle kuruluyor ki her ortamda İngilizce kalsın — sitenin geri
 * kalanı `tr-TR` biçimlendiricileri kullanıyor, beslemede aynısı bozuk tarih
 * demek olurdu. Geçersiz tarihte `undefined` dönüyor; çağıran alanı hiç yazmıyor.
 */
export function toRfc822(value: string | Date): string | undefined {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  const day = DAYS[date.getUTCDay()];
  const month = MONTHS[date.getUTCMonth()];
  const time = `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`;

  return `${day}, ${pad(date.getUTCDate())} ${month} ${date.getUTCFullYear()} ${time} GMT`;
}

export type RssItem = {
  title: string;
  /** Mutlak adres. */
  link: string;
  description?: string;
  /** ISO 8601; geçersizse `pubDate` yazılmaz. */
  publishedAt?: string;
  category?: string;
  author?: string;
};

export type RssChannel = {
  title: string;
  /** Sitenin ana sayfası. */
  link: string;
  description: string;
  /** Beslemenin kendi adresi; `atom:link rel="self"` olarak yazılır. */
  selfLink: string;
  language?: string;
  items: RssItem[];
};

/** Değeri tanımsız olan alan hiç yazılmaz; boş etiket üretmenin anlamı yok. */
function tag(indent: string, name: string, value: string | undefined): string | undefined {
  return value === undefined ? undefined : `${indent}<${name}>${escapeXml(value)}</${name}>`;
}

function lines(...values: (string | undefined)[]): string[] {
  return values.filter((value): value is string => value !== undefined);
}

function renderItem(item: RssItem): string {
  return lines(
    "  <item>",
    tag("    ", "title", item.title),
    tag("    ", "link", item.link),
    tag("    ", "description", item.description),
    tag("    ", "category", item.category),
    // `dc:creator`, RSS'in `author` alanının aksine e-posta adresi istemiyor;
    // muhabirin adını yayımlamak için doğru alan bu.
    tag("    ", "dc:creator", item.author),
    tag("    ", "pubDate", toRfc822(item.publishedAt ?? "")),
    // Kalıcı kimlik olarak adresin kendisi kullanılıyor. Slug değişirse okuyucu
    // haberi yeni sayar; slug değişimi zaten eski adresten yönlendirme üretiyor.
    `    <guid isPermaLink="true">${escapeXml(item.link)}</guid>`,
    "  </item>",
  ).join("\n");
}

export function buildRssFeed(channel: RssChannel): string {
  // Beslemenin tazeliği en yeni haberin tarihidir; üretim anı değil. Aksi hâlde
  // hiçbir şey yayımlanmasa bile besleme her istekte değişmiş görünürdü.
  const latestPublishedAt = channel.items
    .map((item) => item.publishedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return [
    ...lines(
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
      "<channel>",
      tag("  ", "title", channel.title),
      tag("  ", "link", channel.link),
      tag("  ", "description", channel.description),
      tag("  ", "language", channel.language ?? "tr"),
      tag("  ", "lastBuildDate", toRfc822(latestPublishedAt ?? "")),
      `  <atom:link href="${escapeXml(channel.selfLink)}" rel="self" type="application/rss+xml" />`,
    ),
    ...channel.items.map(renderItem),
    "</channel>",
    "</rss>",
    "",
  ].join("\n");
}
