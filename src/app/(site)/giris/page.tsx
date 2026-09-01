import Link from "next/link";
import { SubmitButton } from "@/components/site/submit-button";
import { sendMagicLink, signInWithGoogle } from "@/lib/auth/actions";
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
        {/* Sayfada iki giriş yöntemi var; başlık ikisini de kapsamalı. */}
        <h1 className="font-editorial mt-3 text-center text-4xl text-[var(--color-ink)] sm:text-5xl">
          Giriş yap
        </h1>
        <p className="mt-4 text-center leading-7 text-[var(--color-ink-muted)]">
          Kaydettiğin haberlere her cihazdan eriş, bülteni kaçırma. Parola oluşturman gerekmiyor.
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

        {/* Google tek tıkla biter; magic-link "yaz → gönder → e-postana git → dön"
            adımlarını gerektirir. Hızlı yol önce gelir. */}
        <form action={signInWithGoogle} className="mt-8">
          <input name="next" type="hidden" value={next} />
          <SubmitButton
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[#747775] bg-white px-5 py-3 font-semibold text-[#1f1f1f] transition hover:bg-[#f8f9fa] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-teal)_22%,transparent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
            pendingLabel="Google'a yönlendiriliyorsun…"
          >
            <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 48 48" width="20">
              <path
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                fill="#EA4335"
              />
              <path
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                fill="#4285F4"
              />
              <path
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                fill="#FBBC05"
              />
              <path
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                fill="#34A853"
              />
            </svg>
            {/* Google'ın onayladığı kalıp; Türkçe cümle yazımıyla. */}
            Google ile oturum aç
          </SubmitButton>
        </form>

        <div aria-label="veya" className="mt-8 flex items-center gap-4" role="separator">
          <span className="h-px flex-1 bg-[var(--color-line)]" />
          <span className="text-xs font-semibold tracking-wide text-[var(--color-ink-muted)] uppercase">
            veya
          </span>
          <span className="h-px flex-1 bg-[var(--color-line)]" />
        </div>

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
          <SubmitButton
            className="rounded-full bg-[var(--color-ink)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--color-teal)] disabled:cursor-not-allowed disabled:opacity-60"
            pendingLabel="Gönderiliyor…"
          >
            Giriş bağlantısı gönder
          </SubmitButton>
          <p className="text-sm text-[var(--color-ink-muted)]">
            E-posta adresine tek kullanımlık bir bağlantı göndeririz.
          </p>
        </form>

        {/* Google girişi okurun adını ve e-posta adresini üçüncü tarafa taşır;
            rıza metni bültendeki kalıbı izler. */}
        <p className="mt-8 border-t border-[var(--color-line)] pt-6 text-sm leading-6 text-[var(--color-ink-muted)]">
          Giriş yaparak{" "}
          <Link className="underline hover:text-[var(--color-teal)]" href="/kullanim-kosullari">
            Kullanım Koşulları
          </Link>
          {"'nı ve "}
          <Link className="underline hover:text-[var(--color-teal)]" href="/gizlilik">
            Gizlilik Politikası
          </Link>
          {"'nı kabul etmiş olursun."}
        </p>
      </div>
    </section>
  );
}
