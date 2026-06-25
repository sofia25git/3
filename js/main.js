/* ══════════════════════════════════════════════════════════
   TRASTES · Escuela de Luthería
   main.js — Vanilla JS puro, sin dependencias externas
   Módulos: Loader · Nav · Parallax hero · Reveal · FAQ · Form
══════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────
   1. LOADER
   Barra de progreso animada → oculta el loader al 100%
────────────────────────────────────────────────── */
(function initLoader() {
  const loader = document.getElementById('loader');
  const fill   = document.getElementById('loaderFill');
  if (!loader || !fill) return;

  /* Bloquea el scroll mientras carga */
  document.body.style.overflow = 'hidden';

  let pct = 0;
  const tick = setInterval(() => {
    pct += Math.random() * 20;
    if (pct >= 100) {
      pct = 100;
      clearInterval(tick);
      fill.style.width = '100%';
      setTimeout(() => {
        loader.classList.add('out');
        document.body.style.overflow = '';
      }, 380);
    }
    fill.style.width = pct + '%';
  }, 75);
})();


/* ──────────────────────────────────────────────────
   2. NAVEGACIÓN
   · Clase .scrolled al hacer scroll
   · Hamburguesa mobile con panel pantalla completa
   · Cerrar panel al clickear links
────────────────────────────────────────────────── */
(function initNav() {
  const nav    = document.getElementById('mainNav');
  const burger = document.getElementById('navBurger');
  const panel  = document.getElementById('mobilePanel');
  const links  = document.querySelectorAll('.mob-link');

  if (!nav) return;

  /* Scroll → .scrolled */
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  /* Toggle hamburguesa */
  if (burger && panel) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    /* Cerrar al navegar */
    links.forEach(l => l.addEventListener('click', () => {
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      panel.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }
})();


/* ──────────────────────────────────────────────────
   3. PARALLAX HERO (nativo, sin librerías)
   La foto de fondo se mueve más lento que el scroll
   → efecto de profundidad real
────────────────────────────────────────────────── */
(function initParallax() {
  const photo = document.getElementById('heroPhoto');
  if (!photo) return;

  /* Solo en desktop donde hay suficiente altura */
  const mq = window.matchMedia('(min-width: 769px) and (prefers-reduced-motion: no-preference)');
  if (!mq.matches) return;

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    /* La foto se desplaza a 0.35× la velocidad del scroll */
    photo.style.transform = `translateY(${y * 0.35}px)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();


/* ──────────────────────────────────────────────────
   4. SCROLL REVEAL — Intersection Observer
   .js-reveal  → fade + translateY de sección entera
   .js-child   → ídem pero con delay escalonado
────────────────────────────────────────────────── */
(function initReveal() {
  /* Secciones completas */
  const reveals = document.querySelectorAll('.js-reveal');
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.10 }).observe === undefined
    ? reveals.forEach(el => el.classList.add('visible'))
    : (() => {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
            }
          });
        }, { threshold: 0.10 });
        reveals.forEach(el => obs.observe(el));
      })();

  /* Hijos escalonados */
  const grids = document.querySelectorAll('.s10-grid, .ventajas-grid, .s9-wrap');
  grids.forEach(grid => {
    const children = grid.querySelectorAll('.js-child');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          children.forEach((child, i) => {
            child.style.transitionDelay = (i * 0.09) + 's';
            child.classList.add('visible');
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    obs.observe(grid);
  });
})();
/* ──────────────────────────────────────────────────
   S3 · CARD PARALLAX
   Efecto profundidad en la frase destacada
────────────────────────────────────────────────── */

(function initS3Card() {

  const card = document.querySelector('.s3-quote-box');
  const section = document.querySelector('.s3');

  if (!card || !section) return;

  let ticking = false;

  function update() {

    const rect = section.getBoundingClientRect();

    const progress = rect.top / window.innerHeight;

    card.style.transform =
      `translate(-50%, -50%) translateY(${progress * -30}px)`;

    ticking = false;
  }

  window.addEventListener('scroll', () => {

    if (!ticking) {

      requestAnimationFrame(update);

      ticking = true;

    }

  }, { passive:true });

})();
/* ──────────────────────────────────────────────────
   S3 CARD REVEAL
────────────────────────────────────────────────── */

(function initS3CardReveal(){

  const card = document.querySelector('.s3-quote-box');

  if(!card) return;

  const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

      if(entry.isIntersecting){

        card.classList.add('animate');

      }

    });

  },{

    threshold:0.4

  });

  observer.observe(card);

})();

/* ──────────────────────────────────────────────────
   5. FAQ — Acordeón nativo
   · Un solo ítem abierto a la vez
   · Rotación de ícono + / ×
   · Expansión por max-height
────────────────────────────────────────────────── */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      /* Cerrar todos */
      items.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });

      /* Abrir el actual si estaba cerrado */
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ──────────────────────────────────────────────────
   6. SMOOTH SCROLL para anclas internas
────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = document.getElementById('mainNav')?.offsetHeight || 64;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ──────────────────────────────────────────────────
   7. FORMULARIO DE ADMISIÓN
   · Validación básica de campos
   · Estado de carga (1.4s simulado)
   · Oculta el form y muestra estado de éxito
────────────────────────────────────────────────── */
(function initForm() {
  const form    = document.getElementById('admisionForm');
  const btn     = document.getElementById('formBtn');
  const success = document.getElementById('formSuccess');
  if (!form || !btn || !success) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nombre = document.getElementById('fNombre')?.value.trim();
    const email  = document.getElementById('fEmail')?.value.trim();
    const motivo = document.getElementById('fMotivo')?.value.trim();

    /* Resaltar campos vacíos */
    let ok = true;
    [['fNombre', nombre], ['fEmail', email], ['fMotivo', motivo]].forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (!val) {
        ok = false;
        if (el) {
          el.style.borderBottomColor = '#541021';
          el.addEventListener('input', () => { el.style.borderBottomColor = ''; }, { once: true });
        }
      }
    });
    if (!ok) return;

    /* Validar email */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const ef = document.getElementById('fEmail');
      if (ef) ef.style.borderBottomColor = '#541021';
      return;
    }

    /* Estado de carga */
    btn.disabled = true;
    btn.classList.add('loading');

    /* Simular envío (reemplazar por fetch real al backend) */
    setTimeout(() => {
      form.style.transition = 'opacity .4s, transform .4s';
      form.style.opacity    = '0';
      form.style.transform  = 'translateY(-12px)';
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('show');
      }, 420);
    }, 1400);
  });
})();
/*──────────────────────────────
S3 LETTER REVEAL
──────────────────────────────*/

(function(){

const text = document.querySelector(".js-letter-reveal");

if(!text) return;

const original = text.textContent;

text.innerHTML = "";

original.split("").forEach(letter=>{

    const span = document.createElement("span");

    span.textContent = letter;

    text.appendChild(span);

});

const letters = text.querySelectorAll("span");

window.addEventListener("scroll",()=>{

    const rect = text.getBoundingClientRect();

    const start = window.innerHeight*0.85;

    const end = window.innerHeight*0.25;

    let progress = (start-rect.top)/(start-end);

    progress = Math.max(0,Math.min(progress,1));

    const visible = Math.floor(progress*letters.length);

    letters.forEach((letter,index)=>{

        letter.classList.toggle("active",index<visible);

    });

},{passive:true});

})();
/* ======================================================
   PREMIUM CURSOR
====================================================== */

(function(){

const dot=document.querySelector(".cursor-dot");
const ring=document.querySelector(".cursor-ring");

if(!dot || !ring) return;

let mouseX=window.innerWidth/2;
let mouseY=window.innerHeight/2;

let ringX=mouseX;
let ringY=mouseY;

document.addEventListener("mousemove",(e)=>{

mouseX=e.clientX;
mouseY=e.clientY;

dot.style.left=mouseX+"px";
dot.style.top=mouseY+"px";

});

function animate(){

ringX+=(mouseX-ringX)*0.18;
ringY+=(mouseY-ringY)*0.18;

ring.style.left=ringX+"px";
ring.style.top=ringY+"px";

requestAnimationFrame(animate);

}

animate();

document.querySelectorAll("a,button,img,.cta-solid,.cta-outline").forEach(el=>{

el.addEventListener("mouseenter",()=>{

ring.classList.add("hover");

});

el.addEventListener("mouseleave",()=>{

ring.classList.remove("hover");

});

});

})();