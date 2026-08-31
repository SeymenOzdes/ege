"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { sendEmail } from "@/lib/email/resend";
import { hasResendConfig } from "@/lib/email/config";
import { confirmationEmail } from "@/lib/newsletter/emails";
import { createToken, digestToken } from "@/lib/newsletter/tokens";
import { siteConfig } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.email().max(320);

/** Aynı adrese arka arkaya onay e-postası gönderilmesini engelleyen bekleme süresi. */
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

function newsletterLinks(confirmationToken: string, unsubscribeToken: string) {
  return {
    confirmUrl: new URL(`/bulten/onay?token=${confirmationToken}`, siteConfig.url).toString(),
    unsubscribeUrl: new URL(`/bulten/ayril?token=${unsubscribeToken}`, siteConfig.url).toString(),
  };
}

/**
 * Bülten aboneliği. Tablo RLS ile kapalı ve hiçbir anon/authenticated grant'i
 * yok, bu yüzden tüm okuma ve yazma secret key istemcisiyle yapılır.
 *
 * Her dal aynı `onay_bekleniyor` mesajına çıkar: form, bir adresin listede olup
 * olmadığını sızdıracak farklı bir yanıt üretmez.
 */
export async function subscribeToNewsletter(formData: FormData) {
  const emailValue = formData.get("email");
  const email = typeof emailValue === "string" ? emailValue.trim() : "";
  if (!emailSchema.safeParse(email).success) {
    redirect("/bulten?durum=gecersiz_eposta");
  }

  // Ayrı bülten rızası: kutunun önceden işaretli olmaması ve zorunlu olması,
  // rızanın hesap girişinden bağımsız biçimde alınmasını sağlar.
  if (formData.get("onay") !== "evet") {
    redirect("/bulten?durum=onay_gerekli");
  }

  if (!hasSupabasePublicConfig()) {
    redirect("/bulten?durum=yapilandirilmadi");
  }

  const normalized = email.toLowerCase();
  const admin = createAdminClient();

  const { data: existing, error: lookupError } = await admin
    .from("newsletter_subscriptions")
    .select("id, status, updated_at")
    .eq("email_normalized", normalized)
    .maybeSingle();

  if (lookupError) redirect("/bulten?durum=gonderilemedi");

  // Oturum açmış okurun aboneliği profiline bağlanır.
  let profileId: string | null = null;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (typeof claimsData?.claims?.sub === "string") profileId = claimsData.claims.sub;

  if (existing?.status === "CONFIRMED") {
    // Zaten abone; yeni jeton üretmeyiz ama yanıt değişmez.
    redirect("/bulten?durum=onay_bekleniyor");
  }

  const isCoolingDown =
    existing?.status === "PENDING" &&
    Date.now() - new Date(existing.updated_at).getTime() < RESEND_COOLDOWN_MS;

  if (isCoolingDown) {
    redirect("/bulten?durum=onay_bekleniyor");
  }

  const confirmationToken = createToken();
  // Ayrılma jetonu PENDING satırı her yazıldığında tazelenir. Özet saklandığı
  // için eski ham değer zaten geri okunamaz; tazelemek, gönderdiğimiz onay
  // e-postasının ayrılma başlığının her zaman geçerli olmasını garantiler.
  // CONFIRMED satırlar yeniden yazılmadığından yayındaki jeton sabit kalır.
  const unsubscribeToken = createToken();

  const payload = {
    email,
    status: "PENDING" as const,
    profile_id: profileId,
    consented_at: new Date().toISOString(),
    unsubscribed_at: null,
    confirmation_token_digest: digestToken(confirmationToken),
    unsubscribe_token_digest: digestToken(unsubscribeToken),
  };

  const { error: writeError } = existing
    ? await admin.from("newsletter_subscriptions").update(payload).eq("id", existing.id)
    : await admin.from("newsletter_subscriptions").insert(payload);

  if (writeError) redirect("/bulten?durum=gonderilemedi");

  const { confirmUrl, unsubscribeUrl } = newsletterLinks(confirmationToken, unsubscribeToken);

  const { subject, html, text } = confirmationEmail(confirmUrl, unsubscribeUrl);
  const result = await sendEmail({ to: email, subject, html, text, unsubscribeUrl });

  if (!result.sent) {
    if (!hasResendConfig()) {
      // Yerel geliştirme: anahtar yokken akış kırılmasın diye bağlantı sunucu
      // günlüğüne yazılır.
      console.info(`[bülten] Onay bağlantısı (${email}): ${confirmUrl}`);
    } else {
      redirect("/bulten?durum=gonderilemedi");
    }
  }

  redirect("/bulten?durum=onay_bekleniyor");
}
