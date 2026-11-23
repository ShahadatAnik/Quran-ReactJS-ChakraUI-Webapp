/**
 * Bangla tafsir per ayah (Tafsir Abu Bakr Zakaria, King Fahd Quran Printing Complex), from
 * the quran.com API. Where the occasion of revelation (Shan-e-Nuzul) is known, the tafsir
 * explains it in its notes.
 */

/** quran.com tafsir resource id of Tafsir Abu Bakr Zakaria (Bangla). */
export const TAFSIR_ID = 166
export const TAFSIR_SLUG = "bn-tafsir-abu-bakr-zakaria"
export const tafsirSource = {
  name: "Tafsir Abu Bakr Zakaria",
  nameBn: "তাফসীরে আবু বকর জাকারিয়া",
  publisher: "King Fahd Quran Printing Complex",
}

/** A run of text, bold where the source marks it so. */
export interface TafsirSegment {
  text: string
  bold: boolean
}

/** One paragraph of the tafsir: the ayah's translation first, then numbered notes. */
export interface TafsirParagraph {
  segments: TafsirSegment[]
  /** The note's number as printed ("১"), for paragraphs that start with "[১]". */
  note?: string
}

export const tafsirUrl = (surah: number, ayah: number) =>
  `https://api.quran.com/api/v4/tafsirs/${TAFSIR_ID}/by_ayah/${surah}:${ayah}`

/** The same passage on quran.com, for readers who want the full page. */
export const tafsirPageUrl = (surah: number, ayah: number) =>
  `https://quran.com/${surah}:${ayah}/tafsirs/${TAFSIR_SLUG}`

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
}

/** Decodes the HTML entities the API uses: named ones above and numeric ones. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === "#") {
      const n =
        code[1]?.toLowerCase() === "x" ? Number.parseInt(code.slice(2), 16) : Number(code.slice(1))
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : match
    }
    return ENTITIES[code.toLowerCase()] ?? match
  })
}

const NOTE_START = /^\[([০-৯0-9]+)\]\s*/

/**
 * Turns the API's HTML into plain paragraphs and bold runs. Only text is kept, so nothing
 * from the response is ever inserted into the page as markup.
 */
export function parseTafsirHtml(html: string): TafsirParagraph[] {
  const paragraphs: TafsirParagraph[] = []
  for (const block of html.split(/<\/p>|<br\s*\/?>/i)) {
    const segments: TafsirSegment[] = []
    // Bold runs alternate with plain ones when split on <b>…</b> (or <strong>…</strong>).
    const parts = block.split(/<(?:b|strong)\b[^>]*>([\s\S]*?)<\/(?:b|strong)>/i)
    parts.forEach((part, index) => {
      const text = decodeEntities(part.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ")
      if (text.trim()) segments.push({ text, bold: index % 2 === 1 })
    })
    if (segments.length === 0) continue
    const first = segments[0] as TafsirSegment
    first.text = first.text.trimStart()
    const last = segments.at(-1) as TafsirSegment
    last.text = last.text.trimEnd()
    const note = NOTE_START.exec(first.text)
    if (note) first.text = first.text.slice(note[0].length)
    paragraphs.push(note ? { segments, note: note[1] } : { segments })
  }
  return paragraphs
}

/** Validates an API response; throws when it has no tafsir text. */
export function parseTafsirResponse(json: unknown): TafsirParagraph[] {
  const text = (json as { tafsir?: { text?: unknown } } | null)?.tafsir?.text
  if (typeof text !== "string") throw new Error("The tafsir service returned no text")
  return parseTafsirHtml(text)
}

const cache = new Map<string, Promise<TafsirParagraph[]>>()

/** Tafsir of one ayah. Successful results are kept for the session; failures can be retried. */
export function fetchTafsir(surah: number, ayah: number): Promise<TafsirParagraph[]> {
  const key = `${surah}:${ayah}`
  const cached = cache.get(key)
  if (cached) return cached
  const request = fetch(tafsirUrl(surah, ayah))
    .then((response) => {
      if (!response.ok) throw new Error(`The tafsir service answered ${response.status}`)
      return response.json()
    })
    .then(parseTafsirResponse)
  cache.set(key, request)
  request.catch(() => cache.delete(key))
  return request
}
