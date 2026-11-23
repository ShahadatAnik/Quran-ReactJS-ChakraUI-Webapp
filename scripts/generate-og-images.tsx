/**
 * Build-time SEO assets, generated from the page registry so new pages get them for free:
 *   - public/og/<page>.png  1200×630 Open Graph / Twitter card image for every page
 *   - public/llms.txt       site summary for AI assistants and answer engines (llmstxt.org)
 *
 * Runs before `vite build` (see the "build" script). The output is git-ignored.
 * Bangla and Arabic are shaped with HarfBuzz (scripts/lib/shape-text.ts), since neither
 * satori nor resvg shapes them correctly.
 */
import { mkdir, rm } from "node:fs/promises"
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

// ---------- run ----------

await rm(join(publicDir, "og"), { recursive: true, force: true })
await mkdir(join(publicDir, "og"), { recursive: true })

const written = await Promise.all([
  renderCard(<HomeCard />, "home"),
  ...pages.map((page) => {
    const card =
      page.kind === "surah" ? (
        <SurahCard page={page} />
      ) : page.kind === "post" ? (
        <PostCard page={page} />
      ) : (
        <AppCard page={page} />
      )
    return renderCard(card, pageSlug(page))
  }),
])
await Bun.write(join(publicDir, "llms.txt"), llmsTxt())

console.log(`[seo] ${written.length} Open Graph images in public/og, plus public/llms.txt`)
