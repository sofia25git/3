/* ══════════════════════════════════════════
   TRASTES · Luthería de Autor
   main.js — Animaciones GSAP + Lenis
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. Lenis smooth scroll ───────────── */
  let lenis;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isMobile && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  /* ── Registrar plugin ─────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════════
     SECCIÓN 1 · HERO — Entrada inicial
  ══════════════════════════════════════════ */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTl
    .to('.s1-eyebrow', { opacity: 1, y: 0, duration: 0.8, delay: 0.3 })
    .to('.s1-title',   { opacity: 1, y: 0, duration: 1.1 }, '-=0.5')
    .to('.s1-subtitle',{ opacity: 1, duration: 0.9 }, '-=0.6')
    .to('.s1-cta-wrap', { opacity: 1, duration: 0.7 }, '-=0.5')
    .to('.s1-right',   { opacity: 1, duration: 1.0 }, '-=0.9');

  /* Luz radial que sigue el cursor en el hero */
  const heroMask    = document.getElementById('heroMask');
  const lightFollow = document.getElementById('lightFollow');

  if (heroMask && lightFollow) {
    document.addEventListener('mousemove', (e) => {
      const rect = heroMask.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;

      lightFollow.style.background =
        `radial-gradient(circle 140px at ${x}% ${y}%, rgba(226,217,203,0.10) 0%, transparent 70%)`;
    });
  }

  /* ══════════════════════════════════════════
     SECCIÓN 2 · MANIFIESTO — Word reveal
  ══════════════════════════════════════════ */
  const manifestoSection = document.querySelector('.s2-manifesto');
  const manifestoWords   = document.querySelectorAll('#manifestoText span');

  if (manifestoSection && manifestoWords.length) {
    ScrollTrigger.create({
      trigger: manifestoSection,
      start: 'top top',
      end: `+=${window.innerHeight * 2}`,
      pin: true,
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;

        /* Cambio de fondo: espresso → burgundy → espresso */
        let bg;
        if (p < 0.4) {
          const t = p / 0.4;
          bg = lerpColor('#180906', '#540E20', easeInOut(t));
        } else {
          const t = (p - 0.4) / 0.6;
          bg = lerpColor('#540E20', '#180906', easeInOut(t));
        }
        manifestoSection.style.background = bg;

        /* Revelar palabras */
        const perWord = 1 / manifestoWords.length;
        manifestoWords.forEach((word, i) => {
          const threshold = i * perWord;
          const progress  = Math.min(Math.max((p - threshold) / (perWord * 3), 0), 1);
          word.style.opacity = 0.12 + progress * 0.88;
        });
      }
    });
  }

  /* ══════════════════════════════════════════
     SECCIÓN 3 · TONEWOODS — Galería horizontal
  ══════════════════════════════════════════ */
  gsap.matchMedia().add('(min-width: 769px)', () => {
    const track = document.getElementById('tonewoodsTrack');
    const section = document.querySelector('.s3-tonewoods');

    if (!track || !section) return;

    const getScrollAmount = () => -(track.scrollWidth - window.innerWidth);

    gsap.to(track, {
      x: getScrollAmount,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.abs(getScrollAmount())}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });
  });

  /* ══════════════════════════════════════════
     SECCIÓN 4 · EL ÁNGULO DEL ACERO
  ══════════════════════════════════════════ */
  const steelSection  = document.getElementById('steel');
  const customCursor  = document.getElementById('customCursor');
  const gougeGroup    = document.getElementById('gougeGroup');
  const shavingPath   = document.getElementById('shavingPath');
  const sp1 = document.getElementById('sp1');
  const sp2 = document.getElementById('sp2');
  const sp3 = document.getElementById('sp3');

  /* Cursor personalizado */
  let cursorActive = false;

  document.addEventListener('mousemove', (e) => {
    if (customCursor) {
      gsap.set(customCursor, { x: e.clientX, y: e.clientY });
    }
  });

  if (steelSection && customCursor) {
    steelSection.addEventListener('mouseenter', () => {
      customCursor.classList.add('active');
      document.body.style.cursor = 'none';
    });
    steelSection.addEventListener('mouseleave', () => {
      customCursor.classList.remove('active');
      document.body.style.cursor = 'none';
    });
  }

  /* Animación de gubia al scroll */
  if (gougeGroup && shavingPath) {
    ScrollTrigger.create({
      trigger: steelSection,
      start: 'top 60%',
      end: 'bottom 40%',
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;

        /* Mover gubia */
        const xOffset = p * 80;
        gsap.set(gougeGroup, { x: xOffset });

        /* Dibujar viruta */
        const dashOffset = 200 - (p * 200);
        if (shavingPath) shavingPath.style.strokeDashoffset = dashOffset;

        /* Partículas */
        if (p > 0.5) {
          const pp = (p - 0.5) / 0.5;
          if (sp1) gsap.set(sp1, { opacity: pp * 0.7, x: pp * 15, y: -pp * 10 });
          if (sp2) gsap.set(sp2, { opacity: pp * 0.5, x: pp * 25, y: -pp * 18 });
          if (sp3) gsap.set(sp3, { opacity: pp * 0.6, x: pp * 10, y: -pp * 8 });
        }
      }
    });
  }

  /* ══════════════════════════════════════════
     SECCIÓN 5 · SERVICIOS — Hold to reveal
  ══════════════════════════════════════════ */
  const HOLD_DURATION = 1500; // ms
  const serviceItems  = document.querySelectorAll('.s5-item');

  serviceItems.forEach((item) => {
    const holdRing    = item.querySelector('.s5-hold-ring');
    const progress    = item.querySelector('.s5-ring-progress');
    const revealId    = 'reveal-' + item.dataset.service;
    const revealEl    = document.getElementById(revealId);

    if (!holdRing || !progress || !revealEl) return;

    const circumference = 163; // stroke-dasharray del SVG
    let holdTimer   = null;
    let startTime   = null;
    let rafId       = null;
    let isRevealed  = revealEl.classList.contains('open');

    const updateRing = (elapsed) => {
      const pct = Math.min(elapsed / HOLD_DURATION, 1);
      progress.style.strokeDashoffset = circumference * (1 - pct);
    };

    const resetRing = () => {
      cancelAnimationFrame(rafId);
      clearTimeout(holdTimer);
      startTime = null;
      progress.style.strokeDashoffset = circumference;
      progress.style.transition = 'stroke-dashoffset 0.3s ease';
    };

    const startHold = () => {
      if (isRevealed) return;
      progress.style.transition = 'none';
      startTime = performance.now();

      const animate = (now) => {
        const elapsed = now - startTime;
        updateRing(elapsed);
        if (elapsed < HOLD_DURATION) {
          rafId = requestAnimationFrame(animate);
        }
      };
      rafId = requestAnimationFrame(animate);

      holdTimer = setTimeout(() => {
        revealEl.classList.add('open');
        isRevealed = true;
        resetRing();
      }, HOLD_DURATION);
    };

    const endHold = () => {
      if (isRevealed) return;
      resetRing();
    };

    holdRing.addEventListener('mousedown',   startHold);
    holdRing.addEventListener('touchstart',  startHold, { passive: true });
    holdRing.addEventListener('mouseup',     endHold);
    holdRing.addEventListener('mouseleave',  endHold);
    holdRing.addEventListener('touchend',    endHold);
    holdRing.addEventListener('touchcancel', endHold);
  });

  /* ══════════════════════════════════════════
     SECCIÓN 6 · RELIQUIAS — Stacked cards
  ══════════════════════════════════════════ */
  gsap.matchMedia().add('(min-width: 769px)', () => {
    const stack  = document.getElementById('relicsStack');
    const card1  = document.getElementById('rcard1');
    const card2  = document.getElementById('rcard2');
    const card3  = document.getElementById('rcard3');

    if (!stack || !card1 || !card2 || !card3) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stack,
        start: 'top 50%',
        end: `+=${window.innerHeight * 1.5}`,
        scrub: 1.2,
      }
    });

    /* Carta 1 sale hacia arriba-izquierda con leve rotación */
    tl.to(card1, {
      y: '-110%',
      x: '-8%',
      rotation: -4,
      opacity: 0,
      ease: 'power2.inOut',
      duration: 0.4,
    }, 0);

    /* Carta 2 asciende a primer plano */
    tl.to(card2, {
      x: 0,
      y: 0,
      rotation: 0,
      ease: 'power2.inOut',
      duration: 0.4,
    }, 0);

    tl.to(card2, {
      y: '-110%',
      x: '-8%',
      rotation: -4,
      opacity: 0,
      ease: 'power2.inOut',
      duration: 0.4,
    }, 0.5);

    /* Carta 3 asciende a primer plano */
    tl.to(card3, {
      x: 0,
      y: 0,
      rotation: 0,
      ease: 'power2.inOut',
      duration: 0.4,
    }, 0.5);
  });

  /* ══════════════════════════════════════════
     SECCIÓN 7 · TIMELINE — Anillo descendente
  ══════════════════════════════════════════ */
  const timelineSection = document.getElementById('timeline');
  const timelineRing    = document.getElementById('timelineRing');
  const steps           = document.querySelectorAll('.s7-step');
  const stepDots        = document.querySelectorAll('.s7-step-dot');

  if (timelineSection && timelineRing && steps.length) {
    const lineWrap = document.querySelector('.s7-line-wrap');
    const lineEl   = document.querySelector('.s7-line');

    ScrollTrigger.create({
      trigger: timelineSection,
      start: 'top 60%',
      end: 'bottom 60%',
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;

        /* Mover anillo a lo largo de la línea */
        if (lineEl) {
          const lineH = lineEl.offsetHeight;
          const top   = 48 + p * (lineH - 16);
          timelineRing.style.top = top + 'px';
        }

        /* Iluminar pasos según progreso */
        steps.forEach((step, i) => {
          const threshold = (i + 0.5) / steps.length;
          if (p >= threshold) {
            step.classList.add('lit');
          } else {
            step.classList.remove('lit');
          }
        });
      }
    });
  }

  /* ══════════════════════════════════════════
     SECCIÓN 8 · FORMULARIO — Sellado
  ══════════════════════════════════════════ */
  const submitBtn  = document.getElementById('submitBtn');
  const formWrap   = document.getElementById('admissionForm');
  const sealState  = document.getElementById('sealState');

  if (submitBtn && formWrap && sealState) {
    submitBtn.addEventListener('click', () => {
      const name        = document.getElementById('musicianName')?.value.trim();
      const declaration = document.getElementById('declaration')?.value.trim();
      const philosophy  = document.getElementById('philosophy')?.value.trim();

      if (!name || !declaration || !philosophy) {
        /* Shake suave en campos vacíos */
        const emptyFields = [];
        if (!name)        emptyFields.push(document.getElementById('musicianName'));
        if (!declaration) emptyFields.push(document.getElementById('declaration'));
        if (!philosophy)  emptyFields.push(document.getElementById('philosophy'));

        emptyFields.forEach((f) => {
          if (f) {
            gsap.fromTo(f,
              { x: -8 },
              { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)',
                repeat: 1, yoyo: true }
            );
          }
        });
        return;
      }

      /* Animación de sellado */
      submitBtn.disabled = true;

      gsap.to(formWrap, {
        opacity: 0,
        y: -20,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          formWrap.style.display = 'none';
          sealState.classList.add('visible');
        }
      });
    });
  }

  /* ══════════════════════════════════════════
     FADE-IN general de secciones
  ══════════════════════════════════════════ */
  const fadeTargets = [
    '.s2-eyebrow',
    '.s4-label-wrap',
    '.s4-svg-scene',
    '.s4-data',
    '.s5-header',
    '.s6-header',
    '.s7-steps',
    '.s8-eyebrow',
    '.s8-title',
    '.s8-sub',
    '.s8-form-wrap',
  ];

  fadeTargets.forEach((selector) => {
    const els = document.querySelectorAll(selector);
    els.forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        }
      });
    });
  });

  /* Aparición individual de items de servicios */
  document.querySelectorAll('.s5-item').forEach((item, i) => {
    gsap.from(item, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        toggleActions: 'play none none none',
      }
    });
  });

  /* ── Helpers ────────────────────────────── */
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function lerpColor(a, b, t) {
    const ah = parseInt(a.replace('#', ''), 16);
    const bh = parseInt(b.replace('#', ''), 16);
    const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab_ = ah & 0xff;
    const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb  = bh & 0xff;
    const rr = Math.round(ar + (br - ar) * t);
    const rg = Math.round(ag + (bg - ag) * t);
    const rb = Math.round(ab_ + (bb - ab_) * t);
    return `rgb(${rr},${rg},${rb})`;
  }

});
