import { describe, expect, test } from "bun:test"
import {
  arabicSizeScript,
  defaultReaderSettings,
  parseLastRead,
  parseReaderSettings,
  READER_STORAGE_KEY,
  type ReaderSettings,
  settingsOverrides,
  surahProgress,
} from "@/lib/reader-settings"

describe("settingsOverrides", () => {
  test("keeps only the settings that differ from the defaults", () => {
    expect(settingsOverrides(defaultReaderSettings)).toEqual({})
    expect(
      settingsOverrides({ ...defaultReaderSettings, arabicSize: "sm", reciter: "ar.husary" })
    ).toEqual({ arabicSize: "sm", reciter: "ar.husary" })
  })

  test("a stored copy of the defaults follows a later change of default", () => {
    // What the reader stores after picking only a size, read back with new defaults.
    const stored = settingsOverrides({ ...defaultReaderSettings, arabicSize: "xl" })
    expect({ ...defaultReaderSettings, ...stored }.arabicEdition).toBe(
      defaultReaderSettings.arabicEdition
    )
    expect(defaultReaderSettings.arabicEdition).toBe("quran-simple")
  })
})

describe("parseReaderSettings", () => {
  test("returns defaults for missing or non-object values", () => {
    expect(parseReaderSettings(undefined)).toEqual(defaultReaderSettings)
    expect(parseReaderSettings(null)).toEqual(defaultReaderSettings)
    expect(parseReaderSettings("dark")).toEqual(defaultReaderSettings)
  })

  test("keeps valid values", () => {
    const settings: ReaderSettings = {
      arabicEdition: "quran-simple",
      translationEdition: "en.sahih",
      showTranslation: false,
      arabicSize: "xl",
      reciter: "ar.husary",
    }
    expect(parseReaderSettings(settings)).toEqual(settings)
  })

  test("replaces invalid fields one by one", () => {
    const parsed = parseReaderSettings({
      arabicEdition: "<script>",
      translationEdition: 42,
      showTranslation: "yes",
      arabicSize: "huge",
      reciter: "ar.unknown",
      extra: true,
    })
    expect(parsed).toEqual(defaultReaderSettings)
  })
})

describe("parseLastRead", () => {
  test("accepts a real ayah", () => {
    expect(parseLastRead({ surah: 2, ayah: 255 })).toEqual({ surah: 2, ayah: 255 })
  })

  test.each([null, {}, { surah: 2 }, { surah: 1, ayah: 8 }, { surah: "2", ayah: 1 }, 5])(
    "rejects %p",
    (value) => expect(parseLastRead(value)).toBeNull()
  )
})

test("surahProgress", () => {
  expect(surahProgress({ surah: 1, ayah: 7 })).toBe(100)
  expect(surahProgress({ surah: 2, ayah: 143 })).toBe(50)
  expect(surahProgress({ surah: 999, ayah: 1 })).toBe(0)
})

describe("arabicSizeScript", () => {
  const run = (stored: string | null): string | undefined => {
    delete document.documentElement.dataset.arabicSize
    if (stored === null) localStorage.removeItem(READER_STORAGE_KEY)
    else localStorage.setItem(READER_STORAGE_KEY, stored)
    new Function(arabicSizeScript)()
    return document.documentElement.dataset.arabicSize
  }

  test("puts the saved size on <html> before the app loads", () => {
    expect(run(JSON.stringify({ arabicSize: "sm" }))).toBe("sm")
  })

  test("leaves the default alone when nothing valid is saved", () => {
    expect(run(null)).toBeUndefined()
    expect(run(JSON.stringify({ arabicSize: "huge" }))).toBeUndefined()
    expect(run("not json")).toBeUndefined()
  })

  test("puts the size back when React clears the attributes of <html>", async () => {
    const root = document.documentElement
    expect(run(JSON.stringify({ arabicSize: "xl" }))).toBe("xl")
    // What React does to <html> when it renders the page again after a failed hydration.
    while (root.attributes.length) root.removeAttributeNode(root.attributes[0] as Attr)
    root.setAttribute("lang", "en")
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(root.dataset.arabicSize).toBe("xl")
  })
})
