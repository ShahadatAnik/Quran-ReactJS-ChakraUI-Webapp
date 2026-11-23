import { afterEach, describe, expect, mock, test } from "bun:test"
import {
  decodeEntities,
  fetchTafsir,
  parseTafsirHtml,
  parseTafsirResponse,
  tafsirPageUrl,
  tafsirUrl,
} from "@/lib/tafsir"

describe("decodeEntities", () => {
  test("named and numeric entities", () => {
    expect(decodeEntities("a &amp; b &lt;c&gt; &quot;d&quot; &#39;e&#39; &#x2014; f&nbsp;g")).toBe(
      `a & b <c> "d" 'e' — f g`
    )
  })

  test("leaves unknown or invalid entities alone", () => {
    expect(decodeEntities("&unknown; &#0; &#xFFFFFFF;")).toBe("&unknown; &#0; &#xFFFFFFF;")
  })
})

describe("parseTafsirHtml", () => {
  test("splits the translation from numbered notes", () => {
    const html =
      "<p>আল্লাহ্‌ [১], তিনি ছাড়া কোন সত্য ইলাহ নেই [২]।</p><p>[১] এ আয়াতটিকে আয়াতুল কুরসী বলা হয়।</p><p>[২] দ্বিতীয় টীকা।</p>"
    const paragraphs = parseTafsirHtml(html)
    expect(paragraphs).toHaveLength(3)
    expect(paragraphs[0]?.note).toBeUndefined()
    expect(paragraphs[1]?.note).toBe("১")
    expect(paragraphs[1]?.segments[0]?.text).toBe("এ আয়াতটিকে আয়াতুল কুরসী বলা হয়।")
    expect(paragraphs[2]?.note).toBe("২")
  })

  test("keeps bold runs and drops every other tag", () => {
    const [paragraph] = parseTafsirHtml(
      '<p>শুরু <b>শানে নুযূল:</b> <span class="x">বিবরণ</span><script>alert(1)</script></p>'
    )
    expect(paragraph?.segments).toEqual([
      { text: "শুরু ", bold: false },
      { text: "শানে নুযূল:", bold: true },
      { text: " বিবরণalert(1)", bold: false },
    ])
  })

  test("ignores empty paragraphs and collapses whitespace", () => {
    expect(parseTafsirHtml("<p>  </p><p>এক\n   দুই</p><br/>")).toEqual([
      { segments: [{ text: "এক দুই", bold: false }] },
    ])
  })
})

describe("parseTafsirResponse", () => {
  test("reads tafsir.text", () => {
    expect(parseTafsirResponse({ tafsir: { text: "<p>টেক্সট</p>" } })).toHaveLength(1)
  })

  test.each([null, {}, { tafsir: {} }, { tafsir: { text: 5 } }])("rejects %p", (json) => {
    expect(() => parseTafsirResponse(json)).toThrow()
  })
})

test("URLs", () => {
  expect(tafsirUrl(2, 255)).toBe("https://api.quran.com/api/v4/tafsirs/166/by_ayah/2:255")
  expect(tafsirPageUrl(80, 1)).toBe("https://quran.com/80:1/tafsirs/bn-tafsir-abu-bakr-zakaria")
})

describe("fetchTafsir", () => {
  const realFetch = globalThis.fetch
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  test("caches successful results", async () => {
    const fake = mock(async () => Response.json({ tafsir: { text: "<p>এক</p>" } }))
    globalThis.fetch = fake as unknown as typeof fetch
    await fetchTafsir(10, 1)
    await fetchTafsir(10, 1)
    expect(fake).toHaveBeenCalledTimes(1)
  })

  test("doesn't cache failures, so a retry asks again", async () => {
    const fake = mock(async () => new Response("down", { status: 503 }))
    globalThis.fetch = fake as unknown as typeof fetch
    await expect(fetchTafsir(10, 2)).rejects.toThrow("503")
    await expect(fetchTafsir(10, 2)).rejects.toThrow("503")
    expect(fake).toHaveBeenCalledTimes(2)
  })
})
