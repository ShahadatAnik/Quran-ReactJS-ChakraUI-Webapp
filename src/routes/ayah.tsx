import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { AyahItem } from "@/components/ayah-item"
import { PageGuide } from "@/components/page-guide"
import { IconTile, PageLayout } from "@/components/page-layout"
import { useAudio, useReader } from "@/components/reader-provider"
import { AyahPageSkeleton } from "@/components/skeletons"
import { TafsirDialog } from "@/components/tafsir-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePersistedState } from "@/hooks/use-persisted-state"
import { useReadingTracker } from "@/hooks/use-reading-tracker"
import { useSurahEditions } from "@/hooks/use-surah-editions"
import {
  DEFAULT_ARABIC_EDITION,
  DEFAULT_TRANSLATION_EDITION,
  translationLocale,
} from "@/lib/editions"
import { pageByPath } from "@/lib/pages"
import { loadSurahText, type SurahText } from "@/lib/quran-data"
import type { LastRead } from "@/lib/reader-settings"
import { pageSeo } from "@/lib/seo"
import { ayahId, getSurah, isAyahOf, parseAyahReference, surahs } from "@/lib/surahs"

const page = pageByPath.ayah
/** Ayat al-Kursi: prerendered, and shown until the visitor picks another ayah. */
const DEFAULT: LastRead = { surah: 2, ayah: 255 }

export const Route = createFileRoute("/ayah")({
  loader: async () => ({ text: await loadSurahText(DEFAULT.surah) }),
  head: () => pageSeo(page),
  component: AyahRoute,
  pendingComponent: AyahPageSkeleton,
})

