import type { Metadata } from "next";
import type { ArticlePreview } from "@/lib/homepage";

export type ArticleAuthor = {
  name: string;
  slug: string;
  role: string;
};

export type ArticleMedia = {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  width: number;
  height: number;
};

export type ArticleBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution: string };

export type ArticleDetail = ArticlePreview & {
  author: ArticleAuthor;
  publishedAt: string;
  publishedDisplay: string;
  updatedAt?: string;
  updatedDisplay?: string;
  hero: ArticleMedia;
  body: ArticleBodyBlock[];
  correction: string;
  related: ArticlePreview[];
};

const marketArticle = {
  id: "market",
  slug: "mahalle-pazarlarinda-yerel-urun",
  title: "Mahalle pazarlarında yerel ürün için yeni dayanışma ağı",
  summary:
    "Üreticiyle kentliyi aracısız buluşturan model, Manisa'nın dört ilçesinde küçük üreticinin emeğini mahalle ölçeğinde görünür kılıyor.",
  topic: "Yaşam",
  topicSlug: "yasam",
  location: "Manisa",
  publishedLabel: "08:37",
  readingTime: "4 dk",
  mediaTone: "coral",
  author: {
    name: "Ece Aksoy",
    slug: "ece-aksoy",
    role: "Yerel yaşam muhabiri",
  },
  publishedAt: "2026-08-18T08:37:00+03:00",
  publishedDisplay: "18 Ağustos 2026, 08:37",
  updatedAt: "2026-08-18T10:05:00+03:00",
  updatedDisplay: "18 Ağustos 2026, 10:05",
  hero: {
    src: "/images/mahalle-pazari-dayanisma.png",
    alt: "Manisa'daki bir mahalle pazarında üretici, taze sebzelerle dolu sepeti genç bir kentliye uzatıyor.",
    caption:
      "Dayanışma ağı, üreticinin sabah topladığı ürünü aynı gün mahalle pazarında kentliyle buluşturuyor.",
    credit: "Ege'nin Nabzı için yapay zekâ ile üretilmiş temsili görsel",
    width: 1586,
    height: 992,
  },
  body: [
    {
      type: "paragraph",
      text: "Manisa'da dört ilçenin mahalle pazarlarında başlayan yeni dayanışma modeli, küçük üretici ile kentliyi aynı tezgâhın etrafında buluşturuyor. Pilot uygulamada ürünler aracı depolara uğramadan, üretildiği köyden haftalık pazar rotasına taşınıyor.",
    },
    {
      type: "paragraph",
      text: "Girişimin ilk haftalarında 36 üretici ortak takvim ve taşıma planına dâhil oldu. Her tezgâhta ürünün yetiştiği köyü, hasat gününü ve üreticinin adını gösteren sade bilgi kartları bulunuyor. Böylece fiyat kadar ürünün hikâyesi de görünür hâle geliyor.",
    },
    { type: "heading", text: "Dört ilçede ortak rota" },
    {
      type: "paragraph",
      text: "Yunusemre, Şehzadeler, Turgutlu ve Salihli'de yürütülen deneme, kooperatifler ile mahalle inisiyatiflerinin hazırladığı ortak rota üzerinden ilerliyor. Küçük miktarda ürünü olan çiftçiler de aynı araçta yer paylaşarak taşıma maliyetini düşürüyor.",
    },
    {
      type: "quote",
      text: "Burada yalnızca ürün satmıyoruz; hangi tohumu neden koruduğumuzu da anlatıyoruz. Bizi yeniden aynı sofranın parçası yapan şey bu sohbet.",
      attribution: "Nermin Karaca, Saruhanlı'dan üretici",
    },
    {
      type: "paragraph",
      text: "Pazarın açıldığı ilk iki saatte gönüllüler ürün girişini kaydediyor, gün sonunda satılmayan ürünler ise mahalledeki gıda paylaşım noktalarına yönlendiriliyor. Ağın koordinatörleri, bu sayede hem israfın hem de küçük üreticinin belirsizliğinin azaldığını söylüyor.",
    },
    { type: "heading", text: "Fiyatın ötesinde bir bağ" },
    {
      type: "paragraph",
      text: "Tüketiciler için modelin en görünür yanı şeffaf fiyatlandırma. Tezgâh etiketlerinde üretici payı ile taşıma gideri ayrı ayrı gösteriliyor. İlk veriler, ürün grubuna göre nihai fiyatın geleneksel zincire kıyasla yüzde 8 ile 14 arasında daha düşük kaldığını gösteriyor.",
    },
    {
      type: "paragraph",
      text: "Pilot çalışma ekim ayına kadar sürecek. Sonuçlar üretici geliri, gıda israfı ve mahalle katılımı üzerinden değerlendirilecek. Model başarılı olursa ağın gelecek baharda Akhisar ve Alaşehir'e de genişletilmesi planlanıyor.",
    },
  ],
  correction:
    "Bu haber yayımlandıktan sonra içerikte bir düzeltme yapılmadı. Güncelleme saati, görsel açıklamasına eklenen bağlamı gösterir.",
  related: [
    {
      id: "soil",
      slug: "gediz-ovasinda-toprak-takibi",
      title: "Gediz Ovası'nda toprağı dinleyen yeni üretim yaklaşımı",
      summary: "Çiftçiler suyu ve toprağı birlikte izleyen yöntemleri paylaşmaya başladı.",
      topic: "Ekonomi",
      topicSlug: "ekonomi",
      location: "Manisa",
      publishedLabel: "06:58",
      readingTime: "5 dk",
      mediaTone: "sage",
    },
    {
      id: "neighborhood",
      slug: "mahallede-ortak-sofra",
      title: "Mahallede ortak sofra, kentte yeni komşuluk",
      summary: "Semt girişimleri gıda paylaşımını kalıcı bir dayanışma modeline dönüştürüyor.",
      topic: "Yaşam",
      topicSlug: "yasam",
      location: "İzmir",
      publishedLabel: "06:30",
      readingTime: "3 dk",
      mediaTone: "coral",
    },
  ],
} satisfies ArticleDetail;

const articlesBySlug = new Map<string, ArticleDetail>([[marketArticle.slug, marketArticle]]);

export const articleSlugs = [...articlesBySlug.keys()];

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | undefined> {
  return articlesBySlug.get(slug);
}

export function getArticleMetadata(article: ArticleDetail): Metadata {
  const canonicalPath = `/haber/${article.slug}`;

  return {
    title: article.title,
    description: article.summary,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      title: article.title,
      description: article.summary,
      url: canonicalPath,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: [
        {
          url: article.hero.src,
          width: article.hero.width,
          height: article.hero.height,
          alt: article.hero.alt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
      images: [article.hero.src],
    },
  };
}
