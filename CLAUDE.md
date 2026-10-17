# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Holman Alvarado's personal portfolio. It's a static Astro site with 4 pages: a Home hub plus three discipline subpages (Software/Web Dev, Game Dev/Tech Art, Animation/VFX/Film). Three.js runs in the Home hero and GSAP in the GameDev hero. The site is English only.

It deploys to GitHub Pages as a user site at `https://holmanalv.github.io` (the repo is renamed to `HolmanAlv.github.io`), so there is no `base` and links stay plain.

`instruction.md` is the master brief (in Spanish). `docs/PLAN.md` is the current plan. It holds the decisions, the page structure adjusted from the mockup, and the phases with checkboxes. Read both before planning work.

`docs/phases/phase-NN-*.md` is a step-by-step guide for each phase (0–11). The user implements the phases and reports which one they're on. Read that phase's guide before answering, and keep your answer consistent with it. If a guide turns out wrong or outdated, fix the guide too.

## How to work with the user (from instruction.md)

The user knows some frontend but is new to Astro. They want a mentor, not a code generator:
- Go step by step. Don't write code or fill files unless the user explicitly asks. Say which structural piece comes next, help set it up, then wait for confirmation before moving on.
- Explain the "why" before the "how": what an Astro feature does, how it works and why it helps this project. Introduce concepts as they come up.
- Prioritize performance and modularity: folder structure, where static assets go, and which hydration directive to use.
- When something is hard or over-engineered, offer simpler alternatives.

## Commands

```sh
npm ci            # install (Node >= 22.12)
npm run dev       # dev server on localhost:4321
npm run build     # static build to dist/
npm run preview   # serve dist/
```

For a dev server that doesn't block the terminal, use `npx astro dev --background` and manage it with `astro dev stop|status|logs`.

Nothing is set up for tests, linting or type checking. `astro build` strips TypeScript types without checking them. The plan is to add `astro check` with `npx astro add check`.

## Current state: mid-migration

The repo comes from an earlier version of the project, which was bilingual (EN/ES) and hadn't picked a host. The brief has since changed to English only, hosted on GitHub Pages. These leftovers need removing or reworking:
- **i18n:** the `i18n` block in `astro.config.mjs`, `src/i18n/`, `src/pages/{en,es}/`, the meta-refresh redirect in `src/pages/index.astro`, and the hreflang/`stripLang` logic in `Layout.astro`. Pages should live directly under `src/pages/`.
- **Broken imports in `src/layouts/Layout.astro`:** it imports `{ Header }` and `{ Footer }` as named imports. `.astro` components only have a default export, so this breaks as soon as a page uses the Layout. The build passes today only because no page imports it.
- **Empty files:** `Header.astro`, `Footer.astro` and the developer/gamedev/filmmaker pages.
- **README.md** is still the Astro starter.

Keep `src/styles/global.css`: a reset plus design tokens on an 8px spacing scale. Its colors are neutral placeholders on purpose until there is a visual identity.

Phase 0 in `docs/PLAN.md` covers this cleanup.

## Mockups

`mockups/plantilla/index.html` is one file that holds all 4 pages as views switched by JavaScript (`#view-home`, `#view-dev`, `#view-gamedev`, `#view-film`). Take only its structure and section hierarchy. Ignore its colors, fonts, copy, placeholder content and scripts: the SPA page switching, the Web Audio UI sounds and the fake toggles. The real site uses separate static pages and real links.

Where the mockup and the structure in `docs/PLAN.md` differ, `docs/PLAN.md` wins. For example, the footer is the contact section, there's one "Download CV" per subpage and none in the header, and the toggles are gone.

## Architecture rules

- **Zero JS by default.** JS ships only in three places: the YouTube facade (Film), GSAP (GameDev hero) and Three.js (Home hero).
- **`client:*` directives only work on UI framework components** (React, Preact, Svelte…). A plain Astro `<script>` is bundled and runs on page load. To defer GSAP or Three.js, dynamically `import()` them once the browser is idle: both heroes are on screen at load, so waiting for visibility wouldn't defer anything.
- **Hero animations:**
  - Keep a static poster/image under the canvas so LCP never depends on JS or WebGL.
  - Skip loading GSAP or Three.js when `prefers-reduced-motion` is set (and, for Three.js, when WebGL isn't available).
- **Images:** put them in `src/assets/` and render them with `astro:assets` (`<Image>`/`<Picture>`) so Astro hashes, resizes and converts them. `public/` is copied as-is, so it should only hold favicons, fonts, OG images and files that need a fixed URL.
- **Videos:** every video is on YouTube. Embed them behind a click-to-load facade, never as an iframe that loads with the page. Don't commit video files to the repo.
- **Deploy:** the GitHub Actions workflow uses `withastro/action` and must trigger on `master`. The Astro docs example uses `main`.
- **Content as data:** keep projects, stack and experience in content collections or typed data files, not hardcoded in page markup. That way the three subpages share components and differ only in their data.
