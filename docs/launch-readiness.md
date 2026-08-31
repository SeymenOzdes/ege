# Launch Hazırlık Raporu — Ege'nin Nabzı

- **Tarih:** 2026-08-31
- **Kapsam:** `main` dalı, çalışma ağacındaki commit edilmemiş değişikliklerle birlikte tam depo taraması.
- **Yöntem:** Rota/veri katmanı okuması, PLAN'daki 19 modülle karşılaştırma, `pnpm typecheck`, `pnpm lint`, `pnpm test` çalıştırıldı.

## Özet

Altyapı (Supabase, RLS, kimlik doğrulama, medya depolama, arama, kaydedilenler, bülten) üretim
kalitesine yakın. **Ancak site şu hâliyle yayına alınamaz:** kamuya açık deneyimin tamamı —
ana sayfa, kategori, yazar, arşiv ve haber detayı — veritabanına değil, kaynak koddaki sabit
demo verisine bağlı. Editörün haber girebileceği bir arayüz de hiç yok.

Kabaca: **PLAN'ın 19 modülünden 10'u bitmiş** (1–7, 12, 13, 14), 4'ü kısmen (10, 11 — arayüz var,
veri yok), **5'i hiç başlamamış** (8, 9, 15, 16, 17, 19'un tamamı; 18 kısmen).

