import type { ArticleDetail } from "@/lib/articles";
import { formatFullDateTime, formatPublishedLabel } from "@/lib/article-preview";
import type { ArticleImage, ArticlePreview, FeaturedStory, MediaTone } from "@/lib/homepage";

/**
 * Önizleme (mock) içerik.
 *
 * Bu modül yalnızca geliştirme ortamında kullanılır: ana sayfanın manşet
 * karuselini gerçek fotoğraflarla doldurur ve bu hikâyelerin detay sayfalarının
 * da açılmasını sağlar. Üretim derlemesinde hiçbir yerde okunmaz; çağıran
 * yüzeyler `NODE_ENV` kontrolünü kendileri yapar.
 *
 * Görseller `public/images/haberler` altında duruyor. Kaynak dosya adları
 * Türkçe olduğu için URL'lerde sorun çıkmasın diye ASCII adlarla kopyalandı.
 */

const IMAGE_DIR = "/images/haberler";

/** Mock içeriğin okura açıkça söylediği tek cümle. */
const MOCK_NOTE =
  "Bu içerik, ana sayfa ve haber detayı düzenini denemek için hazırlanmış örnek bir metindir.";

export type MockBodyBlock =
  { type: "paragraph"; text: string } | { type: "heading"; level: 2; text: string };

export type MockStory = {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  topicSlug: string;
  location: string;
  /** ISO damga; kart etiketi buradan türetiliyor. */
  publishedAt: string;
  readingTime: string;
  mediaTone: MediaTone;
  hero: ArticleImage;
  body: MockBodyBlock[];
};

function hero(file: string, alt: string, width = 1200, height = 675): ArticleImage {
  return {
    src: `${IMAGE_DIR}/${file}`,
    alt,
    width,
    height,
    objectPosition: "50% 50%",
  };
}

function body(lead: string, heading: string, detail: string): MockBodyBlock[] {
  return [
    { type: "paragraph", text: lead },
    { type: "heading", level: 2, text: heading },
    { type: "paragraph", text: detail },
    { type: "paragraph", text: MOCK_NOTE },
  ];
}

/**
 * Manşet karuselini dolduran örnek hikâyeler. Başlıklar kamuya açık bir haber
 * listesinden alındı; fotoğraflar aynı listedeki görsellerle eşleşiyor.
 */
