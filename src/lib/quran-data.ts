/** Bundled Quran text (Arabic + Bangla), one lazily loaded JSON chunk per surah. */

export interface AyahText {
  /** Arabic, Simple script (with full diacritics). */
  ar: string
  /** Bangla translation (Muhiuddin Khan). */
  bn: string
  juz: number
  sajda?: true
}

export interface SurahText {
  number: number
  /** Bismillah shown above the surah, or null (Al-Fatihah, At-Tawbah). */
  bismillah: string | null
  ayahs: AyahText[]
}

const chunks = import.meta.glob<{ default: SurahText }>("../data/quran/*.json")

/** Loads the bundled text of a surah. Rejects for numbers outside 1–114. */
export async function loadSurahText(number: number): Promise<SurahText> {
  const load = chunks[`../data/quran/${String(number).padStart(3, "0")}.json`]
  if (!load) throw new RangeError(`No surah ${number}`)
  return (await load()).default
}
