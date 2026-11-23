import data from "@/data/surahs.json"

export type Revelation = "Meccan" | "Medinan"

export interface Surah {
  number: number
  /** Common transliteration, e.g. "Al-Fatihah" (quran.com). */
  name: string
  /** Alternative transliteration, e.g. "Al-Faatiha" (alquran.cloud); used for search. */
  altName: string
  /** Arabic name, e.g. "الفاتحة". */
  arabic: string
  /** English meaning of the name, e.g. "The Opening". */
  meaning: string
  /** Bangla meaning of the name, e.g. "সূচনা". */
  meaningBn: string
  ayahs: number
  revelation: Revelation
  revelationOrder: number
  /** Juz (para) numbers the surah spans. */
  juz: number[]
}

export const SURAH_COUNT = 114
export const AYAH_COUNT = 6236

export const surahs = data as readonly Surah[]

/** Whether `n` is a surah number (an integer from 1 to 114). */
export const isSurahNumber = (n: number) => Number.isInteger(n) && n >= 1 && n <= SURAH_COUNT

export function getSurah(n: number): Surah | undefined {
  return isSurahNumber(n) ? surahs[n - 1] : undefined
}

/**
 * Parses a surah number from a URL segment. Only the canonical form is accepted ("2", not
 * "02", "2.0" or " 2"), so every surah has exactly one URL.
 */
export function parseSurahNumber(value: string): number | null {
  if (!/^[1-9]\d{0,2}$/.test(value)) return null
  const n = Number(value)
  return isSurahNumber(n) ? n : null
}

export const isAyahOf = (surah: number, ayah: number) => {
  const s = getSurah(surah)
  return s !== undefined && Number.isInteger(ayah) && ayah >= 1 && ayah <= s.ayahs
}

/** Number of ayahs before each surah, for global ayah numbers. */
const offsets: number[] = []
let running = 0
for (const surah of surahs) {
  offsets.push(running)
  running += surah.ayahs
}

/** Position of an ayah in the whole Quran (1–6236), as used by the audio CDN. */
export function globalAyahNumber(surah: number, ayah: number): number {
  if (!isAyahOf(surah, ayah)) throw new RangeError(`No ayah ${surah}:${ayah}`)
  return (offsets[surah - 1] ?? 0) + ayah
}

export const surahPath = (n: number) => `/surah/${n}` as const

/** Element id of an ayah on its surah page, e.g. "ayah-255". */
export const ayahId = (ayah: number) => `ayah-${ayah}`

/** Parses "#ayah-255" (or "ayah-255") into 255. Returns null for anything else. */
export function parseAyahHash(hash: string): number | null {
  const match = /^#?ayah-([1-9]\d{0,2})$/.exec(hash)
  return match ? Number(match[1]) : null
}

/** Permalink path of an ayah, e.g. "/surah/2#ayah-255". */
export const ayahPath = (surah: number, ayah: number) => `${surahPath(surah)}#${ayahId(ayah)}`

/**
 * Parses an ayah reference such as "2:255", "2 255" or "২:২৫৫" (Bangla digits).
 * Returns null unless it names a real ayah.
 */
export function parseAyahReference(input: string): { surah: number; ayah: number } | null {
  const ascii = input.trim().replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6))
  const match = /^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/.exec(ascii)
  if (!match) return null
  const surah = Number(match[1])
  const ayah = Number(match[2])
  return isAyahOf(surah, ayah) ? { surah, ayah } : null
}

/** Previous and next surah, wrapping around (114 → 1), as the original reader did. */
export function adjacentSurahs(n: number): { previous: Surah; next: Surah } {
  const at = (i: number) => surahs[((i % SURAH_COUNT) + SURAH_COUNT) % SURAH_COUNT] as Surah
  return { previous: at(n - 2), next: at(n) }
}
