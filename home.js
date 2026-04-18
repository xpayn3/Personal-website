// Loading screen — only on first visit
const loader = document.getElementById('loader');
if (loader) {
  if (sessionStorage.getItem('visited')) {
    loader.remove();
  } else {
    sessionStorage.setItem('visited', '1');
    const loaderText = document.getElementById('loaderText');
    if (loaderText) {
      const text = loaderText.textContent;
      loaderText.innerHTML = '';
      for (const char of text) {
        const span = document.createElement('span');
        span.className = 'loader-letter';
        span.textContent = char;
        loaderText.appendChild(span);
      }
    }
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 600);
      }, 800);
    });
  }
}

const IMG = 'Images';

const projects = [
  {
    id: 'accbox',
    name: 'AccountingBox',
    year: 2024,
    hero: `${IMG}/AccountingBox/Podjetja_cover.webp`,
    floats: [
      `${IMG}/AccountingBox/4_loop.webm`,
      `${IMG}/AccountingBox/intro.webm`,
      `${IMG}/AccountingBox/kjerkoli.webm`,
      `${IMG}/AccountingBox/racunovodje_cover_final.webp`,
    ]
  },
  {
    id: 'cestel',
    name: 'CESTEL',
    year: 2023,
    hero: `${IMG}/Cestel_project/cover_still.webp`,
    floats: [
      `${IMG}/Cestel_project/Cestel_image_01.webp`,
      `${IMG}/Cestel_project/Cestel_image_05.webp`,
      `${IMG}/Cestel_project/cestel_anim_02.webp`,
      `${IMG}/Cestel_project/Cestel_image_09.webp`,
    ]
  },
  {
    id: 'grounded2025',
    name: 'Grounded 2025',
    year: 2025,
    hero: `${IMG}/Grounded 2025/gr2025cover.webp`,
    floats: [
      `${IMG}/Grounded 2025/Grounded_2025_web.webm`,
      `${IMG}/Grounded 2025/IG_story_01.webm`,
      `${IMG}/Grounded 2025/IG_story_03.webm`,
    ]
  },
  {
    id: 'grounded2023',
    name: 'Grounded 2023',
    year: 2023,
    hero: `${IMG}/Grounded_2023/Grounded_2023_01_thumb.webp`,
    floats: [
      `${IMG}/Grounded_2023/Grounded_2023_01.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_04.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_05.webm`,
    ]
  },
  {
    id: 'grounded2022',
    name: 'Grounded 2022',
    year: 2022,
    hero: `${IMG}/Grounded_2022/Grounded_2022_01.webp`,
    floats: [
      `${IMG}/Grounded_2022/card_holo.webm`,
      `${IMG}/Grounded_2022/GR_main_1.webm`,
      `${IMG}/Grounded_2022/Grounded_2022_05.webp`,
    ]
  },
  {
    id: 'grounded2021',
    name: 'Grounded 2021',
    year: 2021,
    hero: `${IMG}/Grounded_2021/Grounded_SerijaPlakatov.webp`,
    floats: [
      `${IMG}/Grounded_2021/GR_render0034.webp`,
      `${IMG}/Grounded_2021/Grounded_nalepke.webp`,
      `${IMG}/Grounded_2021/Grounded_spletnastran.webp`,
    ]
  },
  {
    id: 'taf',
    name: "The Athlete's Foot",
    year: 2021,
    hero: `${IMG}/Athletesfoot/taf_anim.webp`,
    floats: [
      `${IMG}/Athletesfoot/taf_image_01.webp`,
      `${IMG}/Athletesfoot/taf_image_02.webp`,
      `${IMG}/Athletesfoot/screenshot_01.webp`,
    ]
  },
  {
    id: 'grounded2020',
    name: 'Grounded: Truth',
    year: 2020,
    hero: `${IMG}/Grounded_2020/Grounded_poster_2.webp`,
    floats: [
      `${IMG}/Grounded_2020/Artboard-26.webp`,
      `${IMG}/Grounded_2020/grounded_resnica.webp`,
      `${IMG}/Grounded_2020/Grounded2020_anim.webp`,
    ]
  },
  {
    id: 'halloween',
    name: 'Halloween TAF',
    year: 2021,
    hero: `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_01.webp`,
    floats: [
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_03.webp`,
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_05.webp`,
      `${IMG}/Athletesfoot_halloween/screenshot_zbrush.webp`,
    ]
  },
  {
    id: 'blackfriday',
    name: 'Black Friday TAF',
    year: 2021,
    hero: `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_anim_01.webp`,
    floats: [
      `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_01.webp`,
      `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_02.webp`,
    ]
  },
  {
    id: 'newedge',
    name: 'NewEdge Magazine',
    year: 2020,
    hero: `${IMG}/NewEdge_magazine/NewEdge_magazine_01.webp`,
    floats: [
      `${IMG}/NewEdge_magazine/NewEdge_magazine_02.webp`,
      `${IMG}/NewEdge_magazine/NewEdge_magazine_04.webp`,
    ]
  },
  {
    id: 'grounded2018',
    name: 'Grounded 2018',
    year: 2018,
    hero: `${IMG}/Grounded_2018/plakat.webp`,
    floats: [
      `${IMG}/Grounded_2018/grounded_2018_anim.webp`,
      `${IMG}/Grounded_2018/44396997_2300717590163245_3256152537651807309_n.webp`,
    ]
  },
];

