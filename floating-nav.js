// On-hover letter morph — shared across pages for the nav links and the
// wordmark.
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
  // Each letter also gets a slot as wide as the real letter it stands in
  // for, so the letters that have already settled don't slide about while
  // the rest are still changing. Returns the slots, one per character.
  // The slots ignore the mouse: the pointer must stay on the word itself,
  // or swapping them in and out under a resting cursor would count as the
  // mouse entering again (restarting the scramble forever) and would eat
  // clicks whose press landed on a slot that is gone by the release.
  function makeSlots(el, original) {
    const node = el.firstChild;
    const range = document.createRange();
    const widths = [];
    for (let i = 0; i < original.length; i++) {
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      widths.push(range.getBoundingClientRect().width);
    }
    el.textContent = '';
    return widths.map((w, i) => {
      const slot = document.createElement('span');
      slot.style.cssText = `display:inline-block;width:${w}px;text-align:center;white-space:pre;pointer-events:none`;
      slot.textContent = original[i];
      el.appendChild(slot);
      return slot;
    });
  }
  // Morph the word into `text`, or back into its own label without one.
  // The letters arrive one after another, left to right. Each one first
  // flickers through a few random letters, dimmed, as if being decoded, then
  // lands: the real letter rises into place out of a blur and sharpens.
  const STAGGER = 30;      // ms between one letter starting and the next
  const DECODE = 170;      // ms a letter spends flickering
  const SWAP = 45;         // ms between flickers
  const LAND = 420;        // ms a letter takes to rise and sharpen
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function start(el, text) {
    if (!el.dataset.label) el.dataset.label = el.textContent;
    const original = text || el.dataset.label;
    const prev = state.get(el);
    if (prev) { prev.alive = false; cancelAnimationFrame(prev.raf); }
    lockWidth(el);                       // before the text changes: the box keeps the label's width
    el.textContent = original;
    // showing another word: stay at the label's width so nothing beside it moves
    const settle = () => { el.textContent = original; if (original === el.dataset.label) unlockWidth(el); };
    if (calm) { settle(); return; }
    const slots = makeSlots(el, original);
    const len = original.length;
    const swapped = new Array(len).fill(-Infinity);   // when each slot last flickered
    const landed = new Array(len).fill(false);
    slots.forEach((slot) => { slot.style.opacity = '0'; });
    const t0 = performance.now();
    const total = (len - 1) * STAGGER + DECODE + LAND;
    const s = { raf: 0, alive: true };
    function tick(now) {
      if (!s.alive) return;
      const elapsed = now - t0;
      for (let i = 0; i < len; i++) {
        if (landed[i]) continue;
        const local = elapsed - i * STAGGER;
        if (local < 0) continue;                           // not its turn yet
        const slot = slots[i];
        if (local < DECODE && original[i] !== ' ') {
          if (now - swapped[i] >= SWAP) {
            swapped[i] = now;
            slot.textContent = pickGlyphFor(original[i]);
            slot.style.opacity = '0.45';
          }
        } else {
          landed[i] = true;
          slot.textContent = original[i];
          slot.style.opacity = '';
          slot.animate(
            [
              { transform: 'translateY(0.42em)', filter: 'blur(4px)', opacity: 0.15 },
              { transform: 'translateY(-0.04em)', filter: 'blur(0)', opacity: 1, offset: 0.7 },
              { transform: 'none', filter: 'blur(0)', opacity: 1 },
            ],
            { duration: LAND, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
          );
        }
      }
      if (elapsed < total) s.raf = requestAnimationFrame(tick);
      else settle();
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
  const targets = document.querySelectorAll('.floating-nav-link, .floating-name');
  targets.forEach((el) => {
    if (!el.dataset.label) el.dataset.label = el.textContent;
    // A word can turn into another while hovered (data-hover). The wordmark in
    // the bar does: the name becomes "Home", which is where it leads, and
    // scrambles back to the name when the pointer leaves.
    const other = el.dataset.hover || (el.matches('.site-nav .floating-name') ? 'Home' : '');
    el.addEventListener('mouseenter', () => start(el, other));
    el.addEventListener('mouseleave', () => (other ? start(el) : stop(el)));
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
  // The bar has no Home link (the wordmark is the way home on desktop). On a
  // phone the wordmark opens this menu instead, so the menu needs one.
  if (brand) {
    const onHome = /(^|\/)(index\.html)?$/.test(location.pathname);
    html += '<a href="' + brand.getAttribute('href') + '" class="mobile-menu-link' + (onHome ? ' is-active' : '') + '">Home</a>';
  }
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
  // The menu's "Start a project" stands in for the one in the bar. On some
  // pages that one is not a plain link but opens the contact form through a
  // click handler (its href is just "#"), so pass the click on to it rather
  // than follow a copied href that goes nowhere.
  const menuCta = menu.querySelector('.mobile-menu-cta');
  if (menuCta && cta) {
    menuCta.addEventListener('click', (e) => {
      e.preventDefault();
      close();
      cta.click();
    });
  }
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
