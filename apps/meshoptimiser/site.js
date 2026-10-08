// ========== MESHOPTIMISER SITE ==========
// The few things the app's site (apps/meshoptimiser/*.html) does beyond
// being read: the menu on a phone, the paged strip of screenshots,
// pictures that open full size, clips that play while they are on screen,
// commands that copy, and the search of the docs. Look: site.css.
// Nothing here runs while the page is idle.
(function () {
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => [...(root || document).querySelectorAll(sel)];
  const el = (tag, cls, text) => { const node = document.createElement(tag); if (cls) node.className = cls; if (text) node.textContent = text; return node; };
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---- the menu on a phone ----
  const menu = $('#menu'), nav = $('#nav');
  if (menu && nav) {
    const set = (open) => { nav.classList.toggle('is-open', open); menu.setAttribute('aria-expanded', String(open)); };
    menu.addEventListener('click', () => set(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  // ---- the strip of screenshots: paged ----
  // Wherever it is let go it settles with one picture in the middle (the
  // first and the last rest against its ends), and a flick takes it on to
  // the next. Touch and trackpads get this from scroll snapping; a mouse
  // drag is settled here, with snapping off (.is-free) while it has the strip.
  const restOf = (strip, fig) => {
    const max = strip.scrollWidth - strip.clientWidth;
    const middle = fig.offsetLeft - strip.offsetLeft + fig.offsetWidth / 2 - strip.clientWidth / 2;
    return Math.max(0, Math.min(max, middle));
  };
  $$('[data-strip]').forEach((strip) => {
    const figs = [...strip.children];
    const rests = () => figs.map(fig => restOf(strip, fig));
    const nearest = (list, x) => list.reduce((at, rest, i) => (Math.abs(rest - x) < Math.abs(list[at] - x) ? i : at), 0);

    // the dots under it: one per picture, the lit one is the picture in the middle
    const row = strip.nextElementSibling && strip.nextElementSibling.classList.contains('dots') ? strip.nextElementSibling : null;
    if (row) {
      const marks = figs.map(() => row.appendChild(el('i')));
      const sync = () => { const now = nearest(rests(), strip.scrollLeft); marks.forEach((mark, i) => mark.classList.toggle('is-active', i === now)); };
      strip.addEventListener('scroll', sync, { passive: true });
      sync();
    }

    let startX = 0, startLeft = 0, lastX = 0, lastT = 0, speed = 0, held = false, moved = false, glide = 0, gliding = false;
    const settle = () => {
      const list = rests(), from = strip.scrollLeft;
      let at = nearest(list, from);
      const dir = speed < -2 ? 1 : speed > 2 ? -1 : 0;      // the strip moves against the mouse
      if (dir && (list[at] - from) * dir <= 0) at = Math.max(0, Math.min(list.length - 1, at + dir));
      const to = list[at];
      const done = () => { strip.scrollLeft = to; gliding = false; strip.classList.remove('is-free'); };
      if (Math.abs(to - from) < 1 || calm) return done();
      const t0 = performance.now(), time = Math.min(520, 260 + Math.abs(to - from) * 0.4);
      gliding = true;
      const step = (now) => {
        const t = Math.min(1, (now - t0) / time);
        strip.scrollLeft = from + (to - from) * (1 - Math.pow(1 - t, 3));
        if (t < 1) glide = requestAnimationFrame(step); else done();
      };
      glide = requestAnimationFrame(step);
    };
    strip.addEventListener('pointerdown', (e) => {
      delete strip.dataset.dragged;
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(glide);
      held = true; moved = false;
      startX = lastX = e.clientX; lastT = e.timeStamp; startLeft = strip.scrollLeft; speed = 0;
    });
    window.addEventListener('pointermove', (e) => {
      if (!held) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 4) return;
      if (!moved) { moved = true; strip.classList.add('is-held', 'is-free'); strip.dataset.dragged = '1'; }
      const dt = Math.max(1, e.timeStamp - lastT);
      speed = 0.7 * speed + 0.3 * ((e.clientX - lastX) / dt * 16);
      lastX = e.clientX; lastT = e.timeStamp;
      strip.scrollLeft = startLeft - dx;
    });
    const release = (e) => {
      if (!held) return;
      held = false;
      strip.classList.remove('is-held');
      if (e.timeStamp - lastT > 80) speed = 0;
      if (moved || gliding) settle();
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    strip.addEventListener('dragstart', e => e.preventDefault());
    // a press that became a drag is not a click on the picture under it
    strip.addEventListener('click', (e) => { if (strip.dataset.dragged) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  // ---- pictures that open full size ----
  // Every a.zoom is a link to its picture, so it works without this script;
  // with it the picture opens over the page, with the others of its group.
  const zooms = $$('a.zoom');
  if (zooms.length) {
    const box = el('div', 'lb');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Screenshot');
    const stage = el('div', 'lb-stage'), img = el('img'), foot = el('div', 'lb-foot');
    const caption = el('p'), count = el('span');
    const close = el('button', 'lb-close', '×'), prev = el('button', 'lb-prev', '←'), next = el('button', 'lb-next', '→');
    close.setAttribute('aria-label', 'Close'); prev.setAttribute('aria-label', 'Previous'); next.setAttribute('aria-label', 'Next');
    [close, prev, next].forEach(b => { b.type = 'button'; });
    stage.append(img); foot.append(caption, count); box.append(stage, foot, close, prev, next);
    document.body.append(box);

    let set = [], at = 0, from = null;
    const show = (i) => {
      at = (i + set.length) % set.length;
      img.src = set[at].href;
      img.alt = set[at].dataset.caption || '';
      caption.textContent = set[at].dataset.caption || '';
      count.textContent = set.length > 1 ? `${at + 1} / ${set.length}` : '';
      prev.hidden = next.hidden = set.length < 2;
    };
    const open = (link) => {
      set = zooms.filter(z => z.dataset.group === link.dataset.group);
      from = link;
      show(set.indexOf(link));
      box.classList.add('is-open');
      document.documentElement.classList.add('lb-lock');
      close.focus();
    };
    const shut = () => {
      box.classList.remove('is-open');
      document.documentElement.classList.remove('lb-lock');
      if (from) from.focus({ preventScroll: true });
    };
    zooms.forEach(link => link.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      open(link);
    }));
    close.addEventListener('click', shut);
    prev.addEventListener('click', () => show(at - 1));
    next.addEventListener('click', () => show(at + 1));
    box.addEventListener('click', (e) => { if (e.target === box || e.target === stage) shut(); });
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') shut();
      else if (e.key === 'ArrowLeft') show(at - 1);
      else if (e.key === 'ArrowRight') show(at + 1);
      else if (e.key === 'Tab') { e.preventDefault(); const order = [close, prev, next].filter(b => !b.hidden); order[(order.indexOf(document.activeElement) + (e.shiftKey ? -1 : 1) + order.length) % order.length].focus(); }
    });
    // a sideways swipe on a touch screen
    let downX = null;
    stage.addEventListener('touchstart', (e) => { downX = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    stage.addEventListener('touchend', (e) => {
      if (downX === null) return;
      const dx = e.changedTouches[0].clientX - downX;
      downX = null;
      if (Math.abs(dx) > 48) show(at + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  // ---- the opening: the part steps out of the window ----
  // The scroll through .pop sets --p (0 to 1); the styles do the rest. The
  // listener exists only while the section is on screen, and only one frame
  // is scheduled per scroll event, so nothing runs while the page is still.
  const pop = $('[data-pop]');
  if (pop && !calm && 'IntersectionObserver' in window && window.matchMedia('(min-width: 861px)').matches) {
    let queued = false, last = -1;
    const place = () => {
      queued = false;
      const rect = pop.getBoundingClientRect();
      const room = rect.height - ($('.pop-pin', pop).offsetHeight || window.innerHeight);
      const p = Math.max(0, Math.min(1, room > 0 ? -rect.top / room : 0));
      const eased = p * p * (3 - 2 * p);
      if (Math.abs(eased - last) > 0.0005) { last = eased; pop.style.setProperty('--p', eased.toFixed(4)); }
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll(); }
      else { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
    }, { rootMargin: '200px 0px' }).observe(pop);
  }

  // ---- things that arrive as they come into view ----
  const reveal = $$('[data-reveal]');
  if (reveal.length && !calm && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('has-reveal');
    const seen = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); seen.unobserve(entry.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    reveal.forEach(node => seen.observe(node));
  }

  // ---- clips ----
  // A clip is fetched and played only while it is on screen and stops when
  // it leaves. On touch devices, and with reduced motion, it stays a poster
  // until it is tapped.
  const clips = $$('video[data-src]');
  if (clips.length) {
    const start = (v) => { if (!v.src) v.src = v.dataset.src; const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (mouse && !calm && 'IntersectionObserver' in window) {
      const watch = new IntersectionObserver(entries => entries.forEach((entry) => {
        if (entry.isIntersecting) start(entry.target); else entry.target.pause();
      }), { threshold: 0.35 });
      clips.forEach(v => watch.observe(v));
    } else {
      clips.forEach((v) => {
        v.parentElement.classList.add('is-tap');
        v.tabIndex = 0;
        v.setAttribute('role', 'button');
        const toggle = () => { if (v.paused) start(v); else v.pause(); };
        v.addEventListener('click', toggle);
        v.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      });
    }
  }

  // ---- commands that copy ----
  $$('.copy').forEach(button => button.addEventListener('click', () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(button.dataset.copy).then(() => {
      button.textContent = 'Copied';
      button.classList.add('is-done');
      setTimeout(() => { button.textContent = 'Copy'; button.classList.remove('is-done'); }, 1400);
    }).catch(() => {});
  }));

  // ---- docs: search the list of articles ----
  // Every word typed must be in an article's title, summary, headings or
  // terms (data-words). Groups with nothing left are put away.
  const search = $('#kbSearch');
  if (search) {
    const rows = $$('.kb-list li'), groups = $$('.kb-group'), none = $('#kbNone');
    const filter = () => {
      const words = search.value.toLowerCase().split(/\s+/).filter(Boolean);
      let shown = 0;
      rows.forEach((row) => {
        const hit = words.every(word => row.dataset.words.includes(word));
        row.hidden = !hit;
        if (hit) shown++;
      });
      groups.forEach((group) => { group.hidden = !$('.kb-list li:not([hidden])', group); });
      if (none) none.hidden = shown > 0;
    };
    search.addEventListener('input', filter);
    // "/" puts the cursor in the search, Enter opens the first article left
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== search && !e.ctrlKey && !e.metaKey) { e.preventDefault(); search.focus(); }
    });
    search.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { search.value = ''; filter(); }
      if (e.key === 'Enter') { const first = $('.kb-list li:not([hidden]) a'); if (first) location.href = first.href; }
    });
    if (search.value) filter();          // a value the browser kept across a reload
  }

  // ---- docs: the index beside an article shows where you are ----
  const here = $('.kb-nav a[aria-current]');
  if (here) { const nav = here.parentElement; nav.scrollTop = Math.max(0, here.offsetTop - nav.clientHeight / 2); }
})();
