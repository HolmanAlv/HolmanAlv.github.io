# Fase 1 — El shell: Layout, i18n, Header y Footer (tutorial guiado)

> **Qué vas a lograr:** las 8 rutas navegables, con `<head>` correcto, navegación con estado activo y un switcher de idioma que te deja en la misma página. A partir de aquí el sitio existe.
> **Punto de partida:** tu Fase 0 verificada.
> **Concepto central de la fase:** separar **estructura** (Layout), **texto** (diccionarios) y **presentación** (componentes), para que el idioma no se filtre dentro del marcado.

---

## Paso 1 — `src/i18n/ui.ts`: el diccionario

### Qué

```ts
// src/i18n/ui.ts

export const languages = {
  en: 'English',
  es: 'Español',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

const en = {
  'nav.home': 'Home',
  'nav.dev': 'Development',
  'nav.gamedev': 'Game Dev',
  'nav.film': 'Film & VFX',
  'nav.contact': 'Contact',
  'nav.label': 'Main navigation',
  'a11y.skip': 'Skip to content',
  'footer.rights': 'All rights reserved',
  'home.title': 'Holman Alvarado — Software, games and film',
  'home.description': 'Portfolio of software engineering, game development and film production.',
  'dev.title': 'Software development',
  'dev.description': 'Software engineering projects, architecture and technical stack.',
  'gamedev.title': 'Game development & tech art',
  'gamedev.description': 'Render optimization, mechanics, tooling and sound design.',
  'film.title': 'Animation, VFX & filmmaking',
  'film.description': 'Reel, audiovisual projects and post-production tools.',
};

type UIStrings = typeof en;

const es: UIStrings = {
  'nav.home': 'Inicio',
  'nav.dev': 'Desarrollo',
  'nav.gamedev': 'Videojuegos',
  'nav.film': 'Audiovisual',
  'nav.contact': 'Contacto',
  'nav.label': 'Navegación principal',
  'a11y.skip': 'Saltar al contenido',
  'footer.rights': 'Todos los derechos reservados',
  'home.title': 'Holman Alvarado — Desarrollo, videojuegos y audiovisual',
  'home.description': 'Portafolio de ingeniería de software, desarrollo de videojuegos y producción audiovisual.',
  'dev.title': 'Desarrollo de software',
  'dev.description': 'Proyectos de ingeniería de software, arquitectura y stack técnico.',
  'gamedev.title': 'Desarrollo de videojuegos y tech art',
  'gamedev.description': 'Optimización de renderizado, mecánicas, herramientas y diseño sonoro.',
  'film.title': 'Animación, VFX y realización',
  'film.description': 'Reel, proyectos audiovisuales y herramientas de post-producción.',
};

export const ui = { en, es } satisfies Record<Lang, UIStrings>;
```

### Por qué: el tipado es la garantía de que no falta una traducción

Fíjate en el orden de las tres declaraciones, porque es donde está toda la gracia:

1. `const en = {...}` — **sin** `as const`. Los valores quedan tipados como `string`, no como el texto literal.
2. `type UIStrings = typeof en` — el inglés define **la forma del contrato**: qué claves existen.
3. `const es: UIStrings = {...}` — el español está obligado a cumplir ese contrato.

El inglés va primero porque es tu idioma por defecto: es el que un buscador indexa como principal y el que ve quien llega sin preferencia declarada. El idioma principal debe ser el que define qué existe; el secundario, el que se adapta.

El resultado: si olvidas una clave en `es`, o escribes mal una, **el editor te lo marca en rojo inmediatamente**. Si añades una clave nueva al inglés, el español se pone en error hasta que la traduzcas.

Esto sustituye al patrón habitual de "si falta la traducción, cae al idioma por defecto". Ese fallback parece prudente pero es una trampa: el sitio se ve bien, no hay error en ninguna parte, y llevas seis meses mostrándole una sección en inglés a quien eligió leerte en español sin enterarte. **Un fallo silencioso es peor que un fallo ruidoso.** Aquí el compilador te obliga a enterarte.

