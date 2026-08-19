export type MediaTone = "teal" | "ochre" | "ink" | "sky" | "sage" | "coral";

export type ArticlePreview = {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  topic: string;
  topicSlug: string;
  location: string;
  publishedLabel: string;
  readingTime: string;
  mediaTone: MediaTone;
};

export type FeaturedStory = ArticlePreview & {
  kicker: string;
};

export type TopicSection = {
  name: string;
  slug: string;
  lead: ArticlePreview;
  stories: ArticlePreview[];
};

export type HomepageContent = {
  breakingNews: ArticlePreview;
  featured: FeaturedStory[];
  secondary: ArticlePreview[];
  latest: ArticlePreview[];
  topicSections: TopicSection[];
};

const articles = {
  coast: {
    id: "coast",
    slug: "izmirin-kiyi-rotalari",
    title: "Körfezin iki yakasında sabah: İzmir'in yeni kıyı rotaları",
    summary:
      "Deniz ulaşımı, yaya yolları ve kıyı yaşamını aynı hatta buluşturan yeni bir kent ritmi.",
    topic: "Kent",
    topicSlug: "gundem",
    location: "İzmir",
    publishedLabel: "09:42",
    readingTime: "4 dk",
    mediaTone: "teal",
  },
  olive: {
    id: "olive",
    slug: "zeytinin-yeni-hasat-hikayesi",
    title: "Zeytinin yeni hasat hikâyesi genç üreticilerle büyüyor",
    summary: "Küçük üreticiler yerel çeşitleri koruyarak yeni pazarlara açılıyor.",
    topic: "Ekonomi",
    topicSlug: "ekonomi",
    location: "Aydın",
    publishedLabel: "09:18",
    readingTime: "5 dk",
    mediaTone: "sage",
  },
  culture: {
    id: "culture",
    slug: "antik-kentlerde-yaz-aksamlari",
    title: "Antik kentlerde yaz akşamları yeniden sahneyle buluşuyor",
    summary: "Ege'nin tarihî mekânlarında müzik ve tiyatro için yeni bir sezon başlıyor.",
    topic: "Kültür-Sanat",
    topicSlug: "kultur-sanat",
    location: "Muğla",
    publishedLabel: "08:55",
    readingTime: "3 dk",
    mediaTone: "ochre",
  },
  market: {
    id: "market",
    slug: "mahalle-pazarlarinda-yerel-urun",
    title: "Mahalle pazarlarında yerel ürün için yeni dayanışma ağı",
    summary: "Üreticiyle kentliyi aracısız buluşturan model dört ilçede deneniyor.",
    topic: "Yaşam",
    topicSlug: "yasam",
    location: "Manisa",
    publishedLabel: "08:37",
    readingTime: "4 dk",
    mediaTone: "coral",
  },
  rail: {
    id: "rail",
    slug: "ege-hattinda-rayli-ulasim",
    title: "Ege hattında raylı ulaşımın günlük yaşama etkisi",
    summary: "Yeni bağlantı seçenekleri çalışanların ve öğrencilerin rotasını değiştiriyor.",
    topic: "Gündem",
    topicSlug: "gundem",
    location: "Denizli",
    publishedLabel: "08:12",
    readingTime: "6 dk",
    mediaTone: "sky",
  },
  sea: {
    id: "sea",
    slug: "kiyi-koylerinde-deniz-nobetleri",
    title: "Kıyı köylerinde deniz nöbetleri: Maviyi birlikte korumak",
    summary: "Gönüllüler, balıkçılar ve araştırmacılar kıyı temizliği için aynı masada.",
    topic: "Yaşam",
    topicSlug: "yasam",
    location: "Balıkesir",
    publishedLabel: "07:48",
    readingTime: "5 dk",
    mediaTone: "ink",
  },
  design: {
    id: "design",
    slug: "yerel-tasarim-atolyeleri",
    title: "Yerel tasarım atölyeleri eski zanaatlara yeni bir dil kuruyor",
    summary: "Usta-çırak geleneği, genç tasarımcıların çağdaş yorumlarıyla dönüşüyor.",
    topic: "Kültür-Sanat",
    topicSlug: "kultur-sanat",
    location: "Kütahya",
    publishedLabel: "07:20",
    readingTime: "4 dk",
    mediaTone: "ochre",
  },
  soil: {
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
  neighborhood: {
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
} satisfies Record<string, ArticlePreview>;

const homepageContent: HomepageContent = {
  breakingNews: {
    ...articles.coast,
    id: "breaking-coast",
    title: "Körfez hattında günün ilk seferleri başladı",
  },
  featured: [
    {
      ...articles.coast,
      kicker: "Şehrin ritmi denizle değişiyor",
    },
    {
      ...articles.olive,
      kicker: "Topraktan geleceğe",
    },
    {
      ...articles.culture,
      kicker: "Ege'nin açık hava sahneleri",
    },
  ],
  secondary: [articles.market, articles.sea],
  latest: [
    articles.coast,
    articles.olive,
    articles.culture,
    articles.market,
    articles.rail,
    articles.design,
  ],
  topicSections: [
    {
      name: "Gündem",
      slug: "gundem",
      lead: articles.rail,
      stories: [articles.coast, articles.market],
    },
    {
      name: "Ekonomi",
      slug: "ekonomi",
      lead: articles.olive,
      stories: [articles.soil, articles.rail],
    },
    {
      name: "Kültür-Sanat",
      slug: "kultur-sanat",
      lead: articles.culture,
      stories: [articles.design, articles.neighborhood],
    },
    {
      name: "Yaşam",
      slug: "yasam",
      lead: articles.sea,
      stories: [articles.neighborhood, articles.market],
    },
  ],
};

export async function getHomepageContent(): Promise<HomepageContent> {
  return homepageContent;
}

export const homepagePreviewArticle = articles.coast;
