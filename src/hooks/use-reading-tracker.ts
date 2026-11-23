import { type RefObject, useEffect } from "react"
import { updateReadingLog } from "@/hooks/use-reading-log"
import { READ_AFTER_MS, recordRead } from "@/lib/reading-log"
import { parseAyahHash } from "@/lib/surahs"

/** Top of the screen covered by the site header and the sticky surah bar. */
const COVERED_TOP = 104
/** Bottom of the screen the audio player may cover. */
const COVERED_BOTTOM = 80

/** When the previous ayah was counted, for the reading-time estimate. */
let lastReadAt: number | null = null

function markRead(surah: number, ayah: number) {
  const now = Date.now()
  const since = lastReadAt === null ? null : (now - lastReadAt) / 1000
  lastReadAt = now
  updateReadingLog((log) => recordRead(log, surah, ayah, new Date(now), since))
}

/**
 * Counts an ayah of `surah` (an `article#ayah-N` inside `container`) as read once it has been
 * on screen for READ_AFTER_MS: at least half of it visible, or, for an ayah taller than half
 * the screen, filling at least half of it. Time in a background tab doesn't count.
 * `watch` restarts tracking when the ayahs inside the container change in place.
 */
export function useReadingTracker(
  surah: number,
  container: RefObject<HTMLElement | null>,
  watch?: unknown
) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: `watch` only triggers a restart.
  useEffect(() => {
    const root = container.current
    if (!root) return
    const timers = new Map<Element, ReturnType<typeof setTimeout>>()
    const onScreen = new Set<Element>()
    /** Ayahs already counted during this visit to the page. */
    const counted = new Set<number>()

    const start = (element: Element) => {
      if (timers.has(element) || document.hidden) return
      const ayah = parseAyahHash(element.id)
      if (!ayah || counted.has(ayah)) return
      timers.set(
        element,
        setTimeout(() => {
          timers.delete(element)
          counted.add(ayah)
          markRead(surah, ayah)
        }, READ_AFTER_MS)
      )
    }
    const stop = (element: Element) => {
      clearTimeout(timers.get(element))
      timers.delete(element)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visibleHeight = entry.intersectionRect.height
          const screen = entry.rootBounds?.height ?? window.innerHeight
          const seen =
            entry.isIntersecting &&
            (entry.intersectionRatio >= 0.5 || visibleHeight >= screen * 0.5)
          if (seen) {
            onScreen.add(entry.target)
            start(entry.target)
          } else {
            onScreen.delete(entry.target)
            stop(entry.target)
          }
        }
      },
      {
        rootMargin: `-${COVERED_TOP}px 0px -${COVERED_BOTTOM}px 0px`,
        threshold: Array.from({ length: 11 }, (_, i) => i / 10),
      }
    )
    for (const article of root.querySelectorAll("article[id^=ayah-]")) observer.observe(article)

    const onVisibility = () => {
      if (document.hidden) for (const element of [...timers.keys()]) stop(element)
      else for (const element of onScreen) start(element)
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      observer.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      for (const element of [...timers.keys()]) stop(element)
    }
  }, [surah, container, watch])
}
