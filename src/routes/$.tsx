import { createFileRoute } from "@tanstack/react-router"
import { NotFound } from "@/components/not-found"

/**
 * Catch-all route for unknown URLs.
 *
 * In production, Netlify serves the prerendered SPA shell (/_shell.html, see vite.config.ts)
 * for any unknown URL, and this route then renders on the client. `ssr: false` makes the
 * server and the hydrating client agree to leave this route's slot empty during hydration,
 * so the shell hydrates cleanly whatever the URL is. Title and noindex come from the root
 * route's head().
 */
export const Route = createFileRoute("/$")({
  ssr: false,
  component: NotFound,
})
