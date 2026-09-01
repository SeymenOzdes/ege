# Google ile Giriş Yap — Kurulum Rehberi

Bu doküman, `/giris` sayfasındaki "Google ile oturum aç" düğmesinin arkasındaki
akışı ve gerekli harici yapılandırmayı açıklar.

## Akış

1. Okur `/giris` sayfasındaki düğmeye basar; `signInWithGoogle` server action'ı
   (`src/lib/auth/actions.ts`) güvenli `next` yolunu `egenin-nabzi-auth-next`
   çerezine yazar ve `supabase.auth.signInWithOAuth({ provider: "google" })`
   çağrısıyla Google onay URL'sini alıp okuru oraya yönlendirir.
2. Google, onaydan sonra okuru `<app-url>/auth/callback?code=…` adresine döndürür.
   Bu rota (`src/app/auth/callback/route.ts`) `exchangeCodeForSession` ile oturum
   çerezlerini kurar, `next` çerezini tüketir ve bekleyen kaydetme varsa tamamlar —
   birebir `/auth/confirm` akışıyla aynı şekilde.
3. Hata durumunda okur `/giris?error=google_failed` mesajıyla geri döner.

## Supabase yapılandırması (zorunlu)

Supabase, Google sağlayıcısı etkinleştirilmeden bu akış çalışmaz.

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URI: `https://<proje-ref>.supabase.co/auth/v1/callback`
     (yerel geliştirme için: `http://127.0.0.1:54321/auth/v1/callback` — Supabase
     CLI'nın Auth servisinin adresi)
2. Örnek uygulamada **OAuth consent screen**'i External olarak yapılandırın ve
   test kullanıcılarını ekleyin.
3. Supabase Dashboard → **Authentication → Sign In / Up → Google** sağlayıcısını
   açın, `client_id` ve `client_secret` değerlerini girin, kaydedin.
   Alternatif olarak CLI ile local geliştirmede `supabase/config.toml` içindeki
   `[auth.external.google]` bloğunu `enabled = true` yapıp
   `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` ortam değişkenini verebilirsiniz
   (`client_id` da ortam değişkeniyle verilebilir: `env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)`).

## Ön koşullar

- Yönlendirme adresi `requestOrigin()` üzerinden tarayıcının gerçek host'undan
  türetilir; localhost ve 127.0.0.1 ayrı çerez kavanozları olduğundan hangi
  adresle geziniyorsanız o adresle giriş yapın.
- Supabase Auth'da e-posta adresi doğrulaması Google hesabından otomatik gelir;
  ek bir işlem gerekmez.
