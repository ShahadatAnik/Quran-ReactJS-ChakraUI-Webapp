import { useNavigate } from "@tanstack/react-router"
import {
  BookOpenText,
  CornerDownRight,
  HandHeart,
  History,
  House,
  Monitor,
  Moon,
  Search,
  Sun,
} from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useModHotkey } from "@/hooks/use-hotkey"
import { useMounted } from "@/hooks/use-mounted"
import { commandFilter } from "@/lib/command-filter"
import { duaReference } from "@/lib/duas"
import { appPages, duaPages, postPages, surahPages } from "@/lib/pages"
import { ayahId, getSurah, parseAyahReference } from "@/lib/surahs"

function useIsMac() {
  const mounted = useMounted()
  return mounted && /Mac|iPhone|iPad/.test(navigator.userAgent)
}

/** Global ⌘K / Ctrl+K palette: pages, all 114 surahs, articles, ayah references and theme. */
export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const isMac = useIsMac()
  const reference = parseAyahReference(query)

  useModHotkey("k", () => setOpen((value) => !value))

  const run = (action: () => void) => {
    setOpen(false)
    setQuery("")
    action()
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-9 w-9 justify-start px-0 text-muted-foreground max-sm:justify-center sm:w-52 sm:px-3 lg:w-60"
        aria-label="Search surahs and pages"
      >
        <Search />
        <span className="hidden flex-1 text-left sm:inline">Search…</span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setQuery("")
        }}
        title="Search ILMIYAH"
        description="Jump to a surah, an ayah reference such as 2:255, an article or a page"
      >
        <Command filter={commandFilter}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Surah name, 2:255, article or page…"
          />
          <CommandList>
            <CommandEmpty>Nothing found. Try a surah name or a reference like 36:1.</CommandEmpty>
            {reference ? (
              <CommandGroup heading="Ayah">
                <CommandItem
                  forceMount
                  value={`Go to ayah ${reference.surah}:${reference.ayah}`}
                  onSelect={() =>
                    run(() =>
                      navigate({
                        to: "/surah/$number",
                        params: { number: String(reference.surah) },
                        hash: ayahId(reference.ayah),
                      })
                    )
                  }
                >
                  <CornerDownRight />
                  Go to {getSurah(reference.surah)?.name} {reference.surah}:{reference.ayah}
                </CommandItem>
              </CommandGroup>
            ) : null}
            <CommandGroup heading="Pages">
              <CommandItem value="Home" onSelect={() => run(() => navigate({ to: "/" }))}>
                <House />
                Home
              </CommandItem>
              {appPages.map((page) => (
                <CommandItem
                  key={page.path}
                  value={page.title}
                  keywords={[...page.keywords]}
                  onSelect={() => run(() => navigate(page.link))}
                >
                  <page.icon />
                  {page.title}
                </CommandItem>
              ))}
              <CommandItem
                value="Reading history"
                keywords={["history", "streak", "khatm", "progress", "log", "your reading"]}
                onSelect={() => run(() => navigate({ to: "/history" }))}
              >
                <History />
                Reading history
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Duas">
              {duaPages.map((page) => (
                <CommandItem
                  key={page.path}
                  value={page.title}
                  keywords={[...page.keywords]}
                  onSelect={() => run(() => navigate(page.link))}
                >
                  <HandHeart />
                  <span className="truncate">{page.title}</span>
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                    {duaReference(page.dua)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Surahs">
              {surahPages.map((page) => (
                <CommandItem
                  key={page.path}
                  value={page.title}
                  keywords={[...page.keywords]}
                  onSelect={() => run(() => navigate(page.link))}
                >
                  <BookOpenText />
                  <span className="w-7 text-muted-foreground tabular-nums">
                    {page.surah.number}
                  </span>
                  <span className="flex-1">{page.surah.name}</span>
                  <span className="text-xs text-muted-foreground">{page.surah.meaning}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Articles">
              {postPages.map((page) => (
                <CommandItem
                  key={page.path}
                  value={page.post.shortTitle}
                  keywords={[...page.keywords]}
                  onSelect={() => run(() => navigate(page.link))}
                >
                  <page.icon />
                  <span lang="bn">{page.post.shortTitle}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {query.trim().length >= 2 && !reference ? (
              <CommandGroup heading="Full-text search" forceMount>
                <CommandItem
                  forceMount
                  // A constant value scores 0 in the filter, so this always ranks after
                  // matching surahs and pages instead of above them.
                  value="search-the-quran"
                  onSelect={() =>
                    run(() => navigate({ to: "/search", search: { q: query.trim() } }))
                  }
                >
                  <Search />
                  Search the Quran for “{query.trim()}”
                </CommandItem>
              </CommandGroup>
            ) : null}
            <CommandSeparator />
            <CommandGroup heading="Theme">
              <CommandItem onSelect={() => run(() => setTheme("light"))}>
                <Sun />
                Light theme
              </CommandItem>
              <CommandItem onSelect={() => run(() => setTheme("dark"))}>
                <Moon />
                Dark theme
              </CommandItem>
              <CommandItem onSelect={() => run(() => setTheme("system"))}>
                <Monitor />
                System theme
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
