import { type Dispatch, type SetStateAction, useEffect, useState } from "react"
import { STORAGE_PREFIX } from "@/lib/site"

/**
 * `useState` that is mirrored to localStorage.
 *
 * The first render always uses `initialValue` so prerendered HTML hydrates without
 * mismatches; the stored value is restored right after mount. `parse` validates what was
 * stored (it may be from an older version or edited by hand); return `undefined` to reject
 * it. Storage failures (private mode, quota, blocked cookies) are ignored.
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
  parse?: (stored: unknown) => T | undefined
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const storageKey = STORAGE_PREFIX + key
  const [value, setValue] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  // biome-ignore lint/correctness/useExhaustiveDependencies: restore once per key; `parse` is usually an inline function.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw !== null) {
        const stored: unknown = JSON.parse(raw)
        const next = parse ? parse(stored) : (stored as T)
        if (next !== undefined) setValue(next)
      }
    } catch {
      // Ignore unreadable or malformed storage.
    }
    setHydrated(true)
  }, [storageKey])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value))
    } catch {
      // Ignore quota / access errors.
    }
  }, [hydrated, storageKey, value])

  return [value, setValue, hydrated]
}
