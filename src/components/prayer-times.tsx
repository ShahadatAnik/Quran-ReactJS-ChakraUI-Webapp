import { Link } from "@tanstack/react-router"
import { ArrowRight, Loader2, LocateFixed, MapPin, Search } from "lucide-react"
import { type ReactNode, useEffect, useId, useMemo, useState } from "react"
import { CornerLattice, factClass, panelClass } from "@/components/page-card"
import { PrayerSettingsFields } from "@/components/prayer-settings"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton, SkeletonText } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { setPrayerLocation, useLocate, useNow, usePrayerState } from "@/hooks/use-prayer"
import {
  defaultPrayerSettings,
  deviceTimeZone,
  formatCoordinates,
  type PrayerLocation,
  type PrayerSettings,
} from "@/lib/prayer-settings"
import {
  type CalendarDate,
  compassPoint,
  dateAt,
  formatClock,
  formatCountdown,
  formatDay,
  formatTime,
  geocodingUrl,
  hijriDate,
  type Place,
  PRAYER_NAMES,
  PRAYERS,
  type PrayerName,
  parsePlaces,
  prayerLabel,
  qiblaBearing,
  type Schedule,
  scheduleAt,
  weekAt,
} from "@/lib/prayer-times"
import { cn } from "@/lib/utils"

// ---------- location ----------

type SearchResult = { term: string; places: Place[] } | { term: string; failed: true }

