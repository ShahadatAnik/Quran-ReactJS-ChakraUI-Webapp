import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { toast } from "sonner"
import { usePersistedState } from "@/hooks/use-persisted-state"
import { ayahAudioUrl, getReciter } from "@/lib/audio"
import {
  defaultReaderSettings,
  type LastRead,
  parseLastRead,
  parseReaderSettings,
  type ReaderSettings,
  settingsOverrides,
} from "@/lib/reader-settings"
import { getSurah } from "@/lib/surahs"

// ---------- settings & reading position ----------

interface ReaderContextValue {
  settings: ReaderSettings
  updateSettings: (patch: Partial<ReaderSettings>) => void
  lastRead: LastRead | null
  setLastRead: (position: LastRead) => void
  /** True once stored settings have been read (always false while prerendering). */
  restored: boolean
}

const ReaderContext = createContext<ReaderContextValue | null>(null)

// ---------- audio ----------

export interface AudioTrack {
  surah: number
  ayah: number
}

interface AudioState {
  track: AudioTrack | null
  playing: boolean
  /** Waiting for audio data. */
  buffering: boolean
  /** Keep playing the following ayahs to the end of the surah (or to `until`). */
  continuous: boolean
  /** Last ayah to play when continuous, for a range such as a dua; null for the surah's end. */
  until: number | null
}

interface AudioControls {
  play: (track: AudioTrack, options?: { continuous?: boolean; until?: number }) => void
  toggle: () => void
  stop: () => void
  step: (delta: 1 | -1) => void
  seek: (seconds: number) => void
  /** Exact playback position, read straight from the element (for smooth progress bars). */
  position: () => number
}

interface AudioTime {
  current: number
  duration: number
}

const AudioStateContext = createContext<(AudioState & AudioControls) | null>(null)
const AudioTimeContext = createContext<AudioTime>({ current: 0, duration: 0 })

const idle: AudioState = {
  track: null,
  playing: false,
  buffering: false,
  continuous: false,
  until: null,
}

/** The last ayah continuous playback of `track` goes to: the range's end, or the surah's. */
function lastAyah(track: AudioTrack, until: number | null): number {
  const count = getSurah(track.surah)?.ayahs ?? 0
  return until === null ? count : Math.min(until, count)
}

/**
 * The next ayah starts loading at 90% of the current one, or 5 seconds before its end if that
 * comes first, so short ayahs on slow connections still hand over without a pause.
 */
const PRELOAD_AT = 0.9
const PRELOAD_SECONDS = 5

const AUDIO_EVENTS = [
  "playing",
  "pause",
  "waiting",
  "timeupdate",
  "durationchange",
  "ended",
  "error",
] as const

