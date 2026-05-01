// ========== LAB PAGE ==========
// Reads all images from window.projects.lab and renders them as "workshop"
// cards — subtle random tilts, tape flourishes, paper shadows. Clicks open
// the shared lightbox (overlay.js) scoped to just the lab items.

(function initLab() {
  const grid = document.getElementById('labGrid');
  const countEl = document.getElementById('labCount');
  const yearsEl = document.getElementById('labYears');
  const barCounter = document.getElementById('barCounter');
  if (!grid) return;

  const projects = window.projects || {};
  const lab = projects.lab;
  if (!lab || !Array.isArray(lab.images)) {
    grid.innerHTML = '<p style="text-align:center;color:#888;">No experiments yet — check back soon.</p>';
    return;
  }

  // Deterministic-ish "random" so layout is stable across reloads in a session
  // but still feels organic — seeded by image index.
  function pseudoRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  }

  // Filter out screenshot/mockup clutter (same rule the main grid uses).
  const excludeRe = window.gridExclude || /screenshot|zbrush|Mockup/i;
  const items = lab.images.filter(src => !excludeRe.test(src));

  // Shuffle lightly — pseudo-random sort so adjacent images aren't always the
  // same project variant, but stable per session.
  const ordered = items.map((src, i) => ({ src, key: pseudoRandom(i + 1) }))
    .sort((a, b) => a.key - b.key)
    .map(x => x.src);

  // lightbox expects raw URL strings (not {src} objects)
  const labLightboxItems = ordered;
  const videoRe = /\.(webm|mp4|mov|m4v)$/i;

  function isVideo(src) { return videoRe.test(src); }
  function basename(src) {
    const file = src.split('/').pop() || '';
    return file.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
  }

  // Luminance histogram — draws the media to a 48x48 canvas, bins pixels by
  // brightness, returns a compact SVG bar graph. Same-origin assets only
  // (local files), so canvas.getImageData is safe.
  const HIST_BINS = 24;
  const HIST_W = 72;
  const HIST_H = 18;
  function buildHistogramSvg(mediaEl) {
    try {
      const c = document.createElement('canvas');
      c.width = 48; c.height = 48;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(mediaEl, 0, 0, 48, 48);
      const data = ctx.getImageData(0, 0, 48, 48).data;
      const hist = new Array(HIST_BINS).fill(0);
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
        const bin = Math.min(HIST_BINS - 1, Math.floor((lum / 256) * HIST_BINS));
        hist[bin]++;
      }
      const max = Math.max.apply(null, hist) || 1;
      const barW = HIST_W / HIST_BINS;
      const bars = hist.map((v, i) => {
        const bh = Math.max(1, (v / max) * HIST_H);
        const x = (i * barW).toFixed(2);
        const y = (HIST_H - bh).toFixed(2);
        return `<rect x="${x}" y="${y}" width="${(barW - 0.5).toFixed(2)}" height="${bh.toFixed(2)}" fill="currentColor"/>`;
      }).join('');
      return `<svg width="${HIST_W}" height="${HIST_H}" viewBox="0 0 ${HIST_W} ${HIST_H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${bars}</svg>`;
    } catch (e) {
      return null;
    }
  }

  const frag = document.createDocumentFragment();
  ordered.forEach((src, idx) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'lab-card';
    card.dataset.idx = String(idx);

    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'media-wrap';

    let media;
    const vid = isVideo(src);
    if (vid) {
      media = document.createElement('video');
      media.src = src;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = 'metadata';
      card.addEventListener('mouseenter', () => { media.play().catch(() => {}); });
      card.addEventListener('mouseleave', () => { media.pause(); media.currentTime = 0; });
    } else {
      media = document.createElement('img');
      media.src = src;
      media.loading = 'lazy';
      media.decoding = 'async';
      media.alt = '';
    }
    mediaWrap.appendChild(media);
    card.appendChild(mediaWrap);

    // HUD overlay — appears on hover
    const hud = document.createElement('div');
    hud.className = 'hud';
    const hudTop = document.createElement('div');
    hudTop.className = 'hud-top';
    const hudIdx = document.createElement('span');
    hudIdx.className = 'hud-idx';
    hudIdx.textContent = String(idx + 1).padStart(3, '0');
    const hudType = document.createElement('span');
    hudType.className = 'hud-type';
    hudType.textContent = vid ? 'VIDEO' : 'STILL';
    hudTop.appendChild(hudIdx);
    hudTop.appendChild(hudType);
    const hudBottom = document.createElement('div');
    hudBottom.className = 'hud-bottom';
    const hudName = document.createElement('span');
    hudName.className = 'hud-name';
    hudName.textContent = basename(src);
    const hudHist = document.createElement('span');
    hudHist.className = 'hud-hist is-loading';
    hudBottom.appendChild(hudName);
    hudBottom.appendChild(hudHist);
    hud.appendChild(hudTop);
    hud.appendChild(hudBottom);
    card.appendChild(hud);

    // Histogram — computed on first hover, cached after.
    let histReady = false;
    const ensureHistogram = () => {
      if (histReady) return;
      // Video needs at least metadata loaded to draw a frame
      if (vid && media.readyState < 2) {
        media.addEventListener('loadeddata', ensureHistogram, { once: true });
        return;
      }
      const svg = buildHistogramSvg(media);
      if (svg) {
        hudHist.classList.remove('is-loading');
        hudHist.innerHTML = svg;
        histReady = true;
      }
    };
    card.addEventListener('mouseenter', ensureHistogram);
    card.addEventListener('focus', ensureHistogram);

    card.addEventListener('click', () => {
      if (typeof window.setLightboxItems === 'function') {
        window.setLightboxItems(labLightboxItems, true);
      }
      if (typeof window.openLightbox === 'function') {
        window.openLightbox(idx);
      }
    });

    frag.appendChild(card);
  });
  grid.appendChild(frag);

  // Stats
  if (countEl) countEl.textContent = String(ordered.length);
  if (yearsEl) yearsEl.textContent = '5+';
  if (barCounter) barCounter.textContent = `${ordered.length}`;

  // Fade-in on scroll
  const revealObs = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        revealObs.unobserve(e.target);
      }
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  grid.querySelectorAll('.lab-card').forEach(c => revealObs.observe(c));

  // Footer reveal (same pattern as other pages)
  const footer = document.querySelector('.site-footer');
  if (footer) {
    const fobs = new IntersectionObserver((entries) => {
      const visible = entries.some(e => e.isIntersecting);
      document.body.classList.toggle('footer-visible', visible);
    }, { threshold: 0.05 });
    fobs.observe(footer);
  }
})();
