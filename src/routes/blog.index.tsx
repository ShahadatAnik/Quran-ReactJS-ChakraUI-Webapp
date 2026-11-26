import { createFileRoute } from "@tanstack/react-router"
import { PostCard } from "@/components/page-card"
import { IconTile, PageLayout } from "@/components/page-layout"
import { BlogListSkeleton } from "@/components/skeletons"
import { pageByPath, postPages } from "@/lib/pages"
import { indexSeo } from "@/lib/seo"

const page = pageByPath.blog

export const Route = createFileRoute("/blog/")({
  head: () => indexSeo(page, postPages),
  component: BlogIndex,
  pendingComponent: BlogListSkeleton,
})

function BlogIndex() {
  const series = postPages.filter((p) => p.post.series)
  const standalone = postPages.filter((p) => !p.post.series)
  const seriesName = series[0]?.post.series?.name

  return (
    <PageLayout
      crumb={page.title}
      title="Bangla Islamic articles"
      description={page.description}
      media={<IconTile icon={page.icon} />}
    >
      <div className="space-y-14">
        {seriesName ? (
          <section aria-labelledby="series-heading">
            <h2
              id="series-heading"
              lang="bn"
              className="mb-1 text-2xl font-semibold tracking-tight"
            >
              {seriesName}
            </h2>
            <p className="mb-6 text-sm text-muted-foreground">
              A five-part series by Nusus on durood: what it is, why it matters, its benefits, its
              wording and when to recite it.
            </p>
            <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...series]
                .sort((a, b) => (a.post.series?.part ?? 0) - (b.post.series?.part ?? 0))
                .map((p) => (
                  <li key={p.path}>
                    <PostCard page={p} />
                  </li>
                ))}
            </ol>
          </section>
        ) : null}

        <section aria-labelledby="more-heading">
          <h2 id="more-heading" className="mb-6 text-2xl font-semibold tracking-tight">
            More articles
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {standalone.map((p) => (
              <li key={p.path}>
                <PostCard page={p} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageLayout>
  )
}
