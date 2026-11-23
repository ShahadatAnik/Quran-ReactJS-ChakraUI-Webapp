import { describe, expect, test } from "bun:test"
import {
  addDays,
  dayKey,
  displayRanges,
  emptyLog,
  formatRanges,
  heatmap,
  khatmShare,
  parseRanges,
  parseReadingLog,
  type ReadingLog,
  readingStats,
  recordRead,
} from "@/lib/reading-log"

/** Records each [surah, ayah] on the given day, one second apart. */
function readOn(log: ReadingLog, date: Date, reads: [number, number][]): ReadingLog {
  let next = log
  reads.forEach(([surah, ayah], i) => {
    next = recordRead(next, surah, ayah, date, i === 0 ? null : 1)
  })
  return next
}

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12)

describe("ranges", () => {
  test("format and parse round-trip", () => {
    expect(formatRanges([5, 1, 2, 3, 3, 9, 10])).toBe("1-3,5,9-10")
    expect(parseRanges("1-3,5,9-10")).toEqual([1, 2, 3, 5, 9, 10])
    expect(formatRanges([])).toBe("")
  })

  test("parse skips malformed parts", () => {
    expect(parseRanges("x,0,3-1,2,4-4,-5,7-1000")).toEqual([2, 4])
  })

  test("display", () => {
    expect(displayRanges("1-40,45")).toBe("1–40, 45")
  })
})

describe("dates", () => {
  test("dayKey is the local calendar date", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05")
  })

  test("addDays crosses month and year ends", () => {
    expect(dayKey(addDays(day(2026, 3, 1), 1))).toBe("2026-02-28")
    expect(dayKey(addDays(day(2026, 1, 1), 1))).toBe("2025-12-31")
    expect(dayKey(addDays(day(2026, 12, 31), -1))).toBe("2027-01-01")
  })
})

describe("recordRead", () => {
  test("adds ayahs to the day's ranges, once each", () => {
    let log = readOn(emptyLog(), day(2026, 11, 20), [
      [18, 1],
      [18, 2],
      [18, 2],
      [18, 4],
      [2, 255],
    ])
    log = recordRead(log, 18, 3, day(2026, 11, 20), 1)
    expect(log.days["2026-11-20"]?.surahs).toEqual({ "18": "1-4", "2": "255" })
  })

  test("ignores ayahs that don't exist", () => {
    const log = emptyLog()
    expect(recordRead(log, 1, 8, day(2026, 11, 20), null)).toBe(log)
    expect(recordRead(log, 115, 1, day(2026, 11, 20), null)).toBe(log)
  })

  test("counts time between reads, but not long gaps", () => {
    const date = day(2026, 11, 20)
    let log = recordRead(emptyLog(), 1, 1, date, null) // first read: 2 s
    log = recordRead(log, 1, 2, date, 30) // 30 s later
    log = recordRead(log, 1, 3, date, 3600) // after an hour away: 2 s
    expect(log.days["2026-11-20"]?.seconds).toBe(34)
  })

  test("never changes the log it is given", () => {
    const log = emptyLog()
    recordRead(log, 1, 1, day(2026, 11, 20), null)
    expect(log).toEqual(emptyLog())
  })
})

describe("parseReadingLog", () => {
  test("keeps valid data", () => {
    const log = readOn(emptyLog(), day(2026, 11, 20), [[1, 1]])
    expect(parseReadingLog(JSON.parse(JSON.stringify(log)))).toEqual(log)
  })

  test.each([null, "x", {}, { version: 2, days: {} }, { version: 1, days: "x" }])(
    "returns an empty log for %p",
    (value) => {
      expect(parseReadingLog(value)).toEqual(emptyLog())
    }
  )

  test("drops bad days, unknown surahs and ayahs that don't exist", () => {
    const parsed = parseReadingLog({
      version: 1,
      days: {
        "not-a-date": { surahs: { "1": "1" }, seconds: 5 },
        "2026-11-20": { surahs: { "1": "1-9", "115": "1", "2": 7 }, seconds: -3 },
        "2026-11-21": { surahs: {}, seconds: 10 },
      },
    })
    expect(parsed.days).toEqual({ "2026-11-20": { surahs: { "1": "1-7" }, seconds: 0 } })
  })
})

