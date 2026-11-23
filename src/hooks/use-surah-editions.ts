import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DEFAULT_ARABIC_EDITION, DEFAULT_TRANSLATION_EDITION } from "@/lib/editions"
import { type EditionTexts, fetchSurahEditions } from "@/lib/quran-api"

export type EditionStatus = "bundled" | "loading" | "ready" | "error"

/**
 * Texts of the chosen editions for one surah. The bundled Arabic (Simple) + Bangla text is always
 * rendered first (it is what the page was prerendered with); other editions are fetched
 * after mount and swapped in. On failure the bundled text stays and a toast explains why.
 */
export function useSurahEditions(
  surah: number,
  ayahCount: number,
  arabicEdition: string,
  translationEdition: string,
  enabled: boolean
): { texts: EditionTexts; status: EditionStatus } {
  const [state, setState] = useState<{ key: string; texts: EditionTexts; status: EditionStatus }>({
    key: "",
    texts: {},
    status: "bundled",
  })
  const wanted = [
    arabicEdition !== DEFAULT_ARABIC_EDITION ? arabicEdition : null,
    translationEdition !== DEFAULT_TRANSLATION_EDITION ? translationEdition : null,
  ].filter((id): id is string => id !== null)
  const key = `${surah}|${wanted.join(",")}`

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` covers surah and editions.
  useEffect(() => {
    if (!enabled || wanted.length === 0) return
    const controller = new AbortController()
    setState({ key, texts: {}, status: "loading" })
    fetchSurahEditions(surah, ayahCount, wanted, controller.signal)
      .then((texts) => setState({ key, texts, status: "ready" }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({ key, texts: {}, status: "error" })
        toast.error("Couldn't load the selected edition", {
          description: `${error instanceof Error ? error.message : "Network error"}. Showing the default text instead.`,
        })
      })
    return () => controller.abort()
  }, [key, enabled])

  // Results for another surah or edition never leak into this one.
  if (!enabled || wanted.length === 0 || state.key !== key) {
    return { texts: {}, status: wanted.length > 0 && enabled ? "loading" : "bundled" }
  }
  return { texts: state.texts, status: state.status }
}
