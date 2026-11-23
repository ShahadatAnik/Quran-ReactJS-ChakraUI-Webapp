import { getWriter } from "@/content/writers"
import {
  type AppPage,
  appPages,
  type IndexPage,
  ogImagePath,
  type Page,
  type PostPage,
  pageSlug,
  type SurahPage,
} from "@/lib/pages"
import { site } from "@/lib/site"

/** Size of every generated Open Graph image (see scripts/generate-og-images.tsx). */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const

interface SeoInput {
  /** Full document title. */
  title: string
  description: string
  /** Absolute path of the page, used for the canonical URL. */
  path: string
  /** Public path of the page's Open Graph image. */
  image: string
  imageAlt: string
  type?: "website" | "article"
  locale?: string
}

export const absoluteUrl = (path: string) => new URL(path, site.url).toString()

/** Title, description, canonical, Open Graph and Twitter tags for a route's `head()`. */
export function seo({
  title,
  description,
  path,
  image,
  imageAlt,
  type = "website",
  locale = site.locale,
}: SeoInput) {
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image)

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: type },
      { property: "og:site_name", content: site.name },
      { property: "og:locale", content: locale },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: imageUrl },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: String(OG_IMAGE_SIZE.width) },
      { property: "og:image:height", content: String(OG_IMAGE_SIZE.height) },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
      { name: "twitter:image:alt", content: imageAlt },
    ],
    links: [{ rel: "canonical", href: url }],
  }
}

/** A JSON-LD `<script>` entry for a route's `head().scripts`. */
export function jsonLd(graph: Record<string, unknown>[]) {
  return {
    type: "application/ld+json",
    // Escape "<" so the JSON can never close the script tag early.
    children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
      /</g,
      "\\u003c"
    ),
  }
}

const ids = {
  website: `${site.url}/#website`,
  author: `${site.url}/#author`,
  quran: `${site.url}/#quran`,
}

const authorNode = {
  "@type": "Person",
  "@id": ids.author,
  name: site.author.name,
  url: site.author.url,
  sameAs: site.social.map((s) => s.href),
}

const websiteNode = {
  "@type": "WebSite",
  "@id": ids.website,
  name: site.name,
  alternateName: site.nameBn,
  url: absoluteUrl("/"),
  description: site.description,
  inLanguage: ["en", "bn"],
  publisher: { "@id": ids.author },
}

/** The Quran as a Book, which every surah page is a Chapter of. */
const quranNode = {
  "@type": "Book",
  "@id": ids.quran,
  name: "The Holy Quran",
  alternateName: ["Al-Quran", "القرآن الكريم", "আল কুরআন"],
  inLanguage: "ar",
  numberOfPages: 604,
  url: absoluteUrl("/surah"),
}

const breadcrumbs = (trail: readonly { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
})

const faqPage = (faqs: AppPage["faqs"]) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
})

const itemList = (name: string, items: readonly Page[]) => ({
  "@type": "ItemList",
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.title,
    url: absoluteUrl(item.path),
  })),
})

const pageTitle = (page: Page) => `${page.seoTitle} | ${site.name}`

function pageHead(page: Page, extra: Partial<SeoInput> = {}) {
  return seo({
    title: pageTitle(page),
    description: page.metaDescription,
    path: page.path,
    image: ogImagePath(pageSlug(page)),
    imageAlt: `${page.title}: ${page.summary}`,
    ...extra,
  })
}

/** Head tags and structured data (WebSite, author, main sections) for the home page. */
export function homeSeo() {
  return {
    ...seo({
      title: site.homeTitle,
      description: site.description,
      path: "/",
      image: ogImagePath("home"),
      imageAlt: `${site.name}: ${site.tagline}`,
    }),
    scripts: [jsonLd([websiteNode, authorNode, itemList(`${site.name} sections`, [...appPages])])],
  }
}

