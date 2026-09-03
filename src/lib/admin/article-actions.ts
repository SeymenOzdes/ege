"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { toBodyText } from "@/lib/admin/article-body";
import {
  articleFormSchema,
  articleStatusLabels,
  canTransition,
  getFirstIssueMessage,
  parseArticleStatus,
  readArticleForm,
  type ArticleFormValues,
  type ArticleStatus,
} from "@/lib/admin/article-schema";
import { parseArticleBody } from "@/lib/articles";
import { getUserRole, isStaffRole } from "@/lib/auth/roles";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasSupabasePublicConfig } from "@/lib/supabase/config";
import type { Json } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";

export type ArticleActionState = { error?: string; success?: string };

type StaffClient = Awaited<ReturnType<typeof createClient>>;
type StaffContext = { supabase: StaffClient; userId: string };

/** PostgREST'in tekil kısıt ihlali kodu (`articles_slug_key`, `redirects_from_path_key`). */
const UNIQUE_VIOLATION = "23505";

/**
 * Eylemin çağıranı. Her sunucu eylemi kendi yetkisini yeniden doğruluyor:
 * `/yonetim` düzeninin kapıyı tutması bir güvenlik sınırı değil, eylem POST
 * olarak doğrudan çağrılabilir.
 */
async function getStaffContext(): Promise<StaffContext | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const role = error ? undefined : getUserRole(data?.claims);
  const userId = data?.claims?.sub;

  if (!isStaffRole(role) || typeof userId !== "string") return undefined;
  return { supabase, userId };
}

/** Kaydedilen haberin yayın yüzeylerinde göründüğü yollar. */
type ArticleSurfaces = {
  slug: string;
  previousSlug?: string | null;
  topicSlug?: string | null;
  authorSlug?: string | null;
};

/**
 * Faz 2'de ISR'a alınan sayfalar bir dahaki aralığı beklemeden tazelensin diye.
 *
 * Bugün yalnızca `/`, `/haber/<slug>`, `/feed.xml` ve `/sitemap.xml` önbelleğe
 * alınıyor; `/son-dakika`, `/kategori/<slug>` ve `/yazar/<slug>` istek zamanlı
 * olduğu için çağrı onlarda işlemsiz kalıyor. Yine de yazılıyorlar: Faz 2'de
 * not edilen "sayfalamayı yol parçasına taşı" işi yapıldığında o rotalar da
 * önbelleğe girecek ve burayı yeniden hatırlamak gerekmesin.
 */
function revalidateArticleSurfaces({ slug, previousSlug, topicSlug, authorSlug }: ArticleSurfaces) {
  revalidatePath("/");
  revalidatePath("/son-dakika");
  revalidatePath(`/haber/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/haber/${previousSlug}`);
  if (topicSlug) revalidatePath(`/kategori/${topicSlug}`);
  if (authorSlug) revalidatePath(`/yazar/${authorSlug}`);
  revalidatePath("/feed.xml");
  revalidatePath("/sitemap.xml");
  revalidatePath("/yonetim/haberler");
}

/**
 * Sürüm anlık görüntüsü.
 *
 * `created_by` mutlaka `auth.uid()` olmalı — `article_revisions_staff_insert`
 * bunu şart koşuyor. Numara "mevcut en yüksek + 1"; iki editör aynı anda
 * kaydederse tekil kısıt ikinciyi reddeder ve sürüm yazılmaz. Kaydın kendisi
 * çoktan başarılı olduğu için bu sessizce geçiliyor: anlık görüntü izleme
 * kaydıdır, kaydetmenin koşulu değil.
 */
