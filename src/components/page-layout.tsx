import { Link } from "@tanstack/react-router"
import { Fragment, type ReactNode } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { PageLink } from "@/lib/pages"
import { cn } from "@/lib/utils"

export interface Crumb {
  label: string
  link: PageLink
}

interface PageLayoutProps {
  /** Ancestors between Home and the current page. */
  trail?: readonly Crumb[]
  /** Short label for the current page in the breadcrumb. */
  crumb: string
  /** The page's only h1. */
  title: ReactNode
  description?: ReactNode
  /** Small facts under the description (e.g. a surah's revelation, length and juz). */
  meta?: ReactNode
  /** Leading visual next to the title (icon tile, surah number…). */
  media?: ReactNode
  /** Shown at the right of the title row (e.g. a surah's Arabic name on phones). */
  titleAside?: ReactNode
  /** Buttons shown next to the title. */
  actions?: ReactNode
  /** Language of the title and description when they differ from the page. */
  lang?: "bn"
  /** Narrower measure for reading pages. */
  width?: "default" | "reading"
  children: ReactNode
}

/** Shared frame for every page: breadcrumb, a single h1, description and actions. */
export function PageLayout({
  trail = [],
  crumb,
  title,
  description,
  meta,
  media,
  titleAside,
  actions,
  lang,
  width = "default",
  children,
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 sm:px-6 md:py-12",
        width === "reading" ? "max-w-4xl" : "max-w-6xl"
      )}
    >
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {trail.map((item) => (
            <Fragment key={item.label}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link {...item.link}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </Fragment>
          ))}
          <BreadcrumbSeparator />
          <BreadcrumbItem className="min-w-0">
            <BreadcrumbPage lang={lang} className="truncate">
              {crumb}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          {media}
          <div className="min-w-0 flex-1 space-y-1.5">
            <h1
              lang={lang}
              className="font-heading text-2xl font-semibold tracking-tight text-balance md:text-3xl"
            >
              {title}
            </h1>
            {description ? (
              <p
                lang={lang}
                className="max-w-2xl text-sm text-pretty text-muted-foreground md:text-base"
              >
                {description}
              </p>
            ) : null}
            {meta}
          </div>
          {titleAside}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </header>

      <div className="mt-8">{children}</div>
    </div>
  )
}

/** Icon tile used as the `media` of app pages. */
export function IconTile({ icon: Icon }: { icon: (props: { className?: string }) => ReactNode }) {
  return (
    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
      <Icon className="size-6" aria-hidden="true" />
    </div>
  )
}
