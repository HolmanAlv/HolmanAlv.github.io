# Phase 7: Film page

**Goal:** `/art/` is complete:
- a hero with the reel
- tools
- selected works, with their videos and production metadata
- a short About at the end

The YouTube videos load **only when clicked**. This is the first page that ships JavaScript, about 1 KB of it.

**You will learn:**
- how Astro processes `<script>` tags
- what a YouTube embed really costs
- the facade pattern
- progressive enhancement
- why `client:*` directives don't apply here
- privacy-enhanced embeds

**Before you start:** Phase 6 is done, and Film projects have a `youtubeId` and a `cover`.

**Files you will touch:**
- `src/components/YouTubeFacade.astro` (new)
- `src/pages/art.astro`
- `public/cv/art.pdf` (new)

---

## Concepts

### 1. What a YouTube embed costs

A normal `<iframe src="https://www.youtube.com/embed/…">` starts working **as soon as the page loads, whether or not anyone presses play**:
- it downloads YouTube's player (hundreds of KB of JavaScript, often over 1 MB in total)
- it opens connections to several Google domains
- it may set cookies

On a page with a reel plus several project videos, that's several players loading at once. Your Film page would become the slowest page of the site, and it's the one that should feel the most polished.

### 2. The facade pattern

Show something that **looks** like the player: the poster image plus a play button. Load the real iframe **only when the visitor clicks**. Until then the cost is one optimized image. After the click, the visitor gets the real player and expects it to load.

### 3. Progressive enhancement: start with a link

Build the facade as a **link** to the video on YouTube, wrapping the poster. Then let a script *enhance* it:
- **without JavaScript** (or if the script fails), clicking opens the video on YouTube; it still works
- **with JavaScript**, the script intercepts the click, cancels the navigation, and swaps the link for the embedded player

This is **progressive enhancement**: the basic version works everywhere, and the script only makes it better. It also gives you correct keyboard behavior for free, because links are focusable and Enter activates them.

### 4. How Astro handles `<script>`

A plain `<script>` in an `.astro` component (with no attributes) is **processed**:
- **TypeScript** works inside it.
- **Imports are bundled**, so you can import npm packages or local files.
- It becomes **`type="module"`**, which is deferred and doesn't block HTML parsing.
- It's **deduplicated**: if `YouTubeFacade` appears five times on a page, its script is included **once**. So the script must find and set up *all* facades on the page (with `querySelectorAll`), not assume there's just one.
- **Small scripts are inlined** into the HTML, which saves a request.

`<script is:inline>` skips all of that. You don't need it here.

### 5. Why there's no `client:*` directive here

`client:load`, `client:idle` and `client:visible` only apply to **UI framework components** (React, Preact, Svelte…) that Astro hydrates. A facade is a few lines of plain JavaScript reacting to a click, so it needs no framework, no hydration and no directive. Phases 9 and 10 come back to this distinction.

### 6. `youtube-nocookie.com`

YouTube's **privacy-enhanced mode** serves the same player from `www.youtube-nocookie.com`. It's the embed domain to use.

### 7. The poster: your image, not YouTube's

