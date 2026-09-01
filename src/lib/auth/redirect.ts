const fallbackOrigin = "https://egenin-nabzi.invalid";

export const authRedirectCookie = "egenin-nabzi-auth-next";

/**
 * Giriş yapmamış okurun kaydetmek istediği haberin slug'ı. `/auth/confirm`
 * oturumu kurduktan sonra bu çerezi tüketip kaydı oluşturur, böylece okur
 * aynı işlemi ikinci kez yapmak zorunda kalmaz.
 */
export const pendingBookmarkCookie = "egenin-nabzi-pending-bookmark";

/** İki yönlendirme çerezi de aynı ömrü ve kapsamı paylaşır. */
export const authCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 15,
  path: "/",
} as const;

export function getSafeRedirectPath(value: unknown, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("//") || decoded.includes("\\")) return fallback;

    const target = new URL(value, fallbackOrigin);
    if (target.origin !== fallbackOrigin) return fallback;

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

export function loginNotice(error: string | undefined, sent: string | undefined) {
  if (sent === "1") {
    return { tone: "success" as const, text: "Giriş bağlantısı e-posta adresinize gönderildi." };
  }

  if (error === "invalid_email") {
    return { tone: "error" as const, text: "Geçerli bir e-posta adresi girin." };
  }

  if (error === "link_invalid") {
    return { tone: "error" as const, text: "Bu giriş bağlantısı geçersiz veya süresi dolmuş." };
  }

  if (error === "dev_login_failed") {
    return {
      tone: "error" as const,
      text: "Yerel geliştirme girişi başarısız oldu. `pnpm supabase:reset` ile seed'i yenileyip tekrar deneyin.",
    };
  }

  if (error === "not_configured") {
    return {
      tone: "error" as const,
      text: "Giriş servisi henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin.",
    };
  }

  if (error === "send_failed") {
    return {
      tone: "error" as const,
      text: "Giriş bağlantısı gönderilemedi. Lütfen birkaç dakika sonra yeniden deneyin.",
    };
  }

  if (error === "google_failed") {
    return {
      tone: "error" as const,
      text: "Google ile giriş tamamlanamadı. Lütfen tekrar deneyin veya e-posta bağlantısını kullanın.",
    };
  }

  return undefined;
}
