import type { ReactNode } from "react"
import { factClass, panelClass } from "@/components/page-card"
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Loading placeholders, shaped like what they stand in for so nothing jumps when it arrives.
 * Each page has its own, which the router shows while that page loads on a client navigation
 * (its code, or a surah's or an article's text); the card and panel skeletons are also used
 * inside pages, while something is read from this browser or fetched.
 *
 * Kept free of heavy imports: every route's skeleton ships with the main bundle, so it can
 * show before the page's own code arrives.
 */

const keys = (count: number) => Array.from({ length: count }, (_, i) => `s${i}`)

/* ------------------------------------------------------------------ cards and panels -- */

/** The frame of a card, without its hover and link styles. */
const cardFrame = cn(panelClass, "flex h-full flex-col gap-3")

/**
 * A SurahCard: its own boxes and text styles, with skeleton text in the lines (the Bangla
 * meaning too, whose font sets that line's height), so it is exactly the card's height.
 */
export function SurahCardSkeleton() {
  return (
    <div className={cardFrame}>
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="mt-auto space-y-1">
        <p className={factClass}>
          <SkeletonText>Meccan · 286 ayahs</SkeletonText>
        </p>
        <p className="truncate text-lg font-semibold tracking-tight">
          <SkeletonText>Al-Baqarah</SkeletonText>
        </p>
        <p className="overflow-x-clip text-sm text-ellipsis whitespace-nowrap">
          <SkeletonText>
            The Cow · <span lang="bn">গাভী</span>
          </SkeletonText>
        </p>
      </div>
    </div>
  )
}

/** A PostCard: series line, title, three lines of summary, date and writer. */
export function PostCardSkeleton() {
  return (
    <div className={cardFrame}>
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-5 w-4/5" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
      </div>
      <Skeleton className="mt-auto h-3 w-40" />
    </div>
  )
}

/** A DuaCard: two Arabic lines, then category, title and Bangla title. */
export function DuaCardSkeleton() {
  return (
    <div className={cardFrame}>
      <div className="space-y-2.5 pt-2">
        <Skeleton className="ms-auto h-7 w-full" />
        <Skeleton className="ms-auto h-7 w-3/5" />
      </div>
      <div className="mt-auto space-y-2 pt-1">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}

/** A PageCard of the home page's Explore grid; `featured` is its large tile. */
export function PageCardSkeleton({
  featured = false,
  className,
}: {
  featured?: boolean
  className?: string
}) {
  return (
    <div className={cn(cardFrame, "min-h-56", featured && "p-6 md:p-8", className)}>
      <Skeleton className={cn("self-end", featured ? "h-20 w-44 md:h-24 md:w-56" : "h-12 w-24")} />
      <div className="mt-auto space-y-2 pt-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className={featured ? "h-8 w-40" : "h-5 w-28"} />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-4/5" />
        {featured ? null : <Skeleton className="h-3.5 w-1/2" />}
      </div>
    </div>
  )
}

/** A grid of card skeletons, laid out like the pages' card grids. */
export function CardGridSkeleton({ count, card: Card }: { count: number; card: () => ReactNode }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {keys(count).map((key) => (
        <li key={key}>
          <Card />
        </li>
      ))}
    </ul>
  )
}

