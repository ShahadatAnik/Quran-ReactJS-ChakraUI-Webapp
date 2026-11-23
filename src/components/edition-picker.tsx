import { useMemo } from "react"
import { Picker, type PickerGroup, PickerTile } from "@/components/picker"
import {
  type Edition,
  editionName,
  groupByLanguage,
  languageName,
  languageOfId,
} from "@/lib/editions"

/** The language as a short code in a tile ("BN"), used instead of a flag: languages aren't countries. */
export const LanguageBadge = ({ code }: { code: string }) => (
  <PickerTile>{code.slice(0, 3)}</PickerTile>
)

interface EditionPickerProps {
  id: string
  value: string
  editions: Edition[]
  onChange: (identifier: string) => void
  loading: boolean
  /** Edition marked "Default" in the list. */
  defaultValue?: string
  /** Names for editions shown before the list has loaded (the prerendered defaults). */
  knownNames?: Record<string, string>
  placeholder?: string
}

/**
 * Searchable edition picker grouped by language, each group headed by its code, English and
 * native name. Type a language ("urdu", "اردو") or a translator to narrow the list.
 */
export function EditionPicker({
  id,
  value,
  editions,
  onChange,
  loading,
  defaultValue,
  knownNames = {},
  placeholder = "Search language or translator",
}: EditionPickerProps) {
  const groups = useMemo<PickerGroup[]>(
    () =>
      groupByLanguage(editions).map((group) => ({
        key: group.code,
        heading: (
          <span className="flex items-center gap-2">
            <LanguageBadge code={group.code} />
            <span className="font-medium text-foreground">{group.name}</span>
            {group.native ? (
              <span lang={group.code} className="truncate">
                {group.native}
              </span>
            ) : null}
          </span>
        ),
        options: group.editions.map((edition) => ({
          value: edition.identifier,
          label: editionName(edition),
          keywords: [group.name, group.native ?? "", group.code],
        })),
      })),
    [editions]
  )
  const selected = editions.find((e) => e.identifier === value)
  const code = selected?.language ?? languageOfId(value)

  return (
    <Picker
      id={id}
      value={value}
      groups={groups}
      onChange={onChange}
      loading={loading}
      defaultValue={defaultValue}
      searchPlaceholder={placeholder}
      emptyText="Nothing matches. Try a language or a name."
      current={{
        tile: <LanguageBadge code={code} />,
        label: selected ? editionName(selected) : (knownNames[value] ?? value),
        hint: languageName(code),
      }}
    />
  )
}
