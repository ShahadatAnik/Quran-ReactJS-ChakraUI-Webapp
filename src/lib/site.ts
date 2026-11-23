export const site = {
  name: "ILMIYAH",
  shortName: "ILMIYAH",
  /** Bangla name, shown in the hero. */
  nameBn: "ইলমিয়াহ",
  tagline: "A daily dose of Islamic knowledge",
  /** Title of the home page; other pages use "<page title> | <name>". */
  homeTitle: "ILMIYAH: Quran in Arabic & Bangla with Audio",
  description:
    "Read all 114 surahs of the Quran in Arabic with Bangla translation and recitation audio, search the Quran in any language, and read Bangla Islamic articles.",
  url: "https://ilmiyah.netlify.app",
  locale: "en_US",
  author: {
    name: "Shahadat Anik",
    url: "https://shahadatanik.github.io/",
  },
  repository: "https://github.com/ShahadatAnik/Quran-ReactJS-ChakraUI-Webapp",
  social: [
    { label: "Website", href: "https://shahadatanik.github.io/" },
    { label: "Facebook", href: "https://www.facebook.com/md.shahadat.anik/" },
    { label: "GitHub", href: "https://github.com/ShahadatAnik" },
    { label: "YouTube", href: "https://www.youtube.com/@ShahadatAnik" },
  ],
  /** Browser UI colour per theme; matches the page background tokens in styles.css. */
  themeColor: { light: "#fcfaf4", dark: "#07110d" },
  /** Brand colours, used where a single colour is needed (manifest, OG images, icons). */
  brand: {
    emerald: "#118659",
    emeraldDeep: "#03432f",
    gold: "#f5cc58",
    goldDeep: "#b37903",
  },
  /** Data sources credited in the footer and on the reader pages. */
  sources: {
    text: { label: "AlQuran Cloud", href: "https://alquran.cloud/" },
    audio: { label: "Islamic Network CDN", href: "https://islamic.network/" },
    names: { label: "Quran.com", href: "https://quran.com/" },
  },
} as const

/** Prefix for every localStorage key the app writes. */
export const STORAGE_PREFIX = "ilmiyah:"
