import { expect, test } from "bun:test"
import { commandFilter } from "@/lib/command-filter"

test("every term must match the label or keywords", () => {
  expect(commandFilter("Surah Al-Baqarah", "baqarah")).toBe(1)
  expect(commandFilter("Surah Al-Baqarah", "baqarah cow", ["The Cow"])).toBe(0.5)
  expect(commandFilter("Surah Al-Baqarah", "baqarah fish", ["The Cow"])).toBe(0)
})

test("label matches rank above keyword-only matches", () => {
  expect(commandFilter("Surah Al-Kahf", "kahf", ["The Cave"])).toBe(1)
  expect(commandFilter("Surah Al-Kahf", "cave", ["The Cave"])).toBe(0.5)
})

test("matches transliteration variants", () => {
  expect(commandFilter("Surah Ya-Sin", "yasin")).toBe(1)
  expect(commandFilter("Surah Al-Fatihah", "faatiha")).toBe(1)
})

test("matches Bangla and Arabic keywords", () => {
  expect(commandFilter("Surah Al-Fatihah", "সূচনা", ["সূচনা", "الفاتحة"])).toBe(0.5)
  expect(commandFilter("Surah Al-Fatihah", "الفاتحة", ["সূচনা", "الفاتحة"])).toBe(0.5)
})

test("an empty search keeps everything", () => {
  expect(commandFilter("Anything", "  ")).toBe(1)
})

test("short queries don't fuzzy-match unrelated items", () => {
  expect(commandFilter("Writers", "sx")).toBe(0)
})

test("Bangla keywords match in either Unicode encoding", () => {
  expect(commandFilter("x", "দ\u09DFা", ["দ\u09AF\u09BCা"])).toBe(0.5)
})
