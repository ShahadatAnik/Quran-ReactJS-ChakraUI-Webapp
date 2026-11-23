/**
 * Build-time SEO assets, generated from the page registry so new pages get them for free:
 *   - public/og/<page>.png  1200×630 Open Graph / Twitter card image for every page
 *   - public/llms.txt       site summary for AI assistants and answer engines (llmstxt.org)
 *
 * Runs before `vite build` (see the "build" script). The output is git-ignored.
 *
 * Images are cached: each one is re-rendered only when its page data or the code and fonts
 * that draw it change (keys in node_modules/.cache/og-images.json, so they never ship).
 * Pass --force to render them all.
 * Bangla and Arabic are shaped with HarfBuzz (scripts/lib/shape-text.ts), since neither
 * satori nor resvg shapes them correctly.
 */
import { mkdir, readdir, rm } from "node:fs/promises"
import { join } from "node:path"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import satori, { type Font } from "satori"
import { LogoMark } from "../src/components/logo-mark"
import { getWriter } from "../src/content/writers"
import { formatBanglaDate, toBanglaDigits } from "../src/lib/bangla"
import {
  type AppPage,
  appPages,
  type IndexPage,
  ogImagePath,
  type PostPage,
  pageSlug,
  pages,
  postPages,
  type SurahPage,
  surahPages,
} from "../src/lib/pages"
import { OG_IMAGE_SIZE } from "../src/lib/seo"
import { site } from "../src/lib/site"
import { renderSvg, svgDataUri, svgToPng } from "./lib/render"
import { type FontStack, loadShapingFont, type ShapedText, shapeText, wrap } from "./lib/shape-text"

const root = join(import.meta.dir, "..")
const publicDir = join(root, "public")
const { width: W, height: H } = OG_IMAGE_SIZE

const colors = {
  background: "#07110d",
  foreground: "#f4f2ea",
  muted: "#9aa9a1",
  primary: "#56cb98",
  gold: "#f5cc58",
  emerald: site.brand.emerald,
}

// ---------- fonts ----------

const geist = (weight: 400 | 500 | 700) =>
  Bun.file(
    Bun.resolveSync(`@fontsource/geist/files/geist-latin-${weight}-normal.woff`, import.meta.dir)
  ).arrayBuffer()

const fonts: Font[] = [
  { name: "Geist", data: await geist(400), weight: 400, style: "normal" },
  { name: "Geist", data: await geist(500), weight: 500, style: "normal" },
  { name: "Geist", data: await geist(700), weight: 700, style: "normal" },
]

const hind = (weight: 400 | 600) =>
  Promise.all([
    loadShapingFont(`@fontsource/hind-siliguri/files/hind-siliguri-bengali-${weight}-normal.woff2`),
    loadShapingFont(`@fontsource/hind-siliguri/files/hind-siliguri-latin-${weight}-normal.woff2`),
  ]) as Promise<FontStack>

const banglaBold = await hind(600)
const bangla = await hind(400)
const arabic: FontStack = [
  await loadShapingFont("@fontsource/amiri-quran/files/amiri-quran-arabic-400-normal.woff2"),
]
const display: FontStack = [
  await loadShapingFont("@fontsource/galada/files/galada-bengali-400-normal.woff2"),
]

// ---------- shared pieces ----------

const logoUri = svgDataUri(renderSvg(<LogoMark />))
const iconUri = (Icon: LucideIcon, size: number) =>
  svgDataUri(renderToStaticMarkup(<Icon size={size} color={colors.primary} strokeWidth={1.75} />))

/** Shaped text as an <img> of its exact size. */
function Shaped({ text, style }: { text: ShapedText; style?: React.CSSProperties }) {
  return (
    <img
      src={svgDataUri(text.svg)}
      width={text.width}
      height={text.height}
      alt=""
      style={{ width: text.width, height: text.height, ...style }}
    />
  )
}

