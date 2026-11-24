import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import {
  emptyPrayerState,
  gpsLocation,
  PRAYER_STORAGE_KEY,
  type PrayerLocation,
  type PrayerSettings,
  type PrayerState,
  parsePrayerState,
} from "@/lib/prayer-settings"

/**
 * One shared copy of the reader's prayer-times location and settings, saved to localStorage and
 * reloaded when another tab changes it. The location never leaves the browser.
 */
let current: PrayerState | null = null
const listeners = new Set<() => void>()
const notify = () => {
  for (const listener of listeners) listener()
}

function load(): PrayerState {
  try {
    const raw = localStorage.getItem(PRAYER_STORAGE_KEY)
    return raw ? parsePrayerState(JSON.parse(raw)) : emptyPrayerState()
  } catch {
    return emptyPrayerState()
  }
}

const getState = () => {
  current ??= load()
  return current
}

function save(next: PrayerState) {
  current = next
  try {
    localStorage.setItem(PRAYER_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Storage full or blocked: the choice still applies for this visit.
  }
  notify()
}

export const setPrayerLocation = (location: PrayerLocation | null) =>
  save({ ...getState(), location })

export const updatePrayerSettings = (change: Partial<PrayerSettings>) =>
  save({ ...getState(), settings: { ...getState().settings, ...change } })

function onStorage(event: StorageEvent) {
  if (event.key !== PRAYER_STORAGE_KEY && event.key !== null) return
  current = load()
  notify()
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener("storage", onStorage)
  }
}

/** Location and settings, or null while prerendering and hydrating. */
export function usePrayerState(): PrayerState | null {
  return useSyncExternalStore(subscribe, getState, () => null)
}

/**
 * The current time, ticking every `ms` and right away when the tab becomes visible again (timers
 * are throttled in background tabs). Null until mounted, so prerendered HTML has no time in it.
 */
export function useNow(ms = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const timer = window.setInterval(tick, ms)
    const onVisible = () => document.visibilityState === "visible" && tick()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [ms])
  return now
}

export type LocateStatus =
  | { state: "idle" }
  | { state: "locating" }
  | { state: "error"; message: string }

const locateErrors: Record<number, string> = {
  1: "Location permission was denied. Allow it in your browser's site settings, or search for your city instead.",
  2: "Your location couldn't be found. Check that location services are on, or search for your city.",
  3: "Finding your location took too long. Try again, or search for your city.",
}

/** Asks the browser for the device's position (only when called) and saves it, rounded. */
export function useLocate() {
  const [status, setStatus] = useState<LocateStatus>({ state: "idle" })
  const locate = useCallback((onFound?: () => void) => {
    if (!("geolocation" in navigator)) {
      setStatus({
        state: "error",
        message: "This browser can't share its location. Search for your city instead.",
      })
      return
    }
    setStatus({ state: "locating" })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPrayerLocation(gpsLocation(position.coords.latitude, position.coords.longitude))
        setStatus({ state: "idle" })
        onFound?.()
      },
      (error) =>
        setStatus({
          state: "error",
          message: locateErrors[error.code] ?? "Your location couldn't be found.",
        }),
      // City-level accuracy is plenty, and a position from the last 10 minutes will do.
      { enableHighAccuracy: false, timeout: 15_000, maximumAge: 10 * 60_000 }
    )
  }, [])
  return { status, locate }
}