> **Por qué `as const` sí en `languages` y no en los diccionarios.** `as const` congela los valores como tipos literales. En `languages` eso es lo que quieres: `keyof typeof languages` produce el tipo `'es' | 'en'`, que es la lista cerrada de idiomas válidos en todo el proyecto. En los diccionarios sería contraproducente: haría que `es` tuviera que contener el texto exacto en inglés.

> **Por qué claves planas (`'nav.dev'`) y no objetos anidados (`nav: { dev: ... }`).** Con claves planas, `t('nav.dev')` te autocompleta la lista entera y un typo es un error de tipo. Con anidación necesitas acceso encadenado, tipos recursivos y se complica sin ganar nada. El punto en `'nav.dev'` es solo una convención visual de agrupación, no estructura real.

### Lo que hay que saber: esto NO rompe el build por defecto

Astro compila `.ts` con Vite, que **borra los tipos sin comprobarlos**. El error lo ves en tu editor, pero `npm run build` pasa igual. Para que el contrato sea real en CI:

```bash
npx astro add check   # instala @astrojs/check y typescript
```

y en `package.json`:

```json
"build": "astro check && astro build"
```

Es la única dependencia que añade esta fase, y es de desarrollo (no viaja al navegador). Recomendado: un tipado que solo avisa en tu editor es un tipado que ignoras el día que tienes prisa.

---

## Paso 2 — `src/i18n/utils.ts`: las funciones

### Qué

```ts
// src/i18n/utils.ts
import { ui, defaultLang, type Lang } from './ui';

/** Devuelve la función de traducción ya atada a un idioma. */
export function useTranslations(lang: Lang) {
  return (key: keyof typeof ui[typeof defaultLang]) => ui[lang][key];
}

/** El otro idioma. Con dos, es el que no es el actual. */
export function otherLang(lang: Lang): Lang {
  return lang === 'es' ? 'en' : 'es';
}

/** Quita el prefijo de idioma: '/es/developer/' → '/developer/' */
export function stripLang(pathname: string): string {
  return pathname.replace(/^\/(es|en)/, '') || '/';
}
```

### Por qué: `useTranslations` devuelve una función

Podrías haber escrito `t(lang, 'nav.dev')` y pasar el idioma en cada llamada. En cambio `useTranslations(lang)` devuelve una función que **ya recuerda** el idioma:

```astro
const t = useTranslations(lang);
// a partir de aquí:
t('nav.dev')      // no t(lang, 'nav.dev')
```

Eso se llama **closure**: la función interna sigue teniendo acceso a la variable `lang` del ámbito donde nació, incluso después de que `useTranslations` haya terminado de ejecutarse. Es uno de los conceptos con más kilometraje en JavaScript, y aquí resuelve dos problemas concretos:

- **Menos ruido.** En un componente vas a llamar a `t()` diez veces. Repetir `lang` diez veces es repetir una constante.
- **Menos superficie de error.** Con un solo punto donde se fija el idioma, es imposible que la línea 40 de un componente use `en` mientras la línea 12 usa `es`.

---

## Paso 3 — `src/layouts/Layout.astro`: el `<head>` de verdad

### Qué

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { languages, type Lang } from '../i18n/ui';
import { useTranslations, stripLang } from '../i18n/utils';
import '../styles/global.css';

interface Props {
  lang: Lang;
  title: string;
  description: string;
}

const { lang, title, description } = Astro.props;
const t = useTranslations(lang);

