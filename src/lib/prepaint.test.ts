import { afterEach, describe, expect, test } from "bun:test"
import { prepaintConfig as c, prepaintScript } from "@/lib/prepaint"
import { emptyLog, parseReadingLog, readingStats, recordRead } from "@/lib/reading-log"

const root = document.documentElement
const run = () => new Function(prepaintScript)()
const save = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value))
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0))

afterEach(() => {
  localStorage.clear()
  while (root.attributes.length) root.removeAttributeNode(root.attributes[0] as Attr)
})

describe("prepaintScript", () => {
  test("a new visitor: nothing saved", () => {
    run()
    expect(root.dataset.frequent).toBe("0")
    expect(root.dataset.prayer).toBe("none")
    expect(root.dataset.translation).toBe("default")
    expect(root.dataset.arabicEdition).toBe("default")
    expect(root.dataset.ayah).toBe("default")
    expect(root.dataset.surahFilter).toBe("off")
    expect(root.dataset.search).toBe("none")
    expect(["mac", "other"]).toContain(root.dataset.platform as string)
  })

  test("counts the cards of “Your most-read surahs” as the page will", () => {
    let log = emptyLog()
    const reads: [number, number, string][] = [
      [1, 1, "2026-11-20T08:00:00"],
      [1, 2, "2026-11-21T08:00:00"],
      [2, 255, "2026-11-21T09:00:00"],
      [18, 10, "2026-11-22T09:00:00"],
      [36, 1, "2026-11-23T09:00:00"],
      [67, 1, "2026-11-24T09:00:00"],
      [112, 1, "2026-11-24T10:00:00"],
      [114, 1, "2026-11-25T10:00:00"],
    ]
    for (const [count, expected] of [
      [4, "3"],
      [8, "6"],
    ] as const) {
      log = emptyLog()
      for (const [surah, ayah, at] of reads.slice(0, count)) {
        log = recordRead(log, surah, ayah, new Date(at), null)
      }
      save(c.readingLog, log)
      run()
      const page = readingStats(parseReadingLog(log), new Date("2026-11-25T12:00:00"))
      expect(root.dataset.frequent).toBe(expected)
      expect(String(Math.min(page.frequency.length, c.frequentLimit))).toBe(expected)
    }
  })

  test("ignores a malformed log", () => {
    save(c.readingLog, { version: 1, days: { yesterday: { surahs: { 2: "1-3" } } } })
    run()
    expect(root.dataset.frequent).toBe("0")
  })

  test("reads the prayer location and reader settings", () => {
    save(c.prayer, { location: { latitude: 23.8, longitude: 90.4, timeZone: "Asia/Dhaka" } })
    save(c.reader, { showTranslation: false, arabicEdition: "quran-uthmani" })
    save(c.ayah, { surah: 36, ayah: 1 })
    save(c.surahFilter, "cave")
    save(c.search, "mercy")
    run()
    expect(root.dataset.prayer).toBe("located")
    expect(root.dataset.translation).toBe("hidden")
    expect(root.dataset.arabicEdition).toBe("custom")
    expect(root.dataset.ayah).toBe("custom")
    expect(root.dataset.surahFilter).toBe("on")
    expect(root.dataset.search).toBe("query")
  })

  test("shows just the surahs a saved filter matched", () => {
    save(c.surahFilter, "cave")
    save(c.surahMatches, [18])
    run()
    expect(root.dataset.surahFilter).toBe("matched")
    expect(document.getElementById("surah-filter-style")?.textContent).toBe(
      '[data-surah-list]>li:not([data-surah="18"]){display:none}'
    )
    localStorage.removeItem(c.surahFilter)
    run()
    expect(root.dataset.surahFilter).toBe("off")
    expect(document.getElementById("surah-filter-style")).toBeNull()
  })

  test("another translation, and a search too short to run", () => {
    save(c.reader, { translationEdition: "en.sahih" })
    save(c.search, "a")
    run()
    expect(root.dataset.translation).toBe("custom")
    expect(root.dataset.search).toBe("none")
  })

  test("puts the attributes back when React clears the attributes of <html>", async () => {
    save(c.prayer, { location: { latitude: 23.8, longitude: 90.4 } })
    run()
    while (root.attributes.length) root.removeAttributeNode(root.attributes[0] as Attr)
    await nextTask()
    expect(root.dataset.prayer).toBe("located")
    expect(root.dataset.frequent).toBe("0")
  })
})
