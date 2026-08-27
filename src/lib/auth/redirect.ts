const fallbackOrigin = "https://egenin-nabzi.invalid";

export const authRedirectCookie = "egenin-nabzi-auth-next";

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

  return undefined;
}
