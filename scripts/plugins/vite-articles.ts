/**
 * Lets the site import the Markdown articles (src/content/posts/*.md) directly, with no
 * generated files: `virtual:posts` is every article's details, newest first, and an article's
 * .md file is its text, as blocks. scripts/plugins/bun-articles.ts does the same for Bun.
 * In `bun run dev`, editing, adding or removing an article reloads the page.
 */
import type { Plugin } from "vite"
import { POST_FILE, POSTS_DIR, postBodyModule, postsModule } from "../../src/lib/post-markdown"

const VIRTUAL = "virtual:posts"
const RESOLVED = `\0${VIRTUAL}`

export function articles(): Plugin {
  return {
    name: "ilmiyah:articles",
    // Before Vite's own handling, which would read a .md file as JavaScript.
    enforce: "pre",
    resolveId: (id) => (id === VIRTUAL ? RESOLVED : undefined),
    load: (id) => (id === RESOLVED ? postsModule() : undefined),
    transform(code, id) {
      const path = id.split("?")[0] ?? id
      return POST_FILE.test(path) ? { code: postBodyModule(code, path), map: null } : undefined
    },
    configureServer(server) {
      server.watcher.add(POSTS_DIR)
      const onChange = (path: string) => {
        if (!POST_FILE.test(path)) return
        for (const environment of Object.values(server.environments)) {
          const module = environment.moduleGraph.getModuleById(RESOLVED)
          if (module) environment.moduleGraph.invalidateModule(module)
        }
        server.ws.send({ type: "full-reload" })
      }
      server.watcher.on("change", onChange)
      server.watcher.on("add", onChange)
      server.watcher.on("unlink", onChange)
    },
  }
}
