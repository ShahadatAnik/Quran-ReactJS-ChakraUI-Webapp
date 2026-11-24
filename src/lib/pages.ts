import type { LucideIcon } from "lucide-react"
import {
  BookOpen,
  BookOpenText,
  Clock,
  Feather,
  HandHeart,
  Hash,
  Newspaper,
  Search,
  UsersRound,
} from "lucide-react"
import { type Dua, duaCategory, duas } from "@/content/duas"
import { getPost, type Post, posts } from "@/content/posts"
import { getWriter } from "@/content/writers"
import { duaReference } from "@/lib/duas"
import { getSurah, type Surah, surahs } from "@/lib/surahs"

export type Section = "Quran" | "Prayer" | "Articles" | "About"
export const sections: readonly Section[] = ["Quran", "Prayer", "Articles", "About"]

export interface Faq {
  question: string
  answer: string
}

/** Typed link target for <Link {...page.link} />. */
export type PageLink =
  | { to: "/surah" | "/ayah" | "/duas" | "/prayer-times" | "/search" | "/blog" | "/writers" }
  | { to: "/surah/$number"; params: { number: string } }
  | { to: "/duas/$slug"; params: { slug: string } }
  | { to: "/blog/$slug"; params: { slug: string } }

interface BasePage {
  /** Absolute path; also the canonical URL path. */
  path: string
  link: PageLink
  title: string
  /** One line for cards and the command menu. */
  summary: string
  /** Longer description under the page heading. */
  description: string
  section: Section
  icon: LucideIcon
  /** Extra search terms for the command menu. */
  keywords: readonly string[]
  /** Search-friendly title without the site name (45 characters or fewer). */
  seoTitle: string
  /** Meta description, 140–160 characters. */
  metaDescription: string
  /** Language of the page's main content. */
  lang: "en" | "bn"
}

/** App pages and surah pages carry a how-to guide and FAQ (shown and as structured data). */
interface GuidedPage extends BasePage {
  howTo: readonly string[]
  faqs: readonly Faq[]
}

export interface AppPage extends GuidedPage {
  kind: "app"
}
export interface SurahPage extends GuidedPage {
  kind: "surah"
  surah: Surah
}
export interface PostPage extends BasePage {
  kind: "post"
  post: Post
}
export interface IndexPage extends BasePage {
  kind: "index"
}
export interface DuaPage extends GuidedPage {
  kind: "dua"
  dua: Dua
  surah: Surah
}

export type Page = AppPage | SurahPage | PostPage | IndexPage | DuaPage

export const SEO_TITLE_MAX = 45
export const META_DESCRIPTION_RANGE = [140, 160] as const

/** First candidate whose length fits; throws if none does, so tests catch bad templates. */
export function fitLength(candidates: readonly string[], min: number, max: number): string {
  const fit = candidates.find((c) => c.length >= min && c.length <= max)
  if (fit === undefined) {
    throw new Error(`No candidate is ${min}–${max} characters: ${JSON.stringify(candidates)}`)
  }
  return fit
}

// ---------- app pages ----------

const surahIndexPage: IndexPage = {
  kind: "index",
  path: "/surah",
  link: { to: "/surah" },
  title: "Surahs",
  summary: "All 114 surahs of the Quran, with Arabic and Bangla names.",
  description:
    "All 114 surahs of the Quran. Filter by name, meaning or number, then read any surah in Arabic with Bangla translation and audio.",
  section: "Quran",
  icon: BookOpen,
  keywords: ["quran", "surah list", "chapters", "index", "sura", "সূরা"],
  seoTitle: "All 114 Surahs of the Quran with Bangla",
  metaDescription:
    "Browse all 114 surahs of the Holy Quran with Arabic names, meanings and ayah counts. Read any surah in Arabic with Bangla translation and audio recitation.",
  lang: "en",
}