export const MOCK_NEWS_STORIES: MockStory[] = [
  {
    slug: "hakan-fidan-arakci-gorusmesi",
    title: "Son dakika: Dışişleri Bakanı Hakan Fidan, Arakçi ile görüştü",
    summary: "Görüşmede bölgesel güvenlik başlıkları ve ikili ilişkilerin ele alındığı bildirildi.",
    topic: "Gündem",
    topicSlug: "gundem",
    location: "Ankara",
    publishedAt: "2026-11-05T18:42:00+03:00",
    readingTime: "2 dk",
    mediaTone: "sky",
    hero: hero("disisleri-bakani-hakan-fidan-arakci.jpg", "Hakan Fidan ve Arakçi görüşmesi"),
    body: body(
      "Dışişleri Bakanı Hakan Fidan, İranlı mevkidaşı Abbas Arakçi ile telefonda görüştü. Görüşmede bölgesel güvenlik ve ikili ilişkilerin ele alındığı bildirildi.",
      "Temaslar sürecek",
      "Diplomatik kaynaklar, görüşmenin önümüzdeki günlerde teknik düzeyde süreceğini aktardı. Heyetler arası ziyaret takviminin de masada olduğu belirtildi.",
    ),
  },
  {
    slug: "fenerbahce-emre-belozoglu-imza-toreni",
    title: "Fenerbahçe'de Emre Belözoğlu için imza töreni düzenlenecek",
    summary: "Kulüp, törenin tesislerde yapılacağını ve taraftara açık olacağını duyurdu.",
    topic: "Spor",
    topicSlug: "spor",
    location: "İstanbul",
    publishedAt: "2026-11-05T18:35:00+03:00",
    readingTime: "2 dk",
    mediaTone: "ochre",
    hero: hero("fenerbahce-emre-belozoglu-imza.jpg", "Fenerbahçe imza töreni"),
    body: body(
      "Fenerbahçe, Emre Belözoğlu için imza töreni düzenleneceğini duyurdu. Törenin kulübün tesislerinde yapılacağı açıklandı.",
      "Yeni dönem",
      "Kulüp, organizasyonun taraftara açık olacağını ve törenin resmi kanallardan canlı yayımlanacağını bildirdi. Ayrıntıların tören öncesinde paylaşılacağı belirtildi.",
    ),
  },
  {
    slug: "afyonkarahisar-silahli-saldiri",
    title: "Son dakika: Afyonkarahisar'da silahlı saldırıda 8 kişi öldü",
    summary: "Olayla ilgili geniş çaplı soruşturma başlatıldı; ekipler bölgede inceleme yapıyor.",
    topic: "Gündem",
    topicSlug: "gundem",
    location: "Afyonkarahisar",
    publishedAt: "2026-11-05T18:20:00+03:00",
    readingTime: "2 dk",
    mediaTone: "ink",
    hero: hero("afyonkarahisar-silahli-saldiri.jpg", "Afyonkarahisar'daki olay yerinden görüntü"),
    body: body(
      "Afyonkarahisar'da bir araca düzenlenen silahlı saldırıda hayatını kaybedenlerin sayısı 8'e yükseldi. Olayla ilgili geniş çaplı soruşturma başlatıldı.",
      "Soruşturma sürüyor",
      "Emniyet ekipleri bölgede inceleme yaparken, olayın nedeni ve faillerin tespiti için çalışmalar sürüyor. Yetkililer gelişmelerin kamuoyuyla paylaşılacağını açıkladı.",
    ),
  },
  {
    slug: "ersan-diamond-suc-duyurusu",
    title: "Kullanılmış çoraplarını satışa çıkarmıştı: Ersan Diamond hakkında suç duyurusu",
    summary: "Bakanlık, tüketicinin korunmasına yönelik mevzuat kapsamında harekete geçti.",
    topic: "Gündem",
    topicSlug: "gundem",
    location: "İstanbul",
    publishedAt: "2026-11-05T18:05:00+03:00",
    readingTime: "2 dk",
    mediaTone: "plum",
    hero: hero("ersan-diamond-suc-duyurusu.jpg", "Ersan Diamond hakkındaki suç duyurusu"),
    body: body(
      "Kullanılmış çoraplarını satışa çıkardığı gerekçesiyle gündeme gelen Ersan Diamond hakkında Bakanlık suç duyurusunda bulundu.",
      "İnceleme başlatıldı",
      "Bakanlık, tüketicinin korunmasına yönelik mevzuat kapsamında inceleme başlatıldığını duyurdu. Markadan konuya ilişkin açıklama bekleniyor.",
    ),
  },
  {
    slug: "demokratlar-iran-mesaji",
    title: "Demokratlardan İran mesajı: Kongre'de neler yapabilirler?",
    summary: "Parti içinde yetki kullanımı, bütçe denetimi ve diplomasi başlıkları tartışılıyor.",
    topic: "Dünya",
    topicSlug: "dunya",
    location: "ABD",
    publishedAt: "2026-11-05T17:50:00+03:00",
    readingTime: "3 dk",
    mediaTone: "teal",
    hero: hero("demokratlar-iran-mesaji.jpg", "Kongre binası önünde basın açıklaması"),
    body: body(
      "ABD'de Demokrat Partili isimler, İran'la savaşın sona erdirilmesi için Kongre'de atılabilecek adımları tartışıyor.",
      "Kongre'deki seçenekler",
      "Yetki kullanımı, bütçe denetimi ve diplomatik girişimler öne çıkan başlıklar arasında. Parti içinde farklı yaklaşımlar bulunduğu belirtiliyor.",
    ),
  },
  {
    slug: "bakan-simsek-2027-butcesi",
    title: "Bakan Şimşek: 2027 bütçesinde emeklilerin alım gücü için kaynak ayırıyoruz",
    summary: "Bütçenin sosyal refahı önceleyen bir çerçevede hazırlandığı belirtildi.",
    topic: "Ekonomi",
    topicSlug: "ekonomi",
    location: "Ankara",
    publishedAt: "2026-11-05T17:38:00+03:00",
    readingTime: "2 dk",
    mediaTone: "sage",
    hero: hero("bakan-simsek-2027-butcesi.jpg", "Bakan Mehmet Şimşek'in bütçe açıklaması"),
    body: body(
      "Hazine ve Maliye Bakanı Mehmet Şimşek, 2027 bütçesinde emeklilerin alım gücünü korumak için kaynak ayrıldığını söyledi.",
      "Bütçe hazırlığı",
      "Şimşek, bütçenin sosyal refahı önceleyen bir çerçevede hazırlandığını belirtti. Ayrıntıların Meclis sürecinde paylaşılacağını kaydetti.",
    ),
  },
  {
    slug: "bahcelievler-insaat-gocugu",
    title: "Bahçelievler'de inşaatta toprak kayması: Göçük altında kalanlar var",
    summary: "Olay yerine sevk edilen ekipler kurtarma çalışmalarını sürdürüyor.",
    topic: "Gündem",
    topicSlug: "gundem",
    location: "İstanbul",
    publishedAt: "2026-11-05T17:24:00+03:00",
    readingTime: "2 dk",
    mediaTone: "coral",
    hero: hero("bahcelievler-insaat-gocugu.jpg", "Bahçelievler'deki inşaat alanı"),
    body: body(
      "Bahçelievler'de bir inşaat alanında toprak kayması meydana geldi. Göçük altında kalanların olduğu bildirildi.",
      "Kurtarma çalışmaları",
      "Olay yerine sevk edilen ekipler çalışmalarını sürdürüyor. Bölgede güvenlik şeridi oluşturuldu ve çevre binalarda tedbir alındı.",
    ),
  },
  {
    slug: "avrupa-bomba-alarmi",
    title: "Avrupa'da yine bomba alarmı: Çok sayıda uçak acil iniş yaptı",
    summary: "İhbarların ardından havalimanlarında geniş çaplı güvenlik taraması başlatıldı.",
    topic: "Dünya",
    topicSlug: "dunya",
    location: "Avrupa",
    publishedAt: "2026-11-05T17:10:00+03:00",
    readingTime: "2 dk",
    mediaTone: "teal",
    hero: hero("avrupa-bomba-alarmi.jpg", "Havalimanında güvenlik kontrolü"),
    body: body(
      "Avrupa'da ardı ardına gelen bomba ihbarları nedeniyle çok sayıda uçak acil iniş yaptı. Uçaklardan biri askeri üsse yönlendirildi.",
      "Havalimanlarında yoğunluk",
      "Yetkililer ihbarların ardından geniş çaplı güvenlik taraması başlattı. Seferlerde gecikmeler yaşanırken yolcular tahliye edildi.",
    ),
  },
  {
    slug: "bitcoin-80-bin-dolar",
    title: "Bitcoin 80 bin doları aştı: ABD ara seçimleri kripto piyasasını hareketlendirdi",
    summary: "Kripto piyasasında işlem hacmi belirgin biçimde arttı.",
    topic: "Ekonomi",
    topicSlug: "ekonomi",
    location: "Küresel",
    publishedAt: "2026-11-05T16:55:00+03:00",
    readingTime: "2 dk",
    mediaTone: "ochre",
    hero: hero("bitcoin-80-bin-dolar.jpg", "Bitcoin fiyat grafiği"),
    body: body(
      "Bitcoin, ABD'deki ara seçimlerin ardından 80 bin dolar seviyesini aştı. Kripto piyasasında işlem hacmi belirgin biçimde arttı.",
      "Piyasada hareketlilik",
      "Analistler, seçim sonuçlarının düzenleyici beklentileri değiştirdiğini söylüyor. Diğer büyük kripto varlıklar da gün içinde yükseldi.",
    ),
  },
  {
    slug: "erdogan-abd-secimi-aciklamasi",
    title: "Cumhurbaşkanı Erdoğan'dan ABD seçimi değerlendirmesi",
    summary: "Açıklamada ikili ilişkilerin seyri ve bölgesel gelişmeler ele alındı.",
    topic: "Gündem",
    topicSlug: "gundem",
    location: "Ankara",
    publishedAt: "2026-11-05T16:40:00+03:00",
    readingTime: "2 dk",
    mediaTone: "sky",
    hero: hero("erdogan-abd-secimi-aciklamasi.jpg", "Cumhurbaşkanı Erdoğan'ın açıklaması"),
    body: body(
      "Cumhurbaşkanı Recep Tayyip Erdoğan, ABD'deki seçim sonuçlarını değerlendirdi. Açıklamada ikili ilişkilerin seyri ve bölgesel gelişmeler ele alındı.",
      "İkili ilişkiler",
      "Erdoğan, yeni dönemde iş birliği alanlarının genişletilmesi gerektiğini vurguladı. Temasların süreceği belirtildi.",
    ),
  },
  {
    slug: "orman-yangini-yapay-zeka",
    title: "Bakan Yumaklı: Ormanlarda yangınla mücadelede yapay zeka dönemi",
    summary: "Duman ve ısı değişimini izleyen erken uyarı sistemi Ege ve Akdeniz'de başlıyor.",
    topic: "Ekonomi",
    topicSlug: "ekonomi",
    location: "Ankara",
    publishedAt: "2026-11-05T16:25:00+03:00",
    readingTime: "3 dk",
    mediaTone: "sage",
    hero: hero("orman-yangini-yapay-zeka.jpg", "Orman yangınıyla mücadele çalışmaları"),
    body: body(
      "Tarım ve Orman Bakanı İbrahim Yumaklı, orman yangınlarıyla mücadelede yapay zeka destekli sistemlerin devreye alınacağını açıkladı.",
      "Erken uyarı güçleniyor",
      "Yeni sistemin duman ve ısı değişimlerini kameralar üzerinden izleyerek erken uyarı üreteceği belirtildi. Pilot uygulama Ege ve Akdeniz'de başlayacak.",
    ),
  },
  {
    slug: "chpde-4-istifa",
    title: "CHP'de 4 istifa birden: DEM Parti'ye geçtiler",
    summary: "İstifalar, önümüzdeki dönemde ittifak tartışmalarını yeniden gündeme getirebilir.",
    topic: "Gündem",
    topicSlug: "gundem",
    location: "Ankara",
    publishedAt: "2026-11-05T16:08:00+03:00",
    readingTime: "2 dk",
    mediaTone: "plum",
    hero: hero("chpde-4-istifa.jpg", "Parti binası önünde basın toplantısı"),
    body: body(
      "CHP'de dört isim partiden istifa ederek DEM Parti'ye geçti. İstifalar parti içinde tartışma başlattı.",
      "Siyasi dengeler",
      "Yerel siyasette etkisi olan isimlerin geçişi, önümüzdeki dönemde ittifak tartışmalarını yeniden gündeme getirebilir. Her iki partiden de açıklama bekleniyor.",
    ),
  },
  {
    slug: "borsa-persembe-dususu",
    title: "Borsa perşembe gününü düşüşle tamamladı",
    summary: "BIST 100 endeksi gün içinde dalgalı bir seyir izledi.",
    topic: "Ekonomi",
    topicSlug: "ekonomi",
    location: "İstanbul",
    publishedAt: "2026-11-05T15:52:00+03:00",
    readingTime: "2 dk",
    mediaTone: "sage",
    hero: hero("borsa-persembe-dususu.jpg", "Borsa ekranındaki endeks görüntüsü"),
    body: body(
      "Borsa İstanbul, perşembe gününü düşüşle tamamladı. BIST 100 endeksi gün içinde dalgalı bir seyir izledi.",
      "Sektör bazlı görünüm",
      "Bankacılık hisselerindeki satış baskısı endeksi aşağı çekerken, sanayi tarafında karışık bir tablo oluştu. Yatırımcılar küresel piyasaları izliyor.",
    ),
  },
  {
    slug: "new-york-yangin-faciasi",
    title: "New York'ta yangın faciası: Alevler binayı sardı, 6 kişi öldü",
    summary: "Yangının çıkış nedeni araştırılıyor; bina sakinleri güvenli bölgeye tahliye edildi.",
    topic: "Dünya",
    topicSlug: "dunya",
    location: "New York",
    publishedAt: "2026-11-05T15:36:00+03:00",
    readingTime: "2 dk",
    mediaTone: "ink",
    hero: hero("new-york-yangin-faciasi.jpg", "New York'ta yangın çıkan bina"),
    body: body(
      "New York'ta bir binada çıkan yangında 6 kişi hayatını kaybetti. Alevler kısa sürede binanın tamamını sardı.",
      "İnceleme başlatıldı",
      "İtfaiye ekipleri yangını kontrol altına alırken bina sakinleri güvenli bölgeye tahliye edildi. Yangının çıkış nedeni araştırılıyor.",
    ),
  },
  {
    slug: "bakan-kurum-istanbul-depremi",
    title: "Bakan Kurum: Olası İstanbul depremi bir milli güvenlik sorunudur",
    summary: "Riskli yapıların dönüştürülmesi ve tahliye planları gündemde.",
    topic: "Gündem",
    topicSlug: "gundem",
    location: "İstanbul",
    publishedAt: "2026-11-05T15:20:00+03:00",
    readingTime: "3 dk",
    mediaTone: "coral",
    hero: hero("bakan-kurum-istanbul-depremi.jpg", "Kentsel dönüşüm çalışmaları"),
    body: body(
      "Çevre, Şehircilik ve İklim Değişikliği Bakanı Murat Kurum, olası İstanbul depreminin milli güvenlik sorunu olduğunu söyledi.",
      "Kentsel dönüşüm vurgusu",
      "Kurum, riskli yapıların dönüştürülmesi ve tahliye planlarının hızlandırılması gerektiğini belirtti. Çalışmaların ilgili kurumlarla eşgüdüm içinde yürütüleceği kaydedildi.",
    ),
  },
];

