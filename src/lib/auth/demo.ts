/**
 * Demo aşaması bayrağı.
 *
 * Site tanıtım ("demo") aşamasındadır: okur üyeliği kapalıdır — giriş sayfası,
 * Google/magic-link formları ve başlıktaki/altbilideki giriş bağlantıları
 * gösterilmez; kişisel yer imi akışları ana sayfaya geri döner.
 * Yalnızca admin hesabı çalışmayı sürdürür.
 *
 * Varsayılan açıktır. Demo bittiğinde `NEXT_PUBLIC_DEMO_MODE=false` ortam
 * değişkeni (yerelde .env.local, barındırmada proje ortam değişkenleri)
 * verilir ve dev/app yeniden başlatılır: kod silinmez, sayfalar ve
 * bağlantılar eski haline döner.
 *
 * `NEXT_PUBLIC_` öneki bayrağı sunucu tarafında da tarayıcı bileşenlerinde de
 * okunur kılar (Next derleme sırasında değeri istemci paketine sabitler).
 */
export function isSiteDemoModeEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
}
