<div align="center">

# Holman Alvarado · Portfolio

**Software Engineer · Game Developer · Technical Artist · Animator & Filmmaker**

[holmanalv.github.io](https://holmanalv.github.io)

![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-0AE448?logo=gsap&logoColor=black)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-222222?logo=githubpages&logoColor=white)

</div>

---
## Description
Portfolio created with Astro for its fast response time, thanks to its zero-JS approach. It includes Three.js components loaded on demand to show three-dimensional interactive spaces without sacrificing performance. Organized by role to keep things from getting messy.

## Pages

| Route | Focus |
| :-- | :-- |
| `/` | Home: interactive 3D hero, featured projects, about me and a timeline |
| `/dev` | Software engineering and web development |
| `/gamedev` | Game development and tech art |
| `/art` | Animation, VFX and filmmaking |
| `/projects/*` | Detailed information about a project |

## Principles

- **Zero JS by default.** JavaScript ships in only three places, each loaded lazily: the Three.js hero (Home), the GSAP demo (GameDev) and a click-to-load YouTube facade (Film).
- **Content as data.** Projects, stacks and experience live in content collections and typed data files, so the three subpages share the same components.

## Getting started

Requires Node.js 22.12 or later.

| Command | Action |
| :-- | :-- |
| `npm ci` | Install dependencies from the lockfile |
| `npm run dev` | Start the dev server at `localhost:4321` |
| `npm run build` | Build the static site to `dist/` |
| `npm run preview` | Serve the build locally |

## Project structure

```text
/
├── public/
│   ├── favicon.svg
│   └── cv/                    CVs folder
├── src/
│   ├── pages/                 File-based routing
│   │   ├── index.astro        → /
│   │   ├── dev.astro          → /dev
│   │   ├── gamedev.astro      → /gamedev
│   │   └── art.astro          → /art
│   ├── layouts/
│   │   └── Layout.astro       Document shell
│   ├── components/            Header, Footer and the shared building blocks
│   │   ├── Header.astro
│   │   └── Footer.astro
│   ├── content/posts/         One Markdown file per project
│   │   └── post_[*].md
│   └── styles/
│       └── global.css         Reset and design tokens
├── astro.config.mjs           Site URL and build settings
└── package.json
```
---

<div align="center">
<sub>Designed and built by Holman Alvarado with Astro & Astro Docs.</sub>
</div>
