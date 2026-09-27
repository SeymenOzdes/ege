# Launch Hazırlık Raporu — Ege'nin Nabzı

- **Tarih:** 2026-09-01 (ilk sürüm 2026-08-31)
- **Kapsam:** `launch-hazirligi` dalı, çalışma ağacındaki commit edilmemiş değişikliklerle birlikte tam depo taraması.
- **Yöntem:** Rota/veri katmanı okuması, PLAN'daki 19 modülle karşılaştırma, `pnpm typecheck`, `pnpm lint`,
  `pnpm test`, `pnpm build`, `pnpm supabase:test` çalıştırıldı; üretim derlemesine karşı elle uçtan uca sürüş.

> **Madde numaraları korunuyor.** 1–17 arası numaralar 2026-08-31 sürümündekiyle aynı; başka belgeler
> bunlara atıf yapıyor. Kapanan maddeler silinmedi, ✅ ile işaretlenip nasıl kapandığı yazıldı.
> Bu taramada ortaya çıkan yeni bulgular 18'den itibaren numaralandırıldı.

## Özet

İlk sürümün ana tespiti — "kamuya açık deneyimin tamamı sabit demo verisine bağlı ve editörün haber
girebileceği bir arayüz yok" — **artık geçerli değil.** Site veritabanından besleniyor, editör panelinden
haber girilip yayımlanabiliyor, zamanlanmış yayın kendiliğinden açılıyor, SEO altyapısı ve yedi kurumsal
sayfa yerinde.

**Kalan engeller teknik değil, operasyonel ve içeriksel:** üretim ortamı hiç kurulmadı, kurumsal metinler
taslak ve 49 yer tutucu içeriyor, geliştirme otomatik girişi hâlâ kapatılmadı.

Kabaca: **PLAN'ın 19 modülünden 15'i bitti** (1–14 ve 17), 1'i kısmen (18), **3'ü hiç başlamadı**
(15, 16, 19).

| Alan                                          | Durum                                       |
| --------------------------------------------- | ------------------------------------------- |
| Veritabanı şeması, RLS, pgTAP                 | ✅ Hazır                                    |
| Kimlik doğrulama, roller, yönetim koruması    | ✅ Hazır                                    |
| Medya yükleme ve metadata                     | ✅ Hazır                                    |
| Arama (Türkçe FTS)                            | ✅ Hazır                                    |
| Kaydedilenler / okur hesabı                   | ✅ Hazır                                    |
| Bülten (abonelik, onay, ayrılma)              | ✅ Hazır                                    |
| Haber CRUD + editör                           | ✅ Hazır                                    |
| Yayın akışı (taslak→yayın, zamanlama)         | ✅ Hazır                                    |
| Kamuya açık sayfaların veriye bağlanması      | ✅ Hazır                                    |
| Kurumsal sayfalar (künye, gizlilik…)          | ⚠️ Sayfalar var, **metinler taslak**        |
| SEO altyapısı (sitemap, robots, RSS, JSON-LD) | ✅ Hazır                                    |
| Önbellekleme (ISR)                            | ✅ Hazır (arşiv rotaları dinamik, madde 20) |
| Güvenlik başlıkları, hız sınırı, hata sınırı  | ❌ Yok                                      |
| Reklam yönetimi, PWA/push                     | ❌ Yok                                      |
| Üretim dağıtımı, izleme, yedekleme            | ❌ Yok                                      |

---

## P0 — Yayını engelleyenler

### 1. ✅ Kamuya açık site veritabanına bağlı değil

`78a91e1` ile kapandı (`kamuya-acik-sayfalari-supabaseye-bagla` dalı). `homepage.ts`, `archives.ts` ve
`articles.ts` artık Supabase'ten okuyor; `article-preview.ts` eşleyicisi devrede.

### 2. ✅ Bir haber dışında her haber bağlantısı 404 veriyor

