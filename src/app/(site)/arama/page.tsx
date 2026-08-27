import type { Metadata } from "next";
import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr/MagnifyingGlass";
import { ArticleCard } from "@/components/site/article-card";
import { searchArticles } from "@/lib/search";
import styles from "./arama.module.css";

export const metadata: Metadata = {
  title: "Arama — Ege'nin Nabzı",
  description: "Ege'nin Nabzı haberlerinde Türkçe arama yapın.",
  alternates: { canonical: "/arama" },
};

const suggestions = ["İzmir", "zeytin", "ulaşım", "kültür", "pazar"] as const;

export default async function AramaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query.length > 0 ? searchArticles(query) : [];

  return (
    <div className={styles.page}>
      <div className="shell-container">
        <header className={styles.header}>
          <span className="eyebrow">Haber arşivi</span>
          <h1 className="font-editorial">
            {query.length > 0 ? `“${query}” için sonuçlar` : "Ege'de ne arıyorsunuz?"}
          </h1>
          <p className={styles.count} role="status">
            {query.length > 0
              ? results.length > 0
                ? `${results.length} haber bulundu.`
                : "Sonuç bulunamadı. Farklı bir ifade deneyin."
              : "Haber, şehir veya konu bazında Türkçe arama yapabilirsiniz."}
          </p>
        </header>

        {results.length > 0 ? (
          <div className={styles.results}>
            {results.map((article) => (
              <ArticleCard article={article} variant="timeline" key={`${article.id}-${article.slug}`} />
            ))}
          </div>
        ) : (
          <div className={styles.suggestions}>
            <MagnifyingGlass aria-hidden="true" size={26} weight="duotone" />
            <p>Şunları deneyebilirsiniz:</p>
            <div className={styles.chips}>
              {suggestions.map((term) => (
                <Link key={term} href={`/arama?q=${encodeURIComponent(term)}`}>
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}