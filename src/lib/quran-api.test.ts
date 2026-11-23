import { afterEach, describe, expect, mock, test } from "bun:test"
import { fetchEditions, parseSurahEditions } from "@/lib/quran-api"

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"

const response = (...editions: [string, string[]][]) => ({
  code: 200,
  data: editions.map(([identifier, texts]) => ({
    edition: { identifier },
    ayahs: texts.map((text, i) => ({ numberInSurah: i + 1, text })),
  })),
})

describe("parseSurahEditions", () => {
  test("maps each edition to its ayah texts and strips the prepended Bismillah", () => {
    const json = response(
      ["quran-simple", [`${BISMILLAH} قُلْ هُوَ ٱللَّهُ أَحَدٌ`, "b", "c", "d"]],
      ["en.sahih", ["Say, He is Allah, One", "b", "c", "d"]]
    )
    expect(parseSurahEditions(json, 112, 4, ["quran-simple", "en.sahih"])).toEqual({
      "quran-simple": ["قُلْ هُوَ ٱللَّهُ أَحَدٌ", "b", "c", "d"],
      "en.sahih": ["Say, He is Allah, One", "b", "c", "d"],
    })
  })

  test("rejects an edition with the wrong number of ayahs instead of misaligning", () => {
    const json = response(["en.sahih", ["a", "b"]])
    expect(() => parseSurahEditions(json, 112, 4, ["en.sahih"])).toThrow(/en\.sahih/)
  })

  test("rejects a response missing a requested edition", () => {
    const json = response(["en.sahih", ["a", "b", "c", "d"]])
    expect(() => parseSurahEditions(json, 112, 4, ["en.sahih", "bn.hoque"])).toThrow(/bn\.hoque/)
  })

  test("rejects error payloads", () => {
    expect(() =>
      parseSurahEditions({ code: 404, data: "Not found" }, 112, 4, ["en.sahih"])
    ).toThrow()
    expect(() => parseSurahEditions(null, 112, 4, ["en.sahih"])).toThrow()
  })
})

describe("fetchEditions", () => {
  const realFetch = globalThis.fetch
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  test("shares one request between callers and retries after a failure", async () => {
    let calls = 0
    globalThis.fetch = mock(async () => {
      calls += 1
      if (calls === 1) return new Response("down", { status: 503 })
      return Response.json({
        data: [
          {
            identifier: "en.sahih",
            language: "en",
            name: "Saheeh International",
            englishName: "Saheeh International",
            format: "text",
            type: "translation",
          },
        ],
      })
    }) as unknown as typeof fetch

    await expect(fetchEditions()).rejects.toThrow(/503/)
    const [a, b] = await Promise.all([fetchEditions(), fetchEditions()])
    expect(a).toBe(b)
    expect(a.map((e) => e.identifier)).toEqual(["en.sahih"])
    expect(calls).toBe(2)
  })
})
