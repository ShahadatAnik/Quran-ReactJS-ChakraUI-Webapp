import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRight, BookOpen, Search } from "lucide-react"
import { ContinueReading } from "@/components/continue-reading"
import { DuaOfTheDay } from "@/components/dua-of-the-day"
import { PageCard, PostCard, SurahCard } from "@/components/page-card"
import { NextPrayerCard } from "@/components/prayer-times"
import { useFrequentSurahs } from "@/components/reading-history"
import { HomeSkeleton, SurahCardSkeleton } from "@/components/skeletons"
import { Button } from "@/components/ui/button"
import {
  appPages,
  getSurahPage,
  POPULAR_SURAHS,
  pageByPath,
  postPages,
  surahPages,
} from "@/lib/pages"
import { prepaintConfig } from "@/lib/prepaint"
import { homeSeo } from "@/lib/seo"
import { site } from "@/lib/site"

export const Route = createFileRoute("/")({
  head: () => homeSeo(),
  component: Home,
  pendingComponent: HomeSkeleton,
})

/** Most surahs "Your most-read surahs" shows (the pre-paint script counts up to the same). */
const FREQUENT_LIMIT = prepaintConfig.frequentLimit

function SectionHeading({
  id,
  title,
  description,
  more,
}: {
  id: string
  title: string
  description: string
  more?: { label: string; link: (typeof appPages)[number]["link"] | { to: "/history" } }
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-1">
        <h2 id={id} className="font-heading text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {more ? (
        <Button variant="ghost" size="sm" asChild>
          <Link {...more.link}>
            {more.label}
            <ArrowRight />
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

/**
 * The surahs this reader comes back to most, from the reading history in this browser;
 * nothing for a reader without one. Until the history has been read, skeleton cards: as many
 * as there will be cards (counted before the first paint, see src/lib/prepaint.ts), or none.
 */
function FrequentSurahs() {
  const frequent = useFrequentSurahs(FREQUENT_LIMIT)
  if (frequent?.length === 0) return null
  return (
    <section
      aria-labelledby="frequent-heading"
      aria-busy={!frequent}
      data-needs-history={frequent ? undefined : ""}
    >
      <SectionHeading
        id="frequent-heading"
        title="Your most-read surahs"
        description="The surahs you read on the most days, from your history in this browser."
        more={{ label: "Your history", link: { to: "/history" } }}
      />
      <ul
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-frequent-skeleton={frequent ? undefined : ""}
      >
        {frequent
          ? frequent.map(({ surah }) => {
              const page = getSurahPage(surah)
              return page ? (
                <li key={surah}>
                  <SurahCard page={page} />
                </li>
              ) : null
            })
          : Array.from({ length: FREQUENT_LIMIT }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                <SurahCardSkeleton />
              </li>
            ))}
      </ul>
    </section>
  )
}

function Home() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div aria-hidden="true" className="khatam-pattern absolute inset-0" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-16 pb-14 text-center sm:px-6 md:pt-24 md:pb-20">
          <p lang="bn" className="font-display text-5xl leading-tight text-gold md:text-7xl">
            {site.nameBn}
          </p>
          <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            Read the Quran in Arabic and Bangla, with recitation
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">
            All 114 surahs with Bangla translation and verse-by-verse audio, a search across 40+
            languages, and Bangla articles grounded in the Quran and hadith.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/surah">
                <BookOpen />
                Browse surahs
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/search">
                <Search />
                Search the Quran
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex w-full justify-center">
            <ContinueReading />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-14 sm:px-6">
        {/* The next prayer beside the dua of the day; stacked on phones, prayer first. */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <NextPrayerCard />
          <DuaOfTheDay />
        </div>

        <section aria-labelledby="explore-heading">
          <SectionHeading
            id="explore-heading"
            title="Explore"
            description="Everything on ILMIYAH, one click away. Press Ctrl+K anywhere to jump."
          />
          {/* Bento: Surahs as the large tile, the other four as a 2×2 block beside it. Prayer
              times has its own card above. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {appPages
              .filter((page) => page.path !== "/writers" && page.path !== "/prayer-times")
              .map((page, index) =>
                index === 0 ? (
                  <PageCard
                    key={page.path}
                    page={page}
                    featured
                    className="sm:col-span-2 lg:row-span-2"
                  />
                ) : (
                  <PageCard key={page.path} page={page} />
                )
              )}
          </div>
        </section>

        <FrequentSurahs />

        <section aria-labelledby="popular-heading">
          <SectionHeading
            id="popular-heading"
            title="Popular surahs"
            description="Surahs many people read every day and every Friday."
            more={{ label: "All 114 surahs", link: pageByPath.surahs.link }}
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_SURAHS.slice(1).map((n) => {
              const page = surahPages[n - 1]
              return page ? (
                <li key={n}>
                  <SurahCard page={page} />
                </li>
              ) : null
            })}
          </ul>
        </section>

        <section aria-labelledby="articles-heading">
          <SectionHeading
            id="articles-heading"
            title="Latest articles"
            description="Bangla articles from Nusus, Monthly At-Tahreek and more."
            more={{ label: "All articles", link: pageByPath.blog.link }}
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {postPages.slice(0, 3).map((page) => (
              <li key={page.path}>
                <PostCard page={page} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