const ayahPage: AppPage = {
  kind: "app",
  path: "/ayah",
  link: { to: "/ayah" },
  title: "Find an Ayah",
  summary: "Jump to any ayah by surah and number, or type a reference like 2:255.",
  description:
    "Pick a surah and an ayah, or type a reference such as 2:255, to read that ayah in Arabic with its Bangla translation and listen to it.",
  section: "Quran",
  icon: Hash,
  keywords: ["verse", "ayat", "reference", "lookup", "আয়াত"],
  seoTitle: "Find Any Ayah of the Quran by Reference",
  metaDescription:
    "Look up any ayah of the Quran by surah and verse number, or a reference like 2:255. Read it in Arabic with Bangla translation, listen, and share a link to it.",
  lang: "en",
  howTo: [
    "Choose a surah from the first list, or type a reference such as 2:255 or 36:1 into the reference box.",
    "Choose the ayah number. The list only offers ayahs that exist in that surah.",
    "Read the ayah in Arabic with its Bangla translation, and press play to hear it recited.",
    "Copy the link to share the ayah, or open it in its surah to keep reading from there.",
  ],
  faqs: [
    {
      question: "What does a reference like 2:255 mean?",
      answer:
        "The first number is the surah and the second is the ayah within it, so 2:255 is the 255th ayah of Surah Al-Baqarah, known as Ayat al-Kursi. You can also type it with Bangla digits, such as ২:২৫৫.",
    },
    {
      question: "Can I share a link to a single ayah?",
      answer:
        "Yes. Every ayah has a permanent link such as /surah/2#ayah-255. Opening it scrolls straight to that ayah in its surah and highlights it.",
    },
    {
      question: "Which reciter and translation are used?",
      answer:
        "The Bangla translation is by Muhiuddin Khan and the default reciter is Mishary Rashid Alafasy. You can change both in Reader settings, the sliders icon at the top of every page.",
    },
  ],
}

const duasPage: IndexPage = {
  kind: "index",
  path: "/duas",
  link: { to: "/duas" },
  title: "Duas from the Quran",
  summary: "Duas and well-known ayahs from the Quran, such as Ayat al-Kursi.",
  description:
    "Duas from the Quran and well-known ayahs such as Ayat al-Kursi, each in Arabic with Bangla translation and audio, with its place in the Quran.",
  section: "Quran",
  icon: HandHeart,
  keywords: ["dua", "doa", "supplication", "দোয়া", "দুআ"],
  seoTitle: "Duas from the Quran in Arabic & Bangla",
  metaDescription:
    "Duas and well-known ayahs from the Quran, such as Ayat al-Kursi and the end of Al-Baqarah, in Arabic with Bangla translation and audio, with references.",
  lang: "en",
}

const prayerTimesPage: AppPage = {
  kind: "app",
  path: "/prayer-times",
  link: { to: "/prayer-times" },
  title: "Prayer times",
  summary: "Today's five prayer times for where you are, with a countdown and the Qibla.",
  description:
    "Fajr, Dhuhr, Asr, Maghrib and Isha for where you are, with a countdown to the next prayer, the week ahead and Qibla direction. Worked out in your browser.",
  section: "Prayer",
  icon: Clock,
  keywords: ["salah", "salat", "namaz", "waqt", "qibla", "fajr", "maghrib", "নামাজের সময়"],
  seoTitle: "Prayer Times Today for Your Location",
  metaDescription:
    "Today's prayer times for where you are: Fajr, Dhuhr, Asr, Maghrib and Isha, with a countdown, the week ahead and Qibla direction. Worked out in your browser.",
  lang: "en",
  howTo: [
    "Press Use my location and allow it when your browser asks, or search for your city by name.",
    "See today's six times, with the prayer whose time it is now outlined in gold and a countdown to the next one.",
    "Check the week ahead and the Qibla direction, measured in degrees from true north.",
    "Pick the calculation method and Asr time your community follows. The default is the Karachi method with Hanafi Asr, as published in Bangladesh.",
  ],
  faqs: [
    {
      question: "How are the prayer times calculated?",
      answer:
        "From your location and the date, using the position of the sun, with the open-source Adhan library. Each method sets the sun's angle below the horizon for Fajr and Isha; the default, the University of Islamic Sciences, Karachi, uses 18° for both.",
    },
    {
      question: "Is my location sent anywhere?",
      answer:
        "No. The times are calculated in your browser, and your location is saved only in this browser, rounded to about a kilometre. If you search for a city instead, only the name you type is sent to the Open-Meteo geocoding service to find it.",
    },
    {
      question: "Why are the times a few minutes different from my mosque?",
      answer:
        "Mosques often add a few minutes for caution, follow a different method, or publish the time of the congregation rather than the start of the prayer's time. The times here are when each prayer's time begins. Choose your community's method to match it.",
    },
    {
      question: "What is the difference between Hanafi and Shafi'i Asr?",
      answer:
        "Asr begins when an object's shadow is as long as the object (Shafi'i, Maliki and Hanbali), or twice as long (Hanafi), in each case on top of its shadow at midday. Hanafi Asr is therefore later, by around 40 minutes to over an hour.",
    },
    {
      question: "Is the Hijri date exact?",
      answer:
        "It comes from the Umm al-Qura calendar built into your browser. Months that begin with a local moon sighting, as in Bangladesh, can start a day later, so the date may differ by one day.",
    },
  ],
}

