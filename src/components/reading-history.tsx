import { Link } from "@tanstack/react-router"
import { ArrowRight, Flame, History, Trash2 } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { clearReadingLog, useReadingLog } from "@/hooks/use-reading-log"
import {
  addDays,
  type DaySummary,
  dayKey,
  displayRanges,
  type HeatmapCell,
  heatmap,
  khatmShare,
  parseRanges,
  READ_AFTER_MS,
  type ReadingStats,
  readingStats,
} from "@/lib/reading-log"
import { AYAH_COUNT, ayahId, getSurah, surahs } from "@/lib/surahs"
import { cn } from "@/lib/utils"

/** Weeks in the reading calendar (about half a year). */
const WEEKS = 26
const DAYS_SHOWN = 7

const number = (n: number) => n.toLocaleString("en")
const plural = (n: number, word: string) => `${number(n)} ${word}${n === 1 ? "" : "s"}`
/** "0.1%", "6.6%", "42%". */
const percent = (share: number) =>
  `${(share * 100).toFixed(share > 0 && share < 0.1 ? 1 : 0).replace(/\.0$/, "")}%`

/** "12 min", "1 h 5 min", or "under a minute". */
function duration(seconds: number): string {
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return "under a minute"
  if (minutes < 60) return `${minutes} min`
  const rest = minutes % 60
  return rest ? `${Math.floor(minutes / 60)} h ${rest} min` : `${minutes / 60} h`
}

const parseKey = (key: string) => {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(y as number, (m as number) - 1, d)
}
const longDate = new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short" })
const shortMonth = new Intl.DateTimeFormat("en", { month: "short" })

/** "Today", "Yesterday", or "Mon, 18 Nov". */
function dayLabel(key: string, today: Date): string {
  if (key === dayKey(today)) return "Today"
  if (key === dayKey(addDays(today, 1))) return "Yesterday"
  return longDate.format(parseKey(key))
}

/** The reader's statistics, or null while prerendering and hydrating. */
function useReadingStats(): { stats: ReadingStats; today: Date } | null {
  const log = useReadingLog()
  const today = useMemo(() => new Date(), [])
  return useMemo(() => (log ? { stats: readingStats(log, today), today } : null), [log, today])
}

/**
 * The reader's most-read surahs (by days with any reading), most first; null while
 * prerendering and hydrating, and empty for a reader with no history yet.
 */
export function useFrequentSurahs(limit: number): ReadingStats["frequency"] | null {
  const data = useReadingStats()
  return useMemo(() => (data ? data.stats.frequency.slice(0, limit) : null), [data, limit])
}

// ---------- the line on the Continue reading card ----------

/**
 * One line under "Continue reading" on the home page: streak, ayahs read and Khatm share,
 * with a link to the full history. The prerendered line is the plain link, so the card keeps
 * its height when the numbers arrive.
 */
