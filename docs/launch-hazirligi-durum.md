# Launch hazırlığı — oturum durumu

- **Tarih:** 2026-09-01
- **Dal:** `launch-hazirligi` (`main`'den ayrıldı, `main` bu oturumda `78a91e1`'e ilerletildi)
- **Kapsam:** `docs/launch-readiness.md`'de açık kalan altı iş kaleminden dördü tamamlandı.

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

**Doğrulanmadı:** Seed verisinde hiçbir makalede `hero_media_id` dolu değil, dolayısıyla
gerçek bir hero görselinin uçtan uca çizildiği görülmedi. Faz 5'teki hero seçici
geldiğinde ilk sınanacak şey bu.

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

| Rota | Durum |
| --- | --- |
| `/` | ○ static, 1 dk revalidate |
| `/haber/[slug]` | ● SSG, son 100 slug önden üretiliyor, 5 dk revalidate |
| `/kategori/[slug]`, `/yazar/[slug]`, `/son-dakika` | ƒ dinamik |
| `/arama`, `/kaydedilenler`, `/giris`, `/bulten`, `/yonetim/*` | ƒ dinamik (doğru) |

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

| Dosya | Ne yapıyor |
| --- | --- |
| `src/app/sitemap.ts` | Ana sayfa, `/son-dakika`, arşivler, yayımlanmış haberler, yedi kurumsal sayfa. `revalidate = 3600` |
| `src/app/robots.ts` | `/yonetim/`, `/auth/`, `/api/`, `/kaydedilenler`, `/arama`, `/stil-rehberi` kapalı; sitemap bildiriliyor |
| `src/app/feed.xml/route.ts` | Son 30 haber, RSS 2.0, `revalidate = 900` |
| `src/lib/seo.ts` | İkisinin de okuması; `createAnonClient()` üzerinden, çerezsiz |
| `src/lib/rss.ts` | Saf RSS üreticisi — kaçış ve RFC 822 tarih biçimi |
| `src/lib/json-ld.ts` | `WebSite` + `NewsMediaOrganization` + `BreadcrumbList` |

Kayda değer kararlar:

1. **Sitemap tek sorgu.** Konu, şehir ve yazar slug'ları ayrı ayrı sorgulanmıyor, haber
   satırlarından türetiliyor. İki faydası var: üç sorgu yerine bir, ve listeye yalnızca
   *gerçekten yayımlanmış haberi olan* arşivler giriyor — boş bir arşivi arama motoruna
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

## Yapılmadı

Plandaki iki faz açık; ikisine de başlanmadı.

- **Faz 5 — Yönetimde haber CRUD.** En büyük iş. Karar verilen yaklaşım: bağımlılık
  eklemeden blok formu (paragraf / ara başlık / alıntı), `media/actions.ts` +
  `media-uploader.tsx` desenini birebir izleyerek. Şemadan çıkan iki tuzak not edildi:
  `article_revisions_staff_insert` `created_by = auth.uid()` şartı koşuyor, ve
  **`audit_logs` üzerinde RLS açık ama hiç politika ve `authenticated` grant'i yok** —
  oraya yazmak `createAdminClient()` gerektiriyor.
- **Faz 6 — Zamanlanmış yayın + belge temizliği.** `pg_cron` migration'ı,
  `SCHEDULED → PUBLISHED` terfisi, pgTAP kapsamı; `--font-inter` / `--font-newsreader`
  değişken adlarının düzeltilmesi; `launch-readiness.md`'nin yeniden tarihlenmesi.

## `launch-readiness.md` ile ilgili düzeltme

Rapordaki **#8 "Marka yazı tipleri hiç yüklenmiyor" maddesi zaten geçersizdi** ve bu
oturumda hiçbir iş gerektirmedi. `src/app/layout.tsx` Montserrat'ı `next/font/google` ile
`latin-ext` alt kümesiyle yüklüyor ve `globals.css` iki font değişkenini de ona
bağlıyor (`70eca49` commit'i). Kalan tek iş, `--font-inter` / `--font-newsreader`
adlarının artık yanıltıcı olması ve `docs/architecture.md`'nin hâlâ Newsreader + Inter
demesi — Faz 6'da.

Rapor 2026-08-31 tarihli bir anlık görüntü; P0 #1/#2 `78a91e1` ile, P0 #4 ve P1 #7/#9/#10
bu oturumla kapandı. Yeniden tarihlemek Faz 6'ya bırakıldı.

## Doğrulama durumu

| Komut | Sonuç |
| --- | --- |
| `pnpm typecheck` | ✅ Temiz |
| `pnpm lint` | ✅ Temiz |
| `pnpm test` | ✅ 21 dosyada 124 test geçti |
| `pnpm build` | ✅ Temiz — rota tablosu yukarıda |
| `pnpm test:e2e` | ⚠️ 85 geçti, 2 başarısız, 1 atlandı |
| `pnpm supabase:test` | Çalıştırılmadı |
| `pnpm format:check` | ⚠️ Yalnız eklenen/değiştirilen dosyalar biçimlendirildi |

Yeni birim testleri: `rss.test.ts` (kaçış, RFC 822, besleme kabuğu), `json-ld.test.ts`
(grafik düğümleri, `@id` bağı, kırıntı yolu), `corporate-pages.test.ts` (liste ile
rotaların eşleşmesi). Yeni uçtan uca testler: `e2e/kurumsal.spec.ts` (yedi sayfa,
altbilgi bağlantıları, bülten rıza bağlantısı) ve `e2e/seo.spec.ts` (robots, sitemap,
besleme, JSON-LD, `noindex`). E2E sayısı 51'den 85'e çıktı; artışın tamamı bu iki dosya.

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
