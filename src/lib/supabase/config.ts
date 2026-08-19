import { z } from "zod";
import { env } from "@/lib/env";

const publicSupabaseSchema = z.object({
  url: z.url("NEXT_PUBLIC_SUPABASE_URL geçerli bir URL olmalıdır."),
  publishableKey: z.string().min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY zorunludur."),
});

export function getSupabasePublicConfig() {
  return publicSupabaseSchema.parse({
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}

/** Use only from server-only code when a privileged operation is genuinely required. */
export function getSupabaseSecretKey() {
  return z
    .string()
    .min(1, "SUPABASE_SECRET_KEY yalnızca sunucu işlemleri için zorunludur.")
    .parse(process.env.SUPABASE_SECRET_KEY);
}
