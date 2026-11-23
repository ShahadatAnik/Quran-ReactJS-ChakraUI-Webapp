import { Loader2, Pause, Play } from "lucide-react"
import { useAudio } from "@/components/reader-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Plays the surah from the start, or pauses and resumes it once it is the one playing.
 * `compact` is the small version for the sticky bar: just "Play" / "Pause".
 */
export function SurahPlayButton({
  surah,
  compact = false,
  className,
}: {
  surah: number
  compact?: boolean
  className?: string
}) {
  const audio = useAudio()
  const loaded = audio.track?.surah === surah
  const playing = loaded && audio.playing
  const label = playing ? "Pause" : loaded && !compact ? "Resume" : "Play"

  return (
    <Button
      size={compact ? "sm" : "default"}
      // A fixed width, so the bar doesn't shift when Play turns into Pause.
      className={cn(compact && "min-w-22", className)}
      onClick={() =>
        loaded ? audio.toggle() : audio.play({ surah, ayah: 1 }, { continuous: true })
      }
    >
      {playing && audio.buffering ? (
        <Loader2 className="animate-spin motion-reduce:animate-none" />
      ) : playing ? (
        <Pause />
      ) : (
        <Play />
      )}
      {label}
    </Button>
  )
}
