/* ============================================================
   TRASTES — Escuela de Luthería
   js/curso-guitarra.js
   ────────────────────────────────────────────────────────────
   Comportamiento EXCLUSIVO de la página de detalle del curso.

   Todo lo que ya resuelve js/main.js a nivel sitio (cursor
   personalizado, loader, apertura/cierre del mobile menu,
   scroll suave) se reutiliza tal cual: este archivo no vuelve
   a implementarlo. Acá solo viven dos cosas:

     1. Lightbox de la galería del taller (sección 05).
     2. Un refuerzo defensivo para el efecto de header claro/oscuro
        y las animaciones "reveal", por si la lógica de main.js
        está atada a selectores específicos de index.html. Si
        main.js ya lo resuelve, este bloque no hace nada extra
        (usa las mismas clases y es idempotente).
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. LIGHTBOX — Galería del taller
     Al hacer click en cualquier imagen de .workshop-gallery__item
     se abre en grande sobre un fondo oscuro. Se cierra con el
     botón, con click afuera o con la tecla Escape.
     ============================================================ */
  const galleryItems   = document.querySelectorAll('.workshop-gallery__item');
  const lightbox        = document.getElementById('gallery-lightbox');
  const lightboxImg     = document.getElementById('gallery-lightbox-img');
  const lightboxClose   = document.getElementById('gallery-lightbox-close');

  function openLightbox(imgEl) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  galleryItems.forEach((item) => {
    const img = item.querySelector('img');
    if (!img) return;

    // Accesible por click y por teclado
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Ampliar imagen: ' + (img.alt || 'foto del taller'));

    item.addEventListener('click', () => openLightbox(img));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(img);
      }
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });


  /* ============================================================
     2. REFUERZO DEFENSIVO — header e ingreso de secciones
     ============================================================ */

  const header = document.getElementById('site-header');
  const heroEl = document.querySelector('.hero');

  // 2a. Header claro/oscuro + compacto al hacer scroll.
  // Mientras el hero (foto dominante) está a la vista, el header
  // usa texto claro para contrastar con la foto (igual que en
  // Home). Al pasar el hero, se vuelve "is-light" (texto oscuro
  // sobre fondo beige), igual que en el resto del sitio.
  if (header && heroEl) {
    const onScroll = () => {
      const heroBottom = heroEl.getBoundingClientRect().bottom;
      const pastHero = heroBottom <= 80; // 80px ~ alto aproximado del header

      header.classList.toggle('is-light', pastHero);
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    // No pisa nada si main.js ya está escuchando el mismo evento:
    // ambos listeners aplican el mismo resultado a las mismas clases.
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 2b. Animaciones "reveal-up" / "reveal-hero".
  // Si por alguna razón main.js no observa estos elementos en esta
  // página, este observer asegura que el contenido igual aparezca
  // (sin animación) y no quede invisible. Si main.js ya lo hace,
  // agregar la misma clase dos veces no tiene ningún efecto extra.
  const revealTargets = document.querySelectorAll('.reveal-up, .reveal-hero');
  if (revealTargets.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el) => io.observe(el));
  }

});
