import { describe, expect, test } from "bun:test"
import {
  defaultPrayerSettings,
  METHODS,
  type PrayerLocation,
  type PrayerSettings,
  parsePrayerState,
} from "@/lib/prayer-settings"
import {
  addDays,
  compassPoint,
  dateAt,
  formatCountdown,
  formatTime,
  hijriDate,
  type PrayerName,
  parsePlaces,
  prayerLabel,
  prayerTimesOn,
  qiblaBearing,
  scheduleAt,
  weekAt,
} from "@/lib/prayer-times"

const place = (
  name: string,
  latitude: number,
  longitude: number,
  timeZone: string
): PrayerLocation => ({ name, latitude, longitude, timeZone, source: "search" })

const dhaka = place("Dhaka, Bangladesh", 23.71, 90.41, "Asia/Dhaka")
const makkah = place("Makkah, Saudi Arabia", 21.42, 39.83, "Asia/Riyadh")
const london = place("London, United Kingdom", 51.51, -0.13, "Europe/London")
const date = { year: 2026, month: 11, day: 24 }

/** Minutes past midnight of a time at the location, from "5:00 AM". */
function minutesOf(instant: Date, timeZone: string) {
  const [clock = "", half] = formatTime(instant, timeZone).split(/\s/)
  const [h = 0, m = 0] = clock.split(":").map(Number)
  return ((h % 12) + (half === "PM" ? 12 : 0)) * 60 + m
}

/** Times published by the Aladhan API for 24 November 2026 ("HH:MM", 24-hour). */
function expectTimes(
  location: PrayerLocation,
  settings: PrayerSettings,
  expected: Partial<Record<PrayerName, string>>
) {
  const times = prayerTimesOn(date, location, settings)
  for (const [name, clock] of Object.entries(expected)) {
    const [h = 0, m = 0] = clock.split(":").map(Number)
    const got = minutesOf(times[name as PrayerName], location.timeZone)
    // Different libraries round differently; a minute either way is the same time.
    expect(Math.abs(got - (h * 60 + m)), `${location.name} ${name}`).toBeLessThanOrEqual(1)
  }
}

describe("prayer times", () => {
  test("Dhaka with the Karachi method and Hanafi Asr (the default)", () => {
    expectTimes(dhaka, defaultPrayerSettings, {
      fajr: "05:00",
      sunrise: "06:19",
      dhuhr: "11:45",
      asr: "15:36",
      maghrib: "17:11",
      isha: "18:30",
    })
  })

  test("Makkah with Umm al-Qura and Shafi'i Asr", () => {
    expectTimes(
      makkah,
      { method: "UmmAlQura", asr: "shafi" },
      {
        fajr: "05:17",
        sunrise: "06:37",
        dhuhr: "12:07",
        asr: "15:16",
        maghrib: "17:37",
        isha: "19:07",
      }
    )
  })

  test("London with the Muslim World League method", () => {
    expectTimes(
      london,
      { method: "MuslimWorldLeague", asr: "shafi" },
      { fajr: "05:34", sunrise: "07:33", maghrib: "16:01", isha: "17:54" }
    )
  })

  test("Hanafi Asr is later than Shafi'i Asr", () => {
    const hanafi = prayerTimesOn(date, dhaka, { method: "Karachi", asr: "hanafi" })
    const shafi = prayerTimesOn(date, dhaka, { method: "Karachi", asr: "shafi" })
    expect(hanafi.asr.getTime()).toBeGreaterThan(shafi.asr.getTime())
    expect(hanafi.fajr.getTime()).toBe(shafi.fajr.getTime())
  })

  test("times are for the location's date, whatever the device's time zone", () => {
    // 20:00 UTC on 23 November is already 02:00 on the 24th in Dhaka.
    const schedule = scheduleAt(new Date("2026-11-23T20:00:00Z"), dhaka, defaultPrayerSettings)
    expect(schedule.today.date).toEqual(date)
  })

  test("Fajr far north in summer is still before sunrise", () => {
    const oslo = place("Oslo, Norway", 59.91, 10.75, "Europe/Oslo")
    const times = prayerTimesOn({ year: 2026, month: 6, day: 21 }, oslo, {
      method: "MuslimWorldLeague",
      asr: "shafi",
    })
    expect(Number.isNaN(times.fajr.getTime())).toBe(false)
    expect(times.fajr.getTime()).toBeLessThan(times.sunrise.getTime())
    expect(times.isha.getTime()).toBeGreaterThan(times.maghrib.getTime())
  })
})

