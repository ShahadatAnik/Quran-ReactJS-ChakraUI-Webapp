import { RotateCcw, Settings2 } from "lucide-react"
import { useId, useState } from "react"
import { useReader } from "@/components/reader-provider"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useEditions } from "@/hooks/use-editions"
import { reciters } from "@/lib/audio"
import {
  arabicEditions,
  DEFAULT_ARABIC_EDITION,
  DEFAULT_TRANSLATION_EDITION,
  type Edition,
  editionLabel,
  translationEditions,
} from "@/lib/editions"
import { ARABIC_SIZES, type ArabicSize, defaultReaderSettings } from "@/lib/reader-settings"

/** Labels for the bundled defaults, shown before the full list has loaded. */
const builtIn: Record<string, string> = {
  [DEFAULT_ARABIC_EDITION]: "Arabic: Simple (default)",
  [DEFAULT_TRANSLATION_EDITION]: "Bangla: Muhiuddin Khan (default)",
}

const sizeLabels: Record<ArabicSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
}

function EditionSelect({
  id,
  value,
  options,
  loading,
  onChange,
}: {
  id: string
  value: string
  options: Edition[]
  loading: boolean
  onChange: (value: string) => void
}) {
  const known = options.some((e) => e.identifier === value)
  const label = (e: Edition) => builtIn[e.identifier] ?? editionLabel(e)
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {known ? null : (
          <SelectItem value={value}>{builtIn[value] ?? (loading ? "Loading…" : value)}</SelectItem>
        )}
        {options.map((edition) => (
          <SelectItem key={edition.identifier} value={edition.identifier}>
            {label(edition)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** Popover with the reader preferences; every change applies immediately and is saved. */
export function ReaderSettings() {
  const [open, setOpen] = useState(false)
  const { settings, updateSettings } = useReader()
  // The editions list is only needed once the popover has been opened.
  const editions = useEditions(open)
  const ids = {
    arabic: useId(),
    translation: useId(),
    show: useId(),
    size: useId(),
    reciter: useId(),
  }
  const loading = editions.status === "loading" || editions.status === "idle"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Reader settings" title="Reader settings">
          <Settings2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        collisionPadding={16}
        className="max-h-[calc(100dvh-5rem)] w-[min(22rem,calc(100vw-2rem))] space-y-4 overflow-y-auto"
      >
        <PopoverHeader>
          <PopoverTitle>Reader settings</PopoverTitle>
          <PopoverDescription>
            Saved in this browser and used across the site: surahs, single ayahs and audio.
          </PopoverDescription>
        </PopoverHeader>

        <div className="space-y-1.5">
          <label htmlFor={ids.arabic} className="text-sm font-medium">
            Arabic script
          </label>
          <EditionSelect
            id={ids.arabic}
            value={settings.arabicEdition}
            options={arabicEditions(editions.editions)}
            loading={loading}
            onChange={(arabicEdition) => updateSettings({ arabicEdition })}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.translation} className="text-sm font-medium">
            Translation
          </label>
          <EditionSelect
            id={ids.translation}
            value={settings.translationEdition}
            options={translationEditions(editions.editions)}
            loading={loading}
            onChange={(translationEdition) => updateSettings({ translationEdition })}
          />
        </div>

        {editions.status === "error" ? (
          <p className="text-xs text-destructive" role="alert">
            {editions.error}.{" "}
            <button type="button" className="underline" onClick={editions.retry}>
              Try again
            </button>
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          <label htmlFor={ids.show} className="text-sm font-medium">
            Show translation
          </label>
          <Switch
            id={ids.show}
            checked={settings.showTranslation}
            onCheckedChange={(showTranslation) => updateSettings({ showTranslation })}
          />
        </div>

        <div className="space-y-1.5">
          <p id={ids.size} className="text-sm font-medium">
            Arabic text size
          </p>
          <ToggleGroup
            type="single"
            variant="outline"
            aria-labelledby={ids.size}
            value={settings.arabicSize}
            onValueChange={(value) => value && updateSettings({ arabicSize: value as ArabicSize })}
            className="w-full"
          >
            {ARABIC_SIZES.map((size, index) => (
              <ToggleGroupItem
                key={size}
                value={size}
                aria-label={sizeLabels[size]}
                title={sizeLabels[size]}
                className="h-10 flex-1"
              >
                <span
                  aria-hidden="true"
                  lang="ar"
                  className="arabic-glyph-centred"
                  style={{ fontSize: `${1 + index * 0.25}rem` }}
                >
                  ع
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-1.5">
          <label htmlFor={ids.reciter} className="text-sm font-medium">
            Reciter
          </label>
          <Select value={settings.reciter} onValueChange={(reciter) => updateSettings({ reciter })}>
            <SelectTrigger id={ids.reciter} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {reciters.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => updateSettings(defaultReaderSettings)}
        >
          <RotateCcw />
          Reset to defaults
        </Button>
      </PopoverContent>
    </Popover>
  )
}