// Show only these three projects, in the order we want them. Map the
// shared project data shape (images[]) onto the home block shape
// (hero + floats) the rest of this file expects.
const HOME_PROJECT_IDS = ['cestel', 'grounded2023', 'radenci'];
projects.length = 0;
for (const id of HOME_PROJECT_IDS) {
  const src = window.projects && window.projects[id];
  if (!src) continue;
  const imgs = src.images || [];
  projects.push({
    id,
    name: src.name,
    year: src.year,
    hero: imgs[0],
    floats: imgs.slice(1, 4),
  });
}


function isVideo(src) {
  return src.endsWith('.webm') || src.endsWith('.mp4');
}

const isMobileHome = window.innerWidth < 768;

function mobileSrc(src) {
  if (!isMobileHome) return src;
  if (isVideo(src)) return src.replace(/\.(webm|mp4)$/, '_thumb.webp');
  return src.replace('Images/', 'Images/mobile/');
}

function createMedia(src) {
  // On mobile use video thumbnails but keep full-res images.
  // Alt is empty — these are decorative backgrounds for the scroll showcase;
  // the project name is conveyed by the sticky title + hero info pill.
  if (isVideo(src) && isMobileHome) {
    const img = document.createElement('img');
    img.src = src.replace(/\.(webm|mp4)$/, '_thumb.webp');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    return img;
  }
  if (isVideo(src)) {
    const v = document.createElement('video');
    v.src = src;
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    return v;
  }
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

// ========== HERO CAROUSEL ==========
const heroSlides = document.getElementById('heroSlides');
const heroDots = document.getElementById('heroDots');
const heroEl = document.getElementById('heroCarousel');
// Hero carousel — single Grounded 2025 reel,
// independent of the scroll-showcase project list below.
const heroSrcs = [
  {
    src: `${IMG}/Grounded 2025/IG_story_02.webm`,
    name: 'Grounded 2025',
    meta: '2025 · Pritličje · Cinema 4D / Redshift / AfterEffects\nVisual identity and motion design for the 2025 festival edition.',
    shiftDown: true,
  },
];
const HERO_AUTO_MS = 7000;
const heroVideos = new Array(heroSrcs.length);
let heroIdx = 0;
let heroAutoTimer = null;

// Build slides. All videos get src + preload="auto" so any swipe is instant —
// browser keeps them buffered in parallel. Mobile uses image thumbnails.
heroSrcs.forEach((item, i) => {
  const slide = document.createElement('div');
  // Shift-down crop is calibrated for the desktop 16:9 viewport. On mobile
  // (portrait), a 9:16 video already fills nicely — no shift needed.
  slide.className = 'hero-slide' + (item.shiftDown && !isMobileHome ? ' hero-shift-down' : '');

  if (isVideo(item.src)) {
    const v = document.createElement('video');
    v.src = item.src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.autoplay = true;
    v.setAttribute('playsinline', '');
    v.setAttribute('muted', '');
    slide.appendChild(v);
    heroVideos[i] = v;
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.name;
    slide.appendChild(img);
  }

  const meta = document.createElement('div');
  meta.className = 'hero-slide-meta';
  meta.setAttribute('aria-hidden', 'true');
  slide.appendChild(meta);

  const title = document.createElement('div');
  title.className = 'hero-slide-title';
  title.textContent = item.name;
  title.setAttribute('role', 'button');
  title.setAttribute('tabindex', '0');
  slide.appendChild(title);
  heroSlides.appendChild(slide);

  // Meta line typewriter — toggled by clicking the title
  const metaText = item.meta || '';
  let typeTimer = null;
  let metaOpen = false;
  function typeMeta() {
    if (!metaText) return;
    clearInterval(typeTimer);
    meta.textContent = '';
    meta.classList.add('visible');
    let i = 0;
    typeTimer = setInterval(() => {
      meta.textContent = metaText.slice(0, ++i);
      if (i >= metaText.length) clearInterval(typeTimer);
    }, 28);
  }
  function hideMeta() {
    clearInterval(typeTimer);
    meta.classList.remove('visible');
    setTimeout(() => { if (!metaOpen) meta.textContent = ''; }, 250);
  }
  title.addEventListener('click', () => {
    metaOpen = !metaOpen;
    if (metaOpen) typeMeta(); else hideMeta();
  });
  title.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); title.click(); }
  });

  // Auto-type on first load (slight delay so the hero has a moment to settle).
  if (metaText && i === 0) {
    setTimeout(() => { metaOpen = true; typeMeta(); }, 900);
  }

  if (heroSrcs.length > 1) {
    const dot = document.createElement('div');
    dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToHeroSlide(i));
    heroDots.appendChild(dot);
  }
});