describe("schedule", () => {
  const at = (iso: string) => scheduleAt(new Date(iso), dhaka, defaultPrayerSettings)

  test("during Asr, Maghrib is next", () => {
    const s = at("2026-11-24T10:00:00Z") // 4:00 PM in Dhaka
    expect(s.current).toBe("asr")
    expect(s.next.name).toBe("maghrib")
  })

  test("between sunrise and Dhuhr no prayer is current", () => {
    const s = at("2026-11-24T03:00:00Z") // 9:00 AM
    expect(s.current).toBeNull()
    expect(s.next.name).toBe("dhuhr")
  })

  test("before Fajr it is still Isha, and Fajr is next", () => {
    const s = at("2026-11-23T21:00:00Z") // 3:00 AM on the 24th
    expect(s.current).toBe("isha")
    expect(s.next.name).toBe("fajr")
    expect(s.next.date).toEqual(date)
  })

  test("after Isha the next prayer is tomorrow's Fajr", () => {
    const s = at("2026-11-24T15:00:00Z") // 9:00 PM
    expect(s.current).toBe("isha")
    expect(s.next.name).toBe("fajr")
    expect(s.next.date).toEqual({ year: 2026, month: 11, day: 25 })
    expect(s.next.time.getTime()).toBeGreaterThan(s.today.isha.getTime())
  })

  test("the current prayer's time runs until the next prayer", () => {
    const s = at("2026-11-24T10:00:00Z") // during Asr
    expect(s.window?.name).toBe("asr")
    expect(s.window?.start).toEqual(s.today.asr)
    expect(s.window?.end).toEqual(s.today.maghrib)
  })

  test("Fajr's time ends at sunrise", () => {
    const s = at("2026-11-23T23:30:00Z") // 5:30 AM in Dhaka
    expect(s.current).toBe("fajr")
    expect(s.window?.end).toEqual(s.today.sunrise)
    expect(s.next.name).toBe("dhuhr")
  })

  test("Isha's time runs to the next Fajr, from last night's Isha before dawn", () => {
    const evening = at("2026-11-24T15:00:00Z") // 9:00 PM
    expect(evening.window?.start).toEqual(evening.today.isha)
    expect(evening.window?.end).toEqual(evening.next.time)

    const night = at("2026-11-23T21:00:00Z") // 3:00 AM on the 24th
    const yesterday = prayerTimesOn(
      { year: 2026, month: 11, day: 23 },
      dhaka,
      defaultPrayerSettings
    )
    expect(night.window?.start).toEqual(yesterday.isha)
    expect(night.window?.end).toEqual(night.today.fajr)
  })

  test("no prayer's time between sunrise and Dhuhr", () => {
    expect(at("2026-11-24T03:00:00Z").window).toBeNull()
  })

  test("a week starts today", () => {
    const week = weekAt(new Date("2026-11-24T10:00:00Z"), dhaka, defaultPrayerSettings)
    expect(week).toHaveLength(7)
    expect(week[0]?.date).toEqual(date)
    expect(week[6]?.date).toEqual({ year: 2026, month: 11, day: 30 })
  })
})