Two options for the poster:
- **YouTube's thumbnail** (`i.ytimg.com/vi/<id>/…`): no work, but it's a request to Google on page load, not optimized by Astro, and its quality varies.
- **Your own image** (the project's `cover`): optimized by Astro, no third-party request until the click, and you choose the frame. **Use this.**

---

## Step 1: `YouTubeFacade.astro`

### What
A reusable component: the poster and a play icon, inside a link to YouTube that a script upgrades to an embedded player.

### Do it
1. **Props:**
   - `id` (the YouTube video id)
   - `title` (used for the accessible name and the iframe title)
   - `poster` (image metadata: a `cover` field, or an image imported from `src/assets`)
   - `priority` (optional boolean, true for the hero reel)
2. **Markup:**
   1. A container with **`aspect-ratio: 16 / 9`** and `position: relative`. The player will replace the poster inside this box, so nothing shifts (no CLS).
   2. Inside it, an `<a>`:
      - its `href` is the normal YouTube watch URL for the id
      - a `data-` attribute holds the id (for example `data-youtube-id`), so the script doesn't have to parse URLs
      - an `aria-label` of "Play video: " followed by the title
   3. Inside the link:
      - the poster as `<Image>`/`<Picture>` filling the box (`object-fit: cover`), eager and high priority **only when `priority` is true**, with `alt=""` because the link's `aria-label` already names it
      - a play icon as an inline `<svg>` marked `aria-hidden="true"` (it's decoration; the label already says "Play")
3. **The script** (a plain `<script>` in the component):
   1. Select **all** facade links on the page.
   2. Add a click listener to each one. When it fires:
      1. call `preventDefault()` so the browser doesn't follow the link
      2. create an `<iframe>`
      3. set its `src` to the `youtube-nocookie.com` embed URL for the id, with `autoplay=1` (the visitor already asked to play)
      4. set its `title` (iframes require an accessible title)
      5. set an `allow` attribute that includes `autoplay`, `encrypted-media` and `picture-in-picture`
      6. set `allowfullscreen`
      7. make it fill the box with 100% width and height
      8. replace the link with the iframe
   3. Optional: move keyboard focus to the iframe after the swap, so keyboard users land in the player.
4. **Styles:**
   - the link fills the box
   - the play icon is centered
   - a visible `:focus-visible` ring on the link
   - a hover state on the icon
5. **A known quirk:** some mobile browsers ignore `autoplay` inside a freshly created iframe, so the visitor has to tap play once more. It's acceptable, and it's the same with every facade library.

> **Simpler alternatives**, if you'd rather skip the script:
> - **Plain link:** keep only the link and poster. Zero JS, but the video plays on YouTube, outside your site.
> - **Package:** [`@astro-community/astro-embed-youtube`](https://astro-embed.netlify.app/components/youtube/) gives you a ready-made facade (based on `lite-youtube-embed`), at the cost of a dependency.

### Check
Use it once on the page with a real video id before building the rest. Then:
1. Reload with DevTools → Network open. **No request** goes to `youtube.com`, `youtube-nocookie.com`, `ytimg.com` or `googlevideo.com`.
2. Click: the player appears in the same box, with no layout jump, and plays.
3. Reload, press Tab until the facade is focused, and press Enter. It plays.
4. DevTools → command menu (`Ctrl+Shift+P`) → "Disable JavaScript" → reload → click. YouTube opens instead. Re-enable JavaScript afterwards.

---

## Step 2: The hero

### Do it
1. **Left column:** `<YouTubeFacade>` with your reel's id, a title like "Showreel", a poster image from `src/assets` and **`priority`**. It's the biggest thing above the fold, so it's the LCP.
2. **Right column:**
   - the `<h1>` ("Animator & Sound Designer")
   - the roles line: `Direction • Sound Design • Foley • 3D/2D Animation`
   - the **Download CV** button (`profile.cv.art`)
3. The same split-grid technique as GameDev's hero, with the media on the left.
4. **DOM order:** the mockup puts the video first visually. You can either:
   - keep the video first in the HTML too (the page *is* about the reel), or
   - put the text first in the HTML and move the video left with CSS

   Either way, check how it stacks on a phone.
5. Put `public/cv/art.pdf` in place.

### Check
The reel poster is the only eager, high-priority image on the page.

---

## Step 3: Tools

### Do it
Use `Section` ("Tools", label "SPECIFICATIONS") with `SkillGrid` fed the Film groups (Editing, Sound Design, Animation).

---

## Step 4: Selected works

### Do it
1. Get the `art` projects, sorted by `order`.
2. Use `Section` ("Selected Audiovisual Works", label "PRODUCTION LOG").
3. For each project, a `<ProjectRow>` whose **`media` slot is filled** with a `<YouTubeFacade>`:
   - `id` comes from `youtubeId`
   - `title` comes from the project title
   - `poster` comes from `cover`
   - **no** `priority`, because these are below the fold

   Filling the slot replaces the default cover image. That's the named slot from Phase 5 at work.
4. The `meta` record renders as the `<dl>` you built in Phase 5. Style it as the mockup's three-column metadata grid: the `<dl>` as a grid, with each `dt`/`dd` pair grouped.
5. The audio-layer, SFX and highlight buttons are **not** built, as decided.
6. **If a project has no `youtubeId`**, the slot can stay empty and the row falls back to the cover image automatically. Render the facade only when the id exists.

### Check
- Two or more facades on the page, one script in the HTML (check view-source or the Network panel).
- Each one plays its own video.

---

## Step 5: About

### Do it
Add the last section before the footer: `Section` ("About", label "PROFILE // FILM & SOUND") with the Film about text from `profile.ts`, in a paragraph constrained to `--measure`.

---

## Step 6: Verify

Against `npm run build && npm run preview`:
1. **JS budget:**
   - Network → JS shows only the facade script (possibly inlined into the HTML, so nothing to download)
   - check the size is about 1 KB, not tens of KB
2. **No third-party requests before a click** (Step 1's check, now with every video on the page).
3. **LCP** is the reel poster, and it's fast.
4. **No CLS** when a player replaces a poster.
5. Keyboard: every facade is reachable and plays with Enter.
6. JavaScript disabled: every facade opens YouTube.
7. Heading outline, 360px width and Lighthouse, as before.
8. Push, and verify live.

---

## Common pitfalls

- **Writing the script for one facade** (`querySelector` instead of `querySelectorAll`): only the first video works.
- **Using `<button>` with no `href` fallback:** without JS, nothing works.
- **An iframe without `title`:** accessibility failure.
- **A box without `aspect-ratio`:** the page jumps when the player appears.
- **The YouTube thumbnail as poster:** a third-party request on every page load.
- **`is:inline`** on the script: you lose TypeScript, bundling and deduplication.
- **`priority` on every facade:** only the hero reel.

---

## Done when

- [ ] `/art/` has: Hero (reel + roles + CV) → Tools → Works → About.
- [ ] Videos load only on click, using `youtube-nocookie.com`.
- [ ] Without JS, the facades link to YouTube.
- [ ] The page ships about 1 KB of JS. Developer and GameDev still ship 0.
- [ ] No layout shift on play, and keyboard operation works.
- [ ] Phase 7 is checked off in `docs/PLAN.md`.

---

## References

- [Astro: scripts and event handling](https://docs.astro.build/en/guides/client-side-scripts/)
- [Directives reference: `is:inline`](https://docs.astro.build/en/reference/directives-reference/#isinline)
- [Client directives (and why they're only for framework components)](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [YouTube: embedded player parameters](https://developers.google.com/youtube/player_parameters)
- [lite-youtube-embed](https://github.com/paulirish/lite-youtube-embed): the facade pattern's best-known implementation
- [web.dev: lazy-load third-party resources with facades](https://developer.chrome.com/docs/lighthouse/performance/third-party-facades)
- [MDN: progressive enhancement](https://developer.mozilla.org/en-US/docs/Glossary/Progressive_Enhancement)

## Concepts recap

| Concept | One line |
|---|---|
| Embed cost | A YouTube iframe downloads the whole player before anyone presses play. |
| Facade | A poster and a play button, with the real player loaded on click. |
| Progressive enhancement | The link works without JS, and the script upgrades it. |
| Astro `<script>` | TypeScript, bundled, module, deduplicated, inlined when small. |
| Deduplication | One script for every instance, so handle them all. |
| No `client:*` | Directives are for framework components; this is plain JS. |
| `youtube-nocookie.com` | Privacy-enhanced embed domain. |
| Own poster | Optimized, and no third-party request before the click. |
