# Phase 5: Developer page (reference implementation)

**Goal:** `/dev/` is complete: hero, technical stack, featured projects, experience and education. It ships zero JavaScript and has optimized images. The other two subpages will reuse its components.

**You will learn:**
- `astro:assets` (`<Image>` and `<Picture>`)
- named slots and slot fallback content
- composing a page from data
- why the CV goes in `public/`
- anchors and `scroll-margin-top`

**Before you start:** Phase 4 is done, and there are real Developer projects with covers.

**Files you will touch:**
- `src/components/ProjectRow.astro` (new)
- `src/components/ExperienceList.astro` (new)
- `src/pages/dev.astro`
- `public/cv/dev.pdf` (new)

**Out of scope:** the YouTube facade (Phase 7) and animation (Phases 9–10).

**Why this page first:** it has no video and no animation. It's the bare skeleton, so every problem you hit here is a structural one, and solving it once solves it for GameDev and Film.

---

## Concepts

### 1. `astro:assets`: why `<Image>` instead of `<img>`

A plain `<img src="photo.png">` ships the file exactly as you saved it, which might be a 4000px, 6 MB PNG. Astro's `<Image>` component, fed an **imported** image (or a schema `image()` field):
- **resizes** it to the size you ask for
- **converts** it (WebP by default)
- **hashes** the file name, so it can be cached forever
- **writes `width` and `height`** into the HTML. The browser reserves the space before the image loads, so the page doesn't jump. That jump is called **CLS** (Cumulative Layout Shift), and it's a Core Web Vital.
- adds `loading="lazy"` and `decoding="async"` by default, so images below the fold don't compete with the first render

**`<Picture>`** goes one step further: it outputs several formats (for example AVIF, then WebP), and each browser picks the best one it supports. `alt` is **required** on both.

**Responsive sizes:** with the `widths` and `sizes` props (or the `layout` prop), Astro generates several sizes and a `srcset`, so a phone downloads a small file and your 1440p monitor a large one. Read the "Responsive images" section of the images guide and use it on the project covers.

### 2. Named slots and fallback content

Phase 1 used one `<slot />`. A component can have **several named holes**: it writes `<slot name="media" />`, and the caller fills it by giving an element `slot="media"`.

A slot can also hold **fallback content**: whatever you put between `<slot name="media">` and `</slot>` renders **only when the caller doesn't fill it.** That's exactly what `ProjectRow` needs:
- by default it shows the project's cover image (Developer, GameDev)
- the Film page fills the slot with a video facade instead (Phase 7)

One component, no `if (discipline === 'art')` inside it.

### 3. Why the CV goes in `public/`

`src/assets/` gives files hashed names, which is perfect for images but wrong for a CV. You want a **stable, readable URL**, `/cv/dev.pdf`, that you can also paste in an email. `public/` files keep their exact path. This is the rule from the plan: **`public/` is for files whose exact URL matters.**

### 4. Anchors and the sticky header

Each project's `<article>` gets `id={entry.id}`, so `/dev/#project-alpha` scrolls straight to it. That's how the Home cards will link here (Phase 8). If your header is sticky, give the articles a `scroll-margin-top` so the target doesn't land under the header.

---

## Step 1: The hero

### What
The top of the page:
- the small label (`[01 // SOFTWARE ENGINEERING]`)
- the `<h1>`
- the lead paragraph, which is your short about
- two links styled as buttons: View GitHub and Download CV

### Do it
1. Import `profile` from `src/data/profile.ts`.
2. Markup:
   1. A `<section>`, not the `Section` component: the hero has a different structure, with an `h1` and no `h2`.
   2. The label.
   3. The `<h1>`, for example "Software Developer".
   4. The lead `<p>`, 2–3 sentences: what you build and for whom. This is the "about" for recruiters, so it's worth writing carefully.
   5. A container with the two `<a>`s:
      - **GitHub** points to `profile.socials.github` and uses the primary button classes
      - **CV** points to `profile.cv.dev` and uses the outline classes