Aynı commit'le kapandı. `dynamicParams = false` kaldırıldı; `generateStaticParams` yayımlanmış slug'ları
veritabanından çekiyor ve listede olmayan bir slug ilk istekte üretiliyor
(`src/app/(site)/haber/[slug]/page.tsx`).

### 3. ✅ Editör haber giremiyor (PLAN Modül 8 ve 9)

`/yonetim/haberler`, `/yonetim/haberler/yeni` ve yeni `/yonetim/haberler/[id]` çalışıyor. Kapsam: liste +
süzgeç + arama + sayfalama, oluştur/düzenle, paragraf/ara başlık/alıntı blok editörü, hero ve sosyal
medya seçici, SEO alanları, durum makinesi (`DRAFT → IN_REVIEW → SCHEDULED/PUBLISHED → ARCHIVED` ve geri
dönüşleri), yayın sonrası `revalidatePath`, adres değişiminde 308 yönlendirme, `article_revisions` sürüm
anlık görüntüsü, `audit_logs` kaydı, son dakika bayrağı.

Zamanlanmış yayın `20260901073356_scheduled_publishing.sql` ile veritabanı tarafında kapandı: `pg_cron`
dakikada bir `private.publish_due_articles()` çağırıyor, vakti gelmiş `SCHEDULED` haberler `PUBLISHED`
oluyor ve `actor_id`'si boş bir `article.publish_scheduled` denetim kaydı düşüyor. Uygulamanın ayakta
olması gerekmiyor; haber, ana sayfanın 60 saniyelik yeniden doğrulama penceresinde beliriyor.

Bilinçli ertelenenler (PLAN Modül 16 kapsamı): otomatik kaydetme, paylaşılabilir taslak önizleme jetonu,
son dakika push bildirimi. Form içi canlı önizleme editörün kendi ihtiyacını karşılıyor.

### 4. ⚠️ Footer'daki 7 kurumsal sayfa — sayfalar açıldı, metinler taslak

Yedi rota `src/app/(site)/(kurumsal)/` altında mevcut ve hepsi `○ static` üretiliyor:
`/kunye` · `/yayin-ilkeleri` · `/duzeltmeler` · `/iletisim` · `/gizlilik` · `/cerezler` · `/kullanim-kosullari`

**Ama madde hâlâ P0.** Metinlerin tamamı Türkçe ve yapısal olarak tam, gerçek bilgilerin hiçbiri yok:
49 yer tutucu `[DOLDURULACAK: …]` olarak duruyor (dökümü `docs/kurumsal-sayfa-bilgileri.md`) ve her
sayfanın başında "Taslak metin" uyarısı var.

Yasal gerekçe değişmedi: künye yayımlamak 5651 sayılı Kanun gereği zorunlu ve bülten formu, var olan ama
doldurulmamış bir gizlilik politikasına rıza referansı veriyor. **Yer tutucular doldurulmadan ve metinler
hukuki denetimden geçmeden yayına çıkılmamalı.** Künyedeki yer sağlayıcı bilgisi ancak barındırma
sağlayıcısı seçilince (madde 6) kesinleşir.

### 5. ❌ Geliştirme otomatik girişi üretim risk yüzeyi

Değişmedi. `src/lib/auth/dev-access.ts` + `src/app/auth/dev-login/route.ts`, sabit parolalı seed admin ile
(`supabase/seed.sql` — `dev-admin-password`) gerçek oturum açar. İki koruma var
(`NODE_ENV === "development"` **ve** `DEV_ADMIN_AUTO_LOGIN === "true"`) ve doğru yazılmış, ancak
`.env.local` içinde bayrak şu an **açık** ve rota üretim derlemesine dahil ediliyor.

**Yapılması gereken:** üretim ve preview ortamlarında `DEV_ADMIN_AUTO_LOGIN`'in tanımsız olduğunu
doğrulamak, `docs/dev-admin-auto-login-rollback.md`'deki geri alma adımını launch öncesi uygulamak,
seed'deki parolalı admin bloğunun üretim veritabanına asla gitmediğini teyit etmek (`supabase/seed.sql`
yalnız `db reset --local` ile çalışır — üretimde `supabase db push` kullanılmalı).

