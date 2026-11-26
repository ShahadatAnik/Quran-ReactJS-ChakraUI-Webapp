import { createFileRoute } from "@tanstack/react-router"
import { History } from "lucide-react"
import { IconTile, PageLayout } from "@/components/page-layout"
import { ClearHistory, ReadingDashboard } from "@/components/reading-history"
import { HistorySkeleton } from "@/components/skeletons"
import { ogImagePath } from "@/lib/pages"
import { READ_AFTER_MS } from "@/lib/reading-log"
import { seo } from "@/lib/seo"
import { site } from "@/lib/site"

const title = "Your reading"
const description = `Your Quran reading in this browser: streaks, Khatm progress, the surahs you read most and a day-by-day log. An ayah counts after ${READ_AFTER_MS / 1000} seconds on screen.`

export const Route = createFileRoute("/history")({
  head: () => {
    const head = seo({
      title: `${title} | ${site.name}`,
      description,
      path: "/history",
      image: ogImagePath("home"),
      imageAlt: site.homeTitle,
    })
    return {
      ...head,
      // Personal and empty for crawlers, so it stays out of search results and the sitemap.
      meta: [...head.meta, { name: "robots", content: "noindex, follow" }],
    }
  },
  component: HistoryRoute,
  pendingComponent: HistorySkeleton,
})

function HistoryRoute() {
  return (
    <PageLayout
      crumb="History"
      title={title}
      description={`Kept in this browser only, never sent anywhere. An ayah counts once it has been on screen for ${READ_AFTER_MS / 1000} seconds.`}
      media={<IconTile icon={History} />}
      actions={<ClearHistory />}
    >
      <ReadingDashboard />
    </PageLayout>
  )
}
