/**
 * Imports served by the articles plugins (scripts/plugins/vite-articles.ts for the site,
 * scripts/plugins/bun-articles.ts for tests and scripts), read from src/content/posts/*.md.
 */

/** Every article's details, newest first. */
declare module "virtual:posts" {
  const posts: readonly import("./posts").Post[]
  export default posts
}

/** An article's text. */
declare module "*.md" {
  const blocks: import("./types").Block[]
  export default blocks
}
