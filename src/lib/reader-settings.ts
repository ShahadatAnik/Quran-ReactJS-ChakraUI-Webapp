import { getReciter } from "@/lib/audio"
import {
  DEFAULT_ARABIC_EDITION,
  DEFAULT_RECITER,
  DEFAULT_TRANSLATION_EDITION,
} from "@/lib/editions"
import { getSurah, isAyahOf } from "@/lib/surahs"

export const ARABIC_SIZES = ["sm", "md", "lg", "xl"] as const
export type ArabicSize = (typeof ARABIC_SIZES)[number]

export interface ReaderSettings {
  arabicEdition: string
  translationEdition: string
  showTranslation: boolean
  arabicSize: ArabicSize
  reciter: string
}

export const defaultReaderSettings: ReaderSettings = {
  arabicEdition: DEFAULT_ARABIC_EDITION,
  translationEdition: DEFAULT_TRANSLATION_EDITION,
  showTranslation: true,
  arabicSize: "md",
  reciter: DEFAULT_RECITER,
}

const EDITION_ID = /^[a-z]{2,3}\.[a-z0-9-]+$|^quran-[a-z0-9-]+$/

/**
 * Validates settings read from localStorage field by field: anything missing, malformed or
 * from an older version falls back to its default instead of breaking the reader.
 */
export function parseReaderSettings(value: unknown): ReaderSettings {
  const v = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>
  const edition = (x: unknown, fallback: string) =>
    typeof x === "string" && EDITION_ID.test(x) ? x : fallback
  return {
    arabicEdition: edition(v.arabicEdition, defaultReaderSettings.arabicEdition),
    translationEdition: edition(v.translationEdition, defaultReaderSettings.translationEdition),
    showTranslation:
      typeof v.showTranslation === "boolean"
        ? v.showTranslation
        : defaultReaderSettings.showTranslation,
    arabicSize: ARABIC_SIZES.includes(v.arabicSize as ArabicSize)
      ? (v.arabicSize as ArabicSize)
      : defaultReaderSettings.arabicSize,
    reciter:
      typeof v.reciter === "string" ? getReciter(v.reciter).id : defaultReaderSettings.reciter,
  }
}

/**
 * The settings that differ from the defaults: what gets saved. Storing only the reader's own
 * choices means a later change of default (e.g. the Arabic script) reaches everyone who
 * never picked something else, instead of being pinned to the old default in storage.
 */
export function settingsOverrides(settings: ReaderSettings): Partial<ReaderSettings> {
  return Object.fromEntries(
    Object.entries(settings).filter(
      ([key, value]) => defaultReaderSettings[key as keyof ReaderSettings] !== value
    )
  ) as Partial<ReaderSettings>
}

export interface LastRead {
  surah: number
  ayah: number
}

/** Validates a stored last-read position; null when there is none or it is invalid. */
export function parseLastRead(value: unknown): LastRead | null {
  const v = value as Partial<LastRead> | null
  if (!v || typeof v.surah !== "number" || typeof v.ayah !== "number") return null
  return isAyahOf(v.surah, v.ayah) ? { surah: v.surah, ayah: v.ayah } : null
}

/** How far through a surah a position is, from 0 to 100. */
export function surahProgress({ surah, ayah }: LastRead): number {
  const total = getSurah(surah)?.ayahs ?? 0
  return total ? Math.round((ayah / total) * 100) : 0
}
