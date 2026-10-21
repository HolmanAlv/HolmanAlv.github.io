# Phase 3: Primitives

> **As built (2026-10-18):** `Section` has no `label` prop: just the `<h2>` on top and the content below it. The labels the later guides name (`SPECIFICATIONS`, `CAREER LOG`…) don't exist.

**Goal:** the small building blocks every page reuses: a section wrapper, a tag list, button styles and a skill grid.

**You will learn:**
- when something deserves a component and when a CSS class is enough
- optional props and default values
- conditional rendering
- intrinsic CSS layouts (auto-fit/minmax) and `define:vars`
- semantic lists
- links vs buttons

**Before you start:** Phase 2 is done and the site is live.

**Files you will touch:**
- `src/components/Section.astro` (new)
- `src/components/TagList.astro` (new)
- `src/components/SkillGrid.astro` (new)
- `src/styles/global.css`
- `src/pages/dev.astro` (as a test bench)

**Out of scope:** real data (Phase 4) and page layouts (Phases 5–8).

---

## Concepts

### 1. Component or class?

Make a **component** when a piece of UI has **structure** (several elements in a fixed arrangement) or **logic** (it loops, it renders conditionally). Use a **CSS class** when it's just how one element looks.

- A section with a heading, a label and content has structure, so it's a component.
- A button is one `<a>` with a look, so it's a class. A `Button.astro` component would only forward attributes to an `<a>` and add a file to maintain.

### 2. Optional props and defaults

In `interface Props`, a `?` after a name makes it optional (`label?: string`). When you destructure `Astro.props` you can give it a default value (for example an empty list), so the template never has to deal with `undefined`.

### 3. Conditional rendering

`{value && <element />}` renders the element only if `value` is truthy. Use it so that an empty tag list renders **nothing**, rather than an empty `<ul>`, and a section without a label has no empty `<span>`.

> **Trap:** `{list.length && ...}` renders a literal `0` when the list is empty, because `0` is falsy but still gets printed. Compare explicitly: `list.length > 0 && ...`.

### 4. Intrinsic layouts instead of breakpoints

`grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr))` tells the browser to "fit as many columns of at least 14rem as the space allows, and stretch them to fill the row". The grid adapts to its container on its own, without media queries or a `columns` prop.

**Its limit:** 6 items in a row that fits 4 leaves 2 orphans on the second row. If that bothers you, Astro's `define:vars` passes a frontmatter value into the component's `<style>` as a CSS custom property, so the parent can say how many columns it wants.

### 5. Semantic lists

A row of tags, a list of skills or a group of links **is a list**, so mark it up as `<ul>`/`<li>`. Screen readers announce "list, 5 items". It's free information that a row of `<span>`s doesn't give. Remove the bullets with CSS, not by avoiding the element.

### 6. Links vs buttons, the rule

- **Goes somewhere** (another page, a file, an anchor, an external site) → `<a href>`.
- **Does something on this page** (plays, opens, toggles) → `<button>`.

Your "Download CV" and "View GitHub" are links styled as buttons. That's why the button styles are classes you put on an `<a>`.

---

## Step 1: `Section.astro`

