import { type Surah, surahs } from "@/lib/surahs"

/**
 * Canonical Unicode form for comparing text. Bangla "য়" exists precomposed (U+09DF) and as
 * য + nukta (U+09AF U+09BC); they look identical but differ code point by code point.
 */
export const normalizeText = (value: string) => value.normalize("NFC")

// ---------- surah filter ----------

/** Arabic diacritics and Quranic marks. */
const ARABIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g

/**
 * Folds a transliterated name for loose matching: lowercase, no accents, no punctuation or
 * spaces, and doubled letters collapsed, so "fatiha", "Al-Faatiha" and "Al-Fātiĥah" agree.
 */
export function foldLatin(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1+/g, "$1")
}

const foldArabic = (value: string) => value.replace(ARABIC_MARKS, "").replace(/[ٱأإآ]/g, "ا")

function haystack(surah: Surah) {
  return {
    latin: foldLatin(`${surah.name} ${surah.altName} ${surah.meaning}`),
    words: `${surah.name} ${surah.altName} ${surah.meaning}`.toLowerCase(),
    native: normalizeText(`${foldArabic(surah.arabic)} ${surah.meaningBn}`),
  }
}

const indexed = new Map(surahs.map((s) => [s.number, haystack(s)]))

function matchesTerm(surah: Surah, term: string): boolean {
  if (/^\d+$/.test(term)) return String(surah.number) === term
  const h = indexed.get(surah.number) ?? haystack(surah)
  const latin = foldLatin(term)
  return (
    (latin !== "" && h.latin.includes(latin)) ||
    h.words.includes(term.toLowerCase()) ||
    h.native.includes(normalizeText(foldArabic(term)))
  )
}

/**
 * Filters surahs by name (any transliteration), English or Bangla meaning, Arabic name or
 * number. Every whitespace-separated term must match. An empty query returns everything.
 */
export function filterSurahs(query: string, list: readonly Surah[] = surahs): Surah[] {
  const terms = query.trim().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return [...list]
  return list.filter((surah) => terms.every((term) => matchesTerm(surah, term)))
}

// ---------- Quran search API ----------

/** Shortest search term sent to the API; single letters match most of the Quran. */
export const MIN_SEARCH_LENGTH = 2

/** URL for api.alquran.cloud's search, or null when the term is too short to search. */
export function searchUrl(term: string, edition: string): string | null {
  const keyword = term.trim().replace(/\s+/g, " ")
  if ([...keyword].length < MIN_SEARCH_LENGTH || !edition) return null
  return `https://api.alquran.cloud/v1/search/${encodeURIComponent(keyword)}/all/${encodeURIComponent(edition)}`
}

export interface SearchMatch {
  surah: number
  ayah: number
  text: string
}

/**
 * Reads a search response. "Nothing found" arrives as HTTP 404 with a string in `data`
 * (which crashed the old page), so anything without a matches array is an empty result.
 */
export function parseSearchResponse(json: unknown): SearchMatch[] {
  const matches = (json as { data?: { matches?: unknown } } | null)?.data?.matches
  if (!Array.isArray(matches)) return []
  return matches.flatMap((m): SearchMatch[] => {
    const surah = (m as { surah?: { number?: unknown } })?.surah?.number
    const ayah = (m as { numberInSurah?: unknown })?.numberInSurah
    const text = (m as { text?: unknown })?.text
    return typeof surah === "number" && typeof ayah === "number" && typeof text === "string"
      ? [{ surah, ayah, text }]
      : []
  })
}

// ---------- highlighting ----------

export interface Segment {
  text: string
  match: boolean
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Splits `text` into plain and matching segments for every occurrence of any term in
 * `query` (case-insensitive, any Unicode encoding). Joining the segments gives back `text`,
 * NFC-normalized.
 */
export function highlight(rawText: string, query: string): Segment[] {
  const text = normalizeText(rawText)
  const terms = [...new Set(normalizeText(query).trim().split(/\s+/).filter(Boolean))]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
  if (terms.length === 0 || text === "") return text ? [{ text, match: false }] : []

  // With a capturing group, split() alternates: plain, match, plain, match, …
  return text
    .split(new RegExp(`(${terms.join("|")})`, "iu"))
    .map((part, index) => ({ text: part, match: index % 2 === 1 }))
    .filter((segment) => segment.text !== "")
}
