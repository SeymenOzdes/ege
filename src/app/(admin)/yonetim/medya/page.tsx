import { MediaUploader } from "@/components/admin/media-uploader";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { NEWS_MEDIA_BUCKET } from "@/lib/media";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  let assets: Array<{
    id: string;
    object_path: string;
    alt_text: string;
    caption: string | null;
    publicUrl: string;
  }> = [];
  let loadError = false;

  if (hasSupabasePublicConfig()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("media_assets")
      .select("id, object_path, alt_text, caption")
      .eq("bucket_id", NEWS_MEDIA_BUCKET)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) loadError = true;
    else {
      assets = (data ?? []).map((asset) => ({
        ...asset,
        publicUrl: supabase.storage.from(NEWS_MEDIA_BUCKET).getPublicUrl(asset.object_path).data
          .publicUrl,
      }));
    }
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper)] px-4 py-16 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-10">
        <AdminPageHeader
          description="Haber görsellerini erişilebilir açıklamalarıyla güvenli biçimde saklayın ve sonraki içeriklerde yeniden kullanın."
          eyebrow="Medya"
          title="Medya kütüphanesi"
        />

        <MediaUploader />

        <section aria-labelledby="recent-media-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-editorial text-3xl" id="recent-media-heading">
              Son yüklenenler
            </h2>
            <span className="text-sm text-[var(--color-ink-muted)]">Son 30 kayıt</span>
          </div>
          {loadError ? (
            <p className="mt-5 text-sm text-red-700">Medya kayıtları yüklenemedi.</p>
          ) : null}
          {!loadError && assets.length === 0 ? (
            <p className="mt-5 text-[var(--color-ink-muted)]">Henüz kayıtlı bir görsel yok.</p>
          ) : null}
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => {
              return (
                <li
                  className="overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-white"
                  key={asset.id}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- dimensions are not known until upload. */}
                  <img
                    alt={asset.alt_text}
                    className="aspect-[16/10] w-full bg-[var(--color-paper)] object-cover"
                    src={asset.publicUrl}
                  />
                  <div className="p-4">
                    <p className="font-semibold">{asset.alt_text}</p>
                    {asset.caption ? (
                      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{asset.caption}</p>
                    ) : null}
                    <p className="mt-3 truncate text-xs text-[var(--color-ink-muted)]">
                      {asset.object_path}
                    </p>
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
