import { Link } from "@tanstack/react-router"
import { ArrowRight, BookMarked, BookOpen } from "lucide-react"
import { useReader } from "@/components/reader-provider"
import { ReadingStrip } from "@/components/reading-history"
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"
import { surahProgress } from "@/lib/reader-settings"
import { ayahId, getSurah } from "@/lib/surahs"

const frameClass =
  "w-full max-w-md overflow-hidden rounded-2xl bg-card/90 text-left ring-1 ring-foreground/10 backdrop-blur"

/**
 * "Continue reading" card for the last-read ayah, or "Start reading" Al-Fatihah for a new
 * reader. Prerendered as a skeleton of the same size and filled in once the stored position
 * is read, so the layout doesn't jump and the server and client HTML match. Under it, one
 * line of reading history links to the full history page.
 */
export function ContinueReading() {
  const { lastRead, restored } = useReader()
  if (!restored) {
    return (
      // The card's own markup, with skeleton text in its two lines: exactly its height.
      <div className={frameClass} aria-busy="true">
        <div className="flex items-center gap-4 p-4">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-xs">
              <SkeletonText>Continue reading</SkeletonText>
            </p>
            <p className="truncate font-medium">
              <SkeletonText>Al-Baqarah · ayah 255 of 286</SkeletonText>
            </p>
            <Skeleton className="mt-2 h-1 rounded-full" />
          </div>
          <span className="size-4 shrink-0" />
        </div>
        <ReadingStrip />
      </div>
    )
  }
  const position = lastRead
  const surah = getSurah(position?.surah ?? 1)
  if (!surah) return null
  const progress = position ? surahProgress(position) : 0

  return (
    <div className={frameClass}>
      <Link
        to="/surah/$number"
        params={{ number: String(surah.number) }}
        hash={position ? ayahId(position.ayah) : undefined}
        className="group flex items-center gap-4 p-4 transition-colors outline-none hover:bg-accent/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
          {position ? <BookMarked className="size-5" /> : <BookOpen className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-muted-foreground">
            {position ? "Continue reading" : "Start reading"}
          </span>
          <span className="block truncate font-medium">
            {surah.name}
            {position ? ` · ayah ${position.ayah} of ${surah.ayahs}` : ` · ${surah.meaning}`}
          </span>
          {/* The bar is decorative: the text above already says how far you are. */}
          <span aria-hidden="true" className="mt-2 block h-1 overflow-hidden rounded-full bg-muted">
            <span
              className="block h-full rounded-full bg-primary transition-width"
              style={{ width: `${progress}%` }}
            />
          </span>
        </span>
        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
      </Link>
      <ReadingStrip />
    </div>
  )
}
