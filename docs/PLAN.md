# Plan de trabajo — Portafolio Holman

Stack: Astro 7 (estático, 0 JS por defecto) + Three.js como isla única en el home.
Estado inicial: Astro starter limpio. `Header/Footer/developer/gamedev/filmmaker/global.css` existen vacíos.

---

## Decisiones tomadas

| Decisión | Elección | Consecuencia |
|---|---|---|
| Idiomas | **EN principal + ES desde v1** | Routing i18n de Astro. Todo texto sale de diccionarios; el contenido de proyectos se escribe 2 veces. |
| Detalle de proyecto | **Sin rutas de detalle** | Cero routing dinámico. La fila lleva descripción, stack, rol, resultado y links externos. |
| Deploy | **Sin definir** | Config agnóstica: sin `base`, sin adapter. `site` se rellena al decidir (1 línea, pero bloquea sitemap y hreflang). |
| Video | **Todo YouTube/Vimeo** | Cero video en `/public`. Obligatorio patrón *facade*: póster estático + iframe solo al hacer clic. |

### Por qué el facade de video no es opcional

Un `<iframe>` de YouTube descarga ~1 MB de JS y abre varias conexiones **antes de que nadie le dé play**. En Film ese iframe está en el hero: sería el elemento que define el LCP y arruinaría justo la página que debe verse premium. El facade renderiza una imagen optimizada con botón de play y monta el iframe real en el `click`. Coste: ~30 líneas de JS vanilla en un componente, sin dependencias, sirve para YouTube y Vimeo.

---

## Arquitectura de carpetas

```
src/
├── pages/
│   ├── en/{index,developer,gamedev,filmmaker}.astro   # idioma principal
│   └── es/{index,developer,gamedev,filmmaker}.astro   # mismo template, `lang` distinto
├── layouts/Layout.astro                     # <head>, lang, canonical, hreflang, OG
├── components/
│   ├── Header.astro  Footer.astro  Section.astro  ChipList.astro
│   ├── ProjectCard.astro   # grid, home
│   ├── ProjectRow.astro    # subpáginas, metadata opcional (film)
│   ├── VideoFacade.astro   # póster -> iframe on click
│   └── Hero3D.*            # isla Three.js, solo home
├── content/projects/{es,en}/*.md            # collection validada con zod
├── data/{profile,stack,experience,tools}.ts # datos estructurados, bilingües
├── i18n/{ui.ts,utils.ts}                    # diccionarios + useTranslations/otherLang/stripLang
└── styles/global.css                        # reset + tokens (escala 8px)
```

**Por qué los datos fuera de los `.astro`:** agregar un proyecto debe ser escribir un `.md`, no editar markup. La collection valida el schema en build: si a un proyecto le falta `role` o `discipline`, el build **falla** en vez de renderizar un hueco en producción.

**Por qué un solo esqueleto de 6 slots para las 3 subpáginas:** el visitante aprende la estructura una vez y navega las otras dos sin releer. En código: un set de componentes que cambian de datos, no tres páginas paralelas que divergen con cada cambio.

| Slot | Dev | GameDev | Film |
|---|---|---|---|
| 1 Hero | título + chips + CTA | título + chips + CTA | **reel** + título + disciplinas |
| 2 Work | filas | filas | filas + metadata de producción |
| 3 Capabilities | Stack por categoría | Pipeline y herramientas *(falta en el mockup)* | Tools |
| 4 Trayectoria | Experiencia formal | Roles y contribuciones *(falta)* | Cargos y créditos *(falta)* |
| 5 About corto | ✔ | ✔ | ✔ |
| 6 Contacto | ✔ | ✔ | ✔ |

Home pasa de "página con nav" a **hub**: Hero 3D → **tres puertas visibles** (Dev/GameDev/Film) → 3 proyectos destacados (uno por disciplina) → About + tags → status strip + contacto.

---

## Fase 0 — Limpieza y fundaciones ✅

> Tutorial detallado paso a paso: [`fase-0.md`](./fase-0.md)

**Objetivo:** repo sin restos del starter y con la config i18n correcta.

