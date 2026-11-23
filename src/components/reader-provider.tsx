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
  /** Keep playing the following ayahs to the end of the surah. */
  continuous: boolean
}

interface AudioControls {
  play: (track: AudioTrack, options?: { continuous?: boolean }) => void
  toggle: () => void
  stop: () => void
  step: (delta: 1 | -1) => void
  seek: (seconds: number) => void
}

interface AudioTime {
  current: number
  duration: number
}

const AudioStateContext = createContext<(AudioState & AudioControls) | null>(null)
const AudioTimeContext = createContext<AudioTime>({ current: 0, duration: 0 })

const idle: AudioState = { track: null, playing: false, buffering: false, continuous: false }

function useAudioEngine(reciterId: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [state, setState] = useState<AudioState>(idle)
  const [time, setTime] = useState<AudioTime>({ current: 0, duration: 0 })
  const stateRef = useRef(state)
  stateRef.current = state
  const reciterRef = useRef(reciterId)
  reciterRef.current = reciterId

  /** Event handlers, refreshed every render so they always see the latest callbacks. */
  const handlers = useRef<Record<string, (audio: HTMLAudioElement) => void>>({})

  /** The one shared element, created on first use so nothing touches `Audio` while prerendering. */
  const getAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current
    const audio = new Audio()
    audio.preload = "auto"
    for (const name of [
      "playing",
      "pause",
      "waiting",
      "timeupdate",
      "durationchange",
      "ended",
      "error",
    ]) {
      audio.addEventListener(name, () => handlers.current[name]?.(audio))
    }
    audioRef.current = audio
    return audio
  }, [])

  const load = useCallback(
    (track: AudioTrack, continuous: boolean) => {
      const audio = getAudio()
      audio.src = ayahAudioUrl(track.surah, track.ayah, reciterRef.current)
      setState({ track, playing: true, buffering: true, continuous })
      setTime({ current: 0, duration: 0 })
      audio.play().catch((error: unknown) => {
        // A newer track replaced this one before it started; not an error.
        if (error instanceof DOMException && error.name === "AbortError") return
        setState((s) => ({ ...s, playing: false, buffering: false }))
        toast.error("Couldn't play the recitation", {
          description: "Check your connection and try again.",
        })
      })
    },
    [getAudio]
  )

  const stop = useCallback(() => {
    audioRef.current?.pause()
    setState(idle)
  }, [])

  const step = useCallback(
    (delta: 1 | -1) => {
      const { track, continuous } = stateRef.current
      if (!track) return
      const count = getSurah(track.surah)?.ayahs ?? 0
      const ayah = track.ayah + delta
      if (ayah >= 1 && ayah <= count) load({ surah: track.surah, ayah }, continuous)
    },
    [load]
  )

  const onTime = (audio: HTMLAudioElement) =>
    setTime({ current: audio.currentTime, duration: audio.duration || 0 })
  handlers.current = {
    playing: () => setState((s) => ({ ...s, playing: true, buffering: false })),
    pause: () => setState((s) => ({ ...s, playing: false })),
    waiting: () => setState((s) => ({ ...s, buffering: true })),
    timeupdate: onTime,
    durationchange: onTime,
    ended: () => {
      const { track, continuous } = stateRef.current
      const count = track ? (getSurah(track.surah)?.ayahs ?? 0) : 0
      if (track && continuous && track.ayah < count) step(1)
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

  // Release the audio element when the app unmounts.
  useEffect(
    () => () => {
      audioRef.current?.pause()
      audioRef.current = null
    },
    []
  )

  const controls = useMemo<AudioControls>(
    () => ({
      play: (track, options) => load(track, options?.continuous ?? false),
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
