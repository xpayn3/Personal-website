// Windy Tree showcase — minimal scroll-reveal + iframe FPS read.
(function () {
  // ----- Scroll reveals -----
  // Tag every meaningful chunk with .t-reveal then use IO to fade them in.
  const targets = [
    ...document.querySelectorAll('.t-feat'),
    ...document.querySelectorAll('.t-pipe-step'),
    ...document.querySelectorAll('.t-stack-col'),
    ...document.querySelectorAll('.t-species-cat'),
    ...document.querySelectorAll('.t-metric'),
    ...document.querySelectorAll('.t-divider'),
  ];
  for (const el of targets) el.classList.add('t-reveal');

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('t-in');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    for (const el of targets) io.observe(el);
  } else {
    // Old browsers — just show.
    for (const el of targets) el.classList.add('t-in');
  }

  // ----- Carousel: cycle species inside the live iframe via postMessage -----
  const iframe   = document.getElementById('t-iframe');
  const dots     = Array.from(document.querySelectorAll('.t-car-dot'));
  const prev     = document.getElementById('t-car-prev');
  const next     = document.getElementById('t-car-next');
  const overlay  = document.getElementById('t-car-overlay');
  const nameEl   = document.getElementById('t-car-name');
  const metaEl   = document.getElementById('t-car-meta');
  const labelEl  = document.getElementById('t-carousel-label');
  const counterEl = document.getElementById('t-carousel-counter');
  const slides   = dots.map((d) => ({ species: d.dataset.species, meta: d.dataset.meta }));

  let active = 0;
  let autoTimer = null;
  let iframeReady = false;
  let pendingSpecies = null;

  function paintLabels() {
    const s = slides[active];
    if (overlay) overlay.classList.add('is-changing');
    setTimeout(() => {
      if (nameEl) nameEl.textContent = s.species;
      if (metaEl) metaEl.textContent = s.meta;
      if (labelEl) labelEl.textContent = `${s.species.toLowerCase()} · ${s.meta}`;
      if (counterEl) counterEl.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      if (overlay) overlay.classList.remove('is-changing');
    }, 220);
    dots.forEach((d, k) => d.classList.toggle('is-on', k === active));
  }

  function sendSpecies(species) {
    if (!iframe || !iframe.contentWindow) return;
    if (!iframeReady) { pendingSpecies = species; return; }
    try {
      iframe.contentWindow.postMessage({ type: 'set-species', species }, '*');
    } catch { /* cross-origin or detached frame, silently no-op */ }
  }

  function go(i) {
    active = ((i % slides.length) + slides.length) % slides.length;
    paintLabels();
    sendSpecies(slides[active].species);
  }

  function startAuto() {
    stopAuto();
    // Slow cadence — each species needs ~1–2 s to rebuild before the next one
    // starts so the user actually sees it. 5 s is a comfortable beat.
    autoTimer = setInterval(() => go(active + 1), 5000);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  // Wait until the iframe has loaded + had a moment to bind its postMessage
  // listener (the tree app's first generateTree completes ~700 ms after load).
  iframe?.addEventListener('load', () => {
    setTimeout(() => {
      iframeReady = true;
      if (pendingSpecies) { sendSpecies(pendingSpecies); pendingSpecies = null; }
    }, 1200);
  });

  prev?.addEventListener('click', () => { go(active - 1); startAuto(); });
  next?.addEventListener('click', () => { go(active + 1); startAuto(); });
  dots.forEach((d) => d.addEventListener('click', () => {
    go(parseInt(d.dataset.i, 10));
    startAuto();
  }));

  // Pause auto-cycle on hover so the user can read / interact with the live preview.
  const canvas = document.querySelector('.t-hero-frame-canvas');
  canvas?.addEventListener('mouseenter', stopAuto);
  canvas?.addEventListener('mouseleave', startAuto);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto(); else startAuto();
  });

  // Initial paint + auto-start.
  paintLabels();
  startAuto();

  // ----- Subtle parallax on the hero haze blob -----
  const haze = document.querySelector('.t-hero-haze');
  if (haze && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY * 0.18;
        haze.style.transform = `translateY(${y}px)`;
        ticking = false;
      });
    }, { passive: true });
  }
})();
