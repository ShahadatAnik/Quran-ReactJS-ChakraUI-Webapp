import { ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"
import { useAudio } from "@/components/reader-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Floating "back to top" button, shown after scrolling down a long page. */
export function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { track } = useAudio()

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 900)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  if (!visible) return null
  return (
    <Button
      variant="outline"
      size="icon-lg"
      aria-label="Back to top"
      className={cn(
        "fixed right-4 z-30 rounded-full bg-background/90 shadow-md backdrop-blur",
        track ? "bottom-24" : "bottom-6"
      )}
      onClick={() => {
        const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
        document.getElementById("main")?.focus({ preventScroll: true })
      }}
    >
      <ArrowUp />
    </Button>
  )
}
