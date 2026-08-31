# Modül 5 — Kimlik Doğrulama, Roller ve RLS

## Magic Link akışı

1. Okur `/giris` formunda e-posta adresini gönderir.
2. Sunucu doğrular, güvenli yerel dönüş yolunu kısa ömürlü HTTP-only çerezde saklar ve `signInWithOtp` çağırır.
3. Supabase Magic Link e-postası token hash’i `/auth/confirm` rotasına taşır.
4. Rota yalnızca `type=email` kabul eder, `verifyOtp` ile oturum çerezlerini kurar ve doğrulanmış yerel yola döner.
5. Bağlantı geçersizse veya süresi dolmuşsa kullanıcı `/giris?error=link_invalid` sayfasını görür.

Yerel Supabase şablonu `supabase/templates/magic_link.html` olarak sürümlenir ve `config.toml` içinden seçilir. Şablondaki bağlantı, `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email` biçimindedir. Bağlantı ön-getirme yapan posta sağlayıcıları token’ı tüketebilir; hata durumu kullanıcıyı yeni bağlantı istemeye yönlendirir.

## Oturum ve yönetim erişimi

- Next.js `proxy.ts`, statik dosyalar dışında çalışır ve `getClaims` ile oturumu yeniler.
- Sunucu bileşenleri ve Server Action’lar oturum içindeki kullanıcı nesnesine güvenmez; gerekli yerde doğrulanmış claim kullanır.
- `/yonetim` altındaki layout anonim kullanıcıyı girişe, `READER` rolünü ana sayfaya yönlendirir. `EDITOR` ve `ADMIN` geçebilir.
- Roller yalnızca `app_metadata.role` alanından gelir. Dashboard veya server-only admin istemcisi ile rol değiştirildiğinde kullanıcı `refreshSession` veya yeniden giriş ile yeni JWT almalıdır.

## Data API ve RLS matrisi

| Veri                                      | Anonim / okur                                | Editör / admin                     | Doğrudan istemci erişimi        |
| ----------------------------------------- | -------------------------------------------- | ---------------------------------- | ------------------------------- |
| Konu, lokasyon, yazar, medya, yönlendirme | Okuma                                        | Yönetim                            | Açık, RLS ile sınırlı           |
| Makale                                    | Yalnız yayınlanmış ve zamanı gelmiş kayıtlar | Tüm kayıtları yönetim              | Açık, RLS ile sınırlı           |
| Profil                                    | Yalnız kendi profili                         | Yok                                | Açık, sahiplik RLS’i            |
| Bookmark                                  | Yalnız kendi bookmark’ları                   | Yok                                | Açık, sahiplik RLS’i            |
| Revision                                  | Yok                                          | Okuma ve kendi snapshot’ını ekleme | Açık, personel RLS’i            |
| Bülten, push, audit                       | Yok                                          | Yok                                | Kapalı; güvenilen sunucu işlemi |

Her açık tablo RLS kullanır. `GRANT` nesneye ulaşımı, politika ise görülebilen/değiştirilebilen satırları belirler. Sahiplik politikaları `(select auth.uid())` kullanır; güncellemelerde hem `USING` hem `WITH CHECK` uygulanır.

## Canlı ortam devri

1. Auth URL ayarlarında site URL’si ve `/auth/confirm` dönüşü izinli olmalıdır.
2. Resend alan adını doğrulayın ve Supabase Auth özel SMTP’ye bağlayın.
3. İlk personel hesabına Dashboard’dan `app_metadata.role = ADMIN` atayın.
4. Kullanıcıdan oturumunu yenilemesini isteyin.
5. Supabase security/performance advisor’larını çalıştırın; `SUPABASE_SECRET_KEY` değerinin tarayıcı paketlerinde olmadığını kontrol edin.

## Yerel test

Mailpit `http://127.0.0.1:54324` üzerinde Magic Link’i yakalar. pgTAP testleri anonim, reader ve editor bağlamlarında şema, seed, Türkçe arama, profil ve bookmark sahipliği ile hassas audit izolasyonunu doğrular.

