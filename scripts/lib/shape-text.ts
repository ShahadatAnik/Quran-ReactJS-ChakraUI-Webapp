/**
 * Bangla and Arabic text for the OG images, shaped by HarfBuzz and drawn as SVG paths.
 *
 * Satori can't shape complex scripts, and resvg's built-in shaper mis-orders Bengali
 * pre-base vowel signs (e.g. "নের" renders wrongly), so these scripts are shaped here with
 * the real HarfBuzz (harfbuzzjs) and embedded in the card as SVG images of known size.
 */
import { Blob, Face, Font, Buffer as HbBuffer, shape } from "harfbuzzjs"
import { decompress } from "wawoff2"

export interface ShapingFont {
  font: Font
  upem: number
  ascender: number
  descender: number
  /** Code points the font has glyphs for. */
  covers: Set<number>
}

/**
 * Fonts tried in order for each character, e.g. the Bengali subset of a family, then its
 * Latin subset for punctuation and digits.
 */
export type FontStack = readonly [ShapingFont, ...ShapingFont[]]

/** Loads a WOFF2 font from a package path for shaping. */
export async function loadShapingFont(specifier: string): Promise<ShapingFont> {
  const woff2 = await Bun.file(Bun.resolveSync(specifier, import.meta.dir)).bytes()
  // Copy out of the WebAssembly memory view so the buffer holds only the font bytes.
  const ttf = (await decompress(woff2)).slice()
  const face = new Face(new Blob(ttf.buffer))
  const font = new Font(face)
  const { ascender, descender } = font.hExtents()
  return { font, upem: face.upem, ascender, descender, covers: new Set(face.collectUnicodes()) }
}

interface Glyph {
  path: string
  /** Pixel position of the glyph origin, y down from the baseline. */
  x: number
  y: number
  scale: number
}

/** Splits text into runs that one font of the stack can render. */
function itemize(text: string, stack: FontStack): { text: string; font: ShapingFont }[] {
  const runs: { text: string; font: ShapingFont }[] = []
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0
    const last = runs.at(-1)
    // Spaces and joiners stay with the current run so shaping context isn't broken.
    const font =
      /\s|\u200C|\u200D/.test(char) && last
        ? last.font
        : (stack.find((f) => f.covers.has(code)) ?? stack[0])
    if (last && last.font === font) last.text += char
    else runs.push({ text: char, font })
  }
  return runs
}

/** Shapes one line at `size` px; glyph positions are in pixels, plus the total advance. */
function shapeLine(text: string, stack: FontStack, size: number) {
  const glyphs: Glyph[] = []
  let x = 0
  const runs = itemize(text, stack)
  // A right-to-left line is drawn with its runs in reverse (visual) order.
  const rtl = /[֐-ࣿ]/.test(text)
  for (const run of rtl ? runs.reverse() : runs) {
    const scale = size / run.font.upem
    const buffer = new HbBuffer()
    buffer.addText(run.text)
    buffer.guessSegmentProperties()
    shape(run.font.font, buffer)
    // Glyphs come out in visual order (also for right-to-left runs), so advance left to right.
    for (const glyph of buffer.getGlyphInfosAndPositions()) {
      const path = run.font.font.glyphToPath(glyph.codepoint)
      if (path) {
        glyphs.push({
          path,
          x: x + (glyph.xOffset ?? 0) * scale,
          y: -(glyph.yOffset ?? 0) * scale,
          scale,
        })
      }
      x += (glyph.xAdvance ?? 0) * scale
    }
  }
  return { glyphs, width: x }
}

/** Width of `text` in pixels at `size`. */
export const measure = (text: string, stack: FontStack, size: number) =>
  shapeLine(text, stack, size).width

/** Greedy word wrap to `maxWidth`; a final line that would overflow `maxLines` is ellipsised. */
export function wrap(
  text: string,
  stack: FontStack,
  size: number,
  maxWidth: number,
  maxLines = Number.POSITIVE_INFINITY
): string[] {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word
    if (line && measure(candidate, stack, size) > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  if (lines.length <= maxLines) return lines

  const kept = lines.slice(0, maxLines)
  let last = kept[maxLines - 1] ?? ""
  while (last.includes(" ") && measure(`${last} …`, stack, size) > maxWidth) {
    last = last.slice(0, last.lastIndexOf(" "))
  }
  kept[maxLines - 1] = `${last} …`
  return kept
}

export interface ShapedText {
  /** Standalone SVG document. */
  svg: string
  width: number
  height: number
}

/**
 * Renders lines of text as an SVG of paths. Lines are left-aligned, or right-aligned for
 * `align: "end"` (Arabic). Width is the widest line; height is lines × lineHeight.
 */
export function shapeText(
  lines: readonly string[],
  stack: FontStack,
  options: { size: number; lineHeight: number; color: string; align?: "start" | "end" }
): ShapedText {
  const { size, lineHeight, color, align = "start" } = options
  const shaped = lines.map((line) => shapeLine(line, stack, size))
  const width = Math.ceil(Math.max(0, ...shaped.map((s) => s.width))) + 2
  const height = Math.ceil(lines.length * lineHeight)
  // Centre the primary font's ascender–descender box vertically in each line box.
  const { ascender, descender, upem } = stack[0]
  const glyphBox = ((ascender - descender) * size) / upem
  const baselineOffset = (lineHeight - glyphBox) / 2 + (ascender * size) / upem

  const paths = shaped.flatMap((line, index) => {
    const lineX = align === "end" ? width - 1 - line.width : 1
    const baseline = index * lineHeight + baselineOffset
    return line.glyphs.map(
      (g) =>
        `<path transform="translate(${(lineX + g.x).toFixed(2)} ${(baseline + g.y).toFixed(2)}) scale(${g.scale.toFixed(5)} ${(-g.scale).toFixed(5)})" d="${g.path}"/>`
    )
  })

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g fill="${color}">${paths.join("")}</g></svg>`,
    width,
    height,
  }
}
