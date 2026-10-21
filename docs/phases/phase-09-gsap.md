# Phase 9: GSAP demo (GameDev hero)

> **As built (2026-10-18):** the inline SVG from Phase 6 is both the still and the animated scene, so nothing is hidden or swapped, and Step 2's "ready" class doesn't exist. In `src/scripts/gamedev-demo.ts`, the runner stays in place while six layers scroll left at different speeds (each layer is two copies of a 1600-unit tile). It jumps at 1 s and 3 s of a 4 s loop. An `IntersectionObserver` pauses the timeline off-screen. Every silhouette is the same white; the layers stay readable through cuts in the sky's color (a dark copy of each ground layer shifted up, dark outlines on pines and clouds, an SVG `feMorphology` halo around the runner). Nothing fades with opacity, because a fade would turn the white gray.

**Goal:** the GameDev hero's static image comes alive with a GSAP animation, and three rules hold:
- GSAP loads **only on `/gamedev/`**
- it loads **after the page is idle**
- it **never loads** for visitors who prefer reduced motion

Every other page keeps its JS budget.

**You will learn:**
- the main thread and long tasks
- why `client:*` doesn't apply to plain scripts, and what replaces it
- dynamic `import()` and code splitting
- `requestIdleCallback`
- `prefers-reduced-motion`
- compositor-friendly animation (transform and opacity)
- pausing off-screen work with `IntersectionObserver`

**Before you start:** Phase 8 is done (v1 is live), and you've decided **what the demo shows** (Step 1).

**Files you will touch:**
- `src/components/GameDevDemo.astro`
- `src/scripts/gamedev-demo.ts` (new)
- `package.json` (adds `gsap`)

---

## Concepts

### 1. The main thread

The browser has **one main thread** that does almost everything:
- parsing HTML
- running JavaScript
- computing layout and painting
- responding to clicks and scrolls

When a script runs for a long time (a **long task**, over 50 ms), nothing else happens on that thread: a click waits, and scrolling stutters. Downloading, parsing and initializing a library during page load is exactly that kind of work. The goal isn't "no JavaScript" but **JavaScript that runs when the thread has nothing better to do.**

### 2. `client:*` vs plain scripts

Astro's `client:load`, `client:idle` and `client:visible` decide **when a UI-framework component hydrates** (React, Preact, Svelte…). Your demo isn't a framework component. It's an `.astro` component with a `<script>`, and **directives don't apply to scripts**: an Astro `<script>` is a module that runs when the page loads.

So you build the equivalent of `client:idle` yourself, with two web platform features:
- **`requestIdleCallback(fn)`** runs `fn` when the browser is idle. That's what `client:idle` uses internally. Safari doesn't support it (check MDN for the current status), so fall back to a short `setTimeout`.
- **Dynamic `import()`** loads a module **on demand** and returns a promise.

### 3. Dynamic `import()` means a separate chunk

When the bundler (Vite, inside Astro) sees `import('../scripts/gamedev-demo')` used as a *function*, it puts that module **and everything it imports (GSAP)** in a **separate file** that isn't downloaded until the call runs. This is **code splitting**.

It only works if **nothing imports GSAP statically** on the page. If the component's `<script>` had `import gsap from 'gsap'` at the top, GSAP would be in the main bundle and download immediately, and the whole idle trick would be undone.

### 4. Why idle and not visible

`client:visible` (or an `IntersectionObserver` trigger) waits until the element scrolls into view. **The demo is in the hero**, which is already visible on load, so a visibility trigger would fire immediately and defer nothing. Idle is the right trigger for above-the-fold extras.

### 5. Reduced motion

Some people get dizzy or nauseous from motion, and they turn on **"reduce motion"** in their OS. The browser exposes that as the `prefers-reduced-motion: reduce` media query, which JavaScript can read with `matchMedia`. For them:
- the static image *is* the demo
- GSAP should **not even download**: check the preference **before** the dynamic import

### 6. Animate transform and opacity

Changing `width`, `top`, `left` or `margin` forces the browser to **recompute layout** every frame. Changing `transform` (translate, scale, rotate) and `opacity` can be handled by the **compositor**, often on the GPU, without touching layout. Stick to those two and the animation stays smooth even while the main thread is busy. For SVG, GSAP also animates SVG attributes efficiently.

