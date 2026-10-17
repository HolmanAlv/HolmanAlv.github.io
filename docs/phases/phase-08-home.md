# Phase 8: Home without 3D

**Goal:** Home is complete with:
- a static hero (name and roles over a poster image)
- 3 featured project cards linking into the subpages
- About
- Timeline

After this phase the whole site is **publishable**, and the 3D becomes a bonus layered on top rather than a dependency.

**You will learn:**
- LCP and why the hero is a poster first
- deriving links from data
- avoiding nested links in cards
- ordered lists and pseudo-elements
- encapsulating a future island
- the "publishable milestone" mindset

**Before you start:** Phase 7 is done, and exactly one project per discipline has `featured: true`.

**Files you will touch:**
- `src/pages/index.astro`
- `src/components/Hero3D.astro` (new; just the poster for now)
- `src/components/ProjectCard.astro` (new)
- `src/components/Timeline.astro` (new)

**Out of scope:** the Three.js scene (Phase 10).

---

## Concepts

### 1. The hero is a poster first

The Home hero will eventually be a WebGL canvas. But WebGL needs a large JS download, a GPU context and shader compilation, which is seconds on a weak phone.

If the canvas were the first thing to paint, your **LCP** would depend on all of that. Instead:
- a **static poster image** is the hero and the LCP: fast and predictable
- in Phase 10 the canvas fades in **on top of it**, once it's ready
- if the canvas never loads (reduced motion, no WebGL, slow device), the poster simply stays, and nobody sees a broken page

### 2. Encapsulate the future island now

Just like `GameDevDemo`, create `Hero3D.astro` now with only the poster inside. Phase 10 adds the canvas and script **inside this component**, and `index.astro` won't change.

### 3. Links derived from data

Phase 4 made `discipline` equal to the route name, so a card's link is simply:
- `/`
- plus the discipline
- plus `/#`
- plus the entry id