// Astro.site es undefined mientras no definas `site` en astro.config.mjs.
// canonical y hreflang exigen URL absoluta, así que se emiten solo si existe.
const rest = stripLang(Astro.url.pathname);
const canonical = Astro.site ? new URL(Astro.url.pathname, Astro.site) : null;
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

    {canonical && <link rel="canonical" href={canonical.href} />}
    {Astro.site && Object.keys(languages).map((l) => (
      <link rel="alternate" hreflang={l} href={new URL(`/${l}${rest}`, Astro.site).href} />
    ))}
    {Astro.site && (
      <link rel="alternate" hreflang="x-default" href={new URL(`/en${rest}`, Astro.site).href} />
    )}

    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {canonical && <meta property="og:url" content={canonical.href} />}
  </head>

  <body>
    <a class="skip" href="#main">{t('a11y.skip')}</a>
    <Header lang={lang} />
    <main id="main">
      <slot />
    </main>
    <Footer lang={lang} />
  </body>
</html>

<style>
  .skip {
    position: absolute;
    left: var(--space-sm);
    top: -100%;
    z-index: 100;
    padding: var(--space-2xs) var(--space-sm);
    background: var(--color-bg);
    color: var(--color-fg);
    border: 1px solid var(--color-fg);
  }
  .skip:focus {
    top: var(--space-sm);
  }
</style>
```

### Por qué: anatomía de un componente Astro

Las dos líneas de `---` son el **frontmatter**. Ese código corre **en build, en Node**, una vez por página generada. No se envía al navegador. Puedes leer archivos, consultar una API, hacer cálculos caros: el visitante recibe solo el HTML resultante.

Debajo va el template. Las llaves `{}` interpolan expresiones de JavaScript, igual que JSX. Y `{condición && <elemento/>}` renderiza el elemento solo si la condición es cierta — es el patrón que usamos para el `canonical`.

`interface Props` es una convención con significado especial: Astro la usa para tipar lo que llega por `Astro.props`. Con ella, si en una página escribes `<Layout lang={lang} title={...}>` y olvidas `description`, el editor te avisa.

`<slot />` es el agujero por donde entra el contenido. Cuando una página escribe `<Layout>...</Layout>`, todo lo de dentro aterriza ahí. Es composición: el Layout aporta el chasis, la página aporta el contenido.

### Por qué cada etiqueta del `<head>`

**`<meta charset="utf-8">` va primero, siempre.** El navegador empieza a parsear el HTML antes de saber su codificación; si encuentra la declaración pasados los primeros 1024 bytes, puede tener que descartar lo parseado y empezar de nuevo. En español esto es visible: sin charset correcto, "Diseño" sale "Diseño".

**`viewport`** le dice al móvil que use su ancho real en vez de fingir un monitor de escritorio y encoger la página. Sin esto, todo tu CSS responsive es decorativo. Nota: nunca añadas `user-scalable=no`; bloquea el zoom y hay gente que lo necesita para leerte.

**`<html lang={lang}>`** no es cosmético. Los lectores de pantalla eligen la voz y la pronunciación según ese atributo: un `lang="en"` en una página española hace que un lector lea "Desarrollo" con fonética inglesa. También gobierna la separación silábica y las comillas tipográficas del navegador.

**`canonical`** declara cuál es la URL oficial de este contenido. Evita que el buscador trate `/es/dev`, `/es/dev/` y `/es/dev?ref=twitter` como tres páginas distintas compitiendo entre ellas.

**`hreflang`** es específicamente para sitios multiidioma: le dice al buscador "esta página tiene una versión equivalente en inglés aquí". Sin ella, tus dos versiones se canibalizan en los resultados. `x-default` indica cuál servir a quien no encaje en ninguno de los dos idiomas: el inglés, por ser el principal.

**Open Graph (`og:`)** controla la tarjeta que aparece cuando alguien pega tu link en LinkedIn, WhatsApp o Slack. Para un portafolio que se comparte por mensaje, esto es la primera impresión literal. Faltará `og:image` hasta que tengas identidad visual — lo cierras en la Fase 8.

### El precio de no haber elegido hosting

Fíjate en las tres condicionales `{Astro.site && ...}`. `canonical`, `hreflang` y `og:url` **exigen URLs absolutas** (`https://dominio.com/es/dev`), y una URL absoluta necesita el dominio. Sin `site` en la config, `Astro.site` es `undefined`.

