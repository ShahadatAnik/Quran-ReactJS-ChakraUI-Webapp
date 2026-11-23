import { Link } from "@tanstack/react-router"
import { duaCategory, duas } from "@/content/duas"
import { posts } from "@/content/posts"
import { getWriter, writers } from "@/content/writers"
import { formatBanglaDate, toBanglaDigits } from "@/lib/bangla"
import { duaOpening, duaSource } from "@/lib/duas"
import type { DuaPage, Page, PostPage, SurahPage } from "@/lib/pages"
import { AYAH_COUNT } from "@/lib/surahs"
import { cn } from "@/lib/utils"

const cardClass =
  "group relative flex h-full flex-col gap-3 rounded-xl bg-card p-5 text-card-foreground ring-1 ring-foreground/10 outline-none transition-[box-shadow,background-color] hover:bg-accent/40 hover:ring-primary/40 focus-visible:ring-3 focus-visible:ring-ring/60"

/**
 * What each main destination is called in Arabic, shown large as the card's emblem, and a
 * one-line fact about it.
 */
const destinations: Record<string, { arabic: string; fact: string }> = {
  "/surah": { arabic: "السُّوَر", fact: `114 surahs · ${AYAH_COUNT.toLocaleString("en")} ayahs` },
  "/ayah": { arabic: "آيَة", fact: "Any ayah, e.g. 2:255" },
  "/search": { arabic: "بَحْث", fact: "40+ languages" },
  "/duas": { arabic: "دُعَاء", fact: `${duas.length} duas & ayahs` },
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
    <Link
      {...page.link}
      className={cn(
        "group relative isolate flex h-full min-h-56 flex-col overflow-hidden rounded-2xl bg-card p-5 text-card-foreground ring-1 ring-foreground/10 transition-[box-shadow] outline-none hover:ring-gold/50 focus-visible:ring-3 focus-visible:ring-ring/60",
        featured && "p-6 md:p-8",
        className
      )}
    >
      {/* Star lattice fading out from the top-right corner; it brightens on hover. */}
      <div
        aria-hidden="true"
        className={cn(
          "khatam-corner absolute -top-4 -right-4 -z-10 opacity-50 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none",
          featured ? "size-96" : "size-48"
        )}
      />
      {destination ? (
        <span
          aria-hidden="true"
          lang="ar"
          dir="rtl"
          className={cn(
            "self-end font-arabic leading-[1.5] text-gold transition-transform duration-500 ease-out group-hover:-translate-y-0.5 motion-reduce:transition-none",
            featured ? "text-7xl md:text-8xl" : "text-5xl"
          )}
        >
          {destination.arabic}
        </span>
      ) : null}
      <div className="mt-auto space-y-1.5 pt-4">
        {destination ? (
          <p className="text-xs font-medium tracking-wide text-gold uppercase">
            {destination.fact}
          </p>
        ) : null}
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

export function SurahCard({ page, className }: { page: SurahPage; className?: string }) {
  const { surah } = page
  return (
    <Link {...page.link} className={cn(cardClass, "flex-row items-center gap-4", className)}>
      <SurahNumber n={surah.number} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium">{surah.name}</h3>
        <p className="truncate text-xs text-muted-foreground">
          {surah.meaning} ·{" "}
          <span lang="bn" className="leading-none">
            {surah.meaningBn}
          </span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {surah.revelation} · {surah.ayahs} ayahs
        </p>
      </div>
      <span lang="ar" dir="rtl" className="shrink-0 text-2xl leading-none text-gold">
        {surah.arabic}
      </span>
    </Link>
  )
}

export function PostCard({ page, className }: { page: PostPage; className?: string }) {
  const { post } = page
  return (
    <Link {...page.link} className={cn(cardClass, className)} lang="bn">
      {post.series ? (
        <p className="text-xs font-medium text-gold">
          {post.series.name} · পর্ব {toBanglaDigits(post.series.part)}
        </p>
      ) : null}
      <h3 className="text-lg leading-snug font-semibold">{post.shortTitle}</h3>
      <p className="line-clamp-3 text-sm text-pretty text-muted-foreground">{post.summary}</p>
      <p className="mt-auto text-xs text-muted-foreground">
        <time dateTime={post.date}>{formatBanglaDate(post.date)}</time> ·{" "}
        {getWriter(post.writer).name}
      </p>
    </Link>
  )
}

/** A dua or well-known ayah: its category, opening words in Arabic, names and reference. */
export function DuaCard({ page, className }: { page: DuaPage; className?: string }) {
  const { dua } = page
  return (
    <Link {...page.link} className={cn(cardClass, "gap-2", className)}>
      <p className="text-xs font-medium tracking-wide text-gold uppercase">
        {duaCategory(dua.category).title}
      </p>
      {/* Top padding keeps Amiri's tall marks inside the two-line clip. */}
      <p
        lang="ar"
        dir="rtl"
        className="line-clamp-2 pt-2 font-arabic text-2xl leading-[1.9] text-foreground"
      >
        {duaOpening(dua)}
      </p>
      <div className="mt-auto space-y-0.5 pt-2">
        <h3 className="font-medium">{dua.title}</h3>
        <p lang="bn" className="text-sm text-muted-foreground">
          {dua.titleBn}
        </p>
        <p className="text-xs text-muted-foreground tabular-nums">{duaSource(dua)}</p>
      </div>
    </Link>
  )
}
