# Phase 0: Cleanup (drop i18n)

**Goal:** an English-only project with 4 flat routes and no leftovers from the bilingual setup.

**You will learn:**
- where code runs: at build time or in the browser
- what `astro.config.mjs` is
- file-based routing
- why a URL is a contract

**Before you start:** `npm ci` has run and `npm run build` passes. It currently produces 9 pages.

**Files you will touch:**
- `astro.config.mjs`
- everything in `src/pages/`
- `src/layouts/Layout.astro`
- `src/i18n/` (deleted)
- `README.md`

**Out of scope:** making the Layout work (Phase 1), styling and components.

---

## Concepts

### 1. Two places where code runs

Astro is a **build tool**. Most of your code runs once, on your machine, when you run `npm run build`. The visitor only receives the result: plain HTML and CSS.

| Where you write it | When it runs | Reaches the visitor? |
|---|---|---|
| `astro.config.mjs` | At build time, in Node | No |
| The frontmatter of a `.astro` file (between the `---` fences) | At build time, once per generated page | No, only its result |
| The template of a `.astro` file (the HTML part) | At build time, and becomes HTML | Yes, as HTML |
| A `<script>` tag inside a `.astro` file | In the browser | Yes, as JavaScript |
| Files in `public/` | Never: they're copied as-is | Yes, unchanged |

This table explains how Astro can ship "zero JS by default". Everything above the `<script>` row disappears after the build. Keep it in mind for the whole project: whenever you write something, ask yourself which row it belongs to.

### 2. File-based routing

Astro has no route table. **The path of a file inside `src/pages/` is its URL:**

| File | Built to | Served at |
|---|---|---|
| `src/pages/index.astro` | `dist/index.html` | `/` |
| `src/pages/dev.astro` | `dist/dev/index.html` | `/dev/` |
| `src/pages/gamedev.astro` | `dist/gamedev/index.html` | `/gamedev/` |
| `src/pages/art.astro` | `dist/art/index.html` | `/art/` |

Notice the **folder per page** (`dev/index.html`). It's Astro's default `build.format: 'directory'`. With it, the URL works with and without the trailing slash: GitHub Pages redirects `/dev` to `/dev/`.

Two consequences:
- **Every file in `src/pages/` is public.** If you save `src/pages/test.astro` to try something, the next deploy publishes `holmanalv.github.io/test/`. Files or folders whose name starts with `_` are excluded from routing, but they also can't be viewed in the dev server.
- **Routes come from folders, not from config.** You'll see it in Step 1: removing the `i18n` block doesn't remove `/en/` and `/es/`.

### 3. A URL is a contract

Recruiters will receive `holmanalv.github.io/dev/` directly. If you later rename `dev.astro` to `developer.astro`, every link you already sent breaks. **Decide the names now.** The final ones are `dev`, `gamedev` and `art`.

---

## Step 1: `astro.config.mjs`

### What
Remove the i18n configuration, set the site URL and drop `base`.

### Why
- **The file itself:**
  - `astro.config.mjs` is **build configuration**. It runs in Node and never reaches the browser.
  - `// @ts-check` on line 1 makes your editor validate the file with TypeScript, even though it's JavaScript.
  - `defineConfig()` does nothing at runtime: it returns the object you pass it. It exists so the editor knows which options are valid and can autocomplete them.
- **`site`** is the absolute URL of your site. Astro uses it to build:
  - the canonical URL of each page, which tells search engines the official address
  - absolute URLs for Open Graph tags, the cards LinkedIn and WhatsApp show when someone pastes your link
  - a sitemap, if you add one in Phase 11

  Your Layout already emits the canonical tag, but only when `site` exists.
- **`base`** is only needed when the site lives in a sub-folder (`holmanalv.github.io/Holman-Portfolio/`). Your repo will be named `HolmanAlv.github.io`, so GitHub serves it from the root and `base` would only get in the way.
- **The `i18n` block** declared two languages and the `/en/...` URL shape. With one language it has nothing to do.

### Do it
1. Open `astro.config.mjs`.
2. **Line 6:** uncomment `site`. Its value `'https://holmanalv.github.io'` is already correct.
3. **Line 7:** delete the `base` line entirely.
4. **Lines 9–15:** delete the whole `i18n` block, from `i18n:{` down to its closing `},`.
5. The object passed to `defineConfig` should now contain only `site`.

### Check
- Run `npm run build`: it passes.
- It still builds **9 pages**, including `/en/...` and `/es/...`. That's the proof that routes come from the folders, not the config.

---

## Step 2: Flat routes

### What
Replace `pages/en/` and `pages/es/` with four files directly in `src/pages/`.

### Why
With one language there's nothing to prefix. Flat routes give short URLs (`/dev/`) and one file per page.

The current `src/pages/index.astro` is a `<meta http-equiv="refresh">` redirect. It existed only to send `/` to `/en/`. Now `/` is the Home page itself.

### Do it
1. Delete both language folders:
   ```sh
   rm -r src/pages/en src/pages/es
   ```
   Nothing is lost: git keeps the history.
2. Open `src/pages/index.astro` and delete everything in it: the frontmatter with the TODO comment and the meta refresh tag.
3. Write a single `<h1>` with the text `Home` in `index.astro`. You don't need a frontmatter fence: a `.astro` file can be plain HTML.
4. Create three new files in `src/pages/`: `dev.astro`, `gamedev.astro` and `art.astro`. Give each a single `<h1>` with its name.

