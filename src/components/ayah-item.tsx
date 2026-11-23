import { Check, Link2, Loader2, Pause, Play } from "lucide-react"
import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { site } from "@/lib/site"
import { ayahId, ayahPath } from "@/lib/surahs"
import { cn } from "@/lib/utils"

export interface AyahItemProps {
  surah: number
  ayah: number
  arabic: string
  /** Translation text; omitted when translations are hidden. */
  translation?: string
  translationLang: string
  translationDir: "ltr" | "rtl"
  sajda?: boolean
  /** This ayah is loaded in the player. */
  active: boolean
  playing: boolean
  buffering: boolean
  onPlay: (ayah: number) => void
  onToggle: () => void
  className?: string
}

/** One ayah: number, Arabic, translation, and play / copy-link actions. */
export const AyahItem = memo(function AyahItem({
  surah,
  ayah,
  arabic,
  translation,
  translationLang,
  translationDir,
  sajda,
  active,
  playing,
  buffering,
  onPlay,
  onToggle,
  className,
}: AyahItemProps) {
  const { copied, copy } = useCopyToClipboard()
  const reference = `${surah}:${ayah}`
  const isPlaying = active && playing

  return (
    <article
      id={ayahId(ayah)}
      aria-label={`Ayah ${reference}`}
      className={cn(
        "group/ayah scroll-mt-24 rounded-xl px-3 py-5 transition-colors sm:px-5",
        active ? "bg-primary/6 ring-1 ring-primary/30" : "hover:bg-muted/50",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <a
          href={`#${ayahId(ayah)}`}
          className="rounded-md px-1.5 py-0.5 text-sm font-semibold text-gold tabular-nums outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {reference}
        </a>
        {sajda ? (
          <Badge variant="outline" className="border-gold/50 text-gold">
            Sajdah
          </Badge>
        ) : null}
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            aria-label={isPlaying ? `Pause ayah ${reference}` : `Play from ayah ${reference}`}
            onClick={() => (active ? onToggle() : onPlay(ayah))}
          >
            {isPlaying && buffering ? (
              <Loader2 className="animate-spin motion-reduce:animate-none" />
            ) : isPlaying ? (
              <Pause />
            ) : (
              <Play />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Copy link to ayah ${reference}`}
            onClick={() =>
              copy(
                new URL(ayahPath(surah, ayah), site.url).toString(),
                `Link to ${reference} copied`
              )
            }
          >
            {copied ? <Check className="text-primary" /> : <Link2 />}
          </Button>
        </div>
      </div>
      <p lang="ar" dir="rtl" className="ayah-arabic mt-1 text-foreground">
        {arabic}
      </p>
      {translation ? (
        <p
          lang={translationLang}
          dir={translationDir}
          className="mt-3 text-[1.05rem] leading-relaxed text-pretty text-muted-foreground"
        >
          {translation}
        </p>
      ) : null}
    </article>
  )
})
