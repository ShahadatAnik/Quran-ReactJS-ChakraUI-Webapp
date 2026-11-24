import postsData from "virtual:posts"
import type { WriterId } from "@/content/writers"

export interface Post {
  slug: string
  /** Full article title (the page h1). */
  title: string
  /** Shorter title for cards and lists. */
  shortTitle: string
  /** One or two sentences for cards. */
  summary: string
  /** Search-friendly title without the site name (45 characters or fewer). */
  seoTitle: string
  /** Meta description, 140–160 characters. */
  metaDescription: string
  /** Publication date, ISO yyyy-mm-dd. */
  date: string
  writer: WriterId
  /** Multi-part series this post belongs to. */
  series?: { name: string; part: number }
  /** Extra search terms (English) for the command menu. */
  keywords: readonly string[]
}

/**
 * Every article, newest first, read from its Markdown file, src/content/posts/<slug>.md (see
 * src/lib/post-markdown.ts for the format). The articles plugins in scripts/plugins read the
 * files when the site is built or a test runs, so there is nothing to generate.
 */
export const posts: readonly Post[] = postsData

export const getPost = (slug: string): Post | undefined => posts.find((p) => p.slug === slug)

export const postPath = (slug: string) => `/blog/${slug}` as const

/** Other parts of the same series, in order. */
export const seriesPosts = (post: Post): Post[] =>
  post.series
    ? posts
        .filter((p) => p.series?.name === post.series?.name)
        .sort((a, b) => (a.series?.part ?? 0) - (b.series?.part ?? 0))
    : []
