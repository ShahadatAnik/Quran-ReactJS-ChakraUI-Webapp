import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { useMemo } from "react"
import { DuaPlayButton } from "@/components/dua-reader"
import { useMounted } from "@/hooks/use-mounted"
import { duaAyahText, duaOfTheDay, duaSource, splitAtWord } from "@/lib/duas"

const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" })

/**
 * Home page card with one dua from the Quran, a different one each day (the same for every
 * reader on a date). The dua is chosen in the browser, from the reader's own date, so the
 * prerendered card is an empty frame of the same size rather than a dua that then changes.
 */
export function DuaOfTheDay() {
  const mounted = useMounted()
  const today = useMemo(() => (mounted ? new Date() : null), [mounted])
  const dua = today ? duaOfTheDay(today) : null
  const ayahs = dua ? duaAyahText(dua.slug) : []
  // The dua's own words: from where it begins in its first ayah, then its other ayahs whole.
  const arabic = ayahs
    .map((ayah, i) => (i === 0 && dua ? splitAtWord(ayah.ar, dua.startsAtWord)[1] : ayah.ar))
    .join(" ۝ ")
  const bangla = ayahs.map((ayah) => ayah.bn).join(" ")

  return (
    <section
      aria-labelledby="daily-dua-heading"
      aria-busy={!dua}
      className="relative isolate min-h-52 overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-foreground/10 sm:p-6"
    >
      <div
        aria-hidden="true"
        className="khatam-corner absolute -top-4 -right-4 -z-10 size-56 opacity-60"
      />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="daily-dua-heading"
            className="text-xs font-medium tracking-wide text-gold uppercase"
          >
            Dua of the day
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {today ? dateLabel.format(today) : " "}
          </p>
        </div>
        {dua ? <DuaPlayButton dua={dua} /> : null}
      </div>
      {dua ? (
        <div className="animate-in duration-300 fade-in-0 motion-reduce:animate-none">
          <p
            lang="ar"
            dir="rtl"
            className="mt-4 font-arabic text-2xl leading-arabic text-foreground sm:text-3xl"
          >
            {arabic}
          </p>
          <p lang="bn" className="mt-2 leading-relaxed text-pretty text-muted-foreground">
            {bangla}
          </p>
          <Link
            to="/duas/$slug"
            params={{ slug: dua.slug }}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          >
            {dua.title}
            <span className="text-muted-foreground tabular-nums">· {duaSource(dua)}</span>
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        </div>
      ) : null}
    </section>
  )
}
