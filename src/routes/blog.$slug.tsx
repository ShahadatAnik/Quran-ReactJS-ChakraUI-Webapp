import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { Info } from "lucide-react"
import { ArticleBody } from "@/components/article-body"
import { CopyButton } from "@/components/copy-button"
import { PageGuide } from "@/components/page-guide"
import { PageLayout } from "@/components/page-layout"
import type { Block } from "@/content/types"
import { getWriter } from "@/content/writers"
import { formatBanglaDate, toBanglaDigits } from "@/lib/bangla"
import { getPostPage, type PostPage, pageByPath, postPages } from "@/lib/pages"
import { absoluteUrl, pageSeo } from "@/lib/seo"
import { cn } from "@/lib/utils"

const bodies = import.meta.glob<{ blocks: Block[] }>("../content/posts/*.ts")

function postPageFor(slug: string): PostPage {
  const page = getPostPage(slug)
  if (!page) throw notFound()
  return page
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const page = postPageFor(params.slug)
    const load = bodies[`../content/posts/${page.post.slug}.ts`]
    if (!load) throw notFound()
    return { blocks: (await load()).blocks }
  },
  head: ({ params }) => {
    const page = getPostPage(params.slug)
    return page ? pageSeo(page) : {}
  },
  component: PostRoute,
})

function SeriesNav({ page }: { page: PostPage }) {
  const series = page.post.series
  if (!series) return null
  const parts = postPages
    .filter((p) => p.post.series?.name === series.name)
    .sort((a, b) => (a.post.series?.part ?? 0) - (b.post.series?.part ?? 0))

  return (
    <nav
      aria-label={`${series.name}: সব পর্ব`}
      lang="bn"
      className="mb-10 rounded-xl bg-card p-4 ring-1 ring-foreground/10"
    >
      <p className="mb-2 text-sm font-medium text-gold">
        {series.name} · {toBanglaDigits(parts.length)} পর্বের সিরিজ
      </p>
      <ol className="space-y-1 text-sm">
        {parts.map((p) => {
          const current = p.path === page.path
          return (
            <li key={p.path}>
              <Link
                {...p.link}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "flex gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent",
                  current && "bg-accent font-medium text-accent-foreground"
                )}
              >
                <span className="text-muted-foreground tabular-nums">
                  {toBanglaDigits(p.post.series?.part ?? 0)}.
                </span>
                {p.post.shortTitle}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function PostRoute() {
  const { slug } = Route.useParams()
  const { blocks } = Route.useLoaderData()
  const page = postPageFor(slug)
  const { post } = page
  const writer = getWriter(post.writer)

  return (
    <PageLayout
      trail={[{ label: "Articles", link: pageByPath.blog.link }]}
      crumb={post.shortTitle}
      title={post.title}
      lang="bn"
      description={
        <>
          <time dateTime={post.date}>{formatBanglaDate(post.date)}</time> ·{" "}
          <Link to="/writers" hash={writer.id} className="underline-offset-4 hover:underline">
            {writer.name}
          </Link>
        </>
      }
      actions={
        <CopyButton
          value={absoluteUrl(page.path)}
          label="Copy link"
          successMessage="Article link copied"
        />
      }
      width="reading"
    >
      <SeriesNav page={page} />
      <article>
        <ArticleBody blocks={blocks} />
      </article>

      <aside
        lang="bn"
        className="mt-12 flex gap-3 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
        <p>
          {/* The notice the original site showed when text was copied, kept word for word. */}
          অনুমতি ব্যতিত ব্লগের কোনো পোস্ট কপি করে অন্যত্র প্রকাশ করা যাবে না। করা হলে তা লেখকের হক নষ্ট করা হচ্ছে
          বলে গণ্য হবে।
        </p>
      </aside>

      <PageGuide page={page} />
    </PageLayout>
  )
}
