import { type Dua, dailyDuas } from "@/content/duas"
import duaData from "@/data/duas.json"
import { getSurah } from "@/lib/surahs"

export interface DuaAyah {
  /** Ayah number within the surah. */
  n: number
  ar: string
  bn: string
}

/** The Arabic and Bangla of a dua's ayahs (copied from the Quran text by generate:duas). */
export const duaAyahText = (slug: string): DuaAyah[] =>
  (duaData as Record<string, DuaAyah[]>)[slug] ?? []

/** "2:255" or "2:285–286". */
export const duaReference = (dua: Pick<Dua, "surah" | "from" | "to">) =>
  dua.from === dua.to ? `${dua.surah}:${dua.from}` : `${dua.surah}:${dua.from}–${dua.to}`

/** "Al-Baqarah 2:255". */
export const duaSource = (dua: Dua) => `${getSurah(dua.surah)?.name ?? ""} ${duaReference(dua)}`

/** The ayah numbers of a dua, in order. */
export const duaAyahs = (dua: Pick<Dua, "from" | "to">) =>
  Array.from({ length: dua.to - dua.from + 1 }, (_, i) => dua.from + i)

/**
 * Splits an ayah's Arabic where its dua begins: [words before it, the dua]. Without a start
 * word, the whole ayah is the dua. Words are separated by single spaces in the bundled text.
 */
export function splitAtWord(text: string, startsAtWord: number | undefined): [string, string] {
  if (!startsAtWord) return ["", text]
  const words = text.split(" ")
  return [words.slice(0, startsAtWord).join(" "), words.slice(startsAtWord).join(" ")]
}

/** Days since 1 Jan 1970 in the reader's local calendar. */
const localDayNumber = (date: Date) =>
  Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000)

/** The dua of the day: the same for every reader on a given date, cycling through the list. */
export function duaOfTheDay(date: Date): Dua {
  return dailyDuas[localDayNumber(date) % dailyDuas.length] as Dua
}

/** The opening words of a dua in Arabic (its first ayah, from where the dua begins). */
export function duaOpening(dua: Dua): string {
  const first = duaAyahText(dua.slug)[0]
  return first ? splitAtWord(first.ar, dua.startsAtWord)[1] : ""
}
