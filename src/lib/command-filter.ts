import { foldLatin, normalizeText } from "@/lib/search"

/** A term matches text literally (case-insensitive) or after transliteration folding. */
function contains(text: string, folded: string, term: string) {
  if (text.includes(term)) return true
  const foldedTerm = foldLatin(term)
  return foldedTerm !== "" && folded.includes(foldedTerm)
}

/**
 * cmdk filter: every search term must appear in the item's label or keywords, and label
 * matches rank above keyword-only matches. (cmdk's default fuzzy match is too loose for
 * short queries.) Returns 1, 0.5 or 0.
 */
export function commandFilter(value: string, search: string, keywords: string[] = []): number {
  const terms = normalizeText(search).toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return 1
  const label = normalizeText(value).toLowerCase()
  const all = `${label} ${normalizeText(keywords.join(" ")).toLowerCase()}`
  const foldedLabel = foldLatin(label)
  const foldedAll = foldLatin(all)
  if (!terms.every((term) => contains(all, foldedAll, term))) return 0
  return terms.every((term) => contains(label, foldedLabel, term)) ? 1 : 0.5
}
