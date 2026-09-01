# Launch hazırlığı — oturum durumu

- **Tarih:** 2026-09-01
- **Dal:** `launch-hazirligi` (`main`'den ayrıldı, `main` bu oturumda `78a91e1`'e ilerletildi)
- **Kapsam:** `docs/launch-readiness.md`'de açık kalan altı iş kaleminin **hepsi tamamlandı**
  (Faz 1–6).

Bu belge, planın hangi bölümünün bittiğini ve kalanların hangi zeminden devam edeceğini
kaydeder. Planın tamamı `~/.claude/plans/you-can-continue-misty-tome.md` içinde.

## Depo durumu

`main` bu oturumdan önce `2c7e948`'deydi ve Supabase bağlantısı yapılmış
`kamuya-acik-sayfalari-supabaseye-bagla` dalı birleştirilmemiş bekliyordu. Çalışma
ağacı ise `login` dalındaydı ve üzerinde commit edilmemiş Google OAuth işi vardı.

Yapılanlar:

1. `login` dalının commit edilmemiş işi **stash'e alındı** — kaybolmadı:

   ```
   git checkout login && git stash list && git stash pop
   ```

   Stash başlığı: `On login: login dali: Google OAuth WIP (plan Faz 0)`.
   İçindekiler: `src/app/(site)/giris/page.tsx`, `src/app/auth/confirm/route.ts`,
   `src/lib/auth/actions.ts`, `src/lib/auth/redirect.ts`, `src/lib/auth/redirect.test.ts`,
   `supabase/config.toml`, `src/app/auth/callback/route.ts`,
   `src/lib/auth/pending-bookmark.ts`, `docs/google-login-setup.md`.

2. `kamuya-acik-sayfalari-supabaseye-bagla` → `main` (fast-forward, `78a91e1`).
3. `main`'den `launch-hazirligi` dalı açıldı; bu oturumun iki commit'i orada.

> **Dikkat:** `login` stash'i geri alınıp birleştirildiğinde `src/lib/auth/actions.ts` ve
> `giris/page.tsx` üzerinde çakışma beklenir — bu oturum `actions.ts`'e dokunmadı ama
> `server.ts` ve yeni `session.ts` aynı bölgeyi okuyor.

## Biten: Faz 1 — Haber görselleri (`bf83537`)

`launch-readiness.md` P1 #9 kapandı.

- `src/lib/media.ts`: saf `getMediaPublicUrl()` ve `getObjectPosition()`. Bucket public
  olduğu için adres yalnızca `object_path`'ten türüyor; `supabase.storage.getPublicUrl()`
  bir istemci örneği ister ve bu yardımcıya `"use client"` karusel üzerinden ulaşılıyor.
- `ARTICLE_PREVIEW_SELECTION` ve `ARTICLE_DETAIL_SELECTION` hero embed'i alıyor.
  Foreign key **açıkça adlandırıldı** (`media_assets!articles_hero_media_id_fkey`):
  `articles` tablosu `media_assets`'e hem `hero_media_id` hem `social_media_id`
  üzerinden bağlı ve PostgREST belirsiz embed'i reddediyor.
- `ArticlePreview.hero?: ArticleImage` eklendi; `mediaTone` yerinde kaldı ve görseli
  olmayan haber için yedek olmayı sürdürüyor.
- `MediaSurface` hero varsa `next/image`, yoksa eski renk yüzeyini çiziyor. Karuselin
  etkin slaytı `priority` alıyor (LCP).
- `next.config.ts`: `images.remotePatterns` `NEXT_PUBLIC_SUPABASE_URL`'den türetiliyor,
  yalnız `/storage/v1/object/public/news-media/**` yoluna ve sorgusuz adrese daraltılmış.
  Değişken tanımsızsa desen üretilmiyor, yapılandırmasız derleme çalışıyor.
- Testler: `media.test.ts` (public URL, odak noktası, sınırlama), `article-preview.test.ts`
  (hero eşleme, boyutsuz varlık). `vitest.config.mts` artık `NEXT_PUBLIC_SUPABASE_URL`'i
  sabitliyor; publishable key hâlâ tanımsız, yani `hasSupabasePublicConfig()` false kalıyor
  ve adaptörler çevrimdışı yollarında test edilmeye devam ediyor.