Hay tres formas de manejar esto y solo una es correcta:

1. Inventar un dominio provisional → genera canónicas apuntando a un sitio que no controlas. Activamente dañino.
2. Emitir la etiqueta con una URL relativa → inválida; el buscador la ignora o la malinterpreta.
3. **No emitirla mientras no se pueda emitir bien.** Es lo que hacemos.

Esto se llama **degradación elegante**: la funcionalidad que no puede existir todavía simplemente no existe, en vez de existir mal. El día que rellenes `site`, las tres etiquetas aparecen solas sin tocar el Layout.

### El skip link

Ese primer enlace del `<body>` está fuera de la pantalla (`top: -100%`) y solo aparece al recibir foco (`:focus`). Quien navega con teclado o lector de pantalla entra en tu página y se encuentra primero toda la navegación: sin un skip link tiene que tabular por los cuatro enlaces del header en **cada** página antes de llegar al contenido. Son ocho líneas de CSS y es el gesto de accesibilidad con mejor relación esfuerzo/impacto que existe.

---

## Paso 4 — `src/components/Header.astro`

### Qué

```astro
---
import { languages, type Lang } from '../i18n/ui';
import { useTranslations, otherLang, stripLang } from '../i18n/utils';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const t = useTranslations(lang);

const other = otherLang(lang);
const rest = stripLang(Astro.url.pathname);

// Normaliza la barra final para poder comparar rutas con seguridad.
const clean = (p: string) => p.replace(/\/$/, '') || '/';
const current = clean(Astro.url.pathname);

const links = [
  { href: `/${lang}/developer`, label: t('nav.dev') },
  { href: `/${lang}/gamedev`, label: t('nav.gamedev') },
  { href: `/${lang}/filmmaker`, label: t('nav.film') },
];
---

<header>
  <a class="logo" href={`/${lang}/`}>HOLMAN</a>

  <nav aria-label={t('nav.label')}>
    <ul>
      {links.map((link) => (
        <li>
          <a href={link.href} aria-current={clean(link.href) === current ? 'page' : undefined}>
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>

  <a class="lang" href={`/${other}${rest}`} hreflang={other} lang={other}>
    {languages[other]}
  </a>
</header>

<style>
  header {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-line);
  }
  .logo {
    font-weight: 700;
    margin-right: auto;
  }
  ul {
    display: flex;
    gap: var(--space-md);
    list-style: none;
    padding: 0;
  }
  a {
    color: inherit;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  [aria-current='page'] {
    text-decoration: underline;
    font-weight: 600;
  }
</style>
```

### Por qué: el switcher que conserva la ruta

Es el detalle que separa un sitio bilingüe de un sitio con dos idiomas. Si el botón de idioma te manda siempre al home, has castigado al usuario por querer leerte en su lengua: estaba en tu página de videojuegos y ahora tiene que volver a navegar.

La solución es aritmética de strings:

```
/es/gamedev/  --stripLang-->  /gamedev/  --prefijo other-->  /en/gamedev/
```

Como las dos ramas de idioma tienen **exactamente la misma estructura de rutas** (`developer`, `gamedev`, `filmmaker` en ambas), la traducción de URL es sustituir un segmento. Aquí se cobra la decisión de la Fase 0 de no traducir los slugs: si el español usara `/es/desarrollador` y el inglés `/en/developer`, harían falta un mapa de equivalencias y un fallback para cuando no exista. Se puede hacer, y para un sitio de contenido con SEO local competitivo valdría la pena. Para un portafolio, no. Es una simplificación deliberada, no un olvido.

### Por qué `aria-current` y no una clase CSS

Lo intuitivo sería `class={esActivo ? 'activo' : ''}`. El problema es que una clase solo comunica **visualmente**: quien no ve la pantalla no recibe nada.

