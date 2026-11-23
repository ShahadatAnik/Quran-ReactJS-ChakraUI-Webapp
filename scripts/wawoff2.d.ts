declare module "wawoff2" {
  /** Decodes a WOFF2 font to TrueType/OpenType. */
  export function decompress(input: Uint8Array): Promise<Uint8Array>
  /** Encodes a TrueType/OpenType font as WOFF2. */
  export function compress(input: Uint8Array): Promise<Uint8Array>
}
