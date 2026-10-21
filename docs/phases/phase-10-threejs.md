# Phase 10: Three.js hero (Home)

> **As built (2026-10-18):** the concept is a lo-fi dithered cube in two grays. You drag it to turn it, it keeps some inertia, and it spins slowly when idle.
> - The renderer always draws 160×160 px (`setPixelRatio(1)`), and CSS scales the canvas up with `image-rendering: pixelated`. The pixel count never changes, so there's no `ResizeObserver` and no pixel-ratio cap.
> - A 4×4 Bayer dither in a `ShaderMaterial` turns the lighting into paper and ink.
> - The low-end check is Save-Data (`navigator.connection.saveData`). At 160×160 even weak GPUs cope, so the download is what's worth skipping.
> - The interaction is a drag on the canvas, not `pointermove` on the section. `touch-action: pan-y` keeps vertical swipes scrolling the page.

**Goal:** a WebGL scene **fades in over the Home poster**:
- it loads after idle, and stays under 150 KB gzip
- it never becomes the LCP
- it skips itself on devices or preferences that shouldn't run it
- it stops rendering when nobody can see it

**You will learn:**
- what WebGL costs
- Astro islands for real: when a framework component plus `client:idle` is worth it, and when a plain script is enough
- feature detection before downloading
- device pixel ratio
- render-loop management
- resizing with `ResizeObserver`
- 3D asset compression
- measuring a bundle

