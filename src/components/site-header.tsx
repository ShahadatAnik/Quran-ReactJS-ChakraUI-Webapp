import { Link } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import { CommandMenu } from "@/components/command-menu"
import { Logo } from "@/components/logo"
import { ReaderSettings } from "@/components/reader-settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { appPages } from "@/lib/pages"

/** Main navigation: every app page except Writers, which lives in the footer. */
const nav = appPages.filter((page) => page.path !== "/writers")

/** Short labels for the navigation. */
const navLabels: Record<string, string> = {
  "Search the Quran": "Search",
  "Duas from the Quran": "Duas",
}
const navLabel = (title: string) => navLabels[title] ?? title

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg [view-transition-name:site-header] supports-backdrop-filter:bg-background/65">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 lg:flex">
          {nav.map((page) => (
            <Link
              key={page.path}
              {...page.link}
              // Not exact, so "Surahs" stays highlighted on /surah/2 and "Articles" on posts.
              className="rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-[status=active]:bg-accent data-[status=active]:text-accent-foreground"
            >
              {navLabel(page.title)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <CommandMenu />
          <ReaderSettings />
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              {appPages.map((page) => (
                <DropdownMenuItem key={page.path} asChild>
                  <Link {...page.link}>
                    <page.icon />
                    {navLabel(page.title)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
