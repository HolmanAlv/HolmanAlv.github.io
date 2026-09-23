# Fase 0 — Limpieza y fundaciones (tutorial guiado)

> **Qué vas a lograr:** un repo sin restos del starter, con routing bilingüe funcionando y un sistema de tokens CSS del que colgará todo el diseño después.
> **Qué NO vas a hacer todavía:** ningún componente, ningún color definitivo, nada de Three.js.
> **Tiempo estimado:** 40-60 min leyendo con calma.

Cada paso tiene tres partes: **qué**, **por qué** y **hazlo**. El "por qué" es lo que te vas a llevar; el "hazlo" es solo tipear.

---

## Paso 1 — Borrar los restos del starter

### Qué

```bash
rm src/components/Welcome.astro
rm src/assets/astro.svg src/assets/background.svg
```

Y vaciar `src/pages/index.astro` (lo reescribimos en el Paso 3).

### Por qué: el routing basado en archivos

Astro usa **file-based routing**. No hay tabla de rutas, no hay `router.get()`. La regla es literal:

```
src/pages/index.astro       →  /
src/pages/dev.astro         →  /dev
src/pages/es/gamedev.astro  →  /es/gamedev
```

Esto tiene una consecuencia que muerde a mucha gente: **cualquier archivo que dejes en `src/pages/` es una URL pública**. Si mañana pruebas algo y guardas `src/pages/test.astro`, acabas de publicar `tudominio.com/test` en el siguiente deploy. No es un borrador, es producción.

`Welcome.astro` está en `src/components/`, así que no genera ruta — pero sí trae 210 líneas de CSS y dos SVG que no vas a usar. Astro hace *tree-shaking* (elimina del bundle lo que nadie importa), así que borrarlo no cambia el peso final del sitio. Lo borras por otra razón: **ruido mental**. En tres semanas vas a abrir `src/components/` buscando tu ProjectCard y vas a leer un archivo que no es tuyo. El código muerto no cuesta bytes, cuesta atención.

> **Concepto — tree-shaking:** el bundler recorre el grafo de imports desde tus páginas y descarta todo lo que nadie alcanza. Por eso un archivo huérfano no infla el build. Pero *sí* infla el build si lo importas "por si acaso".

### Verifica

```bash
npm run build
```

Debe pasar. Si falla diciendo que no encuentra `Welcome`, es porque `index.astro` todavía lo importa — vacíalo.

---

## Paso 2 — `astro.config.mjs`: el routing bilingüe

### Qué

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Rellenar cuando elijas hosting. Bloquea sitemap y hreflang absolutos.
  // site: 'https://tudominio.com',

  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
```

### Por qué: qué es realmente este archivo

`astro.config.mjs` se ejecuta **en Node, en tu máquina, durante el build**. Nunca llega al navegador. Es la diferencia entre *configuración de construcción* y *código de aplicación*, y es una distinción que conviene tener clara desde el principio: aquí puedes leer variables de entorno, tocar el sistema de archivos, importar paquetes pesados. Nada de eso pesa un solo byte para tu visitante.

La extensión `.mjs` fuerza módulos ES (`import`/`export`) en vez de CommonJS (`require`). El `// @ts-check` de la primera línea le pide a TypeScript que valide el objeto de configuración aunque el archivo sea JavaScript: si escribes `defaulLocale`, tu editor te lo subraya. Es tipado gratis sin migrar a `.ts`.

`defineConfig()` no hace nada en tiempo de ejecución — devuelve el mismo objeto que le pasas. Existe únicamente para que el editor sepa qué forma tiene ese objeto y te autocomplete. Es un patrón muy común en herramientas modernas (Vite, Vitest, Tailwind hacen lo mismo).

### Por qué: `prefixDefaultLocale`

Esta es la decisión de forma de URL, y solo hay dos opciones:

| | `prefixDefaultLocale: true` | `prefixDefaultLocale: false` |
|---|---|---|
| Español | `/es/dev` | `/dev` |
| Inglés | `/en/dev` | `/en/dev` |
| Carpetas | `pages/es/` y `pages/en/` | `pages/` y `pages/en/` |
| Simetría | total | el idioma por defecto es un caso especial |

Elegimos `true`. La razón es mantenimiento, no estética: con `false`, el español vive en la raíz y el inglés en una subcarpeta, así que **cada cambio estructural hay que pensarlo dos veces** ("¿esta ruta lleva prefijo o no?"). Con `true` las dos ramas son idénticas y cualquier helper que escribas funciona igual para ambas.