const searchPage: AppPage = {
  kind: "app",
  path: "/search",
  link: { to: "/search" },
  title: "Search the Quran",
  summary: "Find every ayah that contains a word, in Bangla, English or 40+ other languages.",
  description:
    "Search the whole Quran for a word or phrase in Bangla, Arabic, English or any of more than 40 translations. Results update as you type.",
  section: "Quran",
  icon: Search,
  keywords: ["find word", "keyword", "translation", "lookup", "খুঁজুন"],
  seoTitle: "Search the Quran in Bangla, English & More",
  metaDescription:
    "Search every ayah of the Quran for a word or phrase in Bangla, Arabic, English or 40+ other translations. Matches are highlighted and link to the full surah.",
  lang: "en",
  howTo: [
    "Pick the language and translation to search in. Bangla (Muhiuddin Khan) is selected by default.",
    "Type a word or phrase of at least two letters. Results appear as you type.",
    "Every match is highlighted in its ayah. Matches are grouped by surah, in Quran order.",
    "Select a result to open that ayah in its surah, with Arabic text and audio.",
  ],
  faqs: [
    {
      question: "Which languages can I search in?",
      answer:
        "Any plain-text edition offered by AlQuran Cloud: the Arabic text and translations in more than 40 languages, including Bangla, English, Urdu, Hindi, Indonesian and Turkish.",
    },
    {
      question: "Why don't I see any results?",
      answer:
        "The search matches the exact spelling used by the selected translation. Try a shorter word or a different spelling, or switch to another translation of the same language.",
    },
    {
      question: "Does the search work offline?",
      answer:
        "No. Searching sends your search term to the AlQuran Cloud API. Reading surahs works without it, because their text is part of this site.",
    },
  ],
}

const blogPage: IndexPage = {
  kind: "index",
  path: "/blog",
  link: { to: "/blog" },
  title: "Articles",
  summary: "Bangla articles on Islam, grounded in the Quran and authentic hadith.",
  description:
    "Bangla articles on Islamic knowledge: the virtues and wording of durood, women's rights in Islam, and more, each grounded in the Quran and authentic hadith.",
  section: "Articles",
  icon: Newspaper,
  keywords: ["blog", "bangla", "islamic articles", "lekha", "প্রবন্ধ"],
  seoTitle: "Bangla Islamic Articles",
  metaDescription:
    "Bangla Islamic articles grounded in the Quran and authentic hadith: the meaning, virtues and wording of durood, women's rights and dignity in Islam, and more.",
  lang: "en",
}

const writersPage: IndexPage = {
  kind: "index",
  path: "/writers",
  link: { to: "/writers" },
  title: "Writers",
  summary: "The writers and publications the articles come from.",
  description:
    "The articles on ILMIYAH are republished from these writers and publications. Read more of their work at the links below.",
  section: "About",
  icon: UsersRound,
  keywords: ["authors", "about", "nusus", "at-tahreek", "লেখক"],
  seoTitle: "Writers and Sources of ILMIYAH Articles",
  metaDescription:
    "Meet the writers behind the Bangla articles on ILMIYAH: Monthly At-Tahreek, Nusus and Dr. Khondokar Abdullah Jahangir, with links to read more of their work.",
  lang: "en",
}

