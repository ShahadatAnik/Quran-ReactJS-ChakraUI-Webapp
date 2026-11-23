/**
 * Downloads the Quran text that is prerendered into every surah page:
 *   - src/data/surahs.json        metadata for all 114 surahs
 *   - src/data/quran/NNN.json     Arabic (Simple script) + Bangla (Muhiuddin Khan) per surah
 *
 * Run by hand (`bun run fetch:quran`) and commit the output; the build never hits the API.
 * Sources: api.alquran.cloud (text, names) and api.quran.com (names, Bangla meanings).
 */
import { mkdir, rm } from "node:fs/promises"
import { join } from "node:path"
import { DEFAULT_ARABIC_EDITION, DEFAULT_TRANSLATION_EDITION } from "../src/lib/editions"
import { splitBismillah } from "../src/lib/quran-text"

const dataDir = join(import.meta.dir, "..", "src", "data")

interface ApiAyah {
  numberInSurah: number
  text: string
  juz: number
  sajda: boolean | { recommended: boolean; obligatory: boolean }
}
interface ApiSurah {
  number: number
  englishName: string
  englishNameTranslation: string
  revelationType: "Meccan" | "Medinan"
  ayahs: ApiAyah[]
}
interface QuranComChapter {
  id: number
  revelation_order: number
  name_simple: string
  name_arabic: string
  verses_count: number
  translated_name: { name: string }
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { accept: "application/json" } })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return (await response.json()) as T
}

const edition = async (id: string) =>
  (await getJson<{ data: { surahs: ApiSurah[] } }>(`https://api.alquran.cloud/v1/quran/${id}`)).data
    .surahs

const [arabic, bangla, chapters] = await Promise.all([
  edition(DEFAULT_ARABIC_EDITION),
  edition(DEFAULT_TRANSLATION_EDITION),
  getJson<{ chapters: QuranComChapter[] }>(
    "https://api.quran.com/api/v4/chapters?language=bn"
  ).then((r) => r.chapters),
])

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

assert(arabic.length === 114 && bangla.length === 114 && chapters.length === 114, "114 surahs")

await rm(join(dataDir, "quran"), { recursive: true, force: true })
await mkdir(join(dataDir, "quran"), { recursive: true })

let total = 0
const surahs = arabic.map((ar, index) => {
  const bn = bangla[index]
  const chapter = chapters[index]
  assert(bn && chapter, `surah ${index + 1} missing`)
  const number = index + 1
  assert(ar.number === number && bn.number === number && chapter.id === number, "order")
  assert(
    ar.ayahs.length === bn.ayahs.length && ar.ayahs.length === chapter.verses_count,
    `ayah count mismatch in surah ${number}`
  )
  total += ar.ayahs.length

  let bismillah: string | null = null
  const ayahs = ar.ayahs.map((ayah, i) => {
    const translation = bn.ayahs[i]
    assert(translation && ayah.numberInSurah === i + 1, `ayah ${number}:${i + 1}`)
    const split = splitBismillah(number, ayah.numberInSurah, ayah.text)
    if (split.bismillah) bismillah = split.bismillah
    const bnText = splitBismillah(number, ayah.numberInSurah, translation.text).text
    return {
      ar: split.text,
      bn: bnText,
      juz: ayah.juz,
      ...(ayah.sajda ? { sajda: true } : {}),
    }
  })

  void Bun.write(
    join(dataDir, "quran", `${String(number).padStart(3, "0")}.json`),
    `${JSON.stringify({ number, bismillah, ayahs })}\n`
  )

  return {
    number,
    name: chapter.name_simple,
    altName: ar.englishName,
    arabic: chapter.name_arabic,
    meaning: ar.englishNameTranslation,
    meaningBn: chapter.translated_name.name,
    ayahs: ar.ayahs.length,
    revelation: ar.revelationType,
    revelationOrder: chapter.revelation_order,
    juz: [...new Set(ar.ayahs.map((a) => a.juz))],
  }
})

assert(total === 6236, `expected 6236 ayahs, got ${total}`)
await Bun.write(join(dataDir, "surahs.json"), `${JSON.stringify(surahs, null, 2)}\n`)
console.log(`[quran] ${surahs.length} surahs, ${total} ayahs written to src/data`)
