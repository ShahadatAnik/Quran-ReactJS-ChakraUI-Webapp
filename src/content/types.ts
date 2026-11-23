/** Inline run inside a paragraph or list item: plain text, or an emphasised lead-in. */
export type Inline = string | { strong: string }

/** A Quran ayah or hadith quoted in an article. */
export interface QuoteBlock {
  type: "quote"
  kind: "ayah" | "hadith"
  arabic?: string
  /** Bangla translation of the quote. */
  text?: string
  /** Source, e.g. "আহযাব : ৫৬" or "সহিহ মুসলিম: ৪০৮". */
  reference?: string
}

export type Block =
  | { type: "heading"; text: string }
  | { type: "paragraph"; indent?: boolean; content: Inline[] }
  | { type: "list"; items: Inline[][] }
  | QuoteBlock
