// ========== LAB PAGE ==========
// Reads all images from window.projects.lab and renders them as captioned
// gallery tiles (look shared with the Work page: gallery.css). Clicks open
// the shared lightbox (overlay.js) scoped to just the lab items.

(function initLab() {
  const grid = document.getElementById('labGrid');
  const countEl = document.getElementById('labCount');
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

    // Caption under the picture: file name + still/video (gallery.css)
    const label = document.createElement('span');
    label.className = 'item-label';
    const tag = document.createElement('span');
    tag.className = 'item-label-tag';
    tag.textContent = vid ? 'Video' : 'Still';
    const name = document.createElement('span');
    name.className = 'item-label-name';
    name.textContent = basename(src);
    label.appendChild(tag);
    label.appendChild(name);
    card.appendChild(label);

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
