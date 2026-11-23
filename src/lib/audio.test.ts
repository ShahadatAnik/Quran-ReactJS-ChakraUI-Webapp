import { describe, expect, test } from "bun:test"
import { ayahAudioUrl, defaultReciter, formatTime, getReciter, reciters } from "@/lib/audio"

describe("ayahAudioUrl", () => {
  test("uses the global ayah number and the reciter's bitrate", () => {
    expect(ayahAudioUrl(2, 255)).toBe(
      "https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3"
    )
    expect(ayahAudioUrl(1, 1, "ar.abdulsamad")).toBe(
      "https://cdn.islamic.network/quran/audio/64/ar.abdulsamad/1.mp3"
    )
  })

  test("falls back to the default reciter for unknown ids", () => {
    expect(ayahAudioUrl(114, 6, "nope")).toBe(
      "https://cdn.islamic.network/quran/audio/128/ar.alafasy/6236.mp3"
    )
  })

  test("contains no whitespace (the old reader embedded newlines in the src)", () => {
    expect(ayahAudioUrl(18, 10)).not.toMatch(/\s/)
  })

  test("throws for an ayah that doesn't exist", () => {
    expect(() => ayahAudioUrl(1, 8)).toThrow(RangeError)
  })
})

test("reciters have unique ids and the default exists", () => {
  expect(new Set(reciters.map((r) => r.id)).size).toBe(reciters.length)
  expect(defaultReciter.id).toBe("ar.alafasy")
  expect(getReciter("ar.husary").name).toContain("Husary")
})

test.each([
  [0, "0:00"],
  [5.9, "0:05"],
  [65, "1:05"],
  [600, "10:00"],
  [Number.NaN, "0:00"],
  [Number.POSITIVE_INFINITY, "0:00"],
  [-3, "0:00"],
])("formatTime(%p) = %p", (input, expected) => {
  expect(formatTime(input)).toBe(expected)
})
