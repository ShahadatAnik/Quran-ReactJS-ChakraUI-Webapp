import { useId } from "react"
import { Picker, type PickerGroup } from "@/components/picker"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { updatePrayerSettings, usePrayerState } from "@/hooks/use-prayer"
import {
  ASR_LABELS,
  type AsrMadhab,
  defaultPrayerSettings,
  METHODS,
  type MethodId,
  methodOf,
} from "@/lib/prayer-settings"

const methodGroups: PickerGroup[] = [
  {
    key: "methods",
    options: METHODS.map((m) => ({ value: m.id, label: m.label, description: m.description })),
  },
]

/** Calculation method and Asr; on the prayer-times page and in Reader settings. */
export function PrayerSettingsFields() {
  const state = usePrayerState()
  const settings = state?.settings ?? defaultPrayerSettings
  const ids = { method: useId(), asr: useId() }
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor={ids.method} className="text-sm font-medium">
          Calculation method
        </label>
        <Picker
          id={ids.method}
          value={settings.method}
          groups={methodGroups}
          defaultValue={defaultPrayerSettings.method}
          searchPlaceholder="Search methods or countries"
          emptyText="No method by that name."
          onChange={(method) => updatePrayerSettings({ method: method as MethodId })}
          current={{ label: methodOf(settings.method).label }}
        />
      </div>
      <div className="space-y-1.5">
        <p id={ids.asr} className="text-sm font-medium">
          Asr time
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          aria-labelledby={ids.asr}
          value={settings.asr}
          onValueChange={(value) => value && updatePrayerSettings({ asr: value as AsrMadhab })}
          className="w-full"
        >
          {(Object.keys(ASR_LABELS) as AsrMadhab[]).map((madhab) => (
            <ToggleGroupItem
              key={madhab}
              value={madhab}
              title={ASR_LABELS[madhab].description}
              className="h-9 flex-1"
            >
              {ASR_LABELS[madhab].label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <p className="text-xs text-muted-foreground">{ASR_LABELS[settings.asr].description}.</p>
      </div>
    </div>
  )
}