function slideWidth() { return heroEl.clientWidth; }

function setHeroTransform(offsetPx) {
  heroSlides.style.transform = `translate3d(${-heroIdx * slideWidth() + offsetPx}px, 0, 0)`;
}

function scheduleAutoAdvance() {
  clearTimeout(heroAutoTimer);
  heroAutoTimer = setTimeout(() => {
    goToHeroSlide((heroIdx + 1) % heroSrcs.length);
  }, HERO_AUTO_MS);
}

function goToHeroSlide(i) {
  i = Math.max(0, Math.min(heroSrcs.length - 1, i));
  const prev = heroVideos[heroIdx];
  const next = heroVideos[i];
  if (prev && prev !== next) prev.pause();
  heroIdx = i;
  if (next) {
    // Videos stay buffered (preload=auto); play resumes instantly from current position
    const p = next.play();
    if (p && p.catch) p.catch(() => {});
  }
  setHeroTransform(0);
  heroDots.querySelectorAll('.hero-dot').forEach((d, di) => d.classList.toggle('active', di === i));
  scheduleAutoAdvance();
}

// Kick off the first video (muted autoplay allowed by browsers)
if (heroVideos[0]) {
  const tryPlay = () => heroVideos[0].play().catch(() => {});
  tryPlay();
  setTimeout(tryPlay, 100);
  // Also resume on first user interaction in case browser blocked autoplay
  const resumeOnInteract = () => { tryPlay(); document.removeEventListener('pointerdown', resumeOnInteract); };
  document.addEventListener('pointerdown', resumeOnInteract, { once: true });
}
scheduleAutoAdvance();

// Pause the carousel entirely when the tab is backgrounded — no point playing
// a video + running an auto-advance timer no one can see.
document.addEventListener('visibilitychange', () => {
  const cur = heroVideos[heroIdx];
  if (document.hidden) {
    clearTimeout(heroAutoTimer);
    heroAutoTimer = null;
    if (cur) cur.pause();
  } else {
    if (cur) cur.play().catch(() => {});
    scheduleAutoAdvance();
  }
});

// Keep transform correct across viewport resizes
window.addEventListener('resize', () => setHeroTransform(0), { passive: true });

// ========== BUILD SECTIONS ==========
const container = document.getElementById('scrollContainer');
const barName = document.getElementById('barProjectName');
const barCounter = document.getElementById('barCounter');

