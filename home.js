const IMG = 'Images';

const projects = [
  {
    id: 'cestel',
    name: 'CESTEL',
    year: 2023,
    hero: `${IMG}/Cestel_project/cestel_anim_01.webp`,
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
    hero: `${IMG}/Grounded 2025/Grounded_2025_01.webm`,
    floats: [
      `${IMG}/Grounded 2025/Grounded_2025_02.webm`,
      `${IMG}/Grounded 2025/Grounded_2025_03.webm`,
    ]
  },
  {
    id: 'grounded2023',
    name: 'Grounded 2023',
    year: 2023,
    hero: `${IMG}/Grounded_2023/Grounded_2023_01.webm`,
    floats: [
      `${IMG}/Grounded_2023/Grounded_2023_04.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_05.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_06.webm`,
    ]
  },
  {
    id: 'grounded2022',
    name: 'Grounded 2022',
    year: 2022,
    hero: `${IMG}/Grounded_2022/card_holo.webm`,
    floats: [
      `${IMG}/Grounded_2022/Grounded_2022_01.webp`,
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
  {
    id: 'radenci',
    name: 'Radenci',
    year: 2022,
    hero: `${IMG}/Radenci_prostorska_projekcija/P1_S1_K01_0323.webp`,
    floats: [
      `${IMG}/Radenci_prostorska_projekcija/P1_S3_K06_0150.webp`,
      `${IMG}/Radenci_prostorska_projekcija/P2_S1_K01_0227.webp`,
      `${IMG}/Radenci_prostorska_projekcija/P2_S2_K01_0376.webp`,
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
  const msrc = mobileSrc(src);
  // On mobile use static images instead of videos
  if (isVideo(src) && isMobileHome) {
    const img = document.createElement('img');
    img.src = msrc;
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
  img.src = msrc;
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

// ========== HERO CAROUSEL ==========
const heroSlides = document.getElementById('heroSlides');
const heroDots = document.getElementById('heroDots');
const heroSrcs = projects.slice(0, 5).map(p => ({ src: p.hero, name: p.name }));
let heroIdx = 0;
let heroAutoTimer = null;

heroSrcs.forEach((item, i) => {
  const slide = document.createElement('div');
  slide.className = 'hero-slide';

  if (isVideo(item.src) && !isMobileHome) {
    const v = document.createElement('video');
    v.src = item.src;
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    slide.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = isMobileHome ? mobileSrc(item.src) : (isVideo(item.src) ? item.src.replace(/\.(webm|mp4)$/, '_thumb.webp') : item.src);
    img.alt = item.name;
    slide.appendChild(img);
  }

  const title = document.createElement('div');
  title.className = 'hero-slide-title';
  title.textContent = item.name;
  slide.appendChild(title);

  heroSlides.appendChild(slide);

  const dot = document.createElement('div');
  dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goToHeroSlide(i));
  heroDots.appendChild(dot);
});

function goToHeroSlide(i) {
  heroIdx = i;
  heroSlides.style.transform = `translateX(-${i * 100}vw)`;
  heroDots.querySelectorAll('.hero-dot').forEach((d, di) => d.classList.toggle('active', di === i));
  resetHeroAuto();
}

function nextHeroSlide() {
  goToHeroSlide((heroIdx + 1) % heroSrcs.length);
}

function resetHeroAuto() {
  clearInterval(heroAutoTimer);
  heroAutoTimer = setInterval(nextHeroSlide, 5000);
}
resetHeroAuto();

// Swipe + drag on carousel
let heroStartX = 0;
let heroDragging = false;
const heroEl = document.getElementById('heroCarousel');

// Touch
heroEl.addEventListener('touchstart', (e) => { heroStartX = e.touches[0].clientX; }, { passive: true });
heroEl.addEventListener('touchend', (e) => {
  const diff = heroStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) goToHeroSlide(Math.min(heroIdx + 1, heroSrcs.length - 1));
    else goToHeroSlide(Math.max(heroIdx - 1, 0));
  }
}, { passive: true });

// Mouse drag
heroEl.addEventListener('mousedown', (e) => {
  e.preventDefault();
  heroDragging = true;
  heroStartX = e.clientX;
  heroEl.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', (e) => {
  if (heroDragging) e.preventDefault();
});
window.addEventListener('mouseup', (e) => {
  if (!heroDragging) return;
  const diff = heroStartX - e.clientX;
  heroDragging = false;
  heroEl.style.cursor = 'grab';
  if (Math.abs(diff) > 50) {
    if (diff > 0) goToHeroSlide(Math.min(heroIdx + 1, heroSrcs.length - 1));
    else goToHeroSlide(Math.max(heroIdx - 1, 0));
  }
});
heroEl.style.cursor = 'grab';

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
  imageLayer.appendChild(heroEl);

  // Secondary — flow in, alternate left/right
  for (let i = 0; i < proj.floats.length; i++) {
    const el = document.createElement('div');
    el.className = 'scatter-img side-scatter';
    const speeds = [0.08, -0.12, 0.18, -0.06, 0.14];
    el.dataset.speed = speeds[i % speeds.length];
    el.appendChild(createMedia(proj.floats[i]));
    imageLayer.appendChild(el);
  }

  // Click to go to project
  imageLayer.style.cursor = 'pointer';
  imageLayer.addEventListener('click', () => {
    window.location.href = `grid.html#project=${proj.id}`;
  });

  block.appendChild(imageLayer);
  container.appendChild(block);
});

barCounter.textContent = `1 / ${projects.length}`;

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
  }, { passive: false });

  function smoothScrollLoop() {
    scrollVelocity *= FRICTION;
    targetScroll += scrollVelocity;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));
    smoothScroll += (targetScroll - smoothScroll) * LERP;
    window.scrollTo(0, smoothScroll);
    updateParallax();
    requestAnimationFrame(smoothScrollLoop);
  }

  window.addEventListener('scroll', () => {
    if (Math.abs(scrollVelocity) < 0.5) {
      smoothScroll = window.scrollY;
      targetScroll = window.scrollY;
    }
  }, { passive: true });

  requestAnimationFrame(smoothScrollLoop);
} else {
  // Mobile: single scroll listener, no parallax (saves battery)
  window.addEventListener('scroll', onMobileScroll, { passive: true });
}

// ========== PARALLAX ==========
const blocks = document.querySelectorAll('.project-block');

const blockData = Array.from(blocks).map(block => ({
  el: block,
  titleName: block.querySelector('.title-name'),
  sideImgs: Array.from(block.querySelectorAll('.side-scatter')).map(img => ({
    el: img,
    speed: parseFloat(img.dataset.speed || 0.1),
  })),
}));

function updateParallax() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;

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
let navLastScroll = 0;
const navBar = document.querySelector('.bottom-bar');

function onMobileScroll() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;

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
  navLastScroll = scrollY;
}

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