describe("dates", () => {
  test("dateAt reads the date in a time zone", () => {
    const instant = new Date("2026-11-23T20:00:00Z")
    expect(dateAt(instant, "Asia/Dhaka")).toEqual(date)
    expect(dateAt(instant, "Europe/London")).toEqual({ year: 2026, month: 11, day: 23 })
  })

  test("addDays crosses months and years", () => {
    expect(addDays({ year: 2026, month: 11, day: 30 }, 1)).toEqual({
      year: 2026,
      month: 12,
      day: 1,
    })
    expect(addDays({ year: 2026, month: 12, day: 31 }, 1)).toEqual({ year: 2027, month: 1, day: 1 })
  })

  test("Dhuhr on a Friday is Jumu'ah", () => {
    expect(prayerLabel("dhuhr", { year: 2026, month: 11, day: 27 })).toBe("Jumu'ah")
    expect(prayerLabel("dhuhr", date)).toBe("Dhuhr")
    expect(prayerLabel("asr", { year: 2026, month: 11, day: 27 })).toBe("Asr")
  })

  test("Hijri date from the Umm al-Qura calendar", () => {
    expect(hijriDate(date)).toBe("14 Jumada II 1448 AH")
  })
})

describe("qibla", () => {
  test("bearing from Dhaka and London", () => {
    expect(qiblaBearing(dhaka)).toBeCloseTo(277.7, 0)
    expect(qiblaBearing(london)).toBeCloseTo(119, 0)
  })

  test("compass points", () => {
    expect(compassPoint(0)).toBe("N")
    expect(compassPoint(277.7)).toBe("W")
    expect(compassPoint(119)).toBe("SE")
    expect(compassPoint(359)).toBe("N")
  })
})

describe("formatting", () => {
  test("countdown", () => {
    expect(formatCountdown(30_000)).toBe("less than a minute")
    expect(formatCountdown(61_000)).toBe("2m")
    expect(formatCountdown(72 * 60_000)).toBe("1h 12m")
    expect(formatCountdown(2 * 3_600_000)).toBe("2h")
  })
})

describe("stored state", () => {
  test("defaults when nothing or garbage is stored", () => {
    expect(parsePrayerState(null)).toEqual({ location: null, settings: defaultPrayerSettings })
    expect(
      parsePrayerState({ settings: { method: "Nope", asr: 1 }, location: { latitude: 200 } })
    ).toEqual({ location: null, settings: defaultPrayerSettings })
  })

  test("keeps a valid location, rounded", () => {
    const state = parsePrayerState({
      location: {
        latitude: 23.71049,
        longitude: 90.40744,
        name: "Dhaka, Bangladesh",
        timeZone: "Asia/Dhaka",
        source: "search",
      },
      settings: { method: "UmmAlQura", asr: "shafi" },
    })
    expect(state.location).toEqual({ ...dhaka, latitude: 23.71, longitude: 90.41 })
    expect(state.settings).toEqual({ method: "UmmAlQura", asr: "shafi" })
  })

  test("an unknown time zone falls back to the device's", () => {
    const state = parsePrayerState({
      location: { latitude: 1, longitude: 2, timeZone: "Mars/Base" },
    })
    expect(state.location?.timeZone).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone)
  })

  test("every method can be calculated", () => {
    for (const method of METHODS) {
      const times = prayerTimesOn(date, dhaka, { method: method.id, asr: "shafi" })
      expect(times.fajr.getTime(), method.id).toBeLessThan(times.isha.getTime())
    }
  })
})

describe("city search", () => {
  test("parses Open-Meteo results and skips broken ones", () => {
    const places = parsePlaces({
      results: [
        {
          id: 1185241,
          name: "Dhaka",
          latitude: 23.7104,
          longitude: 90.40744,
          timezone: "Asia/Dhaka",
          country: "Bangladesh",
          admin1: "Dhaka Division",
        },
        { id: 2, name: "Broken" },
        { id: 3, name: "Singapore", latitude: 1.29, longitude: 103.85, country: "Singapore" },
      ],
    })
    expect(places).toHaveLength(2)
    expect(places[0]).toMatchObject({
      name: "Dhaka, Bangladesh",
      region: "Dhaka Division, Bangladesh",
      latitude: 23.71,
      longitude: 90.41,
      timeZone: "Asia/Dhaka",
    })
    expect(places[1]?.name).toBe("Singapore")
  })

  test("no results", () => {
    expect(parsePlaces({ generationtime_ms: 0.2 })).toEqual([])
    expect(parsePlaces(null)).toEqual([])
  })
})
