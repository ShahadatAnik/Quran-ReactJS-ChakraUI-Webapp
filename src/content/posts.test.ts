import { describe, expect, test } from "bun:test"
import { getPost, posts, seriesPosts } from "@/content/posts"
import type { Block } from "@/content/types"
import { writers } from "@/content/writers"
import { formatBanglaDate } from "@/lib/bangla"

const bodyOf = async (slug: string) =>
  ((await import(`@/content/posts/${slug}.ts`)) as { blocks: Block[] }).blocks

describe("articles", () => {
  test("slugs are unique and URL-safe", () => {
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length)
    for (const post of posts) expect(post.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  test("are listed newest first with valid dates", () => {
    const dates = posts.map((p) => p.date)
    expect([...dates].sort().reverse()).toEqual(dates)
    for (const date of dates) expect(() => formatBanglaDate(date)).not.toThrow()
  })

  test("every writer exists", () => {
    const ids = new Set(writers.map((w) => w.id))
    for (const post of posts) expect(ids.has(post.writer)).toBe(true)
  })

  test.each(posts.map((p) => [p.slug]))("%s has a body with text in every block", async (slug) => {
    const blocks = await bodyOf(slug)
    expect(blocks.length).toBeGreaterThan(5)
    for (const block of blocks) {
      if (block.type === "quote") expect(Boolean(block.text || block.arabic)).toBe(true)
      if (block.type === "paragraph") expect(block.content.length).toBeGreaterThan(0)
      if (block.type === "list") expect(block.items.every((item) => item.length > 0)).toBe(true)
    }
  })

  test("the durood series has parts 1 to 5 in order", () => {
    const post = getPost("dua-for-prophet-part-3")
    if (!post) throw new Error("missing")
    expect(seriesPosts(post).map((p) => p.series?.part)).toEqual([1, 2, 3, 4, 5])
  })
})
