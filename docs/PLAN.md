# Work plan: Holman portfolio

Stack: Astro 7 (static output, zero JS by default) + Three.js on the Home hero + GSAP on the GameDev hero.
Hosting: GitHub Pages user site at `https://holmanalv.github.io` (repo renamed to `HolmanAlv.github.io`).
Language: English only.

How we work: one phase at a time. For each phase we go over the concepts first, then you build it, verify it, and confirm before we move on. Each phase has a step-by-step guide in `docs/phases/` (index below, under **Phases**). This file is the summary and the checklist.

---

## Decisions

| Topic | Decision | Consequence |
|---|---|---|
| Language | English only | No i18n routing. Pages live directly under `src/pages/`. |
| Hosting | GitHub Pages user site | `site: 'https://holmanalv.github.io'`, no `base`, so links stay plain (`/dev`). |
| Branches and CI | `develop` for work, `master` for production | A push to `develop` only builds (a check). Merging `develop` into `master` and pushing deploys. There's no PR or auto-merge: for one person the build is the same gate either way, and you decide when to publish. |
| Videos | All on YouTube | No video files in the repo. Embeds load behind a click-to-play facade. |
| GameDev demo | GSAP animation | The second (and smaller) piece of JS on the site, used only on `/gamedev`. |
| Navigation | The header is the way into the subpages | Recruiters get the direct link to their section, so every subpage has to stand on its own. |
| Contact | The footer is the contact section | It's shared by all 4 pages, and the header "Contact" button jumps to it. |
| CV | One CV per subpage (3 different PDFs) | A "Download CV" button sits in each subpage hero. Home and the header have none. |
| Project detail pages | Only for projects with a case study | A project whose `.md` has a body gets its own page at `/projects/<id>/`, built by one dynamic route. The row shows the summary and links to it (Phase 7.5). |
| Skip link | Not included | The header is short (3 links + Contact), and `<main>` already gives screen readers a landmark to jump to. |

---

## Page structure (adjusted from the mockup)

The mockup gives the section order and hierarchy. Its colors, fonts, copy and scripts don't carry over. Where this section and the mockup differ, this section wins. `mockups/plantilla_corrected/index.html` shows this structure applied to the mockup.

### Global

- **Header:** `HOLMAN.ALV` (link to Home), then `Developer`, `GameDev` and `Artist` (the active one is marked), then a `Contact` button that jumps to the footer.
- **Footer (`#contact`):** a short call to action, then email, then GitHub, itch.io, LinkedIn and YouTube, then `© year`.
- **Removed from the mockup:**
  - the Audio UI toggle
  - the header "Download CV" button
  - the JS page switching (pages are real routes now)
  - every fake toggle

### Home `/`

1. **Hero:** name and roles over the 3D canvas, with a static poster underneath.
2. **Selected projects:** 3 cards, one per discipline. Each card has a single link to its project on the matching subpage (`/dev#project-slug`).
3. **About:** portrait + text.
4. **Timeline:** career and education milestones.

### Developer `/dev`

1. **Hero:**
   - label, title
   - lead paragraph, which doubles as the short about
   - GitHub + Download CV
2. **Technical stack:** a grid of category cards.
3. **Featured projects:** rows with:
   - a media slot (image or architecture diagram, still undecided)
   - title, subtitle, summary
   - tags, role, result, links
   - "Read the case study", only when the project has one
4. **Experience:** formal roles.
5. **Education:** it belongs on this page because a recruiter who lands here never sees the Home timeline.

### GameDev `/gamedev`

1. **Hero (split):**
   - text side: label, title, lead paragraph (the short about), itch.io + Download CV
   - demo side: the GSAP demo, which starts as a static image until Phase 9
2. **Technical stack:** its own categories, no longer copied from Developer:
   - Engine & Scripting
   - Rendering & Optimization
   - Tools & Pipeline
   - Game Audio (placeholder tools for now)
3. **Games & breakdowns:** the same project row as Developer. Images only, no toggles. These could become 3D canvases later.
4. **Shader & Tech Art Lab:** a bento grid of experiments (images).

### Film `/art`

1. **Hero (split):**
   - reel (YouTube facade)
   - title
   - roles line: Direction • Sound Design • Foley • 3D/2D Animation
   - Download CV
2. **Tools:** card grid with Editing, Sound Design and Animation.
3. **Selected works:** project rows with a YouTube facade, production metadata (format, client, year, duration, mix), role and description. The audio-layer, SFX and highlight buttons are gone.
4. **About:** short, the last section before the footer.

### Case study `/projects/<id>/`

Only projects whose `.md` has a body get one. A single template builds them all.

1. **Back link** to the project's row on its subpage.
2. **Header:**
   - label, title, subtitle
   - role, tags, result
   - external links, and the film metadata when present
