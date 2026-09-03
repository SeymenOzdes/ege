import { expect, test } from "@playwright/test";

/**
 * Yönetimdeki haber editörünün uçtan uca dumanı.
 *
 * Oturum, yerel geliştirme rotası `/auth/dev-login` üzerinden açılıyor
 * (`playwright.config.ts` bayrağı `"route"`). Test yerel Supabase'te gerçek bir
 * taslak satırı oluşturuyor — yayımlanmıyor, taslak olarak kalıyor.
 */
test("editör biçimlendirilmiş bir haber taslağı oluşturur", async ({ page }) => {
  await page.goto("/auth/dev-login?next=%2Fyonetim%2Fhaberler%2Fyeni");

  await expect(page).toHaveURL(/\/yonetim\/haberler\/yeni$/);
  const titleField = page.getByLabel("Başlık", { exact: true });
  await expect(titleField).toBeVisible();

  const title = `E2E tramvay haberi ${Date.now().toString(36)}`;
  await titleField.fill(title);

  const surface = page.getByRole("textbox", { name: "Haber metni" });
  await surface.click();
  await page.keyboard.type("İlk sefer sabah 06.00'da yapıldı.");

  // Ara başlık markdown kısayoluyla açılıyor.
  await page.keyboard.press("Enter");
  await page.keyboard.type("## Ne değişti");

  // Kalın: son satır seçilip araç çubuğundan işaretleniyor. `Shift+Home` yerine
  // karakter karakter seçim kullanılıyor: macOS'te `Home`, satır başına değil
  // belgenin en başına gidiyor (Cocoa'nın `moveToBeginningOfDocument:` davranışı),
  // bu yüzden platforma bağlı olmayan bir seçim gerekiyor.
  const boldLine = "Hat uzatıldı.";
  await page.keyboard.press("Enter");
  await page.keyboard.type(boldLine);
  for (let i = 0; i < boldLine.length; i++) {
    await page.keyboard.press("Shift+ArrowLeft");
  }
  await page.getByRole("button", { name: "Kalın", exact: true }).click();

  // Önizleme, haber sayfasıyla aynı bileşeni çiziyor. Yönetim kabuğunun kendi
  // `<aside>` gezinme çubuğu da sayfada olduğundan (logo `<strong>` içeriyor),
  // önizleme kartını "Önizleme" ön etiketinden ayırt ediyoruz.
  const previewCard = page.locator("aside").filter({ hasText: "Önizleme" });
  const preview = previewCard.getByRole("heading", { level: 2, name: "Ne değişti" });
  await expect(preview).toBeVisible();

  await page.getByRole("button", { name: "Taslağı oluştur" }).click();

  // Kayıttan sonra aynı form düzenleme kimliğiyle açılır.
  await expect(page).toHaveURL(/\/yonetim\/haberler\/[0-9a-f-]{36}/);
  await expect(page.getByRole("button", { name: "Değişiklikleri kaydet" })).toBeVisible();

  // Gövde kayıptan geçmeden geri geldi mi?
  await expect(page.getByRole("textbox", { name: "Haber metni" })).toContainText(
    "İlk sefer sabah 06.00'da yapıldı.",
  );
  await expect(
    previewCard.getByRole("heading", { level: 2, name: "Ne değişti" }),
  ).toBeVisible();
  await expect(previewCard.locator("strong")).toHaveText("Hat uzatıldı.");
});
