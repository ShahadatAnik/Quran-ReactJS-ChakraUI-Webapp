import type { ReactNode } from "react"

/**
 * Pieces shared by the headers of reading pages (surahs and duas), so both look the same:
 * a dotted row of facts, and the Arabic name beside the title on phones and above the play
 * button on wider screens.
 */

/** "Meccan · 7 ayahs · Juz 1"; a wrapped line never starts with a dot. */
export function HeaderFacts({ label, facts }: { label: string; facts: readonly string[] }) {
  return (
    // Every fact has a leading dot; the list is shifted left by one dot and clipped, so a line
    // never starts with one, however the row wraps.
    <div className="overflow-hidden pt-1">
      <ul
        aria-label={label}
        className="-ml-4 flex flex-wrap items-center gap-y-1 text-xs text-muted-foreground sm:text-sm"
      >
        {facts.map((fact) => (
          <li
            key={fact}
            className="before:inline-block before:w-4 before:text-center before:text-muted-foreground/60 before:content-['·']"
          >
            {fact}
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * The Arabic name for PageLayout's `titleAside`: beside the title on phones only. Amiri sits
 * low in its line box; .arabic-glyph-centred lifts it onto the title's line.
 */
export function ArabicNameAside({ text }: { text: string }) {
  return (
    <p lang="ar" dir="rtl" className="mt-5 h-8 shrink-0 text-3xl text-gold md:hidden">
      <span className="arabic-glyph-centred">{text}</span>
    </p>
  )
}

/** PageLayout's `actions` for a reading page: the Arabic name above the play button. */
export function ReadingActions({ arabic, children }: { arabic: string; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4 md:w-auto md:items-end">
      <p lang="ar" dir="rtl" className="hidden h-12 text-5xl text-gold md:block">
        <span className="arabic-glyph-centred">{arabic}</span>
      </p>
      {children}
    </div>
  )
}
