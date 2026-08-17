import { env } from "@/lib/env";

export const siteConfig = {
  name: env.NEXT_PUBLIC_SITE_NAME,
  description: "Ege Bölgesi'nden güvenilir ve seçilmiş haberler.",
  locale: "tr_TR",
  url: env.NEXT_PUBLIC_APP_URL,
} as const;
