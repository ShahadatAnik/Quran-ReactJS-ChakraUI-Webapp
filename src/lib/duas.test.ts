import { describe, expect, test } from "bun:test"
import { join } from "node:path"
import { dailyDuas, duaCategories, duas, getDua } from "@/content/duas"
import {
  duaAyahs,
  duaAyahText,
  duaOfTheDay,
  duaOpening,
  duaReference,
  duaSource,
  splitAtWord,
} from "@/lib/duas"
import { duaPages, META_DESCRIPTION_RANGE, SEO_TITLE_MAX } from "@/lib/pages"
import { getSurah } from "@/lib/surahs"

const surahText = async (n: number) =>
  (await Bun.file(
    join(import.meta.dir, "..", "data", "quran", `${String(n).padStart(3, "0")}.json`)
  ).json()) as { ayahs: { ar: string; bn: string }[] }

describe("the list of duas", () => {
  test("every reference is a real range of ayahs", () => {
    for (const dua of duas) {
      const surah = getSurah(dua.surah)
      expect(surah, dua.slug).toBeDefined()
      expect(dua.from, dua.slug).toBeGreaterThanOrEqual(1)
      expect(dua.to, dua.slug).toBeGreaterThanOrEqual(dua.from)
      expect(dua.to, dua.slug).toBeLessThanOrEqual(surah?.ayahs ?? 0)
    }
  })

  test("slugs are unique and URL-safe", () => {
    const slugs = duas.map((d) => d.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  test("every category is used, and every dua has a known category", () => {
    const ids = new Set(duaCategories.map((c) => c.id))
    for (const dua of duas) expect(ids.has(dua.category), dua.slug).toBe(true)
    for (const category of duaCategories) {
      expect(
        duas.some((d) => d.category === category.id),
        category.id
      ).toBe(true)
    }
  })

  test("a start word falls inside its ayah, and isn't the first word", async () => {
    for (const dua of duas.filter((d) => d.startsAtWord !== undefined)) {
      const words = (await surahText(dua.surah)).ayahs[dua.from - 1]?.ar.split(" ") ?? []
      expect(dua.startsAtWord, dua.slug).toBeGreaterThan(0)
      expect(dua.startsAtWord, dua.slug).toBeLessThan(words.length)
    }
  })

  test("src/data/duas.json matches the Quran text (run `bun run generate:duas` if not)", async () => {
    for (const dua of duas) {
      const text = await surahText(dua.surah)
      const expected = duaAyahs(dua).map((n) => ({
        n,
        ar: text.ayahs[n - 1]?.ar ?? "",
        bn: text.ayahs[n - 1]?.bn ?? "",
      }))
      expect(duaAyahText(dua.slug), dua.slug).toEqual(expected)
    }
  })

  test("the daily pool leaves out the well-known passages", () => {
    expect(dailyDuas.length).toBeGreaterThan(5)
    expect(dailyDuas.every((d) => d.category !== "well-known")).toBe(true)
  })
})

describe("helpers", () => {
  test("references", () => {
    const kursi = getDua("ayat-al-kursi")
    const baqarah = getDua("last-two-ayahs-of-al-baqarah")
    expect(kursi && duaReference(kursi)).toBe("2:255")
    expect(baqarah && duaReference(baqarah)).toBe("2:285–286")
    expect(baqarah && duaSource(baqarah)).toBe("Al-Baqarah 2:285–286")
    expect(duaAyahs({ from: 22, to: 24 })).toEqual([22, 23, 24])
  })

  test("splitAtWord", () => {
    expect(splitAtWord("a b c d", 2)).toEqual(["a b", "c d"])
    expect(splitAtWord("a b c d", undefined)).toEqual(["", "a b c d"])
  })

  test("the opening of a dua within an ayah is its own words", async () => {
    const zidni = getDua("rabbi-zidni-ilma")
    const words = (await surahText(20)).ayahs[113]?.ar.split(" ") ?? []
    expect(zidni && duaOpening(zidni)).toBe(words.slice(-3).join(" "))
  })

  test("dua of the day: the same all day, a new one the next, cycling the pool", () => {
    const morning = new Date(2026, 10, 23, 6)
    const night = new Date(2026, 10, 23, 23, 30)
    expect(duaOfTheDay(morning)).toBe(duaOfTheDay(night))
    expect(duaOfTheDay(new Date(2026, 10, 24, 6))).not.toBe(duaOfTheDay(morning))
    const seen = new Set(
      Array.from({ length: dailyDuas.length }, (_, i) => duaOfTheDay(new Date(2026, 0, 1 + i)))
    )
    expect(seen.size).toBe(dailyDuas.length)
  })
})

test("every dua page has SEO text of the right length", () => {
  for (const page of duaPages) {
    expect(page.seoTitle.length, page.path).toBeLessThanOrEqual(SEO_TITLE_MAX)
    expect(page.metaDescription.length, page.path).toBeGreaterThanOrEqual(META_DESCRIPTION_RANGE[0])
    expect(page.metaDescription.length, page.path).toBeLessThanOrEqual(META_DESCRIPTION_RANGE[1])
  }
})
