/* ============================================================
   TRASTES — Escuela de Luthería
   js/main.js — Versión editorial premium v3
   ────────────────────────────────────────────────────────────
   CAMBIOS RESPECTO A LA VERSIÓN ANTERIOR:
     · 04. initTitleAnimation → ELIMINADO (ya no hay animación
           letra por letra; el título usa reveal-hero simple)
     · 05. revealHeroElements → SIMPLIFICADO (solo activa
           .reveal-hero, sin split de caracteres)
     · 06. Header → CONSERVADO (lógica is-light/is-scrolled
           sigue igual; el hero ahora es claro así que el
           header empieza con look oscuro y cambia al salir)
     · 08. Parallax → ADAPTADO al nuevo hero dividido
           (mueve .hero__photo-img en lugar de hero__bg-img)
   CONSERVADO SIN CAMBIOS:
     01. Mobile VH fix
     02. Cursor personalizado
     03. Loader con contador
     07. Mobile menu
     09. Scroll reveal (.reveal-up)
     10. FAQ acordeón
     11. Formulario de admisión
     12. Proceso — focus teclado
     13. Smooth scroll con offset
     14. Timeline drag
     15. Material swatches
   ============================================================ */

'use strict';


/* ============================================================
   01. MOBILE VH FIX
   Corrige el 100vh en browsers móviles.
   ============================================================ */

(function fixMobileVh() {
  function setVh() {
    document.documentElement.style.setProperty(
      '--vh', (window.innerHeight * 0.01) + 'px'
    );
  }
  setVh();
  window.addEventListener('resize', setVh, { passive: true });
})();


/* ============================================================
   02. CURSOR PERSONALIZADO
   Dot inmediato + ring con lerp suave.
   Desactivado en touch/mobile.
   ============================================================ */

(function initCustomCursor() {

  const isTouch = window.matchMedia('(pointer: coarse)').matches
    || ('ontouchstart' in window);

  if (isTouch) {
    document.body.classList.add('no-custom-cursor');
    const cursorEl = document.getElementById('cursor');
    if (cursorEl) cursorEl.style.display = 'none';
    return;
  }

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = -100, mouseY = -100;
  let ringX  = -100, ringY  = -100;
  const LERP = 0.12;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  (function animateRing() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  })();

  /* Hover sobre elementos interactivos — agranda el ring */
  const interactiveSelectors = [
    'a', 'button', '.material-card__swatch',
    '.faq__question', '.course-block__link',
    '.timeline__node', '.process__step',
    '.benefit-card', 'label', 'input', 'textarea', 'select'
  ].join(', ');

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(interactiveSelectors)) {
      document.body.classList.remove('cursor-hover');
    }
  });

  /* Cursor sobre el hero (que ahora tiene fondo beige claro) */
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    heroEl.addEventListener('mouseenter', function () {
      document.body.classList.add('cursor-hero');
    });
    heroEl.addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-hero');
    });
  }

})();


/* ============================================================
   03. LOADER CON CONTADOR ANIMADO
   Progreso 0→100 con easing, luego dispara el hero reveal.
   ============================================================ */

(function initLoader() {

  const loader  = document.getElementById('loader');
  const bar     = document.getElementById('loader-progress-bar');
  const counter = document.getElementById('loader-counter');
  if (!loader) return;

  const DURATION = 1800;
  const MIN_SHOW = 2000;
  const startTime = Date.now();
  let rafId;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateProgress() {
    const elapsed = Date.now() - startTime;
    const t       = Math.min(elapsed / DURATION, 1);
    const progress = easeOutCubic(t) * 100;

    if (bar)     bar.style.width     = progress.toFixed(1) + '%';
    if (counter) counter.textContent = Math.floor(progress);

    if (t < 1) {
      rafId = requestAnimationFrame(animateProgress);
    }
  }

  rafId = requestAnimationFrame(animateProgress);

  function hideLoader() {
    const elapsed   = Date.now() - startTime;
    const remaining = Math.max(0, MIN_SHOW - elapsed);

    setTimeout(function () {
      cancelAnimationFrame(rafId);
      if (bar)     bar.style.width     = '100%';
      if (counter) counter.textContent = '100';

      setTimeout(function () {
        loader.classList.add('is-hidden');

        loader.addEventListener('transitionend', function () {
          loader.remove();
          /* Disparar animaciones del hero al terminar el loader */
          revealHeroElements();
        }, { once: true });

      }, 180);
    }, remaining);
  }

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
  }

})();


