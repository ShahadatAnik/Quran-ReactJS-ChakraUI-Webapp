import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { Loader2, RotateCcw, SearchX, X } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { PageGuide } from "@/components/page-guide"
import { IconTile, PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useEditions } from "@/hooks/use-editions"
import { usePersistedState } from "@/hooks/use-persisted-state"
import { useQuranSearch } from "@/hooks/use-quran-search"
import {
  DEFAULT_SEARCH_EDITION,
  type Edition,
  editionLabel,
  isRtl,
  searchableEditions,
} from "@/lib/editions"
import { pageByPath } from "@/lib/pages"
import { highlight, MIN_SEARCH_LENGTH, type SearchMatch } from "@/lib/search"
import { pageSeo } from "@/lib/seo"
import { ayahId, getSurah } from "@/lib/surahs"

const page = pageByPath.search
const PAGE_SIZE = 50
const EDITION_ID = /^[a-z0-9.-]{3,40}$/

interface SearchParams {
  q?: string
  edition?: string
}

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === "string" ? search.q.slice(0, 100) : undefined,
    edition:
      typeof search.edition === "string" && EDITION_ID.test(search.edition)
        ? search.edition
        : undefined,
  }),
  head: () => pageSeo(page),
  component: SearchRoute,
})

function Highlighted({ text, term }: { text: string; term: string }) {
  return highlight(text, term).map((segment, index) =>
    segment.match ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are derived, never reordered.
      <mark key={index} className="rounded-sm bg-gold/30 px-0.5 text-foreground">
        {segment.text}
      </mark>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are derived, never reordered.
      <span key={index}>{segment.text}</span>
    )
  )
}

/** Consecutive matches from the same surah, in Quran order. */
function groupBySurah(matches: readonly SearchMatch[]) {
  const groups: { surah: number; matches: SearchMatch[] }[] = []
  for (const match of matches) {
    const last = groups.at(-1)
    if (last?.surah === match.surah) last.matches.push(match)
    else groups.push({ surah: match.surah, matches: [match] })
  }
  return groups
}

