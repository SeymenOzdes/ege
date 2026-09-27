/**
 * Kurumsal sayfalarda (künye, gizlilik, iletişim…) geçen işletmeci bilgileri.
 *
 * Aynı unvan, adres ve KEP adresi birden çok sayfada tekrarlandığı için hepsi
 * buradan okunuyor; birini güncelleyip ötekini unutmak mümkün olmasın.
 *
 * DİKKAT: Şirket, kişi, sicil ve iletişim bilgileri ÖRNEKTİR (satış öncesi demo
 * için mantıklı değerlerle dolduruldu). Yayına almadan önce gerçek kayıtlarla
 * değiştirilmeli. Hizmet sağlayıcı unvan ve adresleri ise sağlayıcıların kendi
 * hukuki metinlerinden alındı. Döküm: `docs/kurumsal-sayfa-bilgileri.md`.
 */
export const corporateInfo = {
  legalName: "Ege'nin Nabzı Medya ve Yayıncılık A.Ş.",
  address: "Alsancak Mah. 1452 Sok. No: 12 Kat: 3, 35220 Konak / İzmir",
  tradeRegistry: "İzmir Ticaret Sicili Müdürlüğü — 245817",
  mersis: "0385 0921 4460 0001",
  taxOffice: "Kordon Vergi Dairesi — 385 092 1446",
  kep: "egeninnabzimedya@hs01.kep.tr",
  hours: "Hafta içi 09.00 – 18.00 (haber masası 7/24 açıktır)",

  editor: { name: "Deniz Aydın", email: "deniz.aydin@egeninnabzi.com" },
  deputyEditor: "Ece Yılmaz",

  email: {
    general: "iletisim@egeninnabzi.com",
    newsroom: "haber@egeninnabzi.com",
    corrections: "duzeltme@egeninnabzi.com",
    ads: "reklam@egeninnabzi.com",
    kvkk: "kvkk@egeninnabzi.com",
  },
  phone: {
    general: "+90 232 464 27 00",
    newsroom: "+90 232 464 27 01",
    corrections: "+90 232 464 27 02",
    ads: "+90 232 464 27 10",
  },

  providers: {
    hosting: {
      name: "Vercel Inc.",
      address: "440 N Barranca Avenue #4133, Covina, CA 91723",
      country: "ABD",
    },
    database: {
      name: "Supabase Pte. Ltd.",
      address: "65 Chulia Street #38-02/03, OCBC Centre, Singapur 049513",
      country: "Singapur",
      region: "Frankfurt, Almanya (AB — eu-central-1)",
    },
    email: {
      name: "Plus Five Five, Inc. (Resend)",
      address: "2261 Market Street #5039, San Francisco, CA 94114",
      country: "ABD",
    },
  },

  /** Kurumsal metinlerin hepsi aynı gün yürürlüğe girdi. */
  effectiveDate: "27.09.2026",
} as const;

export function telHref(phone: string) {
  return `tel:${phone.replace(/\s/g, "")}`;
}
