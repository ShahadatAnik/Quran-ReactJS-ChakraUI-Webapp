import geistFont from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { createRootRoute, HeadContent, ScriptOnce, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import type { ReactNode } from "react"
import { AudioPlayer } from "@/components/audio-player"
import { BackToTop } from "@/components/back-to-top"
import { ReaderProvider } from "@/components/reader-provider"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider, themeScript } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { site } from "@/lib/site"
import appCss from "../styles.css?url"

/** True when the catch-all route (src/routes/$.tsx) or a route loader rendered Not Found. */
const isNotFoundPage = (matches: readonly { routeId: string; status: string }[]) =>
  matches.at(-1)?.routeId === "/$" || matches.some((match) => match.status === "notFound")

export const Route = createRootRoute({
  head: ({ matches }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "description", content: site.description },
      { name: "author", content: site.author.name },
      { name: "color-scheme", content: "light dark" },
      { name: "application-name", content: site.name },
      { name: "apple-mobile-web-app-title", content: site.shortName },
      { name: "format-detection", content: "telephone=no" },
      ...(isNotFoundPage(matches)
        ? [{ title: `Page not found | ${site.name}` }, { name: "robots", content: "noindex" }]
        : [
            {
              name: "robots",
              content:
                "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
            },
          ]),
    ],
    links: [
      {
        rel: "preload",
        href: geistFont,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      // Audio streams from this CDN; connect early so the first play starts faster.
      { rel: "preconnect", href: "https://cdn.islamic.network", crossOrigin: "anonymous" },
      // Icons are generated from the logo by scripts/generate-icons.tsx.
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ScriptOnce>{themeScript}</ScriptOnce>
        <HeadContent />
        {/* Rendered here, not in head(): head() dedupes meta by name, which would drop one. */}
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content={site.themeColor.light}
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content={site.themeColor.dark}
        />
      </head>
      <body>
        <ThemeProvider>
          <ReaderProvider>
            <TooltipProvider>
              <a
                href="#main"
                className="sr-only z-50 rounded-md bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
              >
                Skip to content
              </a>
              <div aria-hidden="true" className="scroll-progress" />
              <div className="relative flex min-h-svh flex-col">
                <SiteHeader />
                <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
                  {children}
                </main>
                <SiteFooter />
                <AudioPlayer />
              </div>
              <BackToTop />
              <Toaster position="top-center" closeButton />
            </TooltipProvider>
          </ReaderProvider>
        </ThemeProvider>
        <TanStackDevtools
          config={{ position: "bottom-left" }}
          plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
        />
        <Scripts />
      </body>
    </html>
  )
}
