/* ============================================================
   HOLMAN.EXE — main.js
   Funcionalidades del portafolio desacopladas del HTML
   ============================================================ */

'use strict';

// ── 1. Año dinámico en el footer ────────────────────────────
(function updateFooterYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
})();

// ── 2. Smooth scroll para todos los enlaces internos ────────
(function initSmoothScroll() {
  const NAVBAR_H = 72; // altura del navbar fijo en px

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const offsetTop = target.getBoundingClientRect().top + window.scrollY - NAVBAR_H;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });

      // Actualiza la URL sin salto abrupto
      history.pushState(null, '', targetId);
    });
  });
})();

// ── 3. Marcar enlace activo en navbar según sección visible ─
(function initActiveNav() {
  const sections  = Array.from(document.querySelectorAll('header[id], section[id]'));
  const navLinks  = document.querySelectorAll('.menu ul li a');
  const OFFSET    = 120;

  function activate() {
    const scrollY = window.scrollY + OFFSET;

    let current = sections[0];
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) current = sec;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current.id}`);
    });
  }

  window.addEventListener('scroll', activate, { passive: true });
  activate();
})();

// ── 4. Toggle Día / Noche ────────────────────────────────────
(function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      toggle.setAttribute('aria-label', 'Cambiar a modo día');
    } else {
      document.body.classList.remove('dark');
      toggle.setAttribute('aria-label', 'Cambiar a modo noche');
    }
  }

  // Cargar preferencia guardada; por defecto: 'light'
  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);

  toggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    const next   = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', next);
    toggle.setAttribute('aria-label', isDark ? 'Cambiar a modo día' : 'Cambiar a modo noche');
  });
})();

// ── 5. Tecla Enter → scroll a proyectos (como videojuego) ───
(function initEnterKey() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.target.matches('input, textarea, button, a')) {
      const proyectos = document.getElementById('proyectos');
      if (proyectos) {
        const offsetTop = proyectos.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      }
    }
  });
})();

// ── 5b. Tiempo transcurrido desde nacimiento (13 Feb 2003) ──
(function initTrainerTime() {
  const el = document.getElementById('tc-time');
  if (!el) return;

  const BIRTH = new Date(2003, 1, 13); // Mes 0-indexado: 1 = febrero

  function calcAge() {
    const now = new Date();
    let years  = now.getFullYear() - BIRTH.getFullYear();
    let months = now.getMonth()    - BIRTH.getMonth();
    let days   = now.getDate()     - BIRTH.getDate();

    if (days < 0) {
      months--;
      // días del mes anterior
      const prev = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prev.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    el.textContent = `${years} YEARS ${months} MONTHS ${days} DAYS`;
  }

  calcAge();
  // actualiza cada hora por si acaso la página queda abierta
  setInterval(calcAge, 3_600_000);
})();

// ── 6. Animación de entrada con IntersectionObserver ─────────
(function initFadeIn() {
  if (!('IntersectionObserver' in window)) return;

  const targets = document.querySelectorAll('.card, .project, .area-head, .section-head');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
  });
})();

// ── 7. Menú móvil (hamburger toggle) ────────────────────────
(function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu   = document.querySelector('.menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('menu--open');
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? '✕' : '☰';
  });

  // Cerrar al hacer clic en un enlace
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('menu--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    });
  });
})();
