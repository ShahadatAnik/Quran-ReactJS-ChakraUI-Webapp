/**
 * Reads the articles, written in Markdown, into the data the site renders. Runs at build time
 * only, through the articles plugins in scripts/plugins (Vite for the site, Bun for tests and
 * scripts); visitors get the result, never this code or the Markdown.
 *
 * An article is src/content/posts/<slug>.md: front matter between --- lines, then the text.
 *
 *   ---
 *   title: "দরুদ সমাধানের বারুদ: দরুদ প্রেরণের ৭টি বিশেষ বাক্য"
 *   shortTitle: "দরুদ প্রেরণের ৭টি বিশেষ বাক্য"
 *   summary: "One or two sentences for cards."
 *   seoTitle: "At most 45 characters"
 *   metaDescription: "140 to 160 characters."
 *   date: "2022-12-11"
 *   writer: "nusus"                    (an id from src/content/writers.ts)
 *   series:                           (optional)
 *     name: "দরুদ সমাধানের বারুদ"
 *     part: 4
 *   keywords: ["durood", "salawat"]   (English search terms for the command menu)
 *   ---
 *
 * The text, blocks separated by a blank line:
 *
 *   ## A heading                      (## only)
 *
 *   A paragraph, with **bold** words. Lines of one paragraph are joined with a space.
 *
 *   - A list item, **bold** allowed
 *   - Another item
 *
 *   > [!hadith] ইমাম বুখারি, আস-সহিহ: ৩৩৭০     (the source after the type is optional)
 *   >
 *   > اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ               (a paragraph in Arabic script: shown as Arabic)
 *   >
 *   > “হে আল্লাহ! …”                    (a Bangla paragraph: the translation)
 *
 * The quote types are [!ayah] (its source is shown after "সূরা"), [!hadith], and [!quote] for
 * anything else, such as an encyclopedia. A paragraph in the Latin alphabet is the quotation in
 * English, shown above the translation. A quote has at most one paragraph of each language.
 *
 * Anything else, such as # or ### headings, numbered lists or a quote without a type, is an
 * error with the file and line, rather than text that renders wrongly. Only
 * **bold** is recognised inside text; every other character is shown as written.
 */
import { readdir } from "node:fs/promises"
import { join } from "node:path"
import type { Post } from "@/content/posts"
import type { Block, Inline, QuoteBlock } from "@/content/types"
import { writers } from "@/content/writers"
import { META_DESCRIPTION_RANGE, SEO_TITLE_MAX } from "@/lib/seo-limits"

export class PostSyntaxError extends Error {
  override name = "PostSyntaxError"
}

const fail = (file: string, line: number, message: string): never => {
  throw new PostSyntaxError(`${file}:${line}: ${message}`)
}

// ---------- front matter ----------

const FIELDS = [
  "title",
  "shortTitle",
  "summary",
  "seoTitle",
  "metaDescription",
  "date",
  "writer",
  "series",
  "keywords",
] as const

