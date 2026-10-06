// ========== LAB PAGE — the journal ==========
// The Lab reads like a personal sketchbook feed: one column of entries, each
// with a small header line, a title, an optional note, and its picture or
// clip at its own proportions. Files that belong together are posted as one
// entry you can flick through. Clicking any picture opens the shared lightbox
// (overlay.js) scoped to the Lab.
//
// Clips are plain posters until they are needed: with a mouse the clip in
// view plays by itself (one <video> per clip, created on first play); on
// phones nothing is decoded until a tap opens it in the lightbox.

(function initLab() {
  const feed = document.getElementById('labFeed');
  if (!feed) return;

  const lab = (window.projects || {}).lab;
  if (!lab || !Array.isArray(lab.images)) {
    feed.innerHTML = '<p class="entry-note">No entries yet — check back soon.</p>';
    return;
  }

  // ---- Writing the journal ---------------------------------------------
  // SETS: files posted together as one entry, in the order they are shown.
  // NOTES: title / date / note for a single file, keyed by file name.
  // Both accept `date` ('2025-03-14', or any text such as 'Spring 2024') and
  // `note` (a line or two of journal text); each is shown only when present.
  // A Lab file listed in neither becomes an entry titled from its file name.
  // APPS: small apps, tools and web experiments, posted at the top of the
  // feed and listed on their own under the "Apps & web" filter. Give each a
  // `title` and a `repo` (its GitHub link) and/or a `url` (where it runs);
  // `kind` (the header word: 'App' unless set, e.g. 'Web experiment'), `date`,
  // `note`, `tags` and `image` (a screenshot, opened in the lightbox) are optional.
  const APPS = [
    // { title: 'App name', repo: 'https://github.com/xpayn3/app-name', url: 'https://…', date: '2026-11-01',
    //   note: 'What it does, in a line or two.', tags: ['Three.js', 'WebGL'], image: 'Images/Lab/app-name.webp' },
  ];
  const SETS = [
    { title: 'Dream', files: ['Dream_01.webp', 'Dream_02.webp', 'Dream_03.webp', 'Dream_03-2.webp', 'Dream_04-2.webp'] },
    { title: 'Kristal', files: ['lab_kristal.webm', 'lab_kristal_story.webm', 'kristal0020.webp', 'kristal0025.webp', 'kristal0026.webp'] },
    { title: 'Quartz', files: ['qurtz0012.webp', 'qurtz0033.webp'] },
    { title: 'Kersnikova logo', files: ['kersnikova_logo_preview.webm', 'Kersnikova_logo_take4_4.webp'] },
    { title: 'Mecha', files: ['mecha.webp', 'mecha_02.webp', 'mecha_03.webp', 'mecha_04.webp'] },
    { title: 'Mecha grid', files: ['mecha_grid_8.webp', 'mecha_grid_9.webp', 'mecha_grid_11.webp'] },
    { title: 'Bossplast', files: ['Bossplast.webp', 'Bossplast_smoke.webp'] },
  ];
  const NOTES = {
    // 'gold.webm': { title: 'Gold', date: '2024-11-02', note: 'First try at …' },
  };

  // width / height of each file, so an entry holds its place before its
  // picture loads. A file missing here falls back to 16:9 until it loads.
  const RATIOS = {
    'Fly_fico.webm': 1.778, 'Furry_jezik.webm': 1, 'gold.webm': 1, 'Particles2.webm': 1.778,
    'lab_comp.webm': 1, 'lab_impol.webm': 1.778, 'lab_sandunes.webm': 1.778, 'Dream_01.webp': 1.6,
    'Dream_02.webp': 1.6, 'Dream_03.webp': 1.6, 'Dream_03-2.webp': 1.6, 'Dream_04-2.webp': 1.6,
    'lab_kristal.webm': 1, 'lab_kristal_story.webm': 1, 'kristal0020.webp': 1,
    'kristal0025.webp': 1, 'kristal0026.webp': 1, 'qurtz0012.webp': 1, 'qurtz0033.webp': 1,
    'testgoba_3.webp': 1.6, 'take_3_0138.webp': 1.778, 'Kersnikova_logo_take4_4.webp': 1.778,
    'end.webp': 1.778, 'lm62ZTf.webp': 1.8, 'lab_flag.webm': 1.778, 'mecha.webp': 0.667,
    'mecha_02.webp': 0.667, 'mecha_03.webp': 0.667, 'mecha_04.webp': 0.667,
    'mecha_grid_8.webp': 0.667, 'mecha_grid_9.webp': 0.667, 'mecha_grid_11.webp': 0.667,
    'LaLuna_test_RUN.webm': 2.358, 'ENKI-screensaver_1.webm': 1.776,
    'kersnikova_logo_preview.webm': 1.776, 'scandianvian.[0000-0244].webm': 1.776,
    'Short_napis 16-9_2.webm': 1.776, '222.webp': 0.7, 'hand.webp': 1.776, 'legs.webp': 1.776,
    'face.webp': 1.598, 'zadni_2.webp': 1.776, 'puma.webp': 1.776, 'Bossplast_smoke.webp': 1.776,
    'BF.webp': 1.776, 'Bossplast.webp': 1.776, '2880x1560.webp': 1.843, 'car.webm': 1.778,
  };

  const VIDEO_RE = /\.(webm|mp4|mov|m4v)$/i;
  const isVideo = src => VIDEO_RE.test(src);
  const posterOf = src => src.replace(VIDEO_RE, '_thumb.webp');
  const fileOf = src => src.split('/').pop() || '';
  const nameOf = (src) => {
    const name = fileOf(src).replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  const pad2 = n => String(n).padStart(2, '0');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };
  const dateText = (date) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return String(date);
    return new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // ---- Entries, in the order the files are listed in projects.js ---------
  // Filter out screenshot/mockup clutter (same rule the main grid uses).
  const excludeRe = window.gridExclude || /screenshot|zbrush|Mockup/i;
  const sources = lab.images.filter(src => !excludeRe.test(src));
  const byFile = new Map(sources.map(src => [fileOf(src), src]));
  const setOf = new Map();
  SETS.forEach(set => set.files.forEach(file => setOf.set(file, set)));

  const entries = APPS.map(app => Object.assign({}, app, { app: true, media: app.image ? [app.image] : [] }));
  const posted = new Set();
  sources.forEach((src) => {
    const set = setOf.get(fileOf(src));
    if (!set) {
      entries.push(Object.assign({ title: nameOf(src) }, NOTES[fileOf(src)], { media: [src] }));
    } else if (!posted.has(set)) {
      posted.add(set);
      entries.push(Object.assign({}, set, { media: set.files.map(file => byFile.get(file)).filter(Boolean) }));
    }
  });

  // The lightbox walks every picture of the feed, top to bottom.
  const flat = entries.flatMap(entry => entry.media);
  function openAt(idx) {
    if (typeof window.setLightboxItems === 'function') window.setLightboxItems(flat, true);
    if (typeof window.openLightbox === 'function') window.openLightbox(idx);
  }

  function makeSlide(src, flatIdx, title) {
    const clip = isVideo(src);
    const slide = el('button', 'entry-slide');
    slide.type = 'button';
    slide.style.setProperty('--ar', RATIOS[fileOf(src)] || 16 / 9);
    if (clip) slide.dataset.clip = src;

    const img = el('img');
    Object.assign(img, {
      src: clip ? posterOf(src) : src, loading: 'lazy', decoding: 'async',
      alt: `${title} — 3D experiment by Luka Grčar`,
    });
    if (!RATIOS[fileOf(src)]) {
      img.addEventListener('load', () => slide.style.setProperty('--ar', img.naturalWidth / img.naturalHeight), { once: true });
    }
    slide.appendChild(img);
    if (clip) slide.appendChild(el('span', 'entry-badge', 'Clip'));
    slide.addEventListener('click', () => openAt(flatIdx));
    return slide;
  }

  // A set is a sideways strip of slides with a counter and, with a mouse,
  // a pair of arrows; on touch you just swipe it.
  function wireSet(media, track, total) {
    const count = el('span', 'entry-count', `1 / ${total}`);
    const prev = el('button', 'entry-nav is-prev', '←');
    const next = el('button', 'entry-nav is-next', '→');
    prev.type = next.type = 'button';
    prev.setAttribute('aria-label', 'Previous picture');
    next.setAttribute('aria-label', 'Next picture');
    const at = () => Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    const sync = () => {
      const i = at();
      count.textContent = `${i + 1} / ${total}`;
      prev.disabled = i === 0;
      next.disabled = i === total - 1;
    };
    const step = dir => track.scrollBy({ left: dir * track.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
    prev.addEventListener('click', () => step(-1));
    next.addEventListener('click', () => step(1));
    track.addEventListener('scroll', sync, { passive: true });
    media.append(count, prev, next);
    sync();
  }

  // An app's small print: its tags, then where to find it.
  function makeAppLinks(app) {
    const row = el('div', 'entry-links');
    (app.tags || []).forEach(tag => row.append(el('span', 'entry-tag', tag)));
    const link = (href, text) => {
      const a = el('a', 'entry-link', text);
      Object.assign(a, { href, target: '_blank', rel: 'noopener noreferrer' });
      return a;
    };
    if (app.url) row.append(link(app.url, 'Open app ↗'));
    if (app.repo) row.append(link(app.repo, `${app.repo.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, '')} ↗`));
    return row;
  }

  function makeEntry(entry, idx, flatStart) {
    const clips = entry.media.filter(isVideo).length;
    const total = entry.media.length;
    const article = el('article', 'entry');
    article.id = `entry-${idx + 1}`;
    if (entry.app) article.dataset.app = '';
    else if (clips) article.dataset.clip = '';
    if (!entry.app && clips < total) article.dataset.still = '';

    const head = el('header', 'entry-head');
    head.append(el('span', '', pad2(idx + 1)), el('span', '', entry.app ? (entry.kind || 'App') : total > 1 ? `Set of ${total}` : clips ? 'Clip' : 'Still'));
    if (entry.date) head.append(el('time', '', dateText(entry.date)));
    article.append(head, el('h2', 'entry-title', entry.title));
    if (entry.note) article.append(el('p', 'entry-note', entry.note));
    if (entry.app) article.append(makeAppLinks(entry));
    if (!total) return article;

    const media = el('div', 'entry-media');
    const track = el('div', 'entry-track');
    entry.media.forEach((src, i) => track.appendChild(makeSlide(src, flatStart + i, entry.title)));
    media.appendChild(track);
    if (total > 1) wireSet(media, track, total);
    article.appendChild(media);
    return article;
  }

  const frag = document.createDocumentFragment();
  let flatStart = 0;
  entries.forEach((entry, idx) => {
    frag.appendChild(makeEntry(entry, idx, flatStart));
    flatStart += entry.media.length;
  });
  feed.prepend(frag);                      // ahead of the "nothing here yet" note

  const countEl = document.getElementById('labCount');
  if (countEl) countEl.textContent = String(entries.length);

  // ---- Show: all / stills / clips / apps ---------------------------------
  const filterBtns = document.querySelectorAll('.journal-filter button');
  const emptyNote = document.getElementById('labEmpty');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const show = btn.dataset.show;
      let shown = 0;
      filterBtns.forEach(b => b.classList.toggle('is-active', b === btn));
      feed.querySelectorAll('.entry').forEach((entry) => {
        entry.hidden = show !== 'all' && !(show in entry.dataset);
        if (!entry.hidden) shown++;
      });
      if (emptyNote) emptyNote.hidden = shown > 0;
    });
  });

  // ---- Clips play while they are the thing on screen (mouse only) -------
  if (canHover && !reducedMotion) {
    const playObs = new IntersectionObserver((seen) => {
      seen.forEach(({ target: slide, isIntersecting }) => {
        let video = slide.querySelector('video');
        if (!isIntersecting) {
          if (video) video.pause();
          return;
        }
        if (!video) {
          video = el('video');
          Object.assign(video, { src: slide.dataset.clip, muted: true, loop: true, playsInline: true, preload: 'metadata' });
          video.addEventListener('playing', () => slide.classList.add('is-playing'), { once: true });
          slide.appendChild(video);
        }
        video.play().catch(() => {});
      });
    }, { threshold: 0.6 });
    feed.querySelectorAll('.entry-slide[data-clip]').forEach(slide => playObs.observe(slide));
  }

  // Entries rise in the first time they scroll into view.
  const revealObs = new IntersectionObserver((seen) => {
    for (const item of seen) {
      if (!item.isIntersecting) continue;
      item.target.classList.add('in-view');
      revealObs.unobserve(item.target);
    }
  }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
  feed.querySelectorAll('.entry').forEach(entry => revealObs.observe(entry));

  // Footer reveal (same pattern as other pages)
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  new IntersectionObserver((seen) => {
    document.body.classList.toggle('footer-visible', seen.some(item => item.isIntersecting));
  }, { threshold: 0.05 }).observe(footer);
})();
