# Modül 12 — Türkçe Arama

## Migration'lar

- `turkish_search`: `public.search_published_articles` fonksiyonu ve `anon`/`authenticated` yürütme izni.
- `search_analytics`: sonuçsuz sorgular için `public.search_queries` tablosu.

## Arama fonksiyonu

`search_published_articles(p_query, p_topic, p_location, p_limit, p_offset)` tek turda
sıralama, filtreleme, vurgulama ve toplam sayıyı döndürür:

- Sorgu `websearch_to_tsquery('turkish', …)` ile çözümlenir; boş girdide tsquery hiç
  kurulmaz, böylece gereksiz `NOTICE` üretilmez.
- Eşleşme, Modül 4'te üretilen `articles.search_vector` üzerinden `articles_search_vector_idx`
  GIN indeksiyle bulunur. Sıralama `ts_rank`, eşitlikte `published_at` ile yapılır.
- `count(*) over ()` LIMIT'ten önce hesaplandığı için toplam, sayfalamadan bağımsızdır.
- `ts_headline` yalnızca döndürülen sayfa dilimi için çalışır; girdi olarak özet ve gövde
  birlikte verilir, çünkü sorgu yalnız gövdede eşleşebilir.

## Güvenlik

- Fonksiyon `security invoker`'dır; `articles_public_select` politikası çağıran role uygulanır.
- Yayın koşulları (`PUBLISHED`, `published_at <= now()`, `archived_at is null`) ayrıca
  `WHERE` içinde tekrarlanır. Bu kritik: `articles_staff_manage` politikası EDITOR/ADMIN
  oturumuna taslak ve ileri tarihli haberleri görme izni verir, arama bunları sızdırmamalıdır.
  pgTAP testi bu davranışı yönetici JWT'siyle doğrular.
- Vurgulama HTML ile değil, STX/ETX kontrol karakterleriyle yapılır. `HighlightedText`
  bileşeni bu karakterlerden bölerek gerçek `<mark>` öğeleri üretir; `dangerouslySetInnerHTML`
  hiçbir yerde kullanılmaz.
- `search_queries` tablosunda politika ve `anon` grant'i yoktur; yalnızca sunucu tarafındaki
  secret key ile yazılır. `audit_logs` ile aynı kapalı modeldir.

## Uygulama katmanı

| Dosya                                      | Sorumluluk                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `src/lib/search-query.ts`                  | Saf yardımcılar: `normalizeSearchQuery`, `buildSearchHref`. `server-only` değildir, doğrudan test edilir. |
| `src/lib/search.ts`                        | `searchArticles` (RPC çağrısı) ve `getSearchFacets`. Hata fırlatmaz; `loadError` döndürür.                |
| `src/lib/article-preview.ts`               | Veritabanı satırını kartların beklediği `ArticlePreview` şekline çevirir.                                 |
| `src/lib/search-analytics.ts`              | Yalnızca sonuçsuz sorguları `search_queries` içine yazar.                                                 |
| `src/lib/supabase/admin.ts`                | Secret key istemcisi. Şu an yalnızca arama telemetrisi kullanır.                                          |
| `src/components/site/highlighted-text.tsx` | Vurgulanan alıntıyı güvenle `<mark>` olarak çizer.                                                        |

`publishedLabel`, `readingTime` ve `mediaTone` sütun değildir; `article-preview.ts` içinde
türetilir. Saat ve tarih `Europe/Istanbul` zaman dilimine sabitlenir, böylece sunucu ve
istemci etiketleri ayrışmaz.

## Sayfa davranışı

`/arama` düz bir GET formudur: sonuçlar paylaşılabilir, JavaScript olmadan da çalışır ve
taranabilir. `q`, `konu`, `sehir` ve `sayfa` parametreleri `buildSearchHref` ile korunur.

Durumlar: boş sorgu, iki karakterden kısa sorgu, 120 karakterden uzun sorgu, sonuç yok,
ve `loadError`. Supabase yapılandırılmamışsa veya sorgu başarısızsa sayfa sessizce demo
içeriğe düşmez; Türkçe bir hata durumu gösterir.

`total_count` döndürülen satırlarla geldiği için son sayfanın ötesi boş döner ve "sonuç yok"
ile ayırt edilemez. Bu nedenle ikinci ve sonraki sayfalarda boş sonuç, kalıcı not-found
sınırına yönlendirilir; telemetri de yalnızca ilk sayfada yazılır.

## Seed

`supabase/seed.sql` artık dokuz yayımlanmış haber içerir. Slug, başlık ve özetler kamuya
açık önizleme kataloğuyla birebir aynıdır. `body_text` gövde JSONB'sinden türetilir, bu
sayede metin tekrar edilmez ve `search_vector` gerçek Türkçe içerikle dolar. Kütahya
lokasyonu ile `elif-demir` ve `kerem-aydin` yazarları da bu modülde eklendi.

## Bilinen sınır

`/haber/[slug]` hâlâ `dynamicParams = false` ile tek bir makale üretir. Arama dokuz haberi
listelediğinden sekiz bağlantı 404 verir. Bu durum modül öncesinde de vardı — ana sayfa ve
tüm arşivler aynı slug'lara bağlanıyor — ve `/haber/[slug]` veritabanına bağlandığında,
yani Modül 11'in tamamlanmasıyla kapanır.
