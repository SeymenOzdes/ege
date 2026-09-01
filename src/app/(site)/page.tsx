import { Homepage, HomepageState } from "@/components/site/homepage";
import { getHomepageContent } from "@/lib/homepage-content";

/**
 * Sitenin en çok istek alan sayfası; artık istek başına değil dakikada bir
 * üretiliyor. Bir dakika, son dakika temposu için yeterince sık: yayımlanan haber
 * en geç bir dakika içinde görünür, zamanlanmış yayın da aynı pencereden geçer.
 * Yayın anında görünmesi gerektiğinde yönetim tarafı `revalidatePath("/")` çağırır.
 */
export const revalidate = 60;

export default async function Home() {
  const content = await getHomepageContent();

  if (content.loadError) return <HomepageState state="error" />;

  return <Homepage content={content} />;
}
