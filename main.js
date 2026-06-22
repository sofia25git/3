/* ══════════════════════════════════════════
   TRASTES · Escuela de Luthería
   main.js
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  /* ── 1. NAV: se opacifica al hacer scroll ── */
  const nav = document.getElementById('mainNav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      nav.style.borderBottomColor = 'rgba(12,5,3,0.18)';
    } else {
      nav.style.borderBottomColor = 'rgba(12,5,3,0.12)';
    }
    lastY = y;
  }, { passive: true });

  /* ── 2. HERO: entrada animada ─────────────── */
  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .to('.s1-title',   { opacity: 1, y: 0, duration: 1.2, delay: 0.2 })
    .to('.s1-sub',     { opacity: 1, duration: 0.9 }, '-=0.6')
    .to('.s1-cta',     { opacity: 1, duration: 0.7 }, '-=0.5');

  /* ── 3. Fade-in general de secciones ───────── */
  const fadeEls = document.querySelectorAll(
    '.s2-left, .s2-img-main, .s2-body, ' +
    '.s3-stat, ' +
    '.s4-header, .s4-item, ' +
    '.s6-header, .s6-mod, ' +
    '.s8-left, .s8-right, ' +
    '.s9-card, ' +
    '.s10-header, .s10-cell, ' +
    '.s11-left, .faq-item, ' +
    '.s13-left, .s13-right'
  );

  fadeEls.forEach((el, i) => {
    gsap.from(el, {
      opacity: 0,
      y: 28,
      duration: 0.85,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      }
    });
  });

  /* ── 4. Métricas: contador animado ─────────── */
  document.querySelectorAll('.s3-num').forEach((el) => {
    const raw    = el.textContent.trim();           // e.g. "+340"
    const prefix = raw.startsWith('+') ? '+' : '';
    const num    = parseFloat(raw.replace(/[^0-9.]/g, ''));
    const suffix = raw.replace(/[+\d.]/g, '');      // unidades como "k", vacío

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        let start = 0;
        const duration = 1400;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3);
          const current  = Math.round(eased * num);
          el.textContent = prefix + current.toLocaleString('es-AR') + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    });
  });

  /* ── 5. FAQ acordeón ──────────────────────── */
  document.querySelectorAll('.faq-q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item    = btn.closest('.faq-item');
      const isOpen  = item.classList.contains('open');

      // Cerrar todos
      document.querySelectorAll('.faq-item.open').forEach((el) => {
        el.classList.remove('open');
        el.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      // Abrir el clickeado si estaba cerrado
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ── 6. Servicios: acordeón ───────────────── */
  document.querySelectorAll('.s5-svc .s5-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const svc    = btn.closest('.s5-svc');
      const isOpen = svc.classList.contains('open');

      document.querySelectorAll('.s5-svc.open').forEach((el) => {
        el.classList.remove('open');
        el.querySelector('.s5-toggle').setAttribute('aria-expanded', 'false');
        el.querySelector('.s5-toggle').textContent = '+';
      });

      if (!isOpen) {
        svc.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = '−';
      }
    });
  });

  /* ── 7. Formulario de entrevista ─────────── */
  const submitBtn = document.getElementById('submitBtn');
  const formEl    = document.getElementById('admissionForm');
  const sentEl    = document.getElementById('sentState');

  if (submitBtn && formEl && sentEl) {
    submitBtn.addEventListener('click', () => {
      const nombre      = document.getElementById('nombre')?.value.trim();
      const email       = document.getElementById('email')?.value.trim();
      const motivo      = document.getElementById('motivo')?.value.trim();
      const experiencia = document.getElementById('experiencia')?.value.trim();

      // Validar campos requeridos
      const required = [
        document.getElementById('nombre'),
        document.getElementById('email'),
        document.getElementById('motivo'),
      ];
      let valid = true;
      required.forEach((f) => {
        if (!f?.value.trim()) {
          valid = false;
          // Shake suave
          f.style.borderBottomColor = '#8B2020';
          f.addEventListener('input', () => {
            f.style.borderBottomColor = '';
          }, { once: true });
        }
      });
      if (!valid) return;

      // Validar email básico
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const ef = document.getElementById('email');
        ef.style.borderBottomColor = '#8B2020';
        return;
      }

      submitBtn.disabled = true;

      gsap.to(formEl, {
        opacity: 0,
        y: -16,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          formEl.style.display = 'none';
          sentEl.classList.add('visible');
        }
      });
    });
  }

  /* ── 8. Líneas de S5 / S7: aparición escalonada */
  ['#experiencia .s5-lines p', '#luthiers .s7-reasons p'].forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      gsap.from(el, {
        opacity: 0,
        x: -16,
        duration: 0.7,
        delay: i * 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        }
      });
    });
  });

  /* ── 9. Parallax suave en imágenes oscuras ─ */
  document.querySelectorAll('.s5-bg-svg, .s7-bg, .s12-bg').forEach((el) => {
    gsap.to(el, {
      yPercent: -8,
      ease: 'none',
      scrollTrigger: {
        trigger: el.closest('section, div'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });

});
