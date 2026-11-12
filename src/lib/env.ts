import { z } from "zod";

const optionalEnvironmentValue = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const environmentSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().min(1).default("Ege'nin Nabzı"),
  NEXT_PUBLIC_SUPABASE_URL: optionalEnvironmentValue(z.string().url()),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalEnvironmentValue(z.string().min(1)),
  // AdSense: yayıncı kimliği (ca-pub-…) ve her yerleşimin reklam birimi kimliği.
  // Hepsi boşsa AdSense tümüyle kapalıdır: script yüklenmez, onay penceresi çıkmaz.
  NEXT_PUBLIC_ADSENSE_CLIENT: optionalEnvironmentValue(z.string().regex(/^ca-pub-\d{10,20}$/)),
  NEXT_PUBLIC_ADSENSE_SLOT_HOME_LEADER: optionalEnvironmentValue(z.string().regex(/^\d+$/)),
  NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE: optionalEnvironmentValue(z.string().regex(/^\d+$/)),
  NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID: optionalEnvironmentValue(z.string().regex(/^\d+$/)),
  NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END: optionalEnvironmentValue(z.string().regex(/^\d+$/)),
});

export const env = environmentSchema.parse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
  NEXT_PUBLIC_ADSENSE_SLOT_HOME_LEADER: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_LEADER,
  NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE,
  NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_MID,
  NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_END,
});
