import { execFileSync } from "node:child_process"
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { ogImagePath, type Page, pageSlug, pages } from "./src/lib/pages.ts"
import { site } from "./src/lib/site.ts"

/** Last commit date of every tracked file, read from one `git log` pass. */
function commitDates(): Map<string, string> {
  const dates = new Map<string, string>()
  try {
    const log = execFileSync("git", ["log", "--format=@%cI", "--name-only"], {
      maxBuffer: 64 * 1024 * 1024,
    }).toString()
    let date = ""
    for (const line of log.split("\n")) {
      if (line.startsWith("@")) date = line.slice(1).trim()
      else if (line.trim() && !dates.has(line.trim())) dates.set(line.trim(), date)
    }
  } catch {
    // No git (or no history) in this environment: lastmod is omitted rather than guessed.
  }
  return dates
}

const dates = commitDates()

/** Date of the most recent commit touching any of the files, for sitemap `<lastmod>`. */
const lastModified = (...files: string[]) =>
  files
    .map((file) => dates.get(file))
    .filter((d): d is string => Boolean(d))
    .sort()
    .at(-1)

const image = (slug: string) => [{ loc: new URL(ogImagePath(slug), site.url).toString() }]

/** Source files whose changes change a page's content. */
function sourcesOf(page: Page): string[] {
  switch (page.kind) {
    case "surah":
      return [
        "src/routes/surah.$number.tsx",
        `src/data/quran/${String(page.surah.number).padStart(3, "0")}.json`,
      ]
    case "post":
      return ["src/routes/blog.$slug.tsx", `src/content/posts/${page.post.slug}.ts`]
    case "dua":
      return [
        "src/routes/duas.$slug.tsx",
        "src/content/duas.ts",
        `src/data/quran/${String(page.surah.number).padStart(3, "0")}.json`,
      ]
    default:
      return [`src/routes${page.path}.tsx`, `src/routes${page.path}.index.tsx`]
  }
}

const priority = (page: Page) =>
  page.kind === "app" || page.kind === "index"
    ? 0.8
    : page.kind === "surah" || page.kind === "dua"
      ? 0.7
      : 0.6

/** Every page to prerender, with its sitemap metadata. */
const prerenderPages = [
  {
    path: "/",
    sitemap: {
      priority: 1,
      changefreq: "weekly" as const,
      lastmod: lastModified("src/routes/index.tsx", "src/lib/pages.ts", "src/content/posts.ts"),
      images: image("home"),
    },
  },
  ...pages.map((page) => ({
    path: page.path,
    sitemap: {
      priority: priority(page),
      changefreq: "monthly" as const,
      lastmod: lastModified(...sourcesOf(page), "src/lib/pages.ts"),
      images: image(pageSlug(page)),
    },
  })),
  // Personal reading history: prerendered so it loads with a 200, but kept out of the sitemap
  // (the page itself is noindex).
  { path: "/history", sitemap: { exclude: true } },
]

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    // Dev-only TanStack devtools; stripped from production builds.
    devtools(),
    tailwindcss(),
    tanstackStart({
      // Every route is static, so prerender all of them to HTML. Link crawling is off
      // because it would also pick up in-page anchors such as "/surah/2#ayah-255".
      prerender: {
        enabled: true,
        crawlLinks: false,
        failOnError: true,
        // Write /surah/2.html rather than /surah/2/index.html. Netlify serves the former at
        // /surah/2 directly; the latter would 301 to /surah/2/, away from the canonical URL.
        autoSubfolderIndex: false,
        // Only prerender the registry's pages. Discovery would add index routes with a
        // trailing slash ("/surah/", "/blog/"): duplicate, non-canonical URLs in the sitemap.
        autoStaticPathsDiscovery: false,
      },
      pages: prerenderPages,
      // Client-rendered shell (/_shell.html) that Netlify serves for unknown URLs; the
      // router then renders the catch-all route (src/routes/$.tsx) for whatever URL it is.
      // maskPath must not be "/" (the default): pages are keyed by path, so the shell
      // would claim "/" and the real home page would never be prerendered.
      spa: {
        enabled: true,
        maskPath: "/404",
      },
      sitemap: {
        enabled: true,
        host: site.url,
      },
    }),
    viteReact(),
  ],
})
