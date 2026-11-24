import { Link } from "@tanstack/react-router"
import { duaCategory, duas } from "@/content/duas"
import { posts } from "@/content/posts"
import { getWriter, writers } from "@/content/writers"
import { formatBanglaDate, toBanglaDigits } from "@/lib/bangla"
import { duaOpening, duaReference } from "@/lib/duas"
import type { DuaPage, Page, PostPage, SurahPage } from "@/lib/pages"
import { AYAH_COUNT } from "@/lib/surahs"
import { cn } from "@/lib/utils"

/** The frame every card shares (the Explore look): rounded, outlined in gold on hover. */
const cardClass =
  "group relative isolate flex h-full flex-col overflow-hidden rounded-2xl bg-card p-5 text-card-foreground ring-1 ring-foreground/10 transition-shadow outline-none hover:ring-gold/50 focus-visible:ring-3 focus-visible:ring-ring/60"

/** The same frame for panels that aren't links (e.g. the reading history). */
export const panelClass =
  "relative isolate overflow-hidden rounded-2xl bg-card p-5 text-card-foreground ring-1 ring-foreground/10"

/** Star lattice fading out from a card's top-right corner; it brightens on hover. */
export function CornerLattice({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "khatam-corner absolute -top-4 -right-4 -z-10 size-48 opacity-50 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none",
        className
      )}
    />
  )
}

/** The gold line of facts above a card's title. */
export const factClass = "text-xs font-medium tracking-wide text-gold uppercase"

/**
 * What each main destination is called in Arabic, shown large as the card's emblem, and a
 * one-line fact about it.
 */
const destinations: Record<string, { arabic: string; fact: string }> = {
  "/surah": { arabic: "السُّوَر", fact: `114 surahs · ${AYAH_COUNT.toLocaleString("en")} ayahs` },
  "/ayah": { arabic: "آيَة", fact: "Any ayah, e.g. 2:255" },
  "/search": { arabic: "بَحْث", fact: "40+ languages" },
  "/duas": { arabic: "دُعَاء", fact: `${duas.length} duas & ayahs` },
  "/prayer-times": { arabic: "الصَّلَاة", fact: "5 daily prayers · Qibla" },
  "/blog": { arabic: "مَقَالَات", fact: `${posts.length} articles in Bangla` },
  "/writers": { arabic: "كُتَّاب", fact: `${writers.length} writers` },
}

/**
 * Card linking to any registry page; surahs and articles get their own layout. `featured`
 * is the large tile of the home page's bento grid: bigger Arabic and text.
 */
export function PageCard({
  page,
  className,
  featured = false,
}: {
  page: Page
  className?: string
  featured?: boolean
}) {
  if (page.kind === "surah") return <SurahCard page={page} className={className} />
  if (page.kind === "post") return <PostCard page={page} className={className} />
  if (page.kind === "dua") return <DuaCard page={page} className={className} />
  const destination = destinations[page.path]
  return (
    <Link {...page.link} className={cn(cardClass, "min-h-56", featured && "p-6 md:p-8", className)}>
      <CornerLattice className={featured ? "size-96" : undefined} />
      {destination ? (
        <span
          aria-hidden="true"
          lang="ar"
          dir="rtl"
          className={cn(
            "self-end font-arabic leading-normal text-gold transition-transform duration-500 ease-out group-hover:-translate-y-0.5 motion-reduce:transition-none",
            featured ? "text-7xl md:text-8xl" : "text-5xl"
          )}
        >
          {destination.arabic}
        </span>
      ) : null}
      <div className="mt-auto space-y-1.5 pt-4">
        {destination ? <p className={factClass}>{destination.fact}</p> : null}
        <h3
          className={cn(
            "font-semibold tracking-tight",
            featured ? "text-2xl md:text-3xl" : "text-lg"
          )}
        >
          {page.title}
        </h3>
        {featured ? (
          <p className="max-w-md text-base text-pretty text-muted-foreground">{page.description}</p>
        ) : (
          // Always three lines tall, so titles and descriptions line up across a row.
          <p className="line-clamp-3 min-h-[3lh] text-sm text-pretty text-muted-foreground">
            {page.summary}
          </p>
        )}
      </div>
    </Link>
  )
}

