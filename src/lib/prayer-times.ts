/**
 * Prayer times, calculated in the browser from the reader's location with the Adhan library:
 * no prayer-times service, and the location never leaves the device. Only the city search
 * (when GPS is denied) sends what the reader types to the Open-Meteo geocoding API.
 */
import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Qibla } from "adhan"
import {
  deviceTimeZone,
  isCoordinate,
  isTimeZone,
  type PrayerLocation,
  type PrayerSettings,
  roundCoordinate,
} from "@/lib/prayer-settings"

// ---------- prayers ----------

export const PRAYER_NAMES = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const
export type PrayerName = (typeof PRAYER_NAMES)[number]
/** The five daily prayers: every time except sunrise, which ends Fajr's time. */
export type Salah = Exclude<PrayerName, "sunrise">

export const PRAYERS: Record<PrayerName, { label: string; arabic: string; bangla: string }> = {
  fajr: { label: "Fajr", arabic: "الفجر", bangla: "ফজর" },
  sunrise: { label: "Sunrise", arabic: "الشروق", bangla: "সূর্যোদয়" },
  dhuhr: { label: "Dhuhr", arabic: "الظهر", bangla: "যোহর" },
  asr: { label: "Asr", arabic: "العصر", bangla: "আসর" },
  maghrib: { label: "Maghrib", arabic: "المغرب", bangla: "মাগরিব" },
  isha: { label: "Isha", arabic: "العشاء", bangla: "এশা" },
}

const SALAH: readonly Salah[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"]

/** "Dhuhr", or "Jumu'ah" for Dhuhr on a Friday. */
export const prayerLabel = (name: PrayerName, date: CalendarDate) =>
  name === "dhuhr" && weekday(date) === 5 ? "Jumu'ah" : PRAYERS[name].label

// ---------- dates in the location's time zone ----------

/** A calendar date, as the location sees it. */
export interface CalendarDate {
  year: number
  month: number
  day: number
}

const dateParts = new Map<string, Intl.DateTimeFormat>()

/** The date at the location when it is `instant` everywhere. */
export function dateAt(instant: Date, timeZone: string): CalendarDate {
  let format = dateParts.get(timeZone)
  if (!format) {
    format = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    })
    dateParts.set(timeZone, format)
  }
  const parts = Object.fromEntries(format.formatToParts(instant).map((p) => [p.type, p.value]))
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) }
}

/** Noon UTC on the date: a fixed instant on that date for formatting it anywhere on Earth. */
const noonUtc = ({ year, month, day }: CalendarDate) => new Date(Date.UTC(year, month - 1, day, 12))

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const d = noonUtc(date)
  d.setUTCDate(d.getUTCDate() + days)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

/** 0 = Sunday … 6 = Saturday. */
export const weekday = (date: CalendarDate) => noonUtc(date).getUTCDay()

const sameDate = (a: CalendarDate, b: CalendarDate) =>
  a.year === b.year && a.month === b.month && a.day === b.day

// ---------- calculation ----------

export type DayTimes = { date: CalendarDate } & Record<PrayerName, Date>

const parameters = (location: PrayerLocation, settings: PrayerSettings) => {
  const coordinates = new Coordinates(location.latitude, location.longitude)
  const params = CalculationMethod[settings.method]()
  params.madhab = settings.asr === "hanafi" ? Madhab.Hanafi : Madhab.Shafi
  // Far from the equator, summer twilight can last all night; this keeps Fajr and Isha sane.
  params.highLatitudeRule = HighLatitudeRule.recommended(coordinates)
  return { coordinates, params }
}

/** The six times of a date at the location. */
export function prayerTimesOn(
  date: CalendarDate,
  location: PrayerLocation,
  settings: PrayerSettings
): DayTimes {
  const { coordinates, params } = parameters(location, settings)
  // Adhan reads the calendar date from the Date's local fields and works out UTC instants for
  // that date at these coordinates, whatever the device's own time zone is.
  const times = new PrayerTimes(coordinates, new Date(date.year, date.month - 1, date.day), params)
  return {
    date,
    fajr: times.fajr,
    sunrise: times.sunrise,
    dhuhr: times.dhuhr,
    asr: times.asr,
    maghrib: times.maghrib,
    isha: times.isha,
  }
}

/** When a prayer's time begins and ends. */
export interface PrayerWindow {
  name: Salah
  start: Date
  end: Date
}

export interface Schedule {
  /** Today's times at the location. */
  today: DayTimes
  /** The prayer whose time it is now, or null between sunrise and Dhuhr. */
  current: Salah | null
  /**
   * The current prayer's time: Fajr until sunrise, Isha until the next Fajr, the others until
   * the prayer after them. Null when `current` is.
   */
  window: PrayerWindow | null
  /** The next of the five prayers (tomorrow's Fajr after Isha). */
  next: { name: Salah; time: Date; date: CalendarDate }
}

