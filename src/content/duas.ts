/**
 * Duas and well-known ayahs from the Quran. Each entry stores only where it is in the Quran;
 * the Arabic, translation and audio come from the same data as the surah pages, so no Quran
 * text is ever typed by hand here.
 *
 * Categories describe what a dua asks for, not what reciting it brings: virtues and "when to
 * recite" need a hadith source for each, and are left out until they can be written with one.
 */

export type DuaCategoryId =
  | "well-known"
  | "forgiveness"
  | "guidance"
  | "knowledge"
  | "family"
  | "both-worlds"
  | "trust"

export interface DuaCategory {
  id: DuaCategoryId
  title: string
  titleBn: string
}

export const duaCategories: readonly DuaCategory[] = [
  { id: "well-known", title: "Well-known ayahs", titleBn: "সুপরিচিত আয়াত" },
  { id: "forgiveness", title: "Forgiveness & mercy", titleBn: "ক্ষমা ও রহমত" },
  { id: "guidance", title: "Guidance & steadfastness", titleBn: "হিদায়াত ও দৃঢ়তা" },
  { id: "knowledge", title: "Knowledge", titleBn: "জ্ঞান" },
  { id: "family", title: "Family & parents", titleBn: "পরিবার ও বাবা-মা" },
  { id: "both-worlds", title: "This life & the next", titleBn: "দুনিয়া ও আখিরাত" },
  { id: "trust", title: "Trust in Allah", titleBn: "আল্লাহর ওপর ভরসা" },
]

export interface Dua {
  /** URL segment: /duas/<slug>. */
  slug: string
  title: string
  titleBn: string
  category: DuaCategoryId
  /** Other common spellings, for search ("ayatul kursi"). */
  aliases?: readonly string[]
  /** Who says the dua in the Quran's account, where the ayahs name them. */
  saidBy?: string
  surah: number
  /** First and last ayah (inclusive). */
  from: number
  to: number
  /**
   * For a dua that begins part-way through its first ayah: the word it starts at (0-based,
   * counted in the bundled Simple script). The rest of the ayahs are the dua in full.
   */
  startsAtWord?: number
}