For example `/gamedev/#neon-drift`. No lookup table, and no link to keep in sync by hand. If you rename a project file, the card follows automatically. (The links you already *sent* don't follow, which is the reason from Phase 4 to pick names carefully.)

### 4. No nested links

It's tempting to wrap a whole card in `<a>` while it also contains other links. **Links inside links are invalid HTML** and confuse screen readers. The mockup's card had two links (View Case Study + "Ir a Dev →"); the corrected one has **one**. If you want the whole card to be clickable, the common CSS technique is a "stretched link": the single link's `::after` pseudo-element covers the card. It's optional.

### 5. Ordered lists and pseudo-elements

The timeline is chronological, so it's an **ordered list** (`<ol>`). Order is part of its meaning. The vertical line and the dots aren't content; they're decoration, so draw them with CSS (a border on the list, `::before` on each item) instead of adding empty `<span>`s like the mockup does.

---

## Step 1: `Hero3D.astro` (poster only)

### Do it
1. Create the component. Its props are the hero text: name and roles, or read them from `profile.ts` directly.
2. **Markup:**
   1. A `<section>` with `position: relative` and a minimum height (the mockup uses about 550px; consider `min-height` in `svh` for mobile).
   2. **The poster:**
      - `<Picture>` (AVIF and WebP) of a hero image from `src/assets/images/`
      - it covers the whole section: absolutely positioned, `inset: 0`, `object-fit: cover`
      - `loading="eager"` and `fetchpriority="high"`: **this is the LCP**
      - `alt`: if the image is pure atmosphere, use `alt=""`; if it shows something meaningful, describe it
   3. **The text layer**, above the poster (`position: relative` and a `z-index`):
      - the small status label (`SYS_STATUS: ONLINE // …`)
      - **the `<h1>` with your name**: the mockup had it as a plain `<span>`, but on the real page your name is the `h1`
      - the roles line
   4. Leave a comment where the canvas will go in Phase 10.
3. **Styles:**
   - make sure the text stays **readable over the image**: a gradient overlay or a solid panel behind the text, and check the contrast
   - keep the mockup's layout (status label top-left, name and roles top-right) or adjust it; the structure is what matters

### Check
- The hero renders on Home.
- Lighthouse names the poster image (or the `h1`) as the LCP element.

---

## Step 2: `ProjectCard.astro`

### Do it
1. **Props:**
   - `entry` (a projects collection entry)
   - `index` (a number, for the "01 //" label)
2. **Frontmatter:** build the link from `discipline` and `entry.id` (concept 3), and pick a human label for the discipline (Dev / GameDev / Film) with a small object lookup.
3. **Markup:**
   1. An `<article>`.
   2. **A header strip:** the index plus the discipline (`01 // FULL-STACK DEV`) and the first two tags.
   3. **The cover:** `<Image>` with `coverAlt`, lazy (it's below the fold) and a 4:3 aspect ratio.
   4. An `<h3>` with the title.
   5. The `summary`.
   6. **One** link: "View on {discipline label} page →", pointing to the derived URL.
4. **Styles:**
   - a border, the background token and a column layout
   - optionally the stretched link (concept 4), with a visible focus ring that covers the card

### Check
Inspect the link's `href` on each card: it ends in `/<discipline>/#<id>`.

---

## Step 3: Selected projects section

### Do it
1. In `index.astro`'s frontmatter, get the projects with `featured === true`.
2. **Sort them by discipline** in a fixed order: developer, gamedev, filmmaker. An array of the three names and `indexOf` does it.
3. `Section` ("Selected Projects", label "INDEX // 01 — 03"), containing a `<ul>` grid of three `<li>`s, each with a `<ProjectCard>`. Use 3 columns on desktop and 1 on mobile. auto-fit works.

### Check
- Three cards, in the order Dev, GameDev, Film.
- **Click each card's link:** you land on the right subpage, scrolled to that exact project, not hidden under the header.

---

## Step 4: About

### Do it
1. `Section` ("About Me", label "PROFILE").
2. Inside it, a two-column grid: a square portrait `<Image>` (lazy, real `alt`) and the Home about paragraphs from `profile.ts`, constrained to `--measure`.
3. One column on mobile.

---

## Step 5: `Timeline.astro`

### Do it
1. **Props:** `items`, the array type from `timeline.ts`.
2. **Markup:**
   1. An `<ol>`.
   2. Each `<li>` holds:
      - the period/label line (small, mono, muted)
      - an `<h3>` with the title
      - the description
      - **only if the item has an image**, an `<Image>` (lazy, real `alt`, a wide ratio like the mockup's 16/6)
3. **Styles:**
   - the `<ol>` without numbers, with a dashed `border-left` (the vertical line) and left padding
   - each `<li>` with `position: relative` and a `::before` pseudo-element for the dot: absolutely positioned, round, a token color
   - the most recent item's dot in the accent color: `:first-child` selects it, with no extra class
4. **On the page:** `Section` ("Timeline // Career & Education", label "CHRONOLOGICAL LOG") with `<Timeline items={timeline} />`.

### Check
- The line and dots line up.
- In Inspect, the markup is just `ol > li`, with no decorative spans.

---

## Step 6: The milestone check

Against `npm run build && npm run preview`, walk the **whole site** as a recruiter would:
1. **Home:**
   - **0 JS**
   - the LCP is the poster
   - all three cards land on the right project anchors
2. **Developer and GameDev:** still 0 JS. **Film:** only the facade script.
3. Header navigation between all 4 pages, the active state, the skip link and Contact work everywhere.
4. Lighthouse (Mobile) on **all 4 pages**: write the four Performance scores down in `docs/PLAN.md` next to the budget, as your baseline before the animations.
5. 360px width on all 4 pages.
6. **Push.** This is **v1 of your portfolio, live.** From here, Phases 9–10 add the animations on top, and if either ever breaks, this version still works underneath.

---

## Common pitfalls

- **Making the canvas the LCP** later: the poster must stay underneath (Phase 10).
- **Nested links** inside cards.
- **Hand-written card URLs** instead of deriving them.
- **Sorting featured projects by file order:** the order would change whenever you rename a file.
- **Decorative spans** for timeline dots.
- **Text over the hero image without enough contrast.**

---

## Done when

- [ ] Home has: Hero (poster + `h1` name + roles) → Selected Projects → About → Timeline.
- [ ] `Hero3D.astro` holds the poster, ready for Phase 10.
- [ ] Card links are derived and land on the correct anchors.
- [ ] Home ships 0 JS, and the poster is the LCP.
- [ ] The baseline Lighthouse scores for all 4 pages are written down.
- [ ] v1 is pushed and live.
- [ ] Phase 8 is checked off in `docs/PLAN.md`.

---

## References

- [web.dev: Largest Contentful Paint](https://web.dev/articles/lcp)
- [web.dev: optimize LCP](https://web.dev/articles/optimize-lcp)
- [MDN: `<ol>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/ol)
- [MDN: `::before`](https://developer.mozilla.org/en-US/docs/Web/CSS/::before)
- [Inclusive Components: cards](https://inclusive-components.design/cards/) (single link, stretched-link technique)
- [WebAIM contrast checker](https://webaim.org/resources/contrastchecker/)

## Concepts recap

| Concept | One line |
|---|---|
| Poster-first hero | The LCP is an image, and WebGL is a layer that may or may not arrive. |
| Encapsulated island | `Hero3D.astro` exists now, so Phase 10 never touches the page. |
| Derived links | discipline + id becomes the URL, with nothing to keep in sync. |
| One link per card | Nested links are invalid, and a stretched link makes the whole card clickable. |
| `<ol>` | Chronology is meaning, so use an ordered list. |
| Pseudo-elements | Decoration in CSS, not in markup. |
| Publishable milestone | v1 works without any animation. |