El precio es que `/` deja de existir como página. Eso lo resolvemos en el Paso 3.

> **Nota de versión:** en Astro 6+ `redirectToDefaultLocale` dejó de venir activado por defecto y solo funciona con `prefixDefaultLocale: true`. No lo ponemos aquí porque **es comportamiento de middleware y el middleware necesita SSR**. En un sitio estático esa opción no hace nada. Es justo el tipo de detalle que un tutorial desactualizado te hace copiar y luego te deja un `/` que da 404 en producción.

### Por qué: `site` y `base` comentados

- **`site`** es la URL canónica absoluta de tu sitio. Astro la necesita para generar `<link rel="canonical">`, las etiquetas `hreflang` (que en un sitio bilingüe le dicen a Google "esta página tiene una versión en inglés aquí") y el `sitemap.xml`. Sin `site`, esas tres cosas no se pueden construir: una URL relativa no sirve como canónica.
- **`base`** es el subdirectorio donde vive el sitio. Solo lo necesitas si despliegas en algo como `usuario.github.io/Holman-Portfolio/`. Si lo pones, **todos** tus links y assets tienen que incluirlo, y olvidarse de uno rompe la navegación en producción pero no en local — el peor tipo de bug.

Los dejamos comentados porque todavía no elegiste hosting. Cuando lo hagas es una línea. Lo que **no** debes hacer es inventarte un valor provisional: un `site` incorrecto genera canónicas que apuntan a un dominio que no controlas, y eso sí le hace daño al SEO.

---

## Paso 3 — Que `/` lleve a algún lado

### Qué

```astro
---
// src/pages/index.astro
// Sitio estático: no hay servidor que emita un 301, así que redirigimos
// desde el HTML. Sustituir por un 301 real al elegir hosting.
---
<meta http-equiv="refresh" content="0;url=/es/" />
```

### Por qué: tres formas de redirigir y cuál puedes usar

1. **Redirect HTTP 301/302** — el servidor responde "esto se movió" antes de mandar nada. Es el correcto: rápido, lo entienden los buscadores, no consume render. **Necesita un servidor.** Un sitio estático no tiene.
2. **`Astro.redirect()`** — la versión de Astro del anterior. Solo existe con `output: 'server'` y un adapter. No aplica.
3. **`<meta http-equiv="refresh">`** — el navegador descarga el HTML, lo parsea, ve la etiqueta y navega. Es más lento (un round-trip completo) y los buscadores lo tratan peor que un 301, pero **funciona en cualquier hosting sin configuración**. Es la receta que documenta Astro para este caso exacto.

Usamos la 3 porque no sabemos dónde vas a desplegar. Cuando lo decidas, esto sube de categoría: Astro tiene una opción `redirects` en la config que, en Vercel/Netlify/Cloudflare, se traduce a un 301 real generado en el archivo de configuración del host. Entonces borras este archivo.

Anótalo mentalmente como **deuda consciente**: no es que esté mal, es que es lo mejor posible sin la decisión que falta. Reconocer esa diferencia — "esto es provisional por una razón concreta" vs "esto está mal" — es media carrera de ingeniería.

---

## Paso 4 — `src/styles/global.css`: reset y tokens

Este archivo tiene dos mitades con propósitos distintos. Las escribimos juntas pero conviene entenderlas por separado.

### 4.1 El reset — por qué existe

Todo navegador trae una hoja de estilos propia (la *user-agent stylesheet*) que se aplica antes que la tuya. Es la razón de que un `<h1>` salga grande y en negrita sin que tú pidas nada. El problema es que esos defaults vienen de los años 90, no son idénticos entre navegadores, y algunos son activamente molestos: **`<body>` trae `margin: 8px`**, y ese margen es la causa del clásico "¿por qué mi hero no llega al borde de la pantalla?".

Un reset no borra los estilos del navegador; normaliza los que estorban.

```css
/* ---------- Reset ---------- */

*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

body {
  min-height: 100svh;
  -webkit-font-smoothing: antialiased;
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
```

Línea por línea:

**`box-sizing: border-box`** — el cambio más importante que existe en CSS. Por defecto (`content-box`), si declaras `width: 300px; padding: 20px; border: 1px solid`, el elemento mide **342px** en pantalla: el navegador suma el padding y el borde *por fuera* del ancho que pediste. Con `border-box`, mide exactamente 300px y el padding se come el espacio por dentro. Lo segundo es lo que tu cerebro espera y lo que hace que un `width: 50%` siga siendo la mitad aunque le añadas padding. El `*::before, *::after` es para que los pseudoelementos hereden la misma regla.

