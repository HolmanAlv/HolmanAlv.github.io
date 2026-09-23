export const languages = {
    en: 'English',
    es: 'Español',
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

const en = {
    'nav.home': 'Home',
    'nav.dev': 'Web Dev',
    'nav.gamedev': 'Game Dev',
    'nav.film': 'Filmmaking',
    'nav.contact': 'Contact',
    'nav.label': 'Main navigation',
    'a11y.skip': 'Skip to content',
    'footer.rights': 'All rights reserved',
    'home.title': 'Holman.Alv Programming, Gaming development & Filmmaking',
    'home.description': 'Portfolio of software engineer, game developer and film animator',
    'dev.title': 'Software development',
    'dev.description': 'Software engineering projects, architecture and technical stack.',
    'gamedev.title': 'Game development & tech art',
    'gamedev.description': 'Render optimization, mechanics, tooling and sound design.',
    'film.title': 'Animation, VFX & filmmaking',
    'film.description': 'Reel, audiovisual projects and post-production tools.',
}

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
}

export const ui = {en, es} satisfies Record<Lang, UIStrings>;