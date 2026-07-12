// Hover hooks — on the home page, hovering a link asks the cover canvas
// to morph particles into the link text. Falls back silently on other pages.
(function () {
  const links = document.querySelectorAll('.floating-nav-link');
  if (!links.length) return;
  const descEl = document.getElementById('coverDesc');
  let descHideTimer = null;

  links.forEach((link) => {
    // `data-cover-shape` (e.g. "tree") overrides the text morph and forms
    // a procedural shape. Otherwise `data-cover-text` overrides the visible
    // label; both fall back to textContent. `data-cover-desc` sets the
    // small bottom-left description.
    const coverShape = (link.getAttribute('data-cover-shape') || '').trim();
    const coverText = (link.getAttribute('data-cover-text') || link.textContent || '').trim();
    const coverDesc = (link.getAttribute('data-cover-desc') || '').trim();

    link.addEventListener('mouseenter', () => {
      if (coverShape && typeof window.__coverShape === 'function') {
        window.__coverShape(coverShape);
      } else if (typeof window.__coverMorph === 'function') {
        window.__coverMorph(coverText);
      }
      if (descEl && coverDesc) {
        if (descHideTimer != null) { clearTimeout(descHideTimer); descHideTimer = null; }
        descEl.innerHTML = coverDesc;
        descEl.classList.add('is-visible');
      }
    });
    link.addEventListener('mouseleave', () => {
      if (coverShape && typeof window.__coverShape === 'function') {
        window.__coverShape(null);
      } else if (typeof window.__coverMorph === 'function') {
        window.__coverMorph(null);
      }
      if (descEl) {
        // Same 220ms grace window as the particle release — moving from
        // one link to another keeps the description visible without flicker.
        descHideTimer = setTimeout(() => {
          descEl.classList.remove('is-visible');
          descHideTimer = null;
        }, 220);
      }
    });
  });
})();

// Subtle on-hover letter scramble — shared across pages for the floating
// nav, wordmark, and footer links/titles.
(function () {
  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function pickGlyphFor(ch) {
    if (/[A-Z]/.test(ch)) return UPPER[(Math.random() * 26) | 0];
    if (/[a-z]/.test(ch)) return LOWER[(Math.random() * 26) | 0];
    return ch;
  }
  const state = new WeakMap();
  function start(el) {
    const original = el.dataset.label || el.textContent;
    if (!el.dataset.label) el.dataset.label = original;
    const prev = state.get(el);
    if (prev) cancelAnimationFrame(prev.raf);
    const len = original.length;
    const startTimes = new Array(len);
    const total = 260;
    for (let i = 0; i < len; i++) {
      startTimes[i] = (i / Math.max(len - 1, 1)) * 140;
    }
    const t0 = performance.now();
    const s = { raf: 0, alive: true };
    function tick(now) {
      if (!s.alive) return;
      const elapsed = now - t0;
      let out = '';
      let done = true;
      for (let i = 0; i < len; i++) {
        const local = elapsed - startTimes[i];
        if (local < 100) {
          out += pickGlyphFor(original[i]);
          done = false;
        } else {
          out += original[i];
        }
      }
      el.textContent = out;
      if (!done && elapsed < total + 100) {
        s.raf = requestAnimationFrame(tick);
      } else {
        el.textContent = original;
      }
    }
    s.raf = requestAnimationFrame(tick);
    state.set(el, s);
  }
  function stop(el) {
    const s = state.get(el);
    if (s) { s.alive = false; cancelAnimationFrame(s.raf); }
    if (el.dataset.label) el.textContent = el.dataset.label;
  }
  const targets = document.querySelectorAll(
    '.floating-nav-link, .floating-name, .footer-col-link, .footer-col-title'
  );
  targets.forEach((el) => {
    if (!el.dataset.label) el.dataset.label = el.textContent;
    el.addEventListener('mouseenter', () => start(el));
    el.addEventListener('mouseleave', () => stop(el));
  });
})();