| Alan | Durum |
| --- | --- |
| Veritabanı şeması, RLS, pgTAP | ✅ Hazır |
| Kimlik doğrulama, roller, yönetim koruması | ✅ Hazır |
| Medya yükleme ve metadata | ✅ Hazır |
| Arama (Türkçe FTS) | ✅ Hazır (ama sonuçlar 404'e gidiyor) |
| Kaydedilenler / okur hesabı | ✅ Hazır |
| Bülten (abonelik, onay, ayrılma) | ✅ Hazır |
| **Haber CRUD + editör** | ❌ Yok |
| **Yayın akışı (taslak→yayın, zamanlama)** | ❌ Yok |
| **Kamuya açık sayfaların veriye bağlanması** | ❌ Yok (sabit demo verisi) |
| **Kurumsal sayfalar (künye, gizlilik…)** | ❌ Yok (footer 7 kırık bağlantı) |
| **SEO altyapısı (sitemap, robots, RSS)** | ❌ Yok |
| Reklam yönetimi, PWA/push | ❌ Yok |
| Üretim dağıtımı, izleme, yedekleme | ❌ Yok |

---

## P0 — Yayını engelleyenler

### 1. Kamuya açık site veritabanına bağlı değil

`getHomepageContent()` sabit bir nesne döndürüyor; hiçbir Supabase çağrısı yok:

- `src/lib/homepage.ts:204` — `getHomepageContent()` dosya içindeki `homepageContent` sabitini döndürür.
- `src/lib/archives.ts:136` — `getLatestArticles()`, `getCategoryArchive()`, `getAuthorBySlug()` hepsi
  aynı dosyadaki sabit dizilerden okur.
- `src/lib/articles.ts:110` — `articlesBySlug` **tek bir** makale içerir.

Sonuç: yeni yayımlanan bir haber sitede hiçbir yerde görünmez. Editör Supabase Studio'dan
satır eklese bile ana sayfa değişmez.

**Yapılması gereken:** `homepage.ts`, `archives.ts`, `articles.ts` içindeki sabit veriyi
`search.ts` ve `bookmarks/queries.ts`'te zaten kullanılan RLS'e dayalı sorgu deseniyle değiştirmek.
`article-preview.ts` eşleyicisi bunun için hazır durumda.

### 2. Bir haber dışında her haber bağlantısı 404 veriyor

`src/app/(site)/haber/[slug]/page.tsx:11` `dynamicParams = false`, `generateStaticParams` ise
`articleSlugs`'tan besleniyor — yani **yalnız `mahalle-pazarlarinda-yerel-urun`** açılıyor.

Kırılan yollar:
- Ana sayfadaki 9 kartın 8'i.
- `/arama` sonuçlarının tamamı (arama gerçek veritabanından gelir, detay sayfası gelmez).
- `/son-dakika`, `/kategori/*`, `/yazar/*` listelerindeki her bağlantı.
- `/kaydedilenler` listesindeki kayıtlar.

Bu, 1. maddeyle birlikte çözülür: veri katmanı veritabanına bağlanınca `dynamicParams = false`
kaldırılmalı ve `generateStaticParams` yayımlanmış slug'ları veritabanından çekmelidir.

### 3. Editör haber giremiyor (PLAN Modül 8 ve 9)

- `src/app/(admin)/yonetim/haberler/page.tsx` — `AdminComingSoon` yer tutucusu.
- `src/app/(admin)/yonetim/haberler/yeni/page.tsx` — `AdminComingSoon` yer tutucusu.
- `src/app/(admin)/yonetim/anasayfa/page.tsx` — `AdminComingSoon` yer tutucusu.

Eksik olanlar: haber listesi ve filtreler, oluştur/düzenle/arşivle, zengin metin editörü,
slug/özet/yazar/konu/lokasyon alanları, hero medya seçimi, SEO alanları, otomatik kayıt,
taslak önizleme, durum geçişleri (DRAFT → IN_REVIEW → SCHEDULED → PUBLISHED → ARCHIVED),
zamanlanmış yayının otomatik görünür olması, yayın sonrası cache revalidation, slug değişiminde
yönlendirme, `audit_logs` kaydı, son dakika bayrağı.

Şema tarafı hazır ve boş bekliyor: `article_revisions`, `redirects`, `audit_logs` tabloları
oluşturulmuş ama hiçbir kod bunlara yazmıyor.

### 4. Footer'daki 7 kurumsal sayfa yok — hepsi 404

`src/components/site/public-shell.tsx:119-136` ve `src/components/site/newsletter-form.tsx:43`
şu adreslere bağlanıyor; **hiçbiri `src/app` altında mevcut değil**:

`/kunye` · `/yayin-ilkeleri` · `/duzeltmeler` · `/iletisim` · `/gizlilik` · `/cerezler` · `/kullanim-kosullari`

Bu yalnız UX sorunu değil: Türkiye'de internet haber sitesi için **künye yayımlama yasal
zorunluluk** (5651 sayılı Kanun) ve bülten formu KVKK aydınlatma metnine bağlanan bir gizlilik
politikası olmadan kişisel veri topluyor. Bülten formu şu anda var olmayan bir gizlilik
sayfasına rıza referansı veriyor.

### 5. Geliştirme otomatik girişi üretim risk yüzeyi

`src/lib/auth/dev-access.ts` + `src/app/auth/dev-login/route.ts`, sabit parolalı seed admin ile
(`supabase/seed.sql:296` — `dev-admin-password`) gerçek oturum açar. Kod iki koruma taşıyor
(`NODE_ENV === "development"` **ve** `DEV_ADMIN_AUTO_LOGIN === "true"`) ve doğru yazılmış, ancak:

- `.env.local` içinde bayrak şu an **açık**.
- Rota üretim derlemesine yine de dahil ediliyor; tek savunma iki çalışma zamanı kontrolü.

**Yapılması gereken:** Vercel üretim ve preview ortamlarında `DEV_ADMIN_AUTO_LOGIN`'in tanımsız
olduğunu doğrulamak, `docs/dev-admin-auto-login-rollback.md`'deki geri alma adımını launch
öncesi uygulamak ve seed'deki parolalı admin bloğunun üretim veritabanına asla gitmediğini
teyit etmek (`supabase/seed.sql` yalnız `db reset --local` ile çalışır — üretimde `supabase db push` kullanılmalı).

### 6. Üretim ortamı hiç kurulmadı (PLAN Modül 19)

- Üretim Supabase projesi, migration'ların uygulanması.
- Auth redirect URL'leri ve özel SMTP (Resend) üretim yapılandırması.
- Alan adı + HTTPS.
- İlk `ADMIN` rolünün atanması.
- Yedekleme (PITR) ve uptime izleme.
- Sentry — `.env.example`'da yorum satırı olarak duruyor, hiçbir kod yok.

---

## P1 — Launch öncesi kapatılması gerekenler

### 7. SEO altyapısı yok (PLAN Modül 17)

- `src/app/sitemap.ts` **yok** — ne standart ne haber sitemap'i.
- `src/app/robots.ts` **yok** — arama motoru kuralı tanımsız.
- RSS feed **yok**.
- `/yonetim/*` ve `/auth/*` için `noindex` **yok**. Yalnız `/kaydedilenler` ve `/arama`
  `robots` metadata'sı taşıyor (`src/app/(site)/kaydedilenler/page.tsx:16`, `src/app/(site)/arama/page.tsx:32`).
- `/stil-rehberi` iç tasarım sayfası herkese açık ve indekslenebilir.
- `NewsArticle` JSON-LD yalnız haber detayında var (`src/components/site/article-detail.tsx:51`);
  ana sayfa/arşivler için `WebSite`, `Organization`, `BreadcrumbList` yok.

### 8. Marka yazı tipleri hiç yüklenmiyor

Mimari dokümanı Newsreader + Inter diyor, ancak `next/font` ya da `@font-face` kullanımı yok;
`src/app/globals.css:4-5` doğrudan sistem fallback'lerine düşüyor:

```css
--font-inter: ui-sans-serif, system-ui, ...;
--font-newsreader: Georgia, "Times New Roman", serif;
```

Yani üretimde site Georgia + sistem sans ile görünür — tasarımda hedeflenen editoryal kimlik
hiç devreye girmiyor. `next/font/google` ile Türkçe `latin-ext` alt kümesi yüklenmeli.

### 9. Haber görselleri yok

Kartların tamamı renkli yer tutucu kullanıyor: `src/components/site/article-card.tsx:18`
`MediaSurface`, gerçek görsel yerine `role="img"` taşıyan boş bir renk yüzeyi çiziyor.
`next/image` yalnız tek bir yerde kullanılıyor (`src/components/site/article-detail.tsx:1`).
`media_assets` ve `news-media` bucket'ı hazır; kart bileşenleri bunları hiç okumuyor.

Ayrıca `next.config.ts` içinde `images.remotePatterns` tanımlı değil — Supabase Storage
alan adından görsel servis edilmeye başlandığında `next/image` bunu reddeder.

### 10. Tüm kamuya açık sayfalar `force-dynamic`

`src/app/(site)/layout.tsx:6` bütün `(site)` grubunu istek başına render'a zorluyor. Sebep
başlıktaki oturum durumu — ama bu, bir haber sitesinin en çok trafik alan sayfalarında
CDN önbelleğini tamamen kapatıyor. Launch trafiğinde hem gecikme hem Supabase maliyeti
sorun olur.

**Yapılması gereken:** Oturuma bağlı başlık parçasını ayrı bir dinamik sınıra (Suspense içinde
küçük bir sunucu bileşeni ya da istemci tarafı) taşıyıp sayfa gövdelerini ISR ile önbelleğe almak.

### 11. Güvenlik başlıkları tanımlı değil

`next.config.ts` yalnız `allowedDevOrigins` içeriyor. Eksikler: `Content-Security-Policy`,
`Strict-Transport-Security`, `X-Frame-Options` / `frame-ancestors`, `Referrer-Policy`,
`X-Content-Type-Options`, `Permissions-Policy`.

### 12. Hız sınırı olmayan açık uçlar

- `src/app/api/arama/onizleme/route.ts` — kimlik doğrulaması ve hız sınırı olmayan, her
  tuş vuruşunda veritabanına tam metin araması yaptıran genel API.
- `src/lib/search-analytics.ts:29` — sonuçsuz her sorgu **secret key ile** `search_queries`'e
  yazılıyor; anonim kullanıcı bu tabloyu sınırsız şişirebilir.
- Bülten formunda yalnız aynı adres için 5 dakikalık bekleme var (`src/lib/newsletter/actions.ts:17`);
  farklı adreslerle yapılan toplu gönderime karşı IP bazlı sınır yok. Bot koruması (honeypot,
  Turnstile vb.) hiç yok.

### 13. Hata sınırı (error boundary) yok

`src/app` altında hiçbir `error.tsx` veya `global-error.tsx` yok. Sunucu bileşeninde beklenmedik
bir hata olursa kullanıcı Next.js'in ham hata ekranını görür. `not-found.tsx` mevcut (kök ve site).

---

## P2 — Launch sonrasına bırakılabilir ama planda var

### 14. Reklam yönetimi (PLAN Modül 15)

`ad_placements` tablosu var, hiç kod yok. Ana sayfadaki `AdSlot` bileşeni
(`src/components/site/homepage.tsx`) sabit yer tutucu çiziyor. Yönetim CRUD'u, tarih aralığı,
"Reklam/Sponsorlu" etiketi ve tıklama analitiği eksik.

### 15. PWA ve son dakika bildirimi (PLAN Modül 16)

`push_subscriptions` tablosu var, hiç kod yok. `manifest`, service worker, çevrimdışı sayfası,
ikon seti, push izni ve gönderim eylemi eksik.

### 16. Analitik

Vercel Analytics, Search Console doğrulaması, görüntülenme/etkileşim ölçümü yok.

### 17. Erişilebilirlik ve performans doğrulaması (PLAN Modül 18)

Klavye, odak, ekran okuyucu, zoom, kontrast, `prefers-reduced-motion` ve WCAG 2.2 AA kontrolleri
yapılmamış. Core Web Vitals ölçümü yok. Hero slider (`featured-carousel.tsx`) hareket azaltma
tercihine saygı gösteriyor mu doğrulanmalı.

---

## Temizlik ve depo hijyeni

- **57 dosya commit edilmemiş** (`git status`): Modül 13 ve 14'ün tamamı dahil, çalışma ağacında
  duruyor. Launch öncesi commit edilmeli.
- Depoda takip edilen gereksiz dosyalar: 8 adet `design-qa-*.png` (~2,4 MB), `design-qa.md`,
  `README 2.md`, `e2e/home.spec 2.ts` — çakışmadan kalan kopyalar. `.gitignore`'a
  `*.tsbuildinfo` ve `.DS_Store` zaten yazılmış ama `tsconfig.tsbuildinfo` diskte duruyor.
- `test-results/.last-run.json` iki başarısız Playwright testi gösteriyor
  (`auth-anonim-kullanıcı-yönetim-alanına-giremez`, chromium + mobile-chrome). Bunlar
  `DEV_ADMIN_AUTO_LOGIN` açıkken alınmış olabilir; e2e paketi temiz ortamda yeniden koşturulmalı.
- CI (`.github/workflows/ci.yml`) `typecheck`, `lint`, `test`, `build` ve veritabanı testlerini
  çalıştırıyor ama **Playwright e2e'yi çalıştırmıyor** ve `format:check` adımı yok.
- Modül belgeleri 08–11 ve 15–19 için yok; `docs/development-log.md` Modül 2, 3 ve 8–11
  girdilerini içermiyor.

---

## Doğrulanan mevcut durum

Bu rapor için çalıştırılanlar:

| Komut | Sonuç |
| --- | --- |
| `pnpm typecheck` | ✅ Temiz |
| `pnpm lint` | ✅ Temiz |
| `pnpm test` | ✅ 18 dosyada 99 test geçti |
| `pnpm build` | Çalıştırılmadı |
| `pnpm test:e2e` | Çalıştırılmadı (son kayıt: 2 başarısız) |
| `pnpm supabase:test` | Çalıştırılmadı (yerel stack gerekir) |

Yani **kod kalitesi kapıları temiz; eksik olan özellik ve içerik.**

---

## Önerilen sıra

1. **Modül 8 + 9** — haber CRUD, editör ve yayın akışı. Diğer her şey buna bağlı; içerik
   girilemeden site anlamlı test edilemez.
2. **Modül 10 + 11'in veri bağlantısı** — `homepage.ts`, `archives.ts`, `articles.ts` sabit
   verisinin sökülmesi, `dynamicParams = false` kaldırılması, `generateStaticParams`'ın
   veritabanından beslenmesi.
3. **Kurumsal sayfalar + KVKK/künye metinleri** — yasal zorunluluk, teknik olarak ucuz.
4. **SEO paketi** — `sitemap.ts`, `robots.ts`, RSS, yönetim rotalarına `noindex`.
5. **Yazı tipleri, görseller, önbellekleme, güvenlik başlıkları, hız sınırı, error boundary.**
6. **Modül 19** — üretim Supabase, alan adı, SMTP, Sentry, yedekleme, smoke testleri.
7. Reklam yönetimi ve PWA/push — launch sonrasına ertelenebilir (PLAN'ın kapsam kısma
   sırasıyla da uyumlu).