projects.forEach((proj, idx) => {
  const block = document.createElement('div');
  block.className = 'project-block';
  block.dataset.index = idx;

  const row = document.createElement('div');
  row.className = 'project-row';
  // Which of the three cells should expand when the row reaches viewport
  // center — deterministic per project index so the layout is stable
  // across reloads within a session.
  const wideIdx = (idx * 37 + 11) % 3;
  row.dataset.wide = String(wideIdx);
  row.style.setProperty('--row-cols', '1fr 1fr 1fr');

  // Row 1: three media cells
  const floats = proj.floats || [];
  const mediaSrcs = [proj.hero, floats[0] || proj.hero, floats[1] || floats[0] || proj.hero];
  for (let i = 0; i < 3; i++) {
    const cell = document.createElement('div');
    cell.className = 'project-cell ' + (i === 0 ? 'project-title-cell' : 'project-media-cell');
    cell.appendChild(createMedia(mediaSrcs[i]));
    row.appendChild(cell);
  }

  // Row 2: labels, one column per cell
  const labels0 = document.createElement('div');
  labels0.className = 'project-labels';
  labels0.innerHTML = `<span class="project-name">${proj.name}</span>`;
  row.appendChild(labels0);

  const labels1 = document.createElement('div');
  labels1.className = 'project-labels project-labels-right';
  labels1.innerHTML = `<span class="project-year">${proj.year}</span>`;
  row.appendChild(labels1);

  const labels2 = document.createElement('div');
  labels2.className = 'project-labels';
  row.appendChild(labels2);

  block.appendChild(row);

  block.style.cursor = 'pointer';
  block.addEventListener('click', () => {
    if (typeof window.openProject === 'function') window.openProject(proj.id);
  });

  container.appendChild(block);
});

// Slide each row in when it enters the viewport.
const blockObserver = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) e.target.classList.add('in-view');
  }
}, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('.project-block').forEach(b => blockObserver.observe(b));

