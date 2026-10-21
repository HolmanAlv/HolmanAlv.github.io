# Phase 6: GameDev page

> **As built (2026-10-18):** there's no raster still. `GameDevDemo.astro` is an inline SVG scene (Mount Fuji, clouds, birds, pines, a torii and the runner), and the SVG itself is the static frame, so Step 1's `<Picture>` doesn't exist. The SVG has `role="img"` and an `aria-label`.

**Goal:** `/gamedev/` is complete, with a split hero, its own technical stack (including Game Audio), the games and breakdowns, and the Shader & Tech Art Lab. Everything reuses Phase 5's components, and the page still ships zero JavaScript.

**You will learn:**
- reuse through props and slots
- variants without forking a component
- split layouts with CSS grid
- DOM order vs visual order
- choosing a fallback image for a future animation
- bento grids
- when a one-off piece doesn't need to be a component

**Before you start:** Phase 5 is done.

**Files you will touch:**
- `src/pages/gamedev.astro`
- `src/components/GameDevDemo.astro` (new; just a static image for now)
- `ProjectRow.astro` (only to add the `wide` variant)
- `public/cv/gamedev.pdf` (new)

**Out of scope:** the GSAP animation itself (Phase 9).

---

## Concepts

### 1. Reuse means different data, same component

The test of Phase 5's design: GameDev should need **no new row component and no copy of `ProjectRow`.** The only allowed change is a small, named variant (`wide`), because the mockup gives GameDev a wider media column.

If you catch yourself copying `ProjectRow.astro` into `GameRow.astro`, stop. In two months the two copies will have drifted apart, and a fix will have to be made twice.

### 2. Variants: a prop that toggles a class

The lightest way to make a variant is a **boolean prop that adds a class**. In the template, Astro's `class:list` directive takes a list or object of class names and keeps only the truthy ones, so you can add the "wide" class only when `wide` is true. The component's scoped CSS then gives that class a different grid column width. That's one prop, one class and one CSS rule.

### 3. Split layouts and DOM order

The hero is two columns, text and demo. Build it with CSS grid (two columns, collapsing to one below ~60rem). Keep the **text first in the HTML**, even if you ever decide to show the demo first visually:
- screen readers and search engines read in **DOM order**
- on a phone, the stacked layout follows DOM order, so the `h1` comes first

### 4. The static image is the animation's foundation

`GameDevDemo.astro` starts as **just an image**. In Phase 9 you add the GSAP script **inside this same component**, and the page file won't change at all. Encapsulating the demo now pays off later.

That image also stays forever as:
- what visitors with **reduced motion** see
- what everyone sees **before** GSAP loads
- what search engines and link previews see

So choose it carefully: a representative still, ideally the first frame of the future animation, so the swap from image to animation is invisible.

### 5. Above the fold: eager loading

The hero image is visible on load, so it's probably the page's **LCP** (Largest Contentful Paint: when the biggest visible element finishes rendering). Lazy loading would *delay* it. For this one image:
- set `loading="eager"`
- set `fetchpriority="high"`, which tells the browser to fetch it before other images

Use this on **one** image per page at most. If everything is high priority, nothing is.

### 6. A one-off grid doesn't need a component

The Lab bento grid appears only here. Writing it **directly in the page** (a loop over `lab.ts` plus a scoped `<style>`) is fine. Extract a component when a second use appears or when the page gets hard to read, not before.

---

## Step 1: `GameDevDemo.astro` (static for now)

### Do it
1. Create the component. It has no props: the demo is unique.
2. Import the still image from `src/assets/images/…` and render it with `<Picture>`:
   - `formats` AVIF and WebP
   - a real `alt` describing what the demo shows
   - `loading="eager"` and `fetchpriority="high"` (concept 5)
3. Wrap it in a container with a fixed **`aspect-ratio`** (the mockup uses 16/9) and `position: relative`. In Phase 9 the animated layer sits on top of the image inside this box. The aspect ratio means the box never changes size when the animation starts.

### Check
The component renders the image at a 16:9 ratio, and Inspect shows the eager and high-priority attributes.

---

## Step 2: The hero

### Do it
1. **Left column, in this DOM order:**
   1. the label `[02 // REAL-TIME GRAPHICS & INTERACTIVE SYSTEMS]`
   2. the `<h1>` ("Game Developer & Technical Artist")
   3. the lead `<p>` (your short about for game studios)
   4. the buttons: **Play on itch.io** (primary, `profile.socials.itch`) and **Download CV** (outline, `profile.cv.gamedev`)
2. **Right column:** `<GameDevDemo />`.
3. **Styles:**
   - a two-column grid (the mockup uses roughly 1.15fr and 1fr) with a gap from tokens and vertical centering
   - one column below ~60rem
