import "server-only";

import { createAnonClient } from "@/lib/supabase/anon";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";

export type RedirectTarget = {
  toPath: string;
  /** `redirects_status_code` yalnızca 301, 302, 307 ve 308'e izin veriyor. */
  statusCode: number;
};

/**
 * Eski bir adresin yeni hedefi.
 *
 * Yalnızca haber bulunamadığında çağrılıyor; `src/proxy.ts`'e konsaydı her
 * istek bir veritabanı gidiş-dönüşü ödeyecekti. Okuma çerezsiz: `redirects`
 * tablosunun `redirects_public_select` politikası zaten herkese açık ve
 * önbelleğe alınan bir sayfa kimin istediğine göre değişmemeli.
 */
export async function getRedirectTarget(fromPath: string): Promise<RedirectTarget | undefined> {
  if (!hasSupabasePublicConfig()) return undefined;

  const supabase = createAnonClient();
  const { data } = await supabase
    .from("redirects")
    .select("to_path, status_code")
    .eq("from_path", fromPath)
    .maybeSingle();

  if (!data) return undefined;
  return { toPath: data.to_path, statusCode: data.status_code };
}
