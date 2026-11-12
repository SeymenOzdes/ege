import { adsenseClient } from "@/lib/adsense";

/**
 * Google'ın yetkili satıcı dosyası. Yayıncı kimliği `ca-pub-…` biçiminde gelir,
 * `ads.txt` ise `pub-…` ister. AdSense kapalıysa dosya yoktur (404).
 */
export const dynamic = "force-static";

export function GET() {
  if (!adsenseClient) return new Response("Not found", { status: 404 });

  return new Response(
    `google.com, ${adsenseClient.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`,
    { headers: { "content-type": "text/plain; charset=utf-8" } },
  );
}