`aria-current="page"` es el atributo estándar para "este enlace es la página actual", y los lectores de pantalla lo anuncian. Y como es un atributo, puedes estilarlo directamente con el selector `[aria-current='page']` — así el estado accesible y el estado visual son **la misma fuente de verdad** y no pueden desincronizarse. Nunca vas a tener un enlace subrayado que no se anuncia, ni al revés.

Nota el `: undefined` en la condición: en Astro, un atributo con valor `undefined` **no se renderiza**. Si pusieras `'false'`, estarías emitiendo `aria-current="false"` en los tres enlaces inactivos, que es ruido válido pero innecesario.

### Por qué la normalización de la barra final

Astro construye por defecto en formato directorio: `developer.astro` genera `dist/es/developer/index.html`, que se sirve en `/es/developer/` **con** barra final. Pero tú escribes el `href` sin ella. Comparar `'/es/developer'` con `'/es/developer/'` da `false`, y tu estado activo no se activaría nunca.

El helper `clean()` quita la barra final de ambos lados antes de comparar. Es un bug de una sola línea que solo se manifiesta en el build de producción y no en algunos casos de desarrollo — exactamente el tipo de cosa que cuesta una tarde si no sabes que existe.

### Por qué los estilos van dentro del `.astro`

El `<style>` de un componente Astro está **encapsulado por defecto**. En build, Astro añade un atributo hash a los elementos del componente (`data-astro-cid-x7k2`) y reescribe tus selectores para incluirlo. Tu `ul { display: flex }` se convierte en `ul[data-astro-cid-x7k2] { display: flex }`.

Consecuencias prácticas:

- Puedes usar selectores cortos y obvios (`ul`, `a`, `header`) sin miedo. No van a afectar a ningún otro componente.
- No necesitas convenciones de nomenclatura tipo BEM ni CSS-in-JS. El problema que esas herramientas resuelven, aquí no existe.
- **Cuesta cero JavaScript.** Todo ocurre al compilar; al navegador llega CSS normal.
- Astro recolecta el CSS de todos los componentes de la página y lo emite junto, así que tampoco pagas una petición por componente.

Lo global (reset, tokens) sigue en `global.css`; lo local vive junto al marcado que estiliza. Esa separación es la que hace que borrar un componente borre también su CSS, en vez de dejar reglas huérfanas acumulándose en una hoja gigante.

### Por qué no hay menú hamburguesa

Tienes tres enlaces y un switcher. Caben en la pantalla de un móvil. Un hamburguesa implica un botón, un panel, estado abierto/cerrado, gestión de foco, cierre con `Escape` y atributos `aria-expanded` para que sea accesible — todo eso para esconder tres palabras que ya cabían.

Si más adelante la nav crece, el patrón lazy sigue sin ser JavaScript: `<details>`/`<summary>` da un desplegable accesible nativo con cero líneas de script.

---

## Paso 5 — `src/components/Footer.astro`

### Qué

```astro
---
import { type Lang } from '../i18n/ui';
import { useTranslations } from '../i18n/utils';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const t = useTranslations(lang);
const year = new Date().getFullYear();
---

<footer>
  <p>© {year} Holman Alvarado. {t('footer.rights')}.</p>
  <ul>
    <li><a href="https://github.com/" rel="me">GitHub</a></li>
    <li><a href="https://www.linkedin.com/" rel="me">LinkedIn</a></li>
  </ul>
</footer>

<style>
  footer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md);
    justify-content: space-between;
    padding: var(--space-xl) var(--space-md);
    border-top: 1px solid var(--color-line);
    color: var(--color-muted);
    font-size: var(--text-sm);
  }
  ul {
    display: flex;
    gap: var(--space-md);
    list-style: none;
    padding: 0;
  }
  a {
    color: inherit;
  }
</style>
```

### Por qué `new Date().getFullYear()`

El año se calcula **en build**, no en el navegador: recuerda que el frontmatter corre en Node. El HTML generado lleva el número ya escrito. Cero JavaScript enviado, y nunca vas a tener un footer que diga 2024 en 2027 porque se te olvidó editarlo — basta con que redespliegues.

