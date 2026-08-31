# Modül 13 — Okur Hesapları ve Kaydedilenler

## Migration

- `reader_accounts`: `public.account_deletion_requests` tablosu, açık talep için tekil
  kısmi indeks ve tarih indeksi.

`bookmarks` için migration gerekmedi. Tablo, grant'ler (`authenticated` rolüne
`select/insert/delete`; **`update` yok**) ve üç sahiplik politikası Modül 4/5'te
oluşturulmuştu. `update` grant'i bulunmadığı için kaydet/kaldır bir `upsert` değil,
insert/delete çiftidir; yinelenen anahtar hatası (`23505`) başarı sayılır.

## Slug → UUID köprüsü

`bookmarks.article_id`, `public.articles(id)` alanına bakan bir `uuid`'dir. Buna karşılık
`/haber/[slug]`, ana sayfa ve arşivler hâlâ `src/lib/articles.ts` ve `src/lib/homepage.ts`
içindeki sabit fixture'ları çizer; bu nesnelerin kimlikleri `"market"` gibi dizelerdir ve
veritabanında karşılıkları yoktur.

Bu yüzden kaydetme **slug ile** çalışır: sunucu eylemi slug'ı alır, `articles` tablosundan
gerçek UUID'yi çözer ve kaydı onunla oluşturur. Fixture slug'larının dokuzu da
`supabase/seed.sql` içindeki yayımlanmış haberlerle birebir aynı olduğundan akış bugün
çalışır ve Modül 11 `/haber/[slug]`'ı veritabanına bağladığında hiçbir değişiklik gerektirmez.

Çözümleme bilerek **okurun kendi istemcisiyle** yapılır. `articles_public_select` yalnızca
yayımlanmış haberleri döndürdüğü için taslak bir haber kaydedilemez ve varlığı da sızmaz.

## Güvenlik

- Sahip kimliği her zaman `supabase.auth.getClaims()` içindeki `sub`'tan okunur; istemciden
  gelen bir profil kimliğine hiçbir yerde güvenilmez.
- Liste sorgusu secret key kullanmaz. `bookmarks_select_own` satırları okura daraltır;
  gömülü `articles!inner` tarafında `articles_public_select` çalışır, bu yüzden arşivlenen
  veya yayından kaldırılan bir haber listeden sessizce düşer, kayıt satırı ise durur.
- `account_deletion_requests`, `search_queries` ve `audit_logs` ile aynı kapalı modeldir:
  politika yok, anon/authenticated grant'i yok, yalnızca secret key ile yazılır.
- Silme talebi silmeyi **uygulamaz**. Geri alınamaz bir işlem tek tıkla tetiklenmesin diye
  talep kaydedilir, personel doğrulayıp elle yürütür. Açık talep için tekil kısmi indeks,
  ikinci gönderimin kuyruk oluşturmasını engeller.

pgTAP tarafında iki okur senaryosu eklendi: bir okur diğerinin kaydını göremez, silemez ve
başkasına ait bir kayıt oluşturamaz (`with check` ihlali).

## Girişten geçen kaydetme

Oturumu olmayan ziyaretçi kaydet düğmesine bastığında:

1. `startBookmarkLogin` hedef haberi `egenin-nabzi-pending-bookmark` httpOnly çerezine yazar
   ve mevcut `egenin-nabzi-auth-next` çerezini kurar.
2. Ziyaretçi `/giris`'e yönlendirilir ve magic link akışını tamamlar.
3. `/auth/confirm`, `verifyOtp` başarılı olduktan sonra çerezi tüketip kaydı oluşturur.
   Oturum çerezleri aynı istekte yazıldığı için istemci artık yetkilidir.
4. Okur haberine `?bilgi=kaydedildi` ile döner ve düğmeyi kaydedilmiş görür.

Kaydetme başarısız olursa giriş **engellenmez**; okur düğmeye yeniden basabilir.

Düğme, oturumu olmayan ziyaretçide bir `<button>` değil bir form gönderimidir; böylece akış
JavaScript olmadan da çalışır.

## İyimser arayüz ve geri alma

`ArticleActions` içinde `useState` sunucu gerçeğini, `useOptimistic` ise ekrandaki değeri
taşır. Eylem başarısız olduğunda `saved` hiç değişmediği için iyimser değer geçiş
sonlandığında kendiliğinden geri döner; hata `aria-live` bölgesinde Türkçe olarak duyurulur.

Etiketin iyimser olması, testlerde dikkat gerektirir: düğmenin dönmesi sunucunun yazmayı
tamamladığı anlamına gelmez. Sunucu gerçeğini doğrulamak için sayfa yeniden yüklenmelidir.

## Uygulama katmanı

| Dosya                                           | Sorumluluk                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------- |
| `src/lib/bookmarks/messages.ts`                 | Saf bildirim eşlemesi. `server-only` değildir, doğrudan test edilir.             |
| `src/lib/bookmarks/queries.ts`                  | `getBookmarkedArticles`, `isArticleBookmarked`. Fırlatmaz; `loadError` döndürür. |
| `src/lib/bookmarks/actions.ts`                  | `toggleBookmark`, `startBookmarkLogin`, `requestAccountDeletion`.                |
| `src/components/site/article-actions.tsx`       | Paylaş + iyimser kaydet; oturumsuz durumda giriş formu.                          |
| `src/components/site/account-deletion-form.tsx` | Yazılı `SİL` onayı isteyen talep formu.                                          |
| `src/app/(site)/kaydedilenler/page.tsx`         | Liste, boş/hata durumları ve "Hesabım" bölümü.                                   |

`isArticleBookmarked` sorgusu `articles` üzerinden kurulur, `bookmarks` üzerinden değil:
süzgeç böylece gömülü kaynağın takma adına değil üst tablonun kendi sütununa uygulanır.
İlk yazımda süzgeç `bookmarks` üzerinden `articles.slug` ile verilmişti; PostgREST bunu
çözemediği için kaydedilmiş haber bile kaydedilmemiş görünüyordu.

`word_count` bir sütun değildir. Arama RPC'si kendi hesaplar; PostgREST ile çekilen
satırlarda aynı değeri `countWords` üretir, böylece iki yüzeyde farklı okuma süresi çıkmaz.

## Sayfa davranışı

`/kaydedilenler` oturum ister; oturumsuz ziyaretçi `/giris?next=%2Fkaydedilenler` adresine
gider. Sayfa dizine girmez (`robots: { index: false }`). Sayfalama arşivlerle ortak `Pager`
ile `?sayfa=` üzerinden yürür.

Başlıktaki okur rozeti artık atıl bir `<span>` değil `/kaydedilenler` bağlantısıdır; personel
rozeti `/yonetim`'e gitmeye devam eder.

## Bilinen sınır

`/haber/[slug]` hâlâ tek bir fixture haber üretir. Kaydetme yalnızca o haberden
denenebilir; diğer sekiz seed haberi için düğme, Modül 11 veri katmanını bağlayana kadar
erişilebilir bir sayfada görünmez. Kayıt mekanizması bu haberler için de hazırdır.