// ---------- surah pages ----------

/** 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd". */
export function ordinal(n: number): string {
  const suffixes = ["th", "st", "nd", "rd"]
  const v = n % 100
  return `${n}${suffixes[(v - 20) % 10] ?? suffixes[v] ?? "th"}`
}

const juzText = (juz: readonly number[]) =>
  juz.length === 1 ? `juz ${juz[0]}` : `juz ${juz.slice(0, -1).join(", ")} and ${juz.at(-1)}`

function surahPageOf(surah: Surah): SurahPage {
  const { name, number, meaning, ayahs, revelation } = surah
  const ayahWord = ayahs === 1 ? "ayah" : "ayahs"
  const place = revelation === "Meccan" ? "Makkah" : "Madinah"
  return {
    kind: "surah",
    surah,
    path: `/surah/${number}`,
    link: { to: "/surah/$number", params: { number: String(number) } },
    title: `Surah ${name}`,
    summary: `${meaning} · ${ayahs} ${ayahWord} · ${revelation}`,
    description: `${meaning}. Surah ${number} of the Quran, ${revelation === "Meccan" ? "a Meccan" : "a Medinan"} surah of ${ayahs} ${ayahWord}, in Arabic with Bangla translation and audio.`,
    section: "Quran",
    icon: BookOpenText,
    keywords: [
      surah.altName,
      meaning,
      surah.meaningBn,
      surah.arabic,
      String(number),
      `sura ${number}`,
      revelation,
    ],
    seoTitle: fitLength(
      [
        `Surah ${name}: Arabic, Bangla & Audio`,
        `Surah ${name} in Arabic & Bangla`,
        `Surah ${name} with Bangla`,
        `Surah ${name}`,
      ],
      0,
      SEO_TITLE_MAX
    ),
    metaDescription: fitLength(
      [
        `Read Surah ${name} (${meaning}), a ${revelation} surah of ${ayahs} ${ayahWord}, in Arabic with Bangla translation and verse-by-verse audio recitation. Free, no ads.`,
        `Read Surah ${name} (${meaning}), a ${revelation} surah of ${ayahs} ${ayahWord}, in Arabic with Bangla translation and verse-by-verse audio. Free, no ads.`,
        `Read Surah ${name} (${meaning}), a ${revelation} surah of ${ayahs} ${ayahWord}, in Arabic with Bangla translation and audio recitation. Free, no ads.`,
        `Read Surah ${name} (${meaning}), ${ayahs} ${ayahWord}, in Arabic with Bangla translation and audio recitation. Free, with no ads or sign-up.`,
        `Surah ${name} (${meaning}): ${ayahs} ${ayahWord} in Arabic with Bangla translation and audio. Free and ad-free.`,
        `Read Surah ${name}, a ${revelation} surah of ${ayahs} ${ayahWord}, in Arabic with Bangla translation and verse-by-verse audio recitation by Mishary Alafasy. Free, no ads.`,
        `Read Surah ${name}, surah ${number} of the Quran: ${ayahs} ${ayahWord} revealed in ${place}, in Arabic with Bangla translation and verse-by-verse audio recitation. Free.`,
      ],
      ...META_DESCRIPTION_RANGE
    ),
    lang: "en",
    howTo: [
      `Read each of the ${ayahs} ${ayahWord} in Arabic, with the Bangla translation below it.`,
      `Press play on any ayah to hear it recited. Playback continues through the rest of Surah ${name}.`,
      "Open Reader settings (the sliders icon at the top of the page) to change the Arabic script, translation, reciter or text size.",
      `Use the link button on an ayah to copy its permanent link, such as /surah/${number}#ayah-1.`,
    ],
    faqs: [
      {
        question: `How many ayahs are in Surah ${name}?`,
        answer: `Surah ${name} has ${ayahs} ${ayahWord}. It is surah ${number} of the 114 surahs of the Quran.`,
      },
      {
        question: `Is Surah ${name} Meccan or Medinan?`,
        answer: `Surah ${name} is a ${revelation} surah, revealed in ${place}. It is ${ordinal(surah.revelationOrder)} in the traditional order of revelation.`,
      },
      {
        question: `What does the name ${name} mean?`,
        answer: `${name} (Arabic: ${surah.arabic}) means “${meaning}”. In Bangla, the name is translated as “${surah.meaningBn}”.`,
      },
      {
        question: `Which juz (para) is Surah ${name} in?`,
        answer: `Surah ${name} is in ${juzText(surah.juz)} of the Quran's 30 juz.`,
      },
    ],
  }
}