### Check
1. Start the dev server with `npm run dev` and open `http://localhost:4321/`.
2. Visit `/`, `/dev`, `/gamedev` and `/art`. Each shows its heading.
3. Visit `/en/`: it's a 404 now. That's correct.
4. Right-click → *View page source* on any page. The output has no `<html>` or `<head>`, nothing beyond what you wrote and what the dev server adds for itself. **Astro doesn't wrap your page in a document for you.** That's the Layout's job, and you build it in Phase 1.

---

## Step 3: Remove i18n from the Layout and delete `src/i18n/`

### What
Strip every i18n reference from `src/layouts/Layout.astro`, then delete the `src/i18n/` folder.

### Why
The Layout imports from `src/i18n/`. If you delete the folder first, the Layout references files that no longer exist. Clean the consumer first, then delete what it consumed. The same order applies to any refactor: **remove the usages, then the definition.**

### Do it
In `src/layouts/Layout.astro`:
1. **Frontmatter imports:**
   - Delete the import of `languages` and `type Lang` from `../i18n/ui`.
   - Delete the import of `useTranslations` and `stripLang` from `../i18n/utils`.
   - **Leave the `Header` and `Footer` imports and the `global.css` import alone.** The Header/Footer imports are wrong (they use braces); you fix them in Phase 1. The editor may underline them, which is expected for now.
2. **`interface Props`:** delete the `lang: Lang;` line. `title` and `description` stay.
3. **The `Astro.props` destructuring:** remove `lang` so only `title` and `description` remain.
4. **Derived values:** delete the `const t = ...` line and the `const rest = ...` line. **Keep `const canonical = ...`**: it doesn't depend on i18n.
5. **The `<html>` tag:** change `lang={lang}` to the fixed attribute `lang="en"`.
6. **Comments and the `<head>`:**
   - Delete the TODO comment about removing `en|es` from the URL.
   - Delete both hreflang blocks: the one that loops over `languages` and the `x-default` one.
   - Keep the canonical link and the four Open Graph meta tags.
   - The "Hasta aqui se termina la revision" comment can go too.
7. Save. Then delete the folder:
   ```sh
   rm -r src/i18n
   ```

### Check
- Search for leftovers:
  ```sh
  grep -rnE "i18n|useTranslations|stripLang|hreflang|Lang\b" src
  ```
  It should print nothing. If it finds a line, remove that line.
- Run `npm run build`: it passes. The Layout still isn't used by any page, so it doesn't get compiled yet.

---

## Step 4: README

### What
Replace the Astro starter README with one that describes your project.

### Why
Your repository is public and it's part of the portfolio. A developer recruiter who opens your GitHub sees the README before any code, and today it says "Astro Starter Kit: Basics". It's also where you'll look for the commands six months from now.

### Do it
Rewrite `README.md` with these sections, briefly:
1. **Title and one line:** what this is (your portfolio) and the live URL `https://holmanalv.github.io`.
2. **Stack:** Astro (static output), Three.js, GSAP, deployed on GitHub Pages.
3. **Commands:** a small table with `npm ci`, `npm run dev`, `npm run build` and `npm run preview`, and what each one does.
4. **Where things live:** one line each for `src/pages/`, `src/components/`, `src/content/`, `src/data/`, `src/assets/` and `public/`. It's fine that some of these don't exist yet.
5. **Docs:** a link to `docs/PLAN.md` and `docs/phases/`.

Keep it under ~40 lines. It's a map, not documentation.

### Check
Open the preview with `Ctrl+Shift+V` in VS Code. It reads well and has no starter text left.

---

## Common pitfalls

- **Ghost errors in the editor after deleting files.** The generated types in `.astro/` may still mention old files. Running `npm run dev` or `npm run build` regenerates them. If the editor keeps complaining, run *TypeScript: Restart TS Server* from the command palette.
- **A stale page in `dist/`.** Astro cleans the output folder on every build. If you see old pages, you're probably looking at an old `dist/` from before the last build.
- **Deleting `src/i18n/` before cleaning the Layout.** Nothing breaks yet, because the Layout isn't used, but it would the moment a page imports the Layout.

---

## Done when

- [x] `astro.config.mjs` contains only `site: 'https://holmanalv.github.io'`.
- [x] `src/pages/` contains exactly `index.astro`, `dev.astro`, `gamedev.astro` and `art.astro`.
- [x] `src/i18n/` no longer exists, and the grep in Step 3 prints nothing.
- [x] `npm run build` passes, and `find dist -name "*.html" | sort` lists exactly 4 files.
- [x] The README describes the project.
- [x] Phase 0 is checked off in `docs/PLAN.md`.

---

## References

- [Configuration reference: `site`](https://docs.astro.build/en/reference/configuration-reference/#site) and [`base`](https://docs.astro.build/en/reference/configuration-reference/#base)
- [Routing](https://docs.astro.build/en/guides/routing/) (file-based routing, excluding pages with `_`)
- [Project structure](https://docs.astro.build/en/basics/project-structure/)
- [`build.format`](https://docs.astro.build/en/reference/configuration-reference/#buildformat)

## Concepts recap

| Concept | One line |
|---|---|
| Build time and browser | Config and frontmatter run on your machine. Only `<script>` runs for the visitor. |
| `defineConfig` / `@ts-check` | Editor help for free. Neither does anything at runtime. |
| `site` | The absolute URL that canonical links, OG tags and the sitemap are built from. |
| `base` | Only for sites in a sub-folder. A user-site repo doesn't need it. |
| File-based routing | The file path in `src/pages/` is the URL, and every file there is public. |
| URL as a contract | Pick route names once, because links you send must keep working. |
| Usages before definitions | Remove what uses a module before deleting the module. |
