import { z } from "zod";

/**
 * Sunucuya özel e-posta ayarları. `src/lib/env.ts` istemci paketine girdiği için
 * bu değerler oraya konmaz; `getSupabaseSecretKey()` ile aynı model: çağrı
 * anında okunur ve doğrulanır.
 */
export function hasResendConfig(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NEWSLETTER_FROM_EMAIL);
}

export function getResendApiKey(): string {
  return z
    .string()
    .min(1, "RESEND_API_KEY yalnızca sunucu tarafında e-posta göndermek için zorunludur.")
    .parse(process.env.RESEND_API_KEY);
}

export function getNewsletterFromAddress(): string {
  return z
    .string()
    .min(1, "NEWSLETTER_FROM_EMAIL zorunludur.")
    .parse(process.env.NEWSLETTER_FROM_EMAIL);
}
