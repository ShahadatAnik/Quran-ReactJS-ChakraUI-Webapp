/**
 * Copies the ayahs of every dua (src/content/duas.ts) from the bundled Quran text into
 * src/data/duas.json, so dua pages carry a few kilobytes instead of whole surahs.
 *
 *   bun run generate:duas
 *
 * Run it after changing the list of duas or re-fetching the Quran text. A unit test
 * (src/lib/duas.test.ts) fails if the file is out of date.
 */
import { join } from "node:path"
import { duas } from "../src/content/duas"

interface SurahFile {
  ayahs: { ar: string; bn: string }[]
}

const root = join(import.meta.dir, "..")
const out: Record<string, { n: number; ar: string; bn: string }[]> = {}

for (const dua of duas) {
  const file = join(root, "src", "data", "quran", `${String(dua.surah).padStart(3, "0")}.json`)
  const surah = (await Bun.file(file).json()) as SurahFile
  const ayahs = []
  for (let n = dua.from; n <= dua.to; n++) {
    const ayah = surah.ayahs[n - 1]
    if (!ayah) throw new Error(`${dua.slug}: ayah ${dua.surah}:${n} doesn't exist`)
    ayahs.push({ n, ar: ayah.ar, bn: ayah.bn })
  }
  out[dua.slug] = ayahs
}

await Bun.write(join(root, "src", "data", "duas.json"), `${JSON.stringify(out, null, 1)}\n`)
console.log(`[duas] ${duas.length} duas written to src/data/duas.json`)