function surahSeo(page: SurahPage) {
  const url = absoluteUrl(page.path)
  const { surah } = page
  return {
    ...pageHead(page),
    scripts: [
      jsonLd([
        {
          "@type": "Chapter",
          "@id": `${url}#chapter`,
          name: `Surah ${surah.name}`,
          alternateName: [surah.arabic, surah.altName, surah.meaning, surah.meaningBn],
          headline: page.title,
          description: page.metaDescription,
          url,
          image: absoluteUrl(ogImagePath(pageSlug(page))),
          position: surah.number,
          inLanguage: ["ar", "bn"],
          isPartOf: { "@id": ids.quran },
          isAccessibleForFree: true,
          publisher: { "@id": ids.author },
        },
        breadcrumbs([
          { name: "Surahs", path: "/surah" },
          { name: page.title, path: page.path },
        ]),
        faqPage(page.faqs),
        quranNode,
        websiteNode,
        authorNode,
      ]),
    ],
  }
}

function appSeo(page: AppPage) {
  const url = absoluteUrl(page.path)
  return {
    ...pageHead(page),
    scripts: [
      jsonLd([
        {
          "@type": "WebApplication",
          "@id": `${url}#app`,
          name: page.title,
          description: page.metaDescription,
          url,
          image: absoluteUrl(ogImagePath(pageSlug(page))),
          applicationCategory: "ReferenceApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          inLanguage: ["en", "bn"],
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          author: { "@id": ids.author },
          isPartOf: { "@id": ids.website },
        },
        breadcrumbs([{ name: page.title, path: page.path }]),
        faqPage(page.faqs),
        websiteNode,
        authorNode,
      ]),
    ],
  }
}

function postSeo(page: PostPage) {
  const url = absoluteUrl(page.path)
  const writer = getWriter(page.post.writer)
  const head = pageHead(page, { type: "article", locale: "bn_BD" })
  const series = page.post.series
  return {
    ...head,
    meta: [
      ...head.meta,
      { property: "article:published_time", content: page.post.date },
      { property: "article:author", content: writer.name },
      { property: "article:section", content: series?.name ?? "Islam" },
    ],
    scripts: [
      jsonLd([
        {
          "@type": "Article",
          "@id": `${url}#article`,
          headline: page.title,
          description: page.metaDescription,
          url,
          mainEntityOfPage: url,
          image: absoluteUrl(ogImagePath(pageSlug(page))),
          datePublished: page.post.date,
          inLanguage: "bn",
          author: {
            "@type": "Person",
            name: writer.name,
            ...(writer.links[0] && { url: writer.links[0].href }),
          },
          publisher: { "@id": ids.author },
          isPartOf: series
            ? [{ "@id": ids.website }, { "@type": "CreativeWorkSeries", name: series.name }]
            : { "@id": ids.website },
          ...(series && { position: series.part }),
        },
        breadcrumbs([
          { name: "Articles", path: "/blog" },
          { name: page.post.shortTitle, path: page.path },
        ]),
        websiteNode,
        authorNode,
      ]),
    ],
  }
}

/** Index pages (surah list, articles, writers): CollectionPage with the list it shows. */
export function indexSeo(page: IndexPage, items: readonly Page[]) {
  const url = absoluteUrl(page.path)
  return {
    ...pageHead(page),
    scripts: [
      jsonLd([
        {
          "@type": page.path === "/writers" ? "AboutPage" : "CollectionPage",
          "@id": `${url}#page`,
          name: page.title,
          description: page.metaDescription,
          url,
          isPartOf: { "@id": ids.website },
          ...(items.length > 0 && { mainEntity: itemList(page.title, items) }),
        },
        breadcrumbs([{ name: page.title, path: page.path }]),
        websiteNode,
        authorNode,
      ]),
    ],
  }
}

/** Head tags and structured data for any page in the registry. */
export function pageSeo(page: Exclude<Page, IndexPage>) {
  switch (page.kind) {
    case "surah":
      return surahSeo(page)
    case "post":
      return postSeo(page)
    case "app":
      return appSeo(page)
  }
}
