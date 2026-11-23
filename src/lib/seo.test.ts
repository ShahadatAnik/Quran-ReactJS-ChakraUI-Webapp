import { describe, expect, test } from "bun:test"
import { appPages, postPages, surahPages } from "@/lib/pages"
import { absoluteUrl, homeSeo, indexSeo, jsonLd, pageSeo, seo } from "@/lib/seo"
import { site } from "@/lib/site"

type Graph = { "@graph": Record<string, unknown>[] }
const graphOf = (head: { scripts: { children: string }[] }) =>
  (JSON.parse(head.scripts[0]?.children ?? "{}") as Graph)["@graph"]
const meta = (head: ReturnType<typeof seo>, key: string) =>
  head.meta.find((m) => ("property" in m && m.property === key) || ("name" in m && m.name === key))

describe("seo", () => {
  const head = seo({
    title: "T",
    description: "D",
    path: "/surah/2",
    image: "/og/surah-2.png",
    imageAlt: "A",
  })

  test("emits a canonical URL on the site host", () => {
    expect(head.links).toEqual([{ rel: "canonical", href: `${site.url}/surah/2` }])
  })

  test("emits absolute Open Graph and Twitter image URLs with dimensions", () => {
    expect(meta(head, "og:image")).toMatchObject({ content: `${site.url}/og/surah-2.png` })
    expect(meta(head, "og:image:width")).toMatchObject({ content: "1200" })
    expect(meta(head, "og:image:height")).toMatchObject({ content: "630" })
    expect(meta(head, "twitter:card")).toMatchObject({ content: "summary_large_image" })
  })
})

test("jsonLd escapes '<' so the script tag can't be closed early", () => {
  const script = jsonLd([{ name: "</script><script>alert(1)</script>" }])
  expect(script.type).toBe("application/ld+json")
  expect(script.children).not.toContain("<")
  expect(JSON.parse(script.children)["@graph"][0].name).toBe("</script><script>alert(1)</script>")
})

test("absoluteUrl", () => {
  expect(absoluteUrl("/")).toBe(`${site.url}/`)
  expect(absoluteUrl("/blog/x")).toBe(`${site.url}/blog/x`)
})

describe("structured data", () => {
  test("home page has WebSite, Person and an ItemList of sections", () => {
    const types = graphOf(homeSeo()).map((n) => n["@type"])
    expect(types).toEqual(["WebSite", "Person", "ItemList"])
  })

  test("surah pages are Chapters of the Quran, with breadcrumbs and FAQ", () => {
    const page = surahPages[35]
    if (!page) throw new Error("missing")
    const graph = graphOf(pageSeo(page))
    expect(graph.map((n) => n["@type"])).toEqual([
      "Chapter",
      "BreadcrumbList",
      "FAQPage",
      "Book",
      "WebSite",
      "Person",
    ])
    expect(graph[0]).toMatchObject({ position: 36, name: "Surah Ya-Sin" })
  })

  test("FAQ structured data matches the visible FAQ exactly", () => {
    for (const page of [...surahPages, ...appPages.filter((p) => p.kind === "app")]) {
      if (page.kind !== "surah" && page.kind !== "app") continue
      const faq = graphOf(pageSeo(page)).find((n) => n["@type"] === "FAQPage") as {
        mainEntity: { name: string; acceptedAnswer: { text: string } }[]
      }
      expect(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(
        page.faqs.map((f) => [f.question, f.answer])
      )
    }
  })

  test("articles are Bangla Articles with a publish date and series position", () => {
    const page = postPages.find((p) => p.post.slug === "dua-for-prophet-part-3")
    if (!page) throw new Error("missing")
    const head = pageSeo(page)
    const article = graphOf(head)[0]
    expect(article).toMatchObject({
      "@type": "Article",
      inLanguage: "bn",
      datePublished: "2022-12-09",
      position: 3,
    })
    expect(head.meta).toContainEqual({ property: "og:type", content: "article" })
    expect(head.meta).toContainEqual({ property: "og:locale", content: "bn_BD" })
  })

  test("breadcrumbs end at the page itself", () => {
    const page = surahPages[0]
    if (!page) throw new Error("missing")
    const crumbs = graphOf(pageSeo(page)).find((n) => n["@type"] === "BreadcrumbList") as {
      itemListElement: { item: string }[]
    }
    expect(crumbs.itemListElement.map((c) => c.item)).toEqual([
      `${site.url}/`,
      `${site.url}/surah`,
      `${site.url}/surah/1`,
    ])
  })

  test("index pages list what they show", () => {
    const blog = appPages.find((p) => p.path === "/blog")
    if (blog?.kind !== "index") throw new Error("missing")
    const graph = graphOf(indexSeo(blog, postPages))
    expect(graph[0]).toMatchObject({
      "@type": "CollectionPage",
      mainEntity: { numberOfItems: postPages.length },
    })
  })
})