~~**Doğrulanmadı:** Seed verisinde hiçbir makalede `hero_media_id` dolu değil...~~
**Faz 5'te doğrulandı:** Medya kütüphanesine gerçek bir görsel yüklendi, yeni haberin
hero'su olarak seçildi ve haber sayfasında `next/image` ile çizildiği görüldü
(`figure img` sayısı 1). Test verisi sonradan temizlendi, seed hâlâ hero'suz.

## Biten: Faz 2 — ISR (`81e2312`)

`launch-readiness.md` P1 #10 kapandı.

Layout'taki `force-dynamic` bayrağını kaldırmak tek başına yetmedi. Sırayla kaldırılan
istek zamanlı okumalar:

1. **Başlıktaki hesap durumu.** `useCurrentUser` (`src/lib/auth/use-current-user.ts`)
   oturumu tarayıcıda çözüyor. `UserMenu` prop alan saf bileşen olarak kaldı — birim
   testleri değişmedi; oturum çözümü `AccountMenu` / `MobileAccountLinks`'e
   (`src/components/site/account-menu.tsx`) taşındı. `CurrentUser` tipi ve claims
   eşlemesi `server-only` olmayan `src/lib/auth/session.ts`'e alındı, böylece sunucu ve
   tarayıcı yolları aynı şekli üretiyor.
2. **Kaydet düğmesi.** `ArticleActions` kendi durumunu çözüyor; `isArticleBookmarked`
   `bookmarks/queries.ts`'ten kaldırıldı.
3. **`?bilgi=` bildirimi.** `BookmarkNotice` içinde `useSearchParams` ile, Suspense
   sınırında.
4. **Asıl engel:** kamuya açık okuma yolları çerez taşıyan istemciyi kullanıyordu ve tek
   başına bu bile rotayı dinamik yapıyordu. `homepage-content.ts`, `archives.ts` ve
   `articles.ts` artık yeni `src/lib/supabase/anon.ts`'teki `createAnonClient()` ile
   okuyor. Yan fayda: oturum açmış bir editör artık kamuya açık sayfada taslağı
   göremiyor — `articles_staff_manage` devreye girmiyor. Önbelleğe alınan bir sayfa kimin
   istediğine göre değişmemeli.

`pnpm build` çıktısı:

| Rota                                                          | Durum                                                 |
| ------------------------------------------------------------- | ----------------------------------------------------- |
| `/`                                                           | ○ static, 1 dk revalidate                             |
| `/haber/[slug]`                                               | ● SSG, son 100 slug önden üretiliyor, 5 dk revalidate |
| `/kategori/[slug]`, `/yazar/[slug]`, `/son-dakika`            | ƒ dinamik                                             |
| `/arama`, `/kaydedilenler`, `/giris`, `/bulten`, `/yonetim/*` | ƒ dinamik (doğru)                                     |

### Plandan sapma: arşivler dinamik kaldı

Plan bu üç arşiv rotasına `revalidate = 300` öngörüyordu. Uygulanmadı: üçü de sayfalama
için `?sayfa=` okuyor ve arama parametresi okuyan bir rota Next'te istek zamanlıdır —
`revalidate` yazmak çıktıyı değiştirmez, yalnız yanıltır. Rotalara bunu açıklayan bir
yorum bırakıldı.

Önbelleğe almanın yolu sayfalamayı yol parçasına taşımak (`/son-dakika/sayfa/2`); bu bir
adres değişikliği ve ayrı bir iş. `cacheComponents` (PPR) de çözerdi ama tüm uygulamayı
route-segment config'den `use cache`'e taşımayı gerektirir.

## Biten: Faz 3 — Kurumsal sayfalar (`0f17fef`)

`launch-readiness.md` P0 #4 kapandı. Yedi altbilgi bağlantısının hepsi açılıyor.

Yeni rota grubu `src/app/(site)/(kurumsal)/` altında yedi sayfa: `/kunye`,
`/yayin-ilkeleri`, `/duzeltmeler`, `/iletisim`, `/gizlilik`, `/cerezler`,
`/kullanim-kosullari`. Hepsi `○ static` üretiliyor ve kendi `alternates.canonical`
metadata'sını taşıyor.

- `src/components/site/corporate.tsx` — ortak kabuk. `CorporateDocument` başlık, giriş
  metni, taslak uyarısı ve altta kardeş sayfa bağlantılarını çiziyor; `Placeholder`,
  `FactList` / `Fact` ise künye satırlarını. Ölçü 42rem: haber detayının okuma sütunuyla
  aynı, ama sola hizalı — bunlar belge, manşet değil.
