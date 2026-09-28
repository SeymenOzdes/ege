import Image from "next/image";
import Link from "next/link";
import { SignOut } from "@phosphor-icons/react/dist/ssr/SignOut";
import { UserCircle } from "@phosphor-icons/react/dist/ssr/UserCircle";
import { signOut } from "@/lib/auth/actions";
import type { CurrentUser } from "@/lib/auth/server";
import { isStaffRole, type UserRole } from "@/lib/auth/roles";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Yönetici",
  EDITOR: "Editör",
  READER: "Okur",
};

const chipIcon = <UserCircle aria-hidden="true" size={21} weight="duotone" />;

// Google hesabıyla gelen okur kendi fotoğrafını görür; diğerleri genel simgeyi.
function avatarFor(user: CurrentUser) {
  if (!user.avatarUrl) return chipIcon;
  return (
    <Image alt="" className="login-avatar" height={26} src={user.avatarUrl} width={26} />
  );
}

// Magic-link signup collects no name, so fall back to the email handle until
// the reader sets a display_name on their profile.
function labelFor(user: CurrentUser) {
  return user.displayName || user.email?.split("@")[0] || roleLabels[user.role];
}

/**
 * Public header account area. Anonymous visitors see the plain login link;
 * verified sessions show their name/email, with sign-out in a hover list. The chip
 * deep-links into the editorial panel for staff and into the reader's saved
 * articles for everyone else.
 */
export function UserMenu({ user }: { user?: CurrentUser }) {
  if (!user) {
    return (
      <Link className="login-action" href="/giris">
        {chipIcon}
        <span>Giriş</span>
      </Link>
    );
  }

  const label = labelFor(user);
  const avatar = avatarFor(user);

  return (
    // Sign-out lives in a list that opens on hover, and on focus for keyboard users.
    <div className="account-menu">
      {isStaffRole(user.role) ? (
        <Link
          className="login-action"
          href="/yonetim"
          title={`${roleLabels[user.role]} paneline git`}
        >
          {avatar}
          <span>{label}</span>
        </Link>
      ) : (
        <Link
          className="login-action"
          href="/kaydedilenler"
          title={`${roleLabels[user.role]} olarak bağlısın — kaydedilenlere git`}
        >
          {avatar}
          <span>{label}</span>
        </Link>
      )}
      <ul className="account-menu-list">
        <li>
          <form action={signOut}>
            <button type="submit">
              <SignOut aria-hidden="true" size={16} weight="bold" />
              Çıkış yap
            </button>
          </form>
        </li>
      </ul>
    </div>
  );
}
