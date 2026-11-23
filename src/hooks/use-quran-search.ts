import { useEffect, useState } from "react"
import { parseSearchResponse, type SearchMatch, searchUrl } from "@/lib/search"

export type SearchState =
  | { status: "idle" }
  | { status: "loading"; term: string }
  | { status: "done"; term: string; matches: SearchMatch[] }
  | { status: "error"; term: string; message: string }

/**
 * Searches the Quran API for `term` in `edition`. Every new term aborts the previous
 * request, so a slow response can never overwrite a newer one. "Nothing found" (an HTTP 404
 * from this API) is an empty result, not an error.
 */
export function useQuranSearch(term: string, edition: string): SearchState & { retry: () => void } {
  const [state, setState] = useState<SearchState>({ status: "idle" })
  const [attempt, setAttempt] = useState(0)
  const url = searchUrl(term, edition)

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` re-runs the request on retry.
  useEffect(() => {
    if (!url) {
      setState({ status: "idle" })
      return
    }
    const controller = new AbortController()
    setState({ status: "loading", term })
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok && response.status !== 404) {
          throw new Error(`The search service answered HTTP ${response.status}`)
        }
        const matches = parseSearchResponse(await response.json())
        setState({ status: "done", term, matches })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: "error",
          term,
          message: error instanceof Error ? error.message : "The search failed",
        })
      })
    return () => controller.abort()
  }, [url, attempt])

  return { ...state, retry: () => setAttempt((n) => n + 1) }
}