/** City search, for when GPS is denied: only the typed name is sent, to Open-Meteo. */
function CitySearch({ onPicked }: { onPicked?: () => void }) {
  const id = useId()
  const [query, setQuery] = useState("")
  const term = useDebouncedValue(query.trim(), 300)
  const [result, setResult] = useState<SearchResult | null>(null)

  useEffect(() => {
    if (term.length < 2) return
    const controller = new AbortController()
    fetch(geocodingUrl(term), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status))
        return response.json() as Promise<unknown>
      })
      .then((json) => setResult({ term, places: parsePlaces(json) }))
      .catch(() => {
        if (!controller.signal.aborted) setResult({ term, failed: true })
      })
    return () => controller.abort()
  }, [term])

  const typed = query.trim()
  const shown = typed.length >= 2 && result?.term === typed ? result : null
  const searching = typed.length >= 2 && !shown

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        Or search for your city
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Dhaka, Sylhet, London…"
          autoComplete="off"
          className="pl-9"
        />
        {searching ? (
          <Loader2
            aria-hidden="true"
            className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
          />
        ) : null}
      </div>
      <p aria-live="polite" className="sr-only">
        {shown && "places" in shown ? `${shown.places.length} places found` : ""}
      </p>
      {shown && "failed" in shown ? (
        <p role="alert" className="text-sm text-destructive">
          The city search isn't reachable right now. Check your connection and try again.
        </p>
      ) : shown && shown.places.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No place by that name. Try another spelling.
        </p>
      ) : shown ? (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl ring-1 ring-foreground/10">
          {shown.places.map((place) => (
            <li key={`${place.id}-${place.latitude}-${place.longitude}`}>
              <button
                type="button"
                onClick={() => {
                  const { id: _id, region: _region, ...location } = place
                  setPrayerLocation(location)
                  setQuery("")
                  onPicked?.()
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors outline-none hover:bg-accent focus-visible:bg-accent"
              >
                <MapPin aria-hidden="true" className="size-4 shrink-0 text-gold" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{place.name.split(",")[0]}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {place.region}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {place.timeZone.replaceAll("_", " ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : searching ? (
        <ul
          aria-busy="true"
          className="divide-y divide-border/60 overflow-hidden rounded-xl ring-1 ring-foreground/10"
        >
          {[1, 2, 3].map((n) => (
            <li key={n} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="size-4 rounded-full" />
              <span className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-40" />
              </span>
              <Skeleton className="h-3 w-16" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** "Use my location" (asks for GPS only when pressed) and the city search. */
function LocationSetup({ onDone }: { onDone?: () => void }) {
  const { status, locate } = useLocate()
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Button
          onClick={() => locate(onDone)}
          disabled={status.state === "locating"}
          className="w-full sm:w-auto"
        >
          {status.state === "locating" ? <Loader2 className="animate-spin" /> : <LocateFixed />}
          {status.state === "locating" ? "Finding your location…" : "Use my location"}
        </Button>
        {status.state === "error" ? (
          <p role="alert" className="text-sm text-destructive">
            {status.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Your browser will ask first. The location is rounded to about a kilometre and stays in
            this browser.
          </p>
        )}
      </div>
      <CitySearch onPicked={onDone} />
    </div>
  )
}

/** Button and dialog to set the location again. */
function ChangeLocation({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <MapPin />
          Change location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change location</DialogTitle>
          <DialogDescription>
            Prayer times are worked out for this place, in your browser.
          </DialogDescription>
        </DialogHeader>
        <LocationSetup onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

// ---------- shared pieces ----------

/** Location, settings and the time, ticking; null until all three are known. */
function useSchedule() {
  const state = usePrayerState()
  const now = useNow()
  const location = state?.location ?? null
  const settings = state?.settings ?? defaultPrayerSettings
  const schedule = location && now ? scheduleAt(now, location, settings) : null
  return { state, now, location, settings, schedule }
}

/** When a prayer's remaining time is this short, the countdown turns red and blinks. */
const ENDING_SOON_MS = 15 * 60_000

/** "Current prayer" while a prayer's time is running, else "Next prayer". */
const headingOf = (schedule: Schedule) => (schedule.window ? "Current prayer" : "Next prayer")

/**
 * While a prayer's time is running: that prayer, its start and end, how much of it has passed
 * and how long is left, then the prayer after it. Between sunrise and Dhuhr, when no prayer is
 * due: the next prayer and the countdown to it.
 */
function PrayerNow({
  schedule,
  now,
  location,
  size = "lg",
}: {
  schedule: Schedule
  now: Date
  location: PrayerLocation
  size?: "lg" | "md"
}) {
  const { window: running, next, today } = schedule
  const name = running ? running.name : next.name
  const time = (instant: Date) => formatTime(instant, location.timeZone)
  const left = running ? running.end.getTime() - now.getTime() : 0
  const elapsed = running
    ? Math.min(
        100,
        Math.max(
          0,
          ((now.getTime() - running.start.getTime()) /
            (running.end.getTime() - running.start.getTime())) *
            100
        )
      )
    : 0

  return (
    <PrayerNowView
      size={size}
      label={prayerLabel(name, running ? today.date : next.date)}
      arabic={PRAYERS[name].arabic}
      when={
        running
          ? { start: time(running.start), end: time(running.end) }
          : { at: time(next.time), countdown: formatCountdown(next.time.getTime() - now.getTime()) }
      }
      running={
        running
          ? {
              elapsed,
              left: formatCountdown(left),
              endingSoon: left <= ENDING_SOON_MS,
              after: `Then ${prayerLabel(next.name, next.date)} at ${time(next.time)}`,
            }
          : null
      }
    />
  )
}

interface PrayerNowViewProps {
  label: string
  arabic: string
  /** While a prayer's time runs, its start and end; otherwise the next prayer's time. */
  when: { start: string; end: string } | { at: string; countdown: string }
  /** How much of the running prayer's time has passed, how much is left, and what follows. */
  running: { elapsed: number; left: string; endingSoon: boolean; after: string } | null
  size?: "lg" | "md"
}

function PrayerNowView({ label, arabic, when, running, size = "lg" }: PrayerNowViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              "font-heading font-semibold tracking-tight",
              size === "lg" ? "text-4xl md:text-5xl" : "text-3xl"
            )}
          >
            {label}
          </p>
          <p className="mt-1 text-muted-foreground tabular-nums">
            {"start" in when ? (
              <>
                <span className="font-medium text-foreground">{when.start}</span>
                {" – "}
                <span className="font-medium text-foreground">{when.end}</span>
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{when.at}</span>
                {" · in "}
                {when.countdown}
              </>
            )}
          </p>
        </div>
        <p
          lang="ar"
          dir="rtl"
          aria-hidden="true"
          className={cn("shrink-0 text-gold", size === "lg" ? "text-5xl md:text-6xl" : "text-4xl")}
        >
          <span className="arabic-glyph-centred">{arabic}</span>
        </p>
      </div>
      {running ? (
        <div className="space-y-1.5">
          {/* How much of the prayer's time has passed; the text below says how much is left. */}
          <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
            <div
              className={cn(
                "h-full rounded-full transition-width duration-1000 ease-linear motion-reduce:transition-none",
                running.endingSoon ? "ending-soon bg-destructive" : "bg-gold"
              )}
              style={{ width: `${running.elapsed}%` }}
            />
          </div>
          <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm tabular-nums">
            <span
              className={cn("font-medium", running.endingSoon && "ending-soon text-destructive")}
            >
              {running.left} left
            </span>
            <span className="text-muted-foreground">{running.after}</span>
          </p>
        </div>
      ) : null}
    </div>
  )
}

/** The widest time, clock and countdown the views can show. */
const WIDEST_TIME = "12:59 PM"
const WIDEST_CLOCK = "12:59"
const WIDEST_COUNTDOWN = formatCountdown(59_000)

/**
 * Every shape PrayerNowView takes (each prayer running, with the prayer after it, and the wait
 * for Dhuhr after sunrise), with the widest times. Stacked invisibly behind the real one (see
 * Sizer), they hold the most room it can ever need at the current width, so the block keeps one
 * height whatever the time, and while it loads.
 */
const PRAYER_NOW_SHAPES: Omit<PrayerNowViewProps, "size">[] = [
  ...(
    [
      ["fajr", "Sunrise"],
      ["dhuhr", "Asr"],
      ["asr", "Maghrib"],
      ["maghrib", "Isha"],
      ["isha", "Fajr"],
    ] as const
  ).flatMap(([name, then]) =>
    (name === "dhuhr" ? ["Dhuhr", "Jumu'ah"] : [PRAYERS[name].label]).map((label) => ({
      label,
      arabic: PRAYERS[name].arabic,
      when: { start: WIDEST_TIME, end: WIDEST_TIME },
      running: {
        elapsed: 0,
        left: WIDEST_COUNTDOWN,
        endingSoon: false,
        after: `Then ${then} at ${WIDEST_TIME}`,
      },
    }))
  ),
  ...["Dhuhr", "Jumu'ah"].map((label) => ({
    label,
    arabic: PRAYERS.dhuhr.arabic,
    when: { at: WIDEST_TIME, countdown: WIDEST_COUNTDOWN },
    running: null,
  })),
]

/**
 * Invisible copies of every shape a block can take, in one grid cell: the cell is as tall as
 * the tallest at the current width. With the real content in the same cell (`children`), the
 * block never changes height, whatever it shows, and while it loads.
 */
function Sizer({
  shapes,
  className,
  children,
}: {
  shapes: ReactNode[]
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("relative grid *:col-start-1 *:row-start-1", className)}>
      {shapes.map((shape, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of shapes.
        <div key={i} aria-hidden="true" inert className="invisible">
          {shape}
        </div>
      ))}
      {children}
    </div>
  )
}

const timeZoneNote = (location: PrayerLocation) =>
  location.timeZone === deviceTimeZone()
    ? null
    : `Times are in local time there (${location.timeZone.replaceAll("_", " ")}).`

// ---------- the page ----------

const COMPASS_WORDS: Record<string, string> = {
  N: "north",
  NE: "north-east",
  E: "east",
  SE: "south-east",
  S: "south",
  SW: "south-west",
  W: "west",
  NW: "north-west",
}

function Qibla({ location }: { location: PrayerLocation }) {
  const bearing = qiblaBearing(location)
  return (
    <QiblaView
      headingId="qibla-heading"
      bearing={bearing}
      direction={COMPASS_WORDS[compassPoint(bearing)] ?? ""}
    />
  )
}

function QiblaView({
  headingId,
  bearing,
  direction,
}: {
  headingId?: string
  bearing: number
  direction: string
}) {
  return (
    <section aria-labelledby={headingId} className={cn(panelClass, "space-y-4")}>
      <CornerLattice />
      <h2 id={headingId} className={factClass}>
        Qibla
      </h2>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 120 120" aria-hidden="true" className="size-28 shrink-0">
          <circle cx="60" cy="60" r="54" className="fill-none stroke-foreground/15" />
          {Array.from({ length: 8 }, (_, i) => (
            <line
              // biome-ignore lint/suspicious/noArrayIndexKey: eight fixed tick marks.
              key={i}
              x1="60"
              y1="8"
              x2="60"
              y2={i % 2 ? "13" : "16"}
              transform={`rotate(${i * 45} 60 60)`}
              className="stroke-foreground/30"
            />
          ))}
          <text
            x="60"
            y="28"
            textAnchor="middle"
            className="fill-muted-foreground text-2xs font-semibold"
          >
            N
          </text>
          <g transform={`rotate(${bearing} 60 60)`} className="text-gold">
            <line x1="60" y1="60" x2="60" y2="22" stroke="currentColor" strokeWidth="2.5" />
            <rect x="54" y="14" width="12" height="12" rx="1.5" fill="currentColor" />
          </g>
          <circle cx="60" cy="60" r="3.5" className="fill-foreground" />
        </svg>
        <div className="space-y-1">
          <p className="text-3xl font-semibold tabular-nums">{Math.round(bearing)}°</p>
          <p className="text-sm text-muted-foreground">From true north, towards the {direction}.</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        A phone compass may point to magnetic north, a few degrees away in some places.
      </p>
    </section>
  )
}

/** The Qibla panel with the longest directions, for its sizer. */
const QIBLA_SHAPES = [
  { bearing: 315, direction: "north-west" },
  { bearing: 135, direction: "south-east" },
]

interface TimeTile {
  name: PrayerName
  label: ReactNode
  time: ReactNode
  status: string
  current: boolean
}

function TimeTiles({ schedule, location }: { schedule: Schedule; location: PrayerLocation }) {
  const { today, current, next } = schedule
  return (
    <TimeTilesView
      tiles={PRAYER_NAMES.map((name) => {
        const isCurrent = name === current
        const isNext = name === next.name && next.date === today.date
        return {
          name,
          label: prayerLabel(name, today.date),
          time: formatTime(today[name], location.timeZone),
          status: isCurrent ? "Now" : isNext ? "Next" : name === "sunrise" ? "Fajr ends" : "",
          current: isCurrent,
        }
      })}
    />
  )
}

function TimeTilesView({ tiles }: { tiles: readonly TimeTile[] }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map(({ name, label, time, status, current }) => (
        <li
          key={name}
          aria-current={current ? "time" : undefined}
          className={cn(
            "relative rounded-2xl bg-card p-4 ring-1 ring-foreground/10",
            current && "bg-gold/5 ring-2 ring-gold/60",
            name === "sunrise" && "bg-muted/40"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{label}</p>
            <p lang="ar" dir="rtl" aria-hidden="true" className="text-lg text-gold">
              <span className="arabic-glyph-centred">{PRAYERS[name].arabic}</span>
            </p>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{time}</p>
          <p className="mt-1 h-4 text-xs font-medium tracking-wide text-gold uppercase">{status}</p>
        </li>
      ))}
    </ul>
  )
}

/** The tiles with the widest labels and times, for their sizer. */
const WIDEST_TILES: TimeTile[] = PRAYER_NAMES.map((name) => ({
  name,
  label: name === "dhuhr" ? "Jumu'ah" : PRAYERS[name].label,
  time: WIDEST_TIME,
  status: "Fajr ends",
  current: false,
}))

/** The tiles while loading: the same tiles, with skeleton text. */
const SKELETON_TILES: TimeTile[] = WIDEST_TILES.map((tile) => ({
  ...tile,
  label: <SkeletonText>{tile.label}</SkeletonText>,
  time: <SkeletonText>{WIDEST_TIME}</SkeletonText>,
  status: "",
}))

/** "Wed 25 Nov", or "Wed 25" on phones. */
function ShortDate({ date }: { date: CalendarDate }) {
  const [weekdayAndDay, month] = formatDay(date, "short")
    .replace(",", "")
    .split(/ (?=S+$)/)
  return (
    <>
      {weekdayAndDay}
      <span className="hidden sm:inline"> {month}</span>
    </>
  )
}

interface WeekRow {
  key: string
  day: ReactNode
  times: Record<PrayerName, ReactNode>
}

function Week({
  now,
  location,
  settings,
}: {
  now: Date
  location: PrayerLocation
  settings: PrayerSettings
}) {
  // Recalculated when the date there changes, not every second.
  const day = dateAt(now, location.timeZone)
  const key = `${day.year}-${day.month}-${day.day}`
  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` stands for `now`'s date.
  const week = useMemo(() => weekAt(now, location, settings), [key, location, settings])
  return (
    <WeekView
      headingId="week-heading"
      rows={week.map((times, index) => ({
        key: `${times.date.month}-${times.date.day}`,
        day: index === 0 ? "Today" : <ShortDate date={times.date} />,
        times: Object.fromEntries(
          PRAYER_NAMES.map((name) => [name, formatClock(times[name], location.timeZone)])
        ) as Record<PrayerName, string>,
      }))}
    />
  )
}

function WeekView({ headingId, rows }: { headingId?: string; rows: readonly WeekRow[] }) {
  return (
    <section aria-labelledby={headingId} className={cn(panelClass, "space-y-4")}>
      <CornerLattice />
      <h2 id={headingId} className={factClass}>
        The week ahead
      </h2>
      {/* On phones the Sunrise column is left out, so the five prayers fit without scrolling. */}
      <div className="-mx-1 overflow-x-auto sm:-mx-2">
        <table className="w-full text-xs tabular-nums sm:text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground">
              <th scope="col" className="px-1 pb-2 text-left font-medium sm:px-2">
                <span className="sr-only">Date</span>
              </th>
              {PRAYER_NAMES.map((name) => (
                <th
                  key={name}
                  scope="col"
                  className={cn(
                    "px-1 pb-2 text-right font-medium sm:px-2",
                    name === "sunrise" && "hidden sm:table-cell"
                  )}
                >
                  {PRAYERS[name].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.key}
                className={cn("border-t border-border/50", index === 0 && "font-semibold")}
              >
                <th
                  scope="row"
                  className="px-1 py-2 text-left font-medium whitespace-nowrap sm:px-2"
                >
                  {row.day}
                </th>
                {PRAYER_NAMES.map((name) => (
                  <td
                    key={name}
                    className={cn(
                      "px-1 py-2 text-right sm:px-2",
                      name === "sunrise" && "hidden text-muted-foreground sm:table-cell"
                    )}
                  >
                    {row.times[name]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        Times before Dhuhr are in the morning; the rest are after midday.
      </p>
    </section>
  )
}

/** The week while loading: the same table, every cell a single line of skeleton text. */
const SKELETON_WEEK: WeekRow[] = [
  "Today",
  "Thu 26",
  "Fri 27",
  "Sat 28",
  "Sun 29",
  "Mon 30",
  "Tue 1",
].map((day) => ({
  key: day,
  day: <SkeletonText>{day}</SkeletonText>,
  times: Object.fromEntries(
    PRAYER_NAMES.map((name) => [name, <SkeletonText key={name}>{WIDEST_CLOCK}</SkeletonText>])
  ) as Record<PrayerName, ReactNode>,
}))

/** The date line under the next prayer: the date, the Hijri date, and the time-zone note. */
function DayLine({ day, note }: { day: ReactNode; note: ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground">
      {day}
      {note ? <span className="block text-xs">{note}</span> : null}
    </p>
  )
}

/** The longest date line, for its sizer; its note only counts where there will be one. */
const WIDEST_DAY_LINE = (
  <DayLine
    day="Wednesday, 30 September · 30 Dhuʻl-Qiʻdah 1448 AH"
    note={
      <span data-only-prayer-note="on">
        Times are in local time there (America/Argentina/ComodRivadavia).
      </span>
    }
  />
)

/** Where the reader hasn't set a location yet: share it or search a city, and the settings. */
function PrayerSetup() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section aria-labelledby="location-heading" className={cn(panelClass, "space-y-5 p-6")}>
        <CornerLattice className="size-72" />
        <div className="space-y-1.5">
          <h2 id="location-heading" className="font-heading text-xl font-semibold">
            Where are you praying?
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">
            Prayer times depend on where you are. Share your location once, or search for your city,
            and the times are worked out right here in your browser.
          </p>
        </div>
        <LocationSetup />
      </section>
      <CalculationPanel />
    </div>
  )
}

function CalculationPanel() {
  // Its own id: before the location is read, the page has two (setup and dashboard).
  const headingId = useId()
  return (
    <section aria-labelledby={headingId} className={cn(panelClass, "space-y-4")}>
      <h2 id={headingId} className={factClass}>
        Calculation
      </h2>
      <PrayerSettingsFields />
    </section>
  )
}

interface DashboardData {
  schedule: Schedule
  now: Date
  location: PrayerLocation
  settings: PrayerSettings
}

/**
 * The dashboard for a saved location, or its skeleton while the times are worked out (`data`
 * null). Both are the same panels: the skeleton puts skeleton text in the lines, and the
 * blocks whose height depends on the time of day hold the room of their tallest shape (Sizer),
 * so the skeleton is exactly the dashboard's height and the dashboard keeps it all day.
 */
function LocatedDashboard({ data }: { data: DashboardData | null }) {
  const today = data?.schedule.today.date
  const hijri = today ? hijriDate(today) : null
  const note = data ? timeZoneNote(data.location) : null

  return (
    <div className="space-y-4" aria-busy={!data}>
      <section aria-labelledby="next-heading" className={cn(panelClass, "space-y-5 p-6 md:p-8")}>
        <CornerLattice className="size-80" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h2 id="next-heading" className={factClass}>
              {data ? (
                headingOf(data.schedule)
              ) : (
                <>
                  <span className="sr-only">Prayer times</span>
                  <SkeletonText>Current prayer</SkeletonText>
                </>
              )}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">
                {data ? (
                  <>
                    {data.location.name}
                    {data.location.source === "gps" ? ` · ${formatCoordinates(data.location)}` : ""}
                  </>
                ) : (
                  <SkeletonText>Your location · 23.81° N, 90.41° E</SkeletonText>
                )}
              </span>
            </p>
          </div>
          {data ? (
            <ChangeLocation className="shrink-0" />
          ) : (
            <Skeleton className="h-7 w-36 shrink-0 rounded-lg" />
          )}
        </div>
        <Sizer
          shapes={PRAYER_NOW_SHAPES.map((shape) => (
            <PrayerNowView key={`${shape.label}-${"start" in shape.when}`} {...shape} />
          ))}
        >
          {data ? (
            <PrayerNow schedule={data.schedule} now={data.now} location={data.location} />
          ) : (
            <div className="absolute inset-0 flex flex-col gap-4 overflow-hidden">
              <div className="flex items-end justify-between gap-4">
                <div className="space-y-2.5">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-12 w-24" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
              <Skeleton className="h-4 w-64 max-w-full" />
            </div>
          )}
        </Sizer>
        <Sizer shapes={[WIDEST_DAY_LINE]}>
          {data && today ? (
            <DayLine day={`${formatDay(today)}${hijri ? ` · ${hijri}` : ""}`} note={note} />
          ) : (
            <DayLine
              day={<SkeletonText>Wednesday, 25 November · 4 Jumada II 1448 AH</SkeletonText>}
              note={null}
            />
          )}
        </Sizer>
      </section>

      <Sizer shapes={[<TimeTilesView key="widest" tiles={WIDEST_TILES} />]}>
        {data ? (
          <TimeTiles schedule={data.schedule} location={data.location} />
        ) : (
          <TimeTilesView tiles={SKELETON_TILES} />
        )}
      </Sizer>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {data ? (
          <Week now={data.now} location={data.location} settings={data.settings} />
        ) : (
          <WeekView rows={SKELETON_WEEK} />
        )}
        <div className="space-y-4">
          <Sizer
            shapes={QIBLA_SHAPES.map((shape) => <QiblaView key={shape.direction} {...shape} />)}
          >
            {data ? (
              <Qibla location={data.location} />
            ) : (
              <div className={cn(panelClass, "absolute inset-0 space-y-4")}>
                <Skeleton className="h-3 w-16" />
                <div className="flex items-center gap-5">
                  <Skeleton className="size-28 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </div>
            )}
          </Sizer>
          <CalculationPanel />
        </div>
      </div>
    </div>
  )
}

/**
 * The prayer-times page body: next prayer, today's times, the week, Qibla and settings; or,
 * without a saved location, the setup. Until this browser's location is read (and in the
 * prerendered page) both are there, and the pre-paint script (src/lib/prepaint.ts) shows the
 * one that applies, so the page has its final layout from the first paint.
 */
export function PrayerDashboard() {
  const { state, now, location, settings, schedule } = useSchedule()
  const showSetup = !state || !location
  const showDashboard = !state || Boolean(location)
  return (
    <>
      {showSetup ? (
        <div data-only-prayer={state ? undefined : "none"}>
          <PrayerSetup />
        </div>
      ) : null}
      {showDashboard ? (
        <div data-only-prayer={state ? undefined : "located"}>
          <LocatedDashboard
            data={location && schedule && now ? { schedule, now, location, settings } : null}
          />
        </div>
      ) : null}
    </>
  )
}

// ---------- home page card ----------

/**
 * Home page card: the next prayer with a countdown and today's five times, or a button to
 * share the location. A skeleton of the same size while prerendered: it depends on this browser.
 */
export function NextPrayerCard({ className }: { className?: string }) {
  const { state, now, location, schedule } = useSchedule()
  const { status, locate } = useLocate()
  const ready = state !== null && (!location || schedule !== null)

  return (
    <section
      aria-labelledby="next-prayer-heading"
      aria-busy={!ready}
      className={cn(panelClass, "flex min-h-52 flex-col gap-4 sm:p-6", className)}
    >
      <CornerLattice className="size-56 opacity-60" />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="next-prayer-heading" className={factClass}>
            {!ready ? (
              <>
                <span className="sr-only">Prayer times</span>
                <SkeletonText>Current prayer</SkeletonText>
              </>
            ) : schedule ? (
              headingOf(schedule)
            ) : (
              "Prayer times"
            )}
          </h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {!ready ? (
              <SkeletonText>Dhaka, Bangladesh</SkeletonText>
            ) : location ? (
              location.name
            ) : (
              // A non-breaking space: keeps the line's height when there's no location.
              " "
            )}
          </p>
        </div>
        <Link
          to="/prayer-times"
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
        >
          All times
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </Link>
      </div>

      {/* Every state (loading, each prayer, no location) fills the room of the tallest. */}
      <Sizer
        className="flex-1"
        shapes={PRAYER_NOW_SHAPES.map((shape) => (
          <div key={`${shape.label}-${"start" in shape.when}`} className="flex flex-col gap-4">
            <PrayerNowView {...shape} size="md" />
            <TodayTimes times={WIDEST_TODAY_TIMES} />
          </div>
        ))}
      >
        {!ready ? (
          <div className="absolute inset-0 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2.5">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-10 w-20" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="mt-auto grid grid-cols-5 gap-1">
              {SALAH_NAMES.map((name) => (
                <div key={name} className="flex flex-col items-center gap-1.5 py-1.5">
                  <Skeleton className="h-2.5 w-9" />
                  <Skeleton className="h-4 w-10" />
                </div>
              ))}
            </div>
          </div>
        ) : location && schedule && now ? (
          <div className="flex animate-in flex-col gap-4 duration-300 fade-in-0 motion-reduce:animate-none">
            <PrayerNow schedule={schedule} now={now} location={location} size="md" />
            <TodayTimes
              times={SALAH_NAMES.map((name) => ({
                name,
                label: prayerLabel(name, schedule.today.date),
                time: formatClock(schedule.today[name], location.timeZone),
                current: name === schedule.current,
              }))}
            />
          </div>
        ) : (
          <div className="flex animate-in flex-col justify-end gap-3 duration-300 fade-in-0 motion-reduce:animate-none">
            <p className="text-sm text-pretty text-muted-foreground">
              See today's prayer times and a countdown to the next one, worked out in your browser
              for where you are.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Button size="sm" onClick={() => locate()} disabled={status.state === "locating"}>
                {status.state === "locating" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <LocateFixed />
                )}
                Use my location
              </Button>
              <Link to="/prayer-times" className="text-sm font-medium hover:underline">
                or search for a city
              </Link>
            </div>
            {status.state === "error" ? (
              <p role="alert" className="text-xs text-destructive">
                {status.message}
              </p>
            ) : null}
          </div>
        )}
      </Sizer>
    </section>
  )
}

const SALAH_NAMES = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const

/** Today's five times along the bottom of the home card. */
function TodayTimes({
  times,
}: {
  times: readonly { name: string; label: string; time: string; current: boolean }[]
}) {
  return (
    <ul className="mt-auto grid grid-cols-5 gap-1 text-center">
      {times.map(({ name, label, time, current }) => (
        <li
          key={name}
          aria-current={current ? "time" : undefined}
          className={cn("rounded-lg px-0.5 py-1.5", current && "bg-gold/10 ring-1 ring-gold/50")}
        >
          <span className="block text-2xs text-muted-foreground">{label}</span>
          <span className="block text-sm font-medium tabular-nums">{time}</span>
        </li>
      ))}
    </ul>
  )
}

/** TodayTimes with the widest labels and times, for the sizer. */
const WIDEST_TODAY_TIMES = SALAH_NAMES.map((name) => ({
  name,
  label: name === "dhuhr" ? "Jumu'ah" : PRAYERS[name].label,
  time: WIDEST_CLOCK,
  current: false,
}))
