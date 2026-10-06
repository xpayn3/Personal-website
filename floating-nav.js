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
  // The random letters are wider or narrower than the real ones. Hold the
  // word's box at its real width while it scrambles, so its neighbours (the
  // rest of the nav) stay where they are.
  function lockWidth(el) {
    if (el.style.width) return;
    if (getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
    el.style.width = el.getBoundingClientRect().width + 'px';
    el.style.whiteSpace = 'nowrap';
  }
  function unlockWidth(el) {
    el.style.width = el.style.display = el.style.whiteSpace = '';
  }
  function start(el) {
    const original = el.dataset.label || el.textContent;
    if (!el.dataset.label) el.dataset.label = original;
    const prev = state.get(el);
    if (prev) cancelAnimationFrame(prev.raf);
    el.textContent = original;
    lockWidth(el);
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
        unlockWidth(el);
      }
    }
    s.raf = requestAnimationFrame(tick);
    state.set(el, s);
  }
  function stop(el) {
    const s = state.get(el);
    if (s) { s.alive = false; cancelAnimationFrame(s.raf); }
    if (el.dataset.label) el.textContent = el.dataset.label;
    unlockWidth(el);
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

// Mobile menu — inject a hamburger + fullscreen menu built from the nav's own
// links, so every page gets it without markup changes. The wordmark also opens
// the menu on small screens.
(function initMobileMenu() {
  const nav = document.querySelector('.site-nav');
  if (!nav || document.querySelector('.nav-burger')) return;
  const brand = nav.querySelector('.floating-name');
  const links = Array.prototype.slice.call(
    nav.querySelectorAll('.floating-nav .floating-nav-link')
  );
  const cta = nav.querySelector('.site-nav-cta');

  // Hamburger button (lives in the bar, shown only on mobile via CSS).
  const burger = document.createElement('button');
  burger.type = 'button';
  burger.className = 'nav-burger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<span></span><span></span><span></span>';
  // Far left, before the wordmark.
  if (brand && brand.parentNode) brand.parentNode.insertBefore(burger, brand);
  else nav.appendChild(burger);

  // Fullscreen menu overlay.
  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.setAttribute('aria-hidden', 'true');
  let html = '<button type="button" class="mobile-menu-close" aria-label="Close menu">×</button>';
  html += '<nav class="mobile-menu-links" aria-label="Menu">';
  links.forEach((a) => {
    const active = a.classList.contains('is-active') ? ' is-active' : '';
    html += '<a href="' + a.getAttribute('href') + '" class="mobile-menu-link' + active + '">' + a.textContent + '</a>';
  });
  html += '</nav>';
  if (cta) {
    html += '<a href="' + cta.getAttribute('href') + '" class="mobile-menu-cta">' + cta.textContent.trim() + '</a>';
  }
  menu.innerHTML = html;
  document.body.appendChild(menu);

  function open() {
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  function toggle() { menu.classList.contains('open') ? close() : open(); }

  burger.addEventListener('click', toggle);
  menu.querySelector('.mobile-menu-close').addEventListener('click', close);
  menu.addEventListener('click', (e) => { if (e.target === menu) close(); });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('open')) close();
  });

  // Wordmark opens the menu on mobile; stays a normal home link on desktop.
  if (brand) {
    brand.addEventListener('click', (e) => {
      if (window.matchMedia('(max-width: 760px)').matches) {
        e.preventDefault();
        toggle();
      }
    });
  }
})();
