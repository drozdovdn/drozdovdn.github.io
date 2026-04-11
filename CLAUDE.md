# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Production build → ./dist/
npm run preview    # Preview production build locally
```

There is no test suite or linter configured in this project.

## Architecture

This is a personal portfolio site for a Senior Frontend Engineer / Web Security Enthusiast, built with **Astro 5** (SSG), **React 18** (islands), **TailwindCSS 4**, and **TypeScript**.

### Key Concepts

- **Astro Islands**: React is only used where client-side interactivity is required (`client:load`). All other components are `.astro` files rendered at build time.
- **Data-driven**: All resume content (experience, skills, education, platforms, navigation) lives in `src/data/*.ts` as typed TypeScript objects — edit these to update site content, not the page files.
- **Content Collections**: Blog posts are Markdown files in `src/content/blog/`. Schema is defined in `src/content/config.ts` (required frontmatter: `title`, `description`, `publishedAt`, `tags`).
- **CSS Variables for theming**: Dark/light theme is implemented via CSS custom properties in `src/styles/global.css` under `@theme {}` and `html.light {}`. The accent color is `--color-accent: #e8622c`.
- **Personal data**: `src/data/personal.ts` contains the owner's name, email, and social links.

### Platform API Integration

The `/platforms` page shows live stats from coding/security platforms:

- `src/utils/platformApiClient.ts` — **client-side** fetchers (runs in browser) for LeetCode (via CORS proxy), Codewars (public API), and GitHub (public API).
- `src/utils/platformApi.ts` — **server-side** fetchers (runs at build time / SSR). Root Me and Hack The Box return `null` (no public API).
- `src/components/PlatformList.tsx` — the only React island on the platforms page. Platforms with `hasApi: true` in `src/data/platforms.ts` get live data with loading states; platforms without API show compact static cards.

### Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which builds and deploys to GitHub Pages automatically. The site is at `https://drozdovdn.github.io` (no `base` path needed since the repo is `username.github.io`).