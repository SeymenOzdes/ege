import { expect, test } from "@playwright/test";

test("bülten sayfası açık rıza kutusuyla birlikte gelir", async ({ page }) => {
  await page.goto("/bulten");

  await expect(
    page.getByRole("heading", { name: /Bölgenin önemli hikâyeleri/, level: 1 }),
  ).toBeVisible();

  const consent = page.getByRole("checkbox");
  await expect(consent).not.toBeChecked();
  await expect(consent).toHaveAttribute("required", "");
  await expect(page.getByRole("button", { name: "Bültene katıl" })).toBeVisible();
});

test("ana sayfadaki bülten çağrısı gerçek bir form", async ({ page }) => {
  await page.goto("/");

  const form = page.locator("form.newsletter-form");
  await expect(form).toBeVisible();
  await expect(form.getByRole("textbox")).toHaveAttribute("type", "email");
  await expect(form.getByRole("checkbox")).not.toBeChecked();
});

test("geçersiz onay bağlantısı güvenli hata durumuna düşer", async ({ page }) => {
  await page.goto("/bulten/onay?token=gecersizjetondegeri123456");

  await expect(page).toHaveURL(/\/bulten\?durum=gecersiz/);
  await expect(page.getByRole("main").getByRole("alert")).toContainText("geçersiz");
});

test("geçersiz ayrılma bağlantısı da aynı duruma düşer", async ({ page }) => {
  await page.goto("/bulten/ayril?token=gecersizjetondegeri123456");

  await expect(page).toHaveURL(/\/bulten\?durum=gecersiz/);
});

test("tek tıkla ayrılma uç noktası POST kabul eder", async ({ request }) => {
  const response = await request.post("/bulten/ayril?token=gecersizjetondegeri123456");

  // Bilinmeyen jeton 400 döner; önemli olan uç noktanın POST'a yanıt vermesi.
  expect([200, 400]).toContain(response.status());
});