3. **External links:** pick one convention for the whole site and keep it. Either open external links in the same tab, which is the default and the simplest, or in a new tab with `target="_blank"`. Never open the CV and GitHub inconsistently.
4. **The CV link:** a plain link opens the PDF in the browser's viewer. Adding the `download` attribute forces a download instead. Choose one; most recruiters are fine with the viewer.
5. Styles: generous padding, the lead constrained to `--measure`, and the buttons in a wrapping flex row.

### Check
- Both links work: GitHub opens, and the CV opens. You add the PDF in Step 5; until then it's a 404.
- The `<h1>` is the only `h1` on the page.

---

## Step 2: Technical stack

### Do it
Use `Section` with the title "Technical Stack" and the label "SPECIFICATIONS". Inside it, use `SkillGrid` fed with the Developer stack from `stacks.ts`.

### Check
6 cards show the real categories, and the grid collapses on narrow widths.

---

## Step 3: `ProjectRow.astro`

### What
A component that renders one project as a two-column row: media on the left, information on the right.

### Do it
1. **Props:**
   - `entry`: one collection entry. Its type is `CollectionEntry<'projects'>`, imported as a **type** from `astro:content`. Passing the whole entry keeps the call site short: `<ProjectRow entry={p} />`.
   - `wide` (optional boolean): GameDev will use it in Phase 6. You can leave it out until then.
2. **Frontmatter:** destructure `entry.data` for the fields you need. The row doesn't render the `.md` body: that's the case study, which gets its own page in Phase 7.5.
3. **Template:**
   1. An `<article>` with `id` set to `entry.id`.
   2. **The media column:**
      - a `<slot name="media">`
      - its **fallback content** is an `<Image>` (or `<Picture>`) of `cover`, with `alt` from `coverAlt` and a sensible `widths`/`sizes` for the column width
      - it's below the fold, so the default lazy loading is right
   3. **The info column**, in this order:
      1. an `<h3>` with the title
      2. the subtitle, only if present
      3. the `summary`, in a `<p>`
      4. `<TagList>` with the tags
      5. the role line (`Role: …`)
      6. the result box, only if `result` exists
      7. the links, as a `<ul>` of `<a>`s with each link's label and an ↗ marker, rendering nothing if the list is empty
   4. **The film metadata:** if `meta` exists, render it as a `<dl>` (description list), with each key as a `<dt>` and each value as a `<dd>`. A `<dl>` is the semantic element for label/value pairs. You build this now, but only Film projects have `meta`, so you'll see it in Phase 7.
