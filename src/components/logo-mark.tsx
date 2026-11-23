import { type SVGProps, useId } from "react"

/**
 * The ILMIYAH mark: an open book inside an eight-point khatam star, gold on an emerald tile.
 *
 * This component is the single source of truth for the logo. `scripts/generate-icons.tsx`
 * renders it to the favicon and app icons, and the OG image script embeds it, so edit it
 * here only.
 */

/** Eight-point star on a 64×64 grid: outer radius 24, inner radius 16.3. */
const STAR =
  "M32 8L38.25 16.92L48.97 15.03L47.08 25.75L56 32L47.08 38.25L48.97 48.97L38.25 47.08L32 56L25.75 47.08L15.03 48.97L16.92 38.25L8 32L16.92 25.75L15.03 15.03L25.75 16.92Z"
/** Open book: two pages curving up from the spine. */
const LEFT_PAGE = "M31 26.6C28 24.9 24.6 24.4 21 24.9V38.6C24.6 38.2 28 38.8 31 40.6Z"
const RIGHT_PAGE = "M33 26.6C36 24.9 39.4 24.4 43 24.9V38.6C39.4 38.2 36 38.8 33 40.6Z"

export const brandColors = {
  /** Tile gradient, top-left to bottom-right. */
  tileFrom: "#16a06c",
  tileTo: "#03432f",
  /** Star gradient. */
  starFrom: "#fbe08a",
  starTo: "#d9a21b",
} as const

interface LogoMarkProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  /**
   * `tile`: rounded tile on a transparent background (UI, favicons).
   * `full-bleed`: square background with the glyph inset into the safe zone
   * (Apple touch icon and maskable PWA icon, which the OS masks itself).
   */
  variant?: "tile" | "full-bleed"
  /** Accessible name; omit when the mark is decorative. */
  title?: string
}

export function LogoMark({ variant = "tile", title, ...props }: LogoMarkProps) {
  const id = useId()
  const tile = `${id}-tile`
  const star = `${id}-star`
  const gloss = `${id}-gloss`
  const isFullBleed = variant === "full-bleed"
  // Maskable icons keep their content within the central 80% circle.
  const glyph = isFullBleed ? "translate(32 32) scale(0.74) translate(-32 -32)" : undefined

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: titled when `title` is set, aria-hidden otherwise.
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={tile} x1="6" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={brandColors.tileFrom} />
          <stop offset="1" stopColor={brandColors.tileTo} />
        </linearGradient>
        <linearGradient id={star} x1="14" y1="10" x2="50" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={brandColors.starFrom} />
          <stop offset="1" stopColor={brandColors.starTo} />
        </linearGradient>
        <linearGradient id={gloss} x1="32" y1="2" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {isFullBleed ? (
        <rect width="64" height="64" fill={`url(#${tile})`} />
      ) : (
        <>
          <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${tile})`} />
          <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${gloss})`} />
          <rect
            x="2.75"
            y="2.75"
            width="58.5"
            height="58.5"
            rx="15.25"
            fill="none"
            stroke="#fff"
            strokeOpacity="0.16"
            strokeWidth="1.5"
          />
        </>
      )}
      <g transform={glyph}>
        <path
          d={STAR}
          fill={`url(#${star})`}
          stroke={`url(#${star})`}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d={LEFT_PAGE} fill={brandColors.tileTo} />
        <path d={RIGHT_PAGE} fill={brandColors.tileTo} />
      </g>
    </svg>
  )
}
