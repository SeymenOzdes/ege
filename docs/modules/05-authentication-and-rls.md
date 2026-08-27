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
