import { describe, expect, test } from "bun:test"
import {
  arabicEditions,
  arabicScriptLabel,
  type Edition,
  editionLabel,
  editionName,
  groupByLanguage,
  isRtl,
  languageName,
  languageOfId,
  nativeLanguageName,
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
  e("quran-uthmani-quran-academy", "ar", "text", "quran"),
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

test("arabicScriptLabel drops the language and shortens long names", () => {
  expect(
    arabicScriptLabel({ ...e("quran-simple", "ar", "text", "quran"), englishName: "Simple" })
  ).toBe("Simple")
  expect(
    arabicScriptLabel({
      ...e("quran-unicode", "ar", "text", "quran"),
      englishName: "Unicode Quran text from Khaled Hosny",
    })
  ).toBe("Unicode (Khaled Hosny)")
})

describe("translation list clean-up", () => {
  test("files Mehanović under Bosnian and drops the Buckwalter transliteration", () => {
    const parsed = parseEditions({
      data: [
        e("ba.mehanovic", "ba", "text", "translation"),
        e("quran-buck", "ar", "text", "translation"),
      ],
    })
    expect(parsed[0]?.language).toBe("bs")
    expect(ids(translationEditions(parsed))).toEqual(["ba.mehanovic"])
    expect(ids(searchableEditions(parsed))).toEqual(["ba.mehanovic"])
  })

  test("names every language, in English and in its own script", () => {
    expect(nativeLanguageName("bn")).toBe("বাংলা")
    expect(nativeLanguageName("fr")).toBe("Français")
    expect(nativeLanguageName("en")).toBeUndefined()
    expect(languageName("ber")).toBe("Amazigh")
    expect(nativeLanguageName("ber")).toBe("ⵜⴰⵎⴰⵣⵉⵖⵜ")
  })

  test("editionName trims filler and credits unknown translators honestly", () => {
    const named = (englishName: string) => ({
      ...e("x.y", "en", "text", "translation"),
      englishName,
    })
    expect(editionName(named("Muhiuddin Khan"))).toBe("Muhiuddin Khan")
    expect(editionName(named("Quran translation by Muhamed Mehanovic"))).toBe("Muhamed Mehanovic")
    expect(editionName(named("Translation by Ghazi Muhammed Hashim"))).toBe("Ghazi Muhammed Hashim")
    expect(editionName(named("Preklad I. Hrbek"))).toBe("I. Hrbek")
    expect(editionName(named("Unknown"))).toBe("Translator not credited")
    expect(
      editionName({ ...e("quran-simple", "ar", "text", "quran"), englishName: "Simple" })
    ).toBe("Simple")
  })

  test("groupByLanguage puts Bangla, English and Arabic first", () => {
    const groups = groupByLanguage([
      e("ur.jalandhry", "ur", "text", "translation"),
      e("en.sahih", "en", "text", "translation"),
      e("de.bubenheim", "de", "text", "translation"),
      e("bn.hoque", "bn", "text", "translation"),
      e("bn.bengali", "bn", "text", "translation"),
    ])
    expect(groups.map((g) => g.code)).toEqual(["bn", "en", "de", "ur"])
    expect(ids(groups[0]?.editions ?? [])).toEqual(["bn.hoque", "bn.bengali"])
    expect(groups[3]?.native).toBe("اردو")
  })

  test("languageOfId", () => {
    expect(languageOfId("bn.bengali")).toBe("bn")
    expect(languageOfId("quran-simple")).toBe("ar")
  })
})