export const MOCK_NEWS_BY_SLUG = new Map(MOCK_NEWS_STORIES.map((story) => [story.slug, story]));

/**
 * Seed'deki gerçek haberlere eşleşen fotoğraflar.
 *
 * Depoda zaten duran `ege-nabzi-haber-gorselleri` dosyaları, seed slug'larıyla
 * birebir eşleşiyor; geliştirme ortamında hero görseli olmayan haberlere bunlar
 * bağlanınca ana sayfanın yan kolonları da fotoğraflı görünüyor. Üretimde
 * kullanılmaz.
 */
const SEED_HEROES: Record<string, ArticleImage> = {
  "izmirin-kiyi-rotalari": hero(
    "izmir-kiyi-rotalari.jpg",
    "İzmir Körfezi kıyısında yürüyüş yolu",
    1600,
    1066,
  ),
  "zeytinin-yeni-hasat-hikayesi": {
    src: "/images/mahalle-pazari-dayanisma.png",
    alt: "Yerel üreticinin pazar tezgâhı",
    width: 1586,
    height: 992,
    objectPosition: "50% 50%",
  },
  "antik-kentlerde-yaz-aksamlari": {
    src: "/images/bulten-izmir-korfezi.jpg",
    alt: "İzmir Körfezi ve kent manzarası",
    width: 1600,
    height: 1066,
    objectPosition: "50% 50%",
  },
  "ege-hattinda-rayli-ulasim": hero("ege-rayli-ulasim.jpg", "Raylı sistem hattı", 1600, 1066),
  "kiyi-koylerinde-deniz-nobetleri": hero(
    "kiyi-koyleri-deniz-nobetleri.jpg",
    "Kıyı köyünde deniz kenarı",
    1600,
    1066,
  ),
  "yerel-tasarim-atolyeleri": hero(
    "yerel-tasarim-atolyeleri.jpg",
    "Seramik atölyesinde üretim",
    1600,
    1200,
  ),
  "gediz-ovasinda-toprak-takibi": hero(
    "gediz-ovasi-uretim.jpg",
    "Gediz Ovası'nda tarım alanı",
    1600,
    1066,
  ),
  "mahallede-ortak-sofra": hero(
    "mahallede-ortak-sofra.jpg",
    "Mahallede kurulan ortak sofra",
    1600,
    947,
  ),
  "mahalle-pazarlarinda-yerel-urun": hero(
    "mahalle-pazarinda-yerel-urun.jpg",
    "Mahalle pazarında yerel ürün tezgâhı",
    1600,
    1066,
  ),
  "bodrum-kiyisinda-bisiklet-yolu": hero(
    "izmir-kiyi-rotalari.jpg",
    "Kıyı boyunca uzanan bisiklet yolu",
    1600,
    1066,
  ),
  "efeste-arkeoloji-yaz-okulu": hero(
    "yerel-tasarim-atolyeleri.jpg",
    "Arkeoloji atölyesinde çalışma",
    1600,
    1200,
  ),
};