- [x] Borrar `src/components/Welcome.astro`, `src/assets/{astro,background}.svg`, reescribir `README.md`
- [x] `astro.config.mjs`: bloque `i18n` con `locales: ['es','en']`, `defaultLocale: 'en'`, `routing: { prefixDefaultLocale: true }`
- [x] `src/pages/index.astro` con `<meta http-equiv="refresh">` hacia `/en/`
      ⚠️ `redirectToDefaultLocale` **no aplica aquí**: es comportamiento de middleware y el middleware necesita SSR. En build estático la receta documentada es el meta refresh, y se sustituye por un 301 real al elegir hosting.
- [x] `global.css`: reset mínimo + custom properties (escala de espaciado 8px, escala tipográfica, colores neutros **placeholder**)
- [x] Dejar `site`/`base` comentados con una nota de qué rellenar al elegir hosting

**Verificación:** `npm run build` pasa. Existen `/es/` y `/en/`, y `/` redirige a `/en/`.

> Los tokens de color salen neutros a propósito. El blueprint de Stitch es un wireframe: su gris y su Inter/JetBrains son andamiaje, no identidad. Lo que sí se conserva es la **escala de 8px**, porque es estructura.

---

## Fase 1 — Shell: Layout + i18n + Header + Footer

> Tutorial detallado paso a paso: [`fase-1.md`](./fase-1.md)

**Objetivo:** las 8 rutas navegan y el switcher de idioma funciona.

- [ ] Corregir el bloque `prefers-color-scheme: dark` de `global.css` (accent invisible, 1.02:1) y añadir `color-scheme: light dark`
- [ ] `src/i18n/ui.ts` — `languages`, tipo `Lang`, y diccionarios `en`/`es` donde **el inglés define el contrato** y al español le falta una clave → error de tipo. Sin fallback silencioso.
- [ ] `src/i18n/utils.ts` — `useTranslations`, `otherLang`, `stripLang`
- [ ] `Layout.astro` — `<html lang>` dinámico, title/description por props, canonical + `hreflang` + OG **condicionados a `Astro.site`**, skip link
- [ ] `Header.astro` — nav con `aria-current="page"`; switcher que **conserva la ruta actual** (de `/en/gamedev` a `/es/gamedev`, no al home)
- [ ] `Footer.astro` — uno solo para las 4 páginas
- [ ] Los 8 route files en `pages/{es,en}/`, cada uno declarando `const lang: Lang = 'en' | 'es'`
- [ ] Opcional recomendado: `astro check` en el script de build, para que el contrato de traducciones falle en CI y no solo en el editor

**Verificación:** 9 HTML en `dist`; el switcher mantiene la página desde las 4 rutas; `Tab` revela el skip link; Network → JS vacío.

---

## Fase 2 — Primitivas

- [ ] `Section.astro` — título + `<slot/>`, define el ritmo vertical de todo el sitio
- [ ] `ChipList.astro` — chips y tags (se usa 5 veces entre stack, tech, tools y tags)

**Verificación:** ambas renderizan en una página de prueba y el build sigue en 0 KB de JS.

---

## Fase 3 — Capa de contenido

- [ ] `src/content.config.ts` — collection `projects` con loader `glob` y schema zod:
      `title, discipline ('dev'|'gamedev'|'film'), summary, description, tech[], role, result?, links{source?,demo?,external?}, cover, featured: boolean, order` + opcionales de film: `format, client, year, duration, mix, highlight`
- [ ] `src/data/{profile,stack,experience,tools}.ts` tipados, con campos ES/EN
- [ ] 2 proyectos reales en `.md` (uno dev, uno film) en **ambos idiomas**, para validar el schema contra contenido real y no contra un ejemplo inventado

**Verificación:** quitar un campo obligatorio a un `.md` y confirmar que `npm run build` falla con un error claro. Ese fallo es la funcionalidad.

---

## Fase 4 — Página Dev (implementación de referencia)

Se hace primero porque no tiene video ni 3D: es el esqueleto puro. Las otras dos reutilizan sus componentes.

