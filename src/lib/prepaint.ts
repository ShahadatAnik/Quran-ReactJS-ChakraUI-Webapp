import { DEFAULT_ARABIC_EDITION, DEFAULT_TRANSLATION_EDITION } from "@/lib/editions"
import { PRAYER_STORAGE_KEY } from "@/lib/prayer-settings"
import { READER_STORAGE_KEY } from "@/lib/reader-settings"
import { READING_LOG_KEY } from "@/lib/reading-log"
import { MIN_SEARCH_LENGTH } from "@/lib/search"
import { STORAGE_PREFIX } from "@/lib/site"

/**
 * What the page's layout depends on in this browser, read before the first paint and set as
 * data attributes on <html>, so the prerendered page reserves exactly the space the real
 * content will take and nothing moves when it fills in (styles.css, "Pre-paint layout"):
 *
 * - `data-platform`: "mac" or "other", for the ⌘K / Ctrl K hint.
 * - `data-frequent`: how many cards "Your most-read surahs" will show (0 hides it).
 * - `data-prayer`: "located" once a prayer-times location is saved; `data-prayer-note`: "on"
 *   when its time zone isn't this device's (the dashboard then has a line saying so).
 * - `data-translation`: "hidden" or "custom" (another translation than the bundled one).
 * - `data-arabic-edition`: "custom" for another script than the bundled one.
 * - `data-ayah`: "custom" when Find an Ayah will show another ayah than Ayat al-Kursi.
 * - `data-surah-filter`: "matched" when the surah list will be filtered and the surahs it
 *   matched last time are known (a style shows only those), "on" when they aren't.
 * - `data-search`: "query" when the search page will run a search.
 *
 * Like the theme script, it puts the attributes back if React clears the attributes of <html>
 * after a failed hydration.
 */
export interface PrepaintConfig {
  reader: string
  readingLog: string
  prayer: string
  ayah: string
  surahFilter: string
  surahRevelation: string
  /** The surahs the saved filter matched, saved by the surah list. */
  surahMatches: string
  search: string
  arabicEdition: string
  translationEdition: string
  /** Most cards "Your most-read surahs" shows. */
  frequentLimit: number
  /** Shortest query the search runs. */
  minSearchLength: number
}

export const prepaintConfig: PrepaintConfig = {
  reader: READER_STORAGE_KEY,
  readingLog: READING_LOG_KEY,
  prayer: PRAYER_STORAGE_KEY,
  ayah: `${STORAGE_PREFIX}ayah`,
  surahFilter: `${STORAGE_PREFIX}surah-filter`,
  surahRevelation: `${STORAGE_PREFIX}surah-revelation`,
  surahMatches: `${STORAGE_PREFIX}surah-filter-matches`,
  search: `${STORAGE_PREFIX}search-query`,
  arabicEdition: DEFAULT_ARABIC_EDITION,
  translationEdition: DEFAULT_TRANSLATION_EDITION,
  frequentLimit: 6,
  minSearchLength: MIN_SEARCH_LENGTH,
}

/**
 * Runs as an inline script (its source is inlined by `prepaintScript`), so it uses only its
 * argument and browser globals.
 */
export function prepaint(c: PrepaintConfig): void {
  const r = document.documentElement
  function read(key: string): unknown {
    try {
      return JSON.parse(localStorage.getItem(key) || "null")
    } catch {
      return null
    }
  }
  function apply() {
    const d = r.dataset
    d.platform = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "mac" : "other"

    // Distinct surahs with any reading: the cards of "Your most-read surahs".
    const log = read(c.readingLog) as { version?: number; days?: Record<string, unknown> } | null
    const seen: Record<string, boolean> = {}
    let count = 0
    const days = log && log.version === 1 ? log.days : null
    if (days && typeof days === "object") {
      for (const day in days) {
        const surahs = (days[day] as { surahs?: Record<string, unknown> } | null)?.surahs
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !surahs || typeof surahs !== "object") continue
        for (const n in surahs) {
          const ranges = surahs[n]
          if (seen[n] || !(+n >= 1 && +n <= 114) || typeof ranges !== "string") continue
          if (!/[1-9]/.test(ranges)) continue
          seen[n] = true
          count++
        }
      }
    }
    d.frequent = String(Math.min(count, c.frequentLimit))

    const prayer = read(c.prayer) as {
      location?: { latitude?: unknown; longitude?: unknown; timeZone?: unknown }
    } | null
    const at = prayer?.location
    d.prayer =
      at && typeof at.latitude === "number" && typeof at.longitude === "number" ? "located" : "none"
    // The dashboard notes when the location's time zone isn't this device's.
    let zone = ""
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone
    } catch {
      // Without Intl's time zone, no note.
    }
    d.prayerNote = at && typeof at.timeZone === "string" && at.timeZone !== zone ? "on" : "off"

    const reader = (read(c.reader) || {}) as Record<string, unknown>
    const edition = (x: unknown, fallback: string) =>
      typeof x === "string" && /^[a-z0-9.-]{3,40}$/.test(x) ? x : fallback
    d.translation =
      reader.showTranslation === false
        ? "hidden"
        : edition(reader.translationEdition, c.translationEdition) !== c.translationEdition
          ? "custom"
          : "default"
    d.arabicEdition =
      edition(reader.arabicEdition, c.arabicEdition) !== c.arabicEdition ? "custom" : "default"

    const ayah = read(c.ayah) as { surah?: unknown; ayah?: unknown } | null
    d.ayah =
      ayah && typeof ayah.surah === "number" && !(ayah.surah === 2 && ayah.ayah === 255)
        ? "custom"
        : "default"

    const filter = read(c.surahFilter)
    const revelation = read(c.surahRevelation)
    const filtered =
      (typeof filter === "string" && filter.trim()) ||
      revelation === "Meccan" ||
      revelation === "Medinan"
    // The cards the filter matched last time: the list shows just those from the first paint.
    // Without them (or with none), the list stays hidden until the filter applies.
    const matches = filtered ? read(c.surahMatches) : null
    const numbers = Array.isArray(matches)
      ? matches.filter((n) => typeof n === "number" && n >= 1 && n <= 114)
      : []
    d.surahFilter = !filtered ? "off" : numbers.length ? "matched" : "on"
    let style = document.getElementById("surah-filter-style")
    if (numbers.length) {
      if (!style) {
        style = document.createElement("style")
        style.id = "surah-filter-style"
        document.head.appendChild(style)
      }
      style.textContent = `[data-surah-list]>li${numbers.map((n) => `:not([data-surah="${n}"])`).join("")}{display:none}`
    } else style?.remove()

    const query = read(c.search)
    d.search =
      /[?&]q=[^&]/.test(location.search) ||
      (typeof query === "string" && [...query.trim()].length >= c.minSearchLength)
        ? "query"
        : "none"
  }
  apply()
  try {
    new MutationObserver(() => {
      if (!r.hasAttribute("data-platform")) apply()
    }).observe(r, { attributes: true })
  } catch {
    // No MutationObserver: the attributes still apply to the first paint.
  }
}

/** The inline script: `prepaint` with its configuration. */
export const prepaintScript = `(${prepaint.toString()})(${JSON.stringify(prepaintConfig)})`
