/**
 * The reader's history, kept in this browser only. An ayah counts as read once it has been on
 * screen for READ_AFTER_MS (see use-reading-tracker.ts). Per day the log keeps which ayahs of
 * which surahs were read, as compact ranges, and roughly how long the reader spent reading.
 */
import { STORAGE_PREFIX } from "@/lib/site"
import { AYAH_COUNT, getSurah, isAyahOf } from "@/lib/surahs"

export const READING_LOG_KEY = `${STORAGE_PREFIX}reading-log`
/** How long an ayah has to stay on screen to count as read. */
export const READ_AFTER_MS = 2000
/** Gaps longer than this between two read ayahs don't count as reading time. */
const SESSION_GAP_S = 5 * 60

export interface DayLog {
  /** Surah number → ayahs read that day, as sorted ranges ("1-40,45"). */
  surahs: Record<string, string>
  /** Approximate seconds spent reading. */
  seconds: number
}

export interface ReadingLog {
  version: 1
  /** Local date (YYYY-MM-DD) → that day's reading. */
  days: Record<string, DayLog>
}

export const emptyLog = (): ReadingLog => ({ version: 1, days: {} })

// ---------- ayah ranges ----------

/** "1-3,7" → [1, 2, 3, 7]; anything malformed is skipped. */
export function parseRanges(ranges: string): number[] {
  const out: number[] = []
  for (const part of ranges.split(",")) {
    const [a, b] = part.split("-").map(Number)
    if (!Number.isInteger(a) || (a as number) < 1) continue
    const end = b === undefined ? (a as number) : b
    if (!Number.isInteger(end) || end < (a as number) || end - (a as number) > 300) continue
    for (let n = a as number; n <= end; n++) out.push(n)
  }
  return [...new Set(out)].sort((x, y) => x - y)
}

/** [1, 2, 3, 7] → "1-3,7" (input in any order, duplicates ignored). */
export function formatRanges(ayahs: Iterable<number>): string {
  const sorted = [...new Set(ayahs)].sort((x, y) => x - y)
  const parts: string[] = []
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i] as number
    let end = start
    while (sorted[i + 1] === end + 1) {
      end += 1
      i += 1
    }
    parts.push(start === end ? `${start}` : `${start}-${end}`)
  }
  return parts.join(",")
}

/** "1-40,45" for display: "1–40, 45". */
export const displayRanges = (ranges: string) => ranges.replaceAll("-", "–").replaceAll(",", ", ")

// ---------- dates ----------

/** Local calendar date as YYYY-MM-DD. */
export function dayKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const DAY_KEY = /^\d{4}-\d{2}-\d{2}$/

/** The date `days` before `date` (negative for after), at local midnight. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - days)
}

// ---------- parsing & recording ----------

/** Validates stored data; anything malformed is dropped rather than trusted. */
export function parseReadingLog(value: unknown): ReadingLog {
  const log = emptyLog()
  const days = (value as { version?: unknown; days?: unknown } | null)?.days
  if ((value as { version?: unknown } | null)?.version !== 1 || typeof days !== "object" || !days) {
    return log
  }
  for (const [key, day] of Object.entries(days as Record<string, unknown>)) {
    if (!DAY_KEY.test(key) || typeof day !== "object" || !day) continue
    const { surahs: read, seconds } = day as { surahs?: unknown; seconds?: unknown }
    if (typeof read !== "object" || !read) continue
    const clean: Record<string, string> = {}
    for (const [surah, ranges] of Object.entries(read as Record<string, unknown>)) {
      const n = Number(surah)
      if (typeof ranges !== "string") continue
      const ayahs = parseRanges(ranges).filter((a) => isAyahOf(n, a))
      if (ayahs.length) clean[String(n)] = formatRanges(ayahs)
    }
    if (Object.keys(clean).length === 0) continue
    log.days[key] = {
      surahs: clean,
      seconds: typeof seconds === "number" && seconds > 0 ? Math.round(seconds) : 0,
    }
  }
  return log
}

/**
 * The log with one more ayah read at `at`. `sinceLastRead` is the number of seconds since
 * the previous ayah was read in this visit (null for the first one), which becomes reading
 * time unless the reader was away longer than a session gap.
 */
export function recordRead(
  log: ReadingLog,
  surah: number,
  ayah: number,
  at: Date,
  sinceLastRead: number | null
): ReadingLog {
  if (!isAyahOf(surah, ayah)) return log
  const key = dayKey(at)
  const day = log.days[key] ?? { surahs: {}, seconds: 0 }
  const already = parseRanges(day.surahs[String(surah)] ?? "")
  const elapsed =
    sinceLastRead !== null && sinceLastRead >= 0 && sinceLastRead <= SESSION_GAP_S
      ? sinceLastRead
      : READ_AFTER_MS / 1000
  return {
    ...log,
    days: {
      ...log.days,
      [key]: {
        surahs: { ...day.surahs, [String(surah)]: formatRanges([...already, ayah]) },
        seconds: Math.round(day.seconds + elapsed),
      },
    },
  }
}

