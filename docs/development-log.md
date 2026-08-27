# Geliştirme Günlüğü

## Module 1 — Project and Delivery Foundation

- **Tarih:** 2026-08-17
- **Durum:** Tamamlandı
- **Kapsam:** Next.js uygulama temeli, tasarım kabuğu, ortam doğrulama, birim/uçtan uca test yapılandırması, CI ve Vercel yapılandırması.
- **Uygulananlar:** Türkçe kök düzen, Ege'nin Nabzı geçici açılış sayfası, `/yonetim` yer tutucusu, Newsreader/Inter yazı tipleri, ortak tasarım değişkenleri, test komutları ve GitHub Actions iş akışı.
- **Doğrulama:** `pnpm format:check`, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` ve `pnpm test:e2e` başarıyla tamamlandı. Playwright, masaüstü Chromium ve Pixel 7 görünümünde açılış kabuğunu doğruladı.
- **Veri ve güvenlik:** Bu modülde veritabanı, kimlik doğrulama, göç veya sır tanımlanmadı. `.env.local` Git tarafından yok sayılır.
- **Dağıtım:** Harici hesap bağlanmadı; Vercel yapılandırması sonraki bağlantı için eklendi.
- **Sonraki modül:** Supabase geliştirme temeli, başlangıç şeması ve güvenli rol/yetki modeli.

## Güncelleme Standardı

Her modül tamamlandığında aşağıdakiler eklenir:

1. Uygulanan özellikler ve değişen kullanıcı davranışı.
2. Çalıştırılan doğrulamalar ve sonuçları.
3. Veritabanı göçleri, erişim politikaları ve güvenlik kontrolleri.
4. Dağıtım, izleme veya geri alma etkileri.
5. Ertelenen maddeler ve bir sonraki modül.

## Module 4 — Core Database Schema and Seed Data

- **Tarih:** 2026-08-20
- **Durum:** Tamamlandı; yerel migration, seed, tür üretimi ve pgTAP doğrulandı.
- **Kapsam:** Çekirdek haber şeması, Türkçe tam metin arama, ilişkisel indeksler, tekrar çalıştırılabilir geliştirme seed’i ve üretilen TypeScript türleri için komut akışı.
- **Uygulananlar:** 13 uygulama tablosu, sabit domain enum’ları, `auth.users` → `profiles` tetikleyicisi, JSONB makale gövdesi, normalize edilmiş düz metin, GIN `tsvector` indeksi, yayın/sıralama sorguları ile tüm yabancı anahtarlar için indeksler.
- **Veri ve güvenlik:** Profil tetikleyicisi `private` şemada sınırlı `SECURITY DEFINER` olarak çalışır; kullanıcı tarafından düzenlenebilir metadata okumaz. Seed yalnızca konu, lokasyon ve yazar içerir.
- **Doğrulama:** `pnpm supabase:reset`, `pnpm supabase:types`, `pnpm supabase:lint` ve `pnpm supabase:test` çalıştırıldı: migration/seed uygulandı, gerçek `Database` türleri üretildi, lint temiz geçti ve 13 pgTAP testi başarılı oldu. Seed aynı veritabanında iki kez çalıştırıldı; sayılar `4` konu, `6` lokasyon ve `1` yazar olarak sabit kaldı. Uygulama denetimleri `pnpm typecheck`, `pnpm lint`, `pnpm test` (17 test) ve `pnpm exec next build --webpack` ile de geçti.
- **Sonraki modül:** Medya bucket’ı ve editör ekranı, bu şema ile bağlanacaktır.

## Module 5 — Authentication, Roles and RLS

- **Tarih:** 2026-08-20
- **Durum:** Uygulandı; yerel Docker veritabanı doğrulaması ile canlı Supabase/Resend bilgileri bekleniyor.
- **Kapsam:** Magic Link, token-hash doğrulama rotası, oturum yenileme Proxy’si, yönetim alanı koruması, rol yardımcıları, Data API grant’leri ve RLS politikaları.
- **Uygulananlar:** `/giris`, `/auth/confirm`, güvenli çıkış, `/yonetim` sunucu koruması, güvenli dönüş URL’si, yerel Mailpit için token-hash Magic Link şablonu, kullanıcıya ait bookmark/profil politikaları, editoryal personel politikaları, hassas tablo izolasyonu ve pgTAP rol matrisi.
- **Veri ve güvenlik:** Roller `app_metadata.role` içindedir; `user_metadata` yetkilendirme için kullanılmaz. Rol değişikliği yeni JWT gerektirir. Secret key istemci paketine dahil edilmez.
- **Doğrulama:** `pnpm test:e2e` 15 başarılı / 1 mevcut skip sonucu verdi; anonim yönetim erişimi, giriş sayfası ve geçersiz doğrulama bağlantısı kapsandı. Genel `pnpm format:check`, yalnız kullanıcıya ait önceden var olan `pnpm-lock.yaml`, `featured-carousel.tsx` ve `homepage.module.css` biçim uyarıları nedeniyle temiz değildir; bu modülün dosyaları biçimlendirildi.
- **Danışman notu:** Yerel `supabase db advisors` güvenlik hatası vermedi. Yalnız `articles`, reklam ve herkese açık referans tablolarında, herkese açık okuma ve personel yönetim politikalarının SELECT için birlikte değerlendirilmesinden kaynaklanan 7 performans uyarısı kaldı. Bunlar erişimi genişletmez; yüksek hacimde politikaları işlem türüne ayırma, sonraki performans iyileştirmesidir.
- **Dağıtım:** Canlı SMTP/Resend ve Auth URL ayarları README kontrol listesine bırakıldı. İlk `ADMIN` rolü uygulama içinden atanmaz.
- **Sonraki modül:** Storage RLS, medya yükleme ve yönetim kabuğu.

## Module 6 — Secure Media Storage

- **Tarih:** 2026-08-25
- **Durum:** Uygulandı; yerel Supabase stack’i başlatıldıktan sonra migration/RLS veritabanı doğrulaması çalıştırılmalıdır.
- **Kapsam:** Public görsel teslimi, personel yükleme izni, değişmez dosya yolları, medya metadatası ve `/yonetim/medya` arayüzü.
- **Uygulananlar:** `news-media` için 10 MiB ve JPEG/PNG/WebP/AVIF kısıtlı bucket, personel `SELECT`/`INSERT` Storage RLS politikaları, UUID temelli `upsert: false` yükleme, doğrulanmış claim ile `media_assets` kaydı, alt metin/açıklama/kredi/boyut/odak noktası alanları ve son yüklenenler görünümü.
- **Veri ve güvenlik:** Public bucket yalnızca tam nesne URL’siyle görüntü teslim eder; anon veya reader için listeleme, yükleme, güncelleme ve silme politikası yoktur. Personel için de güncelleme/silme politikası verilmez. Secret key kullanılmaz.
- **Doğrulama:** `pnpm typecheck` geçti; `pnpm test -- src/lib/media.test.ts` komutu 7 dosyada 20 testle geçti. Yerel Supabase servisleri başlatılamadığından `pnpm supabase:reset` henüz uygulanamadı.
- **Sonraki modül:** Yönetim kabuğu ve makale editörü medya kütüphanesindeki kayıtları seçebilecek.

## Module 7 — Administration Shell

- **Tarih:** 2026-08-25
- **Durum:** Uygulandı.
- **Kapsam:** Responsive editoryal navigasyon, rol farkındalığı, dashboard metrikleri, son yayınlar, ortak sayfa başlıkları, bildirim ve onay yüzeyleri.
- **Uygulananlar:** Sabit masaüstü kenar menüsü ve mobil menü, `EDITOR`/`ADMIN` menü ayrımı, sunucuda tekrar doğrulanan yönetici yayın ayarları, makale durum kartları, son beş yayımlanmış haber, yeni haber ve son-dakika hızlı işlemleri, breadcrumb, bildirim boş durumu ve çıkış onayı.
- **Veri ve güvenlik:** Dashboard Supabase publishable istemcisiyle, mevcut personel RLS politikaları altında çalışır. `ADMIN` sayfası menü gizliliğine güvenmez; sunucuda tekrar korunur. Secret key istemciye veya dashboard sorgularına dahil edilmez.
- **Doğrulama:** `pnpm typecheck`, hedeflenmiş ESLint ve Prettier kontrolleri geçti; `pnpm test` 8 dosyada 22 testi başarıyla tamamladı; `pnpm build`, tüm yönetim rotalarıyla üretim derlemesini başarıyla oluşturdu.
- **Sonraki modül:** Haber listeleme, gerçek taslak oluşturma, zengin metin editörü ve medya seçimi.

## Module 12 — Turkish Search

- **Tarih:** 2026-08-27
- **Durum:** Tamamlandı; yerel migration, seed, tür üretimi, pgTAP, birim ve uçtan uca testler doğrulandı.
- **Kapsam:** `/arama` sayfasının bellek içi demo eşleştiriciden gerçek PostgreSQL tam metin aramasına taşınması; konu/lokasyon filtreleri, sayfalama, güvenli vurgulama ve sonuçsuz sorgu telemetrisi.
- **Uygulananlar:** `search_published_articles` RPC'si (`websearch_to_tsquery` + `ts_rank` + `ts_headline` + `count(*) over ()`), `search_queries` tablosu, dokuz yayımlanmış seed haberi, `/arama` üzerinde GET arama formu ve iki filtre, arşivlerle ortak `Pager`, `ArticleCard` için alıntı yuvası, `HighlightedText` bileşeni ve `article-preview` eşleyicisi.
- **Veri ve güvenlik:** Fonksiyon `security invoker`'dır; yayın koşulları RLS'e ek olarak `WHERE` içinde de uygulanır, böylece EDITOR/ADMIN oturumunda bile taslak veya ileri tarihli haber sızmaz. Vurgulama HTML değil kontrol karakteri taşır; `dangerouslySetInnerHTML` kullanılmaz. `search_queries` yalnızca secret key ile yazılır, politika ve anon grant'i yoktur.
- **Doğrulama:** `pnpm supabase:reset`, `pnpm supabase:types`, `pnpm supabase:lint` ve `pnpm supabase:test` (2 dosyada 28 test, yeni `turkish_search` süiti dahil) geçti. `pnpm typecheck`, `pnpm lint`, `pnpm test` (15 dosyada 73 test) ve `pnpm build` başarılı. `pnpm test:e2e arama.spec.ts` masaüstü ve Pixel 7 görünümünde 14 test ile geçti. Elle doğrulama: `IZMIR`/`İzmir`/`izmir` aynı iki haberi döndürdü, filtreler sonucu daralttı, sayfalama `q` ve filtreleri korudu, sonuçsuz sorgular `search_queries` içine yazıldı, sonuçlu sorgular yazılmadı.
- **Not:** Modül 4'ün iki pgTAP testi tüm tabloyu sayıyordu ve seed'e yayımlanmış haber eklenince kırıldı; kendi fixture'larına daraltılarak seed hacminden bağımsız hâle getirildi.
- **Sonraki modül:** Okur hesapları ve kaydedilenler; `/haber/[slug]` veritabanına bağlandığında arama sonuçlarındaki bağlantılar da tamamlanacak.