**Before you start:**
- Phase 9 is done (you've already practiced the idle + dynamic-import pattern)
- **the hero concept is defined** (Step 1)

**Files you will touch:**
- `src/components/Hero3D.astro`
- `src/scripts/hero3d.ts` (new)
- `package.json` (adds `three` and `@types/three`)
- possibly `src/assets/models/`

---

## Concepts

### 1. What WebGL costs

A Three.js scene costs four separate things:
- **download and parse:** Three.js's renderer is large, and most of it can't be tree-shaken away
- **GPU context creation**
- **shader compilation:** this can freeze the main thread for a noticeable moment on the first frame
- **per-frame work:** rendering, possibly 60 times a second, forever

On your desktop with a GTX 1050 Ti none of that is noticeable. On a mid-range phone, all of it is. **Design for the phone and enjoy the desktop.**

### 2. Islands for real: option (a) or option (b)

This is where Astro's islands concept fully applies.

**(a) Plain script + dynamic import (recommended).**
- The same pattern as Phase 9: `Hero3D.astro` has a tiny loader `<script>` that checks the conditions, waits for idle and imports `src/scripts/hero3d.ts`, which imports Three.js.
- **No framework runtime** is shipped.
- You write vanilla Three.js, which is what nearly all Three.js documentation and examples use.

**(b) Framework component + `client:idle`.**
- Add a UI framework integration (Preact is the lightest: `npx astro add preact`).
- Write the hero as a `.tsx` component and use it with `<Hero3D client:idle />`. Astro then delays hydration until idle by itself.
- What it costs:
  - the framework runtime plus Astro's hydration code, a few KB
  - a second way of writing components in your project
  - you still need a **dynamic import of Three.js inside the component**, so the early exits (concept 3) can skip the download

**When (b) is worth it:** if the scene needed rich UI state (menus, sliders, many controls), or if you wanted React Three Fiber's declarative style. For a hero background, (a) does the same job with less.

**Directive choice, if you go with (b):**
- `client:load` hydrates immediately and competes with the first render
- `client:visible` fires at once because the hero is already in view
- **`client:idle`** is correct

### 3. Feature detection before downloading

Run these checks in the **tiny loader**, before any Three.js code is requested. If any of them says "no", stop and keep the poster:
1. **Reduced motion:** `matchMedia('(prefers-reduced-motion: reduce)')`.
2. **Data saver:** `navigator.connection?.saveData`, which is true when the visitor asked the browser to save data. Chromium only; elsewhere it's undefined, which means "go ahead".
3. **WebGL 2 support:** create a throwaway `<canvas>` and ask it for a `'webgl2'` context. If you get `null`, there's no WebGL 2. Three.js ships a helper for this (`WebGL.isWebGL2Available()` in its addons), but importing it would download Three.js before you decided. The one-line canvas check avoids that.
4. **Optional low-end heuristic:** `navigator.deviceMemory` (Chromium only, in GB). Skip below 4, for example. Heuristics are imprecise; keep it to one rule, or none.

### 4. Device pixel ratio

On a high-DPI phone (DPR 3), a full-resolution canvas means **9×** the pixels of DPR 1, and every pixel runs your shaders. Cap the renderer's pixel ratio: `setPixelRatio(Math.min(devicePixelRatio, 2))` is the common choice, and use 1.5 if the scene is heavy. The difference is rarely visible behind text, and the GPU savings are large.

### 5. The render loop

`renderer.setAnimationLoop(fn)` calls `fn` every frame through `requestAnimationFrame`, which **browsers pause in hidden tabs automatically**. **Passing `null` stops the loop**, so with an `IntersectionObserver` you set the loop when the hero is visible and `null` when it isn't. If the scene doesn't move on its own (it only reacts to the pointer), render **on demand** instead of every frame.

### 6. Resizing

Size the renderer and camera to the **hero container**, not to the window. A **`ResizeObserver`** on the container reports its size whenever it changes, including on window resize or when the layout changes. On each report:
- update the renderer size
- update the camera's aspect ratio
- call `updateProjectionMatrix()`

### 7. No cleanup needed (in this site)

Each page here is a full document. Navigating away unloads everything, GPU resources included. You'd need `dispose()` calls if the scene were torn down while the page stays open (for example with view transitions), and this site has none. Don't write cleanup code for a case that doesn't exist.

### 8. 3D assets

If the concept uses a model:
- **Format:** glTF binary (`.glb`).
- **Compression:** use the **glTF-Transform** CLI's optimize command with **Meshopt** or **Draco** compression, and resize the textures. A 10 MB export often becomes a few hundred KB.
- **Loading:** `GLTFLoader` plus the matching decoder (`MeshoptDecoder` or `DRACOLoader`), both imported only inside `hero3d.ts`.
- **Where the file lives:**
  - `src/assets/models/`, imported with the **`?url`** suffix: you get a hashed URL that can be cached forever. **Recommended.**
  - or `public/models/`, which keeps a fixed URL but has no hash

**No model at all** is a valid choice: procedural geometry plus a custom shader is often lighter and more distinctive.

---

## Step 1: Define the concept

### What
One sentence describing the scene and what it says about you.

### Guidelines
- It should connect your three profiles (code, games, film) or at least not contradict any of them. A generic rotating cube or particle field says nothing.
- **Small in scope:** one object or one effect done well beats a busy scene.
- It sits **behind text**, so it must stay readable: low contrast, slow motion, not too busy.
- Decide whether it **reacts to the pointer**. It's nice on desktop; on touch devices it needs a fallback motion.
- Decide **model or procedural** (concept 8).

### Check
You can sketch it and say it in one sentence. Write the sentence into `docs/PLAN.md`, Open items #1.

---

## Step 2: Choose (a) or (b)

Read concept 2 again and decide. The rest of this guide describes **(a)**. If you choose (b), ask me and we'll adapt Steps 4–5. The early exits, DPR cap, loop management and verification stay the same.

---

## Step 3: Install

```sh
npm install three
npm install -D @types/three
```

Three.js doesn't ship its own TypeScript types. They come from `@types/three`, which is a dev dependency only.

---

## Step 4: Prepare `Hero3D.astro`

### Do it
1. Inside the hero section from Phase 8, add an **empty container** for the canvas, positioned like the poster (absolute, `inset: 0`), **between the poster and the text layer** in stacking order.
2. **The container's CSS:**
   - `opacity: 0` with a transition (respect reduced motion)
   - when a "ready" class is added, `opacity: 1`
   - this is how the canvas fades in over the poster without a flash
3. If the canvas shouldn't capture clicks or text selection, set `pointer-events: none` on it, and listen for pointer movement on the **section** instead.
4. Add a `data-` attribute to the container so the loader can find it.

### Check
The page looks exactly as before, because the container is empty and transparent.

---

## Step 5: The loader script (in `Hero3D.astro`)

### Do it
1. Find the container.
2. Run the four checks from concept 3, in order. If any says no, **return**: the poster stays.
3. Wait for idle (the same helper idea as Phase 9: `requestIdleCallback` with a timeout, or `setTimeout` as fallback).
4. **On idle:** dynamically import `../scripts/hero3d` and call its init function with the container.
5. **No static import of `three` anywhere in this script.**

---

## Step 6: The scene module, `src/scripts/hero3d.ts`

### Do it
1. **Imports:** **named imports** from `three` (`WebGLRenderer`, `Scene`, `PerspectiveCamera`…), never `import * as THREE`. Tree-shaking can't remove much of Three.js's renderer, but named imports let it drop what you truly don't use, and they make dependencies explicit.
2. **Export** an init function that receives the container. It:
   1. Creates the **renderer**:
      - decide on `antialias` (it costs GPU; with a DPR above 1 you often don't need it)
      - `alpha: true` if the poster should show through
   2. **Caps the pixel ratio** (concept 4) and appends the canvas to the container.
   3. Creates the **scene** and **camera**, and builds your concept: geometry, material/shader, lights.
   4. Sets up the **`ResizeObserver`** on the container (concept 6) and calls it once for the initial size.
   5. Sets up the **render loop** with `setAnimationLoop`.
   6. **After the first frame renders**, adds the "ready" class to the container so the canvas fades in.
   7. Sets up an **`IntersectionObserver`** on the hero: `setAnimationLoop(null)` when it's out of view, and restores the loop when it's back (concept 5).
   8. **Pointer interaction**, if any:
      - listen for `pointermove` on the hero section
      - store the normalized position in a variable
      - **read it inside the render loop**, rather than rendering from the event handler: events can fire far more often than frames
3. **Inside the loop:**
   - never create new objects (vectors, geometries) every frame; create them once and reuse them, or the garbage collector will cause stutters
   - use the delta time between frames for motion, so the speed is the same at 60 Hz and at your 100 Hz monitor

### Check
`npm run dev`: shortly after load, the scene fades in over the poster.

---

## Step 7: Models (only if your concept uses one)

### Do it
1. Export a `.glb` from Blender with only what the scene needs: apply modifiers, drop unused materials and keep the textures small.
2. Optimize it with the glTF-Transform CLI (see References): Meshopt or Draco compression and texture resizing. Compare the sizes before and after.
3. Put the result in `src/assets/models/`. Import it in `hero3d.ts` with the `?url` suffix to get a hashed URL.
4. Load it with `GLTFLoader` and the matching decoder, imported in `hero3d.ts` only.

### Check
The model's network request appears **only after** the idle trigger, and it's small (record the size).

---

## Step 8: Verify

Against `npm run build && npm run preview`:
1. **LCP is still the poster.** Lighthouse → "Largest Contentful Paint element" shows the poster image (or the `h1`), never the canvas.
2. **Loads late, and only on Home:** Network → JS shows the Three.js chunk after idle on `/`, and no Three.js request on the other three pages.
3. **Budget:** the gzip size of the hero chunk is under 150 KB. Use the same command as Phase 9:
   ```sh
   for f in dist/_astro/*.js; do echo "$(gzip -c "$f" | wc -c) $f"; done | sort -n
   ```
   Write the number in `docs/PLAN.md`.
4. **Early exits:**
   - **Reduced motion:** emulate it (DevTools → Rendering) and reload. No Three.js request, and the poster stays.
   - **No WebGL:** launch Chrome with WebGL disabled, or temporarily force the check to fail in code. The poster stays.
5. **Loop management:** DevTools → Performance → record:
   - scroll the hero out of view: the frames stop
   - switch tabs: the frames stop
   - come back: they resume
6. **Weak devices:**
   - DevTools → Performance → **CPU 4× slowdown** → reload: the page is still responsive and the text is readable immediately
   - **CPU throttling doesn't slow your GPU**, so if you can, open the live site on a real mid-range phone; that's the true test
7. **Frame rate:** DevTools → Rendering → **Frame rendering stats**. The scene holds a steady frame rate on your machine.
8. **Lighthouse (Mobile) on Home:** compare with the baseline from Phase 8. Performance should stay in the 90s. If it dropped, find out which metric moved and why.
9. Publish (merge `develop` into `master` and push), and verify live.

---

## Common pitfalls

- **The canvas as the LCP:** the poster must render first and stay underneath.
- **A static `import` of `three`** in the loader script: Three.js downloads on load and the early exits are useless.
- **An uncapped pixel ratio** on high-DPI screens.
- **A loop that never stops:** a GPU running for nothing, and battery drain on laptops and phones.
- **Allocating objects inside the loop:** garbage-collection stutters.
- **Sizing from `window` instead of the container.**
- **Text unreadable over the moving scene:** keep the overlay and contrast from Phase 8.
- **Testing only on your desktop GPU.**

---

## Done when

- [ ] The scene fades in over the poster after idle, on Home only.
- [ ] The poster is the LCP, and it stays visible if the scene doesn't run.
- [ ] Reduced motion, Save-Data and no WebGL 2 all skip the download.
- [ ] The pixel ratio is capped, sizing follows the container, and the loop stops off-screen.
- [ ] The hero chunk is under 150 KB gzip, with the number written in the plan.
- [ ] Lighthouse on Home is still in the 90s.
- [ ] Phase 10 is checked off in `docs/PLAN.md`.

---

## References

- [Three.js manual](https://threejs.org/manual/), especially "Responsive Design" and "Rendering on Demand"
- [Three.js docs: `WebGLRenderer`](https://threejs.org/docs/pages/WebGLRenderer.html) (`setAnimationLoop`, `setPixelRatio`)
- [Three.js docs: `WebGL` capability helper](https://threejs.org/docs/pages/WebGL.html)
- [Astro: islands](https://docs.astro.build/en/concepts/islands/) and [framework components](https://docs.astro.build/en/guides/framework-components/)
- [Astro: Preact integration](https://docs.astro.build/en/guides/integrations-guide/preact/), if you choose (b)
- [Vite: importing an asset as URL (`?url`)](https://vite.dev/guide/assets#explicit-url-imports)
- [glTF-Transform CLI](https://gltf-transform.dev/cli)
- [MDN: `ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [MDN: `navigator.connection.saveData`](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/saveData)
- [Discover three.js: tips](https://discoverthreejs.com/tips-and-tricks/) (performance habits)

## Concepts recap

| Concept | One line |
|---|---|
| WebGL cost | Download, context, shader compile and per-frame work. Design for phones. |
| (a) or (b) | A plain script needs no runtime. A framework + `client:idle` uses Astro's islands, for a few KB. |
| Feature detection first | Decide before downloading: reduced motion, Save-Data, WebGL 2. |
| DPR cap | Pixels cost GPU, so cap them at 2 (or 1.5). |
| `setAnimationLoop(null)` | Stop rendering when nobody can see it. |
| `ResizeObserver` | Size to the container, not the window. |
| No allocation per frame | Reuse objects to avoid GC stutters. |
| glTF + Meshopt/Draco | Compressed models, often 10× smaller. |
| `?url` import | A hashed asset URL, cacheable forever. |
