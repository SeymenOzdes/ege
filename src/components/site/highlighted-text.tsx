import { Fragment } from "react";

/**
 * Delimiters emitted by `public.search_published_articles` (STX / ETX).
 * Built from char codes so no invisible control character ever sits in source.
 */
export const MATCH_START = String.fromCharCode(2);
export const MATCH_END = String.fromCharCode(3);

/**
 * Renders a `ts_headline` excerpt with matches wrapped in `<mark>`.
 *
 * The database marks matches with control characters rather than HTML, so the
 * excerpt is split into plain text nodes here. Nothing is ever passed through
 * `dangerouslySetInnerHTML`, which is what makes highlighting article text safe.
 */
export function HighlightedText({ text }: { text: string }) {
  if (!text.includes(MATCH_START)) return <>{text}</>;

  return (
    <>
      {text.split(MATCH_START).map((chunk, index) => {
        if (index === 0) return <Fragment key={index}>{chunk}</Fragment>;

        const end = chunk.indexOf(MATCH_END);
        // An unterminated match can only mean a truncated excerpt; show it plain.
        if (end === -1) return <Fragment key={index}>{chunk}</Fragment>;

        return (
          <Fragment key={index}>
            <mark>{chunk.slice(0, end)}</mark>
            {chunk.slice(end + MATCH_END.length)}
          </Fragment>
        );
      })}
    </>
  );
}
