import { RotateCcw, Settings2 } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { EditionPicker } from "@/components/edition-picker"
import { Picker, type PickerGroup, PickerTile } from "@/components/picker"
import { useReader } from "@/components/reader-provider"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useEditions } from "@/hooks/use-editions"
import { getReciter, type Reciter, reciters } from "@/lib/audio"
import {
  ARABIC_SCRIPT_NOTES,
  arabicEditions,
  arabicScriptLabel,
  DEFAULT_ARABIC_EDITION,
  DEFAULT_RECITER,
  DEFAULT_TRANSLATION_EDITION,
  translationEditions,
} from "@/lib/editions"
import { ARABIC_SIZES, type ArabicSize, defaultReaderSettings } from "@/lib/reader-settings"

/** Names of the bundled defaults, shown before the full list has loaded. */
const knownTranslations = { [DEFAULT_TRANSLATION_EDITION]: "Muhiuddin Khan" }

/** An Arabic letter in a tile, standing for "Arabic script". */
const ScriptTile = () => (
  <PickerTile lang="ar" className="px-1.5 font-arabic text-[13px] tracking-normal normal-case">
    <span className="arabic-glyph-centred">ع</span>
  </PickerTile>
)

/** A reciter's initials in a tile: "Mishary Rashid Alafasy" → "MA". */
function ReciterTile({ reciter }: { reciter: Reciter }) {
  // Drop a style note such as " (Mujawwad)", then split on spaces and hyphens.
  const words = (reciter.name.split(" (")[0] ?? "").split(/[ -]+/)
  const initials = `${words[0]?.[0] ?? ""}${words.at(-1)?.[0] ?? ""}`
  return <PickerTile className="font-sans">{initials}</PickerTile>
}

/** Reciters for the picker, each with initials and the name in Arabic (searchable too). */
const reciterGroups: PickerGroup[] = [
  {
    key: "reciters",
    options: reciters.map((reciter) => ({
      value: reciter.id,
      label: reciter.name,
      native: { text: reciter.nameAr, lang: "ar" },
      tile: <ReciterTile reciter={reciter} />,
    })),
  },
]

const sizeLabels: Record<ArabicSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "Extra large",
}

/** Side panel with the reader preferences; every change applies immediately and is saved. */
export function ReaderSettings() {
  const [open, setOpen] = useState(false)
  const { settings, updateSettings } = useReader()
  // The editions list is only needed once the panel has been opened.
  const editions = useEditions(open)
  const ids = {
    arabic: useId(),
    translation: useId(),
    show: useId(),
    size: useId(),
    reciter: useId(),
  }
  const loading = editions.status === "loading" || editions.status === "idle"
  const translations = useMemo(() => translationEditions(editions.editions), [editions.editions])
  const scripts = useMemo(() => arabicEditions(editions.editions), [editions.editions])
  const scriptGroups = useMemo<PickerGroup[]>(
    () => [
      {
        key: "scripts",
        options: scripts.map((edition) => ({
          value: edition.identifier,
          label: arabicScriptLabel(edition),
          description: ARABIC_SCRIPT_NOTES[edition.identifier],
        })),
      },
    ],
    [scripts]
  )
  const script = scripts.find((e) => e.identifier === settings.arabicEdition)
  const reciter = getReciter(settings.reciter)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Reader settings" title="Reader settings">
          <Settings2 />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reader settings</SheetTitle>
          <SheetDescription>
            Saved in this browser and used across the site: surahs, single ayahs and audio.
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor={ids.arabic} className="text-sm font-medium">
              Arabic script
            </label>
            <Picker
              id={ids.arabic}
              value={settings.arabicEdition}
              groups={scriptGroups}
              loading={loading}
              defaultValue={DEFAULT_ARABIC_EDITION}
              onChange={(arabicEdition) => updateSettings({ arabicEdition })}
              current={{
                tile: <ScriptTile />,
                label: script
                  ? arabicScriptLabel(script)
                  : settings.arabicEdition === DEFAULT_ARABIC_EDITION
                    ? "Simple"
                    : settings.arabicEdition,
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor={ids.translation} className="text-sm font-medium">
              Translation
            </label>
            <EditionPicker
              id={ids.translation}
              value={settings.translationEdition}
              editions={translations}
              loading={loading}
              defaultValue={DEFAULT_TRANSLATION_EDITION}
              knownNames={knownTranslations}
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
              onValueChange={(value) =>
                value && updateSettings({ arabicSize: value as ArabicSize })
              }
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
            <Picker
              id={ids.reciter}
              value={reciter.id}
              groups={reciterGroups}
              defaultValue={DEFAULT_RECITER}
              searchPlaceholder="Search reciters, in English or Arabic"
              emptyText="No reciter by that name."
              onChange={(id) => updateSettings({ reciter: id })}
              current={{ tile: <ReciterTile reciter={reciter} />, label: reciter.name }}
            />
          </div>
        </SheetBody>

        <SheetFooter>
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => updateSettings(defaultReaderSettings)}
          >
            <RotateCcw />
            Reset to defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
