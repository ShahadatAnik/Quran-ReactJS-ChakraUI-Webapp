/**
 * End-to-end check of a production build, driven through the system Chrome.
 *
 *   bun run build && bun scripts/verify-site.ts [--screenshots <dir>]
 *
 * Starts scripts/serve-dist.ts and checks, for the home page and every registry page (four at
 * a time per mode, light and dark side by side, each as soon as the app has hydrated):
 *   - HTTP 200, exactly one <h1>, the canonical URL, a loading OG image, valid JSON-LD
 *   - no console errors or hydration warnings, in light (desktop) and dark (mobile) mode
 *   - no horizontal overflow at 360px wide
 * plus the 404 page, the old-URL redirects, and page transitions on client navigation.
 */
import { join } from "node:path"
import {
  type Browser,
  type ConsoleMessage,
  chromium,
  type Page,
  type Request,
  type Response,
} from "playwright-core"
import { ogImagePath, pageSlug, pages } from "../src/lib/pages"
import { site } from "../src/lib/site"

const PORT = 4173
const origin = `http://localhost:${PORT}`
const screenshotsIndex = process.argv.indexOf("--screenshots")
const screenshots = screenshotsIndex === -1 ? undefined : process.argv[screenshotsIndex + 1]

const chromePaths = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter((p): p is string => Boolean(p))

const failures: string[] = []
const fail = (message: string) => {
  failures.push(message)
  console.log(`  ✗ ${message}`)
}

const server = Bun.spawn(["bun", join(import.meta.dir, "serve-dist.ts"), String(PORT)], {
  stdout: "ignore",
  stderr: "inherit",
})
await Bun.sleep(600)

let chromePath: string | undefined
for (const p of chromePaths) if (await Bun.file(p).exists()) chromePath = p
const browser: Browser = await chromium.launch({ executablePath: chromePath, headless: true })

/** Pages checked at the same time in each mode (light and dark also run side by side). */
const CONCURRENCY = 4

/**
 * Collects console errors, page errors and hydration warnings on a page, until `stop()`
 * removes the listeners again (pages are reused for many paths).
 */
function watchConsole(page: Page) {
  const problems: string[] = []
  // Only this site's own files count: third-party requests (the Quran API, or scripts that
  // browser extensions and local ad blockers inject) can fail for reasons outside the build.
  const ownFile = (url: string) => url.startsWith(origin)
  const onConsole = (message: ConsoleMessage) => {
    const text = message.text()
    // Failed requests are reported below with their URL (the 404 page's own document
    // legitimately answers 404, which Chrome also logs as a console error).
    if (text.startsWith("Failed to load resource")) return
    if (message.type() === "error" || /hydrat/i.test(text)) problems.push(`console: ${text}`)
  }
  const onResponse = (response: Response) => {
    const isDocument = response.request().resourceType() === "document"
    if (response.status() >= 400 && !isDocument && ownFile(response.url())) {
      problems.push(`HTTP ${response.status()}: ${response.url()}`)
    }
  }
  const onRequestFailed = (request: Request) => {
    // Moving on to the next page cancels requests still in flight (the favicon, an audio
    // prefetch): that is ERR_ABORTED, not a broken file. Missing files answer 404 above.
    const error = request.failure()?.errorText ?? ""
    if (error === "net::ERR_ABORTED" || request.resourceType() === "media") return
    if (ownFile(request.url())) problems.push(`request failed: ${request.url()} (${error})`)
  }
  const onPageError = (error: Error) => problems.push(`pageerror: ${error.message}`)
  page.on("console", onConsole)
  page.on("response", onResponse)
  page.on("requestfailed", onRequestFailed)
  page.on("pageerror", onPageError)
  const stop = () => {
    page.off("console", onConsole)
    page.off("response", onResponse)
    page.off("requestfailed", onRequestFailed)
    page.off("pageerror", onPageError)
  }
  return { problems, stop }
}

/**
 * Waits until the app has hydrated (it marks <html data-hydrated>), then two more frames so
 * effects that run on mount have settled. Much quicker than waiting for the network to idle.
 */
async function hydrated(page: Page) {
  await page.waitForFunction(() => "hydrated" in document.documentElement.dataset)
  await page.evaluate(
    () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)))
  )
}

const allPaths = ["/", ...pages.map((p) => p.path)]
const ogPath = (path: string) =>
  path === "/" ? ogImagePath("home") : ogImagePath(pageSlug({ path }))

