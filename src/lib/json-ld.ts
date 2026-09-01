import { siteConfig } from "@/lib/site";

/**
 * Site düzeyindeki yapısal veri.
 *
 * Haber detayındaki `NewsArticle` (`src/components/site/article-detail.tsx`) her
 * haberi tek tek tanımlıyor; buradakiler ise yayının kendisini tanımlıyor —
 * arama motorunun "bu site nedir, kim yayımlıyor" sorusunun karşılığı.
 *
 * Saf fonksiyonlar: Supabase ya da `server-only` bağımlılığı yok, dolayısıyla
 * birim testinden geçiyorlar ve gerekirse istemci tarafında da çağrılabilirler.
 */

/** Kurum düğümüne başka düğümlerden `@id` ile atıf yapılabilsin diye sabit. */
export const ORGANIZATION_ID = `${siteConfig.url}#organization`;
const WEBSITE_ID = `${siteConfig.url}#website`;

export type JsonLdNode = Record<string, unknown>;

/**
 * `NewsMediaOrganization`, `Organization`'ın haber yayıncısına özgü alt türü.
 * Şu an logo verilmiyor: sitenin markası metin olarak çiziliyor (`brand.tsx`),
 * ortada bir görsel varlık yok. Uydurulmuş bir logo adresi vermektense alanı
 * hiç yazmamak doğru — `JSON.stringify` tanımsız alanları zaten atıyor.
 */
export function organizationJsonLd(): JsonLdNode {
  return {
    "@type": "NewsMediaOrganization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

/**
 * Yayının web sitesi olarak karşılığı.
 *
 * `SearchAction` (site içi arama kutusu) bilerek eklenmedi: `/arama` hem
 * `noindex` hem de `robots.txt` içinde kapalı. Taranmasını istemediğimiz bir
 * adresi arama motoruna önermek tutarsız olurdu.
 */
export function websiteJsonLd(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: "tr-TR",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/** Tek `@graph` içinde iki düğüm: ikisi arasındaki `@id` bağı böyle kuruluyor. */
export function siteJsonLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteJsonLd(), organizationJsonLd()],
  };
}

export type BreadcrumbItem = {
  name: string;
  /** Siteye göreli yol, ör. `/kategori/gundem`. */
  path: string;
};

/**
 * Arşiv sayfalarının kırıntı yolu. Son öğe sayfanın kendisidir ve `item`
 * taşımaz — schema.org'un önerisi bu, çünkü bulunduğunuz sayfaya bağlantı
 * verilmez.
 */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: index === items.length - 1 ? undefined : new URL(item.path, siteConfig.url).toString(),
    })),
  };
}
