# Phase 1: Shell (Layout, Header, Footer)

**Goal:** the 4 pages share a real HTML document (head, header, main, footer). They link to each other and show which page you're on, and a type error stops the build.

**You will learn:**
- the anatomy of an `.astro` component
- props and `interface Props`
- `<slot />` and default imports
- scoped styles
- what each `<head>` tag does
- `aria-current`
- computing values at build time
- type-checking with `astro check`

**Before you start:** Phase 0 is done, and there are 4 flat pages.

**Files you will touch:**
- `src/layouts/Layout.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- the 4 pages in `src/pages/`
- `package.json`

**Out of scope:** real content, final styles and the data files (Phase 4 moves the hardcoded footer data into `src/data/`).

---

## Concepts

### 1. Anatomy of an `.astro` component

An `.astro` file has up to four parts, in this order:

1. **Frontmatter**, between two `---` fences. TypeScript that runs **at build time**: imports, reading props, computing values. It never reaches the browser.
2. **Template**: HTML with `{expressions}` (like JSX). Writing `{condition && <tag />}` renders the tag only when the condition is true. `{list.map(item => <li>{item}</li>)}` renders a list.
3. **`<style>`** (optional): CSS **scoped** to this component (see concept 4).
4. **`<script>`** (optional): code that runs **in the browser**. You won't need any in this phase.

### 2. Props, `interface Props` and default imports

A component receives data through **props**, like attributes on a tag. Inside the component you read them from `Astro.props`.

If you declare an `interface Props` in the frontmatter, Astro uses it to type those props. If a page forgets a required prop, `astro check` (Step 5) reports it.

Every `.astro` file has **one default export: the component itself.** So you import it **without braces**: `import Header from '../components/Header.astro'`. The current Layout writes `import { Header } ...`, which asks for a named export that doesn't exist. That's the bug to fix in this phase.

### 3. `<slot />`: the hole where content goes

A Layout wraps pages. When a page writes content between `<Layout>` and `</Layout>`, that content lands where the Layout put its `<slot />`. **The Layout provides the frame and the page provides the content.** In Phase 3 you'll meet named slots, which allow more than one hole.

### 4. Scoped styles

A `<style>` inside a component applies **only to that component's markup**. At build time Astro adds a unique attribute (like `data-astro-cid-abc123`) to the component's elements and rewrites your selectors to include it. What that means for you:
- You can use short selectors like `ul` or `a` without affecting other components.
- No naming conventions (BEM) or CSS-in-JS needed.
- It costs zero JavaScript. It's all done when compiling.
- **One gotcha:** a parent's scoped styles **can't reach inside a child component**. If the page styles `ul`, that doesn't touch the `ul` inside `<Header />`. Style a component from inside the component.

`global.css` (the reset and tokens) is the exception: you import it **once**, in the Layout, and it applies everywhere.

### 5. The `<head>`, tag by tag

| Tag | Why it exists |
|---|---|
| `<meta charset="utf-8">` | **Must come first.** If it arrives late, the browser may re-parse the page and accents break. |
| `<meta name="viewport" content="width=device-width, initial-scale=1">` | Without it, phones pretend to be a desktop and shrink your page. Never add `user-scalable=no`: it blocks zoom. |
| `<title>` | The tab text, the bookmark name and the headline of a search result. One per page, all different. |
| `<meta name="description">` | The text under the title in search results and in many link previews. Around 150 characters. |
| `<link rel="canonical">` | The official URL of this page, so `/dev` and `/dev/?ref=x` aren't treated as different pages. |
| `<link rel="icon">` | The favicon. Your `public/` already has `.svg` and `.ico` versions. |
| `og:title`, `og:description`, `og:url`, `og:type` | The card LinkedIn, WhatsApp or Slack shows when someone pastes your link. Recruiters receive direct links, so this is a first impression. `og:image` comes in Phase 11. |

### 6. `aria-current`

**`aria-current="page"`** marks the link to the current page. Screen readers announce it, and you can style it with the selector `[aria-current="page"]`. That way the accessible state and the visual state come from the same source and can't disagree. A `class="active"` would only be visual.

### 7. Computing at build time

The footer year can be computed in the frontmatter with the date API. It runs **at build time**, so the HTML carries the number already written: zero JavaScript, and it updates every time you redeploy.

### 8. `astro build` doesn't check types

Astro compiles TypeScript by **stripping** the types without checking them. Your editor shows errors, but `npm run build` succeeds anyway. `astro check` is the separate command that checks types, and putting it in the build script makes those errors stop the build, locally and later in CI (Phase 2).

---

## Step 1: The Layout

### What
Turn `src/layouts/Layout.astro` into the shared document for every page.

### Why
Every page needs the same `<html>`, `<head>`, header and footer. Writing them once means a change to the header is one edit, not four.

### Do it
1. **Imports:** change the `Header` and `Footer` imports to **default imports** (remove the braces). Keep the `global.css` import. It's a side-effect import with nothing to name, and it's the only place in the project that imports `global.css`.
2. **Props:** `interface Props` has two required strings, `title` and `description`.
3. **The canonical URL:** keep the line that builds it. It combines `Astro.url.pathname` (the current path) with `Astro.site` (from the config) using the `URL` constructor. Since `site` is now always set, you can drop the "only if `Astro.site` exists" condition around the canonical link and `og:url` and emit them always.
4. **`<head>`**, in this order:
   1. charset
   2. viewport: add `initial-scale=1` to the current one, which only has `width=device-width`
   3. `<title>` from the `title` prop
   4. description meta from the `description` prop
   5. canonical link
   6. the two favicon links
   7. the four `og:` meta tags
5. **`<body>`**, in this order:
   1. `<Header />`
   2. `<main>` containing the `<slot />`
   3. `<Footer />`

### Check
Nothing renders differently yet, because no page uses the Layout. That's Step 4.

---

## Step 2: The Header

### What
Write `src/components/Header.astro`:
- the brand `HOLMAN_ALV`, linking to Home
- three links: Developer, GameDev, Film
- a `Contact` link that jumps to the footer

### Why
- **The brand is the Home link**, which is the convention people expect. A separate "Home" tab would repeat it.
- **The links are data**, not hand-written HTML. Adding or renaming a section becomes a one-line change, and the active-state logic is written once.
- **`Contact` points to `#contact`.** The footer is on every page, so the same anchor works everywhere without JavaScript.

