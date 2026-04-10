/* ============================================================
   HOLMAN.EXE — main.js
   Funcionalidades del portafolio desacopladas del HTML
   ============================================================ */

'use strict';

const NAVBAR_HEIGHT = 72;
const ACTIVE_SECTION_OFFSET = 120;
const THEME_STORAGE_KEY = 'theme';
const LANG_STORAGE_KEY  = 'lang';
const TRAINER_BIRTHDATE = new Date(2003, 1, 13); // Mes 0-indexado: 1 = febrero

const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function scrollToElementWithOffset(element, offset = NAVBAR_HEIGHT) {
  const top = element.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

function updateFooterYear() {
  const yearEl = document.getElementById('year');
  if (!yearEl) return;
  yearEl.textContent = String(new Date().getFullYear());
}

function initSmoothScroll() {
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    scrollToElementWithOffset(target);

    if (window.location.hash !== targetId) {
      history.pushState(null, '', targetId);
    }
  });
}

function initActiveNav() {
  const sections = qsa('header[id], section[id]');
  const navLinks = qsa('.menu ul li a');
  if (!sections.length || !navLinks.length) return;

  const activate = () => {
    const scrollY = window.scrollY + ACTIVE_SECTION_OFFSET;

    let current = sections[0];
    sections.forEach((section) => {
      if (scrollY >= section.offsetTop) current = section;
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`);
    });
  };

  window.addEventListener('scroll', activate, { passive: true });
  activate();
}

/* ============================================================
   TRANSLATIONS
   ============================================================ */
const TRANSLATIONS = {
  es: {
    'nav.home':    'inicio',
    'nav.projects': 'proyectos',
    'nav.about':   'sobre mí',
    'nav.social':  'Redes',
    'nav.contact': 'Contacto',

    'hero.badge':   'INTERNET - VIDEOJUEGOS - CINEMATOGRAFÍA',
    'hero.greeting': 'Hola, soy',
    'hero.tagline':  'Me gusta mezclar el arte y la tecnología',
    'hero.dialog':   'Desarrollador Full Stack, Game Developer y Cineasta. Combino el desarrollo de software con la narración visual para crear experiencias digitales únicas. Trabajo con herramientas libres y open source. Me apasiona crear y compartir mi conocimiento con la comunidad.',
    'hero.cta.projects': 'Ver proyectos',
    'hero.cta.cv':       'Descargar CV',
    'hero.scroll':       '—  DESLICE PARA CONTINUAR —',

    'projects.label':    'POKEDEX DE PROYECTOS',
    'projects.title':    'MIS PROYECTOS',
    'projects.subtitle': 'Separados por áreas y con enlaces directos. No incluyo todo: elijo lo más original, activo y completo.',

    'area.games.title': 'Videojuegos',
    'area.games.desc':  'Aquí muestro mis juegos: demo jugable, repositorio, video corto y mi aporte específico.',
    'area.web.title':   'Desarrollo Web',
    'area.web.desc':    'Productos, landing pages, herramientas internas, dashboards o experiencias interactivas.',
    'area.film.title':  'Cine, Animación y Postproducción',
    'area.film.desc':   'Montaje, dirección, guión, animación y edición sonora. También incluyo piezas cortas con proceso.',

    'about.label':    'TRAINER CARD',
    'about.title':    'SOBRE MÍ',
    'about.subtitle': 'Por qué soy empleable y qué estoy buscando.',
    'about.card1.title': 'Qué me hace empleable',
    'about.card1.p1':    'Soy un perfil híbrido: puedo construir una interfaz web, programar mecánicas de juego y terminar una pieza audiovisual con intención. Eso me permite comunicarme con equipos diferentes, aterrizar ideas y entregar resultados de principio a fin.',
    'about.card1.p2':    'Busco oportunidades como desarrollador web, game dev o perfiles híbridos orientados a experiencias interactivas. (Placeholder: aquí describo mi objetivo actual con 1–2 frases.)',
    'about.card2.title': 'Mi historia (y mi crecimiento)',
    'about.card2.p1':    'Mi camino mezcla aprendizaje constante y proyectos personales: cada juego y cada web me deja una lección nueva. Me gusta mostrar el viaje: qué reto enfrenté, cómo lo medí y qué cambié hasta lograrlo.',
    'about.pill.web':          'Desarrollo Web',
    'about.pill.games':        'Videojuegos',
    'about.pill.film':         'Cine / Animación',
    'about.pill.narrative':    'Narrativa',
    'about.pill.optimization': 'Optimización',

    'social.label':       'LINK CABLE',
    'social.title':       'PRESENCIA DIGITAL',
    'social.subtitle':    'GitHub e Itch.io primero. Commits frecuentes y contenido actualizado.',
    'social.card1.title': 'GitHub + Itch.io (prioridad)',
    'social.card1.desc':  'Aquí centralizo repositorios, builds y actualizaciones de mis proyectos.',
    'social.card2.title': 'Otras plataformas',
    'social.card2.desc':  'Uso estos espacios para mostrar proceso, videos cortos y evolución de mis proyectos.',
    'social.twitch':      'Twitch (opcional)',
    'social.hackerrank':  'HackerRank (opcional)',

    'contact.label':              'TRADE REQUEST',
    'contact.title':              'CONTACTO',
    'contact.subtitle':           'Me puedes escribir y responderé lo antes posible. Mantengo esta sección siempre actualizada.',
    'contact.card.title':         'Datos',
    'contact.email.label':        'Email:',
    'contact.location.label':     'Ubicación:',
    'contact.location.value':     'Bogotá, Colombia',
    'contact.availability.label': 'Disponibilidad:',
    'contact.availability.value': 'Freelance / Tiempo completo / Remoto',
    'contact.updated.label':      'Última actualización:',

    'footer.made':  'HECHO CON',
    'footer.totop': 'Volver arriba',
  },

  en: {
    'nav.home':    'home',
    'nav.projects': 'projects',
    'nav.about':   'about',
    'nav.social':  'Social',
    'nav.contact': 'Contact',

    'hero.badge':   'INTERNET - VIDEO GAMES - FILMMAKING',
    'hero.greeting': 'Hi, I\'m',
    'hero.tagline':  'I love blending art and technology',
    'hero.dialog':   'Full Stack Developer, Game Developer & Filmmaker. I combine software development with visual storytelling to craft unique digital experiences. I work with free and open-source tools. I\'m passionate about building and sharing knowledge with the community.',
    'hero.cta.projects': 'See projects',
    'hero.cta.cv':       'Download CV',
    'hero.scroll':       '—  SCROLL TO CONTINUE —',

    'projects.label':    'PROJECT POKÉDEX',
    'projects.title':    'MY PROJECTS',
    'projects.subtitle': 'Sorted by area with direct links. I don\'t list everything — I pick what\'s most original, active, and complete.',

    'area.games.title': 'Video Games',
    'area.games.desc':  'Here I showcase my games: playable demo, repo, short video, and my specific contribution.',
    'area.web.title':   'Web Development',
    'area.web.desc':    'Products, landing pages, internal tools, dashboards, and interactive experiences.',
    'area.film.title':  'Film, Animation & Post-Production',
    'area.film.desc':   'Editing, direction, scriptwriting, animation, and sound design. Short-form pieces with full process included.',

    'about.label':    'TRAINER CARD',
    'about.title':    'ABOUT ME',
    'about.subtitle': 'Why I\'m hireable and what I\'m looking for.',
    'about.card1.title': 'What makes me hireable',
    'about.card1.p1':    'I\'m a hybrid profile: I can build a web interface, program game mechanics, and finish an audiovisual piece with intention. That lets me communicate across different teams, turn ideas into reality, and deliver results end to end.',
    'about.card1.p2':    'I\'m looking for opportunities as a web developer, game dev, or hybrid profiles focused on interactive experiences. (Placeholder: describe my current goal in 1–2 sentences.)',
    'about.card2.title': 'My story (and my growth)',
    'about.card2.p1':    'My path blends constant learning and personal projects — every game and every website teaches me something new. I like showing the journey: what challenge I faced, how I measured it, and what I changed until I got it right.',
    'about.pill.web':          'Web Development',
    'about.pill.games':        'Video Games',
    'about.pill.film':         'Film / Animation',
    'about.pill.narrative':    'Narrative',
    'about.pill.optimization': 'Optimization',

    'social.label':       'LINK CABLE',
    'social.title':       'DIGITAL PRESENCE',
    'social.subtitle':    'GitHub and Itch.io first. Frequent commits and updated content.',
    'social.card1.title': 'GitHub + Itch.io (priority)',
    'social.card1.desc':  'This is where I centralize repos, builds, and project updates.',
    'social.card2.title': 'Other platforms',
    'social.card2.desc':  'I use these spaces to show process, short videos, and project progression.',
    'social.twitch':      'Twitch (optional)',
    'social.hackerrank':  'HackerRank (optional)',

    'contact.label':              'TRADE REQUEST',
    'contact.title':              'CONTACT',
    'contact.subtitle':           'Feel free to reach out — I\'ll reply as soon as possible. I keep this section always up to date.',
    'contact.card.title':         'Details',
    'contact.email.label':        'Email:',
    'contact.location.label':     'Location:',
    'contact.location.value':     'Bogotá, Colombia',
    'contact.availability.label': 'Availability:',
    'contact.availability.value': 'Freelance / Full-time / Remote',
    'contact.updated.label':      'Last updated:',

    'footer.made':  'MADE WITH',
    'footer.totop': 'Back to top',
  },
};

/* ============================================================
   LANGUAGE TOGGLE
   ============================================================ */
function initLangToggle() {
  const toggle = document.getElementById('lang-toggle');
  if (!toggle) return;

  const htmlEl = document.getElementById('html-root');

  const applyLang = (lang) => {
    const isEn = lang === 'en';
    document.body.classList.toggle('lang-en', isEn);
    if (htmlEl) htmlEl.setAttribute('lang', isEn ? 'en' : 'es');
    toggle.setAttribute('aria-label', isEn ? 'Switch to Spanish' : 'Cambiar a español');

    const dict = TRANSLATIONS[lang] || TRANSLATIONS.es;

    // Swap textContent for all tagged elements
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // Swap data-text attribute (glitch spans)
    document.querySelectorAll('[data-i18n-attr="data-text"]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.setAttribute('data-text', dict[key]);
      }
    });
  };

  applyLang(localStorage.getItem(LANG_STORAGE_KEY) || 'es');

  toggle.addEventListener('click', () => {
    const nextLang = document.body.classList.contains('lang-en') ? 'es' : 'en';
    applyLang(nextLang);
    localStorage.setItem(LANG_STORAGE_KEY, nextLang);
  });
}

function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const applyTheme = (theme) => {
    const dark = theme === 'dark';
    document.body.classList.toggle('dark', dark);
    toggle.setAttribute('aria-label', dark ? 'Cambiar a modo día' : 'Cambiar a modo noche');
  };

  applyTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'light');

  toggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  });
}

function initEnterKeyShortcut() {
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;

    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const isInteractive = target.matches('input, textarea, button, a, select, option') || target.isContentEditable;
    if (isInteractive) return;

    const projectsSection = document.getElementById('proyectos');
    if (!projectsSection) return;

    scrollToElementWithOffset(projectsSection);
  });
}

function initTrainerTime() {
  const timeEl = document.getElementById('tc-time');
  if (!timeEl) return;

  const renderAge = () => {
    const now = new Date();

    let years = now.getFullYear() - TRAINER_BIRTHDATE.getFullYear();
    let months = now.getMonth() - TRAINER_BIRTHDATE.getMonth();
    let days = now.getDate() - TRAINER_BIRTHDATE.getDate();

    if (days < 0) {
      months -= 1;
      const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += previousMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    timeEl.textContent = `${years} YEARS ${months} MONTHS ${days} DAYS`;
  };

  renderAge();
  setInterval(renderAge, 3_600_000);
}

function initFadeIn() {
  if (!('IntersectionObserver' in window)) return;

  const targets = qsa('.card, .project, .area-head, .section-head');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  targets.forEach((el) => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
}

function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.menu');
  if (!toggle || !menu) return;

  const setMenuState = (open) => {
    menu.classList.toggle('menu--open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('menu--open');
    setMenuState(!isOpen);
  });

  qsa('a', menu).forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('menu--open')) {
      setMenuState(false);
    }
  });
}

function initMouseCoords() {
  const coordsEl = document.getElementById('mouse-coords');
  if (!coordsEl) return;

  let x = 0;
  let y = 0;
  let scheduled = false;

  const render = () => {
    scheduled = false;
    coordsEl.textContent = `X: ${String(x).padStart(3, '0')} Y: ${String(y).padStart(3, '0')}`;
  };

  document.addEventListener('mousemove', (event) => {
    x = event.clientX;
    y = event.clientY;

    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(render);
  });
}

[
  updateFooterYear,
  initSmoothScroll,
  initActiveNav,
  initThemeToggle,
  initLangToggle,
  initEnterKeyShortcut,
  initTrainerTime,
  initFadeIn,
  initMobileMenu,
  initMouseCoords
].forEach((init) => init());
