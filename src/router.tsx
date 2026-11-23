import { createRouter } from "@tanstack/react-router"
import { DefaultErrorComponent } from "@/components/error-boundary"
import { NotFound } from "@/components/not-found"
import { routeTree } from "./routeTree.gen"

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent,
    defaultNotFoundComponent: NotFound,
    // Animate page changes with the View Transitions API (styles in styles.css). Hash links
    // (ayah permalinks) and search-param updates on the same page swap instantly. Browsers
    // without support, or users who prefer reduced motion, get an instant swap.
    defaultViewTransition: {
      types: ({ pathChanged }) => (pathChanged ? ["page"] : false),
    },
  })
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
