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
    let queued = false, last = -1, hero3d = null, asked = false;
    // the real mesh (hero3d.js): fetched once the section is near, and only where WebGL works
    const wakeMesh = () => {
      if (asked) return;
      asked = true;
      try { const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl'); if (!gl) return; } catch (e) { return; }
      import('./hero3d.js?v=6').then(m => m.start(pop, '')).then((h) => { hero3d = h; h.setP(Math.max(0, last)); }).catch(() => {});
    };
    const place = () => {
      queued = false;
      const rect = pop.getBoundingClientRect();
      const room = rect.height - ($('.pop-pin', pop).offsetHeight || window.innerHeight);
      const p = Math.max(0, Math.min(1, room > 0 ? -rect.top / room : 0));
      const eased = p * p * (3 - 2 * p);
      if (Math.abs(eased - last) > 0.0005) { last = eased; pop.style.setProperty('--p', eased.toFixed(4)); if (hero3d) hero3d.setP(eased); }
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(place); } };
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { wakeMesh(); window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll); onScroll(); }
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

  // ---- the library: drag a part into the scene ----
  // Pointer events, so a mouse, a finger and a pen all work. A card follows
  // the pointer as a see-through copy; let go over the scene and the part
  // lands there, snapped to the grid. Parts already in the scene can be
  // dragged around, selected (click) and removed (Delete). Double-click or
  // Enter on a card adds it in the middle.
  $$('[data-lib]').forEach((lib) => {
    const view = $('[data-view]', lib), count = $('.lib-count', lib), clear = $('.lib-clear', lib);
    const tabs = $$('[data-shelf]', lib), grids = $$('[data-shelf-grid]', lib);
    const snap = 16;
    let parts = 0, selected = null;

    tabs.forEach(tab => tab.addEventListener('click', () => {
      tabs.forEach(t => t.setAttribute('aria-selected', String(t === tab)));
      grids.forEach(g => { g.hidden = g.dataset.shelfGrid !== tab.dataset.shelf; });
    }));
    const note = () => {
      view.classList.toggle('has-parts', parts > 0);
      clear.hidden = parts === 0;
      count.textContent = parts === 0 ? 'Nothing in the scene yet' : parts === 1 ? '1 part in the scene' : parts + ' parts in the scene';
    };
    const select = (node) => { if (selected) selected.classList.remove('is-on'); selected = node; if (node) node.classList.add('is-on'); };
    const clampTo = (x, y) => {
      const w = view.clientWidth, h = view.clientHeight;
      return [Math.max(48, Math.min(w - 48, Math.round(x / snap) * snap)), Math.max(48, Math.min(h - 56, Math.round(y / snap) * snap))];
    };
    const place = (key, name, x, y) => {
      const node = el('div', 'lib-part');
      node.dataset.key = key;
      const img = el('img'); img.src = 'library/' + key + '.webp'; img.alt = ''; img.draggable = false;
      node.append(img, el('span', '', name));
      const [px, py] = clampTo(x, y);
      node.style.left = px + 'px'; node.style.top = py + 'px';
      view.appendChild(node);
      parts++; note(); select(node);
      return node;
    };
    // moving a part that is already in the scene
    view.addEventListener('pointerdown', (e) => {
      const node = e.target.closest('.lib-part');
      if (!node) { select(null); view.focus({ preventScroll: true }); return; }
      e.preventDefault();
      select(node); node.classList.add('is-held'); node.setPointerCapture(e.pointerId);
      const box = view.getBoundingClientRect(), dx = parseFloat(node.style.left) - (e.clientX - box.left), dy = parseFloat(node.style.top) - (e.clientY - box.top);
      const move = (m) => { const b = view.getBoundingClientRect(); const [px, py] = clampTo(m.clientX - b.left + dx, m.clientY - b.top + dy); node.style.left = px + 'px'; node.style.top = py + 'px'; };
      const up = () => { node.classList.remove('is-held'); node.removeEventListener('pointermove', move); node.removeEventListener('pointerup', up); node.removeEventListener('pointercancel', up); };
      node.addEventListener('pointermove', move); node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up);
    });
    view.addEventListener('keydown', (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected) { e.preventDefault(); selected.remove(); selected = null; parts--; note(); }
      if (e.key === 'Escape') select(null);
    });
    clear.addEventListener('click', () => { $$('.lib-part', view).forEach(n => n.remove()); selected = null; parts = 0; note(); });

    // dragging a card out of the shelf
    lib.addEventListener('pointerdown', (e) => {
      const card = e.target.closest('.lib-card');
      if (!card || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const key = card.dataset.key, name = card.dataset.name;
      const sx = e.clientX, sy = e.clientY;
      let ghost = null;
      const over = (m) => { const b = view.getBoundingClientRect(); return m.clientX >= b.left && m.clientX <= b.right && m.clientY >= b.top && m.clientY <= b.bottom; };
      const move = (m) => {
        if (!ghost && Math.hypot(m.clientX - sx, m.clientY - sy) > 6) {
          ghost = el('div', 'lib-ghost'); const g = el('img'); g.src = 'library/' + key + '.webp'; g.alt = ''; ghost.appendChild(g);
          document.body.appendChild(ghost);
        }
        if (ghost) { ghost.style.transform = `translate(${m.clientX}px, ${m.clientY}px)`; view.classList.toggle('is-over', over(m)); }
      };
      const end = (m) => {
        window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
        view.classList.remove('is-over');
        if (ghost) {
          ghost.remove();
          if (m.type === 'pointerup' && over(m)) { const b = view.getBoundingClientRect(); place(key, name, m.clientX - b.left, m.clientY - b.top); }
        }
      };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
    });
    const addMiddle = (card) => place(card.dataset.key, card.dataset.name, view.clientWidth / 2 + (parts % 5 - 2) * 40, view.clientHeight / 2 + (parts % 3 - 1) * 36);
    lib.addEventListener('dblclick', (e) => { const card = e.target.closest('.lib-card'); if (card) addMiddle(card); });
    lib.addEventListener('keydown', (e) => { const card = e.target.closest('.lib-card'); if (card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); addMiddle(card); } });
    note();
  });

  // ---- the search, working ----
  // The same shape as the app's: parts of the scene, the library, commands,
  // and a sum when what you type is one. Everything is typed words against
  // a list that came with the page; nothing leaves it.
  $$('[data-demo]').forEach((demo) => {
    const data = JSON.parse($('[data-demo-data]', demo).textContent);
    const input = $('input', demo), list = $('.pal-list', demo), out = $('.demo-out', demo);
    const icon = {
      Parts: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M12 3 4 7.5v9L12 21l8-4.500v-9L12 3Z"/><path d="m4 7.500 8 4.500 8-4.500M12 12v9"/></svg>',
      Library: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="3.500" y="13" width="7" height="7" rx="1.500"/><circle cx="7" cy="7" r="3.500"/><path d="m17 3.500 3.500 6.500h-7L17 3.500Z"/></svg>',
      Commands: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 4 4-4 4M12 17h7"/></svg>',
    };
    const verb = { Parts: 'Part', Library: 'Add', Commands: '' };
    let rows = [], at = 0;

    // "12*25.4", "2 in", "300 mm" ... one number and a unit, or arithmetic
    const sum = (text) => {
      const t = text.trim().toLowerCase().replace(/,/g, '.');
      if (!t) return null;
      const unit = t.match(/^(-?\d+(?:\.\d+)?)\s*(mm|cm|m|in|inch|inches|ft)$/);
      if (unit) {
        const n = parseFloat(unit[1]), f = { mm: 1, cm: 10, m: 1000, in: 25.4, inch: 25.4, inches: 25.4, ft: 304.8 }[unit[2]];
        const mm = n * f, show = (v) => (Math.round(v * 1000) / 1000).toString();
        return { label: `${unit[1]} ${unit[2]}`, value: `${show(mm)} mm`, copy: show(mm) };
      }
      if (/^[\d\s.+\-*/()x×÷]+$/.test(t) && /[+\-*/x×÷]/.test(t.replace(/^-/, ''))) {
        try {
          const v = Function('"use strict"; return (' + t.replace(/[x×]/g, '*').replace(/÷/g, '/') + ')')();
          if (typeof v === 'number' && isFinite(v)) { const r = (Math.round(v * 1e6) / 1e6).toString(); return { label: text.trim(), value: r, copy: r }; }
        } catch (e) { /* not a sum */ }
      }
      return null;
    };
    const mark = (name, words) => {
      const lower = name.toLowerCase(); let out = '', i = 0;
      const spans = [];
      words.forEach((w) => { const k = lower.indexOf(w); if (k >= 0) spans.push([k, k + w.length]); });
      spans.sort((a, b) => a[0] - b[0]);
      spans.forEach(([a, b]) => { if (a < i) return; out += esc(name.slice(i, a)) + '<mark>' + esc(name.slice(a, b)) + '</mark>'; i = b; });
      return out + esc(name.slice(i));
    };
    const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const find = (group, words, max) => {
      const hits = data[group.toLowerCase()].filter(item => words.every(w => (item[0] + ' ' + (item[2] || '')).toLowerCase().includes(w)));
      return hits.slice(0, max);
    };
    const draw = () => {
      const q = input.value.trim().toLowerCase(), words = q.split(/\s+/).filter(Boolean);
      rows = [];
      let html = '';
      const s = sum(input.value);
      if (s) { html += `<li class="pal-sum" role="presentation"><span>${esc(s.label)} =</span><b>${esc(s.value)}</b></li>`; rows.push({ kind: 'sum', s }); }
      ['Parts', 'Library', 'Commands'].forEach((group) => {
        const hits = words.length ? find(group, words, group === 'Parts' ? 6 : 5) : (group === 'Commands' ? data.commands.slice(0, 5) : []);
        if (!hits.length) return;
        html += `<li class="pal-h" role="presentation">${group}</li>`;
        hits.forEach((item) => {
          const id = rows.length;
          rows.push({ kind: group, item });
          const right = group === 'Commands' ? (item[1] || '') : verb[group];
          html += `<li class="pal-r" role="option" data-i="${id}">${icon[group]}<b>${mark(item[0], words)}</b><span>${esc(right)}</span></li>`;
        });
      });
      if (!rows.length) html = `<li class="pal-none" role="presentation">${q ? 'Nothing called “' + esc(input.value.trim()) + '”' : 'Type a part, a command or a sum'}</li>`;
      list.innerHTML = html;
      at = Math.min(at, Math.max(0, rows.length - 1));
      mark_on();
    };
    const mark_on = () => {
      $$('.pal-r', list).forEach((row) => row.classList.toggle('is-on', +row.dataset.i === at));
      const row = $('.pal-r.is-on', list);
      if (row) { const top = row.offsetTop, bottom = top + row.offsetHeight; if (top < list.scrollTop + 28) list.scrollTop = Math.max(0, top - 36); else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 6; }
    };
    const run = (i) => {
      const r = rows[i]; if (!r) return;
      if (r.kind === 'sum') {
        out.innerHTML = `Copied <b>${esc(r.s.copy)}</b>`;
        if (navigator.clipboard) navigator.clipboard.writeText(r.s.copy).catch(() => {});
      } else if (r.kind === 'Parts') out.innerHTML = `Selected <b>${esc(r.item[0])}</b> and framed it${r.item[2] ? ' · ' + esc(r.item[2]) : ''}`;
      else if (r.kind === 'Library') out.innerHTML = `Added <b>${esc(r.item[0])}</b> to the scene${r.item[2] ? ' · ' + esc(r.item[2]) : ''}`;
      else out.innerHTML = `<b>${esc(r.item[0])}</b> opens${r.item[2] ? ': ' + esc(r.item[2]) : ' its panel'}`;
    };
    input.addEventListener('input', () => { at = 0; out.textContent = ''; draw(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); at = Math.min(rows.length - 1, at + 1); mark_on(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); at = Math.max(0, at - 1); mark_on(); }
      else if (e.key === 'Enter') { e.preventDefault(); run(at); }
      else if (e.key === 'Escape') { input.value = ''; at = 0; out.textContent = ''; draw(); }
    });
    list.addEventListener('mousemove', (e) => { const row = e.target.closest('.pal-r'); if (row && +row.dataset.i !== at) { at = +row.dataset.i; mark_on(); } });
    list.addEventListener('click', (e) => { const row = e.target.closest('.pal-r,.pal-sum'); if (!row) return; if (row.dataset.i) { at = +row.dataset.i; mark_on(); } run(row.dataset.i ? at : 0); });
    draw();
  });

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