async function recordRevision(
  { supabase, userId }: StaffContext,
  articleId: string,
  snapshot: Json,
) {
  const { data } = await supabase
    .from("article_revisions")
    .select("revision_number")
    .eq("article_id", articleId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("article_revisions").insert({
    article_id: articleId,
    revision_number: (data?.revision_number ?? 0) + 1,
    snapshot,
    created_by: userId,
  });
}

/**
 * Denetim kaydı.
 *
 * `audit_logs` üzerinde RLS açık ama tek bir politika ve `authenticated`
 * grant'i yok, dolayısıyla normal istemci buraya yazamaz. `subscribers.ts` ile
 * aynı gerekçeyle secret key kullanılıyor; yazılan alanların hepsi sunucuda
 * üretiliyor, istemciden gelen tek şey haberin kimliği.
 */
async function recordAudit(actorId: string, action: string, targetId: string, metadata: Json) {
  await createAdminClient().from("audit_logs").insert({
    actor_id: actorId,
    action,
    target_table: "articles",
    target_id: targetId,
    metadata,
  });
}

/** Formdaki ilişkileri ve gövdeyi `articles` sütunlarına çevirir. */
function toArticleColumns(values: ArticleFormValues) {
  return {
    title: values.title,
    slug: values.slug,
    summary: values.summary,
    body: values.blocks,
    body_text: toBodyText(values.blocks),
    article_type: values.articleType,
    author_id: values.authorId,
    topic_id: values.topicId,
    location_id: values.locationId,
    hero_media_id: values.heroMediaId,
    social_media_id: values.socialMediaId,
    seo_title: values.seoTitle,
    seo_description: values.seoDescription,
    is_breaking: values.isBreaking,
    breaking_expires_at: values.breakingExpiresAt,
    scheduled_at: values.scheduledAt,
  };
}

export async function createArticle(formData: FormData): Promise<ArticleActionState> {
  if (!hasSupabasePublicConfig()) return { error: "Supabase bağlantısı yapılandırılmadı." };

  const staff = await getStaffContext();
  if (!staff) return { error: "Bu işlem için editoryal yetki gerekiyor." };

  const parsed = articleFormSchema.safeParse(readArticleForm(formData));
  if (!parsed.success) return { error: getFirstIssueMessage(parsed.error) };

  const columns = toArticleColumns(parsed.data);
  const { data, error } = await staff.supabase
    .from("articles")
    .insert({
      ...columns,
      status: "DRAFT",
      created_by: staff.userId,
      updated_by: staff.userId,
    })
    .select("id, slug, topic:topics(slug), author:authors(slug)")
    .single();

  if (error || !data) {
    return {
      error:
        error?.code === UNIQUE_VIOLATION
          ? "Bu adres başka bir haberde kullanılıyor. Farklı bir adres yazın."
          : "Haber oluşturulamadı. Alanları kontrol edip tekrar deneyin.",
    };
  }

  await recordRevision(staff, data.id, { ...columns, status: "DRAFT" });
  await recordAudit(staff.userId, "article.create", data.id, { slug: data.slug });

  revalidateArticleSurfaces({
    slug: data.slug,
    topicSlug: data.topic?.slug,
    authorSlug: data.author?.slug,
  });

  // Taslak artık kimliğiyle var; editör aynı formda düzenlemeye devam etsin.
  redirect(`/yonetim/haberler/${data.id}?bilgi=olusturuldu`);
}

export async function updateArticle(formData: FormData): Promise<ArticleActionState> {
  if (!hasSupabasePublicConfig()) return { error: "Supabase bağlantısı yapılandırılmadı." };

  const staff = await getStaffContext();
  if (!staff) return { error: "Bu işlem için editoryal yetki gerekiyor." };

  const articleId = z.uuid().safeParse(formData.get("articleId"));
  if (!articleId.success) return { error: "Haber bulunamadı." };

  const parsed = articleFormSchema.safeParse(readArticleForm(formData));
  if (!parsed.success) return { error: getFirstIssueMessage(parsed.error) };

  const { data: current } = await staff.supabase
    .from("articles")
    .select("id, slug, status, published_at")
    .eq("id", articleId.data)
    .maybeSingle();

  if (!current) return { error: "Haber bulunamadı." };

  const columns = toArticleColumns(parsed.data);
  const { data, error } = await staff.supabase
    .from("articles")
    .update({ ...columns, updated_by: staff.userId })
    .eq("id", current.id)
    .select("id, slug, status, topic:topics(slug), author:authors(slug)")
    .single();

  if (error || !data) {
    return {
      error:
        error?.code === UNIQUE_VIOLATION
          ? "Bu adres başka bir haberde kullanılıyor. Farklı bir adres yazın."
          : "Haber kaydedilemedi. Alanları kontrol edip tekrar deneyin.",
    };
  }

  const slugChanged = current.slug !== data.slug;
  if (slugChanged && current.published_at) {
    await recordSlugRedirect(staff, current.id, current.slug, data.slug);
  }

  await recordRevision(staff, current.id, { ...columns, status: data.status });
  await recordAudit(staff.userId, "article.update", current.id, {
    slug: data.slug,
    previous_slug: slugChanged ? current.slug : null,
  });

  revalidateArticleSurfaces({
    slug: data.slug,
    previousSlug: current.slug,
    topicSlug: data.topic?.slug,
    authorSlug: data.author?.slug,
  });
  revalidatePath(`/yonetim/haberler/${current.id}`);

  return { success: "Haber kaydedildi." };
}

/**
 * Adresi değişen yayımlanmış bir haber için yönlendirme.
 *
 * Yalnızca bir kez yayımlanmış haberler için çağrılıyor: hiç yayımlanmamış bir
 * taslağın eski adresini kimse görmedi. Yeni adrese işaret eden eski bir kayıt
 * varsa siliniyor — adres A → B → A yapıldığında `/haber/A` hem haberin kendi
 * adresi hem de bir yönlendirmenin kaynağı olurdu.
 */
async function recordSlugRedirect(
  { supabase }: StaffContext,
  articleId: string,
  previousSlug: string,
  nextSlug: string,
) {
  await supabase.from("redirects").delete().eq("from_path", `/haber/${nextSlug}`);
  await supabase.from("redirects").upsert(
    {
      from_path: `/haber/${previousSlug}`,
      to_path: `/haber/${nextSlug}`,
      target_article_id: articleId,
      status_code: 308,
    },
    { onConflict: "from_path" },
  );
}

/** Hedef duruma göre `articles` üzerinde değişen zaman damgaları. */
function toStatusColumns(target: ArticleStatus, publishedAt: string | null) {
  const now = new Date().toISOString();

  if (target === "PUBLISHED") {
    // İlk yayında tarih şimdi; arşivden dönen bir haber ilk yayın tarihini korur.
    return {
      status: target,
      published_at: publishedAt ?? now,
      scheduled_at: null,
      archived_at: null,
    };
  }

  if (target === "ARCHIVED") return { status: target, archived_at: now };
  if (target === "DRAFT") return { status: target, archived_at: null };

  return { status: target };
}

export async function transitionArticle(
  articleId: string,
  targetStatus: string,
): Promise<ArticleActionState> {
  if (!hasSupabasePublicConfig()) return { error: "Supabase bağlantısı yapılandırılmadı." };

  const staff = await getStaffContext();
  if (!staff) return { error: "Bu işlem için editoryal yetki gerekiyor." };

  const id = z.uuid().safeParse(articleId);
  const target = parseArticleStatus(targetStatus);
  if (!id.success || !target) return { error: "Geçersiz durum değişikliği." };

  const { data: current } = await staff.supabase
    .from("articles")
    .select("id, slug, status, body, published_at, scheduled_at")
    .eq("id", id.data)
    .maybeSingle();

  if (!current) return { error: "Haber bulunamadı." };

  if (!canTransition(current.status, target)) {
    return {
      error: `${articleStatusLabels[current.status]} durumundan ${articleStatusLabels[target]} durumuna geçilemez.`,
    };
  }

  if (target === "PUBLISHED" && parseArticleBody(current.body).length === 0) {
    return { error: "Gövdesi boş bir haber yayımlanamaz." };
  }

  if (target === "SCHEDULED") {
    const scheduledAt = current.scheduled_at ? new Date(current.scheduled_at) : undefined;
    if (!scheduledAt || Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
      return { error: "Zamanlamak için ileri bir yayın tarihi kaydedin." };
    }
  }

  const { data, error } = await staff.supabase
    .from("articles")
    .update({ ...toStatusColumns(target, current.published_at), updated_by: staff.userId })
    .eq("id", current.id)
    .select("id, slug, status, topic:topics(slug), author:authors(slug)")
    .single();

  if (error || !data) return { error: "Durum güncellenemedi. Tekrar deneyin." };

  // Durum değişikliği içeriğe dokunmuyor, bu yüzden sürüm anlık görüntüsü
  // yazılmıyor; iz `audit_logs`'ta duruyor.
  await recordAudit(staff.userId, "article.transition", current.id, {
    from: current.status,
    to: target,
    slug: data.slug,
  });

  revalidateArticleSurfaces({
    slug: data.slug,
    topicSlug: data.topic?.slug,
    authorSlug: data.author?.slug,
  });
  revalidatePath(`/yonetim/haberler/${current.id}`);

  return { success: `Durum "${articleStatusLabels[target]}" olarak güncellendi.` };
}
