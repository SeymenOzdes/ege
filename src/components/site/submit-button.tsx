"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  /** Gönderim sürerken düğmede görünen metin. */
  pendingLabel: string;
  className?: string;
};

/**
 * Gönderim sürerken düğmeyi kilitleyen submit düğmesi. Google akışı önce bir
 * sunucu eylemi çalıştırıp ardından Google'a tam sayfa yönlendirme yapıyor;
 * arada geri bildirim olmazsa okur düğmeye ikinci kez basıyor. Magic-link
 * tarafında bu, aynı adrese iki ayrı e-posta demek.
 *
 * İstemci bileşenidir ama form ilerici zenginleştirme ile çalışır: JavaScript
 * yüklenmeden de gönderim yapılır, yalnızca bekleme durumu görünmez.
 */
export function SubmitButton({ children, pendingLabel, className = "" }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button aria-busy={pending} className={className} disabled={pending} type="submit">
      {pending ? pendingLabel : children}
    </button>
  );
}
