import Link from "next/link";
import { ClockIcon } from "@phosphor-icons/react/dist/ssr/Clock";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminQuickActions } from "@/components/admin/admin-quick-actions";
import { getAdminDashboard } from "@/lib/admin/dashboard";

function formatDate(value: string | null, fallback: string) {
  if (!value) return fallback;
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();
  const statusCards = [
    {
      label: "Taslaklar",
      value: dashboard.counts.drafts,
      href: "/yonetim/haberler?durum=DRAFT",
      tone: "text-[var(--color-ink)]",
    },
    {
      label: "İncelemede",
      value: dashboard.counts.reviews,
      href: "/yonetim/haberler?durum=IN_REVIEW",
      tone: "text-[var(--color-ochre)]",
    },
    {
      label: "Zamanlanmış",
      value: dashboard.counts.scheduled,
      href: "/yonetim/haberler?durum=SCHEDULED",
      tone: "text-[var(--color-teal)]",
    },
    {
      label: "Yayımlanan",
      value: dashboard.counts.published,
      href: "/yonetim/haberler?durum=PUBLISHED",
      tone: "text-[var(--color-ink)]",
    },
  ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <AdminPageHeader
        actions={<AdminQuickActions />}
        description="Günün editoryal akışını izleyin, yeni taslak açın ve yayın önceliklerini yönetin."
        title="Genel bakış"
      />

      {dashboard.loadError ? (
        <p className="mt-8 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700">
          Dashboard verileri şu anda yüklenemedi. Lütfen yeniden deneyin.
        </p>
      ) : null}

      <section
        aria-label="Editoryal durumlar"
        className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statusCards.map((card) => (
          <Link
            className="rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-teal)]"
            href={card.href}
            key={card.label}
          >
            <p className="text-sm font-semibold text-[var(--color-ink-muted)]">{card.label}</p>
            <p className={`font-editorial mt-3 text-5xl ${card.tone}`}>{card.value}</p>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">Haber akışını görüntüle</p>
          </Link>
        ))}
      </section>

      <section
        aria-labelledby="recent-published-heading"
        className="mt-10 rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-[var(--color-teal)]">Yayın akışı</p>
            <h2 className="font-editorial mt-2 text-3xl" id="recent-published-heading">
              Son yayımlananlar
            </h2>
          </div>
          <Link
            className="text-sm font-semibold text-[var(--color-teal)] hover:text-[var(--color-ink)]"
            href="/yonetim/haberler?durum=PUBLISHED"
          >
            Tümünü gör
          </Link>
        </div>
        {dashboard.recentPublications.length === 0 ? (
          <p className="mt-6 text-[var(--color-ink-muted)]">Henüz yayımlanmış haber yok.</p>
        ) : null}
        <ul className="mt-5 divide-y divide-[var(--color-line)]">
          {dashboard.recentPublications.map((article) => (
            <li
              className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
              key={article.id}
            >
              <div>
                <p className="font-semibold">{article.title}</p>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">/{article.slug}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                {article.isBreaking ? (
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--color-ochre)_18%,white)] px-2.5 py-1 text-xs font-bold text-[var(--color-ink)]">
                    Son dakika
                  </span>
                ) : null}
                <ClockIcon aria-hidden="true" size={16} />
                <span>{formatDate(article.publishedAt, formatDate(article.updatedAt, "—"))}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
