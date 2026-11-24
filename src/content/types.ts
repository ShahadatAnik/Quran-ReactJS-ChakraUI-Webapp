/** Inline run inside a paragraph or list item: plain text, or an emphasised lead-in. */
export type Inline = string | { strong: string }

/** A Quran ayah, a hadith, or another quotation (such as an encyclopedia) in an article. */
export interface QuoteBlock {
  type: "quote"
  kind: "ayah" | "hadith" | "quote"
  arabic?: string
  /** The quotation in English, when that is its original language. */
  english?: string
  /** Bangla translation of the quote. */
  text?: string
  /** Source, e.g. "আহযাব : ৫৬" or "সহিহ মুসলিম: ৪০৮". */
  reference?: string
}

export type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; content: Inline[] }
  | { type: "list"; items: Inline[][] }
  | QuoteBlock
