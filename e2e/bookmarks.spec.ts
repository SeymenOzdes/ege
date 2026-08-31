import { expect, test } from "@playwright/test";

test("kaydedilenler sayfası oturum ister", async ({ page }) => {
  await page.goto("/kaydedilenler");

  await expect(page).toHaveURL(/\/giris\?next=%2Fkaydedilenler/);
});

test("anonim ziyaretçiye okur rozeti gösterilmez", async ({ page }) => {
  await page.goto("/");

  // Oturum açmamış ziyaretçide "Kaydedilenler" yalnızca altbilgide durur;
  // başlıktaki okur rozeti ve mobil menü girişi yalnızca oturumla gelir.
  await expect(page.getByRole("link", { name: "Kaydedilenler" })).toHaveCount(1);
  await expect(page.locator("footer").getByRole("link", { name: "Kaydedilenler" })).toHaveCount(1);
});
