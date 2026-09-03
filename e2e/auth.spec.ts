import { expect, test } from "@playwright/test";

test("giriş sayfası parola gerektirmeden Magic Link akışını açıklar", async ({ page }) => {
  await page.goto("/giris");

  await expect(page.getByRole("heading", { name: "Giriş yap" })).toBeVisible();
  await expect(page.getByLabel("E-posta adresi")).toHaveAttribute("type", "email");
  await expect(page.getByRole("button", { name: "Giriş bağlantısı gönder" })).toBeVisible();
});

test("anonim kullanıcı yönetim alanına giremez", async ({ page }) => {
  await page.goto("/yonetim");

  await expect(page).toHaveURL(/\/giris\?next=%2Fyonetim/);
});

test("geçersiz Magic Link güvenli hata durumuna yönlenir", async ({ page }) => {
  await page.goto("/auth/confirm?token_hash=invalid&type=email");

  await expect(page).toHaveURL(/\/giris\?error=(link_invalid|not_configured)/);
});