function parseFrontMatter(yaml: string, slug: string, file: string): Post {
  let data: unknown
  try {
    data = Bun.YAML.parse(yaml)
  } catch (error) {
    return fail(file, 2, `the front matter isn't valid YAML: ${(error as Error).message}`)
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return fail(file, 2, "the front matter must be a list of fields such as title: …")
  }
  const v = data as Record<string, unknown>
  for (const key of Object.keys(v)) {
    if (!(FIELDS as readonly string[]).includes(key)) {
      fail(file, 2, `unknown field "${key}"; the fields are ${FIELDS.join(", ")}`)
    }
  }
  const text = (key: (typeof FIELDS)[number]): string => {
    const value = v[key]
    if (typeof value !== "string" || !value.trim()) fail(file, 2, `"${key}" must be some text`)
    return (value as string).trim()
  }

  const post: Post = {
    slug,
    title: text("title"),
    shortTitle: text("shortTitle"),
    summary: text("summary"),
    seoTitle: text("seoTitle"),
    metaDescription: text("metaDescription"),
    date: text("date"),
    writer: text("writer") as Post["writer"],
    keywords: [],
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(Date.parse(post.date))) {
    fail(file, 2, `"date" must be a date written as "yyyy-mm-dd", not "${post.date}"`)
  }
  if (!writers.some((w) => w.id === post.writer)) {
    fail(
      file,
      2,
      `unknown writer "${post.writer}"; add it to src/content/writers.ts or use one of ${writers.map((w) => w.id).join(", ")}`
    )
  }
  if (post.seoTitle.length > SEO_TITLE_MAX) {
    fail(file, 2, `"seoTitle" is ${post.seoTitle.length} characters; at most ${SEO_TITLE_MAX}`)
  }
  const [min, max] = META_DESCRIPTION_RANGE
  if (post.metaDescription.length < min || post.metaDescription.length > max) {
    fail(
      file,
      2,
      `"metaDescription" is ${post.metaDescription.length} characters; it must be ${min} to ${max}`
    )
  }

  const keywords = v.keywords
  if (
    !Array.isArray(keywords) ||
    !keywords.every((k): k is string => typeof k === "string" && k.trim() !== "")
  ) {
    fail(file, 2, `"keywords" must be a list of words, such as ["durood", "salawat"]`)
  }
  const series = v.series
  let parsedSeries: Post["series"]
  if (series !== undefined) {
    const s = series as Record<string, unknown> | null
    const valid =
      typeof s === "object" &&
      s !== null &&
      Object.keys(s).every((k) => k === "name" || k === "part") &&
      typeof s.name === "string" &&
      s.name.trim() !== "" &&
      Number.isInteger(s.part) &&
      (s.part as number) > 0
    if (!valid) fail(file, 2, `"series" must have a "name" and a whole-number "part"`)
    const { name, part } = s as { name: string; part: number }
    parsedSeries = { name: name.trim(), part }
  }
  // Same key order as the type, so the article's details read naturally.
  const { keywords: _empty, ...fields } = post
  return {
    ...fields,
    ...(parsedSeries ? { series: parsedSeries } : {}),
    keywords: (keywords as string[]).map((k) => k.trim()),
  }
}

// ---------- text ----------

/** "a **b** c" → ["a ", { strong: "b" }, " c"]. */
function parseInline(text: string, file: string, line: number): Inline[] {
  const parts = text.split("**")
  if (parts.length % 2 === 0) fail(file, line, "a **bold** run is not closed with **")
  const out: Inline[] = []
  parts.forEach((part, index) => {
    if (index % 2 === 0) {
      if (part) out.push(part)
    } else if (!part.trim()) {
      fail(file, line, "an empty **bold** run")
    } else {
      out.push({ strong: part })
    }
  })
  return out
}

/** Which part of a quote a paragraph is, from the alphabet most of its letters are in. */
function quoteField(text: string): "arabic" | "english" | "text" {
  const letters = text.match(/\p{L}/gu)?.length ?? 0
  const share = (script: RegExp) => (letters ? (text.match(script)?.length ?? 0) / letters : 0)
  if (share(/\p{Script=Arabic}/gu) > 0.5) return "arabic"
  if (share(/\p{Script=Latin}/gu) > 0.5) return "english"
  return "text"
}

const FIELD_NAMES = { arabic: "Arabic", english: "English", text: "translation" } as const

const QUOTE_START = /^> \[!(hadith|ayah|quote)\](?: +(.*))?$/

function parseQuote(lines: { text: string; n: number }[], file: string): QuoteBlock {
  const [first, ...rest] = lines
  const start = first ? QUOTE_START.exec(first.text) : null
  if (!first || !start) {
    return fail(
      file,
      first?.n ?? 0,
      "a quote starts with > [!ayah], > [!hadith] or > [!quote], followed by its source"
    )
  }
  const block: QuoteBlock = { type: "quote", kind: start[1] as QuoteBlock["kind"] }
  const reference = start[2]?.trim()

  // Paragraphs of the quote, separated by a line with only ">".
  const paragraphs: { text: string; n: number }[] = []
  let current: { text: string; n: number } | null = null
  for (const { text, n } of rest) {
    if (!text.startsWith(">")) fail(file, n, "every line of a quote starts with >")
    const content = text.replace(/^> ?/, "").trim()
    if (!content) {
      current = null
    } else if (current) {
      current.text += ` ${content}`
    } else {
      current = { text: content, n }
      paragraphs.push(current)
    }
  }
  for (const paragraph of paragraphs) {
    const field = quoteField(paragraph.text)
    if (block[field]) {
      fail(file, paragraph.n, `a quote has one ${FIELD_NAMES[field]} paragraph; this is a second`)
    }
    block[field] = paragraph.text
  }
  if (!block.arabic && !block.english && !block.text) {
    fail(file, first.n, "this quote has no text")
  }
  if (reference) block.reference = reference
  return block
}