export function scheduleAt(
  now: Date,
  location: PrayerLocation,
  settings: PrayerSettings
): Schedule {
  const date = dateAt(now, location.timeZone)
  const today = prayerTimesOn(date, location, settings)
  const t = now.getTime()
  const upcoming = SALAH.find((name) => today[name].getTime() > t)
  const tomorrow = upcoming ? null : prayerTimesOn(addDays(date, 1), location, settings)
  const next = upcoming
    ? { name: upcoming, time: today[upcoming], date }
    : { name: "fajr" as const, time: (tomorrow as DayTimes).fajr, date: addDays(date, 1) }
  // Before Fajr it is still the time of last night's Isha; sunrise to Dhuhr has no prayer.
  const passed = SALAH.filter((name) => today[name].getTime() <= t).at(-1) ?? "isha"
  const betweenSunriseAndDhuhr = t >= today.sunrise.getTime() && t < today.dhuhr.getTime()
  const current = betweenSunriseAndDhuhr ? null : passed
  // Every prayer but Fajr lasts until the next one begins; Fajr ends at sunrise.
  const start =
    current === "isha" && t < today.fajr.getTime()
      ? prayerTimesOn(addDays(date, -1), location, settings).isha
      : current && today[current]
  const running: PrayerWindow | null =
    current && start
      ? { name: current, start, end: current === "fajr" ? today.sunrise : next.time }
      : null
  return { today, current, window: running, next }
}

/** Times for `days` dates starting with today at the location. */
export function weekAt(
  now: Date,
  location: PrayerLocation,
  settings: PrayerSettings,
  days = 7
): DayTimes[] {
  const start = dateAt(now, location.timeZone)
  return Array.from({ length: days }, (_, i) =>
    prayerTimesOn(addDays(start, i), location, settings)
  )
}

export const isToday = (date: CalendarDate, now: Date, timeZone: string) =>
  sameDate(date, dateAt(now, timeZone))

// ---------- qibla ----------

/** Degrees clockwise from true north towards the Kaaba. */
export const qiblaBearing = ({ latitude, longitude }: PrayerLocation) =>
  Qibla(new Coordinates(latitude, longitude))

const POINTS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const

/** 292 → "NW". */
export const compassPoint = (degrees: number) =>
  POINTS[Math.round((((degrees % 360) + 360) % 360) / 45) % 8] as string

// ---------- formatting ----------

const formats = new Map<string, Intl.DateTimeFormat>()
const formatter = (key: string, make: () => Intl.DateTimeFormat) => {
  let f = formats.get(key)
  if (!f) {
    f = make()
    formats.set(key, f)
  }
  return f
}

/** "5:12 AM" at the location. */
export const formatTime = (instant: Date, timeZone: string) =>
  formatter(`time:${timeZone}`, () =>
    Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone })
  ).format(instant)

/** "5:12" at the location, without AM/PM: for tables where the column says which prayer it is. */
export const formatClock = (instant: Date, timeZone: string) =>
  formatter(`time:${timeZone}`, () =>
    Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit", timeZone })
  )
    .formatToParts(instant)
    .filter((part) => part.type !== "dayPeriod")
    .map((part) => part.value)
    .join("")
    .trim()

/** "Monday, 24 November" */
export const formatDay = (date: CalendarDate, style: "long" | "short" = "long") =>
  formatter(`day:${style}`, () =>
    Intl.DateTimeFormat(
      "en-GB",
      style === "long"
        ? { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }
        : { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }
    )
  ).format(noonUtc(date))

/**
 * "3 Jumada II 1448 AH", from the Umm al-Qura calendar built into the browser. It can differ by
 * a day from a local moon sighting. Null where the browser has no Islamic calendar.
 */
export function hijriDate(date: CalendarDate): string | null {
  try {
    return formatter("hijri", () =>
      Intl.DateTimeFormat("en-GB-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })
    ).format(noonUtc(date))
  } catch {
    return null
  }
}

/** 4_320_000 → "1h 12m"; under a minute → "less than a minute". */
export function formatCountdown(ms: number): string {
  const minutes = Math.ceil(Math.max(0, ms) / 60_000)
  if (ms < 60_000) return "less than a minute"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`
}

// ---------- city search ----------

export const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

export const geocodingUrl = (query: string) =>
  `${GEOCODING_URL}?${new URLSearchParams({ name: query, count: "8", language: "en", format: "json" })}`

export interface Place extends PrayerLocation {
  id: number
  /** "Dhaka Division, Bangladesh" */
  region: string
}

/** Places from an Open-Meteo geocoding response; malformed entries are skipped. */
export function parsePlaces(json: unknown): Place[] {
  const results = (json as { results?: unknown } | null)?.results
  if (!Array.isArray(results)) return []
  return results.flatMap((r: Record<string, unknown>) => {
    if (
      typeof r?.name !== "string" ||
      !isCoordinate(r.latitude, 90) ||
      !isCoordinate(r.longitude, 180)
    )
      return []
    const region = [r.admin1, r.country].filter(
      (x, i, all): x is string => typeof x === "string" && x !== "" && all.indexOf(x) === i
    )
    const country = typeof r.country === "string" ? r.country : ""
    return [
      {
        id: typeof r.id === "number" ? r.id : 0,
        latitude: roundCoordinate(r.latitude),
        longitude: roundCoordinate(r.longitude),
        name: country && country !== r.name ? `${r.name}, ${country}` : r.name,
        region: region.join(", "),
        timeZone: isTimeZone(r.timezone) ? r.timezone : deviceTimeZone(),
        source: "search" as const,
      },
    ]
  })
}
