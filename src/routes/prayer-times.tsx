import { createFileRoute } from "@tanstack/react-router"
import { PageGuide } from "@/components/page-guide"
import { IconTile, PageLayout } from "@/components/page-layout"
import { PrayerDashboard } from "@/components/prayer-times"
import { PrayerTimesSkeleton } from "@/components/skeletons"
import { pageByPath } from "@/lib/pages"
import { pageSeo } from "@/lib/seo"

const page = pageByPath.prayerTimes

export const Route = createFileRoute("/prayer-times")({
  head: () => pageSeo(page),
  component: PrayerTimesRoute,
  pendingComponent: PrayerTimesSkeleton,
})

/**
 * Prayer times for the reader's location. The times depend on this browser's location and
 * clock, so the prerendered page has the frame, guide and FAQ, and the times fill in on load.
 */
function PrayerTimesRoute() {
  return (
    <PageLayout
      crumb={page.title}
      title={page.title}
      description={page.description}
      media={<IconTile icon={page.icon} />}
    >
      <PrayerDashboard />
      <PageGuide page={page} />
    </PageLayout>
  )
}