### What
A wrapper used for every content section: a header with the section title and an optional small label (the mockup's `SPECIFICATIONS`, `CAREER LOG`…), then the content.

### Why
It sets the **vertical rhythm** of the whole site: the same padding, the same heading style and the same spacing between title and content. Change it once and all four pages follow.

### Do it
1. **Props:**
   - `title` (string, required)
   - `label` (string, optional): the small uppercase text
   - `id` (string, optional): lets a section be the target of an anchor link
2. **Template:**
   - a `<section>` that receives `id`
   - inside, a `<header>` with an `<h2>` (the title) and, **only if `label` exists**, a `<span>` (or `<p>`) with the label
   - then a `<slot />` for the content
3. **Accessibility (recommended):** when `id` is given, give the `<h2>` its own id (for example the section id plus `-title`) and set `aria-labelledby` on the `<section>` to that heading id. Screen readers then announce the section by its title.
4. **Styles:**
   - section padding from the spacing tokens (the mockup uses about `--space-xl`)
   - a bottom border with `--color-line`
   - the header as a flex row, with the title on the left, the label on the right and baseline alignment
   - the label in `--font-mono`, `--text-xs`, uppercase, muted color
   - the title in `--text-2xl`

### Check
Use it twice on `dev.astro` (inside the Layout), once with a label and once without. The labelled one shows the label, and the other renders no empty element (check in Inspect).

---

## Step 2: `TagList.astro`

### What
A list of small chips. You'll use it for project tags, and anywhere else you show a row of technologies.

### Do it
1. **Props:** `tags`, an array of strings.
2. **Template:** if the array has items, a `<ul>` with one `<li>` per tag. If it's empty, render nothing.
3. **Styles:**
   - the `ul` as a wrapping flex row with a small gap, and without bullets or padding
   - each `li` with a 1px border in `--color-line`, small padding, `--font-mono` and `--text-xs`

### Check
- Render it with 3 tags: you see 3 chips, and Inspect shows a `ul` with 3 `li`.
- Render it with an empty array: nothing at all appears in the DOM.

---

## Step 3: Button classes in `global.css`

### What
Two looks, **primary** (filled) and **outline** (bordered), as global classes for `<a>` elements.

### Why
They're used across several components and pages, and a class is the lightest way to share a look (concept 1). This is one of the few things that belongs in `global.css`, because it's site-wide vocabulary and not one component's internals.

### Do it
1. In `global.css`, add a section for buttons with three classes:
   - **a base class** (for example `btn`): inline-flex, padding from spacing tokens, `--font-mono`, small text, a 1px border, no underline, and a transition on color and background
   - **a primary modifier:** background `--color-fg`, text `--color-bg`, border `--color-fg`
   - **an outline modifier:** transparent background, text `--color-fg`, border `--color-line`
2. Add hover styles for both.
3. Add a **`:focus-visible` style**: an outline in `--color-accent` with an offset. `:focus-visible` shows the ring for keyboard users without flashing it on mouse clicks. Never remove focus outlines without replacing them.
4. If you add transitions, make sure they respect reduced motion. A global rule that sets transitions to none under `@media (prefers-reduced-motion: reduce)` covers the whole site; Phase 11 confirms it.

### Check
- Put two `<a>`s with those classes on the test page, and hover them.
- Press Tab until one is focused: the focus ring is clearly visible in both light and dark mode.

---

## Step 4: `SkillGrid.astro`

### What
A grid of category cards, each with a title and a list of items. You'll use it for the Developer stack (6 groups), the GameDev stack (4 groups) and the Film tools (3 groups).

### Do it
1. **Props:** `groups`, an array of objects, each with:
   - `category` (string)
   - `items` (array of strings)
2. **Template:** a `<ul>` of cards (it's a list of groups). Each card is an `<li>` containing:
   - an `<h3>` with the category: it sits under the section's `<h2>`, so it's level 3
   - an inner `<ul>` with the items
3. **Styles:**
   - the outer list as a CSS grid with the auto-fit/minmax pattern from concept 4, with a gap from tokens
   - the cards with a border, padding and the background token
   - the category in mono, small, accent color, with a separator line under it
   - the items without bullets (the mockup uses a small ▪ marker; a `::before` pseudo-element does that in CSS, without extra markup)
4. **Optional, only if the orphans bother you:** add a `columns` prop (number) and use `define:vars` to feed it into the grid as a custom property.

### Check
- Feed it a temporary array of 6 groups written in the test page's frontmatter (the real data arrives in Phase 4).
- Resize the window: the columns collapse to fewer and fewer, down to one on a phone width, with no media query.

---

## Step 5: Clean up the test bench

After checking everything, **leave `dev.astro` with only its `<h1>`**, or keep the Section and SkillGrid usage if you like it as a head start for Phase 5. Don't leave a separate test page in `src/pages/`: it would be published.

---

## Common pitfalls

- **A `Button.astro` component for a styled `<a>`:** it's indirection without benefit.
- **`<div>` soup for lists:** use `ul`/`li` and remove the bullets with CSS.
- **Skipping heading levels:** `h1` (page) → `h2` (Section) → `h3` (cards and projects). Choose the level by structure, not by font size. Size is CSS.
- **Expecting the page's styles to reach inside SkillGrid:** they can't (scoped styles). Style it inside the component, or pass a prop.
- **The rendered `0`** from `{list.length && ...}`.
- **Removing `outline` on focus:** keyboard users lose track of where they are.

---

## Done when

- [ ] `Section`, `TagList` and `SkillGrid` exist and render on the Developer page.
- [ ] Optional parts (label, empty tags) render no empty elements.
- [ ] The button classes are in `global.css`, with a visible `:focus-visible`.
- [ ] SkillGrid collapses to one column on a narrow window, with no media query.
- [ ] The production build still ships **0 JS**.
- [ ] No stray test page in `src/pages/`.
- [ ] Phase 3 is checked off in `docs/PLAN.md`.

---

## References

- [Astro components: props and slots](https://docs.astro.build/en/basics/astro-components/)
- [Template directives: `define:vars`](https://docs.astro.build/en/reference/directives-reference/#definevars)
- [MDN: CSS grid `repeat()` with `auto-fit`](https://developer.mozilla.org/en-US/docs/Web/CSS/repeat)
- [MDN: `:focus-visible`](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible)
- [MDN: `aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby)

## Concepts recap

| Concept | One line |
|---|---|
| Component or class | Structure or logic means a component. Just a look means a class. |
| Optional props + defaults | `?` in the interface, and a default when destructuring. |
| Conditional rendering | `cond && <el/>`, and beware of the rendered `0`. |
| auto-fit / minmax | The grid adapts to its container without breakpoints. |
| `define:vars` | Pass a frontmatter value into scoped CSS. |
| Semantic lists | `ul`/`li` gives screen readers structure for free. |
| Link vs button | Navigation is `<a>`, an action on the page is `<button>`. |
| `:focus-visible` | Focus rings for keyboard users without flashing them on mouse clicks. |