export const duas: readonly Dua[] = [
  // Well-known ayahs
  {
    slug: "al-fatihah",
    title: "Surah Al-Fatihah",
    titleBn: "সূরা আল-ফাতিহা",
    category: "well-known",
    surah: 1,
    from: 1,
    to: 7,
  },
  {
    slug: "ayat-al-kursi",
    title: "Ayat al-Kursi",
    titleBn: "আয়াতুল কুরসি",
    aliases: ["ayatul kursi", "ayat ul kursi", "ayatal kursi", "throne verse"],
    category: "well-known",
    surah: 2,
    from: 255,
    to: 255,
  },
  {
    slug: "last-two-ayahs-of-al-baqarah",
    title: "Last two ayahs of Al-Baqarah",
    titleBn: "সূরা বাকারার শেষ দুই আয়াত",
    aliases: ["amanar rasul", "amana rasulu", "baqarah last 2 ayat", "bakara"],
    category: "well-known",
    surah: 2,
    from: 285,
    to: 286,
  },
  {
    slug: "last-three-ayahs-of-al-hashr",
    title: "Last three ayahs of Al-Hashr",
    titleBn: "সূরা হাশরের শেষ তিন আয়াত",
    aliases: ["huwallahullazi", "hashr last 3 ayat", "hasor"],
    category: "well-known",
    surah: 59,
    from: 22,
    to: 24,
  },
  {
    slug: "al-ikhlas",
    title: "Surah Al-Ikhlas",
    titleBn: "সূরা আল-ইখলাস",
    category: "well-known",
    surah: 112,
    from: 1,
    to: 4,
  },
  {
    slug: "al-falaq",
    title: "Surah Al-Falaq",
    titleBn: "সূরা আল-ফালাক",
    category: "well-known",
    surah: 113,
    from: 1,
    to: 5,
  },
  {
    slug: "an-nas",
    title: "Surah An-Nas",
    titleBn: "সূরা আন-নাস",
    category: "well-known",
    surah: 114,
    from: 1,
    to: 6,
  },

  // Forgiveness & mercy
  {
    slug: "rabbana-zalamna-anfusana",
    title: "Rabbana zalamna anfusana",
    titleBn: "রাব্বানা যালামনা আনফুসানা",
    category: "forgiveness",
    saidBy: "Adam and his wife",
    surah: 7,
    from: 23,
    to: 23,
    startsAtWord: 1,
  },
  {
    slug: "la-ilaha-illa-anta-subhanaka",
    title: "La ilaha illa anta subhanaka",
    titleBn: "লা ইলাহা ইল্লা আনতা সুবহানাকা",
    aliases: ["dua yunus", "ayatul karima", "dua of jonah"],
    category: "forgiveness",
    saidBy: "Yunus",
    surah: 21,
    from: 87,
    to: 87,
    startsAtWord: 14,
  },

  // Guidance & steadfastness
  {
    slug: "rabbana-la-tuzigh-qulubana",
    title: "Rabbana la tuzigh qulubana",
    titleBn: "রাব্বানা লা তুযিগ কুলুবানা",
    category: "guidance",
    surah: 3,
    from: 8,
    to: 8,
  },
  {
    slug: "rabbish-rahli-sadri",
    title: "Rabbish-rahli sadri",
    titleBn: "রাব্বিশ রাহলি সাদরি",
    category: "guidance",
    saidBy: "Musa",
    surah: 20,
    from: 25,
    to: 28,
    startsAtWord: 1,
  },

  // Knowledge
  {
    slug: "rabbi-zidni-ilma",
    title: "Rabbi zidni ilma",
    titleBn: "রাব্বি যিদনি ইলমা",
    category: "knowledge",
    surah: 20,
    from: 114,
    to: 114,
    startsAtWord: 16,
  },

  // Family & parents
  {
    slug: "rabbij-alni-muqimas-salah",
    title: "Rabbij'alni muqimas-salah",
    titleBn: "রাব্বিজ আলনি মুকিমাস সালাত",
    category: "family",
    saidBy: "Ibrahim",
    surah: 14,
    from: 40,
    to: 41,
  },
  {
    slug: "rabbir-hamhuma",
    title: "Rabbir-hamhuma kama rabbayani saghira",
    titleBn: "রাব্বির হামহুমা কামা রাব্বায়ানি সাগিরা",
    category: "family",
    surah: 17,
    from: 24,
    to: 24,
    startsAtWord: 7,
  },
  {
    slug: "rabbana-hab-lana",
    title: "Rabbana hab lana min azwajina",
    titleBn: "রাব্বানা হাব লানা মিন আযওয়াজিনা",
    category: "family",
    surah: 25,
    from: 74,
    to: 74,
    startsAtWord: 2,
  },

  // This life & the next
  {
    slug: "rabbana-atina",
    title: "Rabbana atina fid-dunya hasanah",
    titleBn: "রাব্বানা আতিনা ফিদ্দুনিয়া হাসানাহ",
    category: "both-worlds",
    surah: 2,
    from: 201,
    to: 201,
    startsAtWord: 3,
  },
  {
    slug: "rabbana-taqabbal-minna",
    title: "Rabbana taqabbal minna",
    titleBn: "রাব্বানা তাকাব্বাল মিন্না",
    category: "both-worlds",
    saidBy: "Ibrahim and Ismail",
    surah: 2,
    from: 127,
    to: 127,
    startsAtWord: 7,
  },
  {
    slug: "rabbi-inni-lima-anzalta",
    title: "Rabbi inni lima anzalta ilayya",
    titleBn: "রাব্বি ইন্নি লিমা আনযালতা ইলাইয়া",
    category: "both-worlds",
    saidBy: "Musa",
    surah: 28,
    from: 24,
    to: 24,
    startsAtWord: 7,
  },

  // Trust in Allah
  {
    slug: "hasbunallahu-wa-nimal-wakil",
    title: "Hasbunallahu wa ni'mal wakil",
    titleBn: "হাসবুনাল্লাহু ওয়া নিমাল ওয়াকিল",
    category: "trust",
    surah: 3,
    from: 173,
    to: 173,
    startsAtWord: 13,
  },
  {
    slug: "hasbiyallahu-la-ilaha-illa-huwa",
    title: "Hasbiyallahu la ilaha illa huwa",
    titleBn: "হাসবিয়াল্লাহু লা ইলাহা ইল্লা হুয়া",
    category: "trust",
    surah: 9,
    from: 129,
    to: 129,
    startsAtWord: 3,
  },
]

export const getDua = (slug: string) => duas.find((d) => d.slug === slug)

export const duaCategory = (id: DuaCategoryId) =>
  duaCategories.find((c) => c.id === id) as DuaCategory

/** Duas proper (not whole well-known passages), the pool for "Dua of the day". */
export const dailyDuas = duas.filter((d) => d.category !== "well-known")
