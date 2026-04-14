const IMG = 'Images';

const projects = [
  {
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
    name: 'Black Friday TAF',
    year: 2021,
    hero: `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_anim_01.webp`,
    floats: [
      `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_01.webp`,
      `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_02.webp`,
    ]
  },
  {
    name: 'LargaVida',
    year: 2022,
    hero: `${IMG}/LargaVida/01_larga_vida_desktop.webp`,
    floats: [
      `${IMG}/LargaVida/larga_vida_screenshot_01.webp`,
      `${IMG}/LargaVida/larga_vida_screenshot_03.webp`,
    ]
  },
  {
    name: 'NewEdge Magazine',
    year: 2020,
    hero: `${IMG}/NewEdge_magazine/NewEdge_magazine_01.webp`,
    floats: [
      `${IMG}/NewEdge_magazine/NewEdge_magazine_02.webp`,
      `${IMG}/NewEdge_magazine/NewEdge_magazine_04.webp`,
    ]
  },
  {
    name: 'Grounded 2018',
    year: 2018,
    hero: `${IMG}/Grounded_2018/plakat.webp`,
    floats: [
      `${IMG}/Grounded_2018/grounded_2018_anim.webp`,
      `${IMG}/Grounded_2018/44396997_2300717590163245_3256152537651807309_n.webp`,
    ]
  },
  {
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

// Shuffle
for (let i = projects.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [projects[i], projects[j]] = [projects[j], projects[i]];
}


function isVideo(src) {
  return src.endsWith('.webm') || src.endsWith('.mp4');
}

function createMedia(src) {
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
  img.loading = 'lazy';
  return img;
}

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

  const year = document.createElement('div');
  year.className = 'title-year';
  year.textContent = proj.year;
  titleLayer.appendChild(year);

  const line = document.createElement('div');
  line.className = 'title-line';
  titleLayer.appendChild(line);

  block.appendChild(titleLayer);

  // Image layer — hero + secondary rows scroll over the title
  const imageLayer = document.createElement('div');
  imageLayer.className = 'image-layer';

  // Hero
  const hero = document.createElement('div');
  hero.className = 'hero-image';
  hero.appendChild(createMedia(proj.hero));
  imageLayer.appendChild(hero);

  // Secondary images in rows of 2
  for (let i = 0; i < proj.floats.length; i += 2) {
    const row = document.createElement('div');
    row.className = 'float-row';
    // Alternate parallax speed per row
    row.dataset.speed = (0.3 + (i / proj.floats.length) * 0.5).toFixed(2);

    const f1 = document.createElement('div');
    f1.className = 'float-img';
    f1.appendChild(createMedia(proj.floats[i]));
    row.appendChild(f1);

    if (proj.floats[i + 1]) {
      const f2 = document.createElement('div');
      f2.className = 'float-img';
      f2.appendChild(createMedia(proj.floats[i + 1]));
      row.appendChild(f2);
    }

    imageLayer.appendChild(row);
  }

  block.appendChild(imageLayer);
  container.appendChild(block);
});

barCounter.textContent = `1 / ${projects.length}`;

// ========== SCROLL-DRIVEN PARALLAX ==========
const blocks = document.querySelectorAll('.project-block');
let ticking = false;

// Cache DOM refs per block to avoid querySelectorAll on every frame
const blockData = Array.from(blocks).map(block => ({
  el: block,
  titleName: block.querySelector('.title-name'),
  titleYear: block.querySelector('.title-year'),
  titleLine: block.querySelector('.title-line'),
  hero: block.querySelector('.hero-image'),
  rows: Array.from(block.querySelectorAll('.float-row')).map(row => ({
    el: row,
    speed: parseFloat(row.dataset.speed),
  })),
}));

container.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
    ticking = true;
  }
});

function updateParallax() {
  const scrollY = container.scrollTop;
  const vh = window.innerHeight;

  for (let idx = 0; idx < blockData.length; idx++) {
    const bd = blockData[idx];
    const blockTop = bd.el.offsetTop - scrollY;

    // Skip blocks far off-screen
    if (blockTop > vh * 2 || blockTop < -bd.el.offsetHeight - vh) continue;

    const progress = Math.max(0, Math.min(1, -blockTop / vh));

    const titleScale = 1 + progress * 0.15;
    const titleOpacity = Math.max(0, 1 - progress * 1.3);
    bd.titleName.style.transform = `scale(${titleScale})`;
    bd.titleName.style.opacity = titleOpacity;
    bd.titleYear.style.opacity = titleOpacity;
    bd.titleLine.style.opacity = titleOpacity * 0.2;

    const heroRect = bd.hero.getBoundingClientRect();
    const heroY = (1 - (vh - heroRect.top) / (vh + heroRect.height)) * 40;
    bd.hero.style.transform = `translateY(${heroY}px)`;

    for (const row of bd.rows) {
      const rowRect = row.el.getBoundingClientRect();
      const rowY = (1 - (vh - rowRect.top) / (vh + rowRect.height)) * 80 * row.speed;
      row.el.style.transform = `translateY(${rowY}px)`;
    }

    if (blockTop > -vh && blockTop < vh * 0.5) {
      barName.textContent = projects[idx].name;
      barCounter.textContent = `${idx + 1} / ${projects.length}`;
    }
  }
}

updateParallax();