Es un ejemplo pequeño de la idea que gobierna todo Astro: **si algo se puede calcular antes, cálculalo antes**.

---

## Paso 6 — Las ocho páginas

### Qué

Mantienes tus carpetas `src/pages/en/` y `src/pages/es/` tal como las creaste. Cada archivo declara su idioma en una línea.

`src/pages/en/index.astro`:

```astro
---
import Layout from '../../layouts/Layout.astro';
import { useTranslations } from '../../i18n/utils';
import type { Lang } from '../../i18n/ui';

const lang: Lang = 'en';
const t = useTranslations(lang);
---

<Layout lang={lang} title={t('home.title')} description={t('home.description')}>
  <h1>{t('home.title')}</h1>
</Layout>
```

`src/pages/en/developer.astro` — idéntico salvo las claves:

```astro
---
import Layout from '../../layouts/Layout.astro';
import { useTranslations } from '../../i18n/utils';
import type { Lang } from '../../i18n/ui';

const lang: Lang = 'en';
const t = useTranslations(lang);
---

<Layout lang={lang} title={t('dev.title')} description={t('dev.description')}>
  <h1>{t('dev.title')}</h1>
</Layout>
```

Y `src/pages/es/developer.astro` es ese mismo archivo con **una línea distinta**:

```astro
const lang: Lang = 'es';
```

Los ocho archivos, con lo único que cambia entre ellos:

| Archivo | `lang` | Claves |
|---|---|---|
| `en/index.astro` | `'en'` | `home.title` / `home.description` |
| `en/developer.astro` | `'en'` | `dev.title` / `dev.description` |
| `en/gamedev.astro` | `'en'` | `gamedev.title` / `gamedev.description` |
| `en/filmmaker.astro` | `'en'` | `film.title` / `film.description` |
| `es/index.astro` | `'es'` | `home.title` / `home.description` |
| `es/developer.astro` | `'es'` | `dev.title` / `dev.description` |
| `es/gamedev.astro` | `'es'` | `gamedev.title` / `gamedev.description` |
| `es/filmmaker.astro` | `'es'` | `film.title` / `film.description` |

### Por qué el idioma se escribe a mano

`const lang: Lang = 'en'` no es un dato que haya que deducir de ningún sitio: **la carpeta ya lo declara**. El archivo está en `pages/en/`, así que es la versión en inglés. La constante solo lo repite para que el resto del componente pueda usarlo.

La anotación `: Lang` es lo que lo hace seguro. Si escribes `'EN'` o `'eng'`, el editor lo marca en rojo, porque `Lang` es el tipo `'en' | 'es'` derivado de tu objeto `languages`. Es una cadena literal, pero no es una cadena mágica: está atada al mismo sitio que todo lo demás.

> **La ventaja que te llevas:** al leer cualquier página sabes el idioma en la primera línea del frontmatter, sin saltar a un helper ni entender cómo Astro deduce el locale de la URL. El coste es la línea repetida ocho veces. Para ocho archivos, esa es la ecuación correcta.

### Por qué las páginas quedan así de cortas

Seis líneas de frontmatter y tres de template. Esa brevedad es la señal de que el reparto de responsabilidades funciona:

- El **Layout** sabe de estructura HTML y metadatos.
- Los **diccionarios** saben de texto.
- Las **carpetas** saben de rutas.
- La **página** solo decide qué contenido va dentro.

Cuando en la Fase 4 esta página crezca, lo que crecerá es la parte del template — el andamiaje de idioma y `<head>` se queda en estas mismas líneas para siempre. Ese es el rendimiento real de haber hecho el shell primero.

