# Dev Admin Otomatik Girişi — Geri Alma (Rollback) Kılavuzu

Bu doküman, yerel geliştirme kolaylığı için eklenen **dev admin otomatik girişi** özelliğinin üretime geçerken nasıl etkisiz bırakılacağını veya tamamen nasıl kaldırılacağını anlatır.

Özellik şu dosyalarda uygulanmıştır (tümü bu depoda):

| #   | Dosya                                       | Değişiklik                                                         |
| --- | ------------------------------------------- | ------------------------------------------------------------------ |
| 1   | `src/lib/auth/dev-access.ts`                | Yeni dosya: bayrak kontrolü + dev kimlik bilgileri                 |
| 2   | `src/app/auth/dev-login/route.ts`           | Yeni rota: parola girişi ile otomatik oturum                       |
| 3   | `src/lib/auth/server.ts`                    | `requireStaffRoute` içinde dev yönlendirme dalı                    |
| 4   | `src/lib/auth/redirect.ts`                  | `dev_login_failed` hata mesajı                                     |
| 5   | `supabase/seed.sql`                         | Yerel `dev-admin@ege.local` ADMIN hesabı (dosyanın sonundaki blok) |
| 6   | `playwright.config.ts`                      | webServer `env` içinde `DEV_ADMIN_AUTO_LOGIN=route`                |
| 7   | `.env.example` / `.env.local`               | `DEV_ADMIN_AUTO_LOGIN` satırı                                      |
| 8   | `docs/modules/05-authentication-and-rls.md` | “Yerel geliştirme hızlı girişi (dev-only)” bölümü                  |

## 0. Önemli: Üretim için zaten güvenli

Bu özellik, kod tarafında **iki katmanlı** olarak kilitlidir:

1. `isDevAdminAutoLoginEnabled()` yalnızca `process.env.NODE_ENV === "development"` **ve** `process.env.DEV_ADMIN_AUTO_LOGIN === "true"` iken `true` döner. `next build` + `next start` ile çalıştırılan üretim derlemesinde `NODE_ENV=production` olduğundan bayrak **her koşulda kapalıdır**.
1. Bayrağın üçüncü bir değeri var: `"route"`. Bu değerde `/yonetim`'e oturumsuz girildiğinde **otomatik yönlendirme yapılmaz** (yani `auth.spec.ts` gerçek korumayı doğrulamayı sürdürür), ama `/auth/dev-login` rotası elle çağrılabilir kalır — `isDevAdminLoginRouteEnabled()`. Yönetim e2e testi (`e2e/yonetim.spec.ts`) oturumu bu rotadan açıyor. Next 16 aynı dizinde ikinci bir dev sunucusuna izin vermediği için koruma testiyle yönetim testi tek sunucuyu ve tek bayrak değerini paylaşmak zorunda. Bu kapı da `NODE_ENV === "development"` şartına bağlıdır; üretimde `"route"` de kapalıdır.
1. `/auth/dev-login` rotası bayrak kapalıyken `/giris?error=link_invalid` sayfasına yönlenir; oturum açamaz.

Ayrıca seed yalnızca yerel `supabase db reset --local` sırasında çalışır; canlı Supabase projesine **asla taşınmaz**.

**Sonuç:** Üretime geçiş için aşağıdaki adımların hiçbiri zorunlu değildir. Bölüm 1, üretim dağıtım öncesi yapılması gereken tek kontrolü içerir. Özelliği kod tabanından tamamen sökmek istiyorsanız Bölüm 2’yi uygulayın.

## 1. Üretim dağıtım öncesi kontrol (yeterli olan minimum adım)

Barındırma ortamında (Vercel vb.) ortam değişkenlerinin arasında `DEV_ADMIN_AUTO_LOGIN` **bulunmadığını** doğrulayın (`true` kadar `route` için de geçerli). Varsa silin veya `false` yapın:

```bash
# Vercel CLI ile kontrol
vercel env ls production | grep DEV_ADMIN
```

`.env.example` içindeki satır yorum satırı olduğundan (`# DEV_ADMIN_AUTO_LOGIN=true`) yeni kurulumlar bu bayrağı yanlışlıkla açmaz.

## 2. Tam geri alma (kodu tabanından sökme)

Özelliğe artık ihtiyaç kalmadıysa, sırayla aşağıdaki adımları uygulayın.

> **Not:** Tüm değişiklikler tek bir commit içindeyse en pratik yol `git revert <commit-hash>` çalıştırmaktır; bu durumda Bölüm 2’yi elle yapmanız gerekmez. Yine de `.env.local` yerel dosya olduğu için 2.6. adımını mutlaka elle kontrol edin.

### 2.1. `src/app/auth/dev-login/` klasörünü silin

```bash
git rm -r src/app/auth/dev-login
```

### 2.2. `src/lib/auth/dev-access.ts` dosyasını silin

```bash
git rm src/lib/auth/dev-access.ts
```

### 2.3. `src/lib/auth/server.ts` — dev dalını kaldırın

`import` satırını silin:

```ts
import { isDevAdminAutoLoginEnabled } from "@/lib/auth/dev-access";
```