async function checkPage(page: Page, path: string, mode: "light" | "dark") {
  const { problems, stop } = watchConsole(page)
  const response = await page.goto(`${origin}${path}`, { waitUntil: "load" })
  if (response?.status() !== 200) fail(`${path}: status ${response?.status()}`)
  await hydrated(page)

  const result = await page.evaluate(() => ({
    h1: document.querySelectorAll("h1").length,
    canonical: document.querySelector<HTMLLinkElement>("link[rel=canonical]")?.href,
    ogImage: document.querySelector<HTMLMetaElement>("meta[property='og:image']")?.content,
    robots: document.querySelector<HTMLMetaElement>("meta[name=robots]")?.content,
    jsonLd: [...document.querySelectorAll("script[type='application/ld+json']")].map(
      (s) => s.textContent ?? ""
    ),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    dark: document.documentElement.classList.contains("dark"),
  }))

  const canonical = new URL(path, site.url).toString()
  if (result.h1 !== 1) fail(`${path}: ${result.h1} <h1> elements`)
  if (result.canonical !== canonical) fail(`${path}: canonical ${result.canonical}`)
  if (result.ogImage !== new URL(ogPath(path), site.url).toString()) {
    fail(`${path}: og:image ${result.ogImage}`)
  }
  if (!result.robots?.startsWith("index, follow, max-image-preview:large")) {
    fail(`${path}: robots ${result.robots}`)
  }
  if (result.jsonLd.length !== 1) fail(`${path}: ${result.jsonLd.length} JSON-LD scripts`)
  for (const json of result.jsonLd) {
    try {
      const graph = JSON.parse(json)["@graph"]
      if (!Array.isArray(graph) || graph.length === 0) fail(`${path}: empty JSON-LD @graph`)
    } catch {
      fail(`${path}: invalid JSON-LD`)
    }
  }
  if (result.overflow > 0) fail(`${path} (${mode}): ${result.overflow}px horizontal overflow`)
  if (result.dark !== (mode === "dark")) fail(`${path}: expected ${mode} theme`)
  stop()
  for (const problem of problems) fail(`${path} (${mode}): ${problem}`)
}

// ---------- every page, light desktop and dark mobile ----------

console.log(`\nLight 1280px and dark 360px: ${allPaths.length} pages each`)
await Promise.all(
  (["light", "dark"] as const).map(async (mode) => {
    const context = await browser.newContext(
      mode === "light"
        ? { colorScheme: "light", viewport: { width: 1280, height: 900 } }
        : { colorScheme: "dark", viewport: { width: 360, height: 780 }, isMobile: true }
    )
    const queue = [...allPaths]
    await Promise.all(
      Array.from({ length: CONCURRENCY }, async () => {
        const page = await context.newPage()
        for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
          await checkPage(page, path, mode)
        }
      })
    )
    await context.close()
  })
)

// ---------- OG images ----------

console.log("\nOpen Graph images")
await Promise.all(
  allPaths.map(async (path) => {
    const response = await fetch(`${origin}${ogPath(path)}`)
    if (response.status !== 200 || response.headers.get("content-type") !== "image/png") {
      fail(`${ogPath(path)}: ${response.status} ${response.headers.get("content-type")}`)
    }
  })
)

{
  const manifest = await fetch(`${origin}/site.webmanifest`)
  const type = manifest.headers.get("content-type") ?? ""
  if (manifest.status !== 200 || !type.startsWith("application/manifest+json")) {
    fail(`/site.webmanifest: ${manifest.status} ${type}`)
  }
}

// The personal history page: prerendered, but noindex and kept out of the sitemap.
console.log("\nReading history page")
{
  const context = await browser.newContext()
  const page = await context.newPage()
  const { problems } = watchConsole(page)
  const response = await page.goto(`${origin}/history`, { waitUntil: "load" })
  await hydrated(page)
  if (response?.status() !== 200) fail(`/history: status ${response?.status()}`)
  const robots = await page.locator("meta[name=robots]").getAttribute("content")
  if (robots !== "noindex, follow") fail(`/history: robots ${robots}`)
  if ((await page.locator("meta[name=robots]").count()) !== 1)
    fail("/history: several robots metas")
  if ((await page.locator("h1").count()) !== 1) fail("/history: no single <h1>")
  for (const problem of problems) fail(`/history: ${problem}`)
  const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text()
  if (sitemap.includes("/history")) fail("/history is listed in the sitemap")
  await context.close()
}

// ---------- 404 and redirects ----------