### 6. ❌ Üretim ortamı hiç kurulmadı (PLAN Modül 19)

Değişmedi, ama listeye iki madde eklendi:

- Üretim Supabase projesi, migration'ların uygulanması.
- **`pg_cron`'un üretim projesinde etkin olduğunun doğrulanması** — `publish-due-articles` işi olmadan
  zamanlanmış haber hiç yayına çıkmaz ve bunu haber yayımlanmadığında fark edersiniz.
- **`NEXT_PUBLIC_APP_URL`'in tanımlanması** (madde 19).
- Auth redirect URL'leri ve özel SMTP (Resend) üretim yapılandırması.
- Alan adı + HTTPS.
- İlk `ADMIN` rolünün atanması.
- Yedekleme (PITR) ve uptime izleme.
- Sentry — `.env.example`'da yorum satırı olarak duruyor, hiçbir kod yok.

---

## P1 — Launch öncesi kapatılması gerekenler

### 7. ✅ SEO altyapısı yok (PLAN Modül 17)

`0cad0be` ile kapandı. `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/feed.xml/route.ts` (RSS 2.0,
son 30 haber), `src/lib/json-ld.ts` (`WebSite` + `NewsMediaOrganization` + `BreadcrumbList`).
`/yonetim/`, `/auth/`, `/api/`, `/kaydedilenler`, `/arama`, `/stil-rehberi` robots'ta kapalı;
`/stil-rehberi` ayrıca `noindex, nofollow` metadata'sı taşıyor.

`NewsArticle` JSON-LD zaten haber detayındaydı (`src/components/site/article-detail.tsx`).

### 8. ✅ Marka yazı tipleri hiç yüklenmiyor

**Bu madde raporun ilk sürümünde zaten geçersizdi.** `70eca49` commit'i Montserrat'ı `next/font/google`
ile `latin-ext` alt kümesiyle yüklüyor ve `globals.css` font değişkenlerini ona bağlıyor.

Kalan yanıltıcılık bu oturumda giderildi: `--font-inter` / `--font-newsreader` değişkenleri
`--font-body` / `--font-display` olarak yeniden adlandırıldı ve kullanım yerlerindeki
`Georgia, serif` yedekleri `Arial, sans-serif` yapıldı — ikisi de Montserrat'a çözülüyor, hiçbir yer artık
serif bir aile iddia etmiyor. `docs/architecture.md` de güncellendi.

Tek istisna `src/lib/newsletter/emails.ts`: e-posta istemcileri web font yükleyemediği için başlık
`Georgia, serif` ile çiziliyor. Bilinçli.

### 9. ✅ Haber görselleri yok

`bf83537` ile kapandı. `src/lib/media.ts` public URL ve odak noktası üretiyor; önizleme ve detay
seçimleri hero embed'i alıyor (foreign key açıkça adlandırıldı — `articles` iki ayrı sütunla
`media_assets`'e bağlı); `MediaSurface` hero varsa `next/image`, yoksa eski renk yüzeyini çiziyor.
`next.config.ts` içindeki `images.remotePatterns` `NEXT_PUBLIC_SUPABASE_URL`'den türetiliyor ve yalnız
`/storage/v1/object/public/news-media/**` yoluna daraltılmış.

### 10. ✅ Tüm kamuya açık sayfalar `force-dynamic`

`81e2312` ile kapandı. `/` bir dakika, `/haber/[slug]` beş dakika yeniden doğrulamayla önbelleğe
alınıyor. Oturum durumu, kaydet düğmesi ve `?bilgi=` bildirimi tarayıcıya taşındı; kamuya açık okuma
yolları çerez taşımayan `createAnonClient()` ile okuyor.