export const surahPages: readonly SurahPage[] = surahs.map(surahPageOf)

export const getSurahPage = (n: number) => surahPages[n - 1]

// ---------- dua pages ----------

function duaPageOf(dua: Dua): DuaPage {
  const surah = getSurah(dua.surah) as Surah
  const ref = duaReference(dua)
  const { title } = dua
  const count = dua.to - dua.from + 1
  const ayahWord = count === 1 ? "ayah" : "ayahs"
  const isSurah = count === surah.ayahs
  const from = isSurah ? "" : ` from Surah ${surah.name}`
  const place =
    count === 1
      ? `ayah ${dua.from} of Surah ${surah.name} (${ref})`
      : isSurah
        ? `the whole of Surah ${surah.name}, surah ${surah.number} of the Quran (${ref})`
        : `ayahs ${dua.from} to ${dua.to} of Surah ${surah.name} (${ref})`
  return {
    kind: "dua",
    dua,
    surah,
    path: `/duas/${dua.slug}`,
    link: { to: "/duas/$slug", params: { slug: dua.slug } },
    title,
    summary: `${surah.name} ${ref} · ${duaCategory(dua.category).title}`,
    description: `${title}${from} (${ref}), in Arabic with Bangla translation and audio recitation.`,
    section: "Quran",
    icon: HandHeart,
    keywords: [dua.titleBn, ...(dua.aliases ?? []), ref, surah.name, surah.arabic, "dua", "দোয়া"],
    seoTitle: fitLength(
      [
        `${title} (${ref}) in Arabic & Bangla`,
        `${title} in Arabic & Bangla`,
        `${title} (${ref})`,
        title,
      ],
      0,
      SEO_TITLE_MAX
    ),
    metaDescription: fitLength(
      [
        `Read ${title}${from} (${ref}) in Arabic with Bangla translation and verse-by-verse audio recitation. Free, with no ads or sign-up.`,
        `Read ${title}${from} (${ref}) in Arabic with Bangla translation and audio recitation. Free, with no ads or sign-up.`,
        `Read ${title}${from} (${ref}) in Arabic with Bangla translation and audio. Free, no ads.`,
        `Read ${title}${from} (${ref}) in Arabic with Bangla translation and verse-by-verse audio recitation by Mishary Alafasy. Free, with no ads or sign-up.`,
        `Read ${title}${from} (${ref}), a dua from the Quran, in Arabic with Bangla translation and verse-by-verse audio recitation by Mishary Alafasy. Free and ad-free.`,
      ],
      ...META_DESCRIPTION_RANGE
    ),
    lang: "en",
    howTo: [
      `Read the Arabic with the Bangla translation below it.${dua.startsAtWord ? " The dua is part of a longer ayah, so its words are highlighted." : ""}`,
      `Press Play to hear the ${ayahWord} recited${count > 1 ? " one after another" : ""}. Playback stops at the end of the dua.`,
      `Open Read in context to see the ayahs around it in Surah ${surah.name}.`,
      "Use the link button on an ayah to copy its permanent link, or share this page.",
    ],
    faqs: [
      {
        question: `Where is ${title} in the Quran?`,
        answer: `It is ${place}.${dua.startsAtWord ? " The dua is the part of the ayah highlighted on this page." : ""}`,
      },
      ...(dua.saidBy
        ? [
            {
              question: `Who says this dua in the Quran?`,
              answer: `In the Quran's account in Surah ${surah.name}, these words are the dua of ${dua.saidBy}.`,
            },
          ]
        : []),
      {
        question: `Is Surah ${surah.name} Meccan or Medinan?`,
        answer: `Surah ${surah.name}, surah ${surah.number} of the Quran, is a ${surah.revelation} surah of ${surah.ayahs} ayahs.`,
      },
    ],
  }
}