- `src/lib/corporate-pages.ts` — yedi sayfanın tek listesi. Üç yer okuyor: kardeş
  bağlantılar, `sitemap.ts` ve `corporate-pages.test.ts`. Test, listedeki her yol için
  gerçekten bir dizin bulunduğunu doğruluyor; liste ile rotaların ayrışması aksi hâlde
  sitemap'te 404 olarak ortaya çıkardı.
- Metinlerin tamamı Türkçe ve tam; **gerçek bilgilerin hiçbiri yok**. 49 yer tutucu
  `[DOLDURULACAK: …]` olarak, `mark` ile turuncu kesikli çerçeve içinde duruyor ve
  `data-doldurulacak` özniteliği taşıyor. Dökümü `docs/kurumsal-sayfa-bilgileri.md`.
- Her sayfanın başında "Taslak metin" uyarısı var. Bilgiler doldurulduğunda hem uyarı
  hem `Placeholder` bileşeni kaldırılacak.

Çerez ve gizlilik metinleri uydurulmadı, koddan çıkarıldı: çerez adları ve ömürleri
`src/lib/auth/redirect.ts:3,10,13`'ten, "sonuçsuz aramada kim aradığı kaydedilmez"
ifadesi `src/lib/search-analytics.ts:33-39`'daki insert'ten geliyor. **O insert'e
kullanıcı kimliği veya IP eklenirse gizlilik metni de aynı commit'te değişmeli.**

### Plandan sapma: rota grubuna `layout.tsx` yazılmadı

Plan, grup düzeninin hem okuma ölçüsünü hem `revalidate = 3600`'ü vermesini öngörüyordu.
Ölçü paylaşılan bileşene taşındı; `revalidate` ise hiç yazılmadı. Bu sayfalar veri
okumuyor, içerikleri dosyalarda sabit: saatte bir yeniden üretecek bir kaynak yok.
Faz 2'deki arşiv kararıyla aynı gerekçe — çıktıyı değiştirmeyen bir ayar yalnızca
yanıltır.

## Biten: Faz 4 — SEO (`0cad0be`)

`launch-readiness.md` P1 #7 kapandı.

| Dosya                       | Ne yapıyor                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| `src/app/sitemap.ts`        | Ana sayfa, `/son-dakika`, arşivler, yayımlanmış haberler, yedi kurumsal sayfa. `revalidate = 3600`       |
| `src/app/robots.ts`         | `/yonetim/`, `/auth/`, `/api/`, `/kaydedilenler`, `/arama`, `/stil-rehberi` kapalı; sitemap bildiriliyor |
| `src/app/feed.xml/route.ts` | Son 30 haber, RSS 2.0, `revalidate = 900`                                                                |
| `src/lib/seo.ts`            | İkisinin de okuması; `createAnonClient()` üzerinden, çerezsiz                                            |
| `src/lib/rss.ts`            | Saf RSS üreticisi — kaçış ve RFC 822 tarih biçimi                                                        |
| `src/lib/json-ld.ts`        | `WebSite` + `NewsMediaOrganization` + `BreadcrumbList`                                                   |

Kayda değer kararlar:

1. **Sitemap tek sorgu.** Konu, şehir ve yazar slug'ları ayrı ayrı sorgulanmıyor, haber
   satırlarından türetiliyor. İki faydası var: üç sorgu yerine bir, ve listeye yalnızca
   _gerçekten yayımlanmış haberi olan_ arşivler giriyor — boş bir arşivi arama motoruna
   göndermenin faydası yok. Bedeli, `SITEMAP_ARTICLE_LIMIT` (5000) dışında kalan çok eski
   bir haberin tek temsilcisi olduğu bir konunun listeye girmemesi.
2. **Arşivlerde `lastModified` yok.** Üretmek konu/şehir/yazar başına birer "en son yayın"
   sorgusu demekti. Alan zorunlu değil; uydurulmuş tarih vermektense hiç verilmedi. Aynı
   gerekçeyle kurumsal sayfalar da tarihsiz.
3. **JSON-LD `(site)/layout.tsx`'te, kök düzende değil.** Kök düzen yönetim panelini de
   sarıyor; yayının kimlik bilgisini `noindex` bir panelde tekrarlamanın anlamı yok.