`requireStaffRoute` içindeki bloğu, özelliğin öncesiyle birebir aynı olan hâline döndürün. Mevcut hâli:

```ts
export async function requireStaffRoute(nextPath = "/yonetim") {
  const role = await getVerifiedUserRole();
  if (!role) {
    const safeNextPath = encodeURIComponent(getSafeRedirectPath(nextPath, "/yonetim"));

    // Yerel geliştirme hızlı girişi: geliştiriciyi seed admin'i ile gerçek bir
    // oturuma sokar; RLS rolleri gerçek JWT'den okumaya devam eder.
    if (isDevAdminAutoLoginEnabled()) {
      redirect(`/auth/dev-login?next=${safeNextPath}`);
    }

    redirect(`/giris?next=${safeNextPath}`);
  }
  ...
}
```

Geri döndürülmüş hâli:

```ts
export async function requireStaffRoute(nextPath = "/yonetim") {
  const role = await getVerifiedUserRole();
  if (!role) {
    redirect(`/giris?next=${encodeURIComponent(getSafeRedirectPath(nextPath, "/yonetim"))}`);
  }
  ...
}
```

### 2.4. `src/lib/auth/redirect.ts` — hata mesajını kaldırın

`loginNotice` içinden şu bloğu silin:

```ts
if (error === "dev_login_failed") {
  return {
    tone: "error" as const,
    text: "Yerel geliştirme girişi başarısız oldu. `pnpm supabase:reset` ile seed'i yenileyip tekrar deneyin.",
  };
}
```

### 2.5. `supabase/seed.sql` — dev admin bloğunu kaldırın

Dosyanın sonundaki, `-- YEREL GELİŞTİRME: sabit admin hesabı.` başlıklı yorum bloğundan başlayıp `auth.identities` ekleme ve altındaki açıklama yorumuyla biten tüm bloğu silin. Blok şununla başlar:

```sql
-- ==========================================================================
-- YEREL GELİŞTİRME: sabit admin hesabı.
...
delete from auth.users where email = 'dev-admin@ege.local';
```

…ve şu satırla biter:

```sql
-- Not: token/phone metin kolonları NULL değil '' olmalı; GoTrue NULL kolonları
-- taramada string'e çeviremediği için 500 döndürüyor. instance_id de
-- API ile oluşturulan kullanıcılarla aynı sıfır UUID olmalı.
```

Silme işleminden sonra dosya, makale seed’ini bitiren `body_text = excluded.body_text;` satırıyla biter.

### 2.6. Ortam değişkenleri

- `.env.local`: şu iki satırı silin (dosya git’te izlenmez, elle düzenlenir):

  ```
  # Yerel geliştirme hızlı girişi: /yonetim anonim açılışta seed admin ile otomatik oturum açar.
  DEV_ADMIN_AUTO_LOGIN=true
  ```

- `.env.example`: `DEV_ADMIN_AUTO_LOGIN` hakkında yorum bloğunu silin.

### 2.7. `playwright.config.ts` — webServer env satırını kaldırın

Özellik kodda tamamen yok olduğu için bayrak artık anlamsızdır; şu satırı (ve üstündeki yorumu) silin:

```ts
    // E2E, dev bayrağından bağımsız olarak gerçek giriş korumasını doğrular.
    env: { ...process.env, DEV_ADMIN_AUTO_LOGIN: "route" },
```

### 2.8. `docs/modules/05-authentication-and-rls.md` — bölümü kaldırın

“## Yerel geliştirme hızlı girişi (dev-only)” başlıklı bölümü ve altındaki iki paragrafı silin.

## 3. Doğrulama (geri alma sonrası)

Sırasıyla çalıştırın ve hepsinin geçtiğini görün:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Ardından davranışsal doğrulama:

1. `pnpm supabase:reset` — seed artık dev admin hesabı **oluşturmamalı**:

   ```bash
   docker exec $(docker ps --format '{{.Names}}' | grep supabase_db | head -1) \
     psql -U postgres -c "select count(*) from auth.users where email = 'dev-admin@ege.local';"
   # Beklenen: 0
   ```

2. Dev sunucusunda oturumsuz tarayıcı/curl ile `/yonetim` → `/giris?next=%2Fyonetim` sayfasına yönlenmeli, otomatik giriş **olmamalı**:

   ```bash
   rm -f /tmp/jar; curl -s -L --max-redirs 3 -c /tmp/jar -b /tmp/jar -o /dev/null \
     -w 'FINAL=%{url_effective}\n' http://127.0.0.1:3000/yonetim
   # Beklenen: FINAL=.../giris?next=%2Fyonetim
   ```

3. E2E: `pnpm test:e2e` — özellikle “anonim kullanıcı yönetim alanına giremez” testi geçmeli.

## 4. Canlı ortam notu

Canlı Supabase projesinde bu özellik hiçbir zaman var olmadı; ilk personel hesabını canlıya taşırken docs/modules/05-authentication-and-rls.md içindeki “Canlı ortam devri” adımlarını (Dashboard üzerinden `app_metadata.role = ADMIN` ataması + oturum yenileme) izlemeye devam edin.
