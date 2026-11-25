import { afterEach, describe, expect, test } from "bun:test"
import { themeScript } from "@/components/theme-provider"
import { STORAGE_PREFIX } from "@/lib/site"

const KEY = `${STORAGE_PREFIX}theme`
const root = document.documentElement
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0))

/** What React does to <html> when it renders the page again after a failed hydration. */
function clearHtmlAttributes() {
  while (root.attributes.length) root.removeAttributeNode(root.attributes[0] as Attr)
  root.setAttribute("lang", "en")
}

afterEach(() => {
  localStorage.removeItem(KEY)
  root.classList.remove("dark")
})

describe("themeScript", () => {
  test("applies a saved dark theme before the app loads", () => {
    localStorage.setItem(KEY, '"dark"')
    new Function(themeScript)()
    expect(root.classList.contains("dark")).toBe(true)
    expect(root.style.colorScheme).toBe("dark")
    expect(root.dataset.themeMode).toBe("dark")
  })

  test("puts the theme back when React clears the attributes of <html>", async () => {
    localStorage.setItem(KEY, '"dark"')
    new Function(themeScript)()
    clearHtmlAttributes()
    await nextTask()
    expect(root.classList.contains("dark")).toBe(true)
    expect(root.style.colorScheme).toBe("dark")
    expect(root.dataset.themeMode).toBe("dark")
    expect(root.getAttribute("lang")).toBe("en")
  })

  test("doesn't undo a theme the reader picks", async () => {
    localStorage.setItem(KEY, '"dark"')
    new Function(themeScript)()
    // The theme button: saves the choice, then the provider applies it.
    localStorage.setItem(KEY, '"light"')
    root.classList.remove("dark")
    root.style.colorScheme = "light"
    root.dataset.themeMode = "light"
    await nextTask()
    expect(root.classList.contains("dark")).toBe(false)
    expect(root.dataset.themeMode).toBe("light")
  })
})