4. **Besleme bağlantısı ana sayfada.** Next'in metadata birleştirmesi sığ: alt segmentin
   `alternates` nesnesi üsttekini bütünüyle değiştirir. Kök düzene yazılsaydı,
   `alternates.canonical` tanımlayan her sayfada — yani neredeyse hepsinde — besleme
   bağlantısı sessizce düşerdi.
5. **`SearchAction` bildirilmedi.** `/arama` hem `noindex` hem `robots.txt`'de kapalı;
   taranmasını istemediğimiz bir adresi arama motoruna önermek tutarsız olurdu.
6. **RSS elle yazıldı, bağımlılık eklenmedi.** Besleme sabit bir şablon; tek değişkeni
   haber listesi. Kırılgan iki parçası (XML kaçışı, RFC 822 tarihi) saf modülde ve
   birim testli. Kontrol karakterleri regex düzgüsüne gömülmek yerine kod noktası
   karşılaştırmasıyla eleniyor — gömülseler kaynak dosyada görünmez olurlardı.

`pnpm build` sonrası doğrulanan çıktı: sitemap 32 adres (9 haber, 9 kategori, 3 yazar,
7 kurumsal, ana sayfa, son dakika), besleme 9 `item`, `robots.txt` altı `Disallow`
satırı, `/stil-rehberi` `noindex, nofollow`.

## Biten: Faz 5 — Yönetimde haber CRUD

`launch-readiness.md` P0 #3 kapandı. `/yonetim/haberler`, `/yonetim/haberler/yeni` ve
yeni `/yonetim/haberler/[id]` artık `AdminComingSoon` değil.