### 7. Pausing what nobody sees

- **Hidden tab:** GSAP runs on `requestAnimationFrame`, which browsers pause automatically in hidden tabs. Nothing to do.
- **Scrolled out of view:** the animation keeps running and burning CPU. An **`IntersectionObserver`** on the demo box tells you when it leaves and enters the viewport, so you can pause and resume the timeline.

---

## Step 1: Decide what the demo shows

### What
A short, looping animation that says something about **you as a game developer and technical artist**. It isn't decoration.

### Ideas that fit your profile (pick one, or bring your own)
- **An NPC state machine:** nodes (Idle → Patrol → Chase → Attack), with a highlight travelling between them as transitions fire. It speaks to your NPC and mechanics work.
- **A render-pipeline breakdown:** the same frame building up in passes (geometry → lighting → post-processing), with each layer sliding in. It speaks to rendering and optimization.
- **Draw-call batching:** many small boxes merging into a few batches, with a counter going down. It speaks to optimization in a way a recruiter can read at a glance.

Keep it **SVG or a few DOM elements**: no canvas, no 3D. That keeps it small, sharp at any size and easy to animate.

### Check
- You can describe the loop in one sentence.
- The static image from Phase 6 is (or can be replaced by) its first frame.

---

## Step 2: Build the scene's markup

### Do it
1. Inside `GameDevDemo.astro`, add the animatable scene **inside the same 16:9 box**, layered on top of the `<Picture>` (both absolutely positioned, filling the box). Use inline SVG, or a few positioned elements.
2. Give the elements GSAP will target **classes or `data-` attributes**, scoped to the component.
3. **Hide the scene by default**, and show it only when the box has a "ready" class. That way:
   - before GSAP runs, and for reduced-motion visitors, only the static image is visible
   - when the animation starts, you add the class and the scene appears over the image, ideally matching it pixel for pixel
4. Mark the scene `aria-hidden="true"`: the image's `alt` already describes the demo, so a screen reader shouldn't read the SVG shapes too.

### Check
The page looks exactly as it did in Phase 6, because the scene is hidden.

---

## Step 3: Install GSAP

```sh
npm install gsap
```

GSAP and all of its plugins are free to use, including commercially (since version 3.13).

---

## Step 4: The animation module, `src/scripts/gamedev-demo.ts`

### What
A module that **statically imports GSAP** and exports one function, for example `start(root)`, which builds the animation inside `root` and returns the timeline.

### Why a separate file
This module is **only ever reached through a dynamic import** (Step 5). That's what puts it, together with GSAP, in its own chunk (concept 3).

