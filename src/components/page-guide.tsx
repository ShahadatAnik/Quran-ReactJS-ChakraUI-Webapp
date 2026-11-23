import { ChevronDown } from "lucide-react"
import { PageCard } from "@/components/page-card"
import { type Page, relatedPages } from "@/lib/pages"

/**
 * Indexable content below a page: how-to steps, FAQ and related links. The FAQ uses native
 * <details> so every answer is in the prerendered HTML for crawlers, and the same questions
 * are exposed as FAQPage structured data by `pageSeo()`.
 */
export function PageGuide({ page }: { page: Page }) {
  const related = relatedPages(page)
  const guided =
    page.kind === "app" || page.kind === "surah" || page.kind === "dua" ? page : undefined

  return (
    <div className="mt-16 space-y-16 border-t border-border/60 pt-12">
      {guided ? (
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <section aria-labelledby="how-to-heading" className="space-y-5">
            <h2 id="how-to-heading" className="font-heading text-xl font-semibold tracking-tight">
              {guided.kind === "app" ? "How it works" : `How to read ${guided.title}`}
            </h2>
            <ol className="space-y-4">
              {guided.howTo.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary tabular-nums ring-1 ring-primary/20"
                  >
                    {index + 1}
                  </span>
                  <p className="pt-0.5 text-sm text-pretty text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="faq-heading" className="space-y-5">
            <h2 id="faq-heading" className="font-heading text-xl font-semibold tracking-tight">
              Frequently asked questions
            </h2>
            <div className="divide-y divide-border/60 rounded-xl bg-card ring-1 ring-foreground/10">
              {guided.faqs.map((faq) => (
                <details key={faq.question} className="group faq-item">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-5 py-4 outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
                    <h3 className="text-sm font-medium">{faq.question}</h3>
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>
                  <p className="px-5 pb-5 text-sm text-pretty text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="space-y-5">
          <h2 id="related-heading" className="font-heading text-xl font-semibold tracking-tight">
            {page.kind === "post" ? "আরও পড়ুন" : "Keep reading"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PageCard key={p.path} page={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
