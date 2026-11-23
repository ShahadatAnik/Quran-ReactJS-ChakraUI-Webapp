import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"
import { SurahNumber } from "@/components/page-card"
import { PageGuide } from "@/components/page-guide"
import { PageLayout } from "@/components/page-layout"
import { SurahPlayButton } from "@/components/surah-play-button"
import { SurahReader } from "@/components/surah-reader"
import { SurahStickyBar } from "@/components/surah-sticky-bar"
import { getSurahPage, ordinal, pageByPath, type SurahPage } from "@/lib/pages"
import { loadSurahText } from "@/lib/quran-data"
import { pageSeo } from "@/lib/seo"
import { adjacentSurahs, parseSurahNumber } from "@/lib/surahs"

/** Registry entry for the URL segment, or a 404 for anything that isn't 1–114. */
function surahPageFor(segment: string): SurahPage {
  const number = parseSurahNumber(segment)
  const page = number ? getSurahPage(number) : undefined
  if (!page) throw notFound()
  return page
}

export const Route = createFileRoute("/surah/$number")({
  loader: async ({ params }) => {
    const page = surahPageFor(params.number)
    return { text: await loadSurahText(page.surah.number) }
  },
  head: ({ params }) => {
    const number = parseSurahNumber(params.number)
    const page = number ? getSurahPage(number) : undefined
    return page ? pageSeo(page) : {}
  },
  component: SurahRoute,
})

const neighbourClass =
  "flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10 outline-none transition-colors hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50"

function SurahRoute() {
  const { number } = Route.useParams()
  const { text } = Route.useLoaderData()
  const page = surahPageFor(number)
  const { surah } = page
  const { previous, next } = adjacentSurahs(surah.number)
  const headerEnd = useRef<HTMLDivElement>(null)
  const juz = surah.juz.length > 1 ? `${surah.juz[0]}–${surah.juz.at(-1)}` : surah.juz[0]
  const facts = [
    surah.revelation,
    `${surah.ayahs} ayahs`,
    `Juz ${juz}`,
    `${ordinal(surah.revelationOrder)} revealed of 114`,
  ]

  return (
    <PageLayout
      trail={[{ label: "Surahs", link: pageByPath.surahs.link }]}
      crumb={surah.name}
      title={page.title}
      media={<SurahNumber n={surah.number} className="size-12 text-base" />}
      description={
        <>
          {surah.meaning} ·{" "}
          <span lang="bn" className="leading-none">
            {surah.meaningBn}
          </span>
        </>
      }
      meta={
        // Every fact has a leading dot; the list is shifted left by one dot and clipped, so a
        // line never starts with one, however the row wraps.
        <div className="overflow-hidden pt-1">
          <ul
            aria-label="About this surah"
            className="-ml-4 flex flex-wrap items-center gap-y-1 text-xs text-muted-foreground sm:text-sm"
          >
            {facts.map((fact) => (
              <li
                key={fact}
                className="before:inline-block before:w-4 before:text-center before:text-muted-foreground/60 before:content-['·']"
              >
                {fact}
              </li>
            ))}
          </ul>
        </div>
      }
      // The Arabic name sits beside the title on phones, and above the button on wide screens.
      // Amiri sits low in its line box; .arabic-glyph-centred lifts it onto the line.
      titleAside={
        <p lang="ar" dir="rtl" className="h-8 shrink-0 text-3xl text-gold md:hidden">
          <span className="arabic-glyph-centred">{surah.arabic}</span>
        </p>
      }
      actions={
        <div className="flex w-full flex-col gap-4 md:w-auto md:items-end">
          <p lang="ar" dir="rtl" className="hidden h-12 text-5xl text-gold md:block">
            <span className="arabic-glyph-centred">{surah.arabic}</span>
          </p>
          <SurahPlayButton surah={surah.number} className="w-full md:w-auto" />
        </div>
      }
      width="reading"
    >
      {/* Once this marker scrolls under the site header, the sticky surah bar slides in. */}
      <div ref={headerEnd} aria-hidden="true" />
      <SurahStickyBar surah={surah} after={headerEnd} />
      <SurahReader text={text} />

      <nav
        aria-label="Previous and next surah"
        className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <Link
          to="/surah/$number"
          params={{ number: String(previous.number) }}
          className={neighbourClass}
        >
          <ChevronLeft className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>
            <span className="block text-xs text-muted-foreground">Previous surah</span>
            <span className="font-medium">
              {previous.number}. {previous.name}
            </span>
          </span>
        </Link>
        <Link
          to="/surah/$number"
          params={{ number: String(next.number) }}
          className={`${neighbourClass} justify-end text-right`}
        >
          <span>
            <span className="block text-xs text-muted-foreground">Next surah</span>
            <span className="font-medium">
              {next.number}. {next.name}
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
        </Link>
      </nav>

      <PageGuide page={page} />
    </PageLayout>
  )
}
