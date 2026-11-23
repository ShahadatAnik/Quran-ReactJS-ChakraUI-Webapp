import type { Block, Inline, QuoteBlock } from "@/content/types"

function Inlines({ content }: { content: readonly Inline[] }) {
  return content.map((part, index) =>
    typeof part === "string" ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: static content; runs never reorder.
      <span key={index}>{part}</span>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: static content; runs never reorder.
      <strong key={index} className="font-semibold text-gold">
        {part.strong}
      </strong>
    )
  )
}

function Quote({ block }: { block: QuoteBlock }) {
  return (
    <figure className="my-6 rounded-xl border-s-4 border-gold bg-muted/60 px-5 py-4">
      <blockquote className="space-y-3">
        {block.arabic ? (
          <p lang="ar" dir="rtl" className="font-arabic text-2xl leading-loose text-foreground">
            {block.arabic}
          </p>
        ) : null}
        {block.text ? <p className="text-pretty text-foreground/90 italic">{block.text}</p> : null}
      </blockquote>
      {block.reference ? (
        <figcaption className="mt-2 text-sm font-medium text-gold">
          {block.kind === "ayah" ? "সূরা " : ""}
          {block.reference}
        </figcaption>
      ) : null}
    </figure>
  )
}

/** Renders an article's content blocks as semantic HTML. */
export function ArticleBody({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div lang="bn" className="text-[1.1rem] leading-[1.9] text-foreground/90">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h2
                // biome-ignore lint/suspicious/noArrayIndexKey: static content.
                key={index}
                className="mt-10 mb-3 text-xl leading-snug font-semibold text-foreground md:text-2xl"
              >
                {block.text}
              </h2>
            )
          case "paragraph":
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static content.
              <p key={index} className={block.indent ? "my-4 indent-8" : "my-4"}>
                <Inlines content={block.content} />
              </p>
            )
          case "list":
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static content.
              <ul key={index} className="my-4 list-disc space-y-3 ps-7 marker:text-gold">
                {block.items.map((item, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static content.
                  <li key={i}>
                    <Inlines content={item} />
                  </li>
                ))}
              </ul>
            )
          case "quote":
            // biome-ignore lint/suspicious/noArrayIndexKey: static content.
            return <Quote key={index} block={block} />
          default:
            return null
        }
      })}
    </div>
  )
}
