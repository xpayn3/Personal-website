// ========== APP PAGE (apps/<id>.html) ==========
// Draws one app's page from the list in apps.js, laid out as a product
// presentation: a big title and a line about it with the release facts
// listed beside them, the app itself as a wide picture, then sections with
// a small label in the margin
// and the content beside it: what it is, headline figures, a closer look
// (picture and text side by side, alternating), how it works, features, how
// to start, the changelog and an information table. Every part is optional
// and only drawn when the app has it. Look: apps.css.

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
  // Sections share one grid (.app-body): a numbered label in the left
  // column and the section's content beside it. The labels are sticky and
  // pile up under each other as you scroll, as on the project pages; a
  // click on one glides to its section, and the one being read is lit.
  // Returns the content cell to fill.
  const body = el('div', 'app-body');
  const rows = [];
  const section = (title) => {
    const r = rows.length + 1;
    const label = el('h2', 'app-label');
    label.style.setProperty('--r', r);
    const jump = el('button', 'app-jump');
    jump.type = 'button';
    jump.append(el('i', '', String(r).padStart(2, '0')), title);
    label.append(jump);
    const cell = el('section', 'app-row');
    cell.style.setProperty('--r', r);
    cell.setAttribute('aria-label', title);
    jump.addEventListener('click', () => {
      const top = cell.getBoundingClientRect().top + window.scrollY - PIN_TOP;
      if (window.pageLenis) window.pageLenis.scrollTo(top);
      else window.scrollTo({ top, behavior: 'smooth' });
    });
    body.append(label, cell);
    rows.push({ label, cell });
    return cell;
  };
  const PIN_TOP = 96;                      // where the pile starts, clear of the site nav (apps.css: --pin)

  // ---- feature icons ------------------------------------------------------
  // Simple line icons on a 24px grid, drawn small beside each feature's
  // name. A feature names its icon as a third value, or gets the first one
  // whose pattern matches its name.
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
  // A picture that opens full screen on a click must also be reachable and
  // operable from the keyboard: focusable, announced as a button, and opened
  // by Enter or Space.
  function opens(img, label, open) {
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', label);
    img.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      open();
    });
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
      opens(img, `${caption}: open full screen`, () => openViewer(items, i));
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
  // Where a strip rests with this picture in the middle of it. The first and
  // the last picture rest against the strip's ends instead.
  function restOf(strip, fig) {
    const max = strip.scrollWidth - strip.clientWidth;
    const middle = fig.offsetLeft - strip.offsetLeft + fig.offsetWidth / 2 - strip.clientWidth / 2;
    return Math.max(0, Math.min(max, middle));
  }
  // A strip of pictures scrolls sideways by touch already; with a mouse,
  // press and drag it. It glides on a little after a flick, but stops dead
  // if the mouse was resting when you let go. A strip of screenshots
  // (.is-wide) is paged instead: let go anywhere and it settles with one
  // picture in the middle, a flick taking it on to the next. Touch and
  // trackpads get the same from scroll snapping (apps.css), which is switched
  // off (.is-free) while the mouse has the strip.
  function dragToScroll(strip) {
    const paged = strip.classList.contains('is-wide');
    let startX = 0, startLeft = 0, lastX = 0, lastT = 0, speed = 0, held = false, moved = false, glide = 0, gliding = false;
    const settle = () => {
      const rests = [...strip.children].map(fig => restOf(strip, fig));
      const from = strip.scrollLeft;
      let at = 0;
      rests.forEach((rest, i) => { if (Math.abs(rest - from) < Math.abs(rests[at] - from)) at = i; });
      const dir = speed < -2 ? 1 : speed > 2 ? -1 : 0;      // the strip moves against the mouse
      if (dir && (rests[at] - from) * dir <= 0) at = Math.max(0, Math.min(rests.length - 1, at + dir));
      const to = rests[at];
      const done = () => { strip.scrollLeft = to; gliding = false; strip.classList.remove('is-free'); };
      if (Math.abs(to - from) < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
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
      delete strip.dataset.dragged;          // any new press, by mouse, finger or pen, starts clean
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      cancelAnimationFrame(glide);
      held = true;
      moved = false;
      startX = lastX = e.clientX;
      lastT = e.timeStamp;
      startLeft = strip.scrollLeft;
      speed = 0;
    });
    // listen on the window so the drag carries on when the mouse leaves the strip
    window.addEventListener('pointermove', (e) => {
      if (!held) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 4) return;       // a click, not a drag, so far
      if (!moved) { moved = true; strip.classList.add('is-held'); if (paged) strip.classList.add('is-free'); strip.dataset.dragged = '1'; }
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
      if (paged) {
        if (e.timeStamp - lastT > 80) speed = 0;        // let go while resting: the nearest picture
        if (moved || gliding) settle();                 // (a press that caught it settling lets it finish)
        return;
      }
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

  // ---- pictures: page dots and full screen ---------------------------------
  // Nothing to press: a strip is moved by dragging (or touch), a row of dots
  // under it shows where you are, and a click on a picture opens it in the
  // lightbox.

  // The dots for a strip: one per picture, the lit one following the strip
  // however it is moved. Call .sync() once the strip is in the page.
  function dots(strip) {
    const figs = [...strip.children];
    const row = el('div', 'app-dots');
    row.setAttribute('aria-hidden', 'true');
    const marks = figs.map(() => row.appendChild(el('i')));
    const rest = (fig) => restOf(strip, fig);    // lit: the picture nearest the middle
    row.sync = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      let now = 0;
      if (max > 0 && strip.scrollLeft >= max - 2) now = figs.length - 1;
      else figs.forEach((fig, i) => {
        if (Math.abs(rest(fig) - strip.scrollLeft) < Math.abs(rest(figs[now]) - strip.scrollLeft)) now = i;
      });
      marks.forEach((mark, i) => mark.classList.toggle('is-active', i === now));
    };
    strip.addEventListener('scroll', row.sync, { passive: true });
    return row;
  }

  // Full screen: the site's own lightbox (overlay.js), the same one the
  // project pages and the Lab open, so pictures look and behave alike
  // everywhere. `items` are [image, caption] pairs.
  function openViewer(items, index) {
    if (typeof window.setLightboxItems !== 'function' || typeof window.openLightbox !== 'function') return;
    window.setLightboxItems(items.map(([src]) => src), false);
    window.openLightbox(index);
  }

  // ---- opening: what it is, its name, a line about it, where to get it ----
  const hero = el('header', 'app-hero');
  const kicker = el('p', 'app-kicker');
  kicker.append(el('span', '', 'App'), el('span', '', app.category));
  if (app.stage) kicker.append(el('span', 'app-stage is-' + app.stage.toLowerCase(), app.stage));
  const actions = el('div', 'app-actions');
  if (app.url) actions.append(link(app.url, 'app-btn is-primary', 'Open app'));
  // Download: the app's source as a zip, straight from its GitHub repository.
  // "HEAD" is whatever the repository's main branch is called, so the link
  // always gives the current code. An app can name another file with
  // `download`. It is the main button for apps that only run locally.
  const zip = app.download || (app.repo ? app.repo.replace(/\/+$/, '') + '/archive/HEAD.zip' : '');
  if (zip) {
    const get = el('a', 'app-btn' + (app.url ? '' : ' is-primary'), 'Download .zip ↓');
    get.href = zip;
    get.setAttribute('download', '');
    get.rel = 'noopener';
    actions.append(get);
  }
  if (app.repo) actions.append(link(app.repo, 'app-btn', 'GitHub'));
  // the title takes the full width; under it, the line about the app and
  // its buttons on the left, the release facts on the right
  const lead = el('div', 'app-hero-main');
  lead.append(el('p', 'app-subtitle', app.subtitle), actions);

  // ---- release facts: version, platform and so on, listed beside the title ----
  const stats = el('dl', 'app-stats');
  (app.stats || []).forEach(([label, value]) => {
    const item = el('div');
    item.append(el('dt', '', label), el('dd', '', value));
    stats.append(item);
  });
  const under = el('div', 'app-hero-row');
  under.append(lead);
  if (stats.children.length) under.append(stats);
  hero.append(kicker, el('h1', 'app-title', app.title), under);

  // ---- the app itself: one wide picture; a click opens the screenshots ----
  const shots = app.shots || [];
  const coverSrc = app.cover || (shots[0] && shots[0][0]);
  let cover = null;
  if (coverSrc) {
    cover = el('figure', 'app-cover');
    const img = el('img');
    Object.assign(img, { src: coverSrc, alt: `${app.title}: the app's interface`, decoding: 'async' });
    cover.append(img);
    const pictures = shots.length ? shots : [[coverSrc, app.title]];
    const at = Math.max(0, pictures.findIndex(([src]) => src === coverSrc));
    img.addEventListener('click', () => openViewer(pictures, at));
    opens(img, `${app.title}: open the screenshots full screen`, () => openViewer(pictures, at));
  }

  const back = el('a', 'app-back', '← Lab');
  back.href = 'lab.html';
  root.replaceChildren(...[back, hero, cover, body].filter(Boolean));

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

  // ---- more screenshots: a strip to drag through (the first is the cover) ----
  if (shots.length > 1) {
    const strip = figures(shots, 'app-shots is-wide');
    const sec = section('Screens');
    sec.append(strip);
    const row = dots(strip);
    sec.append(row);
    row.sync();
  }

  // ---- a closer look: a picture and what it shows, side by side ----
  if (app.spotlights && app.spotlights.length) {
    const grid = el('div', 'app-spots');
    const pictures = app.spotlights.map(([name, , image]) => [image, name]);
    app.spotlights.forEach(([name, line, image], i) => {
      const card = el('figure');
      const img = el('img');
      Object.assign(img, { src: image, alt: `${app.title}: ${name}`, loading: 'lazy', decoding: 'async' });
      img.addEventListener('click', () => openViewer(pictures, i));
      opens(img, `${name}: open full screen`, () => openViewer(pictures, i));
      const caption = el('figcaption');
      caption.append(el('i', '', String(i + 1).padStart(2, '0')), el('strong', '', name), el('span', '', line));
      card.append(img, caption);
      grid.append(card);
    });
    section('A closer look').append(grid);
  }

  // ---- in motion: short silent loops of a tool at work, as cards ----
  // A clip is only fetched and played while its card is on screen, and stops
  // when it leaves. On touch devices and with reduced motion it stays a
  // poster until the card is tapped (the performance rules for phones).
  if (app.clips && app.clips.length) {
    const grid = el('div', 'app-clips');
    const auto = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = (v) => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const watch = auto && 'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => entries.forEach((e) => {
          if (e.isIntersecting) start(e.target); else e.target.pause();
        }), { threshold: 0.35 })
      : null;
    app.clips.forEach(([name, line, src], i) => {
      const card = el('figure');
      const video = el('video');
      Object.assign(video, { src, poster: src.replace(/\.(webm|mp4)$/, '_thumb.webp'), muted: true, loop: true, playsInline: true, preload: 'none', disablePictureInPicture: true });
      video.setAttribute('aria-label', `${app.title}: ${name}`);
      if (watch) watch.observe(video);
      else {
        card.classList.add('is-tap');
        const toggle = () => {
          if (video.paused) start(video); else video.pause();
          card.classList.toggle('is-playing', !video.paused);
        };
        video.addEventListener('click', toggle);
        opens(video, `${name}: play the clip`, toggle);
      }
      const caption = el('figcaption');
      caption.append(el('i', '', String(i + 1).padStart(2, '0')), el('strong', '', name), el('span', '', line));
      card.append(video, caption);
      grid.append(card);
    });
    section('In motion').append(grid);
  }

  if (app.steps && app.steps.length) {
    const list = el('ol', 'app-steps');
    app.steps.forEach(([name, line], i) => {
      const item = el('li');
      item.append(el('span', 'app-step-no', String(i + 1).padStart(2, '0')), el('strong', '', name), el('span', '', line));
      list.append(item);
    });
    section('How it works').append(list);
  }

  // ---- features: one grid, or a grid per group ----
  if (app.featureGroups && app.featureGroups.length) {
    const sec = section('Features');
    app.featureGroups.forEach((group) => {
      const head = el('h3', 'app-group');
      head.append(el('span', '', group.title));
      if (group.note) head.append(el('i', '', group.note));
      sec.append(head, featureGrid(group.items));
    });
  } else if (app.features && app.features.length) {
    section('Features').append(featureGrid(app.features));
  }

  // ---- the same app on a phone: tall screenshots in a strip of their own ----
  if (app.phone && app.phone.length) section('On a phone').append(figures(app.phone, 'app-shots is-phone'));

  if (app.gallery && app.gallery.length) section(app.galleryTitle || 'Gallery').append(figures(app.gallery, 'app-shots'));

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
    const sec = section('Changelog');
    const list = el('ol', 'app-log');
    app.changelog.versions.forEach((entry) => {
      const item = el('li');
      const head = el('div', 'app-log-head');
      head.append(el('strong', '', `v${entry.version}`));
      if (entry.latest) head.append(el('em', '', 'Latest'));
      if (entry.date) head.append(el('span', '', entry.date));
      const notes = el('div', 'app-log-body');
      notes.append(el('p', '', entry.summary));
      if (entry.items && entry.items.length) {
        const changes = el('ul');
        entry.items.forEach(([tag, line]) => {
          const change = el('li');
          change.append(el('b', `is-${tag.toLowerCase()}`, tag), el('span', '', line));
          changes.append(change);
        });
        notes.append(changes);
      }
      item.append(head, notes);
      list.append(item);
    });
    sec.append(list);
    if (app.changelog.link) sec.append(link(app.changelog.link, 'app-more', 'Full changelog'));
  }

  if (app.whatsNew) section("What's new").append(el('p', 'app-text', `Version ${app.whatsNew.version}. ${app.whatsNew.text}`));

  if (app.info && app.info.length) {
    const table = el('dl', 'app-info');
    app.info.forEach(([label, value]) => {
      const row = el('div');
      row.append(el('dt', '', label), el('dd', '', value));
      table.append(row);
    });
    section('Information').append(table);
  }

  // ---- the pile of labels: how many there are, and which one is being read ----
  body.style.setProperty('--n', rows.length);
  // (a handful of measurements per scroll event: cheap enough to do directly)
  let current = -1;
  const mark = () => {
    const line = window.innerHeight * 0.4;
    let now = 0;
    rows.forEach(({ cell }, i) => { if (cell.getBoundingClientRect().top <= line) now = i; });
    if (now === current) return;
    current = now;
    rows.forEach(({ label }, i) => label.classList.toggle('is-current', i === now));
  };
  window.addEventListener('scroll', mark, { passive: true });
  mark();
})();
