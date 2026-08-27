/**
 * Turkish-aware text normalization.
 *
 * - Lowercases with the Turkish locale so "I" becomes "ı" and "İ" stays dotless-correct.
 * - Strips combining marks (NFD) so users can type "izmir", "IZMIR" or "İzmir"
 *   and always match "İzmir".
 * - Collapses whitespace for stable token matching.
 */
export function normalizeTurkish(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/i\u0307/gu, "i")
    .replace(/\u0131/gu, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}