Yan fayda: oturum açmış bir editör artık kamuya açık sayfada taslağı göremiyor. Önbelleğe alınan bir sayfa
kimin istediğine göre değişmemeli.

Arşiv rotaları bilinçli olarak dinamik kaldı — madde 20.

### 11. ❌ Güvenlik başlıkları tanımlı değil

Değişmedi. `next.config.ts` yalnız `allowedDevOrigins` ve `images.remotePatterns` içeriyor. Eksikler:
`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` / `frame-ancestors`,
`Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`.

### 12. ❌ Hız sınırı olmayan açık uçlar

Değişmedi.

- `src/app/api/arama/onizleme/route.ts` — kimlik doğrulaması ve hız sınırı olmayan, her tuş vuruşunda
  veritabanına tam metin araması yaptıran genel API.
- `src/lib/search-analytics.ts` — sonuçsuz her sorgu **secret key ile** `search_queries`'e yazılıyor;
  anonim kullanıcı bu tabloyu sınırsız şişirebilir.
- Bülten formunda yalnız aynı adres için 5 dakikalık bekleme var; farklı adreslerle yapılan toplu
  gönderime karşı IP bazlı sınır yok. Bot koruması (honeypot, Turnstile vb.) hiç yok.

> **Not:** `search-analytics.ts`'deki insert bugün kullanıcı kimliği veya IP yazmıyor ve
> `/cerezler` ile `/gizlilik` metinleri bu gerçeğe dayanıyor. O insert'e kimlik alanı eklenirse
> gizlilik metni **aynı commit'te** değişmeli.

### 13. ❌ Hata sınırı (error boundary) yok

Değişmedi. `src/app` altında hiçbir `error.tsx` veya `global-error.tsx` yok; sunucu bileşeninde
beklenmedik bir hata olursa kullanıcı Next.js'in ham hata ekranını görür. `not-found.tsx` mevcut
(kök ve site).

---

## P2 — Launch sonrasına bırakılabilir ama planda var

### 14. ❌ Reklam yönetimi (PLAN Modül 15)

`ad_placements` tablosu var, hiç kod yok. Ana sayfadaki `AdSlot` bileşeni sabit yer tutucu çiziyor.
Yönetim CRUD'u, tarih aralığı, "Reklam/Sponsorlu" etiketi ve tıklama analitiği eksik.

### 15. ❌ PWA ve son dakika bildirimi (PLAN Modül 16)

`push_subscriptions` tablosu var, hiç kod yok. `manifest`, service worker, çevrimdışı sayfası, ikon seti,
push izni ve gönderim eylemi eksik. Editör tarafındaki otomatik kaydetme ve paylaşılabilir taslak
önizleme jetonu da bu modüle bırakıldı.

### 16. ❌ Analitik

Vercel Analytics, Search Console doğrulaması, görüntülenme/etkileşim ölçümü yok.

### 17. ❌ Erişilebilirlik ve performans doğrulaması (PLAN Modül 18)

Klavye, odak, ekran okuyucu, zoom, kontrast, `prefers-reduced-motion` ve WCAG 2.2 AA kontrolleri
yapılmamış. Core Web Vitals ölçümü yok. Hero slider (`featured-carousel.tsx`) hareket azaltma tercihine
saygı gösteriyor mu doğrulanmalı.

---

## Bu taramada ortaya çıkan yeni maddeler

### 18. ⚠️ Bilinmeyen bir haber adresi 404 değil 200 dönüyor (yumuşak 404)

Üretim derlemesinde `/haber/<olmayan-slug>` gövdede doğru "bulunamadı" sayfasını çiziyor, ama:

```
HTTP/1.1 200 OK
x-nextjs-cache: HIT
Cache-Control: s-maxage=300, stale-while-revalidate=31535700
```

Sebep madde 10'daki ISR dönüşümü: `notFound()` çıktısı da ISR önbelleğine giriyor. Bu bir gerileme değil —
`haber/[slug]/page.tsx` geçici olarak eski sürümüne döndürülüp derleme yeniden alındı, aynı 200 gözlendi.