describe("readingStats", () => {
  const today = day(2026, 11, 23)
  let log = emptyLog()
  log = readOn(log, day(2026, 11, 23), [
    [1, 1],
    [1, 2],
  ])
  log = readOn(log, day(2026, 11, 22), [[18, 1]])
  log = readOn(log, day(2026, 11, 21), [
    [18, 2],
    [1, 1],
  ])
  // A three-day run across the month end, then a gap.
  log = readOn(log, day(2026, 10, 30), [[112, 1]])
  log = readOn(log, day(2026, 10, 31), [[112, 2]])
  log = readOn(log, day(2026, 11, 1), [
    [112, 3],
    [112, 4],
  ])
  const stats = readingStats(log, today)

  test("totals and coverage", () => {
    // 1:1–2, 18:1–2, 112:1–4 → 8 different ayahs; Al-Ikhlas is complete.
    expect(stats.covered).toBe(8)
    expect(stats.surahsComplete).toBe(1)
    expect(stats.daysActive).toBe(6)
    expect(khatmShare(stats.covered)).toBeCloseTo(8 / 6236)
  })

  test("streaks", () => {
    expect(stats.currentStreak).toBe(3)
    expect(stats.longestStreak).toBe(3)
    // Nothing read yet today: the streak still counts up to yesterday.
    expect(readingStats(log, day(2026, 11, 24)).currentStreak).toBe(3)
    // A missed day ends it.
    expect(readingStats(log, day(2026, 11, 25)).currentStreak).toBe(0)
  })

  test("frequency: most days first, then most ayahs covered", () => {
    expect(stats.frequency.map((f) => [f.surah, f.days, f.covered])).toEqual([
      [112, 3, 4],
      [1, 2, 2],
      [18, 2, 2],
    ])
  })

  test("days newest first, surahs in Quran order", () => {
    expect(stats.days[0]).toEqual({
      date: "2026-11-23",
      entries: [{ surah: 1, ranges: "1-2" }],
      ayahs: 2,
      seconds: 3,
    })
    expect(stats.days[2]?.entries.map((e) => e.surah)).toEqual([1, 18])
    expect(stats.days.at(-1)?.date).toBe("2026-10-30")
  })

  test("an empty log", () => {
    expect(readingStats(emptyLog(), today)).toEqual({
      covered: 0,
      surahsComplete: 0,
      daysActive: 0,
      currentStreak: 0,
      longestStreak: 0,
      frequency: [],
      days: [],
    })
  })
})

describe("heatmap", () => {
  test("weeks of seven days ending in the current week, Saturday first", () => {
    // 23 Nov 2026 is a Monday, so its week began on Saturday 21 Nov.
    const today = day(2026, 11, 23)
    let log = readOn(emptyLog(), day(2026, 11, 23), [
      [2, 1],
      [2, 2],
      [2, 3],
      [2, 4],
    ])
    log = readOn(log, day(2026, 11, 21), [[2, 5]])
    const columns = heatmap(readingStats(log, today), today, 3)
    expect(columns).toHaveLength(3)
    const last = columns[2] ?? []
    expect(last.map((c) => c.date)).toEqual([
      "2026-11-21",
      "2026-11-22",
      "2026-11-23",
      "2026-11-24",
      "2026-11-25",
      "2026-11-26",
      "2026-11-27",
    ])
    expect(columns[0]?.[0]?.date).toBe("2026-11-07")
    expect(last.map((c) => c.level)).toEqual([1, 0, 4, 0, 0, 0, 0])
    expect(last.map((c) => c.future)).toEqual([false, false, false, true, true, true, true])
  })
})
