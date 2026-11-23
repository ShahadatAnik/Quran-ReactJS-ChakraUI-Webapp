import { createFileRoute, Link } from "@tanstack/react-router"
import { Globe } from "lucide-react"
import { FacebookIcon, YouTubeIcon } from "@/components/icons"
import { IconTile, PageLayout } from "@/components/page-layout"
import { writers } from "@/content/writers"
import { pageByPath, postPages } from "@/lib/pages"
import { indexSeo } from "@/lib/seo"

const page = pageByPath.writers
const icons = { Website: Globe, Facebook: FacebookIcon, YouTube: YouTubeIcon } as const

export const Route = createFileRoute("/writers")({
  head: () => indexSeo(page, []),
  component: Writers,
})

function Writers() {
  return (
    <PageLayout
      crumb={page.title}
      title="Writers and sources"
      description={page.description}
      media={<IconTile icon={page.icon} />}
      width="reading"
    >
      <p lang="bn" className="mb-8 text-muted-foreground">
        যাদের থেকে লেখা গুলো নেওয়া হয়েছে তাদের সম্পর্কে কিছু তথ্য:
      </p>
      <div className="space-y-6">
        {writers.map((writer) => {
          const articles = postPages.filter((p) => p.post.writer === writer.id)
          return (
            <section
              key={writer.id}
              id={writer.id}
              aria-labelledby={`${writer.id}-name`}
              className="scroll-mt-24 rounded-2xl bg-card p-6 ring-1 ring-foreground/10"
            >
              <h2 id={`${writer.id}-name`} lang="bn" className="text-xl font-semibold text-gold">
                {writer.name}
              </h2>
              <div lang={writer.lang} className="mt-3 space-y-3 text-pretty">
                {writer.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <ul className="mt-4 flex flex-wrap gap-2">
                {writer.links.map((link) => {
                  const Icon = icons[link.label]
                  return (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-foreground/15 transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <Icon className="size-4" />
                        {link.label}
                      </a>
                    </li>
                  )
                })}
              </ul>
              {articles.length > 0 ? (
                <div className="mt-5 border-t border-border/60 pt-4">
                  <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                    Articles on ILMIYAH
                  </h3>
                  <ul lang="bn" className="space-y-1">
                    {articles.map((p) => (
                      <li key={p.path}>
                        <Link
                          {...p.link}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {p.post.shortTitle}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          )
        })}
      </div>
    </PageLayout>
  )
}
