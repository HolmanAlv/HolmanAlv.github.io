# Phase 11: Closing

**Goal:** the portfolio goes from "works" to "finished":
- a visual identity
- self-hosted fonts
- per-page social previews
- a custom 404
- an accessibility pass
- a final performance check against the budget
- a clean repo

**You will learn:**
- design tokens in practice
- font loading (FOUT, `font-display`, preload, fallback metrics)
- the Open Graph image
- Core Web Vitals (LCP, CLS, INP)
- lab vs field data
- a practical accessibility audit

**Before you start:** Phases 0–10 are done. The visual identity can actually start any time after Phase 3, because it only touches tokens; this phase is its final pass.

**Files you will touch:**
- `src/styles/global.css`
- `astro.config.mjs` (fonts, optional sitemap)
- `src/layouts/Layout.astro`
- `src/pages/404.astro` (new)
- `public/og/` (new)
- `README.md`
- `docs/PLAN.md`

---

## Concepts

### 1. Tokens pay off here

Every color, spacing value and font in your components comes from the custom properties in `global.css`. **Defining the visual identity means editing that one block**, without touching components. If you find a component with a hardcoded color, that's the moment to turn it into a token.

### 2. Font loading

A web font is a download. Until it arrives, the browser either:
- hides the text (**FOIT**, flash of invisible text), or
- shows a fallback font and swaps it later (**FOUT**, flash of unstyled text)

`font-display: swap` picks FOUT, so text is readable immediately.

The swap can **shift the layout** (CLS), because the fallback font has different metrics. The fix is a fallback font adjusted to match the web font's metrics.

**Astro's Fonts API** handles all of this from the config:
- it **self-hosts** the files on your domain, with no request to Google's servers at runtime
- it generates **metric-adjusted fallbacks**
- it gives you a **`<Font />` component** for the `<head>`, with optional **preload**

Preload only the font used above the fold, and only the weight you need there. Preloading everything slows everything else.

### 3. The Open Graph image

The `og:image` meta tag sets the picture in the link card on LinkedIn, WhatsApp or Slack. Recruiters receive **direct links to subpages**, so give **each page its own image**, saying who you are and which profile it is. The usual size is **1200×630 px**.

The URL must be **absolute**: build it from `Astro.site`, as you did for the canonical link. These images go in `public/og/`, because external crawlers need a stable URL.

### 4. Core Web Vitals

| Metric | Measures | Good |
|---|---|---|
| **LCP** (Largest Contentful Paint) | When the biggest visible element rendered | ≤ 2.5 s (your budget is tighter) |
| **CLS** (Cumulative Layout Shift) | How much the layout jumps | ≤ 0.1 |
| **INP** (Interaction to Next Paint) | How fast the page responds to clicks and keys | ≤ 200 ms |

### 5. Lab data vs field data

