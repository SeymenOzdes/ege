import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

export type SubscriptionStatus = Database["public"]["Enums"]["newsletter_subscription_status"];

export const subscriptionStatuses: SubscriptionStatus[] = ["PENDING", "CONFIRMED", "UNSUBSCRIBED"];

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  PENDING: "Onay bekliyor",
  CONFIRMED: "Onaylandı",
  UNSUBSCRIBED: "Ayrıldı",
};

export function parseSubscriptionStatus(value: unknown): SubscriptionStatus | undefined {
  return subscriptionStatuses.find((status) => status === value);
}

export type SubscriberRow = {
  id: string;
  email: string;
  status: SubscriptionStatus;
  consentedAt: string;
  confirmedAt: string | null;
  unsubscribedAt: string | null;
};

export type SubscriberList = {
  subscribers: SubscriberRow[];
  counts: Record<SubscriptionStatus, number>;
  total: number;
  loadError: boolean;
};

const emptyCounts: Record<SubscriptionStatus, number> = {
  PENDING: 0,
  CONFIRMED: 0,
  UNSUBSCRIBED: 0,
};

const emptyList: SubscriberList = {
  subscribers: [],
  counts: emptyCounts,
  total: 0,
  loadError: false,
};

/**
 * Abone listesi. `newsletter_subscriptions` politikasız ve grant'siz olduğundan
 * okuma da secret key ile yapılır — bu yüzden sayfa `requireAdminRoute()` ile
 * korunur, personel yetkisi tek başına yeterli değildir.
 *
 * Arama ve panel adaptörleri gibi hiçbir zaman fırlatmaz.
 */
export async function getSubscribers(status?: SubscriptionStatus): Promise<SubscriberList> {
  if (!hasSupabasePublicConfig()) return { ...emptyList, loadError: true };

  const admin = createAdminClient();
  const listQuery = admin
    .from("newsletter_subscriptions")
    .select("id, email, status, consented_at, confirmed_at, unsubscribed_at")
    .order("created_at", { ascending: false })
    .limit(100);

  // Durum sayıları satır çekilerek değil `count: "exact"` ile alınıyor:
  // PostgREST bir yanıtta en fazla `max_rows` satır döndürür (barındırılan
  // Supabase'de 1000) ve bunu hata olarak bildirmez — satırları sayan bir
  // sürüm, abone sayısı o eşiği aştığı gün sessizce yanlış rakam gösterirdi.
  const [listResult, countResults] = await Promise.all([
    status ? listQuery.eq("status", status) : listQuery,
    Promise.all(
      subscriptionStatuses.map((value) =>
        admin
          .from("newsletter_subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", value),
      ),
    ),
  ]);

  if (listResult.error || countResults.some((result) => result.error)) {
    return { ...emptyList, loadError: true };
  }

  const counts = { ...emptyCounts };
  subscriptionStatuses.forEach((value, index) => {
    counts[value] = countResults[index]?.count ?? 0;
  });
  const total = subscriptionStatuses.reduce((sum, value) => sum + counts[value], 0);

  return {
    subscribers: (listResult.data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      status: row.status,
      consentedAt: row.consented_at,
      confirmedAt: row.confirmed_at,
      unsubscribedAt: row.unsubscribed_at,
    })),
    counts,
    total,
    loadError: false,
  };
}
