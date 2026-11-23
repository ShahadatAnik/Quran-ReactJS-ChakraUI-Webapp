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
 * word-by-word and corpus editions are not ayah text, and the Quran Academy text needs the
 * Kitab font, which the site doesn't ship.
 */
const UNSUPPORTED_ARABIC = new Set([
  "quran-tajweed",
  "quran-uthmani-quran-academy",
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

/** Editions the API files under the wrong language code (Mehanović's is Bosnian, not Bashkir). */
const LANGUAGE_FIXES: Record<string, string> = { "ba.mehanovic": "bs" }

/** Validates an `/v1/edition` response, dropping malformed entries and fixing known errors. */
export function parseEditions(json: unknown): Edition[] {
  const data = (json as { data?: unknown } | null)?.data
  if (!Array.isArray(data)) return []
  return data
    .filter(isEdition)
    .map((e) => ({ ...e, language: LANGUAGE_FIXES[e.identifier] ?? e.language }))
}

/** "Translations" that aren't one: Buckwalter is a Latin transliteration of the Arabic. */
const NOT_TRANSLATIONS = new Set(["quran-buck"])

const displayNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "language" })
  } catch {
    return undefined
  }
})()

/** Languages the browser has no name for. */
const LANGUAGE_NAMES: Record<string, { english: string; native: string }> = {
  ber: { english: "Amazigh", native: "ⵜⴰⵎⴰⵣⵉⵖⵜ" },
  dv: { english: "Divehi", native: "ދިވެހި" },
}

/** English name of an ISO 639 language code, e.g. "bn" → "Bangla". Falls back to the code. */
export function languageName(code: string): string {
  const known = LANGUAGE_NAMES[code]
  if (known) return known.english
  try {
    const name = displayNames?.of(code)
    return name && name !== code ? name : code.toUpperCase()
  } catch {
    return code.toUpperCase()
  }
}

/**
 * The language's name in its own script, e.g. "bn" → "বাংলা". Undefined when the browser
 * doesn't know it or it reads the same as the English name ("English", "Hausa").
 */
export function nativeLanguageName(code: string): string | undefined {
  const known = LANGUAGE_NAMES[code]
  if (known) return known.native
  try {
    const name = new Intl.DisplayNames([code], { type: "language" }).of(code)
    if (!name || name === code) return undefined
    // Capitalise the first letter where the script has case ("français" → "Français").
    const native = name.charAt(0).toLocaleUpperCase(code) + name.slice(1)
    return native.toLowerCase() === languageName(code).toLowerCase() ? undefined : native
  } catch {
    return undefined
  }
}

/** "Bangla: Muhiuddin Khan" */
export const editionLabel = (edition: Edition) =>
  `${languageName(edition.language)}: ${edition.englishName}`

/** Shorter names for Arabic scripts whose API name is a sentence. */
const ARABIC_SCRIPT_NAMES: Record<string, string> = {
  "quran-unicode": "Unicode (Khaled Hosny)",
}

/** How each Arabic script differs, in a few words (Tanzil's text types). */
export const ARABIC_SCRIPT_NOTES: Record<string, string> = {
  "quran-simple": "Modern spelling, fully vowelled",
  "quran-simple-enhanced": "Modern spelling, fully vowelled, extra marks",
  "quran-simple-min": "Modern spelling, fewer vowel marks",
  "quran-simple-clean": "Modern spelling, no vowel marks",
  "quran-uthmani": "Spelling of the printed mushaf",
  "quran-uthmani-min": "Mushaf spelling, fewer vowel marks",
  "quran-unicode": "Mushaf spelling, for Khaled Hosny's fonts",
}

/** Name of an Arabic script, without the language: "Simple", "Uthmani Minimal". */
export const arabicScriptLabel = (edition: Edition) =>
  ARABIC_SCRIPT_NAMES[edition.identifier] ?? edition.englishName

/** Wording the API puts in front of some translator names. */
const TRANSLATOR_PREFIX = /^(?:(?:quran )?translation by|chechen by|preklad)\s+/i

/**
 * Who made an edition, without the language: "Muhiuddin Khan". Arabic texts use their script
 * name; translations without a credited translator say so.
 */
export function editionName(edition: Edition): string {
  if (edition.type === "quran") return arabicScriptLabel(edition)
  const name = edition.englishName.replace(TRANSLATOR_PREFIX, "").trim()
  return !name || name.toLowerCase() === "unknown" ? "Translator not credited" : name
}

export interface LanguageGroup {
  code: string
  name: string
  native?: string
  editions: Edition[]
}

/** Languages listed first, in this order: the site's own, then English and Arabic. */
const FIRST_LANGUAGES = ["bn", "en", "ar"]

/**
 * Editions grouped by language: Bangla, English and Arabic first, then the rest by English
 * name. Within a language, editions keep the order they came in.
 */
export function groupByLanguage(editions: readonly Edition[]): LanguageGroup[] {
  const groups = new Map<string, LanguageGroup>()
  for (const edition of editions) {
    const code = edition.language
    let group = groups.get(code)
    if (!group) {
      group = { code, name: languageName(code), native: nativeLanguageName(code), editions: [] }
      groups.set(code, group)
    }
    group.editions.push(edition)
  }
  const rank = (code: string) => {
    const i = FIRST_LANGUAGES.indexOf(code)
    return i === -1 ? FIRST_LANGUAGES.length : i
  }
  return [...groups.values()].sort(
    (a, b) => rank(a.code) - rank(b.code) || a.name.localeCompare(b.name)
  )
}

/** Language code an edition id implies, for ids not (yet) in the loaded list. */
export const languageOfId = (identifier: string) =>
  identifier.startsWith("quran") ? "ar" : (identifier.split(".")[0] ?? "")

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
  sortEditions(
    editions.filter(
      (e) => e.format === "text" && e.type === "translation" && !NOT_TRANSLATIONS.has(e.identifier)
    )
  )

/** Editions the search API accepts: any plain-text Quran or translation. */
export const searchableEditions = (editions: readonly Edition[]) =>
  sortEditions(
    editions.filter(
      (e) =>
        e.format === "text" &&
        ((e.type === "translation" && !NOT_TRANSLATIONS.has(e.identifier)) ||
          (e.type === "quran" && !UNSUPPORTED_ARABIC.has(e.identifier)))
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
