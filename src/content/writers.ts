export interface Writer {
  id: string
  name: string
  /** Paragraphs about the writer, as published on the original site. */
  about: readonly string[]
  /** Language of `about`. */
  lang: "bn" | "en"
  links: readonly { label: "Website" | "Facebook" | "YouTube"; href: string }[]
}

export const writers = [
  {
    id: "at-tahreek",
    name: "মাসিক আত তাহরীক",
    lang: "en",
    about: [
      "Monthly At-Tahreek, which is running from Rajshahi, is an extra-ordinary Islamic Research Journal of Bangladesh. It is directed to Salafi Path, based on pure Tawheed and Saheeh Sunnah.",
      "Copyright © মাসিক আত-তাহরীক, Powered By Hadeeth Foundation Bangladesh",
    ],
    links: [
      { label: "Website", href: "https://at-tahreek.com/" },
      { label: "Facebook", href: "https://www.facebook.com/Monthly.At.tahreek/" },
      { label: "YouTube", href: "https://www.youtube.com/@AtTahreekTV" },
    ],
  },
  {
    id: "nusus",
    name: "Nusus",
    lang: "bn",
    about: [
      "বিসমিল্লাহির রাহমানির রাহিম।",
      "নুসুস (Nusus) শব্দটি আরবি نص শব্দের বহুবচন (نصوص)। এর অর্থ হলো: মূল পাঠ, উক্তি, উদ্ধৃতি ইত্যাদি। ইংরেজিতে বলা হয় text.",
      "ইসলামি জ্ঞানতত্ত্বে, নুসুস বলতে প্রধানত কুরআন ও হাদিসের মূল পাঠকে বুঝায়। তবে, ব্যাপকার্থে যেকোনো text-কেই নুসুস বলা হয়।",
      "আমরা এই পেইজটিতে লেখালেখির ক্ষেত্রে কুরআন ও হাদিসকে ভিত্তি হিসেবে গ্রহণ করেছি। ইনশাআল্লাহ, এখানে এমন কোনো কথা লিখবো না, যেটির পক্ষে কুরআন অথবা হাদিসের স্পষ্ট বক্তব্য কিংবা ইশারা-সংকেতও থাকবে না। সেদিকে লক্ষ্য রেখেই পেইজের নামকরণ করেছি ‘নুসুস’।",
      "আল্লাহ সুবহানাহু ওয়া তা‘আলার জন্যই সকল প্রশংসা ও গুণকীর্তন। দরুদ ও সালাম বর্ষিত হোক তাঁর প্রিয়নবির উপর। আল্লাহুম্মা সল্লি ‘আলা মুহাম্মাদ ওয়া ‘আলা আ-লি মুহাম্মাদ।",
      "আল্লাহ তা‘আলা আমাদের সবাইকে তাঁর সন্তুষ্টির পথে পরিচালিত করুন। আমিন।",
    ],
    links: [{ label: "Facebook", href: "https://www.facebook.com/FromNusus/" }],
  },
  {
    id: "khondokar-abdullah-jahangir",
    name: "ড. খোন্দকার আব্দুল্লাহ জাহাঙ্গীর রাহিমাহুল্লাহ",
    lang: "en",
    about: ["Khatib: Masjidul Jum'a complex, Pollobi, Mirpur, Dhaka"],
    links: [{ label: "Facebook", href: "https://www.facebook.com/abdulhimdsaifullah" }],
  },
] as const satisfies readonly Writer[]

export type WriterId = (typeof writers)[number]["id"]

export const getWriter = (id: WriterId): Writer => writers.find((w) => w.id === id) as Writer
