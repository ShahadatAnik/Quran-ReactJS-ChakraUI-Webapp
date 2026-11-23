/**
 * Clean-up for Quran text as served by api.alquran.cloud.
 *
 * The API prepends the Bismillah to the first ayah of every surah except Al-Fatihah (where
 * it *is* ayah 1) and At-Tawbah (which has none), and starts 1:1 with a byte-order mark.
 * The Bismillah is not part of those ayahs, so it is split off and shown as a header.
 */

/** Arabic diacritics, Quranic annotation marks and tatweel, stripped for comparison. */
const MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g

/** "بسم الله الرحمن الرحيم" without marks; alef wasla normalised to alef. */
const BISMILLAH_SKELETON = ["بسم", "الله", "الرحمن", "الرحيم"]

const skeleton = (word: string) => word.replace(MARKS, "").replace(/ٱ/g, "ا")

export const stripBom = (text: string) => text.replace(/^\uFEFF/, "")

/** Whether a surah is preceded by a Bismillah that is not one of its ayahs. */
export const hasBismillahHeader = (surah: number) => surah !== 1 && surah !== 9

export interface SplitAyah {
  /** The Bismillah that was prepended to the ayah, if any. */
  bismillah: string | null
  text: string
}

/**
 * Splits a prepended Bismillah off the first ayah of a surah. Matching ignores diacritics,
 * so spelling variants (e.g. "بِّسْمِ" in surahs 95 and 97) are handled too.
 */
export function splitBismillah(surah: number, ayah: number, raw: string): SplitAyah {
  const text = stripBom(raw).trim()
  if (ayah !== 1 || !hasBismillahHeader(surah)) return { bismillah: null, text }

  const words = text.split(/\s+/)
  const head = words.slice(0, BISMILLAH_SKELETON.length)
  const matches =
    head.length === BISMILLAH_SKELETON.length &&
    head.every((word, index) => skeleton(word) === BISMILLAH_SKELETON[index])
  // Only split when something is left: an ayah that is *only* the Bismillah stays intact.
  if (!matches || words.length === BISMILLAH_SKELETON.length) return { bismillah: null, text }

  return {
    bismillah: head.join(" "),
    text: words.slice(BISMILLAH_SKELETON.length).join(" "),
  }
}
