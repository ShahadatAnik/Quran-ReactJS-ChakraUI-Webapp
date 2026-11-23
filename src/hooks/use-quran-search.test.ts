import { afterEach, describe, expect, mock, test } from "bun:test"
import { renderHook, waitFor } from "@testing-library/react"
import { useQuranSearch } from "@/hooks/use-quran-search"

const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

const matches = (text: string) =>
  Response.json({ data: { matches: [{ surah: { number: 1 }, numberInSurah: 1, text }] } })

/** fetch mock that answers each URL after the given delay and honours abort signals. */
function delayedFetch(answers: Record<string, [delay: number, response: () => Response]>) {
  return mock((url: string, init?: RequestInit) => {
    const keyword = decodeURIComponent(url.split("/search/")[1]?.split("/")[0] ?? "")
    const [delay, response] = answers[keyword] ?? [0, () => new Response("?", { status: 500 })]
    return new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => resolve(response()), delay)
      init?.signal?.addEventListener("abort", () => {
        clearTimeout(timer)
        reject(new DOMException("Aborted", "AbortError"))
      })
    })
  }) as unknown as typeof fetch
}

describe("useQuranSearch", () => {
  test("stays idle for terms too short to search", () => {
    globalThis.fetch = delayedFetch({})
    const { result } = renderHook(() => useQuranSearch("a", "en.asad"))
    expect(result.current.status).toBe("idle")
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  test("a slow older response never overwrites a newer one", async () => {
    globalThis.fetch = delayedFetch({
      mer: [80, () => matches("old")],
      mercy: [5, () => matches("new")],
    })
    const { result, rerender } = renderHook(({ term }) => useQuranSearch(term, "en.asad"), {
      initialProps: { term: "mer" },
    })
    rerender({ term: "mercy" })
    await waitFor(() => expect(result.current.status).toBe("done"))
    await Bun.sleep(120)
    expect(result.current).toMatchObject({ status: "done", term: "mercy" })
    expect(result.current.status === "done" && result.current.matches[0]?.text).toBe("new")
  })

  test("treats the API's 404 'nothing found' as an empty result, not an error", async () => {
    globalThis.fetch = delayedFetch({
      zzz: [0, () => Response.json({ code: 404, data: "Nothing found" }, { status: 404 })],
    })
    const { result } = renderHook(() => useQuranSearch("zzz", "en.asad"))
    await waitFor(() => expect(result.current).toMatchObject({ status: "done", matches: [] }))
  })

  test("reports server errors", async () => {
    globalThis.fetch = delayedFetch({ boom: [0, () => new Response("down", { status: 503 })] })
    const { result } = renderHook(() => useQuranSearch("boom", "en.asad"))
    await waitFor(() => expect(result.current.status).toBe("error"))
    expect(result.current.status === "error" && result.current.message).toContain("503")
  })
})