### Do it
1. **Frontmatter:**
   1. Define an array of links, each with a `label` and an `href`: `Developer` → `/dev/`, `GameDev` → `/gamedev/`, `Film` → `/art/`.
   2. Read the current path from `Astro.url.pathname`.
   3. Write a tiny helper that removes a trailing slash, so `/dev` and `/dev/` compare as equal. The current path can arrive with or without the slash depending on dev or build.
2. **Template:**
   1. A `<header>` containing an `<a>` with the text `HOLMAN_ALV` and `href="/"`.
   2. A `<nav>` with an `aria-label` of "Main", containing a `<ul>` with one `<li><a>` per link from the array.
   3. On each nav link, set `aria-current` to `"page"` when its normalized href equals the normalized current path, and to `undefined` otherwise. **An attribute set to `undefined` isn't rendered at all**, which is what you want on the inactive links. `"false"` would print `aria-current="false"` on every one of them.
   4. An `<a>` with the text `Contact` and `href="#contact"`.
3. **Styles (scoped, placeholder-level):**
   - a flex row with a gap from your spacing tokens
   - the brand pushed left with `margin-right: auto`
   - the list without bullets or padding
   - the active link styled through the `[aria-current="page"]` selector, for example bold and underlined
   - `flex-wrap: wrap`, so it fits on a phone without a hamburger menu (three links and a button fit)

### Check
Nothing renders yet (Step 4).

> **If you make the header sticky** (the mockup has a sticky navbar): anchored targets such as `#contact` and the project ids from Phase 5 will scroll *under* it. The fix is CSS: give the targets a `scroll-margin-top` roughly equal to the header height. Note it now and apply it when you style the header.

---

## Step 3: The Footer (contact section)

### What
Write `src/components/Footer.astro`:
- a call to action
- your email
- links to GitHub, itch.io, LinkedIn and YouTube
- a copyright line with the year

### Why
- The footer **is** the contact section, as decided in the plan.
- `id="contact"` is what the header's Contact link points to.
- The data is hardcoded for now. Phase 4 moves it into `src/data/profile.ts`, so the email lives in one place.

### Do it
1. **Frontmatter:** compute the current year with the date API, at build time.
2. **Template:**
   1. A `<footer id="contact">`.
   2. A **heading as `<h2>`**, for example "Let's work together". Each page has one `<h1>`, so the footer heading is a level below it.
   3. One sentence of context.
   4. A **`mailto:` link** with your email. Placeholder text is fine for now.
   5. A `<ul>` with the four social links.
   6. A small line: `© {year} Holman Alvarado`.
3. **Styles:** a column layout, muted color and small text from the tokens, with the call to action visually separated (border or background token).

> **About `mailto:` and spam:** an email address in plain HTML gets harvested by bots. The common defenses cost JavaScript or make the link worse to use. For a portfolio the trade-off usually favors the plain link. Use a dedicated address if it worries you.

### Check
Nothing renders yet (Step 4).

---

## Step 4: Wrap the 4 pages in the Layout

### What
Each page imports the Layout and passes its own `title` and `description`.

### Why
This is where the shell starts to exist. Each page's title and description are what a recruiter sees in the browser tab and in the link preview, so write real ones now, not "Page 1".

