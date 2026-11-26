import { ChevronsUpDown } from "lucide-react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { commandFilter } from "@/lib/command-filter"
import { cn } from "@/lib/utils"

/** Name widths of the skeleton rows shown while the options load, varied like real names. */
const SKELETON_ROWS = ["w-1/2", "w-2/3", "w-2/5", "w-3/5", "w-1/3", "w-3/4"]

/** A small tile in front of a choice: a language code ("BN"), a script letter, initials. */
export function PickerTile({
  children,
  lang,
  className,
}: {
  children: ReactNode
  lang?: string
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      lang={lang}
      className={cn(
        "inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 px-1 font-mono text-3xs font-semibold tracking-wider text-primary uppercase dark:bg-primary/20",
        className
      )}
    >
      {children}
    </span>
  )
}

export interface PickerOption {
  value: string
  label: string
  /** Second, muted line under the label. */
  description?: string
  /** The label in its own script, on a second line (e.g. a reciter's name in Arabic). */
  native?: { text: string; lang: string }
  /** Extra search terms. */
  keywords?: string[]
  /** Tile before the label; omitted inside a group whose heading already has one. */
  tile?: ReactNode
}

export interface PickerGroup {
  key: string
  heading?: ReactNode
  options: PickerOption[]
}

interface PickerProps {
  id: string
  value: string
  groups: PickerGroup[]
  onChange: (value: string) => void
  /**
   * Trigger content for the current value: tile, label and a muted hint on the right. With
   * `loading`, a skeleton stands in until the current value's name is known.
   */
  current: { tile?: ReactNode; label: string; hint?: string; loading?: boolean }
  /** Option marked "Default" in the list. */
  defaultValue?: string
  loading?: boolean
  /** Adds a search box; worth it for long lists. */
  searchPlaceholder?: string
  emptyText?: string
}

/**
 * The site's dropdown for settings: a trigger showing the current choice, and a list that
 * opens on that choice, optionally searchable and grouped under headings.
 */
export function Picker({
  id,
  value,
  groups,
  onChange,
  current,
  defaultValue,
  loading = false,
  searchPlaceholder,
  emptyText = "Nothing matches.",
}: PickerProps) {
  const [open, setOpen] = useState(false)
  /** The highlighted (keyboard) item, which starts on the selected option. */
  const [active, setActive] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const optionCount = groups.reduce((n, g) => n + g.options.length, 0)

  // Open on the selected option: highlight it and scroll it to the middle of the list
  // (also once the options arrive, if they were still loading when the list opened).
  useEffect(() => {
    if (!open || optionCount === 0) return
    setActive(value)
    const frame = requestAnimationFrame(() => {
      const list = listRef.current
      const item = list?.querySelector<HTMLElement>("[data-checked=true]")
      if (!list || !item) return
      const listBox = list.getBoundingClientRect()
      const itemBox = item.getBoundingClientRect()
      list.scrollTop += itemBox.top - listBox.top - (listBox.height - itemBox.height) / 2
    })
    return () => cancelAnimationFrame(frame)
  }, [open, value, optionCount])

  return (
    // Modal, so the list scrolls even inside the settings panel (a dialog that locks scrolling).
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-start gap-2 px-2.5 font-normal"
        >
          {current.loading ? (
            <>
              <Skeleton className="h-5 w-7 shrink-0" />
              <span key="loading" className="sr-only">
                {current.label}
              </span>
              <Skeleton className="h-3.5 w-32 max-w-full" />
            </>
          ) : (
            <>
              {current.tile}
              <span key="label" className="min-w-0 truncate">
                {current.label}
              </span>
            </>
          )}
          {current.hint && !current.loading ? (
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{current.hint}</span>
          ) : null}
          <ChevronsUpDown
            className={cn("shrink-0 text-muted-foreground", !current.hint && "ml-auto")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="w-(--radix-popover-trigger-width) min-w-72 p-0"
      >
        <Command
          filter={commandFilter}
          value={active}
          onValueChange={setActive}
          shouldFilter={Boolean(searchPlaceholder)}
        >
          {searchPlaceholder ? <CommandInput placeholder={searchPlaceholder} /> : null}
          <CommandList
            ref={listRef}
            className="max-h-[min(20rem,var(--radix-popover-content-available-height,20rem))]"
          >
            {loading && optionCount === 0 ? (
              <div aria-busy="true" className="space-y-1 p-1">
                <span className="sr-only">Loading the list…</span>
                {SKELETON_ROWS.map((width) => (
                  <div key={width} className="flex items-center gap-2 px-2 py-2">
                    <Skeleton className="h-5 w-7 shrink-0" />
                    <Skeleton className={cn("h-3.5", width)} />
                  </div>
                ))}
              </div>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            {groups.map((group) => (
              <CommandGroup key={group.key} heading={group.heading}>
                {group.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[
                      option.label,
                      option.native?.text ?? "",
                      option.description ?? "",
                      ...(option.keywords ?? []),
                    ]}
                    data-checked={option.value === value}
                    onSelect={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(group.heading && !option.tile && "pl-9")}
                  >
                    {option.tile}
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate">{option.label}</span>
                        {option.value === defaultValue ? (
                          <Badge variant="secondary" className="h-4 px-1.5 text-3xs">
                            Default
                          </Badge>
                        ) : null}
                      </span>
                      {option.native ? (
                        <span
                          lang={option.native.lang}
                          dir="auto"
                          className="block w-fit max-w-full truncate text-sm leading-6 text-muted-foreground"
                        >
                          {option.native.text}
                        </span>
                      ) : null}
                      {option.description ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
