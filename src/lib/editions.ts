/** Quran text, translation and audio editions from api.alquran.cloud. */

/** Arabic script prerendered into every surah page ("Simple", as on the original site). */
export const DEFAULT_ARABIC_EDITION = "quran-simple"
/** Bangla translation by Muhiuddin Khan, prerendered alongside the Arabic. */
export const DEFAULT_TRANSLATION_EDITION = "bn.bengali"
/** Mishary Rashid Alafasy. */
export const DEFAULT_RECITER = "ar.alafasy"
/** Default edition for Quran search: Bangla, matching the rest of the site. */
export const DEFAULT_SEARCH_EDITION = DEFAULT_TRANSLATION_EDITION

export interface Edition {
  identifier: string
  language: string
  name: string
  englishName: string
  format: "text" | "audio"
  type: string
  direction?: "rtl" | "ltr" | null
}

/**
 * Arabic editions the reader can't display as plain text: tajweed carries inline markup,
 * word-by-word and corpus editions are not ayah text.
 */
const UNSUPPORTED_ARABIC = new Set([
  "quran-tajweed",
  "quran-wordbyword",
  "quran-wordbyword-2",
  "quran-kids",
  "quran-corpus-qd",
])

function isEdition(value: unknown): value is Edition {
  if (typeof value !== "object" || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.identifier === "string" &&
    typeof e.language === "string" &&
    typeof e.name === "string" &&
    typeof e.englishName === "string" &&
    (e.format === "text" || e.format === "audio") &&
    typeof e.type === "string"
  )
}

/** Validates an `/v1/edition` response, dropping malformed entries. */
export function parseEditions(json: unknown): Edition[] {
  const data = (json as { data?: unknown } | null)?.data
  return Array.isArray(data) ? data.filter(isEdition) : []
}

const displayNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" })
  } catch {
    return undefined
  }
})()

/** English name of an ISO 639 language code, e.g. "bn" → "Bangla". Falls back to the code. */
export function languageName(code: string): string {
  try {
    const name = displayNames?.of(code)
    return name && name !== code ? name : code.toUpperCase()
  } catch {
    return code.toUpperCase()
  }
}

/** "Bangla: Muhiuddin Khan" */
export const editionLabel = (edition: Edition) =>
  `${languageName(edition.language)}: ${edition.englishName}`

/** Sorted copy by language name, then translator. Never mutates the input. */
export const sortEditions = (editions: readonly Edition[]) =>
  [...editions].sort(
    (a, b) =>
      languageName(a.language).localeCompare(languageName(b.language)) ||
      a.englishName.localeCompare(b.englishName)
  )

export const arabicEditions = (editions: readonly Edition[]) =>
  sortEditions(
    editions.filter(
      (e) =>
        e.format === "text" &&
        e.language === "ar" &&
        e.type === "quran" &&
        !UNSUPPORTED_ARABIC.has(e.identifier)
    )
  )

export const translationEditions = (editions: readonly Edition[]) =>
  sortEditions(editions.filter((e) => e.format === "text" && e.type === "translation"))

/** Editions the search API accepts: any plain-text Quran or translation. */
export const searchableEditions = (editions: readonly Edition[]) =>
  sortEditions(
    editions.filter(
      (e) =>
        e.format === "text" &&
        (e.type === "translation" || (e.type === "quran" && !UNSUPPORTED_ARABIC.has(e.identifier)))
    )
  )

export const reciterEditions = (editions: readonly Edition[]) =>
  [...editions]
    .filter((e) => e.format === "audio" && e.type === "versebyverse" && e.language === "ar")
    .sort((a, b) => a.englishName.localeCompare(b.englishName))

/** Whether text in this edition is written right to left. */
export function isRtl(edition: Pick<Edition, "language" | "direction"> | undefined): boolean {
  if (!edition) return false
  if (edition.direction) return edition.direction === "rtl"
  return ["ar", "fa", "ur", "he", "dv", "ps", "sd", "ug", "ku", "yi"].includes(edition.language)
}

/**
 * Language and direction of the translation on screen: the chosen edition once its text has
 * loaded, otherwise the bundled Bangla.
 */
export function translationLocale(
  edition: string,
  loaded: boolean
): { lang: string; dir: "ltr" | "rtl" } {
  const lang =
    edition === DEFAULT_TRANSLATION_EDITION || !loaded ? "bn" : (edition.split(".")[0] ?? "en")
  return { lang, dir: isRtl({ language: lang }) ? "rtl" : "ltr" }
}
