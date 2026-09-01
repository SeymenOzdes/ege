import type { JsonLdNode } from "@/lib/json-ld";

/**
 * JSON-LD'yi `<script type="application/ld+json">` olarak basar.
 *
 * `<` karakteri kaçırılıyor: veriden gelen bir `</script>` dizisi aksi hâlde
 * script etiketini erkenden kapatır. Haber detayındaki JSON-LD de aynı önlemi
 * alıyor (`article-detail.tsx`), burada tek yerde toplanıyor.
 */
export function JsonLd({ data }: { data: JsonLdNode }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
