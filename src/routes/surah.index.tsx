import { createFileRoute } from "@tanstack/react-router"
import { SearchX, X } from "lucide-react"
import { useId } from "react"
import { SurahCard } from "@/components/page-card"
import { IconTile, PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { usePersistedState } from "@/hooks/use-persisted-state"
import { pageByPath, surahPages } from "@/lib/pages"
import { filterSurahs } from "@/lib/search"
import { indexSeo } from "@/lib/seo"

const page = pageByPath.surahs
type Revelation = "all" | "Meccan" | "Medinan"

export const Route = createFileRoute("/surah/")({
  head: () => indexSeo(page, surahPages),
  component: SurahIndex,
})

function SurahIndex() {
  const [query, setQuery] = usePersistedState("surah-filter", "", (v) =>
    typeof v === "string" ? v : undefined
  )
  const [revelation, setRevelation] = usePersistedState<Revelation>(
    "surah-revelation",
    "all",
    (v) => (v === "all" || v === "Meccan" || v === "Medinan" ? v : undefined)
  )
  const inputId = useId()
  const matches = filterSurahs(query).filter(
    (s) => revelation === "all" || s.revelation === revelation
  )

  return (
    <PageLayout
      crumb={page.title}
      title="The 114 surahs of the Quran"
      description={page.description}
      media={<IconTile icon={page.icon} />}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor={inputId} className="sr-only">
          Filter surahs
        </label>
        <div className="relative w-full sm:max-w-sm">
          <Input
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, meaning or number (e.g. fatiha, cow, 36)"
            className="h-10 pr-9"
            autoComplete="off"
          />
          {query ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Clear filter"
              className="absolute top-1/2 right-1.5 -translate-y-1/2"
              onClick={() => setQuery("")}
            >
              <X />
            </Button>
          ) : null}
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-label="Revelation place"
          value={revelation}
          onValueChange={(value) => value && setRevelation(value as Revelation)}
        >
          <ToggleGroupItem value="all">All</ToggleGroupItem>
          <ToggleGroupItem value="Meccan">Meccan</ToggleGroupItem>
          <ToggleGroupItem value="Medinan">Medinan</ToggleGroupItem>
        </ToggleGroup>
        <p aria-live="polite" className="text-sm text-muted-foreground sm:ml-auto">
          {matches.length === 114 ? "114 surahs" : `${matches.length} of 114 surahs`}
        </p>
      </div>

      {matches.length > 0 ? (
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((surah) => {
            const surahPage = surahPages[surah.number - 1]
            return surahPage ? (
              <li key={surah.number}>
                <SurahCard page={surahPage} />
              </li>
            ) : null
          })}
        </ol>
      ) : (
        <Empty className="rounded-xl ring-1 ring-foreground/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX />
            </EmptyMedia>
            <EmptyTitle>No surah matches “{query}”</EmptyTitle>
            <EmptyDescription>
              Try another spelling, an English meaning such as “cave”, or a number from 1 to 114.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            variant="outline"
            onClick={() => {
              setQuery("")
              setRevelation("all")
            }}
          >
            Show all surahs
          </Button>
        </Empty>
      )}
    </PageLayout>
  )
}
