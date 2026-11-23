/**
 * Generates the favicon and app icons in public/ from the <LogoMark> component.
 * Run after changing the logo: `bun run generate:icons`. The output is committed.
 * Pass `--preview <dir>` to also write enlarged previews of the small sizes for review.
 */
import { join } from "node:path"
import { LogoMark } from "../src/components/logo-mark"
import { site } from "../src/lib/site"
import { renderSvg, svgToPng } from "./lib/render"

const publicDir = join(import.meta.dir, "..", "public")

const tile = renderSvg(<LogoMark title={site.name} />)
const fullBleed = renderSvg(<LogoMark variant="full-bleed" />)

/** Packs PNG images into a .ico file (PNG-compressed entries, supported since Windows Vista). */
function toIco(images: { size: number; png: Uint8Array }[]): Uint8Array {
  const header = 6
  const entry = 16
  let offset = header + entry * images.length
  const total = offset + images.reduce((sum, image) => sum + image.png.byteLength, 0)
  const buffer = new Uint8Array(total)
  const view = new DataView(buffer.buffer)
  view.setUint16(2, 1, true) // type: icon
  view.setUint16(4, images.length, true)
  images.forEach(({ size, png }, index) => {
    const at = header + entry * index
    view.setUint8(at, size >= 256 ? 0 : size)
    view.setUint8(at + 1, size >= 256 ? 0 : size)
    view.setUint16(at + 4, 1, true) // colour planes
    view.setUint16(at + 6, 32, true) // bits per pixel
    view.setUint32(at + 8, png.byteLength, true)
    view.setUint32(at + 12, offset, true)
    buffer.set(png, offset)
    offset += png.byteLength
  })
  return buffer
}

const outputs: [file: string, data: string | Uint8Array][] = [
  ["favicon.svg", `${tile}\n`],
  [
    "favicon.ico",
    toIco(
      await Promise.all(
        [16, 32, 48].map(async (size) => ({ size, png: await svgToPng(tile, size) }))
      )
    ),
  ],
  // iOS masks the touch icon itself and fills transparency with black, so it must be full-bleed.
  ["apple-touch-icon.png", await svgToPng(fullBleed, 180)],
  ["icon-192.png", await svgToPng(tile, 192)],
  ["icon-512.png", await svgToPng(tile, 512)],
  ["icon-maskable-512.png", await svgToPng(fullBleed, 512)],
]

for (const [file, data] of outputs) {
  await Bun.write(join(publicDir, file), data)
  console.log(`public/${file}`)
}

const previewIndex = process.argv.indexOf("--preview")
const previewDir = previewIndex === -1 ? undefined : process.argv[previewIndex + 1]
if (previewDir) {
  for (const size of [16, 32, 48]) {
    await Bun.write(join(previewDir, `icon-${size}.png`), await svgToPng(tile, size))
  }
  await Bun.write(join(previewDir, "icon-512.png"), await svgToPng(tile, 512))
  await Bun.write(join(previewDir, "maskable-512.png"), await svgToPng(fullBleed, 512))
  console.log(`previews in ${previewDir}`)
}
