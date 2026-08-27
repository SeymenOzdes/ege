import { sendMagicLink } from "@/lib/auth/actions";
import { getSafeRedirectPath, loginNotice } from "@/lib/auth/redirect";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
    sent?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const next = getSafeRedirectPath(typeof query.next === "string" ? query.next : undefined);
  const notice = loginNotice(
    typeof query.error === "string" ? query.error : undefined,
    typeof query.sent === "string" ? query.sent : undefined,
  );

  return (
    <section className="shell-container py-14 sm:py-20">
      <div className="mx-auto max-w-xl rounded-[24px] border border-[var(--color-line)] bg-white p-6 shadow-sm sm:p-10">
        <p className="eyebrow text-[var(--color-teal)]">Okur girişi</p>
        <h1 className="font-editorial mt-3 text-4xl text-[var(--color-ink)] sm:text-5xl">
          Giriş bağlantını al
        </h1>
        <p className="mt-4 leading-7 text-[var(--color-ink-muted)]">
          E-posta adresine gönderilen tek kullanımlık bağlantıyla, parola oluşturmadan giriş yap.
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

        <form action={sendMagicLink} className="mt-8 grid gap-4">
          <input name="next" type="hidden" value={next} />
          <label
            className="grid gap-2 text-sm font-semibold text-[var(--color-ink)]"
            htmlFor="email"
          >
            E-posta adresi
            <input
              autoComplete="email"
              className="rounded-[18px] border border-[var(--color-line)] bg-[var(--color-paper)] px-4 py-3 text-base font-normal transition outline-none focus:border-[var(--color-teal)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-teal)_22%,transparent)]"
              id="email"
              name="email"
              required
              type="email"
            />
          </label>
          <button
            className="rounded-full bg-[var(--color-ink)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--color-teal)]"
            type="submit"
          >
            Giriş bağlantısı gönder
          </button>
        </form>
      </div>
    </section>
  );
}