export function SurahNumber({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center text-sm font-semibold tabular-nums",
        className
      )}
    >
      {/* Eight-point star outline behind the number. */}
      <svg viewBox="0 0 40 40" aria-hidden="true" className="absolute inset-0 size-full text-gold">
        <rect x="8" y="8" width="24" height="24" rx="3" fill="none" stroke="currentColor" />
        <rect
          x="8"
          y="8"
          width="24"
          height="24"
          rx="3"
          fill="none"
          stroke="currentColor"
          transform="rotate(45 20 20)"
        />
      </svg>
      <span className="relative">{n}</span>
    </span>
  )
}

/** A surah: number and Arabic name on top, then its facts, name and meaning. */
export function SurahCard({ page, className }: { page: SurahPage; className?: string }) {
  const { surah } = page
  return (
    <Link {...page.link} className={cn(cardClass, "gap-3", className)}>
      <CornerLattice />
      <div className="flex items-start justify-between gap-3">
        <SurahNumber n={surah.number} />
        {/* Amiri sits low in its line box; .arabic-glyph-centred lifts it onto the line. */}
        <span lang="ar" dir="rtl" className="flex h-10 items-center text-3xl text-gold">
          <span className="arabic-glyph-centred">{surah.arabic}</span>
        </span>
      </div>
      <div className="mt-auto space-y-1">
        <p className={factClass}>
          {surah.revelation} · {surah.ayahs} {surah.ayahs === 1 ? "ayah" : "ayahs"}
        </p>
        <h3 className="truncate text-lg font-semibold tracking-tight">{surah.name}</h3>
        <p className="truncate text-sm text-muted-foreground">
          {surah.meaning} · <span lang="bn">{surah.meaningBn}</span>
        </p>
      </div>
    </Link>
  )
}

/** An article: series and part (or "article"), title, summary, then date and writer. */
export function PostCard({ page, className }: { page: PostPage; className?: string }) {
  const { post } = page
  return (
    <Link {...page.link} className={cn(cardClass, "gap-3", className)} lang="bn">
      <CornerLattice />
      <p className="text-xs font-medium text-gold">
        {post.series ? `${post.series.name} · পর্ব ${toBanglaDigits(post.series.part)}` : "প্রবন্ধ"}
      </p>
      <h3 className="text-lg leading-snug font-semibold">{post.shortTitle}</h3>
      <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">{post.summary}</p>
      <p className="mt-auto text-xs text-muted-foreground">
        <time dateTime={post.date}>{formatBanglaDate(post.date)}</time> ·{" "}
        {getWriter(post.writer).name}
      </p>
    </Link>
  )
}

/** A dua or well-known ayah: its opening words in gold, then category, reference and names. */
export function DuaCard({ page, className }: { page: DuaPage; className?: string }) {
  const { dua } = page
  return (
    <Link {...page.link} className={cn(cardClass, "gap-3", className)}>
      <CornerLattice />
      {/* Top padding keeps Amiri's tall marks inside the two-line clip. */}
      <p
        lang="ar"
        dir="rtl"
        className="line-clamp-2 pt-2 font-arabic text-2xl leading-arabic-snug text-gold"
      >
        {duaOpening(dua)}
      </p>
      <div className="mt-auto space-y-1">
        <p className={factClass}>
          {duaCategory(dua.category).title} · {duaReference(dua)}
        </p>
        <h3 className="text-lg font-semibold tracking-tight">{dua.title}</h3>
        <p lang="bn" className="text-sm text-muted-foreground">
          {dua.titleBn}
        </p>
      </div>
    </Link>
  )
}