/** Bir slug için önizleme görseli: önce seed eşleşmesi, sonra mock hikâye. */
export function mockHeroForSlug(slug: string): ArticleImage | undefined {
  return SEED_HEROES[slug] ?? MOCK_NEWS_BY_SLUG.get(slug)?.hero;
}

/**
 * Görseli olmayan bir kartı önizleme fotoğrafıyla doldurur. Eşleşme yoksa
 * haberi olduğu gibi bırakır; renkli yüzey yer tutucu olarak kalır.
 */
export function withMockHero<T extends { slug: string; hero?: ArticleImage }>(article: T): T {
  if (article.hero) return article;

  const hero = mockHeroForSlug(article.slug);
  return hero ? { ...article, hero } : article;
}

export function mockNewsPreview(story: MockStory, now?: Date): ArticlePreview {
  return {
    id: `mock-${story.slug}`,
    slug: story.slug,
    title: story.title,
    summary: story.summary,
    topic: story.topic,
    topicSlug: story.topicSlug,
    location: story.location,
    publishedLabel: formatPublishedLabel(story.publishedAt, now),
    publishedAt: story.publishedAt,
    readingTime: story.readingTime,
    hero: story.hero,
    mediaTone: story.mediaTone,
  };
}

export function mockNewsFeatured(story: MockStory): FeaturedStory {
  return { ...mockNewsPreview(story), kicker: story.topic };
}

/** Önizleme hikâyesinin detay sayfası; `getArticleBySlug` yalnızca dev'de çağırır. */
export function getMockArticleDetail(slug: string): ArticleDetail | undefined {
  const story = MOCK_NEWS_BY_SLUG.get(slug);
  if (!story) return undefined;

  const related = MOCK_NEWS_STORIES.filter((entry) => entry.slug !== story.slug)
    .slice(0, 3)
    .map((entry) => mockNewsPreview(entry));

  return {
    ...mockNewsPreview(story),
    author: { name: "Ege'nin Nabzı Haber Merkezi", slug: "", role: "Haber merkezi" },
    publishedAt: story.publishedAt,
    publishedDisplay: formatFullDateTime(story.publishedAt),
    body: story.body,
    related,
  };
}
