import { createContext, type ReactNode, use, useEffect, useMemo, useState } from "react"
import { STORAGE_PREFIX, site } from "@/lib/site"

export type Theme = "light" | "dark" | "system"
type ResolvedTheme = Exclude<Theme, "system">

const STORAGE_KEY = `${STORAGE_PREFIX}theme`
const DARK_QUERY = "(prefers-color-scheme: dark)"

/**
 * Inline script run before first paint (via `ScriptOnce`) so the correct theme class
 * is on <html> before any content renders — no flash of the wrong theme. It also records
 * the chosen mode as `data-theme-mode`, so the theme button shows the right icon at once.
 */
export const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)});var d=t==='"dark"'||((!t||t==='"system"')&&matchMedia(${JSON.stringify(
  DARK_QUERY
)}).matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';r.dataset.themeMode=t==='"light"'?'light':t==='"dark"'?'dark':'system'}catch(e){}})()`

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStoredTheme(): Theme {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '"system"')
    return stored === "light" || stored === "dark" ? stored : "system"
  } catch {
    return "system"
  }
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
  // Match the browser UI to the chosen theme, even when it differs from the OS preference.
  for (const meta of document.querySelectorAll<HTMLMetaElement>("meta[name=theme-color]")) {
    meta.content = site.themeColor[resolved]
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setThemeState(readStoredTheme())
    const media = window.matchMedia(DARK_QUERY)
    const sync = () => setSystemTheme(media.matches ? "dark" : "light")
    sync()
    setReady(true)
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  const resolvedTheme = theme === "system" ? systemTheme : theme

  useEffect(() => {
    // Until the stored preference is read, the inline script owns the <html> class.
    if (ready) applyTheme(resolvedTheme)
  }, [ready, resolvedTheme])

  useEffect(() => {
    if (ready) document.documentElement.dataset.themeMode = theme
  }, [ready, theme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme: (next) => {
        setThemeState(next)
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
          // Ignore storage errors; the theme still applies for this session.
        }
      },
    }),
    [theme, resolvedTheme]
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme() {
  const context = use(ThemeContext)
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>")
  return context
}
