import { describe, expect, test } from "bun:test"
import { filterSurahs, foldLatin, highlight, parseSearchResponse, searchUrl } from "@/lib/search"

const numbers = (query: string) => filterSurahs(query).map((s) => s.number)

describe("filterSurahs", () => {
  test("matches any transliteration (the old filter missed 'fatiha')", () => {
    expect(numbers("fatiha")).toEqual([1])
    expect(numbers("Al-Faatiha")).toEqual([1])
    expect(numbers("baqara")).toEqual([2])
    expect(numbers("yasin")).toEqual([36])
    expect(numbers("ya sin")).toEqual([36])
  })

  test("matches English and Bangla meanings", () => {
    expect(numbers("the cow")).toContain(2)
    expect(numbers("সূচনা")).toEqual([1])
  })

  test("matches the Arabic name with or without diacritics", () => {
    expect(numbers("الفاتحة")).toEqual([1])
    expect(numbers("البقرة")).toEqual([2])
  })

  test("matches numbers exactly, not as substrings", () => {
    expect(numbers("2")).toEqual([2])
    expect(numbers("114")).toEqual([114])
  })

  test("requires every term to match", () => {
    expect(numbers("al baqarah")).toEqual([2])
    expect(numbers("fatiha cow")).toEqual([])
  })

  test("returns everything for an empty query, and a copy", () => {
    const all = filterSurahs("   ")
    expect(all).toHaveLength(114)
    all.pop()
    expect(filterSurahs("")).toHaveLength(114)
  })
})

test("foldLatin", () => {
  expect(foldLatin("Al-Fātiĥah")).toBe("alfatihah")
  expect(foldLatin("Aal-i-Imraan")).toBe("alimran")
  expect(foldLatin("Ali 'Imran")).toBe("alimran")
})

describe("searchUrl", () => {
  test("encodes the keyword and edition", () => {
    expect(searchUrl("mercy", "en.asad")).toBe(
      "https://api.alquran.cloud/v1/search/mercy/all/en.asad"
    )
    expect(searchUrl("a/b?c", "en.asad")).toBe(
      "https://api.alquran.cloud/v1/search/a%2Fb%3Fc/all/en.asad"
    )
    expect(searchUrl("দ\u09AF\u09BCা", "bn.bengali")).toContain("/search/%E0%A6%A6")
  })

  test("collapses whitespace", () => {
    expect(searchUrl("  day   of  ", "en.asad")).toContain("/search/day%20of/")
  })

  test("returns null for empty or one-letter terms (the old page searched for '')", () => {
    expect(searchUrl("", "en.asad")).toBeNull()
    expect(searchUrl("   ", "en.asad")).toBeNull()
    expect(searchUrl("a", "en.asad")).toBeNull()
    expect(searchUrl("ab", "")).toBeNull()
  })
})

describe("parseSearchResponse", () => {
  test("reads matches", () => {
    const json = {
      code: 200,
      data: {
        count: 1,
        matches: [{ number: 262, text: "Allah", surah: { number: 2 }, numberInSurah: 255 }],
      },
    }
    expect(parseSearchResponse(json)).toEqual([{ surah: 2, ayah: 255, text: "Allah" }])
  })

  test("treats the API's 404 'nothing found' string as no results", () => {
    const json = {
      code: 404,
      status: "NOT FOUND",
      data: "Nothing matching your search was found..",
    }
    expect(parseSearchResponse(json)).toEqual([])
  })

  test("survives malformed input", () => {
    expect(parseSearchResponse(null)).toEqual([])
    expect(parseSearchResponse("oops")).toEqual([])
    expect(parseSearchResponse({ data: { matches: [{ text: 1 }, null] } })).toEqual([])
  })
})

describe("highlight", () => {
  const join = (segments: { text: string }[]) => segments.map((s) => s.text).join("")

  test("marks every case-insensitive occurrence", () => {
    const segments = highlight("Mercy upon mercy", "mercy")
    expect(segments).toEqual([
      { text: "Mercy", match: true },
      { text: " upon ", match: false },
      { text: "mercy", match: true },
    ])
  })

  test("highlights several terms and always rebuilds the original text", () => {
    const text = "The Day of Judgment is a day of truth."
    const segments = highlight(text, "day truth")
    expect(join(segments)).toBe(text)
    expect(segments.filter((s) => s.match).map((s) => s.text)).toEqual(["Day", "day", "truth"])
  })

  test("treats regex characters literally", () => {
    expect(highlight("a (b) c", "(b)")).toEqual([
      { text: "a ", match: false },
      { text: "(b)", match: true },
      { text: " c", match: false },
    ])
  })

  test("works with Bangla", () => {
    expect(highlight("আল্লাহ দয়ালু", "দয়ালু").at(-1)).toEqual({ text: "দয়ালু", match: true })
  })

  test("returns the text unmarked for an empty query", () => {
    expect(highlight("text", " ")).toEqual([{ text: "text", match: false }])
    expect(highlight("", "x")).toEqual([])
  })
})

describe("Unicode normalization", () => {
  // "য়" is U+09DF precomposed, or য (U+09AF) + nukta (U+09BC); U+09DF is a composition
  // exclusion, so the API's text and a typed query can differ byte-for-byte.
  const precomposed = "দ\u09DFা"
  const decomposed = "দ\u09AF\u09BCা"

  test("highlight matches either encoding of the same Bangla letters", () => {
    const segments = highlight(`আল্লাহ ${decomposed}ালু`, precomposed)
    expect(segments.filter((s) => s.match)).toHaveLength(1)
    expect(highlight(`${precomposed}`, decomposed).filter((s) => s.match)).toHaveLength(1)
  })

  test("filterSurahs matches Bangla meanings in either encoding", () => {
    const meaning = filterSurahs("").find((s) => s.meaningBn.normalize("NFD").includes("়"))
    if (!meaning) return
    const other =
      meaning.meaningBn.normalize("NFC") === meaning.meaningBn
        ? meaning.meaningBn.normalize("NFD")
        : meaning.meaningBn.normalize("NFC")
    expect(filterSurahs(other).map((s) => s.number)).toContain(meaning.number)
  })
})
