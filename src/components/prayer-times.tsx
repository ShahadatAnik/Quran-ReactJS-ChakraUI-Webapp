import { Link } from "@tanstack/react-router"
import { ArrowRight, Loader2, LocateFixed, MapPin, Search } from "lucide-react"
import { useEffect, useId, useMemo, useState } from "react"
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
  const endingSoon = running !== null && left <= ENDING_SOON_MS
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
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p
            className={cn(
              "font-heading font-semibold tracking-tight",
              size === "lg" ? "text-4xl md:text-5xl" : "text-3xl"
            )}
          >
            {prayerLabel(name, running ? today.date : next.date)}
          </p>
          <p className="mt-1 text-muted-foreground tabular-nums">
            {running ? (
              <>
                <span className="font-medium text-foreground">{time(running.start)}</span>
                {" – "}
                <span className="font-medium text-foreground">{time(running.end)}</span>
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{time(next.time)}</span>
                {" · in "}
                {formatCountdown(next.time.getTime() - now.getTime())}
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
          <span className="arabic-glyph-centred">{PRAYERS[name].arabic}</span>
        </p>
      </div>
      {running ? (
        <div className="space-y-1.5">
          {/* How much of the prayer's time has passed; the text below says how much is left. */}
          <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
            <div
              className={cn(
                "h-full rounded-full transition-width duration-1000 ease-linear motion-reduce:transition-none",
                endingSoon ? "ending-soon bg-destructive" : "bg-gold"
              )}
              style={{ width: `${elapsed}%` }}
            />
          </div>
          <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm tabular-nums">
            <span className={cn("font-medium", endingSoon && "ending-soon text-destructive")}>
              {formatCountdown(left)} left
            </span>
            <span className="text-muted-foreground">
              Then {prayerLabel(next.name, next.date)} at {time(next.time)}
            </span>
          </p>
        </div>
      ) : null}
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
  const degrees = Math.round(bearing)
  return (
    <section aria-labelledby="qibla-heading" className={cn(panelClass, "space-y-4")}>
      <CornerLattice />
      <h2 id="qibla-heading" className={factClass}>
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
          <p className="text-3xl font-semibold tabular-nums">{degrees}°</p>
          <p className="text-sm text-muted-foreground">
            From true north, towards the {COMPASS_WORDS[compassPoint(bearing)]}.
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        A phone compass may point to magnetic north, a few degrees away in some places.
      </p>
    </section>
  )
}

function TimeTiles({ schedule, location }: { schedule: Schedule; location: PrayerLocation }) {
  const { today, current, next } = schedule
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {PRAYER_NAMES.map((name) => {
        const isCurrent = name === current
        const isNext = name === next.name && next.date === today.date
        return (
          <li
            key={name}
            aria-current={isCurrent ? "time" : undefined}
            className={cn(
              "relative rounded-2xl bg-card p-4 ring-1 ring-foreground/10",
              isCurrent && "bg-gold/5 ring-2 ring-gold/60",
              name === "sunrise" && "bg-muted/40"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{prayerLabel(name, today.date)}</p>
              <p lang="ar" dir="rtl" aria-hidden="true" className="text-lg text-gold">
                <span className="arabic-glyph-centred">{PRAYERS[name].arabic}</span>
              </p>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {formatTime(today[name], location.timeZone)}
            </p>
            <p className="mt-1 h-4 text-xs font-medium tracking-wide text-gold uppercase">
              {isCurrent ? "Now" : isNext ? "Next" : name === "sunrise" ? "Fajr ends" : ""}
            </p>
          </li>
        )
      })}
    </ul>
  )
}

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
    <section aria-labelledby="week-heading" className={cn(panelClass, "space-y-4")}>
      <CornerLattice />
      <h2 id="week-heading" className={factClass}>
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
            {week.map((times, index) => (
              <tr
                key={`${times.date.month}-${times.date.day}`}
                className={cn("border-t border-border/50", index === 0 && "font-semibold")}
              >
                <th
                  scope="row"
                  className="px-1 py-2 text-left font-medium whitespace-nowrap sm:px-2"
                >
                  {index === 0 ? "Today" : <ShortDate date={times.date} />}
                </th>
                {PRAYER_NAMES.map((name) => (
                  <td
                    key={name}
                    className={cn(
                      "px-1 py-2 text-right sm:px-2",
                      name === "sunrise" && "hidden text-muted-foreground sm:table-cell"
                    )}
                  >
                    {formatClock(times[name], location.timeZone)}
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

/** The prayer-times page body: next prayer, today's times, the week, Qibla and settings. */
export function PrayerDashboard() {
  const { state, now, location, settings, schedule } = useSchedule()

  if (!state || (location && !schedule)) {
    return <div aria-busy="true" className={cn(panelClass, "min-h-72")} />
  }

  if (!location || !schedule || !now) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section aria-labelledby="location-heading" className={cn(panelClass, "space-y-5 p-6")}>
          <CornerLattice className="size-72" />
          <div className="space-y-1.5">
            <h2 id="location-heading" className="font-heading text-xl font-semibold">
              Where are you praying?
            </h2>
            <p className="text-sm text-pretty text-muted-foreground">
              Prayer times depend on where you are. Share your location once, or search for your
              city, and the times are worked out right here in your browser.
            </p>
          </div>
          <LocationSetup />
        </section>
        <section aria-labelledby="calc-heading" className={cn(panelClass, "space-y-4")}>
          <h2 id="calc-heading" className={factClass}>
            Calculation
          </h2>
          <PrayerSettingsFields />
        </section>
      </div>
    )
  }

  const today = schedule.today.date
  const hijri = hijriDate(today)
  const note = timeZoneNote(location)

  return (
    <div className="animate-in space-y-4 duration-300 fade-in-0 motion-reduce:animate-none">
      <section aria-labelledby="next-heading" className={cn(panelClass, "space-y-5 p-6 md:p-8")}>
        <CornerLattice className="size-80" />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h2 id="next-heading" className={factClass}>
              {headingOf(schedule)}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">
                {location.name}
                {location.source === "gps" ? ` · ${formatCoordinates(location)}` : ""}
              </span>
            </p>
          </div>
          <ChangeLocation />
        </div>
        <PrayerNow schedule={schedule} now={now} location={location} />
        <p className="text-sm text-muted-foreground">
          {formatDay(today)}
          {hijri ? ` · ${hijri}` : ""}
          {note ? <span className="block text-xs">{note}</span> : null}
        </p>
      </section>

      <TimeTiles schedule={schedule} location={location} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Week now={now} location={location} settings={settings} />
        <div className="space-y-4">
          <Qibla location={location} />
          <section aria-labelledby="calc-heading" className={cn(panelClass, "space-y-4")}>
            <h2 id="calc-heading" className={factClass}>
              Calculation
            </h2>
            <PrayerSettingsFields />
          </section>
        </div>
      </div>
    </div>
  )
}

// ---------- home page card ----------

/**
 * Home page card: the next prayer with a countdown and today's five times, or a button to
 * share the location. Empty (same size) while prerendered, since it depends on this browser.
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
            {schedule ? headingOf(schedule) : location ? "Next prayer" : "Prayer times"}
          </h2>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {location ? location.name : " "}
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

      {!ready ? null : location && schedule && now ? (
        <div className="flex flex-1 animate-in flex-col gap-4 duration-300 fade-in-0 motion-reduce:animate-none">
          <PrayerNow schedule={schedule} now={now} location={location} size="md" />
          <ul className="mt-auto grid grid-cols-5 gap-1 text-center">
            {(["fajr", "dhuhr", "asr", "maghrib", "isha"] as const).map((name) => (
              <li
                key={name}
                aria-current={name === schedule.current ? "time" : undefined}
                className={cn(
                  "rounded-lg px-0.5 py-1.5",
                  name === schedule.current && "bg-gold/10 ring-1 ring-gold/50"
                )}
              >
                <span className="block text-2xs text-muted-foreground">
                  {prayerLabel(name, schedule.today.date)}
                </span>
                <span className="block text-sm font-medium tabular-nums">
                  {formatClock(schedule.today[name], location.timeZone)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex flex-1 animate-in flex-col justify-end gap-3 duration-300 fade-in-0 motion-reduce:animate-none">
          <p className="text-sm text-pretty text-muted-foreground">
            See today's prayer times and a countdown to the next one, worked out in your browser for
            where you are.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button size="sm" onClick={() => locate()} disabled={status.state === "locating"}>
              {status.state === "locating" ? <Loader2 className="animate-spin" /> : <LocateFixed />}
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
    </section>
  )
}