4. **Styles:**
   - the article as a two-column grid (the mockup has a fixed media column of ~380px and a fluid info column) with a border, padding and background token
   - **one column below ~60rem** (a media query is fine here: it's a layout decision, not just fitting cards)
   - a `scroll-margin-top` on the article if your header is sticky
   - the result box with a dashed border and its label in `--color-accent` or a success color token

### Check
Use it on the page in the next step.

---

## Step 4: Featured projects section

### Do it
1. In the page frontmatter, get the `dev` projects with `getCollection` and **sort them by `order`**. This replaces the temporary title list from Phase 4.
2. Use `Section` with the title "Featured Engineering Projects" and the label "PRODUCTION SYSTEMS". Inside it, loop over the projects and render one `<ProjectRow>` each.

### Check
- Each project shows its cover, summary, tags, role, result and links.
- Open `/dev/#<project-id>` in a fresh tab: the page scrolls straight to that project, and it isn't hidden under the header.

---

## Step 5: `ExperienceList.astro`, Experience and Education

### What
One small component, rendered twice with different data.

### Do it
1. **Props:** `items`, an array of `{ org, role, period }` (the type you defined in `experience.ts`, imported as a type).
2. **Template:** a `<ul>`. Each `<li>` is a row with the org in bold, a separator and the role on the left, and the period on the right.
3. **Styles:**
   - each row as a flex row with `space-between`
   - a bottom border with `--color-line`, mono font, small text
   - wrapping on narrow widths
4. **On the page**, add these two sections after the projects:
   - `Section` "Experience" (label "CAREER LOG") with `ExperienceList` fed `experience`
   - `Section` "Education" (label "ACADEMIC LOG") with `ExperienceList` fed `education`
5. Put your CV PDF at `public/cv/dev.pdf`. A placeholder PDF is fine until the real one is ready.

### Check
- Both lists render.
- The CV link from the hero now opens the PDF.

---

## Step 6: Verify the reference page properly

Run these checks against the **production build**, `npm run build && npm run preview`, not the dev server. The dev server injects its own scripts and serves images unoptimized on the fly.

1. **Zero JS:** DevTools → Network → filter **JS** → reload. Nothing.
2. **Images:**
   - Network → filter **Img**. Covers arrive as AVIF/WebP, with sizes appropriate to the column (not the original).
   - Inspect an `<img>`: it has `width`, `height`, `alt` and `loading="lazy"`.
3. **No layout shift:** DevTools → **Performance**, with CPU and network throttling, then reload. The page doesn't jump as images arrive.
4. **Heading outline:**
   - h1 → h2 for each section → h3 for each project and each skill card
   - check it in DevTools → Elements → Accessibility tree, or with a headings extension
   - no level is skipped
5. **Keyboard:** Tab through the page. Every link is reachable, focus is always visible, and the order follows the visual order.
6. **Lighthouse** (DevTools → Lighthouse → Mobile → all categories):
   - Performance should be in the high 90s
   - Accessibility and Best Practices at 100, or close, with every failure understood
   - fix what it flags before moving on
7. **Mobile:** use device mode at 360px wide. There's no horizontal scrolling, and the rows stack to one column.
8. **Publish** (merge `develop` into `master` and push), and repeat checks 1 and 6 on the live URL.

---

## Common pitfalls

- **`<img src="/images/x.png">` pointing into `public/`:** no optimization and no dimensions. Images go through `<Image>`/`<Picture>` from `src/assets/`.
- **An empty `alt`** on a meaningful image. Empty alt (`alt=""`) is only for purely decorative images.
- **Forgetting to sort** the collection.
- **Building a second "row" component** later for GameDev or Film instead of using the slot and props. That's the divergence this phase exists to prevent.
- **Checking performance on the dev server:** it isn't representative.

---

## Done when

- [ ] `/dev/` has all sections: Hero → Stack → Projects → Experience → Education.
- [ ] `ProjectRow` has a named `media` slot whose fallback is the cover image.
- [ ] Project anchors work and aren't hidden under the header.
- [ ] The production build ships **0 JS** on this page.
- [ ] Images are AVIF/WebP, with dimensions, and with no layout shift.
- [ ] The heading outline has no skipped levels.
- [ ] Lighthouse mobile is green, and every flagged item is fixed or understood.
- [ ] It works at 360px wide.
- [ ] Phase 5 is checked off in `docs/PLAN.md`.

---

## References

- [Images in Astro](https://docs.astro.build/en/guides/images/) (`<Image>`, `<Picture>`, responsive images)
- [`astro:assets` reference](https://docs.astro.build/en/reference/modules/astro-assets/)
- [Named slots and fallback content](https://docs.astro.build/en/basics/astro-components/#named-slots)
- [web.dev: Cumulative Layout Shift](https://web.dev/articles/cls)
- [MDN: `<dl>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl)
- [Chrome DevTools: Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)

## Concepts recap

| Concept | One line |
|---|---|
| `<Image>` / `<Picture>` | Resized, converted, hashed images with dimensions, so no layout shift. |
| `srcset` / responsive sizes | Phones download small files, big screens get large ones. |
| Named slot + fallback | One component, with media the caller can override. |
| `public/` for the CV | A stable, human-readable URL. |
| `id` + `scroll-margin-top` | Deep links to a project that aren't hidden under the header. |
| `<dl>` | The semantic element for label/value pairs. |
| Test the production build | The dev server isn't representative for performance. |