function useAudioEngine(reciterId: string) {
  /** The element that is playing (or last played). */
  const audioRef = useRef<HTMLAudioElement | null>(null)
  /** A second element that buffers the next ayah while the current one finishes. */
  const preloadRef = useRef<{ url: string; audio: HTMLAudioElement } | null>(null)
  const [state, setState] = useState<AudioState>(idle)
  const [time, setTime] = useState<AudioTime>({ current: 0, duration: 0 })
  const stateRef = useRef(state)
  stateRef.current = state
  const reciterRef = useRef(reciterId)
  reciterRef.current = reciterId

  /** Event handlers, refreshed every render so they always see the latest callbacks. */
  const handlers = useRef<Record<string, (audio: HTMLAudioElement) => void>>({})

  /**
   * A new audio element. Created on first use so nothing touches `Audio` while prerendering.
   * Its events only count while it is the playing element, not while it is preloading.
   */
  const createAudio = useCallback(() => {
    const audio = new Audio()
    audio.preload = "auto"
    for (const name of AUDIO_EVENTS) {
      audio.addEventListener(name, () => {
        if (audioRef.current === audio) handlers.current[name]?.(audio)
      })
    }
    return audio
  }, [])

  const getAudio = useCallback(() => {
    audioRef.current ??= createAudio()
    return audioRef.current
  }, [createAudio])

  /** The next ayah to buffer while playing through a surah, if there is one. */
  const nextTrack = (): AudioTrack | null => {
    const { track, continuous, until } = stateRef.current
    if (!track || !continuous) return null
    return track.ayah < lastAyah(track, until) ? { surah: track.surah, ayah: track.ayah + 1 } : null
  }

  /** Starts buffering the next ayah once most of the current one has played. */
  const preloadNext = (audio: HTMLAudioElement) => {
    const { currentTime, duration } = audio
    if (!duration) return
    if (currentTime / duration < PRELOAD_AT && duration - currentTime > PRELOAD_SECONDS) return
    const next = nextTrack()
    if (!next) return
    const url = ayahAudioUrl(next.surah, next.ayah, reciterRef.current)
    if (preloadRef.current?.url === url) return
    const spare = preloadRef.current?.audio ?? createAudio()
    spare.src = url
    spare.load()
    preloadRef.current = { url, audio: spare }
  }

  const load = useCallback(
    (track: AudioTrack, continuous: boolean, until: number | null) => {
      const url = ayahAudioUrl(track.surah, track.ayah, reciterRef.current)
      const previous = audioRef.current
      const preloaded = preloadRef.current?.url === url ? preloadRef.current.audio : null
      let audio: HTMLAudioElement
      if (preloaded && previous) {
        // Swap: the buffered element plays, the finished one becomes the next spare.
        previous.pause()
        audioRef.current = preloaded
        preloadRef.current = { url: "", audio: previous }
        audio = preloaded
      } else {
        audio = getAudio()
        audio.src = url
      }
      setState({ track, playing: true, buffering: audio.readyState < 3, continuous, until })
      setTime({ current: 0, duration: audio.duration || 0 })
      const start = (element: HTMLAudioElement) =>
        element.play().catch((error: unknown) => {
          // A newer track replaced this one before it started; not an error.
          if (error instanceof DOMException && error.name === "AbortError") return
          // Some mobile browsers only let an element play after a tap on it: fall back to
          // the element that was already playing, which they allow to continue.
          if (
            error instanceof DOMException &&
            error.name === "NotAllowedError" &&
            element === preloaded &&
            previous
          ) {
            audioRef.current = previous
            preloadRef.current = null
            previous.src = url
            void start(previous)
            return
          }
          setState((s) => ({ ...s, playing: false, buffering: false }))
          toast.error("Couldn't play the recitation", {
            description: "Check your connection and try again.",
          })
        })
      void start(audio)
    },
    [getAudio]
  )

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setState(idle)
  }, [])

  const step = useCallback(
    (delta: 1 | -1) => {
      const { track, continuous, until } = stateRef.current
      if (!track) return
      const count = getSurah(track.surah)?.ayahs ?? 0
      const ayah = track.ayah + delta
      if (ayah >= 1 && ayah <= count) load({ surah: track.surah, ayah }, continuous, until)
    },
    [load]
  )

  const onTime = (audio: HTMLAudioElement) =>
    setTime({ current: audio.currentTime, duration: audio.duration || 0 })
  handlers.current = {
    playing: () => setState((s) => ({ ...s, playing: true, buffering: false })),
    pause: () => setState((s) => ({ ...s, playing: false })),
    waiting: () => setState((s) => ({ ...s, buffering: true })),
    timeupdate: (audio) => {
      onTime(audio)
      preloadNext(audio)
    },
    durationchange: onTime,
    ended: () => {
      const { track, continuous, until } = stateRef.current
      if (track && continuous && track.ayah < lastAyah(track, until)) step(1)
      else setState(idle)
    },
    error: (audio) => {
      if (!audio.getAttribute("src")) return
      setState(idle)
      toast.error("Couldn't load the recitation", {
        description: "The audio server didn't respond. Try another reciter in Reader settings.",
      })
    },
  }

  // Lock-screen and hardware media keys.
  useEffect(() => {
    const { track } = state
    if (!track || !("mediaSession" in navigator)) return
    const surah = getSurah(track.surah)
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${surah?.name ?? "Surah"} ${track.surah}:${track.ayah}`,
      artist: getReciter(reciterRef.current).name,
      album: "ILMIYAH",
      artwork: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    })
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play())
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause())
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1))
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1))
  }, [state, step])

  // Release the audio elements when the app unmounts.
  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
      preloadRef.current = null
    },
    []
  )

  const controls = useMemo<AudioControls>(
    () => ({
      play: (track, options) => load(track, options?.continuous ?? false, options?.until ?? null),
      toggle: () => {
        const audio = audioRef.current
        if (!audio || !stateRef.current.track) return
        if (audio.paused) void audio.play()
        else audio.pause()
      },
      stop,
      step,
      seek: (seconds) => {
        const audio = audioRef.current
        if (audio && Number.isFinite(seconds)) audio.currentTime = seconds
      },
      position: () => audioRef.current?.currentTime ?? 0,
    }),
    [load, stop, step]
  )

  return { state, time, controls }
}

export function ReaderProvider({ children }: { children: ReactNode }) {
  // Only the reader's own choices are stored (see settingsOverrides), on top of the defaults.
  const [overrides, setOverrides, restored] = usePersistedState<Partial<ReaderSettings>>(
    "reader",
    {},
    (stored) => settingsOverrides(parseReaderSettings(stored))
  )
  const settings = useMemo(() => ({ ...defaultReaderSettings, ...overrides }), [overrides])
  // The Arabic size lives on <html> (set before first paint by arabicSizeScript); keep it in step.
  useEffect(() => {
    if (restored) document.documentElement.dataset.arabicSize = settings.arabicSize
  }, [restored, settings.arabicSize])
  const setSettings = useCallback(
    (update: (current: ReaderSettings) => ReaderSettings) =>
      setOverrides((current) =>
        settingsOverrides(update({ ...defaultReaderSettings, ...current }))
      ),
    [setOverrides]
  )
  const [lastRead, setLastRead] = usePersistedState<LastRead | null>(
    "last-read",
    null,
    (stored) => parseLastRead(stored) ?? undefined
  )
  const { state, time, controls } = useAudioEngine(settings.reciter)

  const reader = useMemo<ReaderContextValue>(
    () => ({
      settings,
      updateSettings: (patch) => setSettings((current) => ({ ...current, ...patch })),
      lastRead,
      setLastRead,
      restored,
    }),
    [settings, setSettings, lastRead, setLastRead, restored]
  )
  const audio = useMemo(() => ({ ...state, ...controls }), [state, controls])

  return (
    <ReaderContext value={reader}>
      <AudioStateContext value={audio}>
        <AudioTimeContext value={time}>{children}</AudioTimeContext>
      </AudioStateContext>
    </ReaderContext>
  )
}

export function useReader() {
  const context = use(ReaderContext)
  if (!context) throw new Error("useReader must be used inside <ReaderProvider>")
  return context
}

export function useAudio() {
  const context = use(AudioStateContext)
  if (!context) throw new Error("useAudio must be used inside <ReaderProvider>")
  return context
}

/** Playback position; updates several times a second, so only the player bar uses it. */
export const useAudioTime = () => use(AudioTimeContext)