// Skills section — preview the project image mapped to the currently
// hovered / focused skill, with a crossfade between images (two stacked
// <img> elements, toggle which is active). Clicking jumps to that project
// via the grid's #project= hash. Keyboard + touch parity with hover.
(function initSkills() {
  const skillItems = document.querySelectorAll('.skill-item');
  const imgA = document.querySelector('.skill-img-a');
  const imgB = document.querySelector('.skill-img-b');
  const skillsList = document.querySelector('.skills-list');
  if (!skillItems.length) return;

  // Preload all skill images when the browser is idle — first hover/focus
  // then never hits the network.
  const preload = () => {
    skillItems.forEach(el => {
      const src = el.dataset.img;
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(preload, { timeout: 2000 });
  else setTimeout(preload, 1500);

  // Crossfade: keep two <img> layers, alternate which one is "active".
  let activeLayer = imgA;
  let inactiveLayer = imgB;
  function showPreview(src) {
    if (!imgA || !imgB || !src) return;
    if (activeLayer.getAttribute('src') === src) {
      activeLayer.classList.add('active');
      return;
    }
    inactiveLayer.src = src;
    const reveal = () => {
      inactiveLayer.classList.add('active');
      activeLayer.classList.remove('active');
      const tmp = activeLayer; activeLayer = inactiveLayer; inactiveLayer = tmp;
    };
    if (inactiveLayer.complete) reveal();
    else inactiveLayer.addEventListener('load', reveal, { once: true });
  }
  function hidePreview() {
    if (imgA) imgA.classList.remove('active');
    if (imgB) imgB.classList.remove('active');
  }

  // Hover + focus both trigger preview — keyboard parity.
  skillItems.forEach(item => {
    const trigger = () => {
      showPreview(item.dataset.img);
      skillItems.forEach(el => el.classList.toggle('is-active', el === item));
    };
    item.addEventListener('mouseenter', trigger);
    item.addEventListener('focus', trigger);
    item.addEventListener('click', (e) => {
      const pid = item.dataset.project;
      if (!pid) return;
      e.preventDefault();
      // On home, link to grid with the project hash → grid auto-opens it.
      window.location.href = 'grid.html#project=' + pid;
    });
  });
  if (skillsList) {
    skillsList.addEventListener('mouseleave', () => {
      hidePreview();
      skillItems.forEach(el => el.classList.remove('is-active'));
    });
    skillsList.addEventListener('focusout', (e) => {
      if (!skillsList.contains(e.relatedTarget)) {
        hidePreview();
        skillItems.forEach(el => el.classList.remove('is-active'));
      }
    });
  }
})();

// Hide the floating Luka Grčar wordmark + Contact link once the footer is
// visible — the footer already has its own big wordmark and "Get in touch"
// column, so the fixed chrome is redundant and overlaps awkwardly.
const footerEl = document.querySelector('.site-footer');
if (footerEl) {
  const footerObs = new IntersectionObserver((entries) => {
    const visible = entries.some(e => e.isIntersecting);
    document.body.classList.toggle('footer-visible', visible);
  }, { threshold: 0.05 });
  footerObs.observe(footerEl);
}

barCounter.textContent = `1 / ${projects.length}`;

// ========== PARALLAX ==========
const blocks = document.querySelectorAll('.project-block');

// Cache each block's absolute document position — block.offsetTop is relative
// to the nearest positioned ancestor (scroll-container is position: relative
// for z-index stacking over the sticky hero), which would return 0 and break
// the title-fade math. We walk offsetParent chain once instead.
function absoluteTop(el) {
  let y = 0;
  let n = el;
  while (n) { y += n.offsetTop; n = n.offsetParent; }
  return y;
}
const blockData = Array.from(blocks).map(block => ({
  el: block,
  top: absoluteTop(block),
  row: block.querySelector('.project-row'),
  wideIdx: parseInt(block.querySelector('.project-row')?.dataset.wide || '0', 10),
  cellMedia: Array.from(block.querySelectorAll('.project-cell')).map(c =>
    c.querySelector('img, video')
  ),
}));
function recomputeBlockTops() {
  for (const bd of blockData) bd.top = absoluteTop(bd.el);
}
window.addEventListener('resize', recomputeBlockTops, { passive: true });
// Recompute once fonts + images finish loading — initial offsets are stale
// otherwise (text reflows when webfont swaps, lazy images push content down).
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => setTimeout(recomputeBlockTops, 100));
}
window.addEventListener('load', () => setTimeout(recomputeBlockTops, 50), { once: true });

const heroMediaEl = () => document.querySelector('.hero-slide video, .hero-slide img');
const heroTitleEl = () => document.querySelector('.hero-slide-title');

function updateHeroParallax(scrollY, vh) {
  const progress = Math.max(0, Math.min(1, scrollY / vh));
  const media = heroMediaEl();
  if (media) {
    const scale = 1 + progress * 0.14;
    const shiftY = progress * -40;
    media.style.transform = `translate3d(0, ${shiftY}px, 0) scale(${scale})`;
  }
  const title = heroTitleEl();
  if (title) {
    title.style.transform = `translate3d(0, ${-scrollY * 0.5}px, 0)`;
    title.style.opacity = '1';
  }
  // Meta fades out fast as soon as the user starts scrolling
  const meta = document.querySelector('.hero-slide-meta');
  if (meta) {
    const fade = Math.max(0, 1 - scrollY / (vh * 0.18));
    meta.style.setProperty('--meta-scroll-fade', String(fade));
  }
}

function updateParallax() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  updateHeroParallax(scrollY, vh);

  for (let idx = 0; idx < blockData.length; idx++) {
    const bd = blockData[idx];
    const blockTop = bd.top - scrollY;

    if (blockTop > vh * 2 || blockTop < -bd.el.offsetHeight - vh) continue;

    // Per-cell parallax: image shifts within its cell based on how far the
    // block is from viewport center. Cells offset from each other so the
    // three pictures don't move in lockstep.
    const rawOffset = (blockTop + bd.el.offsetHeight / 2 - vh / 2) / vh;
    const centerOffset = Math.max(-1, Math.min(1, rawOffset));
    for (let ci = 0; ci < bd.cellMedia.length; ci++) {
      const m = bd.cellMedia[ci];
      if (!m) continue;
      const speed = (isMobileHome ? [30, 50, 40] : [90, 160, 130])[ci] || (isMobileHome ? 40 : 120);
      m.style.transform = `translate3d(0, ${centerOffset * speed}px, 0)`;
    }

    // Columns: equal (1fr 1fr 1fr) when the row is near the edges, wide cell
    // expands (up to 2fr 1fr 1fr) as the row approaches viewport center.
    if (bd.row) {
      const expand = Math.max(0, 1 - Math.abs(centerOffset) * 1.2);
      const cols = [1, 1, 1];
      cols[bd.wideIdx] = 1 + expand;
      bd.row.style.setProperty('--row-cols', `${cols[0]}fr ${cols[1]}fr ${cols[2]}fr`);
    }

    if (blockTop > -vh && blockTop < vh * 0.5) {
      barName.textContent = projects[idx].name;
      barCounter.textContent = `${idx + 1} / ${projects.length}`;
    }
  }

  // Show/hide bar labels + dividers based on carousel position
  const pastCarousel = scrollY > window.innerHeight * 0.8;
  const onCarousel = scrollY < 30; // hide the bar entirely while the hero is showing
  document.querySelectorAll('.bar-collapsible').forEach(el => el.classList.toggle('collapsed', !pastCarousel));
  const bar = document.querySelector('.bottom-bar');
  bar.classList.toggle('compact', !pastCarousel);
  bar.classList.toggle('hidden', onCarousel);
}

