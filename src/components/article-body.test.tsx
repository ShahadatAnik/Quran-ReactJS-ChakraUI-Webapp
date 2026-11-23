import { expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import { ArticleBody } from "@/components/article-body"
import type { Block } from "@/content/types"

const blocks: Block[] = [
  { type: "heading", text: "ভূমিকা:" },
  { type: "paragraph", indent: true, content: ["প্রথম ", { strong: "জোর" }, " শেষ"] },
  { type: "list", items: [[{ strong: "এক:" }, " প্রথম"], ["দুই"]] },
  { type: "quote", kind: "ayah", arabic: "إِنَّ ٱللَّهَ", text: "নিশ্চয়ই আল্লাহ", reference: "আহযাব : ৫৬" },
  { type: "quote", kind: "hadith", text: "হাদিস", reference: "সহিহ মুসলিম: ৪০৮" },
]

test("renders blocks as semantic, language-tagged HTML", () => {
  const { container } = render(<ArticleBody blocks={blocks} />)

  expect(screen.getByRole("heading", { level: 2, name: "ভূমিকা:" })).toBeInTheDocument()
  expect(container.firstElementChild).toHaveAttribute("lang", "bn")
  expect(screen.getByText("জোর").tagName).toBe("STRONG")
  expect(container.querySelectorAll("ul > li")).toHaveLength(2)

  const arabic = screen.getByText("إِنَّ ٱللَّهَ")
  expect(arabic).toHaveAttribute("lang", "ar")
  expect(arabic).toHaveAttribute("dir", "rtl")
  expect(arabic.closest("blockquote")).not.toBeNull()
})

test("captions ayah quotes with the surah and hadith quotes with the source", () => {
  const { container } = render(<ArticleBody blocks={blocks} />)
  const captions = [...container.querySelectorAll("figcaption")].map((c) => c.textContent)
  expect(captions).toEqual(["সূরা আহযাব : ৫৬", "সহিহ মুসলিম: ৪০৮"])
})
