# Phase 4: Content layer

**Goal:** projects live as validated Markdown files, and the rest of the site's data (profile, stacks, experience, timeline, lab) lives in typed TypeScript files. Pages read data. They never contain it.

**You will learn:**
- content collections, loaders and schemas (Zod)
- the `image()` helper
- generated types
- frontmatter vs body
- when to use a collection and when a typed `.ts` file is enough

**Before you start:** Phase 3 is done.

**Files you will touch:**
- `src/content.config.ts` (new)
- `src/content/projects/*.md` (new)
- `src/assets/images/projects/` (new)
- `src/data/*.ts` (new)
- `Footer.astro` (moves its data to `profile.ts`)

**Out of scope:** rendering projects nicely (Phase 5). Here you only prove the data flows.

---

## Concepts

### 1. Why the data goes outside the pages

When projects are written straight into a page's HTML:
- adding one means editing markup
- the Home cards and the subpage rows end up keeping two copies of the same project
- a typo ships silently

With a **content collection**:
- adding a project is writing one `.md` file
- every page reads the same source
- the build **fails** when a project is missing a required field

That failure is the feature: a broken project never reaches production.

### 2. Collections, loaders and schemas

A collection is declared in `src/content.config.ts` with three pieces:
- **`defineCollection`** (from `astro:content`) declares the collection.
- **A loader** says where the entries come from. The `glob` loader (from `astro/loaders`) reads every file matching a pattern in a folder.
- **A schema** says what each entry must contain. It's written with **Zod**, a validation library. Import `z` from **`astro/zod`**: Astro 6+ moved it there, so tutorials that import `z` from `astro:content` are outdated.

At build time (and in `npm run dev`) Astro validates every entry against the schema and **generates TypeScript types** into `.astro/`. Your editor then autocompletes `entry.data.` with your exact fields.

### 3. Frontmatter vs body

A Markdown file has two parts:
- **The frontmatter** (YAML between `---` lines) holds structured fields: `title`, `role`, `tags`… These are what the schema validates.
- **The body** (the Markdown below) holds prose. You'll use it for the project's long description and render it with `render()` in Phase 5.

The rule: anything you filter, sort or show in a fixed slot goes in the **frontmatter**, and free-form text goes in the **body**.

### 4. The `image()` helper

If the schema is written as a function, Astro hands it a context that includes `image()`. A field declared with `image()`:
- takes a **path relative to the `.md` file** in the frontmatter
- validates that the file exists (a typo fails the build)
- gives you image metadata that the `<Image>` component can optimize (Phase 5)

### 5. Collection or typed `.ts` file?

| Use a **collection** when… | Use a **typed `.ts` file** when… |
|---|---|
| Entries are documents with prose | It's a short structured list |
| You want one file per entry | All items fit comfortably in one file |
| You want build-time schema validation | TypeScript types are enough (checked by `astro check`, which runs in your build since Phase 1) |
| **Projects** | **Profile, stacks, experience, education, timeline, lab** |

A `.ts` file can also **import images** from `src/assets/`. The import gives the same optimizable metadata as `image()`, so the timeline and lab items can have images too.

### 6. Ids become anchors, and anchors are URLs

With the `glob` loader, an entry's `id` comes from its file name: `project-alpha.md` → `project-alpha`. In Phase 5 that id becomes the HTML id on the page (`/dev/#project-alpha`), and Home links to it. **Renaming a project file changes its URL.** Choose file names like you chose route names in Phase 0.

---

## Step 1: Folders

### Do it
Create these three folders:
1. `src/content/projects/` for the project Markdown files
2. `src/assets/images/projects/` for project covers
3. `src/data/` for the typed data files

### Why
`src/assets/` is processed by Astro (hashed, resized, converted). The images live there, not in `public/`.

---

## Step 2: `src/content.config.ts`

### What
Declare the `projects` collection with its schema.