/* ============================================================
   04. HERO REVEAL
   Activa todos los .reveal-hero con un stagger controlado
   por la variable CSS --hd (hero-delay) que cada elemento
   declara en su atributo style inline.
   NOTA: la animación letra por letra fue eliminada. El título
   ahora usa el mismo fade+translateY que los demás elementos.
   ============================================================ */

function revealHeroElements() {
  const heroReveals = document.querySelectorAll('.reveal-hero');
  heroReveals.forEach(function (el) {
    /* Un pequeño rAF garantiza que el navegador haya pintado
       el hero antes de activar las transiciones */
    requestAnimationFrame(function () {
      el.classList.add('is-visible');
    });
  });
}


/* ============================================================
   05. HEADER — SCROLL + LUZ/OSCURO
   Mientras el hero (claro, beige) es visible → header oscuro
   translúcido para contrastar con la foto.
   Al salir del hero → header beige (.is-light).
   ============================================================ */

(function initHeader() {

  const header = document.getElementById('site-header');
  const hero   = document.getElementById('hero');
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    if (!hero) {
      header.classList.add('is-scrolled', 'is-light');
      ticking = false;
      return;
    }

    const heroBottom = hero.getBoundingClientRect().bottom;

    if (heroBottom > 0) {
      /* Dentro del hero — fondo oscuro para contrastar con la foto */
      header.classList.remove('is-light');
      /* Solo agregar is-scrolled si ya hay algo de scroll
         para no mostrar el fondo desde el inicio */
  if (heroBottom > 0) {
  header.classList.add('in-hero');
  header.classList.remove('is-light');
} else {
  header.classList.remove('in-hero');
  header.classList.add('is-light','is-scrolled');
}
    } else {
      /* Fuera del hero — header beige con blur */
      header.classList.add('is-scrolled', 'is-light');
    }

    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });
header.classList.add('is-light');
  updateHeader();

})();


/* ============================================================
   06. MOBILE MENU — CLIP-PATH
   Alterna el panel con animación circular desde el botón.
   ============================================================ */

(function initMobileMenu() {

  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeBtn     = document.getElementById('mobile-menu-close');
  const menu         = document.getElementById('mobile-menu');
  if (!hamburgerBtn || !menu) return;

  const menuLinks = menu.querySelectorAll('.mobile-menu__link');
  let   isOpen    = false;

  function openMenu() {
    isOpen = true;
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburgerBtn.addEventListener('click', function () {
    isOpen ? closeMenu() : openMenu();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  menuLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
      hamburgerBtn.focus();
    }
  });

})();


/* ============================================================
   07. PARALLAX — FOTO DEL HERO
   Mueve la imagen de la columna foto (.hero__photo-img)
   a menor velocidad que la página.
   ADAPTADO: ahora apunta a .hero__photo-img (antes era
   .hero__bg-img del hero de pantalla completa).
   Se desactiva bajo 768px para no afectar el layout mobile.
   ============================================================ */