// ========== WATERMARK LETTERS ==========
const wmEl = document.getElementById('watermarkText');
let wmLetters = [];
let wmLastScroll = 0;
let wmResetTimer = null;
const MAX_ROT = 35;

if (wmEl) {
  const text = wmEl.textContent;
  wmEl.innerHTML = '';
  for (const char of text) {
    const span = document.createElement('span');
    span.className = 'wm-letter';
    span.textContent = char === ' ' ? '\u00A0' : char;
    wmEl.appendChild(span);
    wmLetters.push(span);
  }
}

// ========== SINGLE MOBILE SCROLL HANDLER ==========
function onMobileScroll() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;

  updateHeroParallax(scrollY, vh);

  // Track which block is in view + per-cell parallax + wide-cell expand
  for (let idx = 0; idx < blockData.length; idx++) {
    const bd = blockData[idx];
    const blockTop = bd.top - scrollY;
    if (blockTop > vh * 2 || blockTop < -bd.el.offsetHeight - vh) continue;
    const rawOffset = (blockTop + bd.el.offsetHeight / 2 - vh / 2) / vh;
    const centerOffset = Math.max(-1, Math.min(1, rawOffset));
    for (let ci = 0; ci < bd.cellMedia.length; ci++) {
      const m = bd.cellMedia[ci];
      if (!m) continue;
      const speed = (isMobileHome ? [30, 50, 40] : [90, 160, 130])[ci] || (isMobileHome ? 40 : 120);
      m.style.transform = `translate3d(0, ${centerOffset * speed}px, 0)`;
    }
    if (bd.row) {
      const expand = Math.max(0, 1 - Math.abs(centerOffset) * 1.2);
      const cols = [1, 1, 1];
      cols[bd.wideIdx] = 1 + expand;
      bd.row.style.setProperty('--row-cols', `${cols[0]}fr ${cols[1]}fr ${cols[2]}fr`);
    }
    if (blockTop > -vh && blockTop < vh * 0.5) {
      barName.textContent = projects[idx].name;
      barCounter.textContent = `${idx + 1} / ${projects.length}`;
    }
  }

  const pastCarousel = scrollY > vh * 0.8;
  const onCarousel = scrollY < 30;
  document.querySelectorAll('.bar-collapsible').forEach(el => el.classList.toggle('collapsed', !pastCarousel));
  const bar = document.querySelector('.bottom-bar');
  bar.classList.toggle('compact', !pastCarousel);
  bar.classList.toggle('hidden', onCarousel);

  // Letter rotation
  if (wmLetters.length) {
    const delta = scrollY - wmLastScroll;
    wmLetters.forEach((letter, i) => {
      const raw = delta * -(1.2 + i * 0.12);
      letter.style.transition = 'none';
      letter.style.transform = `rotate(${Math.max(-MAX_ROT, Math.min(MAX_ROT, raw))}deg)`;
    });
    clearTimeout(wmResetTimer);
    wmResetTimer = setTimeout(() => {
      wmLetters.forEach(letter => {
        letter.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
        letter.style.transform = 'rotate(0deg)';
      });
    }, 80);
  }

  wmLastScroll = scrollY;
}

