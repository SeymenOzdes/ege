import {
  FEATURED_COUNT,
  type FeaturedStory,
  type HomepageContent,
  type MediaTone,
} from "@/lib/homepage";

const TONES: MediaTone[] = ["teal", "ochre", "ink", "sky", "sage", "coral", "plum"];

const MOCK_STORIES: Array<[title: string, topic: string, location: string]> = [
  ["Kordon'da sabah yürüyüşü: Körfez kıyısı yeniden yaşama döndü", "Yaşam", "İzmir"],
  ["Bodrum'da turizm sezonu rekorla uzadı", "Ekonomi", "Muğla"],
  ["Manisa'da üzüm hasadı erken başladı, rekolte beklentisi yüksek", "Tarım", "Manisa"],
  ["Aydın'da zeytin üreticileri yeni destek paketini değerlendirdi", "Ekonomi", "Aydın"],
  ["Ege Üniversitesi'nden güneş enerjisinde yerli hücre atağı", "Bilim", "İzmir"],
  ["Çeşme'de festival takvimi açıklandı: üç gün sürecek", "Kültür", "İzmir"],
  ["Denizli'de termal turizm yatırımları hız kazanıyor", "Ekonomi", "Denizli"],
  ["Efes Antik Kenti'nde yeni kazı sezonu başladı", "Kültür", "İzmir"],
  ["Ayvalık'ta balıkçılar av yasağı öncesi son hazırlıkta", "Yaşam", "Balıkesir"],
  ["İzmir Metrosu'nda yeni hat için ilk kazma vuruldu", "Ulaşım", "İzmir"],
  ["Kuşadası Limanı'na rekor sayıda kruvaziyer yanaşacak", "Turizm", "Aydın"],
  ["Uşak'ta tarihi çarşı restorasyonu tamamlandı", "Kültür", "Uşak"],
  ["Muğla'da orman yangınlarına karşı yeni erken uyarı sistemi", "Çevre", "Muğla"],
  ["Foça'da Akdeniz foku gözlemleri arttı", "Çevre", "İzmir"],
  ["Ege ihracatçıları yılın ilk yarısında hedefi aştı", "Ekonomi", "İzmir"],
  ["Alaçatı'da rüzgâr sörfü dünya şampiyonası heyecanı", "Spor", "İzmir"],
];

/**
 * Preview only: pads the hero carousel with placeholder slides until the feed holds
 * enough real stories. Callers must not use this in production.
 */
export function padFeaturedWithMock(content: HomepageContent): HomepageContent {
  const missing = FEATURED_COUNT - content.featured.length;
  if (missing <= 0) return content;

  const mocks: FeaturedStory[] = MOCK_STORIES.slice(0, missing).map(
    ([title, topic, location], index) => ({
      id: `mock-${index}`,
      slug: `ornek-haber-${index + 1}`,
      title,
      summary: `${location} ve çevresinden gelişmeler: ${title}`,
      topic,
      topicSlug: topic.toLocaleLowerCase("tr"),
      location,
      publishedLabel: `${8 + (index % 12)}:${index % 2 ? "30" : "05"}`,
      readingTime: `${2 + (index % 4)} dk`,
      mediaTone: TONES[index % TONES.length],
      kicker: topic,
    }),
  );

  return { ...content, featured: [...content.featured, ...mocks] };
}
