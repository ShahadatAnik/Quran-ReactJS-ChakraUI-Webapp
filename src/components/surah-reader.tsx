import { useRouterState } from "@tanstack/react-router"
import { Loader2 } from "lucide-react"
import { type RefObject, useCallback, useEffect, useRef } from "react"
import { AyahItem } from "@/components/ayah-item"
import { useAudio, useReader } from "@/components/reader-provider"
import { useSurahEditions } from "@/hooks/use-surah-editions"
import { translationLocale } from "@/lib/editions"
import type { SurahText } from "@/lib/quran-data"
import { ayahId, parseAyahHash } from "@/lib/surahs"

const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches

/** Briefly highlights the ayah a permalink points at. */
function useAyahTarget() {
  const hash = useRouterState({ select: (s) => s.location.hash })
  useEffect(() => {
    const ayah = parseAyahHash(hash)
    const element = ayah ? document.getElementById(ayahId(ayah)) : null
    if (!element) return
    element.classList.remove("ayah-target")
    // Restart the animation when the same permalink is followed twice.
    void element.offsetWidth
    element.classList.add("ayah-target")
  }, [hash])
}

/**
 * Remembers the ayah being read: the first ayah in the upper part of the viewport, once the
 * reader has actually scrolled (opening a page alone doesn't count as reading it).
 */
function useTrackLastRead(surah: number, list: RefObject<HTMLOListElement | null>) {
  const { setLastRead } = useReader()
  useEffect(() => {
    const root = list.current
    if (!root) return
    let scrolled = false
    let visible = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    const save = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (scrolled && visible) setLastRead({ surah, ayah: visible })
      }, 700)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const ayah = parseAyahHash(entry.target.id)
          if (ayah) visible = ayah
        }
        save()
      },
      // A band across the upper third of the screen, below the sticky header.
      { rootMargin: "-20% 0px -65% 0px" }
    )
    for (const item of root.querySelectorAll("article[id^=ayah-]")) observer.observe(item)
    const onScroll = () => {
      scrolled = true
      save()
    }
    window.addEventListener("scroll", onScroll, { passive: true, once: true })
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      clearTimeout(timer)
    }
  }, [surah, list, setLastRead])
}

interface SurahReaderProps {
  text: SurahText
}

/** The ayahs of one surah with the reader's chosen editions, audio and permalinks. */
export function SurahReader({ text }: SurahReaderProps) {
  const { settings, restored } = useReader()
  const audio = useAudio()
  const list = useRef<HTMLOListElement>(null)
  const surah = text.number
  const editions = useSurahEditions(
    surah,
    text.ayahs.length,
    settings.arabicEdition,
    settings.translationEdition,
    restored
  )

  useAyahTarget()
  useTrackLastRead(surah, list)

  // While playing through the surah, keep the current ayah on screen.
  const current = audio.track?.surah === surah ? audio.track.ayah : null
  useEffect(() => {
    if (!current || !audio.continuous) return
    const element = document.getElementById(ayahId(current))
    if (!element) return
    const { top, bottom } = element.getBoundingClientRect()
    if (top < 80 || bottom > window.innerHeight - 96) {
      element.scrollIntoView({
        block: "center",
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      })
    }
  }, [current, audio.continuous])

  const { play, toggle } = audio
  const onPlay = useCallback(
    (ayah: number) => play({ surah, ayah }, { continuous: true }),
    [play, surah]
  )

  const arabicTexts = editions.texts[settings.arabicEdition]
  const translationTexts = editions.texts[settings.translationEdition]
  const { lang: translationLang, dir: translationDir } = translationLocale(
    settings.translationEdition,
    Boolean(translationTexts)
  )

  return (
    <div data-arabic-size={settings.arabicSize}>
      <p aria-live="polite" className="sr-only">
        {editions.status === "loading" ? "Loading the selected edition" : ""}
      </p>
      {editions.status === "loading" ? (
        <p className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Loading the selected edition. The default text is shown until it arrives.
        </p>
      ) : null}

      {text.bismillah ? (
        <p
          lang="ar"
          dir="rtl"
          className="mb-6 text-center font-arabic text-3xl leading-loose text-gold md:text-4xl"
        >
          {text.bismillah}
        </p>
      ) : null}

      <ol ref={list} className="divide-y divide-border/50">
        {text.ayahs.map((ayah, index) => {
          const n = index + 1
          return (
            <li key={n}>
              <AyahItem
                surah={surah}
                ayah={n}
                arabic={arabicTexts?.[index] ?? ayah.ar}
                translation={
                  settings.showTranslation ? (translationTexts?.[index] ?? ayah.bn) : undefined
                }
                translationLang={translationLang}
                translationDir={translationDir}
                sajda={ayah.sajda}
                active={current === n}
                playing={current === n && audio.playing}
                buffering={current === n && audio.buffering}
                onPlay={onPlay}
                onToggle={toggle}
              />
            </li>
          )
        })}
      </ol>
    </div>
  )
}
