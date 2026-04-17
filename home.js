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

// Sort by year, newest first — show only 5
projects.sort((a, b) => b.year - a.year);
projects.splice(5);


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
  { src: `${IMG}/Grounded 2025/IG_story_02.webm`, name: 'Grounded 2025', shiftDown: true },
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

  const title = document.createElement('div');
  title.className = 'hero-slide-title';
  title.textContent = item.name;
  slide.appendChild(title);
  heroSlides.appendChild(slide);

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

  // Title layer (sticky)
  const titleLayer = document.createElement('div');
  titleLayer.className = 'title-layer';

  const name = document.createElement('div');
  name.className = 'title-name';
  name.textContent = proj.name;
  titleLayer.appendChild(name);

  block.appendChild(titleLayer);

  // Image layer — scattered freeform
  const imageLayer = document.createElement('div');
  imageLayer.className = 'image-layer';

  // Hero — sticky
  const heroEl = document.createElement('div');
  heroEl.className = 'scatter-img hero-scatter';
  heroEl.appendChild(createMedia(proj.hero));
  // Project info tag — fades in once the hero covers the big title behind it.
  const tag = document.createElement('div');
  tag.className = 'hero-info-tag';
  const thumbSrc = isVideo(proj.hero) ? proj.hero.replace(/\.(webm|mp4)$/, '_thumb.webp') : proj.hero;
  tag.innerHTML =
    `<img class="hero-info-thumb" src="${thumbSrc}" alt="" loading="lazy" />` +
    `<div class="hero-info-text">` +
      `<span class="hero-info-year">${proj.year}</span>` +
      `<span class="hero-info-name">${proj.name}</span>` +
      `<span class="hero-info-cta">View project \u2192</span>` +
    `</div>`;
  heroEl.appendChild(tag);
  imageLayer.appendChild(heroEl);

  // Secondary — cap at 3, detect tall (portrait) media so CSS can square-crop it.
  const floatsToShow = proj.floats.slice(0, 3);
  for (let i = 0; i < floatsToShow.length; i++) {
    const el = document.createElement('div');
    el.className = 'scatter-img side-scatter';
    const speeds = [0.08, -0.12, 0.18, -0.06, 0.14];
    el.dataset.speed = speeds[i % speeds.length];
    const media = createMedia(floatsToShow[i]);
    el.appendChild(media);
    const checkTall = (w, h) => { if (w && h && h > w * 1.05) el.classList.add('side-scatter-tall'); };
    if (media.tagName === 'IMG') {
      if (media.complete) checkTall(media.naturalWidth, media.naturalHeight);
      else media.addEventListener('load', () => checkTall(media.naturalWidth, media.naturalHeight), { once: true });
    } else if (media.tagName === 'VIDEO') {
      if (media.readyState >= 1) checkTall(media.videoWidth, media.videoHeight);
      else media.addEventListener('loadedmetadata', () => checkTall(media.videoWidth, media.videoHeight), { once: true });
    }
    imageLayer.appendChild(el);
  }

  // Click to open the shared slide-up project overlay (owned by overlay.js).
  imageLayer.style.cursor = 'pointer';
  imageLayer.addEventListener('click', () => {
    if (typeof window.openProject === 'function') window.openProject(proj.id);
  });

  block.appendChild(imageLayer);
  container.appendChild(block);
});

barCounter.textContent = `1 / ${projects.length}`;

// Size each info-pill thumb to exactly match its text column's measured
// height. Aspect-ratio + flex stretch + auto width otherwise creates a
// circular dependency; this is the simplest reliable fix.
function syncInfoTagThumbs() {
  document.querySelectorAll('.hero-info-tag').forEach(tag => {
    const txt = tag.querySelector('.hero-info-text');
    const thumb = tag.querySelector('.hero-info-thumb');
    if (!txt || !thumb) return;
    const h = Math.round(txt.getBoundingClientRect().height);
    if (h < 20) return;
    thumb.style.width = h + 'px';
    thumb.style.height = h + 'px';
  });
}
requestAnimationFrame(() => requestAnimationFrame(syncInfoTagThumbs));
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(syncInfoTagThumbs);
}
window.addEventListener('resize', syncInfoTagThumbs);

// ========== END CTA ==========
const cta = document.createElement('div');
cta.className = 'home-cta';
cta.innerHTML = `
  <div class="cta-text">
    <span class="cta-line cta-line-2">full</span>
    <span class="cta-line cta-line-3">collection</span>
  </div>
  <a href="grid.html" class="cta-link">View all projects &rarr;</a>
`;
container.appendChild(cta);

// ========== CTA SCROLL ANIMATION ==========
const ctaEl = document.querySelector('.home-cta');
if (ctaEl) {
  const ctaObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      ctaEl.classList.toggle('in-view', entry.isIntersecting);
    });
  }, { threshold: 0.3 });
  ctaObs.observe(ctaEl);
}

