import { useCallback, useEffect, useState } from "react"
import { fetchTafsir, type TafsirParagraph } from "@/lib/tafsir"

type TafsirState =
  | { status: "idle" | "loading" }
  | { status: "ready"; paragraphs: TafsirParagraph[] }
  | { status: "error"; error: string }

/** Tafsir of one ayah, loaded once `ayah` is set (when the popup opens). */
export function useTafsir(surah: number, ayah: number | null) {
  const [state, setState] = useState<{ key: string } & TafsirState>({ key: "", status: "idle" })
  const [attempt, setAttempt] = useState(0)
  const key = ayah ? `${surah}:${ayah}:${attempt}` : ""

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` covers surah, ayah and retries.
  useEffect(() => {
    if (!ayah) return
    let active = true
    setState({ key, status: "loading" })
    fetchTafsir(surah, ayah)
      .then((paragraphs) => active && setState({ key, status: "ready", paragraphs }))
      .catch((error: unknown) => {
        if (!active) return
        setState({
          key,
          status: "error",
          error: error instanceof Error ? error.message : "Network error",
        })
      })
    return () => {
      active = false
    }
  }, [key])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  // A result for another ayah never shows for this one.
  const current: TafsirState = state.key === key ? state : { status: ayah ? "loading" : "idle" }
  return { ...current, retry }
}