/** Faint lattice of eight-point stars in the corner, echoing the site's hero. */
const latticeUri = svgDataUri(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><pattern id="k" width="56" height="56" patternUnits="userSpaceOnUse"><g fill="none" stroke="${colors.gold}" stroke-width="1"><rect x="18" y="18" width="20" height="20"/><rect x="18" y="18" width="20" height="20" transform="rotate(45 28 28)"/></g></pattern><radialGradient id="f" cx="1" cy="0" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient><mask id="m"><rect width="${W}" height="${H}" fill="url(#f)"/></mask></defs><rect width="${W}" height="${H}" fill="url(#k)" mask="url(#m)"/></svg>`
)

const host = new URL(site.url).host

function Frame({ path, badge, children }: { path: string; badge: string; children: ReactNode }) {
  return (
    <div
      style={{
        width: W,
        height: H,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        // Satori sizes boxes as content-box by default; keep the canvas exactly 1200×630.
        boxSizing: "border-box",
        padding: "60px 80px 68px",
        fontFamily: "Geist",
        color: colors.foreground,
        backgroundColor: colors.background,
        backgroundImage:
          "radial-gradient(circle at 95% -10%, rgba(17,134,89,0.55), rgba(17,134,89,0) 55%), radial-gradient(circle at -5% 115%, rgba(245,204,88,0.14), rgba(245,204,88,0) 50%)",
      }}
    >
      <img
        src={latticeUri}
        width={W}
        height={H}
        alt=""
        style={{ position: "absolute", left: 0, top: 0, width: W, height: H }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <img src={logoUri} width={60} height={60} alt="" />
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, letterSpacing: 7 }}>
          ILMIYAH
        </div>
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}
      >
        {children}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 25,
          color: colors.muted,
        }}
      >
        <div style={{ display: "flex", fontWeight: 500 }}>
          {host}
          {path === "/" ? "" : path}
        </div>
        <div
          style={{
            display: "flex",
            padding: "10px 22px",
            borderRadius: 999,
            border: "1px solid rgba(245,204,88,0.4)",
            background: "rgba(245,204,88,0.1)",
            color: colors.gold,
            fontSize: 22,
            fontWeight: 500,
          }}
        >
          {badge}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          bottom: 0,
          width: W,
          height: 8,
          backgroundImage: `linear-gradient(90deg, ${colors.emerald}, ${colors.gold})`,
        }}
      />
    </div>
  )
}

const BADGE = "Arabic · Bangla · Audio"

// ---------- cards ----------

function HomeCard() {
  const brand = shapeText([site.nameBn], display, { size: 92, lineHeight: 120, color: colors.gold })
  return (
    <Frame path="/" badge={BADGE}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Shaped text={brand} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.08,
          }}
        >
          <span>Read the Quran in Arabic</span>
          <span style={{ color: colors.primary }}>and Bangla, with audio.</span>
        </div>
      </div>
    </Frame>
  )
}

function AppCard({ page }: { page: AppPage | IndexPage }) {
  return (
    <Frame path={page.path} badge={BADGE}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 84,
            height: 84,
            borderRadius: 22,
            border: "1px solid rgba(86,203,152,0.35)",
            background: "rgba(86,203,152,0.12)",
          }}
        >
          <img src={iconUri(page.icon, 46)} width={46} height={46} alt="" />
        </div>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.02 }}>
          {page.title}
        </div>
        <div style={{ fontSize: 31, lineHeight: 1.4, color: colors.muted, maxWidth: 1000 }}>
          {page.summary}
        </div>
      </div>
    </Frame>
  )
}

function SurahCard({ page }: { page: SurahPage }) {
  const { surah } = page
  const name = shapeText([surah.arabic], arabic, {
    size: 120,
    lineHeight: 210,
    color: colors.gold,
    align: "end",
  })
  const meaningBn = shapeText([surah.meaningBn], bangla, {
    size: 34,
    lineHeight: 50,
    color: colors.muted,
  })
  return (
    <Frame path={page.path} badge={BADGE}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              fontWeight: 500,
              color: colors.primary,
              textTransform: "uppercase",
              letterSpacing: 3,
            }}
          >
            Surah {surah.number} of 114
          </div>
          <div style={{ fontSize: 80, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1.02 }}>
            {surah.name}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: colors.foreground }}>
            {surah.meaning}
          </div>
          <Shaped text={meaningBn} />
          <div style={{ display: "flex", fontSize: 26, color: colors.muted }}>
            {surah.revelation} · {surah.ayahs} {surah.ayahs === 1 ? "ayah" : "ayahs"}
          </div>
        </div>
        <Shaped text={name} style={{ maxWidth: 440 }} />
      </div>
    </Frame>
  )
}

function PostCard({ page }: { page: PostPage }) {
  const { post } = page
  const writer = getWriter(post.writer)
  const titleLines = wrap(post.title, banglaBold, 58, W - 160, 3)
  const title = shapeText(titleLines, banglaBold, {
    size: 58,
    lineHeight: 86,
    color: colors.foreground,
  })
  const kicker = shapeText(
    [post.series ? `${post.series.name} · পর্ব ${toBanglaDigits(post.series.part)}` : "প্রবন্ধ"],
    banglaBold,
    { size: 30, lineHeight: 46, color: colors.gold }
  )
  const meta = shapeText([`${writer.name} · ${formatBanglaDate(post.date)}`], bangla, {
    size: 30,
    lineHeight: 46,
    color: colors.muted,
  })
  return (
    <Frame path={page.path} badge="Bangla article">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Shaped text={kicker} />
        <Shaped text={title} />
        <Shaped text={meta} />
      </div>
    </Frame>
  )
}

async function renderCard(node: ReactNode, slug: string) {
  const svg = await satori(node, { ...OG_IMAGE_SIZE, fonts })
  const png = await svgToPng(svg, W)
  await Bun.write(join(publicDir, ogImagePath(slug)), png)
  return slug
}

// ---------- llms.txt ----------

function llmsTxt() {
  const url = (path: string) => new URL(path, site.url).toString()
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "Surah pages contain the full Arabic text (Simple script, fully vowelled) with the Bangla translation by Muhiuddin Khan, prerendered as HTML. Every ayah has a permalink of the form /surah/<surah>#ayah-<ayah>. Audio streams from the Islamic Network CDN.",
    "",
    "## Main pages",
    "",
    ...appPages.map((page) => `- [${page.title}](${url(page.path)}): ${page.metaDescription}`),
    "",
    "## Surahs",
    "",
    ...surahPages.map(
      ({ surah, path }) =>
        `- [${surah.number}. ${surah.name} (${surah.meaning})](${url(path)}): ${surah.revelation}, ${surah.ayahs} ayahs.`
    ),
    "",
    "## Articles (Bangla)",
    "",
    ...postPages.map(
      (page) => `- [${page.post.title}](${url(page.path)}): ${page.metaDescription}`
    ),
    "",
    "## Optional",
    "",
    `- [Source code](${site.repository}): open-source repository.`,
    `- [Sitemap](${url("/sitemap.xml")})`,
    "",
  ].join("\n")
}

// ---------- cache ----------

/** Everything besides a page's own data that changes how its card looks. */
const DRAWING_INPUTS = [
  "scripts/generate-og-images.tsx",
  "scripts/lib/render.ts",
  "scripts/lib/shape-text.ts",
  "src/components/logo-mark.tsx",
  "src/content/writers.ts",
  "src/lib/bangla.ts",
  "src/lib/pages.ts",
  "src/lib/seo.ts",
  "src/lib/site.ts",
  // Pinned versions of satori, resvg, HarfBuzz and the fonts.
  "bun.lock",
]

const hash = (...parts: string[]) => {
  const hasher = new Bun.CryptoHasher("sha256")
  for (const part of parts) hasher.update(part)
  return hasher.digest("hex").slice(0, 16)
}

const drawing = hash(
  ...(await Promise.all(DRAWING_INPUTS.map((path) => Bun.file(join(root, path)).text())))
)
const ogDir = join(publicDir, "og")
const cacheFile = join(root, "node_modules", ".cache", "og-images.json")
const force = process.argv.includes("--force")
const previous: Record<string, string> = force
  ? {}
  : await Bun.file(cacheFile)
      .json()
      .catch(() => ({}))

/** Renders a card unless the PNG on disk was made from the same inputs. */
async function cachedCard(slug: string, data: unknown, card: () => ReactNode) {
  const key = hash(drawing, JSON.stringify(data) ?? "")
  const unchanged =
    previous[slug] === key && (await Bun.file(join(publicDir, ogImagePath(slug))).exists())
  if (!unchanged) await renderCard(card(), slug)
  return { slug, key, rendered: !unchanged }
}

// ---------- run ----------

await mkdir(ogDir, { recursive: true })
await mkdir(join(root, "node_modules", ".cache"), { recursive: true })

const results = await Promise.all([
  cachedCard("home", "home", () => <HomeCard />),
  ...pages.map((page) =>
    cachedCard(pageSlug(page), page, () =>
      page.kind === "surah" ? (
        <SurahCard page={page} />
      ) : page.kind === "post" ? (
        <PostCard page={page} />
      ) : (
        <AppCard page={page} />
      )
    )
  ),
])

// Drop images of pages that no longer exist.
const current = new Set(results.map((r) => ogImagePath(r.slug).split("/").pop()))
for (const name of await readdir(ogDir)) {
  if (name.endsWith(".png") && !current.has(name)) await rm(join(ogDir, name))
}
await Bun.write(cacheFile, JSON.stringify(Object.fromEntries(results.map((r) => [r.slug, r.key]))))
await Bun.write(join(publicDir, "llms.txt"), llmsTxt())

const rendered = results.filter((r) => r.rendered).length
console.log(
  `[seo] ${results.length} Open Graph images in public/og (${rendered} rendered, ${results.length - rendered} unchanged), plus public/llms.txt`
)