(function initHeroParallax() {

  const heroImg = document.getElementById('hero-parallax-img');
  if (!heroImg) return;

  const BREAKPOINT = 768;
  const SPEED      = 0.22; /* 0 = sin movimiento, 0.5 = intenso */
  let   ticking    = false;

  function updateParallax() {
    if (window.innerWidth < BREAKPOINT) {
      heroImg.style.transform = 'scale(1.06) translateY(0)';
      ticking = false;
      return;
    }

    const scrollY = window.scrollY;
    const offsetY = scrollY * SPEED;
    heroImg.style.transform = 'scale(1.06) translateY(' + offsetY + 'px)';
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
updateParallax();
})();


/* ============================================================
   08. SCROLL REVEAL — .reveal-up
   Intersection Observer para todas las secciones de contenido.
   CONSERVADO SIN CAMBIOS.
   ============================================================ */

(function initScrollReveal() {

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal-up').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  const revealElements = document.querySelectorAll('.reveal-up');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, {
    root:       null,
  rootMargin: '0px 0px 100px 0px',
threshold: 0
  });

  revealElements.forEach(function (el) {
    observer.observe(el);
  });

})();


/* ============================================================
   09. FAQ ACORDEÓN
   CONSERVADO SIN CAMBIOS.
   ============================================================ */

(function initFaqAccordion() {

  const faqItems = document.querySelectorAll('.faq__item');
  if (!faqItems.length) return;

  faqItems.forEach(function (item) {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      /* Cerrar todos los demás */
      faqItems.forEach(function (other) {
        const otherBtn    = other.querySelector('.faq__question');
        const otherAnswer = other.querySelector('.faq__answer');
        if (otherBtn && otherAnswer && other !== item) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.classList.remove('is-open');
          otherAnswer.style.maxHeight = '';
        }
      });

      /* Alternar el actual */
      if (isExpanded) {
        btn.setAttribute('aria-expanded', 'false');
        answer.classList.remove('is-open');
        answer.style.maxHeight = '';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('is-open');
        const innerHeight = answer.querySelector('.faq__answer-inner').scrollHeight;
        answer.style.maxHeight = (innerHeight + 40) + 'px';
      }
    });
  });

})();


/* ============================================================
   10. FORMULARIO DE ADMISIÓN
   CONSERVADO SIN CAMBIOS.
   ============================================================ */

(function initAdmissionForm() {

  const form         = document.getElementById('admission-form');
  const submitBtn    = document.getElementById('submit-btn');
  const successPanel = document.getElementById('admission-success');
  if (!form || !submitBtn || !successPanel) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    setTimeout(function () {
      form.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      form.style.opacity    = '0';
      form.style.transform  = 'translateY(-10px)';

      setTimeout(function () {
        form.style.display = 'none';
        successPanel.setAttribute('aria-hidden', 'false');
        successPanel.classList.add('is-visible');
      }, 400);
    }, 1800);
  });

  /* Select: marcar que tiene valor seleccionado */
  const selects = form.querySelectorAll('select.field__input');
  selects.forEach(function (sel) {
    sel.addEventListener('change', function () {
      if (sel.value) {
        sel.setAttribute('data-has-value', 'true');
      } else {
        sel.removeAttribute('data-has-value');
      }
    });
  });

})();


/* ============================================================
   11. PROCESO — FOCUS POR TECLADO
   CONSERVADO SIN CAMBIOS.
   ============================================================ */

(function initProcessSteps() {

  const steps = document.querySelectorAll('.process__step');
  if (!steps.length) return;

  steps.forEach(function (step) {
    step.setAttribute('tabindex', '0');

    step.addEventListener('focus', function () {
      step.classList.add('is-focused');
    });

    step.addEventListener('blur', function () {
      step.classList.remove('is-focused');
    });
  });

})();


/* ============================================================
   12. SMOOTH SCROLL CON OFFSET
   CONSERVADO SIN CAMBIOS.
   ============================================================ */

(function initSmoothScroll() {

  const HEADER_OFFSET = 90;

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const targetTop = target.getBoundingClientRect().top
        + window.scrollY
        - HEADER_OFFSET;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

})();


/* ============================================================
   13. TIMELINE DRAG
   Arrastre horizontal con mouse en desktop.
   CONSERVADO SIN CAMBIOS.
   ============================================================ */

