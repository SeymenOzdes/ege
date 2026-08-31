import "server-only";

import { getNewsletterFromAddress, getResendApiKey, hasResendConfig } from "@/lib/email/config";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** RFC 8058 tek tıkla ayrılma başlıkları için ayrılma bağlantısı. */
  unsubscribeUrl?: string;
};

export type SendEmailResult = { sent: true } | { sent: false; skipped: boolean };

/**
 * Resend'e ince bir sarmalayıcı. Bilerek bağımlılık eklemiyoruz: proje toast ve
 * form kütüphanelerini de aynı gerekçeyle dışarıda tutuyor.
 *
 * Hiçbir zaman fırlatmaz. Anahtar yoksa `skipped` döner ve çağıran taraf
 * geliştirme ortamında bağlantıyı konsola yazabilir.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!hasResendConfig()) return { sent: false, skipped: true };

  // RFC 8058: List-Unsubscribe-Post yalnızca List-Unsubscribe ile birlikte anlamlıdır.
  const headers: Record<string, string> = input.unsubscribeUrl
    ? {
        "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      }
    : {};

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getResendApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getNewsletterFromAddress(),
        to: [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.text ? { text: input.text } : {}),
        ...(Object.keys(headers).length > 0 ? { headers } : {}),
      }),
    });

    return response.ok ? { sent: true } : { sent: false, skipped: false };
  } catch {
    // Ağ hatası aboneliği geri almaz; çağıran taraf kullanıcıya tekrar deneme önerir.
    return { sent: false, skipped: false };
  }
}
