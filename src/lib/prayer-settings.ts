/**
 * The reader's prayer-times settings and location, and how they are stored. Kept apart from
 * the calculation (prayer-times.ts), so the settings panel in the header doesn't load Adhan.
 */
import type { CalculationMethod } from "adhan"
import { STORAGE_PREFIX } from "@/lib/site"

export const PRAYER_STORAGE_KEY = `${STORAGE_PREFIX}prayer`

// ---------- settings ----------

export type MethodId = Exclude<keyof typeof CalculationMethod, "Other">

/** Calculation methods, with the angles they use for Fajr and Isha. */
export interface Method {
  id: MethodId
  label: string
  description: string
}

const KARACHI: Method = {
  id: "Karachi",
  label: "University of Islamic Sciences, Karachi",
  description: "Fajr 18°, Isha 18°. Bangladesh, Pakistan, India",
}

export const METHODS: readonly Method[] = [
  KARACHI,
  {
    id: "MuslimWorldLeague",
    label: "Muslim World League",
    description: "Fajr 18°, Isha 17°. Europe, the Far East",
  },
  {
    id: "UmmAlQura",
    label: "Umm al-Qura, Makkah",
    description: "Fajr 18.5°, Isha 90 minutes after Maghrib. Saudi Arabia",
  },
  {
    id: "Egyptian",
    label: "Egyptian General Authority of Survey",
    description: "Fajr 19.5°, Isha 17.5°. Africa, Syria, Lebanon",
  },
  {
    id: "NorthAmerica",
    label: "Islamic Society of North America",
    description: "Fajr 15°, Isha 15°. USA and Canada",
  },
  {
    id: "MoonsightingCommittee",
    label: "Moonsighting Committee",
    description: "Fajr 18°, Isha 18°, adjusted by season. North America, UK",
  },
  { id: "Dubai", label: "Dubai", description: "Fajr 18.2°, Isha 18.2°. United Arab Emirates" },
  { id: "Kuwait", label: "Kuwait", description: "Fajr 18°, Isha 17.5°" },
  { id: "Qatar", label: "Qatar", description: "Fajr 18°, Isha 90 minutes after Maghrib" },
  {
    id: "Singapore",
    label: "Singapore",
    description: "Fajr 20°, Isha 18°. Singapore, Malaysia, Indonesia",
  },
  { id: "Turkey", label: "Diyanet, Turkey", description: "Fajr 18°, Isha 17°" },
  {
    id: "Tehran",
    label: "Institute of Geophysics, Tehran",
    description: "Fajr 17.7°, Isha 14°, Maghrib 4.5°",
  },
]

export type AsrMadhab = "hanafi" | "shafi"

export const ASR_LABELS: Record<AsrMadhab, { label: string; description: string }> = {
  hanafi: { label: "Hanafi", description: "Shadow twice an object's length" },
  shafi: { label: "Shafi'i", description: "Shadow equal to its length (Shafi'i, Maliki, Hanbali)" },
}

export interface PrayerSettings {
  method: MethodId
  asr: AsrMadhab
}

/** What Islamic Foundation Bangladesh publishes: Karachi angles with Hanafi Asr. */
export const defaultPrayerSettings: PrayerSettings = { method: "Karachi", asr: "hanafi" }

export const methodOf = (id: MethodId) => METHODS.find((m) => m.id === id) ?? KARACHI

// ---------- location ----------

export interface PrayerLocation {
  latitude: number
  longitude: number
  /** "Dhaka, Bangladesh", or "Your location" for GPS. */
  name: string
  /** IANA time zone the times are shown in. */
  timeZone: string
  source: "gps" | "search"
}

/** Two decimals: about a kilometre, close enough for prayer times and no more precise. */
export const roundCoordinate = (x: number) => Math.round(x * 100) / 100

export const deviceTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

export function isTimeZone(zone: unknown): zone is string {
  if (typeof zone !== "string" || !zone) return false
  try {
    new Intl.DateTimeFormat("en", { timeZone: zone })
    return true
  } catch {
    return false
  }
}

/** A location from the device's GPS, rounded, in the device's time zone. */
export const gpsLocation = (latitude: number, longitude: number): PrayerLocation => ({
  latitude: roundCoordinate(latitude),
  longitude: roundCoordinate(longitude),
  name: "Your location",
  timeZone: deviceTimeZone(),
  source: "gps",
})

/** "23.71° N, 90.41° E" */
export const formatCoordinates = ({ latitude, longitude }: PrayerLocation) =>
  `${Math.abs(latitude).toFixed(2)}° ${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(2)}° ${longitude >= 0 ? "E" : "W"}`

// ---------- stored state ----------

export interface PrayerState {
  location: PrayerLocation | null
  settings: PrayerSettings
}

export const emptyPrayerState = (): PrayerState => ({
  location: null,
  settings: defaultPrayerSettings,
})

export const isCoordinate = (x: unknown, limit: number): x is number =>
  typeof x === "number" && Number.isFinite(x) && Math.abs(x) <= limit

/** Validates what was stored, field by field; anything malformed falls back to its default. */
export function parsePrayerState(value: unknown): PrayerState {
  const v = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>
  const s = (typeof v.settings === "object" && v.settings !== null ? v.settings : {}) as Record<
    string,
    unknown
  >
  const l = (typeof v.location === "object" && v.location !== null ? v.location : null) as Record<
    string,
    unknown
  > | null
  const location: PrayerLocation | null =
    l && isCoordinate(l.latitude, 90) && isCoordinate(l.longitude, 180)
      ? {
          latitude: roundCoordinate(l.latitude),
          longitude: roundCoordinate(l.longitude),
          name: typeof l.name === "string" && l.name ? l.name.slice(0, 120) : "Your location",
          timeZone: isTimeZone(l.timeZone) ? l.timeZone : deviceTimeZone(),
          source: l.source === "search" ? "search" : "gps",
        }
      : null
  return {
    location,
    settings: {
      method: METHODS.some((m) => m.id === s.method)
        ? (s.method as MethodId)
        : defaultPrayerSettings.method,
      asr: s.asr === "shafi" || s.asr === "hanafi" ? s.asr : defaultPrayerSettings.asr,
    },
  }
}
