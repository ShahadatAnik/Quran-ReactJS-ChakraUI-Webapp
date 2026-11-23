import { useEffect, useEffectEvent } from "react"

/** Calls `handler` when `key` is pressed together with Ctrl (Windows/Linux) or ⌘ (macOS). */
export function useModHotkey(key: string, handler: (event: KeyboardEvent) => void) {
  const onHotkey = useEffectEvent(handler)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === key.toLowerCase() && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        onHotkey(event)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [key])
}
