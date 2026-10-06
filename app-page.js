// ========== APP PAGE (apps/<id>.html) ==========
// Draws one app's page from the list in apps.js, laid out like a store's
// product page: icon and buttons, a strip of facts, screenshots, headline
// figures, picture cards, how it works, feature tiles with icons, how to start, the
// changelog, and an information table. Every part is optional and only
// drawn when the app has it. Look: apps.css.

(function initAppPage() {
  const root = document.getElementById('appPage');
  const app = (window.labApps || []).find(a => a.id === window.APP_PAGE);
  if (!root || !app) return;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const link = (href, className, text) => {
    const a = el('a', className, text);
    Object.assign(a, { href, target: '_blank', rel: 'noopener noreferrer' });
    return a;
  };
  const section = (title, aside) => {
    const sec = el('section', 'app-section');
    const head = el('div', 'app-section-head');
    head.append(el('h2', '', title));
    if (aside) head.append(typeof aside === 'string' ? el('span', '', aside) : aside);
    sec.append(head);
    root.append(sec);
    return sec;
  };

  // ---- feature icons ------------------------------------------------------
  // Line icons on a 24px grid. A feature names its icon as a third value,
  // or gets the first one whose pattern matches its name.
  const ICONS = {
    tree: 'M10 3h4v4h-4zM12 7v5M6 15v-3h12v3M4 15h4v4H4zM16 15h4v4h-4z',
    cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9',
    copies: 'M8 8h11v11H8zM5 16V5h11',
    mesh: 'M12 4l9 16H3zM12 4v16M7.5 12h9',
    package: 'M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8',
    play: 'M7 4l12 8-12 8z',
    pulse: 'M3 12h4l3-7 4 14 3-7h4',
    monitor: 'M3 5h18v11H3zM9 20h6M12 16v4',
    slice: 'M4 20L20 4M4 4h7v7H4zM13 13h7v7h-7z',
    sun: 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    pointer: 'M5 3l14 8-6 2-2 6z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 100 6 3 3 0 000-6z',
    drop: 'M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    aperture: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 3l4 7M21 12h-8M16.5 19.8l-4-7M7.5 19.8l4-7M3 12h8M7.5 4.2l4 7',
    search: 'M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-4-4',
    layers: 'M12 4l9 5-9 5-9-5zM3 14l9 5 9-5',
    text: 'M5 6h14M12 6v13M9 19h6',
    undo: 'M4 9h10a5 5 0 010 10H9M4 9l4-4M4 9l4 4',
    menu: 'M4 6h16M4 12h16M4 18h10',
    download: 'M12 4v11M7 11l5 5 5-5M5 20h14',
    file: 'M6 3h8l4 4v14H6zM14 3v4h4',
    bookmark: 'M6 4h12v16l-6-4-6 4z',
    upload: 'M12 16V5M7 9l5-5 5 5M5 20h14',
    command: 'M9 9h6v6H9zM9 9V6.5A2.5 2.5 0 106.5 9H9zM15 9h2.5A2.5 2.5 0 1015 6.5V9zM15 15v2.5a2.5 2.5 0 102.5-2.5H15zM9 15H6.5A2.5 2.5 0 109 17.5V15z',
    keyboard: 'M3 7h18v10H3zM7 11h.01M11 11h.01M15 11h.01M7 14h10',
    refresh: 'M20 12a8 8 0 10-2.6 5.9M20 5v5h-5',
    shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    code: 'M9 8l-5 4 5 4M15 8l5 4-5 4',
    leaf: 'M5 19c0-9 5-14 15-14 0 10-5 15-14 15zM5 19l8-8',
    globe: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18',
    phone: 'M8 3h8v18H8zM11 18h2',
    wind: 'M3 9h11a3 3 0 10-3-3M3 15h15a3 3 0 11-3 3M3 12h7',
    spark: 'M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z',
  };
  const HINTS = [
    [/xcaf|reader|tree|hierarch/i, 'tree'], [/hash|instanc|pose/i, 'copies'], [/tessellat|wireframe|matcap/i, 'mesh'],
    [/meshopt|draco|compress|glb|gltf/i, 'package'], [/launch|start/i, 'play'], [/job|progress/i, 'pulse'],
    [/renderer|browser/i, 'monitor'], [/section|clip/i, 'slice'], [/pbr|light|environment/i, 'sun'],
    [/pick/i, 'pointer'], [/hide|isolate|solo/i, 'eye'], [/colou?r/i, 'drop'], [/path tracer/i, 'aperture'],
    [/search|filter/i, 'search'], [/flatten|dissolve/i, 'layers'], [/rename/i, 'text'], [/undo/i, 'undo'],
    [/right-click|menu/i, 'menu'], [/fbx|usdz|obj|stl|export/i, 'download'], [/save|scene/i, 'bookmark'],
    [/welcome|drop/i, 'upload'], [/command/i, 'command'], [/shortcut|keyboard/i, 'keyboard'],
    [/session|resum/i, 'refresh'], [/non-destructive|safe/i, 'shield'], [/build|code/i, 'code'],
    [/species|preset|leaf/i, 'leaf'], [/install/i, 'phone'], [/wind/i, 'wind'],
  ];
  const NS = 'http://www.w3.org/2000/svg';
  function icon(name, hint) {
    const key = ICONS[hint] ? hint : (HINTS.find(([re]) => re.test(name)) || [])[1] || 'spark';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', ICONS[key]);
    svg.append(path);
    const tile = el('span', 'app-feature-icon');
    tile.append(svg);
    return tile;
  }
  function featureGrid(items) {
    const list = el('ul', 'app-features');
    items.forEach(([name, line, hint]) => {
      const item = el('li');
      item.append(icon(name, hint), el('strong', '', name), el('span', '', line));
      list.append(item);
    });
    return list;
  }
  function figures(items, className, alt) {
    const strip = el('div', className);
    items.forEach(([src, caption], i) => {
      const figure = el('figure');
      figure.dataset.index = i;
      const img = el('img');
      Object.assign(img, { src, alt: `${app.title}: ${alt || caption}`, loading: 'lazy', decoding: 'async', draggable: false });
      figure.append(img, el('figcaption', '', caption));
      strip.append(figure);
    });
    dragToScroll(strip);
    // A click on a picture opens it full screen. A press that turned into a
    // drag (dragToScroll marks the strip) is not a click.
    strip.addEventListener('click', (e) => {
      if (strip.dataset.dragged) return;
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const figure = under && under.closest('figure');
      if (figure && strip.contains(figure)) openViewer(items, Number(figure.dataset.index));
    });
    return strip;
  }
  // A strip of pictures scrolls sideways by touch already; with a mouse,
  // press and drag it. It glides on a little after a flick, but stops dead
  // if the mouse was resting when you let go.
  function dragToScroll(strip) {
    let startX = 0, startLeft = 0, lastX = 0, lastT = 0, speed = 0, held = false, moved = false, glide = 0;
    strip.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(glide);
      held = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = e.timeStamp;
      delete strip.dataset.dragged;
      startLeft = strip.scrollLeft;
      speed = 0;
    });
    // listen on the window so the drag carries on when the mouse leaves the strip
    window.addEventListener('pointermove', (e) => {
      if (!held) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 4) return;       // a click, not a drag, so far
      if (!moved) { moved = true; strip.classList.add('is-held'); strip.dataset.dragged = '1'; }
      const dt = Math.max(1, e.timeStamp - lastT);
      speed = 0.7 * speed + 0.3 * ((e.clientX - lastX) / dt * 16);   // px per frame, smoothed
      lastX = e.clientX;
      lastT = e.timeStamp;
      strip.scrollLeft = startLeft - dx;
    });
    const release = (e) => {
      if (!held) return;
      held = false;
      strip.classList.remove('is-held');
      if (!moved || e.timeStamp - lastT > 80) return;   // let go while resting: no glide
      const coast = () => {
        speed *= 0.94;
        strip.scrollLeft -= speed;
        if (Math.abs(speed) > 0.3) glide = requestAnimationFrame(coast);
      };
      coast();
    };
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
  }

  // ---- pictures: paging and full screen -----------------------------------
  const SVG_ICONS = {
    prev: 'M14.5 5.5L8 12l6.5 6.5',
    next: 'M9.5 5.5L16 12l-6.5 6.5',
    expand: 'M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5',
    close: 'M6 6l12 12M18 6L6 18',
  };
  function iconButton(name, label, className) {
    const button = el('button', className);
    button.type = 'button';
    button.setAttribute('aria-label', label);
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', SVG_ICONS[name]);
    svg.append(path);
    button.append(svg);
    return button;
  }

  // Full screen: one picture at a time over the whole window, with arrows, a
  // counter and its caption. Built on first use and shared by every strip.
  // Left / right arrow keys page through; Escape or a click beside the
  // picture closes it.
  let viewer = null;
  function openViewer(items, index) {
    if (!viewer) {
      const dialog = el('dialog', 'app-viewer');
      dialog.setAttribute('aria-label', 'Pictures, full screen');
      const count = el('span', 'app-viewer-count');
      const close = iconButton('close', 'Close', 'app-viewer-btn');
      const bar = el('div', 'app-viewer-bar');
      bar.append(count, close);
      const stage = el('div', 'app-viewer-stage');
      const img = el('img');
      const prev = iconButton('prev', 'Previous picture', 'app-viewer-btn is-prev');
      const next = iconButton('next', 'Next picture', 'app-viewer-btn is-next');
      stage.append(img, prev, next);
      const caption = el('p', 'app-viewer-caption');
      dialog.append(bar, stage, caption);
      document.body.append(dialog);

      viewer = { dialog, img, count, caption, prev, next, items: [], index: 0 };
      viewer.show = (i) => {
        const n = viewer.items.length;
        viewer.index = (i + n) % n;
        const [src, text] = viewer.items[viewer.index];
        Object.assign(img, { src, alt: `${app.title}: ${text}` });
        // restart the little pop each time the picture changes
        img.classList.remove('is-in');
        void img.offsetWidth;
        img.classList.add('is-in');
        caption.textContent = text;
        count.textContent = `${viewer.index + 1} / ${n}`;
        prev.hidden = next.hidden = n < 2;
      };
      prev.addEventListener('click', () => viewer.show(viewer.index - 1));
      next.addEventListener('click', () => viewer.show(viewer.index + 1));
      close.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', (e) => { if (e.target === dialog || e.target === stage) dialog.close(); });
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') viewer.show(viewer.index - 1);
        if (e.key === 'ArrowRight') viewer.show(viewer.index + 1);
      });
      dialog.addEventListener('close', () => { document.documentElement.style.overflow = ''; });
    }
    viewer.items = items;
    viewer.show(index);
    document.documentElement.style.overflow = 'hidden';   // the page stays put behind it
    viewer.dialog.showModal();
  }

  // Classic paging for a strip: previous, a numbered button per picture,
  // next, and a full-screen button. It follows the strip however it is moved
  // (buttons, drag, touch or wheel).
  function pager(strip, items) {
    const nav = el('nav', 'app-pager');
    nav.setAttribute('aria-label', 'Pictures');
    const figs = [...strip.children];
    const leftOf = (fig) => fig.offsetLeft - strip.offsetLeft;
    const current = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      if (max <= 0) return 0;
      if (strip.scrollLeft >= max - 2) return figs.length - 1;
      let best = 0;
      figs.forEach((fig, i) => {
        if (Math.abs(leftOf(fig) - strip.scrollLeft) < Math.abs(leftOf(figs[best]) - strip.scrollLeft)) best = i;
      });
      return best;
    };
    const go = (i) => strip.scrollTo({ left: leftOf(figs[Math.max(0, Math.min(figs.length - 1, i))]), behavior: 'smooth' });

    const expand = iconButton('expand', 'View full screen', 'app-pager-expand');
    expand.addEventListener('click', () => openViewer(items, current()));
    if (figs.length < 2) { nav.append(expand); return nav; }

    const prev = iconButton('prev', 'Previous picture');
    const next = iconButton('next', 'Next picture');
    const pages = figs.map((fig, i) => {
      const button = el('button', '', String(i + 1));
      button.type = 'button';
      button.setAttribute('aria-label', `Picture ${i + 1} of ${figs.length}`);
      button.addEventListener('click', () => go(i));
      return button;
    });
    prev.addEventListener('click', () => go(current() - 1));
    next.addEventListener('click', () => go(current() + 1));
    const sync = () => {
      const now = current();
      pages.forEach((button, i) => {
        button.classList.toggle('is-active', i === now);
        if (i === now) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
      });
      prev.disabled = now === 0;
      next.disabled = now === figs.length - 1;
    };
    strip.addEventListener('scroll', sync, { passive: true });
    sync();
    nav.append(prev, ...pages, next, expand);
    return nav;
  }

  // ---- header: icon, name, buttons ----
  const hero = el('header', 'app-hero');
  const text = el('div', 'app-hero-text');
  const actions = el('div', 'app-actions');
  if (app.url) actions.append(link(app.url, 'app-btn is-primary', 'Open app ↗'));
  if (app.repo) actions.append(link(app.repo, 'app-btn', 'GitHub ↗'));
  const title = el('h1', 'app-title', app.title);
  if (app.stage) title.append(el('span', 'app-stage', app.stage));
  text.append(title, el('p', 'app-subtitle', app.subtitle), actions);
  hero.append(window.labAppIcon(app), text);

  // ---- strip of facts ----
  const stats = el('dl', 'app-stats');
  (app.stats || []).forEach(([label, value]) => {
    const item = el('div');
    item.append(el('dt', '', label), el('dd', '', value));
    stats.append(item);
  });

  const back = el('a', 'app-back', '← Lab');
  back.href = 'lab.html';
  root.replaceChildren(back, hero, stats);

  // ---- screenshots ----
  if (app.shots && app.shots.length) {
    const strip = figures(app.shots, 'app-shots is-wide');
    const sec = section('Preview');
    sec.append(strip);
    // built once the strip is in the page, so it can measure where it stands
    sec.querySelector('.app-section-head').append(pager(strip, app.shots));
  }

  // ---- description + headline figures ----
  const about = section('About');
  if (app.about && app.about.length) {
    about.append(el('p', 'app-lead', app.about[0]));
    app.about.slice(1).forEach(p => about.append(el('p', 'app-text', p)));
  }
  if (app.highlights && app.highlights.length) {
    const grid = el('div', 'app-highlights');
    app.highlights.forEach(([figure, line]) => {
      const card = el('div');
      card.append(el('strong', '', figure), el('span', '', line));
      grid.append(card);
    });
    about.append(grid);
  }

  // ---- a closer look: big cards, a picture with an icon, a name and a line ----
  if (app.spotlights && app.spotlights.length) {
    const grid = el('div', 'app-spots');
    app.spotlights.forEach(([name, line, image, hint]) => {
      const card = el('figure');
      const img = el('img');
      Object.assign(img, { src: image, alt: `${app.title}: ${name}`, loading: 'lazy', decoding: 'async' });
      const caption = el('figcaption');
      caption.append(icon(name, hint), el('strong', '', name), el('span', '', line));
      card.append(img, caption);
      grid.append(card);
    });
    section('A closer look').append(grid);
  }

  if (app.steps && app.steps.length) {
    const list = el('ol', 'app-steps');
    app.steps.forEach(([name, line], i) => {
      const item = el('li');
      item.append(el('span', 'app-step-no', String(i + 1)), el('strong', '', name), el('span', '', line));
      list.append(item);
    });
    section('How it works').append(list);
  }

  // ---- features: one grid, or a grid per group ----
  if (app.featureGroups && app.featureGroups.length) {
    const count = app.featureGroups.reduce((n, group) => n + group.items.length, 0);
    const sec = section('Features', String(count));
    app.featureGroups.forEach((group) => {
      const head = el('h3', 'app-group');
      head.append(el('span', '', group.title));
      if (group.note) head.append(el('i', '', group.note));
      sec.append(head, featureGrid(group.items));
    });
  } else if (app.features && app.features.length) {
    section('Features').append(featureGrid(app.features));
  }

  if (app.gallery && app.gallery.length) section(app.galleryTitle || 'Gallery', String(app.gallery.length)).append(figures(app.gallery, 'app-shots'));

  if (app.start) {
    const sec = section('Get started');
    sec.append(el('p', 'app-text', app.start.text));
    const list = el('dl', 'app-commands');
    app.start.commands.forEach(([label, command]) => {
      const row = el('div');
      row.append(el('dt', '', label), el('dd', '', command));
      list.append(row);
    });
    sec.append(list);
  }

  // ---- changelog: newest first, the latest with its tagged changes ----
  if (app.changelog && app.changelog.versions.length) {
    const sec = section('Changelog', app.changelog.link ? link(app.changelog.link, 'app-more', 'Full changelog ↗') : null);
    const list = el('ol', 'app-log');
    app.changelog.versions.forEach((entry) => {
      const item = el('li');
      const head = el('div', 'app-log-head');
      head.append(el('strong', '', `v${entry.version}`));
      if (entry.latest) head.append(el('em', '', 'Latest'));
      if (entry.date) head.append(el('span', '', entry.date));
      const body = el('div', 'app-log-body');
      body.append(el('p', '', entry.summary));
      if (entry.items && entry.items.length) {
        const changes = el('ul');
        entry.items.forEach(([tag, line]) => {
          const change = el('li');
          change.append(el('b', `is-${tag.toLowerCase()}`, tag), el('span', '', line));
          changes.append(change);
        });
        body.append(changes);
      }
      item.append(head, body);
      list.append(item);
    });
    sec.append(list);
  }

  if (app.whatsNew) section("What's new", `Version ${app.whatsNew.version}`).append(el('p', 'app-text', app.whatsNew.text));

  if (app.info && app.info.length) {
    const table = el('dl', 'app-info');
    app.info.forEach(([label, value]) => {
      const row = el('div');
      row.append(el('dt', '', label), el('dd', '', value));
      table.append(row);
    });
    section('Information').append(table);
  }
})();
