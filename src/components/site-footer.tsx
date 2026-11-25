import { Link } from "@tanstack/react-router"
import { Globe } from "lucide-react"
import { FacebookIcon, GitHubIcon, YouTubeIcon } from "@/components/icons"
import { LogoMark } from "@/components/logo-mark"
import { useMounted } from "@/hooks/use-mounted"
import { appPages, POPULAR_SURAHS, postPages, surahPages } from "@/lib/pages"
import { site } from "@/lib/site"

const socialIcons = {
  Website: Globe,
  Facebook: FacebookIcon,
  GitHub: GitHubIcon,
  YouTube: YouTubeIcon,
} as const

const linkClass = "text-muted-foreground transition-colors hover:text-foreground"

export function SiteFooter() {
  const mounted = useMounted()

  const columns = [
    {
      heading: "Quran",
      links: appPages.filter((p) => p.section === "Quran" || p.section === "Prayer"),
    },
    {
      heading: "Popular surahs",
      links: POPULAR_SURAHS.slice(0, 5).flatMap((n) => surahPages[n - 1] ?? []),
    },
    {
      heading: "Articles",
      links: [
        ...postPages.slice(0, 4),
        ...appPages.filter((p) => p.section === "Articles" || p.section === "About"),
      ],
    },
  ]

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <p className="flex items-center gap-3">
            <LogoMark className="size-10" />
            <span className="font-semibold tracking-wordmark">ILMIYAH</span>
          </p>
          <p className="max-w-xs text-sm text-muted-foreground">{site.tagline}.</p>
          <ul className="flex gap-1" aria-label="Developer links">
            {site.social.map(({ label, href }) => {
              const Icon = socialIcons[label]
              return (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${site.author.name} on ${label}`}
                    className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
        {columns.map((column) => (
          <nav key={column.heading} aria-label={column.heading} className="space-y-3 text-sm">
            <h2 className="font-medium">{column.heading}</h2>
            <ul className="space-y-2">
              {column.links.map((page) => (
                <li key={page.path}>
                  <Link
                    {...page.link}
                    className={linkClass}
                    lang={page.lang === "bn" ? "bn" : undefined}
                  >
                    {page.kind === "post" ? page.post.shortTitle : page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {/* The year is read in the browser, so a prerendered page never shows a stale one. Its
              four digits (tabular, so 4ch) are reserved, so the line doesn't move when it appears. */}
          <p>
            ©{" "}
            <span className="inline-block w-[4ch] tabular-nums">
              {mounted ? new Date().getFullYear() : null}
            </span>{" "}
            ILMIYAH · Built by{" "}
            <a
              href={site.author.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {site.author.name}
            </a>
          </p>
          <p>
            Quran text from{" "}
            <a
              href={site.sources.text.href}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {site.sources.text.label}
            </a>
            , audio from{" "}
            <a
              href={site.sources.audio.href}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {site.sources.audio.label}
            </a>
            .{" "}
            <a
              href={site.repository}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              Source on GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