/** One ayah: reference and buttons, two Arabic lines, then the translation. */
export function AyahSkeleton({ className }: { className?: string }) {
  return (
    <div aria-busy="true" className={cn("rounded-xl px-3 py-5 sm:px-5", className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="size-7 rounded-lg" />
        <Skeleton className="size-7 rounded-lg" />
        <Skeleton className="ml-auto size-9 rounded-lg" />
      </div>
      <div className="mt-4 space-y-3">
        <Skeleton className="ms-auto h-8 w-full" />
        <Skeleton className="ms-auto h-8 w-2/3" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  )
}

/** A list of ayahs, divided like SurahReader's. */
function AyahListSkeleton({ count }: { count: number }) {
  return (
    <div className="divide-y divide-border/50">
      {keys(count).map((key) => (
        <AyahSkeleton key={key} />
      ))}
    </div>
  )
}

/** A section heading of the home page: title and description, maybe a link on the right. */
function SectionHeadingSkeleton({ more = false }: { more?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {more ? <Skeleton className="h-8 w-28 rounded-lg" /> : null}
    </div>
  )
}

/* -------------------------------------------------------------- page-level dashboards -- */

/** The history page while this browser's log is read: tiles, Khatm bar, calendar, lists. */
export function ReadingDashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {keys(4).map((key) => (
          <div key={key} className={cn(panelClass, "space-y-2.5 p-4 sm:p-5")}>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28 max-w-full" />
          </div>
        ))}
      </div>
      <div className={cn(panelClass, "space-y-3")}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <div className={cn(panelClass, "space-y-3")}>
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-28 w-full" />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_1.4fr]">
        <div className={cn(panelClass, "space-y-3.5")}>
          <Skeleton className="h-3 w-24" />
          {keys(5).map((key) => (
            <div key={key} className="flex items-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 flex-1 rounded-full" />
            </div>
          ))}
        </div>
        <div className={cn(panelClass, "space-y-3.5")}>
          <Skeleton className="h-3 w-24" />
          {keys(4).map((key) => (
            <div key={key} className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-56 max-w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** The prayer-times page while the location and clock are read: the dashboard's shape. */
export function PrayerDashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className={cn(panelClass, "space-y-5 p-6 md:p-8")}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-44" />
          </div>
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2.5">
            <Skeleton className="h-11 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-14 w-24" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {keys(6).map((key) => (
          <div key={key} className={cn(panelClass, "space-y-3 p-4")}>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className={cn(panelClass, "space-y-4")}>
          <Skeleton className="h-3 w-32" />
          {keys(7).map((key) => (
            <Skeleton key={key} className="h-5 w-full" />
          ))}
        </div>
        <div className="space-y-4">
          <div className={cn(panelClass, "space-y-4")}>
            <Skeleton className="h-3 w-16" />
            <div className="flex items-center gap-5">
              <Skeleton className="size-28 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
          <div className={cn(panelClass, "space-y-4")}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------------- page frame -- */

interface PageFrameSkeletonProps {
  /** What is loading, for screen readers. */
  label: string
  width?: "default" | "reading"
  /** Ancestors in the breadcrumb between Home and the page. */
  trail?: number
  /** The leading tile beside the title; reading pages show the surah number there. */
  media?: boolean
  /** Lines of description under the title. */
  description?: number
  /** The row of facts under the description (surah and dua pages). */
  facts?: boolean
  /** The actions at the right of the title: one button, or the Arabic name above it. */
  actions?: "button" | "reading"
  children: ReactNode
}

/** PageLayout's frame: breadcrumb, media, title, description and actions, then the body. */
function PageFrameSkeleton({
  label,
  width = "default",
  trail = 0,
  media = true,
  description = 1,
  facts = false,
  actions,
  children,
}: PageFrameSkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 md:py-12",
        width === "reading" ? "max-w-4xl" : "max-w-6xl"
      )}
    >
      <span className="sr-only">{label}</span>
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-10" />
        {keys(trail).map((key) => (
          <Skeleton key={key} className="h-3.5 w-14" />
        ))}
        <Skeleton className="h-3.5 w-24" />
      </div>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          {media ? <Skeleton className="size-12 shrink-0 rounded-xl" /> : null}
          <div className="min-w-0 flex-1 space-y-2.5">
            <Skeleton className="h-8 w-72 max-w-full" />
            {description >= 1 ? <Skeleton className="h-4 w-full max-w-xl" /> : null}
            {description >= 2 ? <Skeleton className="h-4 w-2/3 max-w-md" /> : null}
            {facts ? <Skeleton className="h-3.5 w-64 max-w-full" /> : null}
          </div>
        </div>
        {actions === "reading" ? (
          <div className="flex w-full flex-col gap-4 md:w-auto md:items-end">
            <Skeleton className="hidden h-12 w-32 md:block" />
            <Skeleton className="h-9 w-full rounded-lg md:w-24" />
          </div>
        ) : actions === "button" ? (
          <Skeleton className="h-8 w-32 shrink-0 rounded-lg" />
        ) : null}
      </div>
      <div className="mt-8">{children}</div>
    </div>
  )
}

/** Any page without a skeleton of its own: the page frame and three panels. */
export function PageSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the page…" description={2}>
      <div className="space-y-4">
        {["w-full", "w-11/12", "w-4/5"].map((width) => (
          <div key={width} className={cn(panelClass, "space-y-3")}>
            <Skeleton className="h-4 w-32" />
            <Skeleton className={cn("h-4", width)} />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </PageFrameSkeleton>
  )
}

/* ----------------------------------------------------------------------- each page -- */

/** Home: the hero, next prayer and dua of the day, Explore, popular surahs, articles. */
export function HomeSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading the home page…</span>
      <div className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-16 pb-14 sm:px-6 md:pt-24 md:pb-20">
          <Skeleton className="h-14 w-56 md:h-20 md:w-80" />
          <div className="mt-5 flex w-full flex-col items-center gap-3">
            <Skeleton className="h-8 w-full max-w-2xl md:h-11" />
            <Skeleton className="h-8 w-2/3 max-w-md md:h-11" />
          </div>
          <div className="mt-5 flex w-full flex-col items-center gap-2">
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-3/4 max-w-md" />
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Skeleton className="h-10 w-40 rounded-lg" />
            <Skeleton className="h-10 w-44 rounded-lg" />
          </div>
          <div className="mt-8 flex w-full max-w-md items-center gap-4 rounded-2xl bg-card/90 p-4 ring-1 ring-foreground/10">
            <Skeleton className="size-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-1 w-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className={cn(panelClass, "flex min-h-52 flex-col gap-4")}>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-40" />
            <div className="mt-auto grid grid-cols-5 gap-1">
              {keys(5).map((key) => (
                <div key={key} className="flex flex-col items-center gap-1.5 py-1.5">
                  <Skeleton className="h-2.5 w-9" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
          <div className={cn(panelClass, "min-h-52 space-y-3 sm:p-6")}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3.5 w-40" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
            <Skeleton className="ms-auto mt-5 h-7 w-11/12" />
            <Skeleton className="ms-auto h-7 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        <section>
          <SectionHeadingSkeleton />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PageCardSkeleton featured className="sm:col-span-2 lg:row-span-2" />
            {keys(4).map((key) => (
              <PageCardSkeleton key={key} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeadingSkeleton more />
          <CardGridSkeleton count={6} card={SurahCardSkeleton} />
        </section>

        <section>
          <SectionHeadingSkeleton more />
          <CardGridSkeleton count={3} card={PostCardSkeleton} />
        </section>
      </div>
    </div>
  )
}

/** The surah list: filter box, Meccan/Medinan switch and count, then the cards. */
export function SurahListSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the surahs…">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full rounded-lg sm:max-w-sm" />
        <Skeleton className="h-9 w-56 rounded-lg" />
        <Skeleton className="h-4 w-20 sm:ml-auto" />
      </div>
      <CardGridSkeleton count={9} card={SurahCardSkeleton} />
    </PageFrameSkeleton>
  )
}

/** A surah: its header, the Bismillah, then ayahs. */
export function SurahSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the surah…" width="reading" trail={1} facts actions="reading">
      <Skeleton className="mx-auto mb-6 h-10 w-72 max-w-full" />
      <AyahListSkeleton count={4} />
    </PageFrameSkeleton>
  )
}

/** Find an Ayah: the surah, ayah and reference fields, then the ayah. */
export function AyahPageSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the ayah…" width="reading">
      <div className={cn(panelClass, "grid grid-cols-1 gap-4 sm:grid-cols-2")}>
        {keys(2).map((key) => (
          <div key={key} className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
        <div className="space-y-2 sm:col-span-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-full rounded-lg" />
          <Skeleton className="h-3 w-72 max-w-full" />
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <div className="mt-4 rounded-2xl bg-card ring-1 ring-foreground/10">
        <AyahSkeleton />
      </div>
    </PageFrameSkeleton>
  )
}

/** Search: the query box and edition picker, then results grouped by surah. */
export function SearchSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the search…" width="reading">
      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-[1fr_1.4fr] sm:p-6">
        {["w-20", "w-28"].map((width) => (
          <div key={width} className="space-y-2">
            <Skeleton className={cn("h-4", width)} />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-8 mb-4 h-4 w-52" />
      <SearchResultsSkeleton />
    </PageFrameSkeleton>
  )
}

/** Search results while a search runs: a surah heading over its matching ayahs. */
export function SearchResultsSkeleton() {
  return (
    <div aria-hidden="true" className="space-y-8">
      {[3, 2].map((rows) => (
        <div key={rows}>
          <div className="mb-2 flex items-center gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="ml-auto h-6 w-20" />
          </div>
          <div className="divide-y divide-border/50 rounded-xl bg-card ring-1 ring-foreground/10">
            {keys(rows).map((row) => (
              <div key={row} className="flex gap-4 px-4 py-3">
                <Skeleton className="h-4 w-12 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/** The dua list: theme chips, then the duas of each theme. */
export function DuaListSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the duas…">
      <div className="flex flex-wrap gap-2">
        {["w-12", "w-28", "w-24", "w-32", "w-20", "w-36", "w-16"].map((width) => (
          <Skeleton key={width} className={cn("h-8 rounded-full", width)} />
        ))}
      </div>
      <div className="mt-8 space-y-10">
        {keys(2).map((key) => (
          <section key={key}>
            <Skeleton className="mb-4 h-6 w-56" />
            <CardGridSkeleton count={3} card={DuaCardSkeleton} />
          </section>
        ))}
      </div>
    </PageFrameSkeleton>
  )
}

/** A dua: laid out like a surah page, with its ayahs and the link to the surah. */
export function DuaSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the dua…" width="reading" trail={1} facts actions="reading">
      <AyahListSkeleton count={2} />
      <div className="mt-6 flex justify-end border-t border-border/50 pt-4">
        <Skeleton className="h-4 w-56" />
      </div>
    </PageFrameSkeleton>
  )
}

/** The article list: the series, then more articles. */
export function BlogListSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the articles…">
      <div className="space-y-14">
        <section>
          <Skeleton className="mb-2 h-7 w-56" />
          <Skeleton className="mb-6 h-4 w-96 max-w-full" />
          <CardGridSkeleton count={6} card={PostCardSkeleton} />
        </section>
        <section>
          <Skeleton className="mb-6 h-7 w-44" />
          <CardGridSkeleton count={3} card={PostCardSkeleton} />
        </section>
      </div>
    </PageFrameSkeleton>
  )
}

/** An article: title, date and writer, copy button, then paragraphs and a quoted ayah. */
export function ArticleSkeleton() {
  const paragraph = (key: string, last: string) => (
    <div key={key} className="space-y-2.5">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className={cn("h-4", last)} />
    </div>
  )
  return (
    <PageFrameSkeleton
      label="Loading the article…"
      width="reading"
      trail={1}
      media={false}
      actions="button"
    >
      <div className="space-y-6">
        {paragraph("p1", "w-3/5")}
        {paragraph("p2", "w-2/5")}
        <div className={cn(panelClass, "space-y-3")}>
          <Skeleton className="ms-auto h-7 w-full" />
          <Skeleton className="ms-auto h-7 w-1/2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        {paragraph("p3", "w-3/4")}
        {paragraph("p4", "w-1/3")}
      </div>
    </PageFrameSkeleton>
  )
}

/** Writers: an intro line, then a panel per writer with links and articles. */
export function WritersSkeleton() {
  return (
    <PageFrameSkeleton label="Loading the writers…" width="reading">
      <Skeleton className="mb-8 h-4 w-80 max-w-full" />
      <div className="space-y-6">
        {keys(3).map((key) => (
          <div key={key} className={cn(panelClass, "space-y-3 p-6")}>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/5" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </PageFrameSkeleton>
  )
}

/** Your reading: the history dashboard, with the Clear history button. */
export function HistorySkeleton() {
  return (
    <PageFrameSkeleton label="Loading your reading…" description={2} actions="button">
      <ReadingDashboardSkeleton />
    </PageFrameSkeleton>
  )
}

/** Prayer times: the dashboard. */
export function PrayerTimesSkeleton() {
  return (
    <PageFrameSkeleton label="Loading prayer times…">
      <PrayerDashboardSkeleton />
    </PageFrameSkeleton>
  )
}
