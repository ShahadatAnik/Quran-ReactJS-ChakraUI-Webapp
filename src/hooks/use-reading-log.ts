import { useSyncExternalStore } from "react"
import { emptyLog, parseReadingLog, READING_LOG_KEY, type ReadingLog } from "@/lib/reading-log"

/**
 * One shared copy of the reading log, saved to localStorage on every change and reloaded when
 * another tab changes it. Components read it with useReadingLog().
 */
let current: ReadingLog | null = null
const listeners = new Set<() => void>()
const notify = () => {
  for (const listener of listeners) listener()
}

function load(): ReadingLog {
  try {
    const raw = localStorage.getItem(READING_LOG_KEY)
    return raw ? parseReadingLog(JSON.parse(raw)) : emptyLog()
  } catch {
    return emptyLog()
  }
}

export function getReadingLog(): ReadingLog {
  current ??= load()
  return current
}

/** Applies a change to the log, saves it and tells every reader. */
export function updateReadingLog(change: (log: ReadingLog) => ReadingLog) {
  const next = change(getReadingLog())
  if (next === current) return
  current = next
  try {
    localStorage.setItem(READING_LOG_KEY, JSON.stringify(next))
  } catch {
    // Storage full or blocked: the log still works for this visit.
  }
  notify()
}

export function clearReadingLog() {
  current = emptyLog()
  try {
    localStorage.removeItem(READING_LOG_KEY)
  } catch {
    // Ignore; the in-memory log is cleared either way.
  }
  notify()
}

/** Another tab changed (or cleared) the log. */
function onStorage(event: StorageEvent) {
  if (event.key !== READING_LOG_KEY && event.key !== null) return
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

/** The reading log, or null while prerendering and hydrating (so nothing wrong is shown). */
export function useReadingLog(): ReadingLog | null {
  return useSyncExternalStore(subscribe, getReadingLog, () => null)
}
