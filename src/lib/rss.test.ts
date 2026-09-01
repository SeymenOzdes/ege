import { describe, expect, it } from "vitest";
import { buildRssFeed, escapeXml, toRfc822, type RssChannel } from "@/lib/rss";

const channel: RssChannel = {
  title: "Ege'nin Nabzı",
  link: "https://ornek.test",
  description: "Ege Bölgesi'nden haberler.",
  selfLink: "https://ornek.test/feed.xml",
  items: [],
};

describe("escapeXml", () => {
  it("beş XML özel karakterini kaçırır", () => {
    expect(escapeXml(`& < > " '`)).toBe("&amp; &lt; &gt; &quot; &apos;");
  });

  it("bir kez kaçırır, kaçırılmışı tekrar kaçırmaz", () => {
    // Sırayla `replace` çağrılsaydı bu `&amp;lt;` olurdu.
    expect(escapeXml("a & <b>")).toBe("a &amp; &lt;b&gt;");
  });

  it("Türkçe karakterlere dokunmaz", () => {
    expect(escapeXml("İzmir'de ışık, Muğla'da yağış")).toBe(
      "İzmir&apos;de ışık, Muğla&apos;da yağış",
    );
  });

  it("script kapanışını zararsız hâle getirir", () => {
    expect(escapeXml("</item>")).toBe("&lt;/item&gt;");
  });

  it("XML'in kabul etmediği kontrol karakterlerini düşürür", () => {
    expect(escapeXml("bir\u0000iki\u0008üç")).toBe("birikiüç");
  });

  it("sekme ve satır sonunu korur", () => {
    expect(escapeXml("bir\tiki\nüç\r")).toBe("bir\tiki\nüç\r");
  });
});

describe("toRfc822", () => {
  it("ISO tarihini RFC 822 biçimine çevirir", () => {
    expect(toRfc822("2026-08-18T05:37:00.000Z")).toBe("Tue, 18 Aug 2026 05:37:00 GMT");
  });

  it("ay ve gün adlarını yerel ayardan bağımsız olarak İngilizce verir", () => {
    // `tr-TR` ortamında `toLocaleString` "Sal" derdi; besleme bunu kabul etmez.
    expect(toRfc822("2026-01-04T00:00:00.000Z")).toBe("Sun, 04 Jan 2026 00:00:00 GMT");
  });

  it("geçersiz tarih için undefined döner", () => {
    expect(toRfc822("dün")).toBeUndefined();
  });
});

describe("buildRssFeed", () => {
  it("haber yokken bile geçerli bir kanal üretir", () => {
    const feed = buildRssFeed(channel);

    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(feed).toContain("<title>Ege&apos;nin Nabzı</title>");
    expect(feed).toContain('<atom:link href="https://ornek.test/feed.xml" rel="self"');
    expect(feed).toContain("</rss>");
    expect(feed).not.toContain("<item>");
    // Tarih taşıyan haber yok, dolayısıyla lastBuildDate de yazılmamalı.
    expect(feed).not.toContain("<lastBuildDate>");
  });

  it("her haber için bir item ve kalıcı guid yazar", () => {
    const feed = buildRssFeed({
      ...channel,
      items: [
        {
          title: "Körfezde sabah",
          link: "https://ornek.test/haber/korfezde-sabah",
          description: "Kısa özet.",
          publishedAt: "2026-08-18T05:37:00.000Z",
          category: "Gündem",
          author: "Deniz Yılmaz",
        },
      ],
    });

    expect(feed).toContain("<title>Körfezde sabah</title>");
    expect(feed).toContain("<link>https://ornek.test/haber/korfezde-sabah</link>");
    expect(feed).toContain("<category>Gündem</category>");
    expect(feed).toContain("<dc:creator>Deniz Yılmaz</dc:creator>");
    expect(feed).toContain("<pubDate>Tue, 18 Aug 2026 05:37:00 GMT</pubDate>");
    expect(feed).toContain(
      '<guid isPermaLink="true">https://ornek.test/haber/korfezde-sabah</guid>',
    );
  });

  it("boş alanlar için etiket üretmez", () => {
    const feed = buildRssFeed({
      ...channel,
      items: [{ title: "Özetsiz haber", link: "https://ornek.test/haber/ozetsiz" }],
    });

    expect(feed).not.toContain("<description></description>");
    expect(feed).not.toContain("<category>");
    expect(feed).not.toContain("<dc:creator>");
    expect(feed).not.toContain("<pubDate>");
  });

  it("lastBuildDate'i en yeni haberden alır, üretim anından değil", () => {
    const feed = buildRssFeed({
      ...channel,
      items: [
        { title: "Yeni", link: "https://ornek.test/a", publishedAt: "2026-08-18T05:00:00.000Z" },
        { title: "Eski", link: "https://ornek.test/b", publishedAt: "2026-08-01T05:00:00.000Z" },
      ],
    });

    expect(feed).toContain("<lastBuildDate>Tue, 18 Aug 2026 05:00:00 GMT</lastBuildDate>");
  });

  it("başlıktaki XML karakterlerini beslemede kaçırır", () => {
    const feed = buildRssFeed({
      ...channel,
      items: [{ title: "Kâr & zarar <tablo>", link: "https://ornek.test/haber/kar-zarar" }],
    });

    expect(feed).toContain("<title>Kâr &amp; zarar &lt;tablo&gt;</title>");
  });
});
