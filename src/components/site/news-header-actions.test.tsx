import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NewsHeaderActions } from "@/components/site/news-header-actions";

describe("NewsHeaderActions", () => {
  it("renders the search field right next to its trigger", () => {
    render(<NewsHeaderActions />);

    const trigger = screen.getByRole("button", { name: "Haber ara" });
    const slot = document.getElementById("header-panel-search");
    expect(slot?.parentElement).toBe(trigger.parentElement);
    expect(slot?.nextElementSibling).toBe(trigger);
  });

  it("opens the search panel and moves focus into its input", async () => {
    render(<NewsHeaderActions />);

    const trigger = screen.getByRole("button", { name: "Haber ara" });
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(document.getElementById("header-panel-search")).toHaveAttribute("data-open", "true");
    await waitFor(() => expect(screen.getByRole("searchbox")).toHaveFocus());
  });

  it("closes on Escape and returns focus to the opening trigger", () => {
    render(<NewsHeaderActions />);

    const trigger = screen.getByRole("button", { name: "Haber ara" });
    fireEvent.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("stays open while typing in the field", () => {
    render(<NewsHeaderActions />);

    const trigger = screen.getByRole("button", { name: "Haber ara" });
    fireEvent.click(trigger);
    fireEvent.pointerDown(screen.getByRole("searchbox"));

    expect(trigger).toHaveAttribute("aria-expanded", "true");
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
