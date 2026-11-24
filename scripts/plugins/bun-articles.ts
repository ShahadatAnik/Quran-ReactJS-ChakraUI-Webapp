/**
 * Lets Bun (tests and scripts) import the Markdown articles, as Vite does through
 * scripts/plugins/vite-articles.ts: `virtual:posts` is every article's details, and an
 * article's .md file is its text. Registered as a preload in bunfig.toml.
 */
import { plugin } from "bun"
import { POST_FILE, postBodyModule, postsModule } from "../../src/lib/post-markdown"

plugin({
  name: "articles",
  setup(build) {
    build.module("virtual:posts", async () => ({ contents: await postsModule(), loader: "js" }))
    // Bun matches the filter natively, so it stays simple; POST_FILE picks out the articles,
    // and any other Markdown file imports as its text.
    build.onLoad({ filter: /\.md$/ }, async ({ path }) => {
      const source = await Bun.file(path).text()
      return POST_FILE.test(path)
        ? { contents: postBodyModule(source, path), loader: "js" }
        : { contents: `export default ${JSON.stringify(source)}`, loader: "js" }
    })
  },
})