export function ReadingStrip() {
  const data = useReadingStats()
  const stats = data?.stats
  const summary = !stats
    ? null
    : stats.daysActive === 0
      ? `No reading yet. An ayah counts after ${READ_AFTER_MS / 1000} seconds on screen.`
      : [
          stats.currentStreak > 0 ? `${plural(stats.currentStreak, "day")} streak` : null,
          `${plural(stats.covered, "ayah")} read`,
          `${percent(khatmShare(stats.covered))} of the Quran`,
        ]
          .filter(Boolean)
          .join(" · ")

  return (
    <div className="flex items-center gap-3 border-t border-border/60 px-4 py-2.5 text-xs">
      {stats && stats.currentStreak > 0 ? (
        <Flame className="size-3.5 shrink-0 text-gold" aria-hidden="true" />
      ) : (
        <History className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
      <span className="min-w-0 flex-1 truncate text-muted-foreground">
        {summary ?? "Your reading history"}
      </span>
      <Link
        to="/history"
        className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline"
      >
        History
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}

// ---------- the history page ----------

/** A headline number with its label and a line of context. */
function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

/** Sequential steps of the brand emerald, from no reading to the most. */
const LEVEL_CLASS = [
  "bg-muted",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
] as const

/**
 * The last weeks as a calendar grid (Saturday at the top), shaded by ayahs read per day. On
 * narrow screens it scrolls sideways and starts at the most recent week.
 */
function ReadingCalendar({ columns, today }: { columns: HeatmapCell[][]; today: Date }) {
  const [hovered, setHovered] = useState<HeatmapCell | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = scroller.current
    if (element) element.scrollLeft = element.scrollWidth
  }, [])
  const active = columns.flat().filter((c) => !c.future && c.ayahs > 0).length

  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 className="font-medium">Last {WEEKS} weeks</h2>
        {/* Readout for the day under the pointer: the chart's tooltip, without covering it. */}
        <p className="text-xs text-muted-foreground tabular-nums">
          {hovered
            ? `${dayLabel(hovered.date, today)}: ${hovered.ayahs ? plural(hovered.ayahs, "ayah") : "no reading"}`
            : `${plural(active, "day")} with reading`}
        </p>
      </div>
      <div ref={scroller} className="mt-4 overflow-x-auto pb-1">
        <div
          role="img"
          aria-label={`Reading calendar: ${plural(active, "day")} with reading in the last ${WEEKS} weeks. The day-by-day list below has the details.`}
          className="inline-flex flex-col gap-1"
        >
          {/* Month names over the first week of each month. */}
          <div className="flex gap-1" aria-hidden="true">
            {columns.map((column, index) => {
              const first = column[0]
              const previous = columns[index - 1]?.[0]
              const label =
                first &&
                (!previous ||
                  parseKey(first.date).getMonth() !== parseKey(previous.date).getMonth())
                  ? shortMonth.format(parseKey(first.date))
                  : ""
              return (
                <span
                  key={first?.date}
                  className="w-3.5 text-[10px] whitespace-nowrap text-muted-foreground"
                >
                  {label}
                </span>
              )
            })}
          </div>
          <div className="flex gap-1" onPointerLeave={() => setHovered(null)}>
            {columns.map((column) => (
              <div key={column[0]?.date} className="flex flex-col gap-1">
                {column.map((cell) => (
                  <span
                    key={cell.date}
                    onPointerEnter={() => setHovered(cell.future ? null : cell)}
                    className={cn(
                      "size-3.5 rounded-[3px] transition-shadow hover:ring-2 hover:ring-foreground/40",
                      cell.future ? "invisible" : LEVEL_CLASS[cell.level]
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground"
        aria-hidden="true"
      >
        Less
        {LEVEL_CLASS.map((level) => (
          <span key={level} className={cn("size-3 rounded-[3px]", level)} />
        ))}
        More
      </div>
    </div>
  )
}

/** Surahs read on the most days, as ranked bars in one hue. */
function MostRead({ frequency }: { frequency: ReadingStats["frequency"] }) {
  const top = frequency.slice(0, 6)
  const most = top[0]?.days ?? 1
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <h2 className="font-medium">Most-read surahs</h2>
      <p className="text-xs text-muted-foreground">Days with any reading of the surah</p>
      <ol className="mt-4 space-y-3.5">
        {top.map(({ surah: n, days, covered }) => {
          const surah = getSurah(n)
          return (
            <li key={n}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <Link
                  to="/surah/$number"
                  params={{ number: String(n) }}
                  className="min-w-0 truncate font-medium hover:underline"
                >
                  {n}. {surah?.name}
                </Link>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {plural(days, "day")}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-primary/15" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(days / most) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {covered === surah?.ayahs
                  ? "Every ayah read"
                  : `${plural(covered, "ayah")} of ${surah?.ayahs} read`}
              </p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/** Each day newest first: the surahs and ayah ranges read, and roughly how long. */
function DayLog({ days, today }: { days: DaySummary[]; today: Date }) {
  const [shown, setShown] = useState(DAYS_SHOWN)
  return (
    <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
      <h2 className="font-medium">Day by day</h2>
      <ol className="mt-2 divide-y divide-border/60">
        {days.slice(0, shown).map((day) => (
          <li key={day.date} className="py-3">
            <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
              <span className="font-medium">{dayLabel(day.date, today)}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {plural(day.ayahs, "ayah")} · {duration(day.seconds)}
              </span>
            </p>
            <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
              {day.entries.map(({ surah, ranges }) => (
                <li key={surah}>
                  <Link
                    to="/surah/$number"
                    params={{ number: String(surah) }}
                    hash={ayahId(parseRanges(ranges)[0] ?? 1)}
                    className="hover:underline"
                  >
                    {getSurah(surah)?.name}{" "}
                    <span className="text-muted-foreground tabular-nums">
                      {displayRanges(ranges)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      {days.length > shown ? (
        <Button variant="ghost" size="sm" onClick={() => setShown((n) => n + 14)}>
          Show earlier days ({days.length - shown} more)
        </Button>
      ) : null}
    </div>
  )
}

/** "Clear history", with a confirmation. Hidden while there's nothing to clear. */
export function ClearHistory() {
  const data = useReadingStats()
  const days = data?.stats.daysActive ?? 0
  if (!days) return null
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Trash2 />
          Clear history
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clear your reading history?</DialogTitle>
          <DialogDescription>
            This removes {plural(days, "day")} of reading from this browser, including your streak
            and Khatm progress. It can't be undone. Your place in the current surah (Continue
            reading) is kept.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Keep it</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="destructive" onClick={clearReadingLog}>
              Clear history
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * The full history: totals and streaks, Khatm progress, a calendar of the last weeks, the
 * most-read surahs and a day-by-day log. It renders once this browser's log has been read
 * (never in prerendered HTML), so it never shows numbers that aren't the reader's.
 */
export function ReadingDashboard() {
  const data = useReadingStats()
  const columns = useMemo(() => (data ? heatmap(data.stats, data.today, WEEKS) : []), [data])
  if (!data) {
    return <div className="min-h-96" aria-busy="true" />
  }
  const { stats, today } = data

  if (stats.daysActive === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-card p-5 text-sm text-muted-foreground ring-1 ring-foreground/10">
        <History className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Nothing here yet. Read any surah and your history builds up on this page: your streak, how
          much of the Quran you've covered, the surahs you return to most, and a day-by-day log.{" "}
          <Link to="/surah" className="font-medium text-primary hover:underline">
            Browse surahs
          </Link>
        </p>
      </div>
    )
  }

  const share = khatmShare(stats.covered)
  const firstDay = stats.days.at(-1)?.date ?? dayKey(today)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Ayahs read"
          value={number(stats.covered)}
          note={`${percent(share)} of the Quran`}
        />
        <StatTile
          label="Days active"
          value={number(stats.daysActive)}
          note={`since ${longDate.format(parseKey(firstDay))}`}
        />
        <StatTile
          label="Current streak"
          value={plural(stats.currentStreak, "day")}
          note={`Longest: ${plural(stats.longestStreak, "day")}`}
        />
        <StatTile
          label="Surahs completed"
          value={number(stats.surahsComplete)}
          note={`of ${surahs.length}, every ayah read`}
        />
      </div>

      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-medium">Khatm progress</h2>
          <p className="text-sm text-muted-foreground tabular-nums">
            {number(stats.covered)} of {number(AYAH_COUNT)} ayahs · {percent(share)}
          </p>
        </div>
        {/* The figures above say the same in text; the bar is their picture. */}
        <div aria-hidden="true" className="mt-3 h-2 rounded-full bg-primary/15">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${share > 0 ? Math.max(share * 100, 0.5) : 0}%` }}
          />
        </div>
      </div>

      <ReadingCalendar columns={columns} today={today} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_1.4fr]">
        <MostRead frequency={stats.frequency} />
        <DayLog days={stats.days} today={today} />
      </div>
    </div>
  )
}
