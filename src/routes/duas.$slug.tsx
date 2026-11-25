import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { DuaPlayButton, DuaReader } from "@/components/dua-reader"
import { SurahNumber } from "@/components/page-card"
import { PageGuide } from "@/components/page-guide"
import { PageLayout } from "@/components/page-layout"
import { ArabicNameAside, HeaderFacts, ReadingActions } from "@/components/reading-header"
import { DuaSkeleton } from "@/components/skeletons"
import { duaCategory } from "@/content/duas"
import { duaSource } from "@/lib/duas"
import { type DuaPage, getDuaPage, pageByPath } from "@/lib/pages"
import { pageSeo } from "@/lib/seo"
import { ayahId } from "@/lib/surahs"

/** Registry entry for the URL segment, or a 404. */
function duaPageFor(slug: string): DuaPage {
  const page = getDuaPage(slug)
  if (!page) throw notFound()
  return page
}

export const Route = createFileRoute("/duas/$slug")({
  loader: ({ params }) => {
    duaPageFor(params.slug)
  },
  head: ({ params }) => {
    const page = getDuaPage(params.slug)
    return page ? pageSeo(page) : {}
  },
  component: DuaRoute,
  pendingComponent: DuaSkeleton,
})

/** Laid out like a surah page: same header, same ayah list, with a link to the full surah. */
function DuaRoute() {
  const { slug } = Route.useParams()
  const page = duaPageFor(slug)
  const { dua, surah } = page
  const count = dua.to - dua.from + 1
  const facts = [
    duaSource(dua),
    duaCategory(dua.category).title,
    `${count} ${count === 1 ? "ayah" : "ayahs"}`,
    ...(dua.saidBy ? [`The dua of ${dua.saidBy}`] : []),
  ]

  return (
    <PageLayout
      trail={[{ label: "Duas", link: pageByPath.duas.link }]}
      crumb={dua.title}
      title={dua.title}
      media={<SurahNumber n={surah.number} className="size-12 text-base" />}
      description={<span lang="bn">{dua.titleBn}</span>}
      meta={<HeaderFacts label="About this dua" facts={facts} />}
      titleAside={<ArabicNameAside text={surah.arabic} />}
      actions={
        <ReadingActions arabic={surah.arabic}>
          <DuaPlayButton dua={dua} className="w-full md:w-auto" />
        </ReadingActions>
      }
      width="reading"
    >
      <DuaReader dua={dua} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4 text-sm">
        {dua.startsAtWord ? (
          <p className="text-muted-foreground">
            The dua is part of a longer ayah: its words are in full colour.
          </p>
        ) : (
          <span />
        )}
        <Link
          to="/surah/$number"
          params={{ number: String(surah.number) }}
          hash={ayahId(dua.from)}
          className="group inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
        >
          Read in context in Surah {surah.name}
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      </div>
      <PageGuide page={page} />
    </PageLayout>
  )
}
