// ========== LAB PAGE ==========
// Reads all images from window.projects.lab and renders them as captioned
// gallery tiles (look shared with the Work page: gallery.css). Clicks open
// the shared lightbox (overlay.js) scoped to just the lab items.
//
// Every tile is a plain <img>: clips show their `_thumb.webp` poster. A
// <video> is only created when a mouse hovers a clip, so phones never load or
// decode sixteen videos just to draw the wall.

(function initLab() {
  const grid = document.getElementById('labGrid');
  if (!grid) return;

  const lab = (window.projects || {}).lab;
  if (!lab || !Array.isArray(lab.images)) {
    grid.innerHTML = '<p style="text-align:center;color:#888;">No experiments yet — check back soon.</p>';
    return;
  }

  const VIDEO_RE = /\.(webm|mp4|mov|m4v)$/i;
  const isVideo = src => VIDEO_RE.test(src);
  const posterOf = src => src.replace(VIDEO_RE, '_thumb.webp');
  const nameOf = src => (src.split('/').pop() || '').replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  };

  // Stable shuffle: seeded by index, so the order is the same on every load
  // but neighbouring files aren't always variants of the same piece.
  const pseudoRandom = (seed) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };
  // Filter out screenshot/mockup clutter (same rule the main grid uses).
  const excludeRe = window.gridExclude || /screenshot|zbrush|Mockup/i;
  const ordered = lab.images
    .filter(src => !excludeRe.test(src))
    .map((src, i) => ({ src, key: pseudoRandom(i + 1) }))
    .sort((a, b) => a.key - b.key)
    .map(item => item.src);

  // Plays the clip over its poster while the mouse is on the tile.
  function addHoverVideo(card, wrap, src) {
    let video = null;
    card.addEventListener('mouseenter', () => {
      if (!video) {
        video = el('video');
        Object.assign(video, { src, muted: true, loop: true, playsInline: true, preload: 'metadata' });
        wrap.appendChild(video);
      }
      video.play().then(() => video.classList.add('is-playing')).catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      if (!video) return;
      video.pause();
      video.currentTime = 0;
      video.classList.remove('is-playing');
    });
  }

  function openAt(idx) {
    if (typeof window.setLightboxItems === 'function') window.setLightboxItems(ordered, true);
    if (typeof window.openLightbox === 'function') window.openLightbox(idx);
  }

  function makeCard(src, idx) {
    const clip = isVideo(src);
    const card = el('button', 'lab-card');
    card.type = 'button';
    card.dataset.idx = String(idx);

    const wrap = el('div', 'media-wrap');
    const img = el('img');
    Object.assign(img, { src: clip ? posterOf(src) : src, loading: 'lazy', decoding: 'async', alt: '' });
    wrap.appendChild(img);
    if (clip && canHover) addHoverVideo(card, wrap, src);

    // Caption under the picture: file name + still/video (gallery.css)
    const label = el('span', 'item-label');
    label.append(el('span', 'item-label-tag', clip ? 'Video' : 'Still'), el('span', 'item-label-name', nameOf(src)));

    card.append(wrap, label);
    card.addEventListener('click', () => openAt(idx));
    return card;
  }

  const frag = document.createDocumentFragment();
  ordered.forEach((src, idx) => frag.appendChild(makeCard(src, idx)));
  grid.appendChild(frag);

  // Stats
  const countEl = document.getElementById('labCount');
  const barCounter = document.getElementById('barCounter');
  if (countEl) countEl.textContent = String(ordered.length);
  if (barCounter) barCounter.textContent = String(ordered.length);

  // Fade-in on scroll
  const revealObs = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('in-view');
      revealObs.unobserve(entry.target);
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  grid.querySelectorAll('.lab-card').forEach(card => revealObs.observe(card));

  // Footer reveal (same pattern as other pages)
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  new IntersectionObserver((entries) => {
    document.body.classList.toggle('footer-visible', entries.some(entry => entry.isIntersecting));
  }, { threshold: 0.05 }).observe(footer);
})();
