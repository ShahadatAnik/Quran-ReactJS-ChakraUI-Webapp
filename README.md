<div align="center">
  <img src="public/icon-192.png" alt="" width="80" height="80">

  <h3 align="center">ILMIYAH · ইলমিয়াহ</h3>

  <p align="center">
    A daily dose of Islamic knowledge.
    <br />
    <a href="https://ilmiyah.netlify.app/">ilmiyah.netlify.app</a>
  </p>
</div>

Read all 114 surahs of the Quran in Arabic with Bangla translation and verse-by-verse
recitation, search the Quran in 40+ languages, and read Bangla articles grounded in the Quran
and hadith.

## Features

- **Surahs** (`/surah`, `/surah/1` … `/surah/114`): Arabic (Simple script) with the Bangla
  translation by Muhiuddin Khan, prerendered as static HTML. Every ayah has a permalink
  (`/surah/2#ayah-255`) and a copy-link button.
- **Audio**: one player for the whole site. "Play from here" continues through the surah,
  with 16 reciters, lock-screen controls and a seek bar.
- **Reader settings**: Arabic script, translation (any AlQuran Cloud edition), translation
  on/off, Arabic text size and reciter, in the header on every page and saved in the browser.
- **Continue reading**: the last ayah read is remembered and offered on the home page.
- **Find an ayah** (`/ayah`): pick a surah and ayah, or type `2:255` (Bangla digits work too).
- **Search** (`/search`): full-text search in any translation, with highlighted matches.
- **Articles** (`/blog`) and **writers** (`/writers`).
- **Ctrl/⌘ K**: jump to any surah, page, article or ayah reference.
- Light, dark and system themes; works down to 360px; keyboard accessible.

## Stack

[Bun](https://bun.sh) (package manager, runtime, test runner) ·
[TanStack Start](https://tanstack.com/start) + Router · React 19 · TypeScript (strict) ·
Vite · Tailwind CSS 4 · shadcn/ui · Biome · deployed as a static site on Netlify.

## Development

```sh
bun install
bun run dev          # http://localhost:3000
bun run validate     # lint, typecheck, test, build — the same steps as CI
```

| Script                           | What it does                                                         |
| -------------------------------- | -------------------------------------------------------------------- |
| `dev` / `build` / `preview`      | Vite dev server, production build (prerenders every page), preview   |
| `check` / `check:fix` / `format` | Biome lint and format                                                |
| `typecheck` / `test`             | `tsc --noEmit` / `bun test`                                          |
| `generate:og`                    | Open Graph images and `llms.txt` (runs automatically before `build`) |
| `generate:icons`                 | Favicons and app icons from `src/components/logo-mark.tsx`           |
| `fetch:quran`                    | Re-downloads the bundled Quran text into `src/data`                  |
| `serve:dist` / `verify`          | Serve `dist/client` like Netlify; check every page in Chrome         |

## How it fits together

- `src/lib/pages.ts` is the single registry of pages. Navigation, the command menu,
  the footer, the sitemap, Open Graph images and `llms.txt` are all generated from it,
  and tests enforce the SEO title and description lengths.
- `src/lib/` holds the logic (surahs, audio URLs, search, editions, SEO), each module
  with a `*.test.ts` beside it.
- `src/data/` is the Quran text (from AlQuran Cloud) and surah names (from Quran.com),
  produced by `scripts/fetch-quran.ts`, which also validates every ayah count.
- `src/content/` holds the articles as typed blocks, plus the writers.
- Bangla and Arabic in the Open Graph images are shaped with HarfBuzz
  (`scripts/lib/shape-text.ts`), because satori and resvg can't shape these scripts.

## Credits

Quran text: [AlQuran Cloud](https://alquran.cloud/). Surah names in Bangla:
[Quran.com](https://quran.com/). Recitations: [Islamic Network](https://islamic.network/).
Articles by Monthly At-Tahreek, Nusus and Dr. Khondokar Abdullah Jahangir. See
[/writers](https://ilmiyah.netlify.app/writers).

## Author

**Shahadat Anik** · [shahadatanik.github.io](https://shahadatanik.github.io/) ·
[@ShahadatAnik](https://github.com/ShahadatAnik)
