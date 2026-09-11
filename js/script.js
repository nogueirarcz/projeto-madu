/* ==========================================================
   MADU NAIL STUDIO — Scripts
   ========================================================== */
(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ========================================================
     1. HEADER — sombra ao rolar + link ativo
     ======================================================== */
  const header = $('#header');
  const navLinks = $$('.nav a[href^="#"]:not(.nav__cta)');
  const sections = navLinks
    .map(a => $(a.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    header.classList.toggle('is-stuck', window.scrollY > 10);

    const pos = window.scrollY + header.offsetHeight + 80;
    let current = null;
    sections.forEach(sec => {
      if (sec.offsetTop <= pos) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ========================================================
     2. MENU MOBILE
     ======================================================== */
  const burger = $('#burger');
  const nav = $('#nav');

  function closeMenu() {
    burger.classList.remove('is-open');
    nav.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  $$('.nav a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') &&
        !nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });

  /* ========================================================
     3. REVEAL ON SCROLL
     ======================================================== */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 90 + 'ms';
    revealObserver.observe(el);
  });

  /* ========================================================
     4. CONTADORES DO HERO
     ======================================================== */
  const counters = $$('[data-count]');
  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => counterObserver.observe(el));

  function animateCount(el) {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);      // easeOutCubic
      el.textContent = Math.round(target * eased).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ========================================================
     5. GALERIA — geração, filtros e lightbox
     ======================================================== */
  const WORKS = [
    { titulo: 'Nude Clássico',    cat: 'nude',        desc: 'Esmaltação em gel',  from: '#f6dde1', to: '#d8a3ad' },
    { titulo: 'Francesinha Rosé', cat: 'francesinha', desc: 'Alongamento F1',     from: '#fff6f7', to: '#e8bcc5', tip: '#ffffff' },
    { titulo: 'Glitter Champagne',cat: 'glitter',     desc: 'Encapsulada',        from: '#f6e6c9', to: '#d3ad63', sparkle: true },
    { titulo: 'Floral Delicado',  cat: 'art',         desc: 'Nail art autoral',   from: '#fbeef0', to: '#e0a3ad', flower: true },
    { titulo: 'Cherry Blossom',   cat: 'art',         desc: 'Pintura à mão',      from: '#fae1e6', to: '#c9707f', flower: true },
    { titulo: 'Nude Amanteigado', cat: 'nude',        desc: 'Blindagem',          from: '#f7ece2', to: '#dcc0a8' },
    { titulo: 'Francesinha Gold', cat: 'francesinha', desc: 'Alongamento em gel', from: '#fdf6f7', to: '#e3c76b', tip: '#c9a227' },
    { titulo: 'Glitter Rosé',     cat: 'glitter',     desc: 'Esmaltação em gel',  from: '#f6dde1', to: '#c9707f', sparkle: true },
  ];

  const gallery = $('#gallery');

  /** Gera o SVG decorativo de cada peça da galeria. */
  function artSVG(work, id) {
    const gid = 'grad-' + id;
    const sparkles = work.sparkle
      ? Array.from({ length: 22 }, () => {
          const x = (Math.random() * 100).toFixed(1);
          const y = (Math.random() * 100).toFixed(1);
          const r = (Math.random() * 1.1 + .4).toFixed(2);
          return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${(Math.random() * .6 + .3).toFixed(2)}"/>`;
        }).join('')
      : '';

    const tip = work.tip
      ? `<path d="M0 0 H100 V16 Q50 30 0 16 Z" fill="${work.tip}" opacity=".95"/>`
      : '';

    const flower = work.flower
      ? `<g opacity=".85">
           ${[[30, 38, 9], [68, 62, 7], [46, 82, 6]].map(([cx, cy, r]) => `
             <g transform="translate(${cx} ${cy})">
               ${[0, 72, 144, 216, 288].map(a =>
                 `<ellipse cx="0" cy="${-r}" rx="${r * .5}" ry="${r}" fill="#fff" opacity=".9" transform="rotate(${a})"/>`
               ).join('')}
               <circle r="${r * .35}" fill="#c9a227"/>
             </g>`).join('')}
         </g>`
      : '';

    return `<svg viewBox="0 0 100 133" preserveAspectRatio="none" width="100%" height="100%">
      <defs>
        <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${work.from}"/>
          <stop offset="100%" stop-color="${work.to}"/>
        </linearGradient>
      </defs>
      <rect width="100" height="133" fill="url(#${gid})"/>
      <ellipse cx="78" cy="18" rx="34" ry="26" fill="#fff" opacity=".18"/>
      ${tip}${flower}${sparkles}
      <path d="M0 133 Q25 112 50 124 T100 110 V133 Z" fill="#fff" opacity=".14"/>
    </svg>`;
  }

  WORKS.forEach((w, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.cat = w.cat;
    tile.dataset.index = i;
    tile.setAttribute('role', 'button');
    tile.setAttribute('tabindex', '0');
    tile.innerHTML = `
      <div class="tile__art">${artSVG(w, i)}</div>
      <div class="tile__overlay">
        <strong>${w.titulo}</strong>
        <small>${w.desc}</small>
      </div>`;
    gallery.appendChild(tile);
  });

  const tiles = $$('.tile');

  /* --- filtros --- */
  $('#filters').addEventListener('click', e => {
    const btn = e.target.closest('.filter');
    if (!btn) return;

    $$('.filter').forEach(b => b.classList.toggle('is-active', b === btn));

    const cat = btn.dataset.filter;
    tiles.forEach(tile => {
      const show = cat === 'todos' || tile.dataset.cat === cat;
      tile.classList.toggle('is-hidden', !show);
      if (show) {
        tile.classList.remove('is-entering');
        void tile.offsetWidth;              // reinicia a animação
        tile.classList.add('is-entering');
      }
    });
  });

  /* --- lightbox --- */
  const lightbox = $('#lightbox');
  const lbArt = $('#lbArt');
  const lbCaption = $('#lbCaption');
  let lbIndex = 0;

  function visibleTiles() {
    return tiles.filter(t => !t.classList.contains('is-hidden'));
  }

  function openLightbox(tile) {
    lbIndex = Number(tile.dataset.index);
    renderLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function renderLightbox() {
    const w = WORKS[lbIndex];
    lbArt.innerHTML = artSVG(w, 'lb-' + lbIndex);
    lbCaption.textContent = `${w.titulo} — ${w.desc}`;
  }

  function stepLightbox(dir) {
    const list = visibleTiles().map(t => Number(t.dataset.index));
    if (!list.length) return;
    const pos = list.indexOf(lbIndex);
    lbIndex = list[(pos + dir + list.length) % list.length];
    renderLightbox();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }

  gallery.addEventListener('click', e => {
    const tile = e.target.closest('.tile');
    if (tile) openLightbox(tile);
  });
  gallery.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const tile = e.target.closest('.tile');
    if (tile) { e.preventDefault(); openLightbox(tile); }
  });

  $('#lbClose').addEventListener('click', closeLightbox);
  $('#lbPrev').addEventListener('click', () => stepLightbox(-1));
  $('#lbNext').addEventListener('click', () => stepLightbox(1));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  /* ========================================================
     6. SLIDER DE DEPOIMENTOS
     ======================================================== */
  const track = $('#sliderTrack');
  const quotes = $$('.quote', track);
  const dotsBox = $('#dots');
  let slide = 0;
  let autoplay;

  quotes.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.setAttribute('aria-label', 'Depoimento ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(dot);
  });

  function goTo(i) {
    slide = (i + quotes.length) % quotes.length;
    track.style.transform = `translateX(-${slide * 100}%)`;
    $$('.dot', dotsBox).forEach((d, n) => d.classList.toggle('is-active', n === slide));
  }

  function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(() => goTo(slide + 1), 6000);
  }
  function stopAutoplay() { clearInterval(autoplay); }

  $('#prev').addEventListener('click', () => { goTo(slide - 1); startAutoplay(); });
  $('#next').addEventListener('click', () => { goTo(slide + 1); startAutoplay(); });

  const slider = $('#slider');
  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);
  startAutoplay();

  /* --- swipe no mobile --- */
  let touchX = null;
  slider.addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', e => {
    if (touchX === null) return;
    const delta = e.changedTouches[0].clientX - touchX;
    if (Math.abs(delta) > 45) goTo(slide + (delta < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });

  /* ========================================================
     7. FORMULÁRIO — máscara e validação
     ======================================================== */
  const form = $('#form');
  const telefone = $('#telefone');
  const success = $('#formSuccess');

  /* máscara (11) 90000-0000 */
  telefone.addEventListener('input', () => {
    let v = telefone.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 6)      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    else if (v.length > 0) v = `(${v}`;
    telefone.value = v;
  });

  /* data mínima = hoje */
  const dataInput = $('#data');
  dataInput.min = new Date().toISOString().split('T')[0];

  function setError(field, msg) {
    const wrap = field.closest('.field');
    wrap.classList.toggle('has-error', Boolean(msg));
    $('.error', wrap).textContent = msg || '';
    return !msg;
  }

  const rules = {
    nome: v => v.trim().length >= 3 ? '' : 'Conte pra gente seu nome completo.',
    telefone: v => v.replace(/\D/g, '').length >= 10 ? '' : 'Informe um WhatsApp válido com DDD.',
    servico: v => v ? '' : 'Escolha o serviço desejado.',
    data: v => v ? '' : 'Selecione uma data para o atendimento.',
  };

  Object.keys(rules).forEach(name => {
    const field = form.elements[name];
    field.addEventListener('blur', () => setError(field, rules[name](field.value)));
    field.addEventListener('input', () => {
      if (field.closest('.field').classList.contains('has-error')) {
        setError(field, rules[name](field.value));
      }
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    success.hidden = true;

    let ok = true;
    let firstInvalid = null;

    Object.keys(rules).forEach(name => {
      const field = form.elements[name];
      const valid = setError(field, rules[name](field.value));
      if (!valid) {
        ok = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (!ok) { firstInvalid.focus(); return; }

    success.hidden = false;
    form.reset();
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => { success.hidden = true; }, 8000);
  });

  /* ========================================================
     8. ANO NO RODAPÉ
     ======================================================== */
  $('#ano').textContent = new Date().getFullYear();

})();