### Do it
1. **Imports:** `defineCollection` from `astro:content`, `glob` from `astro/loaders`, `z` from `astro/zod`.
2. **The collection:**
   - the loader is `glob`, with `base` pointing to `./src/content/projects` and a pattern matching `.md` files
   - the schema is a **function** that receives `{ image }` and returns a `z.object` with these fields:

   | Field | Type | Required? | Used for |
   |---|---|---|---|
   | `title` | string | yes | Card and row heading |
   | `discipline` | enum: `dev`, `gamedev`, `art` | yes | Which page shows it. **The values equal the route names**, so links can be built from it. |
   | `subtitle` | string | no | The one-line pitch under the title (Dev/GameDev rows) |
   | `summary` | string | yes | The short text on the Home card |
   | `tags` | array of strings | no, default `[]` | `TagList` |
   | `role` | string | yes | "Role: …" |
   | `result` | string | no | The highlighted result box |
   | `links` | array of `{ label: string, url: string (URL) }` | no, default `[]` | "Source Code ↗", "Playable Build ↗"… |
   | `cover` | `image()` | yes | Card image, row image, and the poster for videos |
   | `coverAlt` | string | yes | The image's alt text, required on purpose |
   | `youtubeId` | string | no | Film projects: the video behind the facade (Phase 7) |
   | `meta` | record of string → string | no | Film production metadata (Format, Client, Year…) |
   | `featured` | boolean | no, default `false` | Picks the Home cards |
   | `order` | number | yes | Sort order inside its page |

3. **Export** a single `collections` object that contains `projects`.

### Why these choices
- **`discipline` equals the route name**, so a Home card's link is simply `/` + discipline + `/#` + id. You don't need a lookup table.
- **`coverAlt` is required:** the schema forces you to write it. Accessibility enforced by the build.
- **`links` is a list of `{label, url}`**, not fixed fields like `source` and `demo`. The mockup shows different link types per discipline, and a list handles all of them. Validating `url` as a URL catches broken links at build time.
- **`meta` is a record**, because the film metadata varies between projects (one has `MIX`, another `RENDER`).
- **`order` is required:** collections don't promise any order, so you sort explicitly.

### Check
`npm run dev` starts without errors. The collection is empty, which is fine, and Astro may warn that it has no entries.

---

## Step 3: Your first project file

### Do it
1. Put a cover image in `src/assets/images/projects/`. Any real screenshot works.
2. Create `src/content/projects/<slug>.md`. Pick the slug carefully (concept 6): lowercase with hyphens, like `neon-drift.md`.
3. **Frontmatter:** fill every required field.
   - `cover` is a path **relative to this `.md` file**, so from `src/content/projects/` it goes up two levels and into `assets/images/projects/`.
   - Quote any string that contains a colon. In YAML, `title: Alpha: the sequel` breaks and `title: "Alpha: the sequel"` works.
4. **Body:** two or three sentences of description in Markdown.

### Check
- `npm run dev` (or `npx astro sync`) runs without validation errors.
- In any `.astro` frontmatter, typing `entry.data.` autocompletes your fields. Those are the generated types at work.

---

## Step 4: Prove the data flows

### What
Read the collection from `dev.astro` and list the titles. This is temporary; Phase 5 does it properly.

### Do it
1. In the frontmatter, import `getCollection` from `astro:content`.
2. Call it with the name `projects` and a filter function that keeps entries whose `data.discipline` is `dev`. The call is `await`ed: frontmatter supports top-level await.
3. **Sort** the result by `data.order`. Don't rely on file order.
4. In the template, render a list of the titles.

### Check
The Developer page shows your project's title. A project with `discipline: gamedev` doesn't appear there.

---

## Step 5: Make the build fail on purpose

### Do it
1. Delete the `role` line from your `.md` and run `npm run build`. It **fails**, naming the file and the missing field.
2. Restore it. Now set `discipline: film`, which isn't in the enum. It fails again and lists the allowed values.
3. Restore it again.

### Why
Seeing the failure once is how you learn to trust it. **This is the safety net for every future project you add.**

---

## Step 6: The typed data files

### What
Create one `.ts` file per kind of data in `src/data/`. Each one exports a typed constant.

### Do it
Write a `type` (or `interface`) for each shape and annotate the export with it, so `astro check` catches a missing or misspelled field.

1. **`profile.ts`**:
   - `name`
   - `roles`: the line under your name on Home
   - `email`
   - `socials`: GitHub, itch.io, LinkedIn and YouTube URLs
   - `cv`: three public paths, `/cv/dev.pdf`, `/cv/gamedev.pdf` and `/cv/art.pdf`
   - the texts for the Home about and the Film about (the Dev and GameDev "about" is their hero lead, which you write in the page)
