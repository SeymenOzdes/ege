# Modül 14 — Bülten Abonelikleri

## Migration

- `newsletter_flow`: onay ve ayrılma özetleri için tekil kısmi indeksler, yönetim listesi
  için `(status, created_at desc)` indeksi ve **e-posta biçim kısıtının düzeltilmesi**.

### Düzeltilen kısıt

Modül 4'teki kısıt hiçbir geçerli adresi kabul etmiyordu:

```sql
check (email_normalized ~ '^[^@[:space:]]+@[^@[:space:]]+\\.[^@[:space:]]+$')
```

`standard_conforming_strings` açıkken `'\\.'` SQL dizesinde iki karakter (`\` + `\`) üretir
ve regex bunu "kaçırılmış ters bölü, ardından herhangi bir karakter" diye okur. Yani alan
adında **gerçek bir ters bölü** aranıyordu; `okur@example.com` kısıtı geçemiyor ve tabloya
hiçbir satır yazılamıyordu. Kısıt tek ters bölü ile yeniden kuruldu. Uygulanmış migration
düzenlenmedi; düzeltme ileri yönlü bir `drop constraint` / `add constraint` çiftidir.

## Jeton modeli

`src/lib/newsletter/tokens.ts`: `randomBytes(32).toString("base64url")` ile jeton,
`sha256` ile özet. Veritabanına yalnızca özet yazılır; ham değer sadece alıcının gelen
kutusunda bulunur.

İki jetonun ömrü bilerek farklıdır:

| Jeton                       | Ömür                                       | Gerekçe                                                                                                                               |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `confirmation_token_digest` | **Tek kullanımlık** — onaydan sonra `null` | Çift onay; tekrar oynatılan bağlantı yeniden onaylamamalıdır                                                                          |
| `unsubscribe_token_digest`  | **Kalıcı** — kullanıldıktan sonra silinmez | Bağlantı gönderilen her bültende taşınır. Silinseydi aynı e-postadaki bağlantıya ikinci kez tıklayan kişi "geçersiz bağlantı" görürdü |

Ayrılma bu yüzden fikir-eşdeğerdir: aynı bağlantı tekrar tekrar 200 döner.

`PENDING` satırı her yazıldığında ayrılma jetonu tazelenir. Özet saklandığı için eski ham
değer zaten geri okunamaz; tazelemek, gönderdiğimiz onay e-postasının `List-Unsubscribe`
başlığının her zaman geçerli olmasını garantiler. `CONFIRMED` satırlar yeniden
yazılmadığından yayındaki jeton sabit kalır.

## Güvenlik ve kötüye kullanım

- Tablo Modül 5'te RLS ile kapatıldı ve bilerek politikasız bırakıldı
  (`docs/modules/05-authentication-and-rls.md`: "Kapalı; güvenilen sunucu işlemi").
  Tüm okuma ve yazma secret key istemcisiyle yapılır.
- **Numaralandırma:** yeni kayıt, bekleyen kayıt ve zaten onaylanmış kayıt aynı
  `onay_bekleniyor` mesajına çıkar. Form, bir adresin listede olup olmadığını sızdırmaz.
  Bunu bir birim testi koruma altına alır.
- **Gelen kutusu taşkını:** `PENDING` bir kayıt için onay jetonu, `updated_at` beş
  dakikadan yeniyse yeniden üretilmez ve e-posta gönderilmez. Yanıt yine aynıdır.
- Rıza ayrıdır ve zorunludur: onay kutusu önceden işaretli değildir, işaretlenmeden gönderim
  reddedilir. `consented_at`, `confirmed_at` ve `unsubscribed_at` ayrılmadan sonra da korunur.

## Rotalar

| Rota                   | Davranış                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| `/bulten`              | Form + `?durum=` bildirimi                                             |
| `/bulten/onay?token=`  | `GET`: onaylar, özeti `null` yapar, `/bulten?durum=onaylandi`'ya döner |
| `/bulten/ayril?token=` | `GET`: ayrılır, `/bulten?durum=ayrildi`'ya döner                       |
| `/bulten/ayril?token=` | `POST`: RFC 8058 tek tıkla ayrılma, gövdesiz `200`                     |
| `/yonetim/aboneler`    | Abone listesi, `?durum=` süzgeci                                       |

Onay ve ayrılma birer Route Handler'dır (`/auth/confirm` ile aynı model); site düzenini
kullanmadıkları için insanın göreceği sonucu bir sayfaya yönlendirerek gösterirler.

Gönderilen onay e-postası `List-Unsubscribe` ve `List-Unsubscribe-Post: List-Unsubscribe=One-Click`
başlıklarını taşır.

## E-posta gönderimi

`resend` paketi eklenmedi. Proje toast ve form kütüphanelerini de aynı gerekçeyle dışarıda
tutuyor; `src/lib/email/resend.ts` doğrudan `https://api.resend.com/emails` uç noktasına
`fetch` atan ince bir sarmalayıcıdır ve hiçbir zaman fırlatmaz.

`RESEND_API_KEY` ve `NEWSLETTER_FROM_EMAIL` `src/lib/env.ts` içinde **tanımlanmaz** — o
dosya istemci paketine girer. `getSupabaseSecretKey()` ile aynı model: `src/lib/email/config.ts`
içinde çağrı anında okunur ve doğrulanır.

Anahtar yoksa abonelik yine kaydedilir ve onay bağlantısı sunucu günlüğüne yazılır; böylece
yerel geliştirme Resend hesabı olmadan çalışır.

**Bülten içeriği bu uygulamada hazırlanmaz.** Gönderim Resend'de kalır; yönetimde yalnızca
abone listesi vardır.

## Yönetim

`/yonetim/aboneler` `requireStaffRoute` ile değil **`requireAdminRoute` ile** korunur:
sayfa kişisel veri (e-posta adresleri) listeler, editör yetkisi yeterli değildir. Menü
öğesi de `adminOnly` işaretlidir, ancak sayfa menü gizliliğine güvenmez.

CSV dışa aktarımı eklenmedi; kapsam kesme listesinde ilk sıradadır.

## Secret key yüzeyinin genişlemesi

`src/lib/supabase/admin.ts` doküman notu güncellendi. Secret key istemcisinin meşru
kullanıcıları artık üçtür: `search_queries` (Modül 12), `newsletter_subscriptions`
(bu modül) ve `account_deletion_requests` (Modül 13). Üçü de RLS ile kapalı, grant'siz
tablolardır.

## Yerel kimlik doğrulama düzeltmesi

`supabase/config.toml` içindeki `additional_redirect_urls` yalnızca kök adresleri içeriyordu.
Yol taşıyan hedefler izinli olmadığı için Supabase `emailRedirectTo` değerini reddedip
`site_url`'e düşüyor, magic link e-postası `/auth/confirm` yerine ana sayfaya bağlanıyor ve
oturum hiç kurulmuyordu. `http://localhost:3000/**` ve `http://127.0.0.1:3000/**` eklendi.
Bu, Modül 13'ün girişten geçen kaydetme akışının önkoşuluydu.
