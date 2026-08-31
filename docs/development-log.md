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

## Module 13 — Reader Accounts and Bookmarks

- **Tarih:** 2026-08-28
- **Durum:** Tamamlandı; yerel migration, tür üretimi, pgTAP, birim ve uçtan uca testler doğrulandı.
- **Kapsam:** Kaydetme düğmesinin örnek oturumdan gerçek veritabanına taşınması, `/kaydedilenler`, başlıkta okur hesabı durumu, girişten geçen kaydetme ve hesap silme talebi.
- **Uygulananlar:** `account_deletion_requests` tablosu, `src/lib/bookmarks/` (saf mesajlar, `server-only` sorgular, sunucu eylemleri), `useOptimistic` ile geri alınabilir kaydetme, oturumsuz ziyaretçi için form tabanlı giriş yönlendirmesi, `egenin-nabzi-pending-bookmark` çerezini tüketen `/auth/confirm`, `/kaydedilenler` listesi ve "Hesabım" bölümü, mobil menü ve okur rozeti bağlantıları.
- **Veri ve güvenlik:** Kaydetme slug ile çalışır ve UUID'yi okurun kendi istemcisiyle çözer; `articles_public_select` sayesinde taslak haber kaydedilemez. Liste secret key kullanmaz, RLS'e dayanır. Sahip kimliği yalnızca doğrulanmış `sub` claim'inden okunur. Silme talebi silmeyi uygulamaz; kapalı tabloya yazılır ve personel elle yürütür.
- **Doğrulama:** `pnpm supabase:reset`, `pnpm supabase:types` ve `pnpm supabase:test` (2 dosyada 41 test) geçti. `pnpm typecheck`, `pnpm lint`, `pnpm test` ve `pnpm build` başarılı. Elle uçtan uca: oturumsuz kaydet → `/giris` → Mailpit'ten magic link → haber `?bilgi=kaydedildi` ile kaydedilmiş döndü; ikinci tarayıcı bağlamı aynı listeyi gördü; kaldırma listeyi boş duruma döndürdü; silme talebi tek satır yazıp oturumu kapattı.
- **Not:** `isArticleBookmarked` ilk yazımda süzgeci gömülü kaynağın takma adı yerine tablo adıyla veriyordu; PostgREST bunu çözemediği için kaydedilmiş haber kaydedilmemiş görünüyordu. Sorgu `articles` üzerinden yeniden kuruldu.
- **Sonraki modül:** Bülten abonelikleri.

## Module 14 — Newsletter Subscriptions

- **Tarih:** 2026-08-28
- **Durum:** Tamamlandı; abonelik, onay ve ayrılma uçtan uca doğrulandı.
- **Kapsam:** Ana sayfa ve `/bulten` formları, ayrı bülten rızası, Resend ile onay e-postası, tek kullanımlık özetli onay, tek tıkla ayrılma ve yönetimde abone listesi.
- **Uygulananlar:** `newsletter_flow` migration'ı (özet indeksleri + e-posta kısıtı düzeltmesi), `src/lib/newsletter/` (jetonlar, mesajlar, e-posta şablonu, sunucu eylemi), bağımlılık eklemeyen `src/lib/email/` Resend sarmalayıcısı, `/bulten` sayfası, paylaşılan `NewsletterForm`, `/bulten/onay` ve `/bulten/ayril` Route Handler'ları (GET + RFC 8058 POST) ve `/yonetim/aboneler`.
- **Veri ve güvenlik:** Tablo politikasız ve grant'siz kalır; tüm erişim secret key ile yapılır. Her dal aynı `onay_bekleniyor` yanıtını verdiği için abone numaralandırılamaz; `PENDING` kayıtta beş dakikalık bekleme süresi gelen kutusu taşkınını engeller. Onay jetonu tek kullanımlıktır, ayrılma jetonu bilerek kalıcıdır. `/yonetim/aboneler` kişisel veri listelediği için `requireAdminRoute` ile korunur.
- **Doğrulama:** Yukarıdaki komut kümesine ek olarak elle uçtan uca: abonelik `onay_bekleniyor` döndürdü ve tek satır yazdı; aynı adresle ikinci gönderim aynı yanıtı verdi ve ikinci e-posta üretmedi; onay bağlantısı satırı `CONFIRMED` yaptı ve özeti temizledi; aynı bağlantının tekrarı `gecersiz` döndü; `POST /bulten/ayril` 200 döndü, tekrarı yine 200 döndü ve rıza/onay zaman damgaları korundu.
- **Not:** Modül 4'teki `newsletter_subscriptions_email_format` kısıtı `\\.` yazımı yüzünden hiçbir geçerli e-postayı kabul etmiyordu; tabloya hiç satır yazılamıyordu. İleri yönlü bir migration ile düzeltildi. Ayrıca `supabase/config.toml` içindeki `additional_redirect_urls` yol taşıyan hedefleri izinli kılmadığından yerel magic link `/auth/confirm` yerine ana sayfaya bağlanıyordu; `/**` kalıpları eklendi.
- **Sonraki modül:** Premium reklam yönetimi.
