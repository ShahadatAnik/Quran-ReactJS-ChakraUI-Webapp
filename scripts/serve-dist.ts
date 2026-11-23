/**
 * Serves dist/client the way Netlify does, for checking a production build locally:
 *   1. the 301 redirects from netlify.toml
 *   2. the exact file, then <path>.html, then <path>/index.html
 *   3. otherwise /_shell.html with status 404
 *
 * Usage: bun scripts/serve-dist.ts [port]   (default 4173)
 */
import { join, normalize } from "node:path"

const root = join(import.meta.dir, "..", "dist", "client")
const port = Number(process.argv[2] ?? 4173)

/** `[[redirects]]` blocks with status 301 from netlify.toml. */
async function readRedirects(): Promise<Map<string, string>> {
  const toml = await Bun.file(join(import.meta.dir, "..", "netlify.toml")).text()
  const redirects = new Map<string, string>()
  for (const block of toml.split("[[redirects]]").slice(1)) {
    const from = /from\s*=\s*"([^"]+)"/.exec(block)?.[1]
    const to = /to\s*=\s*"([^"]+)"/.exec(block)?.[1]
    const status = /status\s*=\s*(\d+)/.exec(block)?.[1]
    if (from && to && status === "301" && !from.includes("*")) redirects.set(from, to)
  }
  return redirects
}

const redirects = await readRedirects()

async function file(path: string) {
  // Stay inside dist/client whatever the request path is.
  const resolved = normalize(join(root, path))
  if (!resolved.startsWith(root)) return undefined
  const candidate = Bun.file(resolved)
  return (await candidate.exists()) && !resolved.endsWith("\\") ? candidate : undefined
}

const server = Bun.serve({
  port,
  async fetch(request) {
    const { pathname, search } = new URL(request.url)
    const target = redirects.get(pathname)
    if (target) return Response.redirect(`${target}${search}`, 301)

    const decoded = decodeURIComponent(pathname)
    const candidates =
      decoded === "/"
        ? ["/index.html"]
        : [decoded, `${decoded.replace(/\/$/, "")}.html`, join(decoded, "index.html")]
    for (const candidate of candidates) {
      const found = await file(candidate).catch(() => undefined)
      if (found && (await found.stat()).isFile()) return new Response(found)
    }
    const shell = await file("/_shell.html")
    return new Response(shell ?? "Not found", {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    })
  },
})

console.log(`Serving dist/client like Netlify at ${server.url}`)