// ---------- statistics ----------

export interface SurahFrequency {
  surah: number
  /** Days on which any ayah of the surah was read. */
  days: number
  /** Different ayahs of the surah read, ever. */
  covered: number
}

export interface DaySummary {
  date: string
  /** Surahs read that day, in Quran order, with their ayah ranges. */
  entries: { surah: number; ranges: string }[]
  ayahs: number
  seconds: number
}

export interface ReadingStats {
  /** Different ayahs read, ever, out of AYAH_COUNT. */
  covered: number
  /** Surahs whose every ayah has been read. */
  surahsComplete: number
  daysActive: number
  /** Consecutive days with reading, ending today (or yesterday, if today has none yet). */
  currentStreak: number
  longestStreak: number
  /** Most-read surahs first (by days, then by ayahs covered). */
  frequency: SurahFrequency[]
  /** Newest day first. */
  days: DaySummary[]
}

export function readingStats(log: ReadingLog, today: Date): ReadingStats {
  const coveredBySurah = new Map<number, Set<number>>()
  const daysBySurah = new Map<number, number>()
  const days: DaySummary[] = []

  for (const [date, day] of Object.entries(log.days)) {
    const entries = Object.entries(day.surahs)
      .map(([surah, ranges]) => ({ surah: Number(surah), ranges }))
      .sort((a, b) => a.surah - b.surah)
    let ayahs = 0
    for (const { surah, ranges } of entries) {
      const read = parseRanges(ranges)
      ayahs += read.length
      const covered = coveredBySurah.get(surah) ?? new Set<number>()
      for (const a of read) covered.add(a)
      coveredBySurah.set(surah, covered)
      daysBySurah.set(surah, (daysBySurah.get(surah) ?? 0) + 1)
    }
    days.push({ date, entries, ayahs, seconds: day.seconds })
  }
  days.sort((a, b) => b.date.localeCompare(a.date))

  let covered = 0
  let surahsComplete = 0
  for (const [surah, set] of coveredBySurah) {
    covered += set.size
    if (set.size === getSurah(surah)?.ayahs) surahsComplete += 1
  }

  const frequency = [...daysBySurah.entries()]
    .map(([surah, count]) => ({
      surah,
      days: count,
      covered: coveredBySurah.get(surah)?.size ?? 0,
    }))
    .sort((a, b) => b.days - a.days || b.covered - a.covered || a.surah - b.surah)

  // Streaks walk calendar days, so they are right across month and year ends.
  const active = new Set(days.map((d) => d.date))
  let currentStreak = 0
  const start = active.has(dayKey(today)) ? 0 : 1
  while (active.has(dayKey(addDays(today, start + currentStreak)))) currentStreak += 1

  let longestStreak = 0
  for (const date of active) {
    const [y, m, d] = date.split("-").map(Number)
    const day = new Date(y as number, (m as number) - 1, d)
    if (active.has(dayKey(addDays(day, 1)))) continue // not the first day of a run
    let run = 1
    while (active.has(dayKey(addDays(day, -run)))) run += 1
    longestStreak = Math.max(longestStreak, run)
  }

  return {
    covered,
    surahsComplete,
    daysActive: active.size,
    currentStreak,
    longestStreak,
    frequency,
    days,
  }
}

/** Share of the whole Quran covered, 0–1. */
export const khatmShare = (covered: number) => Math.min(1, covered / AYAH_COUNT)

export interface HeatmapCell {
  date: string
  ayahs: number
  /** 0 for no reading, then 1–4 by how much was read compared with the busiest day shown. */
  level: 0 | 1 | 2 | 3 | 4
  /** Days after `today` are placeholders that fill out the last week. */
  future: boolean
}

/**
 * The last `weeks` weeks as columns of seven days (Saturday first, as in Bangladesh), ending
 * with the week that contains `today`.
 */
export function heatmap(stats: ReadingStats, today: Date, weeks: number): HeatmapCell[][] {
  const byDate = new Map(stats.days.map((d) => [d.date, d.ayahs]))
  // Days since the most recent Saturday (getDay: Sunday 0 … Saturday 6).
  const intoWeek = (today.getDay() + 1) % 7
  const first = addDays(today, intoWeek + (weeks - 1) * 7)
  const shown: number[] = []
  const columns: HeatmapCell[][] = []
  for (let w = 0; w < weeks; w++) {
    const column: HeatmapCell[] = []
    for (let d = 0; d < 7; d++) {
      const date = addDays(first, -(w * 7 + d))
      const future = date > today
      const ayahs = future ? 0 : (byDate.get(dayKey(date)) ?? 0)
      if (ayahs) shown.push(ayahs)
      column.push({ date: dayKey(date), ayahs, level: 0, future })
    }
    columns.push(column)
  }
  const max = Math.max(1, ...shown)
  for (const column of columns) {
    for (const cell of column) {
      if (cell.ayahs > 0) {
        cell.level = Math.min(4, Math.max(1, Math.ceil((cell.ayahs / max) * 4))) as 1 | 2 | 3 | 4
      }
    }
  }
  return columns
}
