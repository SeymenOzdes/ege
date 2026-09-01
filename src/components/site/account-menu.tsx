"use client";

import Link from "next/link";
import { UserMenu } from "@/components/site/user-menu";
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
  const { user } = useCurrentUser();
  return <UserMenu user={user} />;
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
