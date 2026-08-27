import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MATCH_END, MATCH_START, HighlightedText } from "@/components/site/highlighted-text";

const marked = (term: string) => `${MATCH_START}${term}${MATCH_END}`;

describe("HighlightedText", () => {
  it("eşleşmeleri mark öğesiyle sarar", () => {
    render(<HighlightedText text={`Yerel ${marked("zeytin")} üreticileri`} />);

    const mark = screen.getByText("zeytin");
    expect(mark.tagName).toBe("MARK");
  });

  it("aynı metindeki birden çok eşleşmeyi işaretler", () => {
    const { container } = render(
      <HighlightedText text={`${marked("ege")} ve yine ${marked("ege")} hattı`} />,
    );

    expect(container.querySelectorAll("mark")).toHaveLength(2);
  });

  it("işaretsiz metni olduğu gibi gösterir", () => {
    const { container } = render(<HighlightedText text="Vurgusuz özet metni" />);

    expect(container.querySelectorAll("mark")).toHaveLength(0);
    expect(container).toHaveTextContent("Vurgusuz özet metni");
  });

  it("HTML'i metin olarak bırakır, asla işaretleme olarak yorumlamaz", () => {
    const { container } = render(
      <HighlightedText text={`${marked("<img src=x onerror=alert(1)>")} sonrası`} />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("<img src=x onerror=alert(1)> sonrası");
  });

  it("yarım kalan bir eşleşmeyi düz metin olarak gösterir", () => {
    const { container } = render(<HighlightedText text={`Kesilmiş ${MATCH_START}özet`} />);

    expect(container.querySelectorAll("mark")).toHaveLength(0);
    expect(container).toHaveTextContent("Kesilmiş özet");
  });
});
