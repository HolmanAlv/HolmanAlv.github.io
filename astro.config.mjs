// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

// Google splits Noto Sans JP into ~120 files, mostly Japanese, and `subsets`
// can't drop them. Asking for an exact glyph list returns one small file. A
// character missing from the list still renders, just in a fallback font.
/** @param {number} from @param {number} to */
const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i));
// Latin-1 (accents included) plus the punctuation the copy uses.
const latinGlyphs = [...range(0x20, 0x7e), ...range(0xa0, 0xff), ...'–—‘’“”•…←→↗'];

export default defineConfig({
    site: 'https://holmanalv.github.io',
    fonts: [
        {
            provider: fontProviders.google(),
            name: 'Noto Sans JP',
            cssVariable: '--font-noto',
            weights: ['300 700'],
            styles: ['normal'],
            options: { experimental: { glyphs: latinGlyphs } },
        },
    ],
    vite: {
        // Three.js and GSAP are only reached through dynamic import(), so the dev
        // server can't find them at startup. Found later, they get re-bundled
        // under a new hash, and the import still in flight fails with
        // "504 Outdated Optimize Dep", so neither hero animates. Listing them
        // pre-bundles them at startup.
        optimizeDeps: { include: ['three', 'gsap'] },
    },
});