**`* { margin: 0 }`** — elimina los márgenes heredados de los 90 (títulos, párrafos, listas). A partir de aquí, todo espacio que veas en pantalla lo pusiste tú a propósito. Esto conecta directo con la rejilla de 8px: no puedes tener ritmo vertical consistente si hay márgenes fantasma que no controlas.

**`min-height: 100svh`** — `svh` es *small viewport height*: la altura de la ventana **con** la barra de direcciones del móvil visible. El viejo `100vh` mide la ventana sin la barra, así que en móvil tu sección "de pantalla completa" queda cortada por abajo hasta que el usuario hace scroll. Es un bug que solo se ve en el teléfono, nunca en el DevTools.

**`img, video, canvas { display: block }`** — las imágenes son `inline` por defecto, lo que significa que se alinean en la línea de texto y dejan un hueco fantasma de ~4px debajo (el espacio reservado para las letras que bajan, como la "g"). Ponerlas en `block` lo elimina. `max-width: 100%` evita que una imagen grande desborde su contenedor horizontalmente.

**`font: inherit` en controles de formulario** — inputs y botones **no heredan la tipografía** del documento; usan la fuente del sistema. Sin esta línea, tu botón de contacto va a salir en Arial mientras todo lo demás usa tu fuente.

**`overflow-wrap: break-word`** — una URL larga sin espacios rompe el layout horizontal en móvil. Esto la parte.

### 4.2 Los tokens — por qué variables y no números

```css
/* ---------- Tokens ---------- */

:root {
  /* Escala de espaciado — base 8px.
     Todo margin, padding y gap del sitio sale de aquí. */
  --space-3xs: 0.25rem;  /*  4px */
  --space-2xs: 0.5rem;   /*  8px */
  --space-xs:  0.75rem;  /* 12px */
  --space-sm:  1rem;     /* 16px */
  --space-md:  1.5rem;   /* 24px */
  --space-lg:  2rem;     /* 32px */
  --space-xl:  3rem;     /* 48px */
  --space-2xl: 4rem;     /* 64px */
  --space-3xl: 6rem;     /* 96px */

  /* Escala tipográfica */
  --text-xs:   0.75rem;  /* 12px — metadatos */
  --text-sm:   0.875rem; /* 14px */
  --text-base: 1rem;     /* 16px — cuerpo */
  --text-lg:   1.25rem;  /* 20px */
  --text-xl:   1.5rem;   /* 24px */
  --text-2xl:  2rem;     /* 32px */
  --text-3xl:  clamp(2.5rem, 6vw, 4rem); /* display, fluido */

  /* Color — PLACEHOLDER NEUTRO. Se reemplaza al definir identidad visual. */
  --color-bg:     #ffffff;
  --color-fg:     #111111;
  --color-muted:  #6b6b6b;
  --color-line:   #e0e0e0;
  --color-accent: #111111;

  /* Layout */
  --container: 75rem; /* 1200px */
  --measure: 68ch;    /* ancho máximo de un bloque de texto */

  /* Tipografía — stack del sistema mientras no haya identidad */
  --font-sans: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}

body {
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
}
```

**Por qué custom properties y no variables de Sass.** Una variable de Sass (`$space-md`) se resuelve al compilar: en el CSS final solo queda `24px`, y la variable deja de existir. Una custom property (`--space-md`) **sigue viva en el navegador**: cascada, se puede sobreescribir por selector o por media query, y se puede leer y cambiar desde JavaScript. Eso es exactamente lo que necesitas para:

```css
/* modo oscuro: rediefines 5 valores, no reescribes el sitio */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0e0e0e;
    --color-fg: #f2f2f2;
  }
}
```

Por eso los colores van en tokens aunque todavía sean placeholder: **cuando definas tu identidad visual, cambias cinco líneas de este archivo y no tocas un solo componente.** Es la razón de hacer la Fase 0 antes que cualquier componente.

**Por qué `rem` y no `px`.** `1rem` = el tamaño de fuente del elemento raíz, que por defecto son 16px — pero el usuario **puede cambiarlo** en la configuración de su navegador. Mucha gente con baja visión lo sube a 20 o 24px. Si maquetas en `px`, ese ajuste no hace nada: tu texto se queda en 14px y tu sitio es inusable para esa persona. Si maquetas en `rem`, todo escala con ella. Es accesibilidad real, no una casilla que marcar.

