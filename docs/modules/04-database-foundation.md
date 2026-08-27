# Modül 4 — Veritabanı Temeli

## Migration’lar

- `core_schema`: domain enum’ları, uygulama tabloları, indeksler, Türkçe arama ve profil oluşturma tetikleyicisi.
- `access_control`: açık Data API izinleri, RLS ve politika matrisi.

Migration dosyaları yalnızca `pnpm supabase:migration:new <ad>` ile başlatılır. Yerel sıfırlama migration’ları, ardından `supabase/seed.sql` verisini uygular.

## Veri modeli

| Alan                | Kayıtlar                                                                       | Temel ilişki                                                                   |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Kimlik              | `profiles`                                                                     | Bir profil, `auth.users.id` ile bire bir bağlıdır.                             |
| Editoryal taksonomi | `topics`, `locations`, `authors`                                               | Makale için isteğe bağlı konu, lokasyon ve yazar sağlar.                       |
| Haber               | `articles`, `article_revisions`                                                | Makale JSONB gövde, düz metin, yayın alanları ve revision snapshot’ları taşır. |
| Medya               | `media_assets`                                                                 | Bucket/path, erişilebilirlik metni, kredi, boyut ve odak noktasını taşır.      |
| Okur ve kampanya    | `bookmarks`, `newsletter_subscriptions`, `push_subscriptions`, `ad_placements` | Sahiplik, açık rıza, abonelik ve reklam zamanlamasını taşır.                   |
| Operasyon           | `redirects`, `audit_logs`                                                      | Kalıcı yönlendirme ve değişiklik izini taşır.                                  |

`ArticleStatus`, `ArticleType`, `UserRole`, `AdPlacementKey` ve `NotificationType` veritabanı enum’ları, uygulamanın kilitli türleriyle aynı değerleri kullanır.

## Arama ve performans

- `articles.body` yapılandırılmış JSONB’dir; editör Modül 8’de aynı içeriğin sadeleştirilmiş metnini `body_text` alanına yazar.
- `search_vector`, başlık, özet ve `body_text` alanından Türkçe yapılandırmasıyla üretilir; GIN indeksi kullanır.
- Her yabancı anahtar indekslidir. Yayın, konu, yazar, lokasyon ve zamanlanmış yayın listeleri için kısmi/çok kolonlu indeksler vardır.
- UUID’ler, `auth.users` ve herkese açık URL’ler arasında sabit referans sağlar; tüm zamanlar `timestamptz` olarak saklanır.

## Seed ve türler

Seed; Gündem, Ekonomi, Kültür-Sanat, Yaşam; altı Ege ili; Ece Aksoy yazarını `ON CONFLICT` ile günceller. Birden çok çalıştırma aynı sonucu verir.

```bash
pnpm supabase:reset
pnpm supabase:types
```

İkinci komut `src/lib/supabase/database.types.ts` dosyasını yerel şemadan üretir; elle düzenlenmez.

## Güvenlik notu

Yeni Auth kullanıcısı için profil oluşturan trigger, `private.handle_new_user` fonksiyonunu kullanır. Fonksiyon, zorunlu olduğu için sınırlı `SECURITY DEFINER` kapsamındadır; private şema Data API’ye açık değildir ve fonksiyonlar doğrudan çalıştırılamaz.
