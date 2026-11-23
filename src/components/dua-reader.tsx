import { Loader2, Pause, Play } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import { AyahItem } from "@/components/ayah-item"
import { useAudio, useReader } from "@/components/reader-provider"
import { TafsirDialog } from "@/components/tafsir-dialog"
import { Button } from "@/components/ui/button"
import type { Dua } from "@/content/duas"
import { useReadingTracker } from "@/hooks/use-reading-tracker"
import { useSurahEditions } from "@/hooks/use-surah-editions"
import { duaAyahText } from "@/lib/duas"
import { translationLocale } from "@/lib/editions"
import { getSurah } from "@/lib/surahs"

/**
 * Plays a dua's ayahs one after another and stops at its end; pauses and resumes it while
 * it is the one playing.
 */
export function DuaPlayButton({ dua, className }: { dua: Dua; className?: string }) {
  const audio = useAudio()
  const track = audio.track
  const loaded =
    track?.surah === dua.surah &&
    track.ayah >= dua.from &&
    track.ayah <= dua.to &&
    audio.until === dua.to
  const playing = loaded && audio.playing
  return (
    <Button
      className={className}
      onClick={() =>
        loaded
          ? audio.toggle()
          : audio.play({ surah: dua.surah, ayah: dua.from }, { continuous: true, until: dua.to })
      }
    >
      {playing && audio.buffering ? (
        <Loader2 className="animate-spin motion-reduce:animate-none" />
      ) : playing ? (
        <Pause />
      ) : (
        <Play />
      )}
      {playing ? "Pause" : loaded ? "Resume" : "Play"}
    </Button>
  )
}

/**
 * The ayahs of a dua with the reader's chosen script and translation, audio, tafsir and
 * permalinks. Where the dua starts part-way through an ayah, its words are highlighted (in
 * the bundled script, whose word positions the dua list is counted in).
 */
export function DuaReader({ dua, className }: { dua: Dua; className?: string }) {
  const { settings, restored } = useReader()
  const audio = useAudio()
  const list = useRef<HTMLOListElement>(null)
  const ayahs = duaAyahText(dua.slug)
  const surahAyahs = getSurah(dua.surah)?.ayahs ?? 0
  const editions = useSurahEditions(
    dua.surah,
    surahAyahs,
    settings.arabicEdition,
    settings.translationEdition,
    restored
  )
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null)
  const closeTafsir = useCallback(() => setTafsirAyah(null), [])
  useReadingTracker(dua.surah, list)

  const { play, toggle } = audio
  const onPlay = useCallback(
    (ayah: number) => play({ surah: dua.surah, ayah }, { continuous: true, until: dua.to }),
    [play, dua.surah, dua.to]
  )
  const current = audio.track?.surah === dua.surah ? audio.track.ayah : null
  const arabicTexts = editions.texts[settings.arabicEdition]
  const translationTexts = editions.texts[settings.translationEdition]
  const { lang, dir } = translationLocale(settings.translationEdition, Boolean(translationTexts))

  return (
    <div className={className}>
      <ol ref={list} className="divide-y divide-border/50">
        {ayahs.map((ayah) => (
          <li key={ayah.n}>
            <AyahItem
              surah={dua.surah}
              ayah={ayah.n}
              arabic={arabicTexts?.[ayah.n - 1] ?? ayah.ar}
              highlightFromWord={ayah.n === dua.from && !arabicTexts ? dua.startsAtWord : undefined}
              translation={
                settings.showTranslation ? (translationTexts?.[ayah.n - 1] ?? ayah.bn) : undefined
              }
              translationLang={lang}
              translationDir={dir}
              active={current === ayah.n}
              playing={current === ayah.n && audio.playing}
              buffering={current === ayah.n && audio.buffering}
              onPlay={onPlay}
              onToggle={toggle}
              onTafsir={setTafsirAyah}
            />
          </li>
        ))}
      </ol>
      <TafsirDialog
        key={dua.slug}
        surah={dua.surah}
        ayah={tafsirAyah}
        arabic={
          tafsirAyah
            ? (arabicTexts?.[tafsirAyah - 1] ?? ayahs.find((a) => a.n === tafsirAyah)?.ar)
            : undefined
        }
        onClose={closeTafsir}
      />
    </div>
  )
}
