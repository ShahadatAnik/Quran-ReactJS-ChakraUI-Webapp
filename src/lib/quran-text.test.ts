import { describe, expect, test } from "bun:test"
import { hasBismillahHeader, splitBismillah, stripBom } from "@/lib/quran-text"

const BISMILLAH = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"

describe("splitBismillah", () => {
  test("splits the Bismillah off the first ayah of a surah", () => {
    expect(splitBismillah(2, 1, `${BISMILLAH} الٓمٓ`)).toEqual({ bismillah: BISMILLAH, text: "الٓمٓ" })
  })

  test("handles the shadda spelling used in surahs 95 and 97", () => {
    const variant = "بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
    const result = splitBismillah(95, 1, `${variant} وَٱلتِّينِ وَٱلزَّيْتُونِ`)
    expect(result.bismillah).toBe(variant)
    expect(result.text).toBe("وَٱلتِّينِ وَٱلزَّيْتُونِ")
  })

  test("keeps Al-Fatihah 1:1, which is the Bismillah itself, and strips its BOM", () => {
    expect(splitBismillah(1, 1, `\uFEFF${BISMILLAH}`)).toEqual({ bismillah: null, text: BISMILLAH })
  })

  test("leaves At-Tawbah untouched", () => {
    const text = "بَرَآءَةٌۭ مِّنَ ٱللَّهِ وَرَسُولِهِۦٓ"
    expect(splitBismillah(9, 1, text)).toEqual({ bismillah: null, text })
  })

  test("only touches the first ayah (27:30 quotes the Bismillah mid-surah)", () => {
    const text = `إِنَّهُۥ مِن سُلَيْمَٰنَ وَإِنَّهُۥ ${BISMILLAH}`
    expect(splitBismillah(27, 30, text).bismillah).toBeNull()
  })

  test("does not split text that merely starts with similar words", () => {
    const text = "بِسْمِ ٱللَّهِ مَجْر۪ىٰهَا وَمُرْسَىٰهَآ"
    expect(splitBismillah(11, 1, text)).toEqual({ bismillah: null, text })
  })

  test("does not empty an ayah that is only the Bismillah", () => {
    expect(splitBismillah(2, 1, BISMILLAH)).toEqual({ bismillah: null, text: BISMILLAH })
  })

  test("leaves translations without a Bismillah alone", () => {
    expect(splitBismillah(2, 1, "আলিফ লাম মীম।")).toEqual({ bismillah: null, text: "আলিফ লাম মীম।" })
  })
})

test("hasBismillahHeader", () => {
  expect(hasBismillahHeader(1)).toBe(false)
  expect(hasBismillahHeader(9)).toBe(false)
  expect(hasBismillahHeader(2)).toBe(true)
  expect(hasBismillahHeader(114)).toBe(true)
})

test("stripBom", () => {
  expect(stripBom("\uFEFFabc")).toBe("abc")
  expect(stripBom("abc\uFEFF")).toBe("abc\uFEFF")
})