console.log("\n404 page and old URLs")
{
  const context = await browser.newContext()
  const page = await context.newPage()
  const { problems } = watchConsole(page)
  const response = await page.goto(`${origin}/this-page-does-not-exist`, {
    waitUntil: "networkidle",
  })
  if (response?.status() !== 404) fail(`404 page: status ${response?.status()}`)
  const robots = await page.locator("meta[name=robots]").getAttribute("content")
  if (robots !== "noindex") fail(`404 page: robots ${robots}`)
  if ((await page.locator("h1").count()) !== 1) fail("404 page: no single <h1>")
  for (const problem of problems) fail(`404 page: ${problem}`)

  const invalidSurah = await page.goto(`${origin}/surah/115`, { waitUntil: "networkidle" })
  if (invalidSurah?.status() !== 404) fail(`/surah/115: status ${invalidSurah?.status()}`)
  await context.close()
}
for (const [from, to] of [
  ["/find-word", "/search"],
  ["/about-writers", "/writers"],
  ["/dua-for-prophet-part-1", "/blog/dua-for-prophet-part-1"],
]) {
  const response = await fetch(`${origin}${from}`, { redirect: "manual" })
  if (response.status !== 301 || response.headers.get("location") !== to) {
    fail(`${from}: ${response.status} → ${response.headers.get("location")}`)
  }
}

// ---------- client navigation: view transitions, title, canonical ----------

console.log("\nClient navigation")
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  const { problems } = watchConsole(page)
  await page.goto(`${origin}/`, { waitUntil: "networkidle" })
  await page.evaluate(() => {
    const w = window as unknown as { transitions: number }
    w.transitions = 0
    const original = document.startViewTransition?.bind(document)
    if (original) {
      document.startViewTransition = ((arg: unknown) => {
        w.transitions += 1
        return original(arg as never)
      }) as typeof document.startViewTransition
    }
  })
  const steps: [link: string, path: string][] = [
    ["header nav >> text=Surahs", "/surah"],
    ["main >> text=Al-Kahf", "/surah/18"],
    ["header nav >> text=Articles", "/blog"],
  ]
  for (const [index, [selector, path]] of steps.entries()) {
    await page.locator(selector).first().click()
    await page.waitForURL(`${origin}${path}`)
    await page.waitForFunction(
      (expected) =>
        document.querySelector<HTMLLinkElement>("link[rel=canonical]")?.href === expected,
      new URL(path, site.url).toString()
    )
    const state = await page.evaluate(() => ({
      transitions: (window as unknown as { transitions: number }).transitions,
      title: document.title,
    }))
    if (state.transitions !== index + 1) {
      fail(`navigation to ${path}: ${state.transitions} view transitions after ${index + 1} clicks`)
    }
    const expectedTitle = pages.find((p) => p.path === path)?.seoTitle
    if (expectedTitle && !state.title.startsWith(expectedTitle)) {
      fail(`navigation to ${path}: title "${state.title}"`)
    }
  }
  // A hash link on the same page must not start a transition.
  const before = await page.evaluate(
    () => (window as unknown as { transitions: number }).transitions
  )
  await page.goto(`${origin}/surah/2`, { waitUntil: "networkidle" })
  await page.evaluate(() => {
    const w = window as unknown as { transitions: number }
    w.transitions = 0
  })
  await page.locator("a[href='#ayah-255']").click()
  await page.waitForFunction(() => location.hash === "#ayah-255")
  const afterHash = await page.evaluate(
    () => (window as unknown as { transitions: number }).transitions
  )
  if (afterHash !== 0) fail(`hash link started ${afterHash} view transitions (before: ${before})`)
  for (const problem of problems) fail(`navigation: ${problem}`)
  await context.close()
}

// ---------- screenshots ----------

if (screenshots) {
  console.log(`\nScreenshots in ${screenshots}`)
  const shots: [name: string, path: string, mode: "light" | "dark", width: number][] = [
    ["home-light", "/", "light", 1280],
    ["home-dark", "/", "dark", 1280],
    ["surah-dark", "/surah/36", "dark", 1280],
    ["surah-light-mobile", "/surah/1", "light", 360],
    ["surahs-light", "/surah", "light", 1280],
    ["article-light", "/blog/dua-for-prophet-part-4", "light", 1280],
    ["article-dark-mobile", "/blog/islam-on-women-rights-and-dignity", "dark", 360],
    ["ayah-dark", "/ayah", "dark", 1280],
    ["search-light", "/search", "light", 1280],
    ["writers-dark", "/writers", "dark", 1280],
    ["home-dark-mobile", "/", "dark", 360],
    ["404-light", "/nope", "light", 1280],
  ]
  for (const [name, path, mode, width] of shots) {
    const context = await browser.newContext({
      colorScheme: mode,
      viewport: { width, height: width < 600 ? 780 : 900 },
      deviceScaleFactor: 1,
    })
    const page = await context.newPage()
    await page.goto(`${origin}${path}`, { waitUntil: "networkidle" })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: join(screenshots, `${name}.png`) })
    await context.close()
  }
}

await browser.close()
server.kill()

console.log(
  failures.length === 0
    ? `\n✓ All checks passed (${allPaths.length} pages × 2 modes)`
    : `\n${failures.length} problems`
)
process.exit(failures.length === 0 ? 0 : 1)
