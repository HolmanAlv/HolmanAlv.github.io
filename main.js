/* ============================================================
   HOLMAN.EXE — main.js
   Funcionalidades del portafolio desacopladas del HTML
   ============================================================ */

'use strict';

const NAVBAR_HEIGHT = 72;
const ACTIVE_SECTION_OFFSET = 120;
const THEME_STORAGE_KEY = 'theme';
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
  initEnterKeyShortcut,
  initTrainerTime,
  initFadeIn,
  initMobileMenu,
  initMouseCoords
].forEach((init) => init());
