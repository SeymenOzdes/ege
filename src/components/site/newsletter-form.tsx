import Link from "next/link";
import { subscribeToNewsletter } from "@/lib/newsletter/actions";

type NewsletterFormProps = {
  /** Ana sayfa çağrısı dar bir sütunda durur; `/bulten` tam genişlikte. */
  variant?: "compact" | "page";
  className?: string;
  idPrefix?: string;
};

/**
 * Ana sayfa ile `/bulten` aynı sunucu eylemini ve aynı rıza metnini paylaşsın
 * diye tek bileşen. Sunucu bileşenidir: JavaScript olmadan da gönderilir.
 */
export function NewsletterForm({
  variant = "page",
  className = "",
  idPrefix = "bulten",
}: NewsletterFormProps) {
  const emailId = `${idPrefix}-eposta`;
  const consentId = `${idPrefix}-onay`;

  return (
    <form action={subscribeToNewsletter} className={`newsletter-form ${variant} ${className}`}>
      <label className="newsletter-field" htmlFor={emailId}>
        <span>E-posta adresi</span>
        <input
          autoComplete="email"
          className="text-input"
          id={emailId}
          name="email"
          placeholder="ornek@eposta.com"
          required
          type="email"
        />
      </label>

      <label className="newsletter-consent" htmlFor={consentId}>
        {/* Bilerek önceden işaretli değil: rıza ayrı ve açık biçimde alınır. */}
        <input id={consentId} name="onay" required type="checkbox" value="evet" />
        <span>
          Haftalık bültenin e-posta adresime gönderilmesini onaylıyorum.{" "}
          <Link href="/gizlilik">Gizlilik politikası</Link>
        </span>
      </label>

      <button className="button button-primary" type="submit">
        Bültene katıl
      </button>
    </form>
  );
}
