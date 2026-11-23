import { DEFAULT_RECITER } from "@/lib/editions"
import { globalAyahNumber } from "@/lib/surahs"

export interface Reciter {
  /** alquran.cloud audio edition identifier. */
  id: string
  name: string
  /** Bitrate folder on the CDN. Not every reciter has every bitrate. */
  bitrate: 32 | 48 | 64 | 128
}

/**
 * Verse-by-verse reciters on cdn.islamic.network, with a bitrate each one is published in
 * (checked against the CDN; 128 kbps where available, otherwise the best that exists).
 */
export const reciters: readonly Reciter[] = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", bitrate: 128 },
  { id: "ar.abdulsamad", name: "Abdul Basit Abdul Samad", bitrate: 64 },
  { id: "ar.abdurrahmaansudais", name: "Abdur-Rahman As-Sudais", bitrate: 64 },
  { id: "ar.abdullahbasfar", name: "Abdullah Basfar", bitrate: 64 },
  { id: "ar.shaatree", name: "Abu Bakr Ash-Shaatree", bitrate: 128 },
  { id: "ar.ahmedajamy", name: "Ahmed ibn Ali al-Ajamy", bitrate: 128 },
  { id: "ar.aymanswoaid", name: "Ayman Sowaid", bitrate: 64 },
  { id: "ar.hanirifai", name: "Hani Ar-Rifai", bitrate: 64 },
  { id: "ar.hudhaify", name: "Ali Al-Hudhaify", bitrate: 128 },
  { id: "ar.ibrahimakhbar", name: "Ibrahim Al-Akhdar", bitrate: 32 },
  { id: "ar.mahermuaiqly", name: "Maher Al-Muaiqly", bitrate: 128 },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", bitrate: 128 },
  { id: "ar.husarymujawwad", name: "Mahmoud Khalil Al-Husary (Mujawwad)", bitrate: 128 },
  { id: "ar.muhammadayyoub", name: "Muhammad Ayyoub", bitrate: 128 },
  { id: "ar.muhammadjibreel", name: "Muhammad Jibreel", bitrate: 128 },
  { id: "ar.saoodshuraym", name: "Saud Ash-Shuraim", bitrate: 64 },
]

export const defaultReciter = reciters.find((r) => r.id === DEFAULT_RECITER) as Reciter

export const getReciter = (id: string) => reciters.find((r) => r.id === id) ?? defaultReciter

/** MP3 URL of one ayah, e.g. https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3 */
export function ayahAudioUrl(surah: number, ayah: number, reciterId = DEFAULT_RECITER): string {
  const reciter = getReciter(reciterId)
  return `https://cdn.islamic.network/quran/audio/${reciter.bitrate}/${reciter.id}/${globalAyahNumber(surah, ayah)}.mp3`
}

/** "1:05" for 65 seconds; "0:00" for anything that isn't a finite, positive number. */
export function formatTime(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}
