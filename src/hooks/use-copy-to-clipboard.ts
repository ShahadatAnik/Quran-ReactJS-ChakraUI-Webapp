import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

/** Copies text to the clipboard with toast feedback and a transient `copied` flag. */
export function useCopyToClipboard(resetAfterMs = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string, successMessage = "Copied to clipboard") => {
      if (!text) {
        toast.info("Nothing to copy yet")
        return false
      }
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(successMessage)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(false), resetAfterMs)
        return true
      } catch {
        toast.error("Couldn't access the clipboard", {
          description:
            "Your browser blocked clipboard access. Select the text and copy it manually.",
        })
        return false
      }
    },
    [resetAfterMs]
  )

  return { copied, copy }
}
