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
    id: 'grounded2024',
    name: 'Grounded 2024',
    year: 2024,
    hero: `${IMG}/Grounded_2024/Grounded_2024_01.webp`,
    floats: [
      `${IMG}/Grounded_2024/Grounded_2024_02.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_04.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_06.webp`,
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
    hero: `${IMG}/Grounded_2022/Grounded_2022_01.webp`,
    floats: [
      `${IMG}/Grounded_2022/Grounded_2022_03.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_05.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_07.webp`,
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
    id: 'largavida',
    name: 'LargaVida',
    year: 2022,
    hero: `${IMG}/LargaVida/01_larga_vida_desktop.webp`,
    floats: [
      `${IMG}/LargaVida/larga_vida_screenshot_01.webp`,
      `${IMG}/LargaVida/larga_vida_screenshot_03.webp`,
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

// ========== SCATTER LAYOUTS — pre-defined positions per image count ==========
const scatterLayouts = {
  3: [
    { x: 5, y: 0, w: 55, h: 60, z: 2, speed: -0.08 },
    { x: 50, y: 15, w: 40, h: 45, z: 3, speed: 0.12 },
    { x: 10, y: 55, w: 45, h: 50, z: 1, speed: -0.15 },
  ],
  4: [
    { x: 3, y: 0, w: 52, h: 55, z: 2, speed: -0.06 },
    { x: 48, y: 10, w: 42, h: 40, z: 3, speed: 0.14 },
    { x: 15, y: 48, w: 38, h: 42, z: 4, speed: -0.18 },
    { x: 55, y: 55, w: 35, h: 38, z: 1, speed: 0.1 },
  ],
  5: [
    { x: 2, y: 0, w: 50, h: 50, z: 2, speed: -0.05 },
    { x: 52, y: 5, w: 40, h: 35, z: 3, speed: 0.15 },
    { x: 8, y: 42, w: 42, h: 40, z: 4, speed: -0.2 },
    { x: 50, y: 45, w: 38, h: 35, z: 1, speed: 0.08 },
    { x: 25, y: 78, w: 50, h: 30, z: 5, speed: -0.12 },
  ],
};

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

  const allSrcs = [proj.hero, ...proj.floats];
  const count = Math.min(allSrcs.length, 5);
  const layout = scatterLayouts[count] || scatterLayouts[3];

  // Mirror every other project for variety
  const mirror = idx % 2 === 1;

  for (let i = 0; i < count; i++) {
    const pos = layout[i];
    const el = document.createElement('div');
    el.className = 'scatter-img';
    el.dataset.speed = pos.speed;
    el.dataset.z = pos.z;

    const xPos = mirror ? (100 - pos.x - pos.w) : pos.x;
    el.style.cssText = `
      left: ${xPos}%;
      top: ${pos.y}%;
      width: ${pos.w}%;
      height: ${pos.h}%;
      z-index: ${pos.z};
    `;

    el.appendChild(createMedia(allSrcs[i]));
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
    <span class="cta-line cta-line-1">See the</span>
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

// ========== SMOOTH SCROLL PHYSICS ==========
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
  // Apply velocity with friction
  scrollVelocity *= FRICTION;
  targetScroll += scrollVelocity;

  // Clamp
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  targetScroll = Math.max(0, Math.min(maxScroll, targetScroll));

  // Lerp toward target
  smoothScroll += (targetScroll - smoothScroll) * LERP;
  window.scrollTo(0, smoothScroll);

  updateParallax();
  requestAnimationFrame(smoothScrollLoop);
}

// Sync on touch/native scroll
window.addEventListener('scroll', () => {
  if (Math.abs(scrollVelocity) < 0.5) {
    smoothScroll = window.scrollY;
    targetScroll = window.scrollY;
  }
}, { passive: true });

requestAnimationFrame(smoothScrollLoop);

// ========== PARALLAX ==========
const blocks = document.querySelectorAll('.project-block');

const blockData = Array.from(blocks).map(block => ({
  el: block,
  titleName: block.querySelector('.title-name'),
  imgs: Array.from(block.querySelectorAll('.scatter-img')).map(img => ({
    el: img,
    speed: parseFloat(img.dataset.speed),
  })),
}));

function updateParallax() {
  const scrollY = window.scrollY;
  const vh = window.innerHeight;

  for (let idx = 0; idx < blockData.length; idx++) {
    const bd = blockData[idx];
    const blockTop = bd.el.offsetTop - scrollY;

    if (blockTop > vh * 2 || blockTop < -bd.el.offsetHeight - vh) continue;

    const progress = Math.max(0, Math.min(1, -blockTop / vh));

    // Title
    const titleScale = 1 + progress * 0.15;
    const titleOpacity = Math.max(0, 1 - progress * 1.3);
    const letterSpacing = progress * 0.5;
    bd.titleName.style.transform = `scale(${titleScale})`;
    bd.titleName.style.opacity = titleOpacity;
    bd.titleName.style.letterSpacing = `${letterSpacing}em`;

    // Scattered images — each at its own speed
    for (const img of bd.imgs) {
      const rect = img.el.getBoundingClientRect();
      const center = (rect.top + rect.height / 2 - vh / 2) / vh;
      const y = center * img.speed * vh;
      img.el.style.transform = `translate3d(0, ${y}px, 0)`;
    }

    if (blockTop > -vh && blockTop < vh * 0.5) {
      barName.textContent = projects[idx].name;
      barCounter.textContent = `${idx + 1} / ${projects.length}`;
    }
  }
}

// ========== WATERMARK LETTER ROTATION ==========
const wmEl = document.getElementById('watermarkText');
if (wmEl) {
  const text = wmEl.textContent;
  wmEl.innerHTML = '';
  const letters = [];
  for (const char of text) {
    const span = document.createElement('span');
    span.className = 'wm-letter';
    span.textContent = char === ' ' ? '\u00A0' : char;
    wmEl.appendChild(span);
    letters.push(span);
  }

  const MAX_ROT = 35;
  let lastScroll = 0;
  let resetTimer = null;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const delta = scrollY - lastScroll;
    lastScroll = scrollY;

    letters.forEach((letter, i) => {
      const offset = i * 0.12;
      const raw = delta * -(1.2 + offset);
      const rot = Math.max(-MAX_ROT, Math.min(MAX_ROT, raw));
      letter.style.transition = 'none';
      letter.style.transform = `rotate(${rot}deg)`;
    });

    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      letters.forEach(letter => {
        letter.style.transition = 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1)';
        letter.style.transform = 'rotate(0deg)';
      });
    }, 80);
  }, { passive: true });
}

// ========== HIDE NAVBAR ON SCROLL DOWN ==========
let navLastScroll = 0;
const navBar = document.querySelector('.bottom-bar');
if (navBar) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > navLastScroll && scrollY > 100) {
      navBar.classList.add('bar-hidden');
    } else {
      navBar.classList.remove('bar-hidden');
    }
    navLastScroll = scrollY;
  }, { passive: true });
}
