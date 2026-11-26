import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { DuaCard } from "@/components/page-card"
import { PageGuide } from "@/components/page-guide"
import { IconTile, PageLayout } from "@/components/page-layout"
import { DuaListSkeleton } from "@/components/skeletons"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { type DuaCategoryId, duaCategories } from "@/content/duas"
import { duaPages, pageByPath } from "@/lib/pages"
import { indexSeo } from "@/lib/seo"

const page = pageByPath.duas
type Filter = DuaCategoryId | "all"

export const Route = createFileRoute("/duas/")({
  head: () => indexSeo(page, duaPages),
  component: DuasIndex,
  pendingComponent: DuaListSkeleton,
})

function DuasIndex() {
  const [filter, setFilter] = useState<Filter>("all")
  const shown = duaCategories.filter((c) => filter === "all" || c.id === filter)

  return (
    <PageLayout
      crumb={page.title}
      title={page.title}
      description={page.description}
      media={<IconTile icon={page.icon} />}
    >
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        aria-label="Show duas by theme"
        value={filter}
        onValueChange={(value) => value && setFilter(value as Filter)}
        className="flex-wrap justify-start gap-2"
      >
        <ToggleGroupItem value="all" className="rounded-full px-3">
          All
        </ToggleGroupItem>
        {duaCategories.map((category) => (
          <ToggleGroupItem key={category.id} value={category.id} className="rounded-full px-3">
            {category.title}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="mt-8 space-y-10">
        {shown.map((category) => {
          const items = duaPages.filter((p) => p.dua.category === category.id)
          return (
            <section key={category.id} aria-labelledby={`dua-${category.id}`}>
              <h2
                id={`dua-${category.id}`}
                className="mb-4 flex flex-wrap items-baseline gap-x-3 text-lg font-semibold tracking-tight"
              >
                {category.title}
                <span lang="bn" className="text-sm font-normal text-muted-foreground">
                  {category.titleBn}
                </span>
              </h2>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <li key={item.path}>
                    <DuaCard page={item} />
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      <PageGuide page={page} />
    </PageLayout>
  )
}
