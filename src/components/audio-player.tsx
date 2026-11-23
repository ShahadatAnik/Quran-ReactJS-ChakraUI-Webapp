import { Link } from "@tanstack/react-router"
import { Loader2, Pause, Play, SkipBack, SkipForward, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useAudio, useAudioTime, useReader } from "@/components/reader-provider"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { formatTime, getReciter } from "@/lib/audio"
import { ayahId, getSurah } from "@/lib/surahs"

/**
 * Playback position for display. The browser reports progress only about four times a
 * second, so while audio is actually playing the position is read on every frame instead.
 */
function useSmoothPosition() {
  const audio = useAudio()
  const time = useAudioTime()
  const running = audio.playing && !audio.buffering
  const [frame, setFrame] = useState(0)
  const { position } = audio

  useEffect(() => {
    if (!running) return
    let id = requestAnimationFrame(function tick() {
      setFrame(position())
      id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [running, position])

  // Right after a seek or a new ayah, the last frame can be stale; trust the element's report.
  return running && Math.abs(frame - time.current) < 1 ? frame : time.current
}

/** Fixed player bar, shown while an ayah is loaded. One player serves the whole site. */
export function AudioPlayer() {
  const audio = useAudio()
  const time = useAudioTime()
  const current = useSmoothPosition()
  /** Position under the finger while the seek bar is dragged; seeking happens on release. */
  const [dragging, setDragging] = useState<number | null>(null)
  const { settings } = useReader()
  const { track } = audio
  if (!track) return null

  const surah = getSurah(track.surah)
  const count = surah?.ayahs ?? 0

  return (
    <>
      {/* Keeps the end of the page clear of the fixed bar. */}
      <div aria-hidden="true" className="h-20" />
      <section
        aria-label="Recitation player"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg [view-transition-name:audio-player] supports-backdrop-filter:bg-background/75"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:gap-4 sm:px-6">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Previous ayah"
              disabled={track.ayah <= 1}
              onClick={() => audio.step(-1)}
            >
              <SkipBack />
            </Button>
            <Button
              size="icon"
              className="rounded-full"
              aria-label={audio.playing ? "Pause" : "Play"}
              onClick={audio.toggle}
            >
              {audio.buffering && audio.playing ? (
                <Loader2 className="animate-spin motion-reduce:animate-none" />
              ) : audio.playing ? (
                <Pause />
              ) : (
                <Play />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Next ayah"
              disabled={track.ayah >= count}
              onClick={() => audio.step(1)}
            >
              <SkipForward />
            </Button>
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <Link
                to="/surah/$number"
                params={{ number: String(track.surah) }}
                hash={ayahId(track.ayah)}
                className="truncate font-medium hover:underline"
              >
                {surah?.name} {track.surah}:{track.ayah}
              </Link>
              <span className="hidden truncate text-muted-foreground sm:inline">
                {getReciter(settings.reciter).name}
              </span>
              <span className="shrink-0 text-muted-foreground tabular-nums">
                {formatTime(dragging ?? current)} / {formatTime(time.duration)}
              </span>
            </div>
            <Slider
              aria-label="Seek"
              min={0}
              max={time.duration || 1}
              step={0.1}
              value={[dragging ?? current]}
              disabled={!time.duration}
              onValueChange={([value]) => setDragging(value ?? 0)}
              onValueCommit={([value]) => {
                audio.seek(value ?? 0)
                setDragging(null)
              }}
            />
          </div>

          <Button variant="ghost" size="icon" aria-label="Close player" onClick={audio.stop}>
            <X />
          </Button>
        </div>
      </section>
    </>
  )
}
