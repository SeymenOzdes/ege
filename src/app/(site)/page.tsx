import type { Metadata } from "next";
import { Homepage } from "@/components/site/homepage";
import { getHomepageContent } from "@/lib/homepage-content";

/**
 * Sitenin en çok istek alan sayfası; artık istek başına değil dakikada bir
 * üretiliyor. Bir dakika, son dakika temposu için yeterince sık: yayımlanan haber
 * en geç bir dakika içinde görünür, zamanlanmış yayın da aynı pencereden geçer.
 * Yayın anında görünmesi gerektiğinde yönetim tarafı `revalidatePath("/")` çağırır.
 */
export const revalidate = 60;

/**
 * Besleme bağlantısı ana sayfada duruyor, kök düzende değil.
 *
 * Next'in metadata birleştirmesi sığ: alt bir segmentin `alternates` nesnesi
 * üsttekini bütünüyle değiştirir. Kök düzene yazılsaydı, `alternates.canonical`
 * tanımlayan her sayfada — yani neredeyse hepsinde — besleme bağlantısı sessizce
 * düşerdi. Besleme okuyucuları da zaten sitenin kökünden keşif yapar.
 */
export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default async function Home() {
  const content = await getHomepageContent();

  // Hata render edilmiyor, fırlatılıyor: yeniden üretim sırasında fırlayan hatada
  // ISR son sağlam sayfayı sunmaya devam eder. Render edilseydi, bir dakikalık bir
  // veritabanı aksaması iyi ana sayfanın yerine hata panelini önbelleğe yazardı.
  // Hiç sağlam sürüm yoksa `(site)/error.tsx` devreye girer.
  if (content.loadError) throw new Error("Ana sayfa akışı okunamadı.");

  return <Homepage content={content} />;
}