(function initTimelineDrag() {

  const trackWrap = document.querySelector('.timeline__track-wrap');
  if (!trackWrap) return;

  let isDown     = false;
  let startX     = 0;
  let scrollLeft = 0;

  trackWrap.addEventListener('mousedown', function (e) {
    isDown     = true;
    startX     = e.pageX - trackWrap.offsetLeft;
    scrollLeft = trackWrap.scrollLeft;
    trackWrap.style.cursor     = 'grabbing';
    trackWrap.style.userSelect = 'none';
  });

  trackWrap.addEventListener('mouseleave', function () {
    isDown                     = false;
    trackWrap.style.cursor     = '';
    trackWrap.style.userSelect = '';
  });

  trackWrap.addEventListener('mouseup', function () {
    isDown                     = false;
    trackWrap.style.cursor     = '';
    trackWrap.style.userSelect = '';
  });

  trackWrap.addEventListener('mousemove', function (e) {
    if (!isDown) return;
    e.preventDefault();
    const x    = e.pageX - trackWrap.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackWrap.scrollLeft = scrollLeft - walk;
  });

})();


/* ============================================================
   14. MATERIAL SWATCHES — ACCESIBILIDAD
   CONSERVADO SIN CAMBIOS.
   ============================================================ */

(function initMaterialSwatches() {

  const swatches = document.querySelectorAll('.material-card__swatch');
  if (!swatches.length) return;

  const swatchData = {
    'material-card__swatch--abeto':     { name: 'Picea abies',        note: 'Densidad: 420–480 kg/m³'   },
    'material-card__swatch--jacaranda': { name: 'Dalbergia nigra',    note: 'Densidad: 850–950 kg/m³'   },
    'material-card__swatch--ebano':     { name: 'Diospyros celebica', note: 'Densidad: 1050–1200 kg/m³' }
  };

  swatches.forEach(function (swatch) {
    const inner = swatch.querySelector('.material-card__swatch-inner');
    if (!inner) return;

    const swatchClass = Array.from(inner.classList)
      .find(function (cls) { return cls.startsWith('material-card__swatch--'); });

    const data = swatchData[swatchClass];
    if (!data) return;

    swatch.setAttribute('title',    data.name + ' — ' + data.note);
    swatch.setAttribute('role',     'button');
    swatch.setAttribute('tabindex', '0');

    swatch.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        swatch.click();
      }
    });
  });

})();
/* ============================================================
   MANIFIESTO — REVELADO POR SCROLL
   ============================================================ */

(function initManifestoScrollWriting() {

  const manifesto = document.querySelector('.js-manifesto');
  if (!manifesto) return;

  const originalText = manifesto.innerHTML;

  const temp = document.createElement('div');
  temp.innerHTML = originalText;

  function wrapWords(node) {

    if (node.nodeType === 3) {

      const words = node.textContent.split(/(\s+)/);

      const fragment = document.createDocumentFragment();

      words.forEach(function(word){

        if (word.trim() === '') {
          fragment.appendChild(document.createTextNode(word));
        } else {
          const span = document.createElement('span');
          span.className = 'word';
          span.textContent = word;
          fragment.appendChild(span);
        }

      });

      node.parentNode.replaceChild(fragment,node);

    }

    else if (node.nodeType === 1) {
      Array.from(node.childNodes).forEach(wrapWords);
    }
  }

  Array.from(temp.childNodes).forEach(wrapWords);

  manifesto.innerHTML = temp.innerHTML;

  const words = manifesto.querySelectorAll('.word');

  function updateWords() {

    const rect = manifesto.getBoundingClientRect();

    const start = window.innerHeight * 0.85;
    const end   = window.innerHeight * 0.20;

    let progress =
      (start - rect.top) /
      (start - end);

    progress = Math.max(0, Math.min(1, progress));

    const visibleCount =
      Math.floor(progress * words.length);

    words.forEach(function(word,index){

      if(index <= visibleCount){
        word.classList.add('visible');
      } else {
        word.classList.remove('visible');
      }

    });

  }

  updateWords();

  window.addEventListener('scroll', updateWords, {
    passive:true
  });

})();

/* ============================================================
   FIN DE main.js — TRASTES v3
   ============================================================ */
