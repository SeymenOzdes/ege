import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { requireAdminRoute } from "@/lib/auth/server";
import {
  getSubscribers,
  parseSubscriptionStatus,
  subscriptionStatusLabels,
  subscriptionStatuses,
} from "@/lib/admin/subscribers";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Istanbul",
});

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

type SubscribersPageProps = {
  searchParams: Promise<{ durum?: string | string[] }>;
};

export default async function SubscribersPage({ searchParams }: SubscribersPageProps) {
  // Sayfa kişisel veri (e-posta) listeler; editör yetkisi yeterli değildir.
  await requireAdminRoute("/yonetim/aboneler");

  const query = await searchParams;
  const activeStatus = parseSubscriptionStatus(
    typeof query.durum === "string" ? query.durum : undefined,
  );
  const { subscribers, counts, total, loadError } = await getSubscribers(activeStatus);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <div className="grid gap-10">
        <AdminPageHeader
          description="Bülten aboneleri ve rıza kayıtları. Gönderim Resend üzerinden yapılır; burada içerik hazırlanmaz."
          eyebrow="Aboneler"
          title="Bülten aboneleri"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm">
            <span className="eyebrow text-[var(--color-teal)]">Toplam kayıt</span>
            <p className="font-editorial mt-3 text-5xl">{total}</p>
          </div>
          {subscriptionStatuses.map((status) => (
            <div
              className="rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm"
              key={status}
            >
              <span className="eyebrow text-[var(--color-teal)]">
                {subscriptionStatusLabels[status]}
              </span>
              <p className="font-editorial mt-3 text-5xl">{counts[status]}</p>
            </div>
          ))}
        </div>

        <section className="rounded-[24px] border border-[var(--color-line)] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <span className="eyebrow text-[var(--color-teal)]">Abone listesi</span>
              <h2 className="font-editorial mt-2 text-3xl">
                {activeStatus ? subscriptionStatusLabels[activeStatus] : "Tüm aboneler"}
              </h2>
            </div>
            <nav aria-label="Duruma göre süz" className="flex flex-wrap gap-2">
              <Link
                aria-current={activeStatus ? undefined : "page"}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  activeStatus
                    ? "text-[var(--color-ink-muted)] hover:text-[var(--color-teal)]"
                    : "bg-[var(--color-ink)] text-white"
                }`}
                href="/yonetim/aboneler"
              >
                Tümü
              </Link>
              {subscriptionStatuses.map((status) => (
                <Link
                  aria-current={activeStatus === status ? "page" : undefined}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                    activeStatus === status
                      ? "bg-[var(--color-ink)] text-white"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-teal)]"
                  }`}
                  href={`/yonetim/aboneler?durum=${status}`}
                  key={status}
                >
                  {subscriptionStatusLabels[status]}
                </Link>
              ))}
            </nav>
          </div>

          {loadError ? (
            <p
              className="mt-5 rounded-[18px] bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              Abone kayıtları yüklenemedi.
            </p>
          ) : null}

          {!loadError && subscribers.length === 0 ? (
            <p className="mt-6 text-[var(--color-ink-muted)]">Bu durumda henüz abone yok.</p>
          ) : null}

          {subscribers.length > 0 ? (
            <ul className="mt-5 divide-y divide-[var(--color-line)]">
              {subscribers.map((subscriber) => (
                <li
                  className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                  key={subscriber.id}
                >
                  <div>
                    <p className="font-semibold">{subscriber.email}</p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      Rıza: {formatDate(subscriber.consentedAt)}
                      {subscriber.confirmedAt
                        ? ` · Onay: ${formatDate(subscriber.confirmedAt)}`
                        : ""}
                      {subscriber.unsubscribedAt
                        ? ` · Ayrılma: ${formatDate(subscriber.unsubscribedAt)}`
                        : ""}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-[color-mix(in_srgb,var(--color-ochre)_18%,white)] px-2.5 py-1 text-xs font-bold">
                    {subscriptionStatusLabels[subscriber.status]}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </main>
  );
}
