import type { WriterId } from "@/content/writers"

export interface Post {
  slug: string
  /** Full article title (the page h1). */
  title: string
  /** Shorter title for cards and lists. */
  shortTitle: string
  /** One or two sentences for cards. */
  summary: string
  /** Search-friendly title without the site name (45 characters or fewer). */
  seoTitle: string
  /** Meta description, 140–160 characters. */
  metaDescription: string
  /** Publication date, ISO yyyy-mm-dd. */
  date: string
  writer: WriterId
  /** Multi-part series this post belongs to. */
  series?: { name: string; part: number }
  /** Extra search terms (English) for the command menu. */
  keywords: readonly string[]
}

const DUROOD_SERIES = "দরুদ সমাধানের বারুদ"

/** Newest first. Bodies live in src/content/posts/<slug>.ts. */
export const posts = [
  {
    slug: "for-muslims-saying-merry-christmas-means-accepting-the-divinity-of-isa",
    title: "মুসলমানদের জন্যে “মেরি ক্রিসমাস” বলার মানে হচ্ছে ঈসা (আঃ) এর দেবত্ব মেনে নেয়া",
    shortTitle: "মুসলমানদের জন্যে “মেরি ক্রিসমাস” বলা",
    summary:
      "“মেরি ক্রিসমাস” বা “শুভ বড়দিন” বলা কেন ঈসা (আঃ)-এর দেবত্ব মেনে নেওয়ার শামিল, এবং অন্য ধর্মের প্রতি সম্মান রেখেও একজন মুসলিম কী করবেন।",
    seoTitle: "মুসলমানদের “মেরি ক্রিসমাস” বলা কি জায়েয?",
    metaDescription:
      "মুসলমানদের জন্য “মেরি ক্রিসমাস” বা “শুভ বড়দিন” বলা কেন ঈসা (আঃ)-এর দেবত্ব মেনে নেওয়ার শামিল, কুরআনের আলোকে ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীরের ব্যাখ্যা।",
    date: "2022-12-25",
    writer: "khondokar-abdullah-jahangir",
    keywords: ["christmas", "merry christmas", "isa", "jesus", "shirk"],
  },
  {
    slug: "dua-for-prophet-part-5",
    title: "দরুদ সমাধানের বারুদ: দরুদ পড়ার সময় ও পরিস্থিতি",
    shortTitle: "দরুদ পড়ার সময় ও পরিস্থিতি",
    summary: "মজলিসে, দু‘আর আগে, নবিজির নাম শুনলে, জুমু‘আর দিনে, আজানের পর: দরুদ পাঠের বিশেষ ৮টি সময়।",
    seoTitle: "দরুদ পড়ার ৮টি বিশেষ সময় ও পরিস্থিতি",
    metaDescription:
      "কখন দরুদ পড়বেন: মজলিসে বসলে, দু‘আর শুরুতে, নবিজির নাম শুনলে, বিপদে, জুমু‘আর দিনে, মসজিদে প্রবেশে, আজানের পর ও সকাল-সন্ধ্যায়। হাদিসের দলিলসহ।",
    date: "2022-12-14",
    writer: "nusus",
    series: { name: DUROOD_SERIES, part: 5 },
    keywords: ["durood", "darood", "salawat", "when to recite"],
  },
  {
    slug: "dua-for-prophet-part-4",
    title: "দরুদ সমাধানের বারুদ: দরুদ প্রেরণের ৭টি বিশেষ বাক্য",
    shortTitle: "দরুদ প্রেরণের ৭টি বিশেষ বাক্য",
    summary: "দরুদে ইবরাহিমসহ সহিহ হাদিসে বর্ণিত দরুদের ৭টি বাক্য, আরবি পাঠ ও বাংলা অর্থসহ।",
    seoTitle: "দরুদে ইবরাহিমসহ ৭টি সহিহ দরুদ",
    metaDescription:
      "দরুদে ইবরাহিম, সবচেয়ে ছোট বিশুদ্ধ দরুদ, সাদাকাহর সওয়াবের দরুদ ও শাফা‘আত লাভের দরুদসহ সহিহ হাদিসে বর্ণিত ৭টি দরুদ, আরবি পাঠ ও বাংলা অর্থসহ।",
    date: "2022-12-11",
    writer: "nusus",
    series: { name: DUROOD_SERIES, part: 4 },
    keywords: ["durood", "darood e ibrahim", "salawat", "arabic"],
  },
  {
    slug: "dua-for-prophet-part-3",
    title: "দরুদ সমাধানের বারুদ: নবিজির উপর দরুদ পাঠের অনন্য ১০ টি লাভ ও উপকারিতা",
    shortTitle: "দরুদ পাঠের ১০টি লাভ ও উপকারিতা",
    summary: "দুশ্চিন্তামুক্তি, গুনাহমাফ, শাফা‘আত ও দু‘আ কবুল: নবিজির উপর দরুদ পাঠের ১০টি ফজিলত।",
    seoTitle: "দরুদ পাঠের ১০টি লাভ ও ফজিলত",
    metaDescription:
      "নবিজির উপর দরুদ পাঠের ১০টি লাভ: দুশ্চিন্তামুক্তি, রহমত ও গুনাহমাফ, কিয়ামতে নবিজির সান্নিধ্য, শাফা‘আত, দু‘আ কবুল ও আরও অনেক কিছু, হাদিসের দলিলসহ।",
    date: "2022-12-09",
    writer: "nusus",
    series: { name: DUROOD_SERIES, part: 3 },
    keywords: ["durood", "darood", "benefits", "fazilat"],
  },
  {
    slug: "dua-for-prophet-part-2",
    title: "দরুদ সমাধানের বারুদ: রাসুলের উপর দরুদ পাঠ করার অপরিসীম গুরুত্ব এবং দরুদ না পড়ার পরিণতি ও শাস্তি",
    shortTitle: "দরুদের গুরুত্ব ও না পড়ার পরিণতি",
    summary: "রাসুলের উপর দরুদ পাঠের গুরুত্ব, এবং দরুদ না পড়া ব্যক্তির পরিণতি নিয়ে হাদিসের বক্তব্য।",
    seoTitle: "দরুদের গুরুত্ব ও দরুদ না পড়ার পরিণতি",
    metaDescription:
      "রাসুলুল্লাহ (সা.)-এর উপর দরুদ পাঠ কেন এত গুরুত্বপূর্ণ, আর তাঁর নাম শুনেও দরুদ না পড়ার পরিণতি ও শাস্তি কী: সহিহ হাদিসের আলোকে বিস্তারিত আলোচনা।",
    date: "2022-12-07",
    writer: "nusus",
    series: { name: DUROOD_SERIES, part: 2 },
    keywords: ["durood", "darood", "importance"],
  },
  {
    slug: "dua-for-prophet-part-1",
    title: "দরুদ সমাধানের বারুদ: দরুদ জিনিসটা আসলে কী, নবিজির উপর আমাদের দরুদ পড়ার হিকমাহ ও যৌক্তিকতা কী?",
    shortTitle: "দরুদ কী, এবং কেন পড়ি",
    summary: "‘সালাত’ ও দরুদের অর্থ, এবং নবিজির উপর দরুদ পাঠের উদ্দেশ্য, হিকমাহ ও যৌক্তিকতা।",
    seoTitle: "দরুদ কী এবং নবিজির উপর দরুদ কেন পড়ি",
    metaDescription:
      "দরুদ শব্দের অর্থ কী, কুরআন-হাদিসে ‘সালাত’ বলতে কী বোঝায়, আর নবিজির উপর দরুদ পাঠের উদ্দেশ্য, হিকমাহ ও যৌক্তিকতা: সূরা আহযাবের আয়াতের আলোকে আলোচনা।",
    date: "2022-12-04",
    writer: "nusus",
    series: { name: DUROOD_SERIES, part: 1 },
    keywords: ["durood", "darood", "salat", "meaning", "wisdom"],
  },
  {
    slug: "woman-hahaha-shame-passing",
    title: "বেডা মানুষ, বেডি মানুষ, Women Haha ইত্যাদি বলায় ঘৃণা চর্চা",
    shortTitle: "বেডা মানুষ, বেডি মানুষ, Women ☕ Haha ইত্যাদি বলায় ঘৃণা চর্চা",
    summary: "হাসি-ঠাট্টা আর ট্রলের ছলে নারী-পুরুষকে হেয় করা কেন ঘৃণা চর্চা, এবং এ বিষয়ে কুরআন-হাদিসের সতর্কবাণী।",
    seoTitle: "“বেডা মানুষ, Women Haha”: ঘৃণা চর্চা",
    metaDescription:
      "“বেডা মানুষ”, “বেডি মানুষ”, “Women Haha” বলে ট্রলের ছলে মানুষের ইজ্জতে আঘাত করা কেন ঘৃণা চর্চা, আর উপহাস ও গিবত নিয়ে কুরআন-হাদিসের সতর্কবাণী।",
    date: "2022-11-13",
    writer: "nusus",
    keywords: ["mockery", "troll", "women", "respect", "backbiting"],
  },
  {
    slug: "islam-on-women-rights-and-dignity",
    title: "নারীর অধিকার ও মর্যাদায় ইসলাম",
    shortTitle: "নারীর অধিকার ও মর্যাদায় ইসলাম",
    summary: "ইসলাম-পূর্ব যুগে ও বিভিন্ন ধর্ম-সভ্যতায় নারীর অবস্থান, আর ইসলাম নারীকে যে অধিকার ও মর্যাদা দিয়েছে।",
    seoTitle: "নারীর অধিকার ও মর্যাদায় ইসলাম",
    metaDescription:
      "ইসলাম নারীকে কী অধিকার ও মর্যাদা দিয়েছে, আর ইসলাম-পূর্ব যুগে, হিন্দু, বৌদ্ধ, ইহুদী, চীন, গ্রীক ও রোম সভ্যতায় নারীর অবস্থান কেমন ছিল: কুরআন-হাদিসের আলোকে।",
    date: "2022-11-12",
    writer: "at-tahreek",
    keywords: ["women", "rights", "dignity", "islam"],
  },
] as const satisfies readonly Post[]

export type PostSlug = (typeof posts)[number]["slug"]

export const getPost = (slug: string): Post | undefined => posts.find((p) => p.slug === slug)

export const postPath = (slug: string) => `/blog/${slug}` as const

/** Other parts of the same series, in order. */
export const seriesPosts = (post: Post): Post[] =>
  post.series
    ? (posts as readonly Post[])
        .filter((p) => p.series?.name === post.series?.name)
        .sort((a, b) => (a.series?.part ?? 0) - (b.series?.part ?? 0))
    : []