2. **`stacks.ts`**: three exports (or one object with three keys), each an array of `{ category, items[] }`, the exact shape `SkillGrid` expects.
   - **dev:** your real categories. The mockup has 6.
   - **gamedev:** Engine & Scripting, Rendering & Optimization, Tools & Pipeline, and **Game Audio with placeholder items** (FMOD / Wwise, Unity Audio Mixer, Reaper / DAW) until you confirm the real tools.
   - **art:** Editing, Sound Design, Animation.
3. **`experience.ts`**: two arrays with the same item shape, `{ org, role, period }`:
   - `experience`
   - `education` (here `org` is the institution and `role` the degree or course)
4. **`timeline.ts`**: an array of `{ period, label, title, description, image? }` for Home. Import any image at the top of the file from `src/assets/…` and reference it in the item.
5. **`lab.ts`**: an array of `{ label, title, description, image, imageAlt }` for the GameDev Shader & Tech Art Lab.

### Check
- Misspell one field in `stacks.ts` (for example `catgory`).
- `npm run check` fails and points to it.
- Fix it.

---

## Step 7: Move the footer data into `profile.ts`

### What
The Footer from Phase 1 has the email and social URLs hardcoded. Import `profile` in the Footer and read them from there.

### Why
The email and socials now live in **one** file. Phase 5's GitHub button and CV links read from the same place.

### Check
The footer looks exactly the same as before. Change the email in `profile.ts` and watch it update.

---

## Step 8: Real content

### Do it
Write **1–2 real projects per discipline**, with real covers. Mark **exactly one per discipline** as `featured: true`, for the Home cards.

### Why
A schema designed against invented data always misses something real: a project without a result, a video without a cover, a link type you didn't expect. Real entries test the schema now, while changing it is cheap.

---

## Common pitfalls

- **`import { z } from 'astro:content'`:** that's the pre-Astro-6 location. Use `astro/zod`.
- **The `cover` path written relative to the project root** instead of relative to the `.md` file.
- **Unquoted YAML strings with `:`** inside.
- **Relying on collection order:** always sort.
- **Renaming a `.md` file later:** it changes the anchor id and breaks links you've sent.
- **Putting images in `public/`** and referencing them from the schema: they won't be optimized, and `image()` won't validate them.
- **A schema field you never use:** delete it. Every field is something you'll have to fill in for every project.

---

## Done when

- [ ] `src/content.config.ts` defines `projects` with the schema above.
- [ ] Removing a required field fails `npm run build` with a clear message.
- [ ] The `.ts` data files exist, are typed, and a typo fails `npm run check`.
- [ ] The footer reads from `profile.ts`.
- [ ] There are 1–2 real projects per discipline, one `featured` each.
- [ ] The temporary title list in `dev.astro` works (replaced in Phase 5).
- [ ] Phase 4 is checked off in `docs/PLAN.md`.

---

## References

- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [`astro:content` API reference](https://docs.astro.build/en/reference/modules/astro-content/) (`defineCollection`, `getCollection`, `render`)
- [Images in content collections](https://docs.astro.build/en/guides/images/#images-in-content-collections)
- [Upgrade to Astro v6: importing `z` from `astro/zod`](https://docs.astro.build/en/guides/upgrade-to/v6/)
- [Zod documentation](https://zod.dev/)
- [YAML syntax gotchas](https://learnxinyminutes.com/docs/yaml/)

## Concepts recap

| Concept | One line |
|---|---|
| Content collection | Validated, typed content loaded at build time. |
| Loader (`glob`) | Where the entries come from: files matching a pattern. |
| Schema (Zod) | What every entry must contain, and the build fails if it doesn't. |
| `image()` | A validated, optimizable image path relative to the `.md` file. |
| Generated types | `.astro/` gives the editor your exact fields. |
| Frontmatter vs body | Structured fields above, prose below. |
| Collection vs `.ts` | Documents with prose go in collections. Short lists go in typed files. |
| Entry id | It comes from the file name and becomes the anchor in the URL. |
