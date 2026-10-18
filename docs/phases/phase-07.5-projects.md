# Phase 7.5: Project pages (case studies)

**Goal:** every project with a written case study gets its own page at `/projects/<id>/`, generated from its `.md` file by **one** template. The project rows on the three subpages link to it. Adding a case study means writing the body of a `.md` file, and nothing else.

**You will learn:**
- dynamic routes and `getStaticPaths()`
- rendering a Markdown body with `render()` and `<Content />`
- styling Markdown output with `:global()`
- images inside Markdown
- deriving a page's `<head>` from data
- when `aria-current` should mark nothing

**Before you start:** Phase 7 is done, and you have a few paragraphs ready for at least one project's case study (a draft is fine).

**Files you will touch:**
- `src/pages/projects/[id].astro` (new)
- `src/components/ProjectRow.astro` (adds the link)
- `src/content/projects/*.md` (the bodies)
- `src/assets/images/projects/` (images used inside case studies)

**Out of scope:**
- MDX: only needed if a case study needs a component inside the text (see the optional section at the end)
- a table of contents and previous/next navigation
- a per-project OG image (Phase 11 gives case studies their discipline's image)

**Why it sits between Film and Home:** it needs the collection (Phase 4), `ProjectRow` (Phase 5) and the YouTube facade (Phase 7), because Film case studies show their video at the top. Coming before Home puts the case studies inside Phase 8's publishable milestone.

---

## Concepts

### 1. Dynamic routes

Until now, each file in `src/pages/` was exactly one URL. A file name with brackets, like `[id].astro`, is a **dynamic route**: the part in brackets is a parameter, and **one file produces many pages**.

The site is static, so every page has to exist as an HTML file after the build. That means Astro needs to know, **at build time**, every value `id` will take. That's the job of `getStaticPaths()`.

### 2. `getStaticPaths()`

It's a function you **export** from the frontmatter. Astro calls it once during the build, and it returns a list. Each item in the list has:
- **`params`**: the value for each bracket, for example `{ id: 'chat-at' }`. Astro builds `/projects/chat-at/` from it.
- **`props`**: the data that page receives. Here it's the whole collection entry, read with `Astro.props`, like any component prop.

Astro then renders the template **once per item**. The result is N plain HTML files: no server, no JavaScript.

Without `getStaticPaths()`, a dynamic route **fails the build** in a static site, with an error saying it's required.

### 3. Which projects get a page

Not every project needs a case study. The rule: **a project gets a page when its `.md` body has text.**

Entries from the `glob` loader carry the raw Markdown body in `entry.body`. The check is `entry.body?.trim()`:
- `?.` covers an entry with no body at all
- `trim()` covers a body made only of blank lines
- an empty string is falsy, so a filter drops that entry

The same check decides whether `ProjectRow` shows the link (Step 4). **Two places, one condition:** if they ever differ, a row links to a page that was never built.

### 4. `render()` and `<Content />`

`render(entry)` (from `astro:content`) compiles the Markdown body and gives back a `Content` component. You place `<Content />` wherever the text goes.

Markdown headings get an `id` automatically: `## The problem` becomes `<h2 id="the-problem">`. So `/projects/chat-at/#the-problem` links straight to that section, for free.

### 5. Scoped styles don't reach the Markdown

This is the Phase 1 gotcha again: **a component's scoped styles can't reach inside a child component.** `<Content />` is a component, so a `p { … }` rule in the page **does nothing** to the case study's paragraphs.

You can see it in the build output: the page's rule becomes `p[data-astro-cid-…]`, but the paragraphs that come from the Markdown don't carry that attribute.

The fix is to wrap `<Content />` in an element with a class, for example `prose`, and use **`:global()`** on the inner part of the selector:

```css
.prose :global(p) { … }
```

- `.prose` stays scoped, so the rule only applies inside this page's wrapper.
- `:global(p)` drops the scoping for the `p` part, so it reaches the paragraphs from the Markdown.

**This styling isn't optional.** The reset in `global.css` sets every margin to 0, so unstyled Markdown is one wall of text with no space between paragraphs.

### 6. Images inside Markdown

`![alt text](path)` with a **path relative to the `.md` file**, pointing into `src/assets/`, gets the same treatment as `<Image>`: converted, resized, and written with `width` and `height`.

- The part in brackets is the `alt`. Write a real one.
- A path into `public/`, or a full URL, is **not** optimized.

### 7. The `<head>` comes from the data

The Layout requires `title` and `description`. On a case study both come from the entry:
- **title:** the project title first, then your name, for example `Chat At · Holman Alvarado`. Browser tabs truncate long titles, so the specific part goes first.
- **description:** the `summary`, which is already about one sentence.

The canonical URL needs nothing: the Layout already builds it from the path. You never write any of this by hand per project.

### 8. `aria-current` marks nothing here

No header link equals `/projects/chat-at/`, so **no link gets `aria-current`**. That's correct: `aria-current="page"` means "this exact page", and a case study isn't the Developer page. The way back is the back link at the top of the page (Step 3).

---

## Step 1: Clear the way

### Do it
Check that `src/pages/projects/` is empty and `src/content/posts/` is gone. The old experiments (`glud.md`, `chat_at.astro` and `content/posts/chat_at.md`) should have been deleted before the first deploy (Phase 2).

### Why
A static file wins over a dynamic route. If `glud.md` stays next to `[id].astro`, it takes `/projects/glud/` instead of the generated page.

---

## Step 2: Write one real case study

### What
The body of one project's `.md` file.

### Do it
1. Open a project file from Phase 4. Below the frontmatter, write the case study in Markdown.
2. **Start the headings at `##`.** The page's `<h1>` is the project title, which the template prints. A `#` in the body would create a second `h1`.
3. A structure recruiters scan easily:
   - Context
   - The problem
   - What I did (the decisions, and why)
   - Result
   - What I'd do differently

   Adapt it per discipline. A Film breakdown might be Concept → Process → Sound → Credits.
4. Add one or two images:
   - put them in `src/assets/images/projects/<id>/`
   - reference them **relative to the `.md` file**: from `src/content/projects/` that's `../../assets/images/projects/<id>/…`
   - write a real alt text
5. Leave another project's body **empty**, so you can test that it gets no page.

### Why
It's the same lesson as Phase 4 Step 8: you design the template against real text, not invented text.

### Check
`npm run dev` starts with no errors.

---

## Step 3: The route, `src/pages/projects/[id].astro`

### What
The one template that turns every case study into a page.

### Do it
1. **Imports:**
   - the Layout
   - `getCollection` and `render` from `astro:content`, plus the `CollectionEntry` **type**
   - `Image` from `astro:assets`
   - `TagList` and `YouTubeFacade`
2. **Export an `async` function `getStaticPaths()`:**
   1. get the `projects` collection, filtered to the entries whose body has text (concept 3)
   2. return one item per entry, with `params` set to `{ id: entry.id }` and `props` set to `{ entry }`
3. **The rest of the frontmatter:**
   1. an `interface Props` with `entry` typed as `CollectionEntry<'projects'>`, the same type `ProjectRow` uses, so `astro check` knows the shape
   2. read `entry` from `Astro.props`
   3. get `Content` from `render(entry)`
   4. destructure the fields you need from `entry.data`
4. **Template**, wrapped in `<Layout>` with `title` and `description` (concept 7):
   1. An `<article>`.
   2. **A back link** to the project's row on its subpage: `/` + discipline + `/#` + id. It's the same derived link Home uses in Phase 8, and it works because `discipline` equals the route name. The text could be "← Back to projects". Mark the arrow `aria-hidden="true"` so screen readers don't read "left arrow".
   3. **The header of the case study**, in this order:
      1. a small label with the discipline
      2. the `<h1>` with the title
      3. the subtitle, only if present
      4. the role line
      5. `<TagList>` with the tags
      6. the result box, only if `result` exists
      7. the external links, as in `ProjectRow`, rendering nothing if the list is empty
      8. the film metadata `<dl>`, only if `meta` exists
   4. **The media**, which is above the fold and is the page's **LCP**:
      - if `youtubeId` exists: `<YouTubeFacade>` with **`priority`**
      - otherwise: `<Image>` of `cover` with `alt` from `coverAlt`, the **`priority`** prop (eager loading, high fetch priority), and `widths`/`sizes` for the content width
   5. **The case study:** `<div class="prose"><Content /></div>`.
5. **Styles:**
   - the header and the prose constrained to `--measure`, so lines stay readable; the media can be wider, up to `--container`
   - the prose rules, all written as `.prose :global(…)` (concept 5):
     - **vertical rhythm:** `.prose :global(* + *)` with a `margin-top` from your spacing tokens. It adds space between consecutive elements and none before the first one.
     - more space above `h2` and `h3` than below them, so each heading sticks to its section
     - images at full width of the prose column
     - lists with their indentation back (the default padding is fine)
     - `code` in `--font-mono`, and blockquotes with a left border in `--color-line`

### Check
1. `npm run dev`, then open `/projects/<your-id>/`. The case study shows with readable spacing.
2. Open `/projects/<the-empty-one>/`. It's a 404, because that project has no body.
3. `npm run build`. `dist/projects/` has one folder per project with a body, and none for the empty one.

---

## Step 4: Link from `ProjectRow`

### Do it
1. In `ProjectRow.astro`, after the links list, add a link to `/projects/` + id + `/` with text like "Read the case study →".
2. Render it **only when the project has a body**, with exactly the same check as `getStaticPaths()` (concept 3).
3. It's an internal link:
   - it opens in the same tab
   - it gets **no ↗**: the ↗ marks external links
   - the href ends with a slash, the Phase 1 rule
   - the arrow is `aria-hidden="true"`, like the back link

### Why
`ProjectRow` is shared, so Developer, GameDev and Film all get the link at once. This is the reason the row was built as one component in Phase 5.

### Check
- The link appears only on rows of projects that have a case study, on all three subpages.
- Every one of those links opens its page.

---

## Step 5: Verify

Run these checks against the **production build**, `npm run build && npm run preview`:
1. **Pages:** one per case study, and `/projects/<the-empty-one>/` is a 404.
2. **JS:**
   - Developer and GameDev case studies ship **0 KB**
   - Film case studies ship only the facade
3. **LCP:** the cover or the facade poster is the **only** priority image. The images inside the text are lazy.
4. **Images in the text:** Network → Img shows AVIF/WebP, and each `<img>` has `width`, `height` and `alt`.
5. **Heading outline:** one `h1` (the title), the body starting at `h2`, and no skipped levels.
6. **View-source:**
   - the `<title>` starts with the project title
   - the description is the `summary`
   - the canonical is `https://holmanalv.github.io/projects/<id>/`
7. **Header:** no link has `aria-current`.
8. **The back link** lands on the project's row, not hidden under the header (the `scroll-margin-top` from Phase 5).
9. **Section links:** `/projects/<id>/#<heading-id>` scrolls to that heading.
10. **Mobile and Lighthouse:** 360px wide with no horizontal scroll, then Lighthouse on mobile.
11. **Publish** (merge `develop` into `master` and push), and repeat checks 2 and 10 on the live URL.

---

## Optional: components inside the text (MDX)

Plain Markdown can't hold a component. If a real case study needs one in the middle of the text, for example a second video or a before/after image grid:
1. `npx astro add mdx` adds MDX: Markdown that can import and use components.
2. Rename **that one** file from `.md` to `.mdx`.
3. Widen the loader pattern in `content.config.ts` to `**/*.{md,mdx}`.
4. Import the component at the top of the `.mdx` file and use it in the text.

Do it only when a case study actually needs it. `.md` stays the default.

---

## Common pitfalls

- **No `getStaticPaths()`:** the build fails, because a static dynamic route has to list its pages.
- **A `#` heading in the body:** it creates a second `h1`. Case studies start at `##`.
- **Styling `p` or `h2` without `:global()`:** nothing happens, because scoped styles don't reach `<Content />`.
- **`:global(p)` without `.prose` in front:** the rule escapes the wrapper and styles every paragraph on the page, the footer included.
- **The row's check and the route's filter differ:** rows link to pages that were never built.
- **Linking to `/projects/<id>` without the trailing slash:** it breaks the Phase 1 convention, and GitHub Pages answers with a redirect first.
- **Images from `public/` or full URLs in the text:** they aren't optimized.
- **`priority` on more than one image:** only the top media.
- **Renaming a `.md` file:** it changes `/projects/<id>/` and breaks the links you've sent (Phase 4, concept 6).

---

## Done when

- [ ] `src/pages/projects/[id].astro` generates one page per project with a body, and none for the rest.
- [ ] Each case study's title, description and canonical come from its data.
- [ ] The text is styled through `.prose` and `:global()`, with no leaks outside the wrapper.
- [ ] Images in the text are optimized and have alt text.
- [ ] `ProjectRow` links to the case study only when there is one, on all three subpages.
- [ ] Developer and GameDev case studies ship 0 KB of JS, and Film ones only the facade.
- [ ] Phase 7.5 is checked off in `docs/PLAN.md`.

---

## References

- [Routing: dynamic routes](https://docs.astro.build/en/guides/routing/#dynamic-routes)
- [`getStaticPaths()` reference](https://docs.astro.build/en/reference/routing-reference/#getstaticpaths)
- [Content collections: generating routes from content](https://docs.astro.build/en/guides/content-collections/#generating-routes-from-content)
- [`render()` reference](https://docs.astro.build/en/reference/modules/astro-content/#render)
- [Styles and CSS: `:global()`](https://docs.astro.build/en/guides/styling/#global-styles)
- [Images in Markdown files](https://docs.astro.build/en/guides/images/#images-in-markdown-files)
- [MDX integration](https://docs.astro.build/en/guides/integrations-guide/mdx/)

## Concepts recap

| Concept | One line |
|---|---|
| Dynamic route | A bracketed file name: one template, many pages. |
| `getStaticPaths()` | Lists every page at build time, with its params and props. |
| `entry.body?.trim()` | A project gets a page only when its body has text. |
| `render()` / `<Content />` | Turns the `.md` body into a component, with heading ids for free. |
| `.prose :global(…)` | Styles the Markdown output without leaking outside the wrapper. |
| Images in Markdown | Relative paths into `src/assets/` are optimized like `<Image>`. |
| Head from data | Title from the project title, description from the `summary`. |
| No `aria-current` | A case study isn't any header page, so nothing is marked. |
