import { useEffect, useState } from "react"
import type { Edition } from "@/lib/editions"
import { fetchEditions } from "@/lib/quran-api"

type EditionsState =
  | { status: "idle" | "loading"; editions: Edition[] }
  | { status: "ready"; editions: Edition[] }
  | { status: "error"; editions: Edition[]; error: string }

/** The AlQuran Cloud editions list, loaded when `enabled` first becomes true. */
export function useEditions(enabled = true): EditionsState & { retry: () => void } {
  const [state, setState] = useState<EditionsState>({ status: "idle", editions: [] })
  const [attempt, setAttempt] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` re-runs the request on retry.
  useEffect(() => {
    if (!enabled) return
    let active = true
    setState((s) => (s.status === "ready" ? s : { status: "loading", editions: [] }))
    fetchEditions()
      .then((editions) => active && setState({ status: "ready", editions }))
      .catch(
        (error: unknown) =>
          active &&
          setState({
            status: "error",
            editions: [],
            error: error instanceof Error ? error.message : "Couldn't load editions",
          })
      )
    return () => {
      active = false
    }
  }, [enabled, attempt])

  return { ...state, retry: () => setAttempt((n) => n + 1) }
}
