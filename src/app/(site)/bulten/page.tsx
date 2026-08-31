import type { Metadata } from "next";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { newsletterNotice } from "@/lib/newsletter/messages";

export const metadata: Metadata = {
  title: "Bülten",
  description: "Haftada bir kez Ege'den seçilmiş haberler, kültür rotaları ve yerel yaşam notları.",
  alternates: { canonical: "/bulten" },
};

type NewsletterPageProps = {
  searchParams: Promise<{ durum?: string | string[] }>;
};

export default async function NewsletterPage({ searchParams }: NewsletterPageProps) {
  const query = await searchParams;
  const notice = newsletterNotice(typeof query.durum === "string" ? query.durum : undefined);

  return (
    <section className="shell-container py-14 sm:py-20">
      <div className="mx-auto max-w-xl rounded-[24px] border border-[var(--color-line)] bg-white p-6 shadow-sm sm:p-10">
        <span
          aria-hidden="true"
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-teal)_14%,white)] text-[var(--color-teal)]"
        >
          <EnvelopeSimple size={24} weight="duotone" />
        </span>
        <p className="eyebrow mt-5 text-[var(--color-teal)]">Haftalık Ege mektubu</p>
        <h1 className="font-editorial mt-3 text-4xl text-[var(--color-ink)] sm:text-5xl">
          Bölgenin önemli hikâyeleri doğrudan gelen kutunda.
        </h1>
        <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">
          Haftada bir kez; seçilmiş haberler, kültür rotaları ve yerel yaşam notları. Adresinizi
          yalnızca bülten için kullanırız, üçüncü taraflarla paylaşmayız ve her e-postadan tek tıkla
          ayrılabilirsiniz.
        </p>

        {notice ? (
          <p
            className={`mt-6 rounded-[18px] px-4 py-3 text-sm ${
              notice.tone === "success"
                ? "bg-[color-mix(in_srgb,var(--color-teal)_12%,white)] text-[var(--color-teal)]"
                : "bg-red-50 text-red-700"
            }`}
            role={notice.tone === "error" ? "alert" : "status"}
          >
            {notice.text}
          </p>
        ) : null}

        <NewsletterForm className="mt-8" idPrefix="bulten-sayfa" variant="page" />
      </div>
    </section>
  );
}