El espaciado también va en `rem` por lo mismo: si el texto crece, el aire alrededor crece con él y las proporciones aguantan.

**Por qué `clamp()` en el título display.** `clamp(mínimo, preferido, máximo)` le da al navegador un rango: nunca baja de 2.5rem, nunca sube de 4rem, y en medio escala con el ancho de la ventana (`6vw`). Reemplaza tres media queries con una línea, y como es una función CSS nativa no cuesta JavaScript.

**Por qué `--measure: 68ch`.** La unidad `ch` es el ancho del carácter "0" en la fuente actual. La investigación tipográfica sitúa la legibilidad óptima entre 45 y 75 caracteres por línea; más ancho y el ojo pierde el renglón al volver. Un párrafo de tu "about" a ancho completo en un monitor de 27" es ilegible aunque el tamaño de letra sea perfecto.

---

## Paso 5 — Conectar el CSS

### Qué

En `src/layouts/Layout.astro`, dentro del frontmatter:

```astro
---
import '../styles/global.css';
---
```

### Por qué importarlo y no enlazarlo desde `public/`

Podrías poner el archivo en `public/global.css` y meter un `<link rel="stylesheet" href="/global.css">`. Funcionaría. Pero importándolo desde un componente, Astro se encarga de:

- **Hashear el nombre** (`global.a3f9c1.css`) para poder cachearlo un año sin riesgo: si cambias el archivo, cambia el hash, cambia la URL, el navegador lo vuelve a pedir. Con un nombre fijo tendrías que elegir entre caché agresiva y despliegues que no se ven.
- **Decidir si lo incrusta o lo enlaza.** El default de Astro es `'auto'`: las hojas pequeñas van inline en el HTML (ahorra una petición de red, que en la primera carga pesa más que los bytes) y las grandes van en archivo aparte.
- **Deduplicarlo.** Aunque diez componentes importen el mismo CSS, sale una vez.

Todo lo que pongas en `public/` se copia **tal cual**, sin procesar, sin hashear, sin optimizar. Esa carpeta es para lo que necesita una URL estable y predecible: `favicon.ico`, `robots.txt`, imágenes de Open Graph, fuentes. Para el resto, `src/`.

> Esta misma lógica gobierna las imágenes, y es la regla que más vas a usar en este proyecto: **imágenes en `src/assets/`** para que Astro las convierta a AVIF/WebP, genere tamaños responsive y les ponga hash; `public/` solo si algo externo necesita la URL exacta.

---

## Verificación de la fase

```bash
npm run build
```

1. El build pasa sin errores.
2. Miras la estructura generada:
   ```bash
   find dist -name "*.html"
   ```
   Debe existir `dist/index.html` (el redirect). Todavía no hay `dist/es/` porque aún no creaste las páginas — eso es Fase 1.
3. `cat dist/index.html` y confirma que contiene el `<meta http-equiv="refresh">`.
4. Levantas el dev server y abres `/` en el navegador:
   ```bash
   npx astro dev
   ```
   Debe saltar a `/es/`. Verás un 404 de Astro en `/es/` — **correcto**: la redirección funciona, la página aún no existe.

Ese 404 es la señal de que la Fase 0 está completa y la Fase 1 tiene trabajo.

---

## Lo que aprendiste en esta fase

| Concepto | Resumen de una línea |
|---|---|
| File-based routing | Cada archivo en `src/pages/` es una URL pública. No hay borradores. |
| Build-time vs runtime | `astro.config.mjs` corre en Node y no pesa para el visitante. |
| `prefixDefaultLocale` | Simetría de rutas a cambio de perder `/` como página. |
| 301 vs meta refresh | Un sitio estático no tiene servidor que redirija; el HTML lo hace peor pero en cualquier host. |
| `box-sizing: border-box` | El ancho que declaras es el ancho que ocupa. |
| `svh` vs `vh` | `vh` ignora la barra del navegador móvil y corta tu hero. |
| Custom properties vs Sass | Las de CSS siguen vivas en el navegador: cascada, media queries, JS. |
| `rem` vs `px` | `rem` respeta el tamaño de fuente que el usuario configuró. Es accesibilidad. |
| `src/` vs `public/` | `src/` se procesa y hashea; `public/` se copia tal cual. |

---

## Siguiente: Fase 1 — Shell

Layout con `<head>` completo, diccionarios de traducción, Header con switcher de idioma que conserva la ruta, Footer, y las 8 rutas navegables. Ahí es donde el sitio empieza a existir.
