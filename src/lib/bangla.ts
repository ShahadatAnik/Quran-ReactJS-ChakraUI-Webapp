/** Bangla number and date formatting, done by hand so server and browser output match. */

const DIGITS = "০১২৩৪৫৬৭৮৯"

export const toBanglaDigits = (value: number | string) =>
  String(value).replace(/\d/g, (d) => DIGITS[Number(d)] ?? d)

const MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
]

/** "2022-12-04" → "৪ ডিসেম্বর, ২০২২". Throws for anything but a valid ISO date. */
export function formatBanglaDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  const [year, month, day] = match ? [match[1], Number(match[2]), Number(match[3])] : []
  const date = match ? new Date(`${iso}T00:00:00Z`) : undefined
  if (!date || Number.isNaN(date.getTime()) || date.getUTCDate() !== day || !month || !year) {
    throw new RangeError(`Invalid date: ${iso}`)
  }
  return `${toBanglaDigits(day)} ${MONTHS[month - 1]}, ${toBanglaDigits(year)}`
}
