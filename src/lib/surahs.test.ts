import { describe, expect, test } from "bun:test"
import {
  AYAH_COUNT,
  adjacentSurahs,
  ayahPath,
  getSurah,
  globalAyahNumber,
  isAyahOf,
  parseAyahHash,
  parseAyahReference,
  parseSurahNumber,
  SURAH_COUNT,
  surahs,
} from "@/lib/surahs"

describe("surah data", () => {
  test("has 114 surahs numbered in order", () => {
    expect(surahs).toHaveLength(SURAH_COUNT)
    for (const [i, s] of surahs.entries()) expect(s.number).toBe(i + 1)
  })

  test("adds up to 6236 ayahs", () => {
    expect(surahs.reduce((sum, s) => sum + s.ayahs, 0)).toBe(AYAH_COUNT)
  })

  test("every surah has names in all three scripts", () => {
    for (const s of surahs) {
      expect(s.name).toMatch(/^[A-Za-z'-]+(?: [A-Za-z'-]+)*$/)
      expect(s.arabic).toMatch(/[؀-ۿ]/)
      expect(s.meaningBn).toMatch(/[ঀ-৿]/)
      expect(["Meccan", "Medinan"]).toContain(s.revelation)
    }
  })
})

describe("parseSurahNumber", () => {
  test("accepts canonical numbers in range", () => {
    expect(parseSurahNumber("1")).toBe(1)
    expect(parseSurahNumber("114")).toBe(114)
  })

  test.each(["0", "115", "200", "01", "2.0", " 2", "abc", "", "-1", "1e2"])("rejects %p", (v) => {
    expect(parseSurahNumber(v)).toBeNull()
  })
})

describe("globalAyahNumber", () => {
  test("numbers ayahs across the whole Quran", () => {
    expect(globalAyahNumber(1, 1)).toBe(1)
    expect(globalAyahNumber(1, 7)).toBe(7)
    expect(globalAyahNumber(2, 1)).toBe(8)
    expect(globalAyahNumber(2, 255)).toBe(262)
    expect(globalAyahNumber(114, 6)).toBe(AYAH_COUNT)
  })

  test("throws for ayahs that don't exist", () => {
    expect(() => globalAyahNumber(1, 8)).toThrow(RangeError)
    expect(() => globalAyahNumber(115, 1)).toThrow(RangeError)
    expect(() => globalAyahNumber(2, 0)).toThrow(RangeError)
  })
})

test("isAyahOf", () => {
  expect(isAyahOf(2, 286)).toBe(true)
  expect(isAyahOf(2, 287)).toBe(false)
  expect(isAyahOf(1, 1.5)).toBe(false)
  expect(isAyahOf(0, 1)).toBe(false)
})

describe("ayah permalinks", () => {
  test("builds and parses ayah anchors", () => {
    expect(ayahPath(2, 255)).toBe("/surah/2#ayah-255")
    expect(parseAyahHash("#ayah-255")).toBe(255)
    expect(parseAyahHash("ayah-7")).toBe(7)
  })

  test.each(["", "#", "#ayah-", "#ayah-0", "#ayah-01", "#verse-3", "#ayah-3x"])(
    "ignores the hash %p",
    (hash) => expect(parseAyahHash(hash)).toBeNull()
  )
})

describe("parseAyahReference", () => {
  test("parses common reference formats", () => {
    expect(parseAyahReference("2:255")).toEqual({ surah: 2, ayah: 255 })
    expect(parseAyahReference(" 36 : 1 ")).toEqual({ surah: 36, ayah: 1 })
    expect(parseAyahReference("18.10")).toEqual({ surah: 18, ayah: 10 })
    expect(parseAyahReference("112 1")).toEqual({ surah: 112, ayah: 1 })
  })

  test("accepts Bangla digits", () => {
    expect(parseAyahReference("২:২৫৫")).toEqual({ surah: 2, ayah: 255 })
  })

  test("rejects references to ayahs that don't exist", () => {
    expect(parseAyahReference("1:8")).toBeNull()
    expect(parseAyahReference("115:1")).toBeNull()
    expect(parseAyahReference("2")).toBeNull()
    expect(parseAyahReference("fatiha")).toBeNull()
  })
})

test("adjacentSurahs wraps around like the original reader", () => {
  expect(adjacentSurahs(1).previous.number).toBe(114)
  expect(adjacentSurahs(1).next.number).toBe(2)
  expect(adjacentSurahs(114).next.number).toBe(1)
  expect(adjacentSurahs(50)).toMatchObject({ previous: { number: 49 }, next: { number: 51 } })
})

test("getSurah", () => {
  expect(getSurah(36)?.name).toBe("Ya-Sin")
  expect(getSurah(0)).toBeUndefined()
})
