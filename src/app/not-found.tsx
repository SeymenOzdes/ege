import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="public-site">
      <section className="statePanel" role="status">
        <p className="eyebrow">Haber bulunamadı</p>
        <h1 className="font-editorial">Aradığınız hikâye burada değil.</h1>
        <p>Bağlantı değişmiş veya haber yayından kaldırılmış olabilir.</p>
        <Link className="button button-primary" href="/">
          Ana sayfaya dön
        </Link>
      </section>
    </main>
  );
}
