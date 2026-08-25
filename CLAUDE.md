# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Gabriel Perales's personal site/blog (gabriel.perales.me), built on the `tailwind-nextjs-starter-blog` template (Next.js App Router + Contentlayer2 + Tailwind CSS v4). Deployed as a static export to GitHub Pages via `.github/workflows/pages.yml` on every push to `main`.

## Commands

Package manager is Yarn (v3.6.1, via corepack/`.yarnrc.yml`).

- `yarn dev` — start dev server (`next dev`)
- `yarn build` — production build; also runs `scripts/postbuild.mjs` (generates RSS feed via `scripts/rss.mjs`)
- `yarn serve` — run the production build (`next start`)
- `yarn lint` — `next lint --fix` over `app`, `components`, `lib`, `layouts`, `scripts`
- `yarn prettier` — format all files (`prettier --write`)
- `yarn analyze` — build with bundle analyzer enabled

There is no test suite/runner in this repo.

Static export for GitHub Pages is produced with `EXPORT=1 UNOPTIMIZED=1 yarn build` (see `next.config.js` / the Pages workflow) — this yields the `out/` directory.

Pre-commit: Husky runs `lint-staged`, which runs `eslint --fix` on JS/TS files and `prettier --write` on JS/TS/JSON/CSS/MD/MDX.

## Architecture

- **Content pipeline**: Blog posts live as Markdown/MDX in `data/blog/**/*.mdx` (some are plain `.md`, e.g. current posts under `data/blog/`), author bios in `data/authors/**/*.mdx`. `contentlayer.config.ts` defines the `Blog` and `Authors` document types, computed fields (`readingTime`, `slug`, `toc`, `structuredData`, etc.), and the remark/rehype plugin pipeline (KaTeX, citations via `rehype-citation` reading `data/references-data.bib`, Prism syntax highlighting, GitHub-style alerts, autolinked headings). On successful content build it also regenerates `app/tag-data.json` (tag counts) and `public/search.json` (search index for kbar).
- **Routing (App Router)**: pages live under `app/`. Key routes: `app/page.tsx` (home), `app/blog/page.tsx` + `app/blog/page/[page]` (paginated list), `app/blog/[...slug]` (individual post), `app/tags/page.tsx` + `app/tags/[tag]` (tag listings), `app/projects/page.tsx`, `app/about/page.tsx`, `app/api/newsletter` (newsletter subscribe API route).
- **Layouts vs components**: `layouts/` holds post/list templates selected per-post via the MDX frontmatter `layout` field (`PostLayout`, `PostSimple`, `PostBanner`, `ListLayout`, `ListLayoutWithTags`, `AuthorLayout`). `components/` holds reusable UI (Header, Footer, MobileNav, SearchButton, Comments, ThemeSwitch, etc.). `components/MDXComponents.tsx` wires custom components (e.g. `<TOCInline>`, `<Pre>`, table wrapper, `next/image`) available inside MDX content.
- **Site configuration is data-driven**: most customization happens in `data/` rather than code — `data/siteMetadata.js` (site title, author, analytics/comments/search/newsletter provider config), `data/headerNavLinks.ts` (nav bar), `data/projectsData.ts` (projects page content), `data/logo.svg`.
- **Pliny integration**: `pliny` (by the template author) supplies comments (Giscus is enabled), newsletter providers, and search (kbar) — configured through `data/siteMetadata.js`. Enabling a new comments provider also requires adding its domain to the CSP in `next.config.js`.
- **Analytics**: Kobbe (`https://kobbe.io`), not one of pliny's built-in providers, so it's injected manually as a `next/script` tag in `app/layout.tsx` (not via pliny's `<Analytics>` component). Its `data-token` lives in `data/siteMetadata.js` under `kobbeAnalytics.token`. `app.kobbe.io` must stay listed in the CSP `script-src` in `next.config.js`.
- **Path aliases** (`tsconfig.json`): `@/components/*`, `@/data/*`, `@/layouts/*`, `@/css/*`, plus `contentlayer/generated` for Contentlayer's generated types/data.
- **Env vars**: see `.env.example` for Giscus/Utterances/Disqus and newsletter provider (Mailchimp, Buttondown, ConvertKit, Klaviyo, Revue, EmailOctopus, Beehiiv) credentials.

## Adding a blog post

Create a `.mdx` (or `.md`) file in `data/blog/` with frontmatter: `title`, `date`, `tags`, `draft`, `summary`, `images` (optional `lastmod`, `authors`, `layout`, `bibliography`, `canonicalUrl`). Contentlayer picks it up automatically in dev/build; tag counts and the search index regenerate on build.
