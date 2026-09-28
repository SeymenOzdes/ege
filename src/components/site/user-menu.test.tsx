import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Keep the jsdom environment hermetic: never execute the real server action.
vi.mock("@/lib/auth/actions", () => ({ signOut: vi.fn() }));

const { UserMenu } = await import("@/components/site/user-menu");

describe("UserMenu", () => {
  it("anonim ziyaretçiye yalnız giriş bağlantısını gösterir", () => {
    render(<UserMenu />);

    const loginLink = screen.getByRole("link", { name: "Giriş" });
    expect(loginLink).toHaveAttribute("href", "/giris");
    expect(screen.queryByRole("button", { name: /Çıkış yap/ })).not.toBeInTheDocument();
  });

  it("okur rozetini kaydedilenlere bağlar, yönetime değil", () => {
    render(<UserMenu user={{ role: "READER" }} />);

    expect(screen.getByRole("link", { name: /Okur/ })).toHaveAttribute("href", "/kaydedilenler");
    expect(screen.queryByRole("link", { name: /yönetim/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Çıkış yap/ })).toBeInTheDocument();
  });

  it("personel rozetini yönetim paneline bağlar", () => {
    render(<UserMenu user={{ role: "EDITOR" }} />);

    expect(screen.getByRole("link", { name: /Editör/ })).toHaveAttribute("href", "/yonetim");
    expect(screen.getByRole("button", { name: /Çıkış yap/ })).toBeInTheDocument();
  });

  it("Google profil resmini genel simgenin yerine koyar", () => {
    render(
      <UserMenu
        user={{
          role: "READER",
          displayName: "Ayşe Yılmaz",
          avatarUrl: "https://lh3.googleusercontent.com/a/test-avatar=s96-c",
        }}
      />,
    );

    const link = screen.getByRole("link", { name: /Ayşe Yılmaz/ });
    expect(link.querySelector("img.login-avatar")).toBeInTheDocument();
    expect(link.querySelector("svg")).toBeNull();
  });

  it("yönetici rozetini de yönetim paneline bağlar", () => {
    render(<UserMenu user={{ role: "ADMIN" }} />);

    expect(screen.getByRole("link", { name: /Yönetici/ })).toHaveAttribute("href", "/yonetim");
  });
});