// ========== SMOOTH SCROLL PHYSICS (desktop only) ==========

if (!isMobileHome) {
  let smoothScroll = window.scrollY;
  let targetScroll = window.scrollY;
  let scrollVelocity = 0;
  const FRICTION = 0.92;
  const LERP = 0.08;

  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    scrollVelocity += e.deltaY * 0.15;
    if (!scrollRAF) scrollRAF = requestAnimationFrame(smoothScrollLoop);
  }, { passive: false });

  let scrollRAF = null;
  function smoothScrollLoop() {
    scrollVelocity *= FRICTION;
    targetScroll += scrollVelocity;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));
    smoothScroll += (targetScroll - smoothScroll) * LERP;
    window.scrollTo(0, smoothScroll);
    updateParallax();
    // Stop loop when idle
    if (Math.abs(scrollVelocity) > 0.1 || Math.abs(targetScroll - smoothScroll) > 0.5) {
      scrollRAF = requestAnimationFrame(smoothScrollLoop);
    } else {
      scrollRAF = null;
    }
  }

  window.addEventListener('scroll', () => {
    if (Math.abs(scrollVelocity) < 0.5) {
      smoothScroll = window.scrollY;
      targetScroll = window.scrollY;
    }
    updateHeroParallax(window.scrollY, window.innerHeight);
  }, { passive: true });

  scrollRAF = requestAnimationFrame(smoothScrollLoop);
} else {
  // Mobile: single scroll listener, no parallax (saves battery)
  window.addEventListener('scroll', onMobileScroll, { passive: true });
}

// ========== PARALLAX ==========
const blocks = document.querySelectorAll('.project-block');

const blockData = Array.from(blocks).map(block => ({
  el: block,
  titleName: block.querySelector('.title-name'),
  heroImg: block.querySelector('.hero-scatter'),
  infoTag: block.querySelector('.hero-info-tag'),
  sideImgs: Array.from(block.querySelectorAll('.side-scatter')).map(img => ({
    el: img,
    speed: parseFloat(img.dataset.speed || 0.1),
  })),
}));

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
}

function updateParallax() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;
  updateHeroParallax(scrollY, vh);

  for (let idx = 0; idx < blockData.length; idx++) {
    const bd = blockData[idx];
    const blockTop = bd.el.offsetTop - scrollY;

    if (blockTop > vh * 2 || blockTop < -bd.el.offsetHeight - vh) continue;

    // Title fades only after scrolling past the title section (100vh)
    const titleProgress = Math.max(0, Math.min(1, (-blockTop - vh * 0.5) / (vh * 0.5)));

    const titleScale = 1 + titleProgress * 0.15;
    const titleOpacity = Math.max(0, 1 - titleProgress * 1.5);
    const letterSpacing = titleProgress * 0.5;
    bd.titleName.style.transform = `scale(${titleScale})`;
    bd.titleName.style.opacity = titleOpacity;
    bd.titleName.style.letterSpacing = `${letterSpacing}em`;

    // Hero scale — starts smaller when block first enters, grows to full size
    // as side images scroll past (desktop-only; mobile skips updateParallax).
    if (bd.heroImg) {
      const blockH = bd.el.offsetHeight;
      const travel = Math.max(1, blockH - vh);
      const scrolled = Math.max(0, -blockTop);
      const scaleProgress = Math.max(0, Math.min(1, scrolled / travel));
      const heroScale = 0.82 + scaleProgress * 0.18;
      bd.heroImg.style.transform = `translateY(-50%) scale(${heroScale})`;
    }

    // Info tag — fades in once the big title is mostly faded.
    if (bd.infoTag) {
      bd.infoTag.style.opacity = Math.max(0, Math.min(1, (titleProgress - 0.6) / 0.3));
    }

    // Side images parallax
    for (const img of bd.sideImgs) {
      const rect = img.el.getBoundingClientRect();
      const center = (rect.top + rect.height / 2 - vh / 2) / vh;
      const y = center * img.speed * vh;
      img.el.style.transform = `translateY(${y}px)`;
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

  // Update title opacity only (no parallax on images — saves battery)
  for (let idx = 0; idx < blockData.length; idx++) {
    const bd = blockData[idx];
    const blockTop = bd.el.offsetTop - scrollY;
    if (blockTop > vh * 2 || blockTop < -bd.el.offsetHeight - vh) continue;
    const titleProgress = Math.max(0, Math.min(1, (-blockTop - vh * 0.5) / (vh * 0.5)));
    bd.titleName.style.opacity = Math.max(0, 1 - titleProgress * 1.5);
    bd.titleName.style.transform = `scale(${1 + titleProgress * 0.15})`;
    bd.titleName.style.letterSpacing = `${titleProgress * 0.5}em`;

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