### Do it
1. At the top, import `gsap` from the `gsap` package.
2. Export `start(root: HTMLElement)`. It should:
   1. find the scene elements **inside `root`**, never across the whole document
   2. create a `gsap.timeline` with `repeat: -1` (loop forever) and a small `repeatDelay`
   3. add the animation steps, using **`x`/`y`/`scale`/`rotation`/`opacity`** (GSAP's shorthands for transforms) and SVG attributes if you need them
   4. add the "ready" class to `root`, so the scene becomes visible
   5. return the timeline
3. **Optional, more robust:** wrap the setup in **`gsap.matchMedia()`** with a `(prefers-reduced-motion: no-preference)` condition. If someone turns reduce-motion on *while* the page is open, GSAP reverts the animation automatically.

### Check
TypeScript is happy (`npm run check`).

---

## Step 5: The loader script in `GameDevDemo.astro`

### What
A **tiny** `<script>` that decides whether and when to load the module.

### Do it
1. Find the demo box. Use one `data-` attribute on the container so the script can locate it.
2. **Early exit:** if `matchMedia('(prefers-reduced-motion: reduce)')` matches, stop here. GSAP is never downloaded.
3. **Wait for idle:** use `requestIdleCallback` if it exists, with a `timeout` option so it fires within a couple of seconds even on a busy page. Otherwise fall back to `setTimeout`.
4. **Inside the idle callback:**
   1. dynamically import `../scripts/gamedev-demo` (the path is relative to the component file)
   2. call its `start` with the box
   3. keep the returned timeline
5. **Pause off-screen:** create an `IntersectionObserver` on the box. When it stops intersecting, pause the timeline; when it intersects again, play it.

**Never** import `gsap` or `gamedev-demo` with a static `import` at the top of this script (concept 3).

### Check
`npm run dev`: the animation starts shortly after load and loops.

---

## Step 6: Verify

Against `npm run build && npm run preview`:
1. **The chunk exists:**
   ```sh
   ls -la dist/_astro/*.js
   ```
   There's a JS file containing GSAP, and GSAP is **not** inlined in `gamedev/index.html`.
2. **It loads late:** on `/gamedev/`, open DevTools → Network → JS and reload. The GSAP chunk appears **after** the document and images. Its *Initiator* is the small loader script.
3. **It loads only here:** on `/`, `/dev/` and `/art/`, no GSAP chunk is requested.
4. **Reduced motion:**
   1. DevTools → command menu (`Ctrl+Shift+P`) → "Show Rendering" → set **Emulate CSS media feature prefers-reduced-motion** to `reduce`
   2. reload: no GSAP request, and the static image is shown
   3. switch the emulation back off
5. **No long tasks at load:** DevTools → Performance → record while reloading. Around page load there's no long task (red-flagged block) caused by GSAP. Its work happens later, in small slices.
6. **Pausing:** scroll the hero out of view. With the Performance panel recording, the animation frames stop while it's off-screen and resume when it's back.
7. **Size:** check the GSAP chunk's gzip size:
   ```sh
   for f in dist/_astro/*.js; do echo "$(gzip -c "$f" | wc -c) $f"; done | sort -n
   ```
   The core is around 30 KB gzip. Note the number in `docs/PLAN.md`.
8. **Lighthouse** on `/gamedev/`: performance is still in the 90s, and Total Blocking Time is close to 0.
9. Publish (merge `develop` into `master` and push), and verify live.

---

## Common pitfalls

- **A static `import gsap` in the component's script:** GSAP lands in the main bundle and loads immediately.
- **A visibility trigger for an above-the-fold element:** it fires at once and defers nothing.
- **Checking reduced motion after the import:** the download already happened.
- **Animating `left`/`top`/`width`:** layout work every frame, and jank.
- **Querying elements across the whole document** from the animation module: it breaks if the component ever appears twice, and couples the module to the page.
- **Showing the scene before GSAP is ready:** visitors briefly see an unanimated jumble.

---

## Done when

- [ ] The demo animates on `/gamedev/` and loops.
- [ ] GSAP is a separate chunk, loaded after idle, and only on `/gamedev/`.
- [ ] With reduced motion, GSAP isn't requested and the static image shows.
- [ ] The animation pauses off-screen.
- [ ] Only transform, opacity and SVG attributes are animated.
- [ ] The chunk size is noted in the plan, and Lighthouse is still green.
- [ ] Phase 9 is checked off in `docs/PLAN.md`.

---

## References

- [GSAP docs](https://gsap.com/docs/v3/): [timelines](https://gsap.com/docs/v3/GSAP/Timeline/), [`gsap.matchMedia()`](https://gsap.com/docs/v3/GSAP/gsap.matchMedia())
- [Astro: scripts](https://docs.astro.build/en/guides/client-side-scripts/), [client directives](https://docs.astro.build/en/reference/directives-reference/#client-directives)
- [MDN: dynamic `import()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import)
- [MDN: `requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
- [MDN: `prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN: `IntersectionObserver`](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [web.dev: animations and performance](https://web.dev/articles/animations-guide)
- [web.dev: long tasks](https://web.dev/articles/optimize-long-tasks)

## Concepts recap

| Concept | One line |
|---|---|
| Main thread | One thread for JS, layout and input, so long tasks freeze the page. |
| `client:*` | Only for framework components. Plain scripts need their own trigger. |
| Dynamic `import()` | Loads code on demand and creates a separate chunk. |
| Idle, not visible | Above-the-fold extras wait for idle, because visibility fires immediately. |
| Reduced motion | Check it before downloading anything. |
| Transform + opacity | Compositor-friendly, so smooth animation with no layout work. |
| `IntersectionObserver` | Pause what nobody can see. |
