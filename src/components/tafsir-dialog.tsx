import { ExternalLink } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useTafsir } from "@/hooks/use-tafsir"
import { getSurah } from "@/lib/surahs"
import { type TafsirParagraph, tafsirPageUrl, tafsirSource } from "@/lib/tafsir"
import { cn } from "@/lib/utils"

function Segments({ paragraph }: { paragraph: TafsirParagraph }) {
  return paragraph.segments.map((segment, index) =>
    segment.bold ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are fixed once parsed.
      <strong key={index} className="font-semibold text-foreground">
        {segment.text}
      </strong>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are fixed once parsed.
      <span key={index}>{segment.text}</span>
    )
  )
}

interface TafsirDialogProps {
  surah: number
  /** The ayah whose tafsir is shown; null when the popup is closed. */
  ayah: number | null
  /** Arabic text of that ayah, shown at the top for context. */
  arabic?: string
  onClose: () => void
}

/**
 * Bangla tafsir of one ayah, with its Shan-e-Nuzul where one is known. The first paragraph is
 * the tafsir's own translation; the numbered notes after it explain the ayah.
 */
export function TafsirDialog({ surah, ayah: requested, arabic, onClose }: TafsirDialogProps) {
  // The last ayah asked for stays on screen while the popup animates closed.
  const [ayah, setAyah] = useState(requested)
  if (requested !== null && requested !== ayah) setAyah(requested)
  const tafsir = useTafsir(surah, ayah)
  const name = getSurah(surah)?.name
  const [translation, ...notes] = tafsir.status === "ready" ? tafsir.paragraphs : []

  return (
    <Dialog open={requested !== null} onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="flex max-h-[min(85dvh,52rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-4 pr-12">
          <DialogTitle>
            Tafsir &amp; Shan-e-Nuzul · {name} {surah}:{ayah}
          </DialogTitle>
          <DialogDescription>
            <span lang="bn">{tafsirSource.nameBn}</span> · {tafsirSource.publisher}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6" lang="bn">
          {arabic ? (
            <p lang="ar" dir="rtl" className="font-arabic text-2xl leading-arabic text-foreground">
              {arabic}
            </p>
          ) : null}

          {tafsir.status === "loading" || tafsir.status === "idle" ? (
            <div aria-busy="true" className="space-y-4">
              <span className="sr-only" lang="en">
                Loading the tafsir…
              </span>
              <div className="space-y-2 rounded-lg bg-muted/60 p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              {["w-11/12", "w-4/5", "w-3/4"].map((width) => (
                <div key={width} className="flex gap-2.5">
                  <Skeleton className="size-6 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2 pt-0.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className={cn("h-4", width)} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {tafsir.status === "error" ? (
            <p className="py-6 text-sm text-destructive" role="alert" lang="en">
              Couldn't load the tafsir. {tafsir.error}.{" "}
              <button type="button" className="underline" onClick={tafsir.retry}>
                Try again
              </button>
            </p>
          ) : null}

          {translation ? (
            <p className="rounded-lg bg-muted/60 p-3 text-reading leading-relaxed text-foreground">
              <Segments paragraph={translation} />
            </p>
          ) : null}

          {notes.length > 0 ? (
            <ol className="space-y-3 text-reading leading-relaxed text-muted-foreground">
              {notes.map((note, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: notes are fixed once parsed.
                <li key={index} className="flex gap-2.5">
                  {note.note ? (
                    <span className="mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 px-1 text-xs font-semibold text-gold tabular-nums">
                      {note.note}
                    </span>
                  ) : null}
                  <p className="min-w-0">
                    <Segments paragraph={note} />
                  </p>
                </li>
              ))}
            </ol>
          ) : null}

          {tafsir.status === "ready" && !translation ? (
            <p className="py-6 text-sm text-muted-foreground" lang="en">
              This tafsir has no notes on this ayah.
            </p>
          ) : null}
        </div>

        {ayah ? (
          <div className="border-t px-4 py-3 text-xs text-muted-foreground">
            Source: {tafsirSource.name}, via{" "}
            <a
              href={tafsirPageUrl(surah, ayah)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline underline-offset-2 hover:text-foreground"
            >
              Quran.com
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
