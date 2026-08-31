export type Notice = { tone: "success" | "error"; text: string };

/**
 * Bülten akışındaki her `durum` kodunun Türkçe karşılığı.
 *
 * `onay_bekleniyor` bilerek tek ve değişmez bir metindir: yeni kayıt, bekleyen
 * kayıt ve zaten onaylanmış kayıt aynı yanıtı alır, böylece form bir adresin
 * listede olup olmadığını sızdırmaz.
 */
export function newsletterNotice(code: string | undefined): Notice | undefined {
  switch (code) {
    case "onay_bekleniyor":
      return {
        tone: "success",
        text: "Son bir adım kaldı: e-posta adresinize gönderdiğimiz onay bağlantısına tıklayın.",
      };
    case "onaylandi":
      return {
        tone: "success",
        text: "Aboneliğiniz onaylandı. Ege mektubu artık gelen kutunuzda.",
      };
    case "ayrildi":
      return {
        tone: "success",
        text: "Bülten aboneliğiniz sonlandırıldı. Dilediğiniz zaman yeniden katılabilirsiniz.",
      };
    case "gecersiz":
      return {
        tone: "error",
        text: "Bu bağlantı geçersiz veya daha önce kullanılmış. Adresinizi yeniden girerek yeni bir onay bağlantısı isteyin.",
      };
    case "gecersiz_eposta":
      return { tone: "error", text: "Geçerli bir e-posta adresi girin." };
    case "onay_gerekli":
      return { tone: "error", text: "Devam etmek için bülten onay kutusunu işaretleyin." };
    case "gonderilemedi":
      return {
        tone: "error",
        text: "Onay e-postası gönderilemedi. Lütfen birkaç dakika sonra yeniden deneyin.",
      };
    case "yapilandirilmadi":
      return {
        tone: "error",
        text: "Bülten servisi henüz yapılandırılmadı. Lütfen daha sonra tekrar deneyin.",
      };
    default:
      return undefined;
  }
}