| Dosya                                        | Ne yapıyor                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/lib/admin/article-body.ts`              | Blok editörünün seri hâle getirme / çözümleme çifti, `toBodyText()` ve `moveBodyBlock()`  |
| `src/lib/admin/article-schema.ts`            | Formun zod şeması, `slugify()`, durum makinesi, editoryal saat dönüşümü                   |
| `src/lib/admin/articles.ts`                  | Personel tarafı okumaları: süzgeçli/aranabilir/sayfalı liste, tek kayıt, form seçenekleri |
| `src/lib/admin/article-actions.ts`           | `createArticle`, `updateArticle`, `transitionArticle`                                     |
| `src/lib/redirects.ts`                       | Eski adresin yeni hedefi; çerezsiz okuma                                                  |
| `src/components/admin/article-form.tsx`      | Ortak form + canlı önizleme + durum düğmeleri                                             |
| `src/components/admin/body-block-editor.tsx` | Paragraf / ara başlık / alıntı blokları, sırala ve kaldır                                 |
| `src/components/admin/hero-media-picker.tsx` | Kütüphaneden hero ve sosyal görsel seçici                                                 |
| `src/components/site/article-body.tsx`       | `BodyBlock` haber detayından çıkarıldı; önizleme ile yayın aynı bileşeni çiziyor          |

Kayda değer kararlar:

1. **Bloklar üç paralel form alanı.** `blockType`, `blockText`, `blockAttribution` —
   JSON gömülü gizli alan değil. Alıntı olmayan bloklarda kaynak alanı `hidden` bir
   sarmalayıcının içinde ama **formda kalıyor**; kaldırılsaydı diziler indekste kayardı.
2. **Önizleme yayınla aynı bileşeni kullanıyor.** `BodyBlock` ve `articleBodyClassName`
   `article-detail.tsx`'ten `article-body.tsx`'e taşındı. `articles_public_select`
   taslakları gizlediği için editörün yayımlanmamış işini görebildiği tek yer burası;
   önizlemenin sadaka bir yaklaşım olması yetmez, birebir olmalı.
3. **Durum makinesi tek yerde.** `canTransition()` tablosu `article-schema.ts`'te; form
   yalnızca izin verilen düğmeleri çiziyor, eylem aynı tabloyu sunucuda yeniden
   uyguluyor. `PUBLISHED → DRAFT` yok: adres kamuya açılmıştır, geri çekme yolu
   arşivlemedir — `redirects` mantığı da bu varsayıma dayanıyor.
4. **Kesme işareti adreste hiçliğe düşüyor.** `slugify("Çeşme'de")` → `cesmede`,
   `cesme-de` değil. Türkçe başlıklarda iyelik eki çok geçiyor.
5. **`datetime-local` sabit UTC+03:00 ile yorumlanıyor.** Türkiye 2016'dan beri yaz saati
   uygulamıyor; alan ofset taşımadığı için editörün gördüğü duvar saati bu sabitle
   çevriliyor (`toEditorialInstant` / `toEditorialLocalInput`, ikisi de birim testli).
6. **Sürüm anlık görüntüsü yalnızca içerik kaydında.** Durum değişikliği içeriğe
   dokunmuyor, izi `audit_logs`'ta duruyor. Numara çakışması (iki editör aynı anda)
   sessizce geçiliyor: kayıt çoktan başarılı, anlık görüntü kaydetmenin koşulu değil.
7. **`audit_logs` secret key ile yazılıyor.** Tabloda RLS açık, politika ve
   `authenticated` grant'i yok — `subscribers.ts` ile aynı gerekçe. Yazılan alanların
   hepsi sunucuda üretiliyor; istemciden gelen tek şey haberin kimliği.
8. **Yönlendirme yalnızca haber bulunamadığında sorgulanıyor.** `src/proxy.ts`'e konsaydı
   her istek bir gidiş-dönüş öderdi. Adres A → B → A yapıldığında `/haber/A`'dan çıkan
   eski kayıt siliniyor, aksi hâlde haberin kendi adresi bir yönlendirmenin kaynağı olarak
   da dururdu.

### Plandan sapma: `PUBLISHED → DRAFT` ve otomatik `redirects` temizliği

Plan geçiş tablosunu "DRAFT → IN_REVIEW → SCHEDULED/PUBLISHED → ARCHIVED" diye tarif
ediyordu ama geri yönleri saymamıştı. Uygulanan tablo `IN_REVIEW → DRAFT`,
`SCHEDULED → DRAFT/IN_REVIEW` ve `ARCHIVED → DRAFT` geri dönüşlerine izin veriyor;
`PUBLISHED → DRAFT`'a vermiyor (yukarıda 3. madde).

## Biten: Faz 6 — Zamanlanmış yayın, yazı tipi adları, belgeler

| Dosya                                                         | Ne yapıyor                                                      |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| `supabase/migrations/20260901073356_scheduled_publishing.sql` | `pg_cron`, `private.publish_due_articles()`, iki zamanlanmış iş |
| `supabase/tests/database/scheduled_publishing.test.sql`       | 26 pgTAP testi: terfi, denetim izi, `redirects` / `audit_logs`  |
| `src/app/globals.css` + üç `*.module.css`                     | Font değişkenlerinin yeniden adlandırılması                     |
| `docs/architecture.md`, `docs/launch-readiness.md`            | Gerçeğe göre güncellendi                                        |

### Zamanlanmış yayın

`pg_cron` dakikada bir `private.publish_due_articles()` çağırıyor; fonksiyon `scheduled_at`'i
geçmiş `SCHEDULED` haberleri `PUBLISHED` yapıyor ve her biri için bir denetim kaydı yazıyor.

Kayda değer kararlar:

1. **`published_at` yeniden yazılmıyor, `coalesce` ediliyor.** Bir kez yayımlanıp
   arşivlenen, sonra yeniden zamanlanan haber ilk yayın tarihini korur. Bu,
   `toStatusColumns()`'ın kuralının aynısı — iki yol aynı davranmalı, çünkü aynı
   düğmenin iki yüzü.
2. **Ayrı bir eylem adı: `article.publish_scheduled`.** Elle geçiş `article.transition`
   yazıyor. Ayrı ad gerekli çünkü `actor_id` boş: kaydı bir editör değil sistem düştü.
   Denetim kaydını okuyan biri "kim yaptı" sorusuna "hiç kimse" cevabını almamalı.
3. **`security definer`, `private` şemasında, boş `search_path` ile.**
   `private.handle_new_user` ile aynı kalıp. Gerekçe: `articles_staff_manage` bir JWT
   rolü arıyor, cron işinin JWT'si yok. Fonksiyon `public`, `anon`, `authenticated` ve
   `service_role`'dan geri alındı; pgTAP dördünü de doğruluyor.
4. **İkinci bir iş `cron.job_run_details`'i buduyor.** Dakikalık bir iş yılda ~525 bin
   satır yazar ve pg_cron tabloyu kendiliğinden temizlemez. Gecelik silme, bir haftadan
   eski kayıtlar için.
5. **Webhook yok.** Terfi uygulamadan geçmediği için `revalidatePath` çağrılmıyor;
   haber ana sayfanın 60 saniyelik penceresinde beliriyor. Bedeli, `/feed.xml` ve
   `/sitemap.xml`'in kendi pencerelerini (15 dk / 1 saat) beklemesi. Rapora madde 21
   olarak yazıldı ki sonradan hata sanılmasın.

**Gerçek zamanlayıcıya karşı doğrulandı** (pgTAP fonksiyonu doğrudan çağırır, işin
gerçekten koştuğunu göstermez): üretim derlemesi ayaktayken bir dakika sonrasına
zamanlanmış bir haber yazıldı; `cron.job_run_details` işi `succeeded` gösterdi, haber
t≈50 sn'de `PUBLISHED` oldu ve t≈70 sn'de ana sayfada belirdi. Detay sayfası ilk istekte
üretildi (`x-nextjs-cache: MISS`), besleme ve sitemap beklendiği gibi gecikti. Test
verisi sonradan silindi.

### Yazı tipi değişkenleri

`--font-inter` → `--font-body`, `--font-newsreader` → `--font-display`. İkisi de zaten
Montserrat'a çözülüyordu; adlar yüklenmeyen iki aileyi işaret ediyordu.

Kullanım yerlerindeki `var(--font-display), Georgia, serif` yedekleri de
`Arial, sans-serif` yapıldı (14 yer). Değişken zaten sans bir yığına çözüldüğü için bu
hiçbir şeyi farklı çizmiyor; amaç, kod tabanında serif bir aile iddia eden son satırın
da kalmaması. `src/lib/newsletter/emails.ts` bilinçli istisna: e-posta istemcileri web
font yükleyemez.

### `launch-readiness.md`

Yeniden tarihlendi ve gerçeğe göre yeniden yazıldı. **Madde numaraları 1–17 arası
korundu** — başka belgeler bunlara atıf yapıyor; kapanan maddeler silinmedi, ✅ ile
işaretlenip nasıl kapandığı yazıldı. Yeni bulgular 18'den başlıyor:

| Madde | Konu                                              |
| ----- | ------------------------------------------------- |
| 18    | Yumuşak 404 (aşağıda; `noindex` doğrulaması yeni) |
| 19    | `NEXT_PUBLIC_APP_URL` derleme anında gömülüyor    |
| 20    | Arşiv rotalarının bilinçli olarak dinamik kalması |
| 21    | Zamanlanmış yayında besleme ve sitemap gecikmesi  |

Rapordaki **#8 "Marka yazı tipleri hiç yüklenmiyor" maddesi ilk sürümünde zaten
geçersizdi**: `src/app/layout.tsx` Montserrat'ı `next/font/google` ile `latin-ext` alt
kümesiyle yüklüyor (`70eca49` commit'i). Kalan yanıltıcılık yukarıda giderildi.

### Yumuşak 404 hakkında bir düzeltme

Faz 5'te kaydedilen bulgu doğruydu ama eksikti: `/haber/<olmayan-slug>` gerçekten 200
dönüyor ve önbelleğe giriyor, **ama Next yanıta `<meta name="robots" content="noindex">`
ekliyor** ve bu üretim derlemesinde curl ile doğrulandı. Next'in kendi belgesi
(`node_modules/next/dist/docs/.../loading.md`) bunun indekslenmeyi önlediğini söylüyor.

Yani arama sonuçları açısından risk yok. Kalan iki gerçek etki — kırık bağlantının
sunucu kayıtlarında başarı görünmesi ve zamanlanmış yayınla etkileşim — rapora madde 18
olarak yazıldı. Düzeltmesi `src/proxy.ts`'te bir varlık kontrolü demek, yani her haber
isteğine bir veritabanı gidiş-dönüşü: Faz 5'in 8. kararıyla aynı gerekçeyle ertelendi.

## Yapılmadı

- **Faz 5'te bilinçli ertelenenler** (plan da böyle diyordu): otomatik kaydetme,
  paylaşılabilir taslak önizleme jetonu, son dakika bildirimi. Form içi önizleme
  editörün kendi ihtiyacını karşılıyor; diğer ikisi Modül 16.
- **Yumuşak 404'ün asıl düzeltmesi** (rapor madde 18) ve **arşiv rotalarının
  önbelleğe alınması** (madde 20). İkisi de launch'ı engellemiyor.

## Doğrulama durumu

| Komut                 | Sonuç                                                                        |
| --------------------- | ---------------------------------------------------------------------------- |
| `pnpm typecheck`      | ✅ Temiz                                                                     |
| `pnpm lint`           | ✅ Temiz                                                                     |
| `pnpm test`           | ✅ 23 dosyada 148 test geçti                                                 |
| `pnpm build`          | ✅ Temiz — rota tablosu yukarıda, artı `ƒ /yonetim/haberler/[id]`            |
| `pnpm test:e2e`       | ⚠️ 85 geçti, 2 başarısız, 1 atlandı — **aynı iki test, aynı ortamsal sebep** |
| `pnpm supabase:reset` | ✅ Faz 6 migration'ı temiz uygulandı                                         |
| `pnpm supabase:test`  | ✅ 3 dosyada 67 pgTAP testi geçti (Faz 6 öncesi 41)                          |
| `pnpm format:check`   | ⚠️ Yalnız eklenen/değiştirilen dosyalar biçimlendirildi                      |

### Faz 5'in uçtan uca doğrulaması

Planın "End-to-end" listesindeki 1–4 ve 6. adımlar **hem `next dev` hem `next start`
üretim derlemesine karşı** geçici bir Playwright betiğiyle sürüldü ve geçti; betik
doğrulama bittikten sonra silindi (aşağıdaki gerekçeyle kalıcı bir spec'e çevrilmedi).
Sürülen akış:

1. `/yonetim/medya`'dan görsel yüklendi.
2. Paragraf + ara başlık + alıntı bloklarıyla taslak yazıldı; başlıktan adres türedi,
   önizleme canlı çizdi. Taslak `/haber/<slug>`'da **görünmedi** (bulunamadı sınırı).
3. Hero görseli seçilip kaydedildi, `DRAFT → IN_REVIEW → PUBLISHED` yürütüldü. Taslakta
   "Yayımlandı" düğmesinin **hiç çizilmediği** de doğrulandı.
4. Üretim derlemesinde ana sayfa yayından önce `x-nextjs-cache: HIT`'ti; yayından hemen
   sonra — 60 saniyelik pencere beklenmeden — haber `/` ve `/kategori/gundem` üzerinde
   belirdi. **`revalidatePath` çağrılarının gerçekten çalıştığının kanıtı bu.**
   `/sitemap.xml` ve `/feed.xml` de aynı anda tazelendi.
5. Adres değiştirildi; eski adres yenisine yönlendi (üretimde de).
6. Arşivlenen haber kamuya açık sayfada yeniden kayboldu.

Veritabanı tarafı `psql` ile ayrıca kontrol edildi: `article_revisions` numaraları
1-2-3 diye ilerledi ve `created_by` doldu (`article_revisions_staff_insert` geçti),
`audit_logs`'a `article.create` / `article.update` / `article.transition` satırları
düştü, `redirects` 308 ile yazıldı. Test verisinin tamamı (7 haber, 27 sürüm, 7 denetim
kaydı, 4 yönlendirme, 1 medya kaydı + storage nesnesi) sonradan silindi; depo ve yerel
veritabanı seed durumuna döndü.

**Neden kalıcı e2e spec'i yazılmadı:** `playwright.config.ts` kendi başlattığı sunucuya
`DEV_ADMIN_AUTO_LOGIN=false` veriyor, dolayısıyla oturum gerektiren bir yönetim testi
temiz bir çalıştırmada geçemez. Doğru çözüm, seed admin'i için `storageState` üreten bir
global setup — ayrı bir iş ve zaten kayıtlı olan e2e/auth ortam sorununun aynısına
dokunuyor. Var olan kırılganlığın üstüne bir ikincisini eklemektense akış elle sürüldü.

Başarısız iki test yine `auth.spec.ts` → "anonim kullanıcı yönetim alanına giremez"
(chromium + mobile-chrome) ve **bu oturumun değişikliklerinden kaynaklanmıyor**: sebep
önceki oturumda kaydedilenle birebir aynı (kullanıcının `DEV_ADMIN_AUTO_LOGIN=true` ile
ayakta olan `next dev` süreci `reuseExistingServer` üzerinden yeniden kullanılıyor).

### Faz 5'te ortaya çıkan, Faz 5'e ait olmayan bir bulgu

**Bilinmeyen bir haber adresi üretimde 404 değil 200 dönüyor.** `/haber/<olmayan-slug>`
gövdede doğru "bulunamadı" sayfasını çiziyor ama HTTP durumu 200 ve yanıt
`x-nextjs-cache: HIT` ile önbellekten geliyor — yani arama motorları için yumuşak 404.

Bu **Faz 5'in getirdiği bir gerileme değil**: `haber/[slug]/page.tsx` geçici olarak
`HEAD` sürümüne döndürülüp üretim derlemesi yeniden alındı ve aynı 200 gözlendi. Kaynak
Faz 2'deki ISR dönüşümü; `notFound()` çıktısı ISR önbelleğine giriyor. Faz 6'da veya
ayrı bir işte ele alınmalı, `launch-readiness.md`'ye de yazılmalı.

Yeni birim testleri: `rss.test.ts` (kaçış, RFC 822, besleme kabuğu), `json-ld.test.ts`
(grafik düğümleri, `@id` bağı, kırıntı yolu), `corporate-pages.test.ts` (liste ile
rotaların eşleşmesi). Faz 5 ikisini daha ekledi: `article-body.test.ts` (yazma tarafının
ürettiği diziyi `parseArticleBody`'nin olduğu gibi geri verdiği tur testi dâhil) ve
`article-schema.test.ts` (slugify, saat dönüşümü, geçiş tablosu, form şeması).
Uçtan uca testler: `e2e/kurumsal.spec.ts` ve `e2e/seo.spec.ts`. E2E sayısı 51'den 85'e
çıktı; Faz 5 bu sayıya dokunmadı (gerekçesi yukarıda).

`format:check` depoda **bu oturumdan önce de** temiz değildi (`docs/launch-readiness.md`,
`e2e/archive.spec.ts`, `src/lib/turkish.ts` ve diğerleri). Deponun tamamını
biçimlendirmek işle ilgisiz büyük bir fark üretirdi; yalnız dokunulan dosyalar Prettier'dan
geçirildi. Depo genelinde `pnpm format` çalıştırmak ayrı bir iş.

Başarısız iki test `auth.spec.ts` → "anonim kullanıcı yönetim alanına giremez"
(chromium + mobile-chrome) ve **bu oturumun değişikliklerinden kaynaklanmıyor**:
`launch-readiness.md` bunları zaten kayıtlı başarısızlık olarak listeliyor. Sebep
ortamsal: `playwright.config.ts` sunucuyu kendi başlattığında `DEV_ADMIN_AUTO_LOGIN=false`
veriyor, ama `reuseExistingServer` açık ve zaten çalışan bir `next dev` süreci vardı;
o süreç `.env.local`'daki `DEV_ADMIN_AUTO_LOGIN=true` ile ayaktaydı, dolayısıyla
`/yonetim` ziyareti seed admin'iyle oturum açtı. Temiz doğrulama için önce çalışan dev
sunucusu kapatılmalı. Bu oturumda aynı süreç hâlâ ayaktaydı ve aynı iki test aynı
gerekçeyle düştü; kullanıcının dev sunucusunu kapatmak yerine sonuç olduğu gibi
raporlandı.

## Launch öncesi unutulmaması gereken iki şey

1. **`NEXT_PUBLIC_APP_URL` üretimde ayarlanmalı.** Sitemap, `robots.txt`, RSS beslemesi
   ve JSON-LD'nin tamamı adresleri `siteConfig.url`'den kuruyor; o da bu değişkenden
   geliyor ve tanımsızken `http://localhost:3000`'e düşüyor. Yerel derlemede sitemap
   `http://127.0.0.1:3000/...` yazıyor — bu doğru davranış, ama üretimde değişken
   verilmezse arama motoruna localhost adresleri bildirilir. Değişken derleme anında
   gömülüyor, dolayısıyla dağıtımdan **önce** tanımlı olmalı.
2. **Kurumsal metinler taslak.** `docs/kurumsal-sayfa-bilgileri.md`'deki 49 yer tutucu
   doldurulmadan ve metinler hukuki denetimden geçmeden yayına çıkılmamalı. Özellikle
   künyedeki yer sağlayıcı bilgisi ancak barındırma sağlayıcısı seçilince
   (`launch-readiness.md` #6, Modül 19) kesinleşir.