- **Lighthouse** is **lab** data: one simulated load on one emulated device. It's reproducible and good for comparing before and after.
- **Field** data (from Chrome's real users, shown in PageSpeed Insights) is what real visitors experience. A small portfolio usually doesn't have enough traffic for field data to appear. So rely on lab numbers, **and** test on a real phone.

---

## Step 1: Visual identity

### Do it
1. Decide your palette, type and character. Use the mockup as inspiration if you like, but it was always a placeholder.
2. **In `global.css`, replace the token values:**
   - colors for light **and** dark mode
   - the type scale, if needed
   - the font family variables
3. Check every pair of text and background colors for **contrast**:
   - 4.5:1 for body text
   - 3:1 for large text and UI elements like borders of inputs and focus rings
4. **Search for hardcoded values** that escaped the tokens:
   ```sh
   grep -rnE "#[0-9a-fA-F]{3,8}\b|rgb\(" src/components src/pages src/layouts
   ```
   Turn each hit into a token, unless it's truly one-off.

### Check
Toggle dark mode (DevTools → Rendering → `prefers-color-scheme`). Every page is readable in both modes, with no stray hardcoded color.

---

## Step 2: Fonts via the Fonts API

### Do it
1. In `astro.config.mjs`, add a `fonts` entry for each family:
   - a **provider**: `fontProviders.google()` if the font is on Google Fonts (Astro downloads it at build and serves it from your site), or `fontProviders.local()` with your own `.woff2` files in `src/assets/fonts/`
   - the `name`
   - a **`cssVariable`** (for example `--font-display`)
   - only the weights and styles you actually use
2. In the Layout's `<head>`, add `<Font />` (from `astro:assets`) for each family, with **`preload` only on the one font used above the fold**, restricted to its weight.
3. In `global.css`, point your font tokens (`--font-sans`, `--font-mono`…) at the new CSS variables, keeping the system stack as the final fallback.

### Check
- Network → Font: the fonts come from **your own domain**, not `fonts.gstatic.com`.
- Only the preloaded font loads before the first render.
- Reload with "Slow 4G": the text is visible immediately and barely moves when the font swaps.

---

## Step 3: Global reduced-motion rule

### Do it
In `global.css`, add a `@media (prefers-reduced-motion: reduce)` block that removes or shortens CSS transitions and animations site-wide, including smooth scrolling if you enabled it. The GSAP and Three.js scripts already handle themselves (Phases 9–10); this covers the CSS.

### Check
Emulate reduced motion: hover effects, the canvas fade and anchor scrolling are instant.

---

## Step 4: Per-page Open Graph images

### Do it
1. Design 4 images at 1200×630: Home, Developer, GameDev and Film. The text on them must be large; previews are shown small.
2. Export them as PNG or JPG, under ~300 KB each. Save them in `public/og/` with stable names (`home.png`, `dev.png`…).
3. **In the Layout:**
   1. add an optional `ogImage` prop (a path), defaulting to the Home image
   2. build its absolute URL from `Astro.site`
   3. emit these tags:
      - `og:image`
      - `og:image:width` and `og:image:height`
      - `og:image:alt`
      - `twitter:card` set to `summary_large_image`
4. Pass the matching `ogImage` from each page.
5. **Case studies** (Phase 7.5) pass their discipline's image: `/og/` + discipline + `.png`. The discipline values equal the route names, so the file names line up with no lookup.

### Check
1. After deploying, paste each URL into **LinkedIn's Post Inspector** (see References). The right card appears, and the tool also refreshes LinkedIn's cache.
2. Paste a link in a WhatsApp chat with yourself.

---

## Step 5: The 404 page

### Do it
1. Create `src/pages/404.astro` using the Layout, with a clear message and links to the 4 pages. It's a good spot for a little personality.
2. Astro builds it to `dist/404.html`. **GitHub Pages serves that file automatically** for any unknown path on your site.

### Check
After deploying, visit `https://holmanalv.github.io/nope`. You see your page, not GitHub's.

---

## Step 6: Sitemap (optional)

Every page is reachable through links (the header, and the rows that link to the case studies), so search engines find everything anyway and a sitemap adds little. If you want one, run `npx astro add sitemap`. It needs `site`, which you set in Phase 0, and builds `sitemap-index.xml` automatically.

---

## Step 7: Accessibility pass

### Do it, on each of the 4 pages and one case study
1. **The Astro dev toolbar:**
   - in `npm run dev`, open the toolbar at the bottom of the page and run the **Audit** app
   - it flags common accessibility and performance problems right on the page
   - fix what it finds
2. **Keyboard only** (put the mouse away):
   - Tab through everything
   - focus is always visible, and the order matches the visual order
   - video facades play with Enter
3. **Zoom to 200%** (`Ctrl` `+`): nothing overlaps or gets cut off, and no horizontal scrolling appears at normal widths.
4. **Images:** every meaningful image has a descriptive `alt`, and decorative ones have `alt=""`. Read your alts aloud: do they describe what the image *shows* and why it matters?
5. **Link text:** every link makes sense on its own. No "click here". "Download CV" is good; a bare "↗" isn't.
6. **Headings:** one `h1` per page, and no skipped levels.
7. **Contrast:** use DevTools → Elements → pick a text → the color picker shows the contrast ratio. Check the muted texts and the labels in particular.
8. **Screen reader spot check (optional but eye-opening):**
   - Linux: Orca (`orca`), Windows: NVDA
   - listen to the Home page and one subpage from the top

---

## Step 8: Final performance pass

### Do it
1. Run Lighthouse (**Mobile**, in an **Incognito** window so extensions don't interfere) on the **live** URL of all 4 pages.
2. Compare against the budget in `docs/PLAN.md`:

   | Page | JS | Target LCP |
   |---|---|---|
   | Developer | 0 KB | < 1.0 s |
   | GameDev | GSAP only, after idle | < 1.0 s |
   | Film | the facade (~1 KB) | < 1.5 s |
   | Home | Three.js, after idle, < 150 KB gzip | < 1.5 s |
   | Case study | 0 KB (Film: the facade) | < 1.0 s |

3. Fill in the **actual** numbers next to the budget in the plan.
4. Run **PageSpeed Insights** on the live Home URL, for an outside opinion and field data if any exists.
5. For anything over budget: find which metric moved and which resource caused it, and fix that one thing. Don't "optimize" what's already within budget.

---

## Step 9: Clean repo

### Do it
1. **Placeholders left anywhere:**
   ```sh
   grep -rnE 'href="#"|example\.com|TODO|Lorem' src public
   ```
   Every hit is either replaced or deliberately kept.
2. **The `mockups/` folder** isn't part of the build, since it's outside `src/` and `public/`. Decide whether to commit it as design history or keep it out of git with an entry in `.gitignore`.
3. **README:** update it with the final description, the live link, the stack, the commands and maybe a screenshot. It's what developer recruiters see on GitHub.
4. **`docs/PLAN.md`:** check off Phase 11, close the open items, and record the final measurements.

---

## Done when

- [ ] The visual identity lives in the tokens, with no stray hardcoded colors, and contrast passes in light and dark modes.
- [ ] Fonts are self-hosted through the Fonts API, with one preload at most.
- [ ] CSS motion respects reduced motion.
- [ ] Each page has its own OG image, verified in LinkedIn's Post Inspector.
- [ ] The custom 404 is live.
- [ ] The accessibility pass is done on all 4 pages: keyboard, zoom, alts, links, headings and contrast.
- [ ] Lighthouse on all 4 live pages is within budget, with the numbers written in the plan.
- [ ] No placeholders are left, and the README is final.
- [ ] 🎉 Phase 11 is checked off.

---

## References

- [Astro: fonts](https://docs.astro.build/en/guides/fonts/) and the [`<Font />` component](https://docs.astro.build/en/reference/modules/astro-assets/#font-)
- [Astro: custom 404 page](https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page)
- [Astro: sitemap integration](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [Astro: dev toolbar](https://docs.astro.build/en/guides/dev-toolbar/)
- [web.dev: Core Web Vitals](https://web.dev/articles/vitals)
- [web.dev: font best practices](https://web.dev/articles/font-best-practices)
- [The Open Graph protocol](https://ogp.me/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [WebAIM: contrast checker](https://webaim.org/resources/contrastchecker/)
- [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/)

## Concepts recap

| Concept | One line |
|---|---|
| Tokens | The visual identity is one block of custom properties. |
| FOIT / FOUT / swap | Show fallback text immediately and swap when the font arrives. |
| Metric-adjusted fallback | The swap doesn't move the layout. |
| Fonts API | Self-hosting, fallbacks and preload from the config. |
| `og:image` | The link-preview picture, absolute URL, 1200×630. |
| LCP / CLS / INP | Speed of the main content, layout stability, responsiveness. |
| Lab vs field | Lighthouse is reproducible, real devices are the truth. |
| 404 on Pages | `dist/404.html` is served automatically. |
