import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NewsHeaderActions } from "@/components/site/news-header-actions";

describe("NewsHeaderActions", () => {
  let siteHeader: HTMLElement;

  beforeEach(() => {
    // The component portals its drawer into the site header element.
    siteHeader = document.createElement("header");
    siteHeader.id = "site-header";
    document.body.append(siteHeader);
  });

  afterEach(() => {
    siteHeader.remove();
  });

  it("renders its drop-down inside the site header element", () => {
    render(<NewsHeaderActions />);

    const drawer = document.querySelector("#site-header > .header-drawer");
    expect(drawer).not.toBeNull();
    expect(drawer?.contains(document.getElementById("header-panel-search"))).toBe(true);
    expect(drawer?.contains(document.getElementById("header-panel-menu"))).toBe(true);
  });

  it("opens the search panel and moves focus into its input", async () => {
    render(<NewsHeaderActions />);

    const trigger = screen.getByRole("button", { name: "Haber ara" });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("header-panel-search")).toHaveAttribute("data-open", "true");
    await waitFor(() => expect(screen.getByRole("searchbox")).toHaveFocus());
  });

  it("toggles the menu panel independently of the search panel", () => {
    render(<NewsHeaderActions />);

    const menuTrigger = screen.getByRole("button", { name: "Menüyü aç" });
    fireEvent.click(menuTrigger);

    expect(menuTrigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("header-panel-menu")).toHaveAttribute("data-open", "true");
    expect(screen.getByRole("button", { name: "Haber ara" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("closes on Escape and returns focus to the opening trigger", () => {
    render(<NewsHeaderActions />);

    const trigger = screen.getByRole("button", { name: "Menüyü aç" });
    fireEvent.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("closes when interacting outside of the header controls", () => {
    render(<NewsHeaderActions />);

    const outside = document.createElement("div");
    document.body.append(outside);

    const trigger = screen.getByRole("button", { name: "Haber ara" });
    fireEvent.click(trigger);
    fireEvent.pointerDown(outside);

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    outside.remove();
  });
});
