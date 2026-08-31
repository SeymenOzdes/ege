import { siteConfig } from "@/lib/site";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const shell = (heading: string, body: string) => `<!doctype html>
<html lang="tr">
  <body style="margin:0;padding:32px 16px;background:#f6f1e8;font-family:-apple-system,Segoe UI,sans-serif;color:#0d1b2a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:24px;padding:32px;">
      <tr><td>
        <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0c7c86;">${escapeHtml(siteConfig.name)}</p>
        <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;line-height:1.25;">${heading}</h1>
        ${body}
      </td></tr>
    </table>
  </body>
</html>`;

const button = (href: string, label: string) =>
  `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:#0d1b2a;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:999px;font-weight:600;">${label}</a></p>`;

const fallback = (href: string) =>
  `<p style="margin:16px 0 0;font-size:13px;color:#52606d;">Düğme çalışmazsa bu bağlantıyı tarayıcınıza yapıştırın:<br /><span style="word-break:break-all;">${escapeHtml(href)}</span></p>`;

/** Çift onaylı abonelikte gönderilen tek e-posta. */
export function confirmationEmail(confirmUrl: string, unsubscribeUrl: string) {
  return {
    subject: `${siteConfig.name} bültenine katılımınızı onaylayın`,
    html: shell(
      "Aboneliğinizi onaylayın",
      `<p style="margin:0;line-height:1.6;color:#52606d;">Haftada bir kez Ege'den seçilmiş haberler, kültür rotaları ve yerel yaşam notları göndereceğiz. Aboneliğinizi başlatmak için aşağıdaki bağlantıya tıklayın.</p>
       ${button(confirmUrl, "Aboneliğimi onayla")}
       <p style="margin:0;font-size:13px;color:#52606d;">Bu isteği siz yapmadıysanız hiçbir şey yapmanıza gerek yok; onaylanmayan adreslere e-posta göndermiyoruz.</p>
       ${fallback(confirmUrl)}`,
    ),
    text: `Aboneliğinizi onaylayın: ${confirmUrl}\n\nBu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.\nAyrılmak için: ${unsubscribeUrl}`,
  };
}
