import { Monitor, Moon, Sun } from "lucide-react"
import { useState } from "react"
import { type Theme, useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * The modes in the order a click steps through them, looping back to the start. Each icon is
 * shown by CSS from the `data-theme-mode` attribute the theme script puts on <html> before
 * the first paint, so the right icon is there at once (System when nothing is stored).
 */
const modes = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    className: "hidden [html[data-theme-mode=light]_&]:block",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    className: "hidden [html[data-theme-mode=dark]_&]:block",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    className: "[html[data-theme-mode=dark]_&]:hidden [html[data-theme-mode=light]_&]:hidden",
  },
] as const satisfies readonly { value: Theme; label: string; icon: unknown; className: string }[]

/** One button that switches to the next theme on every click: light, dark, system, light… */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  /** Animate icon changes only after a click, not when the page loads. */
  const [clicked, setClicked] = useState(false)
  const index = Math.max(
    0,
    modes.findIndex((m) => m.value === theme)
  )
  const current = modes[index] ?? modes[0]
  const next = modes[(index + 1) % modes.length] ?? modes[0]

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Theme: ${current.label}. Switch to ${next.label}`}
      title={`Theme: ${current.label} (click for ${next.label})`}
      onClick={() => {
        setClicked(true)
        setTheme(next.value)
      }}
    >
      {modes.map(({ value, icon: Icon, className }) => (
        <Icon
          key={value}
          aria-hidden="true"
          className={cn(
            className,
            // Showing an icon restarts its animation, so each change plays a short turn-in.
            clicked && "animate-in duration-300 fade-in-0 spin-in-45 motion-reduce:animate-none"
          )}
        />
      ))}
    </Button>
  )
}
