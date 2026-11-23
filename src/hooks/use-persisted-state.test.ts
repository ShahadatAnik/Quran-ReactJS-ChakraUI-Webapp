import { beforeEach, describe, expect, test } from "bun:test"
import { act, renderHook, waitFor } from "@testing-library/react"
import { usePersistedState } from "@/hooks/use-persisted-state"
import { STORAGE_PREFIX } from "@/lib/site"

describe("usePersistedState", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test("restores a stored value after mount", async () => {
    localStorage.setItem(`${STORAGE_PREFIX}greeting`, JSON.stringify("hello"))
    const { result } = renderHook(() => usePersistedState("greeting", "default"))

    await waitFor(() => expect(result.current[0]).toBe("hello"))
  })

  test("writes updates to localStorage", async () => {
    const { result } = renderHook(() => usePersistedState("count", 0))

    act(() => result.current[1](5))

    await waitFor(() => expect(localStorage.getItem(`${STORAGE_PREFIX}count`)).toBe("5"))
  })

  test("ignores malformed stored JSON", async () => {
    localStorage.setItem(`${STORAGE_PREFIX}broken`, "{not json")
    const { result } = renderHook(() => usePersistedState("broken", "fallback"))

    await waitFor(() => expect(result.current[0]).toBe("fallback"))
  })

  test("validates stored values with parse", async () => {
    localStorage.setItem(`${STORAGE_PREFIX}size`, JSON.stringify("huge"))
    const parse = (v: unknown) => (v === "sm" || v === "lg" ? v : undefined)
    const { result } = renderHook(() => usePersistedState<"sm" | "lg">("size", "sm", parse))

    await waitFor(() => expect(result.current[2]).toBe(true))
    expect(result.current[0]).toBe("sm")
  })

  test("reports when the stored value has been restored", async () => {
    const { result } = renderHook(() => usePersistedState("flag", false))
    await waitFor(() => expect(result.current[2]).toBe(true))
  })
})