function AyahRoute() {
  const { text: defaultText } = Route.useLoaderData()
  const [selection, setSelection, selectionRestored] = usePersistedState<LastRead>(
    "ayah",
    DEFAULT,
    (v) => {
      const s = v as LastRead | null
      return s && isAyahOf(s.surah, s.ayah) ? { surah: s.surah, ayah: s.ayah } : undefined
    }
  )
  const [loaded, setLoaded] = useState<SurahText>(defaultText)
  const [reference, setReference] = useState("")
  const [tafsirOpen, setTafsirOpen] = useState(false)
  const ayahBox = useRef<HTMLDivElement>(null)
  /** The ayah last shown, which stands (as skeleton lines) while another surah loads. */
  const shownAyah = useRef({
    ar: defaultText.ayahs[DEFAULT.ayah - 1]?.ar ?? "",
    bn: defaultText.ayahs[DEFAULT.ayah - 1]?.bn ?? "",
  })
  const audio = useAudio()
  const { settings, restored } = useReader()
  const ids = { surah: useId(), ayah: useId(), reference: useId() }

  // Load the bundled text of the selected surah (a small chunk per surah).
  useEffect(() => {
    if (loaded.number === selection.surah) return
    let active = true
    void loadSurahText(selection.surah).then((text) => active && setLoaded(text))
    return () => {
      active = false
    }
  }, [selection.surah, loaded.number])

  const surah = getSurah(selection.surah) ?? getSurah(DEFAULT.surah)
  const text = loaded.number === selection.surah ? loaded : null
  const ayah = text?.ayahs[selection.ayah - 1]
  // The reader's chosen script and translation, as on the surah pages (bundled text until loaded).
  const editions = useSurahEditions(
    selection.surah,
    surah?.ayahs ?? 0,
    settings.arabicEdition,
    settings.translationEdition,
    restored
  )
  const arabic = editions.texts[settings.arabicEdition]?.[selection.ayah - 1] ?? ayah?.ar
  const translation = editions.texts[settings.translationEdition]?.[selection.ayah - 1] ?? ayah?.bn
  useReadingTracker(selection.surah, ayahBox, ayah ? `${selection.surah}:${selection.ayah}` : null)
  const translationLang = translationLocale(
    settings.translationEdition,
    Boolean(editions.texts[settings.translationEdition])
  )
  const parsed = reference.trim() ? parseAyahReference(reference) : null
  const placeholder = shownAyah.current
  if (ayah && arabic) shownAyah.current = { ar: arabic, bn: translation ?? ayah.bn }
  const current = audio.track?.surah === selection.surah ? audio.track.ayah : null

  return (
    <PageLayout
      crumb={page.title}
      title={page.title}
      description={page.description}
      media={<IconTile icon={page.icon} />}
      width="reading"
    >
      {/* Grid gaps, not space-y: Radix prerenders a hidden <select> beside each trigger and
          drops it on hydration; space-y gave it a margin, so each field shrank 6px on load. */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-[2fr_1fr] sm:p-6">
        <div className="grid gap-1.5">
          <label htmlFor={ids.surah} className="text-sm font-medium">
            Surah
          </label>
          <Select
            value={String(selection.surah)}
            onValueChange={(value) => setSelection({ surah: Number(value), ayah: 1 })}
          >
            <SelectTrigger id={ids.surah} className="w-full">
              {/* The label is given, so the prerendered page shows it too. */}
              <SelectValue>
                {surah ? `${surah.number}. ${surah.name} (${surah.meaning})` : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {surahs.map((s) => (
                <SelectItem key={s.number} value={String(s.number)}>
                  {s.number}. {s.name} ({s.meaning})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <label htmlFor={ids.ayah} className="text-sm font-medium">
            Ayah
          </label>
          <Select
            value={String(selection.ayah)}
            onValueChange={(value) => setSelection({ ...selection, ayah: Number(value) })}
          >
            <SelectTrigger id={ids.ayah} className="w-full">
              <SelectValue>Ayah {selection.ayah}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: surah?.ayahs ?? 0 }, (_, i) => i + 1).map((n) => (
                <SelectItem key={n} value={String(n)}>
                  Ayah {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <form
          className="space-y-1.5 sm:col-span-2"
          onSubmit={(event) => {
            event.preventDefault()
            if (parsed) {
              setSelection(parsed)
              setReference("")
            }
          }}
        >
          <label htmlFor={ids.reference} className="text-sm font-medium">
            Or type a reference
          </label>
          <div className="flex gap-2">
            <Input
              id={ids.reference}
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. 2:255, 36:1 or ১৮:১০"
              inputMode="text"
              autoComplete="off"
              aria-invalid={reference.trim() !== "" && !parsed}
              aria-describedby={`${ids.reference}-hint`}
              className="h-9"
            />
            <Button type="submit" disabled={!parsed}>
              Go
            </Button>
          </div>
          <p
            id={`${ids.reference}-hint`}
            className="text-xs text-muted-foreground"
            aria-live="polite"
          >
            {reference.trim() === ""
              ? "Surah, then ayah, separated by a colon, a dot or a space."
              : parsed
                ? `${getSurah(parsed.surah)?.name}, ayah ${parsed.ayah}. Press Enter to show it.`
                : "That isn't an ayah in the Quran. Check both numbers."}
          </p>
        </form>
      </div>

      <section aria-labelledby="ayah-heading" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="ayah-heading" className="text-xl font-semibold tracking-tight">
            {surah?.name} · ayah {selection.ayah}
            <span className="block text-sm font-normal text-muted-foreground">
              {surah?.meaning} · {surah?.revelation} · {surah?.ayahs} ayahs
            </span>
          </h2>
          <Button variant="outline" asChild>
            <Link
              to="/surah/$number"
              params={{ number: String(selection.surah) }}
              hash={ayahId(selection.ayah)}
            >
              Read in context
              <ArrowRight />
            </Link>
          </Button>
        </div>
        {/* Until the saved ayah and settings are read, the prerendered Ayat al-Kursi is drawn as
            skeleton lines where they will replace it (styles.css, pre-paint layout). */}
        <div
          ref={ayahBox}
          className="mt-4 min-h-48 rounded-2xl bg-card ring-1 ring-foreground/10"
          data-default-ayah={selectionRestored ? undefined : ""}
          data-reader-pending={restored ? undefined : ""}
        >
          {ayah && arabic ? (
            <AyahItem
              surah={selection.surah}
              ayah={selection.ayah}
              arabic={arabic}
              translation={settings.showTranslation ? translation : undefined}
              arabicLoading={
                editions.status === "loading" && settings.arabicEdition !== DEFAULT_ARABIC_EDITION
              }
              translationLoading={
                editions.status === "loading" &&
                settings.translationEdition !== DEFAULT_TRANSLATION_EDITION
              }
              translationLang={translationLang.lang}
              translationDir={translationLang.dir}
              sajda={ayah.sajda}
              active={current === selection.ayah}
              playing={current === selection.ayah && audio.playing}
              buffering={current === selection.ayah && audio.buffering}
              onPlay={(n) => audio.play({ surah: selection.surah, ayah: n })}
              onToggle={audio.toggle}
              onTafsir={() => setTafsirOpen(true)}
              className="ring-0"
            />
          ) : (
            // Another surah's text is loading: the ayah shown until now, as skeleton lines.
            <>
              <p className="sr-only" aria-live="polite">
                Loading {surah?.name}…
              </p>
              <AyahItem
                surah={selection.surah}
                ayah={selection.ayah}
                arabic={placeholder.ar}
                translation={settings.showTranslation ? placeholder.bn : undefined}
                arabicLoading
                translationLoading
                translationLang="bn"
                translationDir="ltr"
                active={false}
                playing={false}
                buffering={false}
                onPlay={() => undefined}
                onToggle={() => undefined}
                className="ring-0"
              />
            </>
          )}
        </div>
      </section>

      <TafsirDialog
        key={selection.surah}
        surah={selection.surah}
        ayah={tafsirOpen ? selection.ayah : null}
        arabic={arabic}
        onClose={() => setTafsirOpen(false)}
      />

      <PageGuide page={page} />
    </PageLayout>
  )
}
