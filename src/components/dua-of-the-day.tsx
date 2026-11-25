import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { useMemo } from "react"
import { DuaPlayButton } from "@/components/dua-reader"
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"
import { useMounted } from "@/hooks/use-mounted"
import { duaAyahText, duaOfTheDay, duaSource, splitAtWord } from "@/lib/duas"

const arabicClass =
  "mt-4 line-clamp-2 min-h-[2lh] font-arabic text-2xl leading-arabic text-foreground sm:text-3xl"
const banglaClass =
  "mt-2 line-clamp-3 min-h-[3lh] leading-relaxed text-pretty text-muted-foreground"
/** Words that fill the lines while the day's dua is chosen (they are drawn as bars). */
const PLACEHOLDER_ARABIC =
  "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا"
const PLACEHOLDER_BANGLA =
  "হে আমাদের পালনকর্তা, আমাদেরকে দুনিয়াতেও কল্যাণ দান কর এবং আখেরাতেও কল্যাণ দান কর এবং আমাদেরকে দোযখের আযাব থেকে রক্ষা কর। হে আমাদের পালনকর্তা, সরল পথ প্রদর্শনের পর আমাদের অন্তরকে সত্য লংঘনে প্রবৃত্ত করো না।"

const dateLabel = new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" })

/**
 * Home page card with one dua from the Quran, a different one each day (the same for every
 * reader on a date). The dua is chosen in the browser, from the reader's own date, so the
 * prerendered card shows skeleton lines in the card's own elements: the same height exactly.
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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="daily-dua-heading"
            className="text-xs font-medium tracking-wide text-gold uppercase"
          >
            Dua of the day
          </h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {today ? dateLabel.format(today) : <SkeletonText>Wednesday, 25 November</SkeletonText>}
          </p>
        </div>
        {dua ? (
          <DuaPlayButton dua={dua} className="shrink-0" />
        ) : (
          <Skeleton className="h-8 w-20 shrink-0 rounded-lg" />
        )}
      </div>
      {/* A fixed number of lines whatever the day's dua, so the card is the same height every
          day and while it loads: two lines of Arabic, three of Bangla, one for the link. */}
      <p lang="ar" dir="rtl" className={arabicClass}>
        {dua ? arabic : <SkeletonText>{PLACEHOLDER_ARABIC}</SkeletonText>}
      </p>
      <p lang="bn" className={banglaClass}>
        {dua ? bangla : <SkeletonText>{PLACEHOLDER_BANGLA}</SkeletonText>}
      </p>
      {dua ? (
        <Link
          to="/duas/$slug"
          params={{ slug: dua.slug }}
          className="group mt-4 flex w-fit max-w-full items-center gap-1.5 text-sm font-medium hover:underline"
        >
          <span className="truncate">{dua.title}</span>
          <span className="shrink-0 text-muted-foreground tabular-nums">· {duaSource(dua)}</span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      ) : (
        <p className="mt-4 truncate text-sm font-medium">
          <SkeletonText>The dua of Musa · Ta-Ha 20:25–28</SkeletonText>
        </p>
      )}
    </section>
  )
}