function parseBody(body: string, file: string, firstLine: number): Block[] {
  const lines = body.split("\n")
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    if (!lines[i]?.trim()) {
      i++
      continue
    }
    // One block: the lines up to the next blank line.
    const chunk: { text: string; n: number }[] = []
    while (i < lines.length && lines[i]?.trim()) {
      chunk.push({ text: (lines[i] as string).trimEnd(), n: firstLine + i })
      i++
    }
    const head = chunk[0] as { text: string; n: number }

    if (head.text.startsWith("#")) {
      const heading = /^## (.+)$/.exec(head.text)?.[1]
      if (!heading) {
        return fail(file, head.n, "headings are written as ## Heading (two #, then a space)")
      }
      if (chunk.length > 1) {
        fail(file, head.n + 1, "a heading is one line; leave a blank line after it")
      }
      blocks.push({ type: "heading", text: heading.trim() })
    } else if (head.text.startsWith(">")) {
      blocks.push(parseQuote(chunk, file))
    } else if (/^[-*+] /.test(head.text)) {
      const items = chunk.map(({ text, n }) => {
        if (!text.startsWith("- ")) fail(file, n, "every line of a list starts with - ")
        return parseInline(text.slice(2).trim(), file, n)
      })
      blocks.push({ type: "list", items })
    } else {
      for (const { text, n } of chunk) {
        if (/^(\d+[.)]|[-*+>]) /.test(text) || text.startsWith("#")) {
          fail(file, n, "leave a blank line before a heading, list or quote")
        }
      }
      const text = chunk.map((l) => l.text.trim()).join(" ")
      blocks.push({ type: "paragraph", content: parseInline(text, file, head.n) })
    }
  }
  return blocks
}

// ---------- articles ----------

export interface ParsedPost {
  post: Post
  blocks: Block[]
}

/** One article from its Markdown source; `slug` is its file name without ".md". */
export function parsePost(source: string, slug: string, file = `${slug}.md`): ParsedPost {
  const text = source.replace(/^﻿/, "").replace(/\r\n?/g, "\n")
  if (!text.startsWith("---\n")) {
    fail(file, 1, "an article starts with its front matter between two --- lines")
  }
  const end = text.indexOf("\n---\n", 3)
  if (end === -1) fail(file, 1, "the front matter is not closed with a --- line")
  const post = parseFrontMatter(text.slice(4, end + 1), slug, file)
  const bodyStartLine = text.slice(0, end + 5).split("\n").length
  const blocks = parseBody(text.slice(end + 5), file, bodyStartLine)
  if (blocks.length === 0) fail(file, bodyStartLine, "the article has no text")
  return { post, blocks }
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const POSTS_DIR = join(import.meta.dir, "..", "content", "posts")

/** Every article in a folder of Markdown files, newest first. */
export async function readPosts(dir = POSTS_DIR): Promise<ParsedPost[]> {
  const files = (await readdir(dir)).filter((name) => name.endsWith(".md")).sort()
  const parsed = await Promise.all(
    files.map(async (name) => {
      const slug = name.slice(0, -3)
      const file = `src/content/posts/${name}`
      if (!SLUG.test(slug)) {
        fail(file, 1, "file names are lowercase words joined by hyphens, such as my-article.md")
      }
      return parsePost(await Bun.file(join(dir, name)).text(), slug, file)
    })
  )
  // Newest first; articles from the same day by slug, so the order never depends on the disk.
  return parsed.sort(
    (a, b) => b.post.date.localeCompare(a.post.date) || a.post.slug.localeCompare(b.post.slug)
  )
}

// ---------- modules for the build tools ----------

/** Article files: src/content/posts/<slug>.md. */
export const POST_FILE = /[\\/]content[\\/]posts[\\/]([a-z0-9-]+)\.md$/

/** `virtual:posts`: every article's details, newest first. */
export const postsModule = async () =>
  `export default ${JSON.stringify((await readPosts()).map((p) => p.post))}`

/** An article's .md file as a module whose default export is its text, as blocks. */
export function postBodyModule(source: string, path: string): string {
  const slug = POST_FILE.exec(path)?.[1] ?? ""
  return `export default ${JSON.stringify(parsePost(source, slug, `src/content/posts/${slug}.md`).blocks)}`
}