**Arama sonuçlarına yansıması yok:** Next, akış başladıktan sonra çizilen not-found sayfasına
`<meta name="robots" content="noindex">` ekliyor ve bu yanıtta gerçekten mevcut olduğu doğrulandı; Google
bu durumda adresi indekslemiyor. Kalan iki gerçek etki:

1. **Analitik ve izleme yanıltıcı.** Kırık bir bağlantı sunucu kayıtlarında başarı olarak görünür.
2. **Zamanlanmış yayınla etkileşimi var.** Bir haberin adresi yayına girmeden önce istenirse (paylaşılan
   bir bağlantı, bir tarayıcı), "bulunamadı" yanıtı 300 saniye önbellekte kalır. `pg_cron` terfisi
   uygulamadan geçmediği için `revalidatePath` çağrılmaz; terfiden sonraki ilk okuyucu bayat
   "bulunamadı" sayfasını görebilir, ikincisi haberi görür.

**Doğru çözüm ucuz değil:** durum kodunu düzeltmek varlığın gövde akmadan önce bilinmesini gerektirir,
yani `src/proxy.ts` içinde bir kontrol — ve bu, her haber isteğine bir veritabanı gidiş-dönüşü ekler.
Yönlendirme sorgusunun bilinçli olarak yalnızca "bulunamadı" yolunda çalıştırılmasıyla aynı gerekçeyle
ertelendi. Launch'ı engellemez; ayrı bir iş olarak ele alınmalı.

### 19. ⚠️ `NEXT_PUBLIC_APP_URL` üretimde tanımlanmalı

Sitemap, `robots.txt`, RSS beslemesi ve JSON-LD'nin tamamı adresleri `siteConfig.url`'den kuruyor; o da bu
değişkenden geliyor ve tanımsızken `http://localhost:3000`'e düşüyor. Değişken **derleme anında gömülüyor**,
dolayısıyla ilk dağıtımdan önce tanımlı olmalı — sonradan eklemek yeni bir derleme gerektirir. Aksi hâlde
arama motoruna localhost adresleri bildirilir.

### 20. ℹ️ Arşiv rotaları bilinçli olarak dinamik kaldı

`/son-dakika`, `/kategori/[slug]` ve `/yazar/[slug]` sayfalama için `?sayfa=` okuyor. Arama parametresi
okuyan bir rota Next'te istek zamanlıdır; bu rotalara `revalidate` yazmak çıktıyı değiştirmez, yalnız
yanıltır. Rotalarda bunu açıklayan yorum var.

Önbelleğe almanın yolu sayfalamayı yol parçasına taşımak (`/son-dakika/sayfa/2`) — bu bir adres değişikliği
ve ayrı bir iş. `cacheComponents` (PPR) de çözerdi ama tüm uygulamayı route-segment config'den `use cache`'e
taşımayı gerektirir. Launch'ı engellemez; trafik altında maliyet olarak görünür.

### 21. ℹ️ Zamanlanmış yayında besleme ve sitemap gecikir

`pg_cron` terfisi uygulamadan geçmediği için `revalidatePath` çağrılmaz. Terfi eden haber ana sayfada
60 saniyede belirir (ölçüldü), ama `/feed.xml` kendi 15 dakikalık, `/sitemap.xml` kendi 1 saatlik
penceresini bekler. Arama motoru ve besleme okuyucuları için kabul edilebilir; webhook eklemenin
karşılığı yok. Kayda geçiriliyor ki sonradan hata sanılmasın.

---

## Temizlik ve depo hijyeni

- Depoda takip edilen gereksiz dosyalar: 9 adet `design-qa-*.png` (~2,4 MB), `design-qa.md`,
  `README 2.md`, `e2e/home.spec 2.ts` — çakışmadan kalan kopyalar. `.gitignore`'a `*.tsbuildinfo` ve
  `.DS_Store` zaten yazılmış ama `tsconfig.tsbuildinfo` diskte duruyor.