3. **Media:** the cover, or the YouTube facade for film projects.
4. **The case study:** the `.md` body.

All three subpages share the same building blocks (hero, skill grid, project row) and differ only in their data.

---

## Folders and assets

```
src/
├── pages/            index, dev, gamedev, art, 404 (each file is a URL),
│                     projects/[id].astro (one page per case study)
├── layouts/          Layout.astro (<head>, header, footer)
├── components/       Header, Footer, Section, TagList, SkillGrid, ProjectRow,
│                     ExperienceList, ProjectCard, Timeline, YouTubeFacade,
│                     GameDevDemo, Hero3D
├── content/projects/ one .md per project (the body is its optional case study)
├── content.config.ts schema for the projects collection
├── data/             profile, stacks, experience, timeline, lab (typed .ts files)
├── scripts/          gamedev-demo.ts, hero3d.ts (loaded on demand)
├── assets/images/    every image the site shows (Astro optimizes them)
└── styles/global.css reset + design tokens
public/
├── favicon.*
├── cv/               dev.pdf, gamedev.pdf, art.pdf
└── og/               one social preview image per page
```

- **`src/assets/` or `public/`?**
  - `src/assets/` gets processed: Astro hashes, resizes and converts what's there (AVIF/WebP).
  - `public/` is copied as-is, with stable URLs.
  - So images go in `src/assets/`. CVs, OG images and favicons go in `public/`, because something outside the site (a download, LinkedIn's crawler, the browser) needs their exact URL.
- **Videos:** none in the repo, because they're all on YouTube.
- **3D models:** where they live gets decided in Phase 10, once we know whether there are any.
- **"Monorepo":** this is a single Astro project, not a monorepo. A monorepo holds several packages in one repository and needs workspace tooling, which this site doesn't.

---

## Phases

| Phase | Guide |
|---|---|
| 0. Cleanup | [phase-00-cleanup.md](phases/phase-00-cleanup.md) |
| 1. Shell | [phase-01-shell.md](phases/phase-01-shell.md) |
| 2. Deploy early | [phase-02-deploy.md](phases/phase-02-deploy.md) |
| 3. Primitives | [phase-03-primitives.md](phases/phase-03-primitives.md) |
| 4. Content layer | [phase-04-content.md](phases/phase-04-content.md) |
| 5. Developer page | [phase-05-dev.md](phases/phase-05-dev.md) |
| 6. GameDev page | [phase-06-gamedev.md](phases/phase-06-gamedev.md) |
| 7. Film page | [phase-07-art.md](phases/phase-07-art.md) |
| 7.5. Project pages | [phase-07.5-projects.md](phases/phase-07.5-projects.md) |
| 8. Home without 3D | [phase-08-home.md](phases/phase-08-home.md) |
| 9. GSAP demo | [phase-09-gsap.md](phases/phase-09-gsap.md) |
| 10. Three.js hero | [phase-10-threejs.md](phases/phase-10-threejs.md) |
| 11. Closing | [phase-11-closing.md](phases/phase-11-closing.md) |

### Phase 0: Cleanup (drop i18n)

Concepts: file-based routing, and build-time config versus code that ships to the browser.

- [x] Delete `src/i18n/`, `src/pages/en/` and `src/pages/es/`.
- [x] Turn `src/pages/index.astro` (now a meta-refresh redirect) into the Home page with placeholder content.
- [x] Create `dev.astro`, `gamedev.astro` and `art.astro` in `src/pages/` with placeholder content.
- [x] In `astro.config.mjs`, remove the `i18n` block and set `site: 'https://holmanalv.github.io'`.
- [x] Remove the i18n code from `Layout.astro`: the imports, hreflang and `stripLang`.
- [x] Rewrite `README.md`: what the project is, plus the commands.

**Verify:** `npm run build` outputs exactly 4 HTML files (`index`, `dev`, `gamedev`, `art`) and no `/en/` or `/es/`.

### Phase 1: Shell (Layout, Header, Footer)

Concepts: component frontmatter, props, `<slot />`, scoped styles, `aria-current`, computing values at build time.

- [x] Layout:
  - per-page `title` and `description` props
  - `<html lang="en">`
  - canonical and Open Graph tags (they can always be emitted now, since `site` is set)
  - Header + `<main>` + Footer
- [x] Fix the Header/Footer imports: `.astro` components are default exports, so `import Header from ...` without braces.
- [x] Header:
  - `HOLMAN.ALV` linking to `/`
  - 3 links with `aria-current="page"` on the active one (hrefs keep the trailing slash, so they match the build's path)
  - `Contact` linking to `#contact`
- [x] Footer as the contact section, with `id="contact"` and the year computed at build time.
- [x] Wrap the 4 pages in the Layout.
- [x] Add `@astrojs/check` and make the `build` script run `astro check` first, so a type error stops the build (locally and in CI).

**Verify:**
- The 4 pages link to each other and the active link is marked.
- `Contact` scrolls to the footer.
- DevTools → Network → JS is empty.

### Phase 2: Deploy early

Concepts: CI/CD, running a job on one branch only (`if:`), a `develop`/`master` flow, and why to deploy a skeleton. Production-only bugs (paths, trailing slashes) show up now instead of at the end.

- [ ] Rename the GitHub repo to `HolmanAlv.github.io`, then update the local remote URL.
- [ ] Add `.github/workflows/deploy.yml` with the official `withastro/action`:
  - trigger it on `master` and `develop` (the docs example uses `main`)
  - the `deploy` job only runs on `master`: `if: github.ref == 'refs/heads/master'`
- [ ] In GitHub, go to Settings → Pages → Source and choose "GitHub Actions".
- [ ] Before the first push, delete the experiments in `src/pages/projects/` and `src/content/posts/`. Everything in `src/pages/` gets published, and Phase 7.5 builds the real project pages.
- [ ] Create `develop` from `master`. From now on you work there, and publish by merging `develop` into `master`.

**Verify:**
- `https://holmanalv.github.io/` and the 3 subpages load, and their canonical URLs are correct.
- A push to `develop` runs `build` and skips `deploy`. A broken build on `develop` leaves the live site untouched.

### Phase 3: Primitives

Concepts: when something deserves a component and when a CSS class is enough.

- [ ] `Section.astro`: title, small label and slot. It sets the vertical rhythm for the whole site.
- [ ] `TagList.astro`: the tags and chips.
- [ ] Button styles (primary and outline) as classes in `global.css`. A styled `<a>` doesn't need a component.
- [ ] `SkillGrid.astro`: category cards with a list. The Developer stack, GameDev stack and Film tools all use it.

**Verify:** they render on a test page, and the site still ships 0 KB of JS.

### Phase 4: Content layer

Concepts: content collections, and schema validation at build time.

- [ ] `src/content.config.ts`: a `projects` collection (glob loader).
  - Fields: `title, discipline (dev | gamedev | art), subtitle?, summary, tags, role, result?, links[], cover, coverAlt, featured, order`.
  - Film fields: `youtubeId?`, and `meta?` for the production metadata (format, client, year…).
  - The body is the optional case study (Phase 7.5). Cards and rows show `summary`.
- [ ] `src/data/`: profile (name, email, socials), stacks per page, experience + education, timeline.
- [ ] 1–2 real projects per discipline, so the schema gets tested against real content.

**Verify:** delete a required field from a `.md` file and `npm run build` fails with a clear error. That failure is the feature working.

### Phase 5: Developer page (reference implementation)

It comes first because it has no video or animation, just the bare structure. The other two pages reuse its components.

Concepts: `astro:assets` (`<Image>`), and why the CV lives in `public/`.

- [ ] Hero with the lead paragraph and GitHub + Download CV (`/cv/dev.pdf`).
- [ ] Technical stack (`SkillGrid`).
- [ ] `ProjectRow.astro`:
  - media slot (image or diagram)
  - title, subtitle, summary
  - tags, role, result, links
  - an `id` on each project so Home can link to it
- [ ] Experience list, then Education list. They can share one list component and differ only in their data.

**Verify:**
- DevTools → Network → JS shows 0 KB.
- Images come out as AVIF/WebP and have width and height set.
- Run Lighthouse on the page.

### Phase 6: GameDev page

- [ ] Split hero, with a static image in the demo slot.
- [ ] Technical stack with GameDev categories.
- [ ] Games & breakdowns using `ProjectRow` (images only).
- [ ] Shader & Tech Art Lab bento grid.

**Verify:** 0 KB JS, and `ProjectRow` and `SkillGrid` were reused without changes.

### Phase 7: Film page

Concepts: Astro `<script>` tags, which get bundled and deduplicated and run on page load. `client:*` directives don't apply to them.

- [ ] `YouTubeFacade.astro`:
  - shows the thumbnail and a play button
  - injects the `youtube-nocookie.com` iframe only on click
  - is keyboard accessible and has a `title`
  - Simpler alternatives:
    - a thumbnail that links to YouTube (zero JS, but it takes the visitor off the site)
    - the `@astro-community/astro-embed-youtube` package
- [ ] Hero with the reel, the title, the roles line and Download CV.
- [ ] Tools (`SkillGrid`).
- [ ] Selected works: `ProjectRow` with the facade plus production metadata.
- [ ] Short About as the last section.

**Verify:** loading `/art` makes no request to `youtube.com` or `youtube-nocookie.com` until you click play.

### Phase 7.5: Project pages (case studies)

It sits between Film and Home: it needs the collection (4), `ProjectRow` (5) and the facade (7), and coming before Home puts the case studies inside the publishable milestone.

Concepts: dynamic routes, `getStaticPaths()`, `render()`, styling Markdown output with `:global()`.

- [ ] `src/pages/projects/[id].astro`: `getStaticPaths()` returns one page per project whose body has text.
- [ ] The page:
  - a back link to the project's row
  - the header (title, subtitle, role, tags, result, links, film metadata)
  - the cover or the facade, with `priority`
  - `<Content />` inside a `.prose` wrapper styled with `:global()`
- [ ] Title and description come from the entry (`title`, `summary`).
- [ ] `ProjectRow`: a "Read the case study" link, only when the project has a body.
- [ ] At least one real case study, with an image.

**Verify:**
- `dist/projects/` has one folder per case study and none for projects without a body.
- Developer and GameDev case studies ship 0 KB of JS, and Film ones only the facade.
- No header link is marked on a case study, and the back link lands on the row.

### Phase 8: Home without 3D

- [ ] Hero with name and roles over a static poster image (it stands in for the canvas).
- [ ] `ProjectCard.astro`: 3 featured projects, one per discipline, each linking to `/<page>#<project>`.
- [ ] About with portrait.
- [ ] `Timeline.astro` built from the data files.

**Verify:** the whole site is complete and navigable, and the facade is its only JS. This is the publishable milestone: if the 3D fails later, the portfolio still works.

### Phase 9: GSAP demo (GameDev hero)

Concepts:
- why `client:*` directives only work on UI framework components (React, Svelte, Preact…)
- how a dynamic `import()` splits a separate chunk that loads later
- what blocking the main thread means

- [ ] Install `gsap`. Load it with a dynamic import once the browser is idle (the hero is already on screen at load).
- [ ] With `prefers-reduced-motion`, keep the static image and never load GSAP.
- [ ] Animate only `transform` and `opacity`, which the GPU compositor handles, never layout properties.

**Verify:**
- The GSAP chunk is only requested on `/gamedev`, never on the other pages.
- With reduced motion on, it isn't requested at all.
- DevTools → Performance shows no long tasks at load.

### Phase 10: Three.js hero (Home)

Requires the hero concept to be defined.

- [ ] Choose how it loads:
  - (a) a plain `<script>` plus a dynamic import when the browser is idle. No framework; recommended.
  - (b) a Preact component with `client:idle`. It uses the directive directly, at the cost of a few KB of runtime.
- [ ] The poster from Phase 8 stays under the canvas, so the LCP element is always an image and never WebGL.
- [ ] Early exits that keep the poster in place:
  - `prefers-reduced-motion`
  - no WebGL support
  - a low-end device heuristic
- [ ] Named imports from `three`. Compress models (Draco/meshopt) if there are any, and decide where they live.
- [ ] Pause the render loop when the tab is hidden or the hero is off-screen.

**Verify:**
- The island bundle is under 150 KB gzip.
- With reduced motion on, Three.js isn't downloaded.
- The LCP element is the poster.

### Phase 11: Closing

- [ ] Every image goes through `astro:assets`, always with width and height (no layout shift).
- [ ] Visual identity applied to the tokens in `global.css`. Fonts are self-hosted: woff2, `font-display: swap`, and the LCP font preloaded.
- [ ] One OG image per page in `public/og/`. Recruiters receive direct links, so the preview card is their first impression. Case studies reuse their discipline's image.
- [ ] A `404.astro` page (GitHub Pages serves `404.html` automatically).
- [ ] Optional: `@astrojs/sitemap`. Every page is reachable through links, so it adds little.
- [ ] Accessibility pass: visible focus, contrast, keyboard navigation, real `alt` text.
- [ ] Lighthouse on all 4 pages and one case study, against the budget below.

---

## Performance budget

| Page | JS shipped | Target LCP |
|---|---|---|
| Developer | 0 KB | < 1.0 s |
| GameDev | GSAP only, loaded when idle (~30 KB gzip) | < 1.0 s (static image) |
| Film | facade only (~1 KB) | < 1.5 s |
| Home | Three.js, loaded when idle (< 150 KB gzip) | < 1.5 s (poster, not canvas) |
| Case study | 0 KB (Film: the facade, ~1 KB) | < 1.0 s |

---

## Open items

1. **Hero 3D concept:** blocks Phase 10 only. It should say something about the profile, not be a generic tech demo.
2. **Visual identity:** can happen any time after Phase 3. It only means editing the tokens in `global.css`, without touching components.
3. **Game Audio card:** replace its placeholder tools with the real ones.
4. **Real content:**
   - 3 CVs
   - projects
   - timeline
   - about texts
   - email and social links

   This is the real bottleneck, not the code.
