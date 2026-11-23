import { type RefObject, useEffect, useState } from "react"
import { SurahNumber } from "@/components/page-card"
import { useAudio } from "@/components/reader-provider"
import { SurahPlayButton } from "@/components/surah-play-button"
import type { Surah } from "@/lib/surahs"
import { cn } from "@/lib/utils"

/** Height of the site header (h-14), which the bar slides out from under. */
const SITE_HEADER = 56

/**
 * Slim bar with the surah's name and a play/pause button, shown under the site header once
 * the page header (`after`) has scrolled away.
 */
export function SurahStickyBar({
  surah,
  after,
}: {
  surah: Surah
  after: RefObject<HTMLElement | null>
}) {
  const [shown, setShown] = useState(false)
  const audio = useAudio()
  const current = audio.track?.surah === surah.number ? audio.track.ayah : null

  useEffect(() => {
    const marker = after.current
    if (!marker) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        // Shown only when the marker is above the viewport, not below it.
        setShown(!entry.isIntersecting && entry.boundingClientRect.top < SITE_HEADER)
      },
      { rootMargin: `-${SITE_HEADER}px 0px 0px 0px` }
    )
    observer.observe(marker)
    return () => observer.disconnect()
  }, [after])

  return (
    <div
      inert={!shown}
      className={cn(
        "fixed inset-x-0 top-14 z-30 border-b border-border/60 bg-background/85 backdrop-blur-lg transition-[translate,opacity] duration-200 supports-backdrop-filter:bg-background/70 motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div className="mx-auto flex h-12 max-w-4xl items-center gap-3 px-4 sm:px-6">
        <SurahNumber n={surah.number} className="size-8 text-xs" />
        <p className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-semibold">{surah.name}</span>
          {current ? (
            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {surah.number}:{current}
            </span>
          ) : (
            <span className="hidden truncate text-sm text-muted-foreground sm:inline">
              {surah.meaning}
            </span>
          )}
        </p>
        <SurahPlayButton surah={surah.number} compact className="ml-auto" />
      </div>
      {/* How far through the surah's ayahs the reader is (CSS only; see .surah-progress). */}
      <div aria-hidden="true" className="surah-progress absolute inset-x-0 -bottom-px" />
    </div>
  )
}
