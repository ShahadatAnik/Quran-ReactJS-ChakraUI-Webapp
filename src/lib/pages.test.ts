import { describe, expect, test } from "bun:test"
import { duas } from "@/content/duas"
import { posts } from "@/content/posts"
import {
  appPages,
  duaPages,
  fitLength,
  META_DESCRIPTION_RANGE,
  ogImagePath,
  ordinal,
  pageSlug,
  pages,
  postPages,
  relatedPages,
  SEO_TITLE_MAX,
  surahPages,
} from "@/lib/pages"

const [MIN, MAX] = META_DESCRIPTION_RANGE

describe("page registry", () => {
  test("lists every app page, every dua, all 114 surahs and every article", () => {
    expect(pages).toHaveLength(appPages.length + duas.length + 114 + posts.length)
    expect(duaPages.map((p) => p.path)).toContain("/duas/ayat-al-kursi")
    expect(surahPages.map((p) => p.path)).toContain("/surah/114")
  })

  test("paths and OG slugs are unique", () => {
    expect(new Set(pages.map((p) => p.path)).size).toBe(pages.length)
    expect(new Set(pages.map(pageSlug)).size).toBe(pages.length)
  })

  test("paths are absolute, lowercase and have no trailing slash", () => {
    for (const page of pages) expect(page.path).toMatch(/^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/)
  })

  test.each(pages.map((p) => [p.path, p] as const))(
    "%s has SEO fields within limits",
    (_, page) => {
      expect(page.seoTitle.length).toBeLessThanOrEqual(SEO_TITLE_MAX)
      expect(page.metaDescription.length).toBeGreaterThanOrEqual(MIN)
      expect(page.metaDescription.length).toBeLessThanOrEqual(MAX)
      expect(page.title.trim()).not.toBe("")
      expect(page.summary.trim()).not.toBe("")
    }
  )

  test("guided pages have a how-to and an FAQ with unique questions", () => {
    for (const page of pages) {
      if (page.kind !== "app" && page.kind !== "surah") continue
      expect(page.howTo.length).toBeGreaterThanOrEqual(3)
      expect(page.faqs.length).toBeGreaterThanOrEqual(3)
      expect(new Set(page.faqs.map((f) => f.question)).size).toBe(page.faqs.length)
    }
  })

  test("article pages are Bangla, app pages English", () => {
    expect(postPages.every((p) => p.lang === "bn")).toBe(true)
    expect(appPages.every((p) => p.lang === "en")).toBe(true)
  })

  test("surah FAQs state the real facts", () => {
    const baqarah = surahPages[1]
    expect(baqarah?.faqs[0]?.answer).toBe(
      "Surah Al-Baqarah has 286 ayahs. It is surah 2 of the 114 surahs of the Quran."
    )
    expect(baqarah?.faqs[3]?.answer).toContain("juz 1, 2 and 3")
    expect(surahPages[111]?.faqs[0]?.answer).toContain("has 4 ayahs")
  })
})

test("pageSlug and ogImagePath", () => {
  expect(pageSlug({ path: "/surah/2" })).toBe("surah-2")
  expect(ogImagePath("surah-2")).toBe("/og/surah-2.png")
})

describe("relatedPages", () => {
  test("surah pages link to their neighbours first", () => {
    const related = relatedPages(surahPages[1] as (typeof surahPages)[number])
    expect(related.slice(0, 2).map((p) => p.path)).toEqual(["/surah/1", "/surah/3"])
    expect(related.map((p) => p.path)).not.toContain("/surah/2")
  })

  test("Al-Fatihah has no previous neighbour and never relates to itself", () => {
    const related = relatedPages(surahPages[0] as (typeof surahPages)[number])
    expect(related[0]?.path).toBe("/surah/2")
    expect(new Set(related.map((p) => p.path)).size).toBe(related.length)
    expect(related.map((p) => p.path)).not.toContain("/surah/1")
  })

  test("articles in a series link to the rest of the series first", () => {
    const part1 = postPages.find((p) => p.post.slug === "dua-for-prophet-part-1")
    if (!part1) throw new Error("missing part 1")
    expect(
      relatedPages(part1)
        .slice(0, 4)
        .every((p) => p.kind === "post" && p.post.series?.part)
    ).toBe(true)
  })
})

test("fitLength picks the first candidate in range and throws when none fits", () => {
  expect(fitLength(["toolong", "ok", "fine"], 2, 4)).toBe("ok")
  expect(() => fitLength(["x"], 2, 4)).toThrow()
})

test.each([
  [1, "1st"],
  [2, "2nd"],
  [3, "3rd"],
  [4, "4th"],
  [11, "11th"],
  [12, "12th"],
  [13, "13th"],
  [21, "21st"],
  [92, "92nd"],
  [111, "111th"],
  [113, "113th"],
])("ordinal(%p) = %p", (n, expected) => {
  expect(ordinal(n)).toBe(expected)
})