// Initial bar-visibility sync — handlers above only run on scroll, but we
// want the correct state from the first paint (e.g. after a reload mid-page).
if (isMobileHome) onMobileScroll(); else updateParallax();

// ========== DESKTOP: separate listeners ==========
if (!isMobileHome) {
  if (wmLetters.length) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const delta = scrollY - wmLastScroll;
      wmLastScroll = scrollY;
      wmLetters.forEach((letter, i) => {
        const raw = delta * -(1.2 + i * 0.12);
        letter.style.transition = 'none';
        letter.style.transform = `rotate(${Math.max(-MAX_ROT, Math.min(MAX_ROT, raw))}deg)`;
      });
      clearTimeout(wmResetTimer);
      wmResetTimer = setTimeout(() => {
        wmLetters.forEach(letter => {
          letter.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
          letter.style.transform = 'rotate(0deg)';
        });
      }, 80);
    }, { passive: true });
  }

}

// ========== SCROLL HANDLER ==========
// Desktop: smooth wheel physics (momentum + lerp) drive window.scrollY,
// parallax updates in the same rAF loop so transforms stay synced with
// the scroll position we just set. Mobile (incl. iOS Safari): native
// scroll + continuous rAF parallax while scrolling, stops 200ms after idle.
(function initScrollHandler() {
  let lastAppliedScrollY = -1;
  function applyParallax(y) {
    const vh = window.innerHeight;
    if (y === lastAppliedScrollY) return;
    lastAppliedScrollY = y;
    updateHeroParallax(y, vh);
    if (!isMobileHome) updateParallax();
    else onMobileScroll();
  }

  if (!isMobileHome) {
    let targetScroll = window.scrollY;
    let smoothScroll = window.scrollY;
    let velocity = 0;
    let rafId = null;
    const FRICTION = 0.91;
    const LERP = 0.13;

    function maxY() { return document.documentElement.scrollHeight - window.innerHeight; }

    function loop() {
      velocity *= FRICTION;
      targetScroll = Math.max(0, Math.min(maxY(), targetScroll + velocity));
      smoothScroll += (targetScroll - smoothScroll) * LERP;
      if (Math.abs(targetScroll - smoothScroll) < 0.4) smoothScroll = targetScroll;
      window.scrollTo(0, smoothScroll);
      applyParallax(smoothScroll);
      if (Math.abs(velocity) > 0.05 || Math.abs(targetScroll - smoothScroll) > 0.5) {
        rafId = requestAnimationFrame(loop);
      } else {
        rafId = null;
      }
    }

    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      velocity += e.deltaY * 0.15;
      if (!rafId) rafId = requestAnimationFrame(loop);
    }, { passive: false });

    // Keyboard / scrollbar / scrollTo should still work — sync when the
    // page moved by something other than the wheel loop.
    window.addEventListener('scroll', () => {
      if (rafId) return;
      const y = window.scrollY;
      smoothScroll = y;
      targetScroll = y;
      applyParallax(y);
    }, { passive: true });

    applyParallax(window.scrollY);
  } else {
    // Mobile (iOS Safari): native momentum scrolling is already smooth on
    // touch release — no JS physics, no continuous rAF. Just an event-driven
    // rAF throttle: schedule one frame per scroll event, batch transform
    // writes to that frame, no long-running timer for APP to flag.
    let pendingRAF = null;
    window.addEventListener('scroll', () => {
      if (pendingRAF) return;
      pendingRAF = requestAnimationFrame(() => {
        pendingRAF = null;
        applyParallax(window.scrollY);
      });
    }, { passive: true });
    applyParallax(window.scrollY);
  }
})();
