import { initWasm, Resvg } from "@resvg/resvg-wasm"
import type { ReactElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"

let ready: Promise<void> | undefined

/** Loads the resvg WebAssembly module once. */
function initResvg() {
  ready ??= (async () => {
    const wasm = await Bun.file(Bun.resolveSync("@resvg/resvg-wasm/index_bg.wasm", import.meta.dir))
    await initWasm(await wasm.arrayBuffer())
  })()
  return ready
}

/** Rasterises an SVG string to a PNG of the given width. */
export async function svgToPng(svg: string, width: number): Promise<Uint8Array> {
  await initResvg()
  return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng()
}

/**
 * Renders a React SVG element to standalone markup. React's `useId` values are swapped for
 * short ASCII ids so the file is tidy and safe in every SVG consumer.
 */
export function renderSvg(element: ReactElement): string {
  const markup = renderToStaticMarkup(element)
  const prefixes = [
    ...new Set([...markup.matchAll(/id="([^"]+?)-[a-z]+"/g)].map((m) => m[1] ?? "")),
  ]
  return prefixes.reduce((svg, prefix, index) => svg.replaceAll(prefix, `lm${index}`), markup)
}

export const svgDataUri = (svg: string) =>
  `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`