4. Put `public/cv/gamedev.pdf` in place.

### Check
On a phone width, the `h1` comes before the image.

---

## Step 3: Technical stack

### Do it
Use `Section` ("Technical Stack", label "SPECIFICATIONS") with `SkillGrid` fed the GameDev groups from `stacks.ts`:
- Engine & Scripting
- Rendering & Optimization
- Tools & Pipeline
- **Game Audio** (placeholders until you confirm the real tools)

### Check
4 cards. With auto-fit they may sit 4 in a row or wrap 3 + 1 depending on width. Use the optional `columns` prop from Phase 3 if the wrap bothers you.

---

## Step 4: Games & breakdowns

### Do it
1. **`ProjectRow` variant:**
   - add the optional `wide` boolean prop
   - in the template, use `class:list` to add a wide class when it's true
   - in its scoped CSS, give that class the wider media column (the mockup uses ~460px instead of ~380px)
   - the Developer page doesn't pass `wide`, so it doesn't change
2. **On the page:**
   - get the `gamedev` projects, sorted by `order`
   - `Section` ("Games & Technical Art Breakdowns", label "SELECTED WORK")
   - one `<ProjectRow entry={…} wide />` per project
3. **Images only:** the mockup's Final/Wireframe toggles are gone, as decided in the plan. If a project needs two views, put a second image in the `.md` body, or link to a breakdown.

### Check
- The rows render with the wider media column.
- **`/dev/` looks exactly as before**, so the variant didn't leak.

---

## Step 5: Shader & Tech Art Lab

### Do it
1. Import the `lab` array from `src/data/lab.ts`.
2. `Section` ("Shader & Tech Art Lab", label "EXPERIMENTS", and `id="lab"` so you can link to it).
3. Inside it, a `<ul>` laid out as a grid. Each `<li>` holds:
   - the small label
   - an `<Image>` (lazy, since it's below the fold)
   - one short line of description
4. **The bento look:** the mockup uses three columns where the first is wider (`1.4fr 1fr 1fr`). That's one `grid-template-columns` line. For a less regular bento, let an item span two columns or rows with `grid-column: span 2`. Collapse it to one column on narrow widths.

### Check
The grid matches the mockup's proportions on desktop and stacks on mobile.

---

## Step 6: Verify

Against `npm run build && npm run preview`:
1. **Zero JS** on `/gamedev/`.
2. **LCP:** run Lighthouse (Mobile). Expand "Largest Contentful Paint element": it should be the demo image or the `h1`, and it should be fast.
3. **Only one** image on the page has `fetchpriority="high"`.
4. Heading outline, keyboard pass and 360px width, same checks as Phase 5.
5. `/dev/` is unchanged (regression check).
6. Publish (merge `develop` into `master` and push), and check the live page.

---

## Common pitfalls

- **Forking `ProjectRow`.**
- **Lazy-loading the hero image:** it's above the fold, so it should be eager and high priority.
- **Several `fetchpriority="high"` images** on one page.
- **Putting the demo image directly in the page** instead of in `GameDevDemo.astro`: Phase 9 would then have to edit the page.
- **A demo container without `aspect-ratio`:** the layout jumps when the animation starts.

---

## Done when

- [ ] `/gamedev/` has: Hero (text + demo image) → Stack (4 groups, including Game Audio) → Games → Lab.
- [ ] `GameDevDemo.astro` holds the static image in a fixed-ratio box.
- [ ] `ProjectRow` has a `wide` variant, and `/dev/` is unchanged.
- [ ] The page ships 0 JS, Lighthouse is green, and it works at 360px.
- [ ] The CV link works.
- [ ] Phase 6 is checked off in `docs/PLAN.md`.

---

## References

- [`class:list` directive](https://docs.astro.build/en/reference/directives-reference/#classlist)
- [web.dev: Largest Contentful Paint](https://web.dev/articles/lcp)
- [web.dev: `fetchpriority`](https://web.dev/articles/fetch-priority)
- [MDN: `aspect-ratio`](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)
- [MDN: CSS grid layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)

## Concepts recap

| Concept | One line |
|---|---|
| Reuse | Same component with different data. Never fork. |
| `class:list` variant | A boolean prop toggles a class, and CSS does the rest. |
| DOM order | Readers and phones follow the HTML order, so the text goes first. |
| Static fallback first | The animation layers on top of an image that already works. |
| LCP + `fetchpriority` | Load the biggest visible image eagerly, and only that one. |
| `aspect-ratio` | The box keeps its size whatever goes inside it later. |
| One-off markup | Extract a component when a second use appears. |
