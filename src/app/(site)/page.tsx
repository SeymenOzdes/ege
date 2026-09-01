import type { Metadata } from "next";
import { Homepage, HomepageState } from "@/components/site/homepage";
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

  if (content.loadError) return <HomepageState state="error" />;

  return <Homepage content={content} />;
}
