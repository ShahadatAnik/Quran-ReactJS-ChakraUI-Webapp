/** Client for api.alquran.cloud, used for editions that aren't bundled with the site. */
import { type Edition, parseEditions } from "@/lib/editions"
import { splitBismillah } from "@/lib/quran-text"

const API = "https://api.alquran.cloud/v1"

let editionsRequest: Promise<Edition[]> | undefined

/**
 * Every text and audio edition, fetched once per page load and shared by all components
 * (the old site fetched the list separately in each page). A failed request is retried on
 * the next call instead of being cached.
 */
export function fetchEditions(): Promise<Edition[]> {
  editionsRequest ??= fetch(`${API}/edition`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Couldn't load editions (HTTP ${response.status})`)
      const editions = parseEditions(await response.json())
      if (editions.length === 0) throw new Error("The editions list was empty")
      return editions
    })
    .catch((error: unknown) => {
      editionsRequest = undefined
      throw error
    })
  return editionsRequest
}

/** Ayah texts of one surah, per edition identifier. */
export type EditionTexts = Record<string, string[]>

/**
 * Reads `/surah/{n}/editions/{a},{b}`. Every requested edition must be present with the
 * expected number of ayahs, otherwise the response is rejected rather than shown misaligned.
 * The Bismillah the API prepends to ayah 1 is removed (it is shown as a header instead).
 */
export function parseSurahEditions(
  json: unknown,
  surah: number,
  ayahCount: number,
  editions: readonly string[]
): EditionTexts {
  const data = (json as { data?: unknown } | null)?.data
  if (!Array.isArray(data)) throw new Error("Unexpected response from the Quran API")

  const result: EditionTexts = {}
  for (const entry of data) {
    const id = (entry as { edition?: { identifier?: unknown } })?.edition?.identifier
    const ayahs = (entry as { ayahs?: unknown })?.ayahs
    if (typeof id !== "string" || !Array.isArray(ayahs)) continue
    const texts = ayahs.map((ayah: { text?: unknown }, index) =>
      typeof ayah?.text === "string" ? splitBismillah(surah, index + 1, ayah.text).text : ""
    )
    if (texts.length === ayahCount && texts.every(Boolean)) result[id] = texts
  }
  for (const id of editions) {
    if (!result[id]) throw new Error(`The Quran API returned no usable text for ${id}`)
  }
  return result
}

/** Fetches the given editions of a surah. */
export async function fetchSurahEditions(
  surah: number,
  ayahCount: number,
  editions: readonly string[],
  signal?: AbortSignal
): Promise<EditionTexts> {
  const ids = editions.map(encodeURIComponent).join(",")
  const response = await fetch(`${API}/surah/${surah}/editions/${ids}`, { signal })
  if (!response.ok) throw new Error(`The Quran API answered HTTP ${response.status}`)
  return parseSurahEditions(await response.json(), surah, ayahCount, editions)
}
