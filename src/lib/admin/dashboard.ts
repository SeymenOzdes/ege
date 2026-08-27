import "server-only";

import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AdminDashboard = {
  counts: { drafts: number; reviews: number; scheduled: number; published: number };
  recentPublications: Array<{
    id: string;
    title: string;
    slug: string;
    publishedAt: string | null;
    updatedAt: string;
    isBreaking: boolean;
  }>;
  loadError: boolean;
};

const emptyDashboard: AdminDashboard = {
  counts: { drafts: 0, reviews: 0, scheduled: 0, published: 0 },
  recentPublications: [],
  loadError: false,
};

export async function getAdminDashboard(): Promise<AdminDashboard> {
  if (!hasSupabasePublicConfig()) return emptyDashboard;

  const supabase = await createClient();
  const [drafts, reviews, scheduled, published, recentPublications] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "DRAFT"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "IN_REVIEW"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "SCHEDULED"),
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED"),
    supabase
      .from("articles")
      .select("id, title, slug, published_at, updated_at, is_breaking")
      .eq("status", "PUBLISHED")
      .order("published_at", { ascending: false })
      .limit(5),
  ]);

  if ([drafts, reviews, scheduled, published, recentPublications].some((result) => result.error)) {
    return { ...emptyDashboard, loadError: true };
  }

  return {
    counts: {
      drafts: drafts.count ?? 0,
      reviews: reviews.count ?? 0,
      scheduled: scheduled.count ?? 0,
      published: published.count ?? 0,
    },
    recentPublications: (recentPublications.data ?? []).map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      isBreaking: article.is_breaking,
    })),
    loadError: false,
  };
}
