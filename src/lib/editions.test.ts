import { describe, expect, test } from "bun:test"
import {
  arabicEditions,
  type Edition,
  editionLabel,
  isRtl,
  languageName,
  parseEditions,
  reciterEditions,
  searchableEditions,
  sortEditions,
  translationEditions,
  translationLocale,
} from "@/lib/editions"

const e = (identifier: string, language: string, format: Edition["format"], type: string) =>
  ({ identifier, language, name: identifier, englishName: identifier, format, type }) as Edition

const editions = [
  e("quran-uthmani", "ar", "text", "quran"),
  e("quran-tajweed", "ar", "text", "quran"),
  e("quran-wordbyword", "ar", "text", "quran"),
  e("en.sahih", "en", "text", "translation"),
  e("bn.bengali", "bn", "text", "translation"),
  e("ur.jalandhry", "ur", "text", "translation"),
  e("en.jalalayn", "en", "text", "tafsir"),
  e("ar.alafasy", "ar", "audio", "versebyverse"),
  e("en.walk", "en", "audio", "translation"),
]
const ids = (list: Edition[]) => list.map((x) => x.identifier)

describe("edition groups", () => {
  test("arabic editions exclude ones that aren't plain text", () => {
    expect(ids(arabicEditions(editions))).toEqual(["quran-uthmani"])
  })

  test("translations are text translations sorted by language name", () => {
    expect(ids(translationEditions(editions))).toEqual(["bn.bengali", "en.sahih", "ur.jalandhry"])
  })

  test("search only offers text editions (the old page offered audio ones too)", () => {
    const searchable = ids(searchableEditions(editions))
    expect(searchable).not.toContain("ar.alafasy")
    expect(searchable).not.toContain("en.walk")
    expect(searchable).not.toContain("quran-tajweed")
    expect(searchable).toContain("quran-uthmani")
    expect(searchable).toContain("bn.bengali")
  })

  test("reciters are Arabic verse-by-verse audio editions", () => {
    expect(ids(reciterEditions(editions))).toEqual(["ar.alafasy"])
  })

  test("sorting never mutates its input (the old selects sorted state in place)", () => {
    const input = [editions[5], editions[3]] as Edition[]
    const before = ids(input)
    sortEditions(input)
    expect(ids(input)).toEqual(before)
  })
})

test("parseEditions drops malformed entries", () => {
  expect(parseEditions({ data: [editions[0], { identifier: 1 }, null] })).toHaveLength(1)
  expect(parseEditions({ data: "error" })).toEqual([])
  expect(parseEditions(undefined)).toEqual([])
})

test("languageName and editionLabel", () => {
  expect(languageName("bn")).toBe("Bangla")
  expect(languageName("en")).toBe("English")
  expect(languageName("zz")).toBe("ZZ")
  expect(editionLabel(e("en.sahih", "en", "text", "translation"))).toBe("English: en.sahih")
})

test("isRtl", () => {
  expect(isRtl({ language: "ur", direction: null })).toBe(true)
  expect(isRtl({ language: "en", direction: "ltr" })).toBe(false)
  expect(isRtl({ language: "en", direction: "rtl" })).toBe(true)
  expect(isRtl(undefined)).toBe(false)
})

test("translationLocale", () => {
  expect(translationLocale("bn.bengali", true)).toEqual({ lang: "bn", dir: "ltr" })
  // The bundled Bangla stays on screen until the chosen edition has loaded.
  expect(translationLocale("ur.jalandhry", false)).toEqual({ lang: "bn", dir: "ltr" })
  expect(translationLocale("ur.jalandhry", true)).toEqual({ lang: "ur", dir: "rtl" })
  expect(translationLocale("en.sahih", true)).toEqual({ lang: "en", dir: "ltr" })
})
