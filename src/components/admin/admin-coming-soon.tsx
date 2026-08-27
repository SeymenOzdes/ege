import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function AdminComingSoon({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description: string;
  eyebrow: string;
}) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10 lg:py-12">
      <AdminPageHeader description={description} eyebrow={eyebrow} title={title} />
      <section className="mt-10 rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-6 text-[var(--color-ink-muted)]">
        Bu alan ilgili editoryal modülle birlikte tamamlanacak.
      </section>
    </main>
  );
}