- [ ] `ProjectRow.astro`, `CapabilityGrid.astro` (6 tarjetas), `TimelineList.astro`, `AboutBlock.astro`, `ContactBlock.astro`
- [ ] Ensamblar `/es/dev` y `/en/dev`

**Verificación:** DevTools → Network → filtro JS: **0 bytes**. Si aparece JS, algo se hidrató sin motivo.

---

## Fase 5 — GameDev y Film

- [ ] GameDev: reusa todo. Rellenar los dos slots que faltaban en el mockup (Pipeline/herramientas, Roles y contribuciones)
- [ ] `VideoFacade.astro`: `<Image>` de póster + botón play → inyecta el iframe en el `click`. Atributos `title` y foco en teclado (es un control real, no una imagen decorativa)
- [ ] Film: hero con el reel vía facade + `ProjectRow` con los campos de metadata de producción

**Verificación:** cargar `/es/film` sin hacer clic → ningún request a youtube.com/vimeo.com. Hacer clic → carga y reproduce.

---

## Fase 6 — Home (hub) sin 3D todavía

- [ ] `ProjectCard.astro` (grid) + sección de **tres puertas** + status strip
- [ ] Hero con **imagen póster estática** en el lugar del canvas

**Verificación:** sitio completo y navegable con cero islas. Este es el punto de "publicable": si mañana se cae el 3D, el portafolio ya funciona.

---

## Fase 7 — Isla Three.js

Requiere definir antes el concepto visual (ver pendientes).

- [ ] Componente isla montado con **`client:idle`**, no `client:load`
      *Por qué:* `client:load` compite con el render inicial y hunde el TBT. `client:visible` no ayuda en el hero porque ya está en viewport al cargar. `client:idle` espera a que el hilo principal esté libre.
- [ ] El póster de la Fase 6 **queda debajo** del canvas: así el LCP es una imagen, nunca depende de WebGL
- [ ] Salidas tempranas dentro de la isla: `prefers-reduced-motion`, sin soporte WebGL, y heurística de dispositivo bajo → se queda el póster
- [ ] Imports selectivos de Three.js (nada de `import * as THREE`), modelos con Draco/meshopt si los hay
- [ ] Pausar el `requestAnimationFrame` cuando el canvas sale de viewport o la pestaña se oculta

**Verificación:** medir el peso del bundle de la isla. Objetivo < 150 KB gzip. Con `prefers-reduced-motion` activo no debe cargar Three.js en absoluto.

---

## Fase 8 — Cierre

- [ ] Todas las imágenes por `astro:assets` (`<Image>`/`<Picture>`, AVIF+WebP, `width`/`height` siempre → sin CLS)
- [ ] Fuentes self-hosted woff2 + `font-display: swap` + preload de la del LCP
- [ ] `@astrojs/sitemap` con `i18n`, página 404, meta/OG por página
- [ ] Pase de accesibilidad: foco visible, contraste, nav por teclado, `alt` reales
- [ ] Lighthouse en las 4 páginas, elegir hosting, rellenar `site`, desplegar

---

## Presupuesto de rendimiento

| Página | JS enviado | LCP objetivo |
|---|---|---|
| Dev, GameDev | 0 KB | < 1.0 s |
| Film | solo el facade (~1 KB) | < 1.5 s |
| Home | isla 3D, `client:idle`, < 150 KB gzip | < 1.5 s (póster, no canvas) |

`public/` solo lleva fuentes, favicons e imágenes OG. Todo lo que deba optimizarse va en `src/assets/`: Astro lo hashea, lo convierte y lo sirve responsive. Lo que está en `public/` se copia tal cual, sin tocar.

---

## Pendientes de definir

1. **Concepto del Hero 3D** — bloquea la Fase 7, nada más. Debe decir algo sobre el perfil, no ser una demo genérica.
2. **Identidad visual** — los tokens salen neutros; cambiarlos después es editar `global.css`, no los componentes. Por eso el orden es estructura primero.
3. **Hosting** — bloquea `site`, sitemap y hreflang absolutos (Fase 8).
4. **Contenido real** — CV, proyectos, créditos, textos de about en ES **y** EN. Es el cuello de botella real del proyecto, no el código.