- CI (`.github/workflows/ci.yml`) `typecheck`, `lint`, `test`, `build`, `supabase db lint` ve
  `supabase test db` çalıştırıyor ama **Playwright e2e'yi çalıştırmıyor** ve `format:check` adımı yok.
- `pnpm format:check` depo genelinde temiz değil ve bu, bu oturumdan önce de böyleydi
  (`e2e/archive.spec.ts`, `src/lib/turkish.ts` ve diğerleri). Depo genelinde bir `pnpm format` ayrı bir iş;
  tek seferde büyük ve işle ilgisiz bir fark üretir.
- Modül belgeleri 08–11 ve 15–19 için yok; `docs/development-log.md` Modül 2, 3 ve 8–11 girdilerini
  içermiyor.
- **Yönetim paneli e2e kapsamı yok.** `playwright.config.ts` kendi başlattığı sunucuya
  `DEV_ADMIN_AUTO_LOGIN=false` veriyor, dolayısıyla oturum gerektiren bir yönetim testi temiz bir
  çalıştırmada geçemez. Doğru çözüm, seed admin'i için `storageState` üreten bir global setup.

---

## Doğrulanan mevcut durum

| Komut                | Sonuç                                                               |
| -------------------- | ------------------------------------------------------------------- |
| `pnpm typecheck`     | ✅ Temiz                                                            |
| `pnpm lint`          | ✅ Temiz                                                            |
| `pnpm test`          | ✅ 23 dosyada 148 test geçti                                        |
| `pnpm build`         | ✅ Temiz                                                            |
| `pnpm supabase:test` | ✅ 3 dosyada 67 pgTAP testi geçti                                   |
| `pnpm test:e2e`      | ⚠️ 85 geçti, 2 başarısız, 1 atlandı — kayıtlı ortamsal başarısızlık |
| `pnpm format:check`  | ⚠️ Depo genelinde temiz değil (yukarıda)                            |

Başarısız iki test `auth.spec.ts` → "anonim kullanıcı yönetim alanına giremez" (chromium + mobile-chrome).
Sebep ortamsal ve kayıtlı: `playwright.config.ts` sunucuyu kendi başlattığında `DEV_ADMIN_AUTO_LOGIN=false`
veriyor, ama `reuseExistingServer` açık; geliştiricinin `.env.local`'daki `DEV_ADMIN_AUTO_LOGIN=true` ile
ayakta olan `next dev` süreci yeniden kullanılıyor ve `/yonetim` ziyareti seed admin'iyle oturum açıyor.
Temiz doğrulama için önce çalışan dev sunucusu kapatılmalı.

---

## Önerilen sıra

1. **Kurumsal metinlerin doldurulması ve hukuki denetimi** (madde 4) — tek gerçek P0 içerik işi ve yasal
   zorunluluk. Barındırma sağlayıcısı seçilmeden künye tamamlanamaz, dolayısıyla madde 6 ile birlikte
   yürümeli.
2. **Modül 19 — üretim ortamı** (madde 6): üretim Supabase, `pg_cron` doğrulaması,
   `NEXT_PUBLIC_APP_URL` (madde 19), alan adı, SMTP, Sentry, yedekleme, smoke testleri.
3. **Geliştirme otomatik girişinin kapatılması** (madde 5) — dağıtımla aynı anda yapılmalı.
4. **Güvenlik başlıkları, hız sınırı, hata sınırı** (madde 11, 12, 13) — üçü de küçük ve bağımsız.
5. **Yumuşak 404 ve arşiv önbelleklemesi** (madde 18, 20) — launch'ı engellemez, trafik altında görünür.
6. **CI'ya e2e ve `format:check` eklenmesi, depo temizliği.**
7. **Reklam yönetimi ve PWA/push** (madde 14, 15) — launch sonrasına ertelenebilir; PLAN'ın kapsam kısma
   sırasıyla da uyumlu.