function SearchRoute() {
  const params = Route.useSearch()
  const navigate = useNavigate({ from: "/search" })
  const [query, setQuery] = usePersistedState("search-query", "", (v) =>
    typeof v === "string" ? v : undefined
  )
  const [edition, setEdition] = usePersistedState("search-edition", DEFAULT_SEARCH_EDITION, (v) =>
    typeof v === "string" && EDITION_ID.test(v) ? v : undefined
  )
  const [shown, setShown] = useState(PAGE_SIZE)
  const editions = useEditions()
  const ids = { query: useId(), edition: useId() }

  // A ?q= link (e.g. from the command menu) wins over the saved query. Read after mount so
  // the prerendered page and the first client render match.
  // biome-ignore lint/correctness/useExhaustiveDependencies: apply URL parameters once, on arrival.
  useEffect(() => {
    if (params.q !== undefined) setQuery(params.q)
    if (params.edition) setEdition(params.edition)
  }, [])

  const term = useDebouncedValue(query.trim(), 300)
  const search = useQuranSearch(term, edition)

  // Keep the address shareable without adding a history entry per keystroke.
  useEffect(() => {
    void navigate({
      search: {
        q: term || undefined,
        edition: edition === DEFAULT_SEARCH_EDITION ? undefined : edition,
      },
      replace: true,
      resetScroll: false,
    })
  }, [term, edition, navigate])

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new search starts at the first page.
  useEffect(() => setShown(PAGE_SIZE), [term, edition])

  const options = searchableEditions(editions.editions)
  const selected: Edition | undefined = options.find((e) => e.identifier === edition)
  const rtl = isRtl(selected) || edition.startsWith("quran")
  const lang = selected?.language ?? (edition.startsWith("quran") ? "ar" : edition.split(".")[0])
  const matches = search.status === "done" ? search.matches : []
  const tooShort = query.trim().length > 0 && [...query.trim()].length < MIN_SEARCH_LENGTH

  return (
    <PageLayout
      crumb={page.title}
      title={page.title}
      description={page.description}
      media={<IconTile icon={page.icon} />}
      width="reading"
    >
      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-[1fr_1.4fr] sm:p-6">
        <div className="space-y-1.5">
          <label htmlFor={ids.edition} className="text-sm font-medium">
            Search in
          </label>
          <Select value={edition} onValueChange={setEdition}>
            <SelectTrigger id={ids.edition} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {selected ? null : (
                <SelectItem value={edition}>
                  {edition === DEFAULT_SEARCH_EDITION ? "Bangla: Muhiuddin Khan" : edition}
                </SelectItem>
              )}
              {options.map((e) => (
                <SelectItem key={e.identifier} value={e.identifier}>
                  {e.type === "quran" ? `Arabic: ${e.englishName}` : editionLabel(e)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {editions.status === "error" ? (
            <p className="text-xs text-destructive" role="alert">
              Couldn't load the list of translations.{" "}
              <button type="button" className="underline" onClick={editions.retry}>
                Try again
              </button>
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <label htmlFor={ids.query} className="text-sm font-medium">
            Word or phrase
          </label>
          <div className="relative">
            <Input
              id={ids.query}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={edition.startsWith("bn") ? "যেমন: দয়া, জান্নাত" : "e.g. mercy, patience"}
              dir={rtl ? "rtl" : undefined}
              className="h-9 pr-16"
              autoComplete="off"
              enterKeyHint="search"
            />
            <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center gap-1">
              {search.status === "loading" ? (
                <Loader2
                  className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : null}
              {query ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                >
                  <X />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="results-heading" className="mt-8">
        <h2 id="results-heading" className="sr-only">
          Results
        </h2>
        <p aria-live="polite" className="mb-4 text-sm text-muted-foreground">
          {tooShort
            ? `Type at least ${MIN_SEARCH_LENGTH} letters to search.`
            : search.status === "loading"
              ? `Searching for “${search.term}”…`
              : search.status === "done" && matches.length > 0
                ? `${matches.length} ${matches.length === 1 ? "ayah matches" : "ayahs match"} “${search.term}”.`
                : search.status === "idle"
                  ? "Results appear here as you type."
                  : ""}
        </p>

        {search.status === "error" ? (
          <Empty className="rounded-xl ring-1 ring-foreground/10">
            <EmptyHeader>
              <EmptyTitle>The search didn't go through</EmptyTitle>
              <EmptyDescription>
                {search.message}. Check your connection and try again.
              </EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={search.retry}>
              <RotateCcw />
              Try again
            </Button>
          </Empty>
        ) : search.status === "done" && matches.length === 0 ? (
          <Empty className="rounded-xl ring-1 ring-foreground/10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>No ayah contains “{search.term}”</EmptyTitle>
              <EmptyDescription>
                The search matches this translation's exact spelling. Try a shorter word, another
                spelling or another translation.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}

        <div className="space-y-8">
          {groupBySurah(matches.slice(0, shown)).map((group) => {
            const surah = getSurah(group.surah)
            return (
              <section key={`${group.surah}-${group.matches[0]?.ayah}`} aria-label={surah?.name}>
                <h3 className="mb-2 flex items-baseline gap-2 font-semibold">
                  {surah?.number}. {surah?.name}
                  <span className="text-xs font-normal text-muted-foreground">
                    {surah?.meaning}
                  </span>
                  <span
                    lang="ar"
                    dir="rtl"
                    className="ml-auto font-arabic text-lg font-normal text-gold"
                  >
                    {surah?.arabic}
                  </span>
                </h3>
                <ol className="divide-y divide-border/50 rounded-xl bg-card ring-1 ring-foreground/10">
                  {group.matches.map((match) => (
                    <li key={`${match.surah}:${match.ayah}`}>
                      <Link
                        to="/surah/$number"
                        params={{ number: String(match.surah) }}
                        hash={ayahId(match.ayah)}
                        className="flex gap-4 px-4 py-3 transition-colors outline-none hover:bg-accent/50 focus-visible:bg-accent/50"
                      >
                        <span className="w-14 shrink-0 pt-0.5 text-sm font-semibold text-gold tabular-nums">
                          {match.surah}:{match.ayah}
                        </span>
                        <span
                          lang={lang}
                          dir={rtl ? "rtl" : "ltr"}
                          className={
                            rtl ? "flex-1 font-arabic text-xl leading-loose" : "flex-1 text-pretty"
                          }
                        >
                          <Highlighted
                            text={match.text}
                            term={search.status === "done" ? search.term : ""}
                          />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            )
          })}
        </div>

        {matches.length > shown ? (
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => setShown((n) => n + PAGE_SIZE)}>
              Show {Math.min(PAGE_SIZE, matches.length - shown)} more of {matches.length - shown}
            </Button>
          </div>
        ) : null}
      </section>

      <PageGuide page={page} />
    </PageLayout>
  )
}