## Yerel geliştirme hızlı girişi (dev-only)

`.env.local` içinde `DEV_ADMIN_AUTO_LOGIN=true` iken, oturumu olmayan bir geliştirici `/yonetim`’e girdiğinde `requireStaffRoute` girişe değil `/auth/dev-login` rotasına yönlenir; rota `supabase/seed.sql`’daki yerel admin hesabı (`dev-admin@ege.local`, `app_metadata.role = ADMIN`) ile `signInWithPassword` çağırıp gerçek oturum çerezlerini kurar. Sahte bir sunucu tarafı rolü yerine gerçek bir Supabase oturumu kullanıldığı için dashboard sorgularındaki RLS (`auth.jwt() app_metadata.role`) değişmeden çalışır.

Bayrak yalnızca `NODE_ENV=development` ile etkindir; `next start` üretim derlemesinde her koşulda kapalıdır. E2E çalıştırmaları webServer ortamında bayrağı `false`’a sabitler, böylece “anonim kullanıcı yönetim alanına giremez” testi davranıştan bağımsız doğrulama yapar. Çıkış yapıldığında bir sonraki `/yonetim` ziyareti yeniden otomatik oturum açar; bu beklenen dev davranışıdır.

## Magic Link URL hizalama (yerel + hosted) — kısa kontrol listesi

Üretilen Magic Link'in bağlantısı, `signInWithOtp` içindeki `emailRedirect` değil **Auth'un yapılandırılmış Site URL host'u** üzerinden kurulur (`{{ .RedirectTo }}`). Uygulamanın taban adresi (`NEXT_PUBLIC_APP_URL`) ile Auth Site URL host'u birebir eşleşmezse GoTrue `emailRedirectTo`'yu yok sayar, `/auth/confirm`'i düşürür ve bağlantı site köküne gider; oturum kurulmaz. Belirti: `/giris`'ten gönderilince e-posta gelir ama tıklanınca ana sayfa açılır ve giriş olmaz.

- Yerel: `supabase/config.toml` `[auth] site_url = "http://127.0.0.1:3000"`; `additional_redirect_urls` aynı host'ları içerir. `.env.local` `NEXT_PUBLIC_APP_URL` host `site_url` ile aynı olmalı. `localhost` ile `127.0.0.1` ayrı host sayılır — karıştırmayın.
- Hosted (Dashboard → Auth → URL Configuration): "Site URL" değeri `NEXT_PUBLIC_APP_URL`'in origin'iyle eşleşmeli; "Redirect URLs"e uygulama origin'i ve `.../auth/confirm` eklenmeli. Magic Link şablonunu host projesinde de aynı token-hash biçimine çekin (`{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`).
- `emailRedirectTo`, `src/lib/auth/actions.ts` içinde otomatik `${NEXT_PUBLIC_APP_URL}/auth/confirm` olarak kurulur; bu nedenle host eşleşmesi tek kritik değişkendir.

Yerel doğrulama: `pnpm supabase:start && pnpm supabase:reset` → `.env.local` host'unu hizalayın → `/giris`'ten gönderin → Mailpit'ten bağlantıyı açın (`http://127.0.0.1:54324`). Bağlantı `.../auth/confirm?token_hash=<hash>&type=email` ile bitmeli; takip edince oturum kurulmalı.

Notlar:

- `config.toml` `[auth.rate_limit] email_sent = 2` saatlik — geliştirmede çok magic link deneyince 429 (`/giris?error=send_failed`) alınır; supabase'i yeniden başlatıp artırabilirsiniz.
- `config.toml` değişiklikleri `supabase start/stop` sonrası uygulanır; `.env.local` değişikliği dev sunucusunun yeniden başlatılmasını gerektirir.
- `.env.local`'de secret değerden önce boşluk koymayın; boşluk anahtarın parçası olur (`KEY=abc` bitişik yazın).
