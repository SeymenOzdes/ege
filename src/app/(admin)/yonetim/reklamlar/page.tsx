import { AdForm } from "@/components/admin/ad-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { deleteAdPlacement, setAdPlacementActive } from "@/lib/admin/ad-actions";
import { adPlacementInfo } from "@/lib/ads";
import { getMediaPublicUrl } from "@/lib/media";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

type Status = { label: string; tone: string };

function getStatus(ad: { is_active: boolean; starts_at: string; ends_at: string | null }): Status {
  const now = Date.now();
  if (!ad.is_active) return { label: "Durduruldu", tone: "bg-stone-200 text-stone-700" };
  if (new Date(ad.starts_at).getTime() > now)
    return { label: "Zamanlandı", tone: "bg-amber-100 text-amber-800" };
  if (ad.ends_at && new Date(ad.ends_at).getTime() <= now)
    return { label: "Süresi doldu", tone: "bg-stone-200 text-stone-700" };
  return { label: "Yayında", tone: "bg-emerald-100 text-emerald-800" };
}

export default async function AdsPage() {
  let ads: Array<{
    id: string;
    sponsor: string;
    destination_url: string;
    placement_key: keyof typeof adPlacementInfo;
    is_active: boolean;
    starts_at: string;
    ends_at: string | null;
    previewSrc?: string;
  }> = [];
  let loadError = false;

  if (hasSupabasePublicConfig()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ad_placements")
      .select(
        `id, sponsor, destination_url, placement_key, is_active, starts_at, ends_at,
         desktop:media_assets!ad_placements_desktop_media_id_fkey(object_path),
         mobile:media_assets!ad_placements_mobile_media_id_fkey(object_path)`,
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) loadError = true;
    else {
      ads = (data ?? []).map(({ desktop, mobile, ...ad }) => {
        const path = desktop?.object_path ?? mobile?.object_path;
        return { ...ad, previewSrc: path ? getMediaPublicUrl(path) : undefined };
      });
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper)] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-10">
        <AdminPageHeader
          description="Anlaşmalı reklam bannerlarını yükleyin, yerleşim ve tarih seçin. Yayında reklam yoksa alan sitede görünmez."
          eyebrow="Reklamlar"
          title="Reklam yönetimi"
        />

        <AdForm />

        <section aria-labelledby="ads-heading">
          <h2 className="font-editorial text-3xl" id="ads-heading">
            Kayıtlı reklamlar
          </h2>
          {loadError ? <p className="mt-5 text-sm text-red-700">Reklamlar yüklenemedi.</p> : null}
          {!loadError && ads.length === 0 ? (
            <p className="mt-5 text-[var(--color-ink-muted)]">Henüz reklam eklenmedi.</p>
          ) : null}
          <ul className="mt-5 grid gap-4">
            {ads.map((ad) => {
              const status = getStatus(ad);
              return (
                <li
                  className="grid gap-4 rounded-[24px] border border-[var(--color-line)] bg-white p-4 sm:grid-cols-[14rem_1fr_auto] sm:items-center"
                  key={ad.id}
                >
                  {ad.previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded banner.
                    <img
                      alt={`${ad.sponsor} reklamı`}
                      className="w-full rounded-xl bg-[var(--color-paper)] object-contain"
                      src={ad.previewSrc}
                    />
                  ) : (
                    <div className="grid h-20 place-items-center rounded-xl bg-[var(--color-paper)] text-xs text-[var(--color-ink-muted)]">
                      Görsel yok
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      {ad.sponsor}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.tone}`}
                      >
                        {status.label}
                      </span>
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                      {adPlacementInfo[ad.placement_key].label}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--color-ink-muted)]">
                      {ad.destination_url}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                      {dateFormat.format(new Date(ad.starts_at))} →{" "}
                      {ad.ends_at ? dateFormat.format(new Date(ad.ends_at)) : "süresiz"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <form action={setAdPlacementActive}>
                      <input name="id" type="hidden" value={ad.id} />
                      <input name="active" type="hidden" value={String(!ad.is_active)} />
                      <button
                        className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold hover:border-[var(--color-teal)]"
                        type="submit"
                      >
                        {ad.is_active ? "Durdur" : "Yayına al"}
                      </button>
                    </form>
                    <form action={deleteAdPlacement}>
                      <input name="id" type="hidden" value={ad.id} />
                      <button
                        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        type="submit"
                      >
                        Sil
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
