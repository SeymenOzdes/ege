import { expect, test } from "@playwright/test";

/**
 * Altbilgideki yedi kurumsal bağlantı launch öncesinde 404 veriyordu. Bu dosya
 * hem bağlantıların durduğunu hem de hedeflerinin gerçekten açıldığını
 * doğruluyor — ikisi ayrı hata: bağlantı silinirse de sayfa silinirse de
 * kırılır.
 */
const CORPORATE_PAGES = [
  { path: "/kunye", heading: "Künye" },
  { path: "/yayin-ilkeleri", heading: "Yayın İlkeleri" },
  { path: "/duzeltmeler", heading: "Düzeltmeler" },
  { path: "/iletisim", heading: "İletişim" },
  { path: "/gizlilik", heading: "Gizlilik Politikası" },
  { path: "/cerezler", heading: "Çerez Politikası" },
  { path: "/kullanim-kosullari", heading: "Kullanım Koşulları" },
] as const;

for (const { path, heading } of CORPORATE_PAGES) {
  test(`kurumsal sayfa açılıyor: ${path}`, async ({ page }) => {
    const response = await page.goto(path);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  });
}

test("altbilge yedi kurumsal sayfanın tamamına bağlanıyor", async ({ page }) => {
  await page.goto("/");

  const footer = page.getByRole("contentinfo");
  for (const { path } of CORPORATE_PAGES) {
    await expect(footer.locator(`a[href="${path}"]`).first()).toHaveCount(1);
  }
});

test("altbilgideki künye bağlantısı künye sayfasına götürüyor", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Künye" }).click();

  await expect(page).toHaveURL(/\/kunye$/);
  await expect(page.getByRole("heading", { level: 1, name: "Künye" })).toBeVisible();
});

test("bülten formundaki rıza metni gizlilik sayfasına bağlanıyor", async ({ page }) => {
  // Rıza kutusunun yanındaki bu bağlantı KVKK aydınlatma referansı; kırılırsa
  // site aydınlatma metni olmayan bir rızayla e-posta topluyor demektir.
  await page.goto("/bulten");
  await page.getByRole("link", { name: "Gizlilik politikası" }).click();

  await expect(page).toHaveURL(/\/gizlilik$/);
  await expect(page.getByRole("heading", { level: 1, name: "Gizlilik Politikası" })).toBeVisible();
});

test("kurumsal metinler henüz taslak olduklarını söylüyor", async ({ page }) => {
  await page.goto("/kunye");

  // Gerçek bilgiler doldurulduğunda bu uyarı kaldırılacak; testin düşmesi o
  // adımı hatırlatan işaret olur.
  await expect(page.getByText("Taslak metin")).toBeVisible();
  await expect(page.locator("[data-doldurulacak]").first()).toBeVisible();
});