> **Nota para la Fase 4.** A medida que el marcado de una página crezca, la versión inglesa y la española van a tener el mismo template con distintas claves. Cuando eso empiece a molestar, la salida no es ninguna estructura nueva: son los mismos componentes de sección (`ProjectRow`, `CapabilityGrid`…) que de todas formas vas a necesitar para compartir entre Dev, GameDev y Film. Las páginas se quedan cortas porque el contenido vive en componentes y colecciones, no porque las rutas hagan algo inteligente.

### Una nota sobre tu `astro.config.mjs`

Con carpetas estáticas, el bloque `i18n` de tu config queda sobre todo **declarativo**: dice cuáles son tus idiomas y cuál es el principal, pero tus rutas funcionan porque las carpetas se llaman `es` y `en`, no porque Astro las genere. No lo quites — sigue siendo la declaración formal de qué idiomas existe, la usarás en la Fase 8 para el sitemap, y no cuesta nada.

---

## Verificación de la fase

```bash
npm run build
find dist -name "*.html" | sort
```

Deben salir exactamente 9: las 8 rutas más el redirect de la raíz.

Luego `npx astro dev` y comprueba, con el navegador:

1. **Navegación.** Los tres enlaces del header llevan a su página en el idioma correcto.
2. **Estado activo.** Estando en `/en/gamedev/`, ese enlace aparece subrayado y en negrita. Inspecciónalo: debe tener `aria-current="page"`, y los otros dos no deben tener el atributo en absoluto.
3. **Switcher.** Desde `/en/gamedev/`, pulsar "Español" te deja en `/es/gamedev/`, **no** en `/es/`. Este es el punto que más se rompe: pruébalo desde las cuatro secciones.
4. **`lang` del documento.** En `/es/developer/`, `view-source` debe empezar con `<html lang="es">`.
5. **Skip link.** Carga cualquier página y pulsa `Tab` una vez sin haber hecho clic en nada. Debe aparecer un enlace "Skip to content" arriba a la izquierda (o "Saltar al contenido" si estás en `/es/`). Pulsa `Enter`: el foco salta al `<main>`.
6. **Cero JavaScript.** DevTools → Network → filtro `JS`. Debe estar vacío. Si aparece algo, algo se hidrató sin que se lo pidieras.
7. **Modo oscuro.** DevTools → menú de tres puntos → More tools → Rendering → `prefers-color-scheme: dark`. Todo debe seguir siendo legible, incluidos los bordes del header y el footer.

El punto 6 es el que define esta fase. Tienes navegación, dos idiomas, estado activo y accesibilidad de teclado, y el navegador no ejecuta una sola línea de JavaScript tuyo. Todo eso es HTML y CSS calculados en tu máquina.

---

## Lo que aprendiste en esta fase

| Concepto | Resumen de una línea |
|---|---|
| Frontmatter | Corre en Node al construir; nunca llega al navegador. |
| Routing por carpetas | La ruta de un archivo en `src/pages/` **es** su URL. |
| `interface Props` + `<slot/>` | Contrato de entrada y agujero de composición de un componente. |
| `satisfies` + tipo derivado | El español define el contrato; al inglés le falta una clave → error en el editor. |
| Closures (`useTranslations`) | Una función que recuerda el idioma con el que nació. |
| `charset` primero | Si llega tarde, el navegador reparsea y tus tildes se rompen. |
| `canonical` / `hreflang` | Qué URL es la oficial y dónde está su equivalente en el otro idioma. |
| Degradación elegante | Lo que no se puede emitir bien, no se emite. |
| `aria-current` | Estado accesible y estado visual desde una sola fuente de verdad. |
| Estilos con scope | Astro hashea los selectores en build: selectores cortos, cero fugas, cero JS. |
| Cálculo en build | El año del footer se resuelve al construir, no en el cliente. |

---

## Siguiente: Fase 2 — Primitivas

`Section.astro` y `ChipList.astro`. Dos componentes pequeños que fijan el ritmo vertical y la forma de los chips para todo el sitio. Es la fase más corta del plan, y la que hace que las tres subpáginas se vean como el mismo sitio.