export const duaPages: readonly DuaPage[] = duas.map(duaPageOf)

export const getDuaPage = (slug: string) => duaPages.find((p) => p.dua.slug === slug)

// ---------- article pages ----------

function postPageOf(post: Post): PostPage {
  const writer = getWriter(post.writer)
  return {
    kind: "post",
    post,
    path: `/blog/${post.slug}`,
    link: { to: "/blog/$slug", params: { slug: post.slug } },
    title: post.title,
    summary: post.summary,
    description: post.summary,
    section: "Articles",
    icon: Feather,
    keywords: [...post.keywords, writer.name, post.shortTitle],
    seoTitle: post.seoTitle,
    metaDescription: post.metaDescription,
    lang: "bn",
  }
}

export const postPages: readonly PostPage[] = posts.map(postPageOf)

export const getPostPage = (slug: string) => {
  const post = getPost(slug)
  return post ? postPages.find((p) => p.post.slug === post.slug) : undefined
}

// ---------- registry ----------

/** Main destinations, in navigation order. */
export const appPages = [
  surahIndexPage,
  ayahPage,
  duasPage,
  prayerTimesPage,
  searchPage,
  blogPage,
  writersPage,
] as const

export const pageByPath = {
  surahs: surahIndexPage,
  ayah: ayahPage,
  duas: duasPage,
  prayerTimes: prayerTimesPage,
  search: searchPage,
  blog: blogPage,
  writers: writersPage,
} as const

/** Every indexable page except the home page (sitemap, OG images, llms.txt). */
export const pages: readonly Page[] = [...appPages, ...duaPages, ...surahPages, ...postPages]

/** File name of a page's Open Graph image, e.g. "surah-2" for /surah/2. */
export const pageSlug = (page: Pick<Page, "path">) => page.path.slice(1).replaceAll("/", "-")

export const ogImagePath = (slug: string) => `/og/${slug}.png`

/** Well-known surahs, suggested on the home page and as related reading. */
export const POPULAR_SURAHS = [1, 18, 36, 55, 56, 67, 112] as const

/** Related pages shown at the bottom of a page for internal linking. */
export function relatedPages(page: Page, limit = 6): Page[] {
  const others = (list: readonly Page[]) => list.filter((p) => p.path !== page.path)
  switch (page.kind) {
    case "surah": {
      const n = page.surah.number
      const neighbours = [n - 1, n + 1].filter((x) => x >= 1 && x <= 114)
      const popular = POPULAR_SURAHS.filter((x) => x !== n && !neighbours.includes(x))
      return [...neighbours, ...popular]
        .slice(0, limit)
        .map((x) => surahPages[x - 1])
        .filter((p): p is SurahPage => p !== undefined)
    }
    case "dua": {
      // Same category first, then the rest of the duas, then the surah it is from.
      const sameCategory = duaPages.filter(
        (p) => p.dua.category === page.dua.category && p.path !== page.path
      )
      const rest = duaPages.filter((p) => !sameCategory.includes(p) && p.path !== page.path)
      const surah = surahPages[page.surah.number - 1]
      const related: Page[] = [...sameCategory, ...rest].slice(0, limit - 1)
      return surah ? [...related, surah] : related
    }
    case "post": {
      const series = page.post.series
      const sameSeries = postPages.filter(
        (p) => series && p.post.series?.name === series.name && p.path !== page.path
      )
      const rest = postPages.filter((p) => !sameSeries.includes(p) && p.path !== page.path)
      return [...sameSeries, ...rest].slice(0, limit)
    }
    default:
      return [
        ...others(appPages),
        ...POPULAR_SURAHS.slice(0, 3).flatMap((n) => surahPages[n - 1] ?? []),
      ].slice(0, limit)
  }
}
