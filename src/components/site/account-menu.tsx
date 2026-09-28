"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { UserMenu } from "@/components/site/user-menu";
import { ACCOUNT_CHIP_WIDTH_KEY } from "@/lib/account-chip-width";
import { signOut } from "@/lib/auth/actions";
import { useCurrentUser } from "@/lib/auth/use-current-user";

/**
 * The header's account area, wired to the browser-resolved session.
 *
 * `UserMenu` stays presentational and prop-driven so it keeps its own unit tests;
 * this component owns the only thing that has to run client-side — reading the
 * session, which the server layout can no longer do without forcing every public
 * page to render per request.
 */
export function AccountMenu() {
  const { resolved, user } = useCurrentUser();
  const slot = useRef<HTMLSpanElement>(null);

  // Remember how wide the settled chip is; `accountChipWidthScript` applies it to the
  // placeholder before first paint, so the search button beside it never shifts.
  useLayoutEffect(() => {
    if (!resolved || !slot.current) return;
    const element = slot.current;
    const save = () => {
      try {
        localStorage.setItem(ACCOUNT_CHIP_WIDTH_KEY, String(element.offsetWidth));
      } catch {}
    };
    save();
    // The web font can land after the chip does and change the name's width.
    void document.fonts?.ready.then(save);
  }, [resolved, user]);

  // Until the session settles, hold the chip's space without committing to either
  // state; otherwise a signed-in reader sees "Giriş" flash before their avatar.
  if (!resolved) return <span aria-hidden="true" className="login-action account-pending" />;

  return (
    <span className="account-slot" ref={slot}>
      <UserMenu user={user} />
    </span>
  );
}

/**
 * The account entries of the mobile menu. Unresolved and anonymous look the same
 * here: a signed-out reader's only account action is signing in.
 */
export function MobileAccountLinks() {
  const { user } = useCurrentUser();

  if (!user) return <Link href="/giris">Giriş</Link>;

  return (
    <>
      <Link href="/kaydedilenler">Kaydedilenler</Link>
      <form action={signOut}>
        <button className="mobile-signout" type="submit">
          Çıkış yap
        </button>
      </form>
    </>
  );
}
