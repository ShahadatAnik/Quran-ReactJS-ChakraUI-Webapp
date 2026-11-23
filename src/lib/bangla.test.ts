import { describe, expect, test } from "bun:test"
import { formatBanglaDate, toBanglaDigits } from "@/lib/bangla"

test("toBanglaDigits", () => {
  expect(toBanglaDigits(255)).toBe("২৫৫")
  expect(toBanglaDigits("2:255")).toBe("২:২৫৫")
  expect(toBanglaDigits(0)).toBe("০")
})

describe("formatBanglaDate", () => {
  test("formats ISO dates", () => {
    expect(formatBanglaDate("2022-12-04")).toBe("৪ ডিসেম্বর, ২০২২")
    expect(formatBanglaDate("2022-11-12")).toBe("১২ নভেম্বর, ২০২২")
    expect(formatBanglaDate("2024-01-31")).toBe("৩১ জানুয়ারি, ২০২৪")
  })

  test.each(["2022-02-30", "2022-13-01", "04 December, 2022", "", "2022-1-4"])(
    "rejects %p",
    (input) => expect(() => formatBanglaDate(input)).toThrow(RangeError)
  )
})
