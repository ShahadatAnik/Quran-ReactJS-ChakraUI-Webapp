import { describe, expect, test } from "bun:test"
import { parsePost } from "@/lib/post-markdown"

const front = (fields: Record<string, string> = {}) => {
  const all: Record<string, string> = {
    title: `"শিরোনাম"`,
    shortTitle: `"ছোট শিরোনাম"`,
    summary: `"সারাংশ"`,
    seoTitle: `"Search title"`,
    metaDescription: JSON.stringify("ম".repeat(150)),
    date: `"2022-12-11"`,
    writer: `"nusus"`,
    keywords: `["durood", "salawat"]`,
    ...fields,
  }
  return `---\n${Object.entries(all)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n")}\n---\n`
}

const parse = (body: string, fields?: Record<string, string>) =>
  parsePost(`${front(fields)}\n${body}`, "test-article")

describe("front matter", () => {
  test("reads every field, with the slug from the file name", () => {
    const { post } = parse("একটি অনুচ্ছেদ।", {
      series: `\n  name: "দরুদ সমাধানের বারুদ"\n  part: 4`,
    })
    expect(post).toEqual({
      slug: "test-article",
      title: "শিরোনাম",
      shortTitle: "ছোট শিরোনাম",
      summary: "সারাংশ",
      seoTitle: "Search title",
      metaDescription: "ম".repeat(150),
      date: "2022-12-11",
      writer: "nusus",
      series: { name: "দরুদ সমাধানের বারুদ", part: 4 },
      keywords: ["durood", "salawat"],
    })
  })

  test("series is optional", () => {
    expect(parse("অনুচ্ছেদ।").post.series).toBeUndefined()
  })

  test.each([
    [{ writer: `"nobody"` }, /unknown writer "nobody"/],
    [{ date: `"11/12/2022"` }, /"date" must be a date/],
    [{ title: "" }, /"title" must be some text/],
    [{ author: `"x"` }, /unknown field "author"/],
    [{ seoTitle: JSON.stringify("x".repeat(46)) }, /"seoTitle" is 46 characters/],
    [{ metaDescription: `"short"` }, /"metaDescription" is 5 characters/],
    [{ keywords: `"durood"` }, /"keywords" must be a list/],
    [{ series: `\n  name: "x"\n  part: 1.5` }, /"series" must have/],
  ])("rejects %p", (fields, message) => {
    expect(() => parse("অনুচ্ছেদ।", fields)).toThrow(message)
  })

  test("an article without front matter", () => {
    expect(() => parsePost("## শিরোনাম", "x")).toThrow(/starts with its front matter/)
  })
})

describe("text", () => {
  test("headings, paragraphs with bold, and lists", () => {
    const { blocks } = parse(
      ["## ভূমিকা:", "", "প্রথম **জোর** শেষ,", "পরের লাইন।", "", "- **এক:** প্রথম", "- দুই"].join("\n")
    )
    expect(blocks).toEqual([
      { type: "heading", text: "ভূমিকা:" },
      { type: "paragraph", content: ["প্রথম ", { strong: "জোর" }, " শেষ, পরের লাইন।"] },
      { type: "list", items: [[{ strong: "এক:" }, " প্রথম"], ["দুই"]] },
    ])
  })

  test("quotes: Arabic, English and translation by alphabet, with the source", () => {
    const { blocks } = parse(
      [
        "> [!ayah] আহযাব : ৫৬",
        ">",
        "> إِنَّ ٱللَّهَ وَمَلَٰٓئِكَتَهُۥ",
        ">",
        "> নিশ্চয়ই আল্লাহ",
        "",
        "> [!hadith]",
        "> হাদিসের অনুবাদ,",
        "> দ্বিতীয় লাইন।",
        "",
        "> [!quote]",
        ">",
        "> Historians are unsure.",
        ">",
        "> ঐতিহাসিকগণ নিশ্চিত নন।",
      ].join("\n")
    )
    expect(blocks).toEqual([
      {
        type: "quote",
        kind: "ayah",
        arabic: "إِنَّ ٱللَّهَ وَمَلَٰٓئِكَتَهُۥ",
        text: "নিশ্চয়ই আল্লাহ",
        reference: "আহযাব : ৫৬",
      },
      { type: "quote", kind: "hadith", text: "হাদিসের অনুবাদ, দ্বিতীয় লাইন।" },
      {
        type: "quote",
        kind: "quote",
        english: "Historians are unsure.",
        text: "ঐতিহাসিকগণ নিশ্চিত নন।",
      },
    ])
  })

  test("Windows line endings read the same", () => {
    const unix = parse("## ক\n\nখ")
    const windows = parsePost(`${front()}\n## ক\n\nখ`.replaceAll("\n", "\r\n"), "test-article")
    expect(windows).toEqual(unix)
  })

  test.each([
    ["# এক #", /headings are written as ##/],
    ["### তিন", /headings are written as ##/],
    ["## ক\nখ", /a heading is one line/],
    ["> উদ্ধৃতি", /a quote starts with > \[!ayah\]/],
    ["> [!note] x\n>\n> ক", /a quote starts with/],
    ["> [!hadith]\n>\n> ক\n>\n> খ", /one translation paragraph; this is a second/],
    ["> [!hadith]\n> ক\nখ", /every line of a quote starts with >/],
    ["> [!hadith] উৎস", /this quote has no text/],
    ["- ক\nখ", /every line of a list starts with - /],
    ["১ম লাইন\n- তালিকা", /leave a blank line before/],
    ["**বন্ধ নয়", /not closed/],
    ["খালি **** রান", /empty \*\*bold\*\*/],
  ])("rejects %p", (body, message) => {
    expect(() => parse(body)).toThrow(message)
  })

  test("errors name the file and line", () => {
    // Front matter is 10 lines, then a blank line, so the heading is on line 12.
    expect(() => parse("### ভুল")).toThrow(/^test-article\.md:12: /)
  })

  test("an article with no text", () => {
    expect(() => parse("")).toThrow(/has no text/)
  })
})