### Do it
For each of the 4 pages:
1. Add a frontmatter fence and, inside it, a **default import** of the Layout (`../layouts/Layout.astro`).
2. Wrap the existing `<h1>` in `<Layout>` and pass `title` and `description` as attributes.
3. Suggested titles. Each one says who you are and what this page is:
   - Home: `Holman Alvarado: Developer, Game Dev & Filmmaker`
   - Developer: `Holman Alvarado: Software Developer`
   - GameDev: `Holman Alvarado: Game Developer & Technical Artist`
   - Film: `Holman Alvarado: Animator & Sound Designer`
4. Descriptions: one sentence each, around 150 characters, saying what the visitor will find on that page.

### Check
1. `npm run dev`. Each page shows the header, its heading and the footer.
2. The header links move between pages. On `/gamedev/`, the GameDev link looks active.
3. Right-click the GameDev link → *Inspect*. It has `aria-current="page"`, and the other two links **don't have the attribute at all**.
4. *View page source* (not the inspector). It starts with `<!DOCTYPE html>` / `<html lang="en">`, and `<head>` has the charset first and the canonical link pointing to `https://holmanalv.github.io/gamedev/`.
5. Click **Contact**: the page scrolls to the footer.
6. DevTools → **Network** → filter **JS** → reload. Apart from the dev server's own scripts (Vite and the Astro toolbar), there's **nothing from you**. The production build (`npm run build && npm run preview`) shows zero JS files.

---

## Step 5: Make types count (`astro check`)

### What
Install Astro's type checker and run it as part of the build.

### Why
You now have `interface Props` on the Layout. A page that forgets `description` should **fail the build**, not ship a page with an empty description. This is a development-only dependency: it never reaches the browser.

### Do it
1. Install the checker and TypeScript as dev dependencies:
   ```sh
   npm install -D @astrojs/check typescript
   ```
2. In `package.json` `scripts`:
   - add `"check": "astro check"`
   - change `"build"` to run the check first and then the build, chained with `&&`, so a failed check stops the build
3. Run `npm run check`. It should report 0 errors.

### Check
- Temporarily delete the `description` attribute from one page.
- `npm run build` fails, naming the missing prop.
- Put it back, and the build passes again.

---

## Common pitfalls

- **`import { Header } from ...` (with braces):** an `.astro` file has only a default export, so the import comes back empty. This is the bug the old Layout had.
- **Importing `global.css` in several places:** it's deduplicated, so nothing breaks, but it hides where the global styles come from. Import it once, in the Layout.
- **Comparing paths without normalizing:** the active link never lights up in one of the two environments (dev or build).
- **`aria-current="false"`:** valid but noisy. Use `undefined` so the attribute disappears.
- **More than one `<h1>` per page:** the page heading is the only `h1`. Section and footer headings are `h2`.
- **Styling the header from a page:** scoped styles don't cross component boundaries. Style it inside `Header.astro`.

---

## Done when

- [ ] All 4 pages use the Layout and have their own title and description.
- [ ] The view-source checks in Step 4 pass (charset first, `lang="en"`, absolute canonical).
- [ ] The active link has `aria-current="page"`, and the inactive ones don't have the attribute.
- [ ] Contact scrolls to the footer on every page.
- [ ] The production build ships 0 JS files.
- [ ] `npm run build` runs `astro check` first, and a missing prop fails it.
- [ ] Phase 1 is checked off in `docs/PLAN.md`.

---

## References

- [Astro components](https://docs.astro.build/en/basics/astro-components/): frontmatter, props, slots
- [Layouts](https://docs.astro.build/en/basics/layouts/)
- [Astro template syntax](https://docs.astro.build/en/reference/astro-syntax/): expressions, conditionals, lists
- [Styles and CSS](https://docs.astro.build/en/guides/styling/): scoped styles, global styles
- [TypeScript in Astro](https://docs.astro.build/en/guides/typescript/) and the [`astro check` command](https://docs.astro.build/en/reference/cli-reference/#astro-check)
- [MDN: `aria-current`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-current)
- [The Open Graph protocol](https://ogp.me/)

## Concepts recap

| Concept | One line |
|---|---|
| Frontmatter / template / style / script | Build-time logic, HTML output, scoped CSS, browser code. |
| Default import | `.astro` files export one component, so you import it without braces. |
| `interface Props` | Types what a component receives, and `astro check` enforces it. |
| `<slot />` | The hole where the wrapped content lands. |
| Scoped styles | Short selectors, no leaks, zero JS, and they can't reach into child components. |
| Charset first | Late charset means re-parsing and broken accents. |
| Canonical / OG | The official URL and the link-preview card. |
| `aria-current` | One attribute for both the accessible and the visual active state. |
| Build-time values | The footer year is computed on your machine, so it ships as plain text. |
| `astro check` | The build strips types without checking them, and this command is what checks them. |
