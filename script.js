// ========== IMAGE & PROJECT DATA ==========
const IMG = 'Images';

const projects = {
  cestel: {
    name: 'CESTEL Animation',
    year: 2023,
    client: 'Cestel',
    collab: 'Studio ENKI',
    location: 'Slovenia, Ljubljana',
    desc: [
      'With over 30 years of experience in bridge weigh-in-motion measurements, bridge assessments and traffic data, Cestel is one of the world\'s leading companies in the fields of high-speed weigh-in-motion and traffic analysis.',
      'Animation that showcases CESTEL measurement process in an abstract way that is engaging for the watchers. Animation will be used for informational purposes and showcase of their system.'
    ],
    tools: ['Cinema 4D', 'Redshift', 'Sound Design', 'Photoshop', 'AfterEffects'],
    images: [
      `${IMG}/Cestel_project/cestel_anim_01.webp`,
      `${IMG}/Cestel_project/Cestel_image_01.webp`,
      `${IMG}/Cestel_project/Cestel_image_02.webp`,
      `${IMG}/Cestel_project/cestel_anim_02.webp`,
      `${IMG}/Cestel_project/Cestel_image_03.webp`,
      `${IMG}/Cestel_project/Cestel_image_04.webp`,
      `${IMG}/Cestel_project/Cestel_image_05.webp`,
      `${IMG}/Cestel_project/Cestel_image_06.webp`,
      `${IMG}/Cestel_project/Cestel_image_07.webp`,
      `${IMG}/Cestel_project/cestel_anim_03.webp`,
      `${IMG}/Cestel_project/Cestel_image_08.webp`,
      `${IMG}/Cestel_project/Cestel_image_09.webp`,
      `${IMG}/Cestel_project/Cestel_image_10.webp`,
      `${IMG}/Cestel_project/Cestel_image_11.webp`,
      `${IMG}/Cestel_project/Cestel_image_12.webp`,
      `${IMG}/Cestel_project/cover_still.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 1, imgs: [3] },
      { cols: 3, imgs: [4, 5, 6] },
      { cols: 2, imgs: [7, 8] },
      { cols: 1, imgs: [9] },
      { cols: 3, imgs: [10, 11, 12] },
      { cols: 2, imgs: [13, 14] },
    ]
  },
  grounded2022: {
    name: 'Festival Grounded 2022',
    year: 2022,
    client: 'Pritličje',
    theme: 'Responsibility',
    desc: ['Visual identity and motion design for the Grounded festival 2022 edition.'],
    tools: ['Cinema 4D', 'Redshift', 'AfterEffects', 'Photoshop'],
    images: [
      `${IMG}/Grounded_2022/Grounded_2022_01.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_02.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_03.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_04.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_05.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_06.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_07.webp`,
      `${IMG}/Grounded_2022/Grounded_2022_08.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 3, imgs: [3, 4, 5] },
      { cols: 2, imgs: [6, 7] },
    ]
  },
  grounded2021: {
    name: 'Festival Grounded 2021: The State',
    year: 2021,
    client: 'Pritličje',
    desc: ['Visual identity and motion design for the Grounded festival 2021 edition.'],
    tools: ['Cinema 4D', 'Redshift', 'AfterEffects', 'Photoshop'],
    images: [
      `${IMG}/Grounded_2021/Grounded_SerijaPlakatov.webp`,
      `${IMG}/Grounded_2021/GR_render0034.webp`,
      `${IMG}/Grounded_2021/Grounded_instagram-profil.webp`,
      `${IMG}/Grounded_2021/Grounded_nalepke.webp`,
      `${IMG}/Grounded_2021/Grounded_spletnastran.webp`,
      `${IMG}/Grounded_2021/InstagramStoryAnimation.webp`,
      `${IMG}/Grounded_2021/Statika_1.webp`,
      `${IMG}/Grounded_2021/Statika_2_1.webp`,
      `${IMG}/Grounded_2021/Statika_teme_2.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 3, imgs: [3, 4, 5] },
      { cols: 2, imgs: [6, 7] },
      { cols: 1, imgs: [8] },
    ]
  },
  taf: {
    name: "The Athlete's Foot",
    year: 2021,
    client: "The Athlete's Foot",
    type: '#worldsneakerday',
    desc: ["Social media animation and motion design for The Athlete's Foot sneaker brand."],
    tools: ['Cinema 4D', 'AfterEffects', 'Photoshop'],
    images: [
      `${IMG}/Athletesfoot/taf_anim.webp`,
      `${IMG}/Athletesfoot/taf_image_01.webp`,
      `${IMG}/Athletesfoot/taf_image_02.webp`,
      `${IMG}/Athletesfoot/taf_image_03.webp`,
      `${IMG}/Athletesfoot/screenshot_01.webp`,
      `${IMG}/Athletesfoot/screenshot_02.webp`,
      `${IMG}/Athletesfoot/screenshot_03.webp`,
      `${IMG}/Athletesfoot/screenshot_04.webp`,
      `${IMG}/Athletesfoot/taf_vertical.webm`,
      `${IMG}/Athletesfoot/taf_landscape.webm`,
    ],
    layout: [
      { cols: 1, imgs: [9] },
      { cols: 1, imgs: [0] },
      { cols: 3, imgs: [1, 2, 3] },
      { cols: 2, imgs: [4, 5] },
      { cols: 2, imgs: [6, 7] },
      { cols: 1, imgs: [8] },
    ]
  },
  grounded2020: {
    name: 'Festival Grounded: Truth',
    year: 2020,
    client: 'Pritličje',
    link: 'https://www.grounded.si',
    desc: [
      'Solidarity, elimination of inequality and peaceful co-existence assume the existence of truth, and truthfulness as the value of public action. In the post-truth world, these assumptions no longer exist.',
      'Those in positions of power often lie without legal or other social sanction. The ruling party-owned media spreads lies about those who resist them. Social networks increase the reach of conspiracy theories, while platforms are placed in the role of arbiters of truth.'
    ],
    tools: ['Cinema 4D', 'Redshift', 'AfterEffects', 'Photoshop'],
    images: [
      `${IMG}/Grounded_2020/Grounded_poster_2.webp`,
      `${IMG}/Grounded_2020/Artboard-26.webp`,
      `${IMG}/Grounded_2020/Artboard-26-copy-2.webp`,
      `${IMG}/Grounded_2020/grounded_resnica.webp`,
      `${IMG}/Grounded_2020/Grounded2020_anim.webp`,
      `${IMG}/Grounded_2020/Grounded2020_2_anim.webp`,
      `${IMG}/Grounded_2020/grounded2020_ekran.webm`,
      `${IMG}/Grounded_2020/grounded2020_fence.webm`,
      `${IMG}/Grounded_2020/grounded2020_mikrofon.webm`,
    ],
    layout: [
      { cols: 2, imgs: [0, 1] },
      { cols: 2, imgs: [2, 3] },
      { cols: 2, imgs: [4, 5] },
      { cols: 1, imgs: [6] },
      { cols: 2, imgs: [7, 8] },
    ]
  },
  grounded2018: {
    name: 'Festival Grounded 2018: Intimacy in the age of AI',
    year: 2018,
    client: 'Pritličje',
    desc: ['Visual identity for the second edition of the Grounded festival.'],
    tools: ['Cinema 4D', 'Photoshop', 'Illustrator'],
    images: [
      `${IMG}/Grounded_2018/plakat.webp`,
      `${IMG}/Grounded_2018/grounded_2018_anim.webp`,
      `${IMG}/Grounded_2018/44396997_2300717590163245_3256152537651807309_n.webp`,
      `${IMG}/Grounded_2018/Grounded_2018_instagram.webm`,
      `${IMG}/Grounded_2018/Grounded_2018_music.webm`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 2, imgs: [3, 4] },
    ]
  },
  tamtam: {
    name: 'Mesta pešcem — TamTam',
    year: 2018,
    award: 'Mestni plakat leta — TamTam 2018',
    desc: ['Award-winning city poster design for TamTam.'],
    tools: ['Photoshop', 'Illustrator'],
    images: [
      `${IMG}/TamTam_Hoja--moj-transport_plakat-tisk.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
    ]
  },
  ment: {
    name: 'AppointMENT 4.0',
    year: 2019,
    desc: ['Visual identity design for the AppointMENT 4.0 event.'],
    tools: ['Cinema 4D', 'Photoshop', 'Illustrator'],
    images: [
      `${IMG}/AppointMENT_4.0/AppointMENT_poster.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
    ]
  },
  halloween: {
    name: "Halloween — The Athlete's Foot",
    year: 2021,
    client: "The Athlete's Foot",
    desc: ['3D animation and social media content for Halloween campaign.'],
    tools: ['Cinema 4D', 'ZBrush', 'Redshift', 'AfterEffects'],
    images: [
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_01.webp`,
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_02.webp`,
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_03.webp`,
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_04.webp`,
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_05.webp`,
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_06.webp`,
      `${IMG}/Athletesfoot_halloween/Athletesfoot_halloween_07.webp`,
      `${IMG}/Athletesfoot_halloween/screenshot_1.webp`,
      `${IMG}/Athletesfoot_halloween/screenshot_2.webp`,
      `${IMG}/Athletesfoot_halloween/screenshot_3.webp`,
      `${IMG}/Athletesfoot_halloween/screenshot_zbrush.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 3, imgs: [1, 2, 3] },
      { cols: 2, imgs: [4, 5] },
      { cols: 2, imgs: [6, 10] },
      { cols: 3, imgs: [7, 8, 9] },
    ]
  },
  blackfriday: {
    name: "Black Friday — The Athlete's Foot",
    year: 2021,
    client: "The Athlete's Foot",
    desc: ['3D animation and motion graphics for Black Friday campaign.'],
    tools: ['Cinema 4D', 'Redshift', 'AfterEffects'],
    images: [
      `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_anim_01.webp`,
      `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_anim_02.webp`,
      `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_01.webp`,
      `${IMG}/Athletesfoot_blackfriday/Athletesfoot_blackfriday_02.webp`,
    ],
    layout: [
      { cols: 2, imgs: [0, 1] },
      { cols: 2, imgs: [2, 3] },
    ]
  },
  largavida: {
    name: 'LargaVida Limited Edition',
    year: 2022,
    desc: ['Design for LargaVida limited edition product line.'],
    tools: ['Photoshop', 'Illustrator'],
    images: [
      `${IMG}/LargaVida/01_larga_vida_desktop.webp`,
      `${IMG}/LargaVida/larga_vida_screenshot_01.webp`,
      `${IMG}/LargaVida/larga_vida_screenshot_02.webp`,
      `${IMG}/LargaVida/larga_vida_screenshot_03.webp`,
      `${IMG}/LargaVida/larga_vida_screenshot_04.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 2, imgs: [3, 4] },
    ]
  },
  newedge: {
    name: 'NewEdge Magazine',
    year: 2020,
    desc: ['Editorial design for NewEdge magazine.'],
    tools: ['InDesign', 'Photoshop', 'Illustrator'],
    images: [
      `${IMG}/NewEdge_magazine/NewEdge_magazine_01.webp`,
      `${IMG}/NewEdge_magazine/NewEdge_magazine_02.webp`,
      `${IMG}/NewEdge_magazine/NewEdge_magazine_03.webp`,
      `${IMG}/NewEdge_magazine/NewEdge_magazine_04.webp`,
      `${IMG}/NewEdge_magazine/NewEdge_reality_01.webm`,
      `${IMG}/NewEdge_magazine/NewEdge_reality_02.webm`,
    ],
    layout: [
      { cols: 2, imgs: [0, 1] },
      { cols: 2, imgs: [2, 3] },
      { cols: 2, imgs: [4, 5] },
    ]
  },
  grounded2023: {
    name: 'Festival Grounded 2023',
    year: 2023,
    client: 'Pritličje',
    desc: ['Visual identity, 3D animation and motion design for the Grounded festival 2023 edition.'],
    tools: ['Cinema 4D', 'Redshift', 'AfterEffects'],
    images: [
      `${IMG}/Grounded_2023/Grounded_2023_01.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_02.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_03.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_04.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_05.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_06.webm`,
      `${IMG}/Grounded_2023/Grounded_2023_07.webm`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 1, imgs: [3] },
      { cols: 2, imgs: [4, 5] },
      { cols: 1, imgs: [6] },
    ]
  },
  grounded2024: {
    name: 'Festival Grounded 2024',
    year: 2024,
    client: 'Pritličje',
    desc: ['Visual identity and motion design for the Grounded festival 2024 edition.'],
    tools: ['Cinema 4D', 'Redshift', 'AfterEffects', 'Photoshop'],
    images: [
      `${IMG}/Grounded_2024/Grounded_2024_01.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_02.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_03.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_04.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_05.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_06.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_07.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_sticker_01.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_sticker_02.webp`,
      `${IMG}/Grounded_2024/Grounded_2024_comp.webm`,
      `${IMG}/Grounded_2024/Grounded_2024_story.webm`,
      `${IMG}/Grounded_2024/Grounded_2024_mehurcki.webm`,
    ],
    layout: [
      { cols: 1, imgs: [9] },
      { cols: 2, imgs: [0, 1] },
      { cols: 3, imgs: [2, 3, 4] },
      { cols: 1, imgs: [10] },
      { cols: 2, imgs: [5, 6] },
      { cols: 2, imgs: [7, 8] },
      { cols: 1, imgs: [11] },
    ]
  },
  radenci: {
    name: 'Radenci — Prostorska Projekcija',
    year: 2022,
    desc: ['Spatial projection mapping installation in Radenci.'],
    tools: ['Cinema 4D', 'Resolume', 'AfterEffects'],
    images: Array.from({ length: 25 }, (_, i) => {
      const names = [
        'P1_S1_K01_0323.webp','P1_S1_K02_0533.webp','P1_S1_K02_i1_0460.webp',
        'P1_S2_K04_0110.webp','P1_S2_K05_0238.webp','P1_S3_K03_0282.webp',
        'P1_S3_K05_0054.webp','P1_S3_K06_0150.webp','P1_S3_K06_0329.webp',
        'P1_S3_K07_0377.webp','P1_S3_K07_0406.webp','P2_S02_K03_0118.webp',
        'P2_S02_K03_0529.webp','P2_S1_K01_0227.webp','P2_S1_K01_A&B_0046.webp',
        'P2_S1_K02_0806.webp','P2_S1_K03_0182.webp','P2_S1_K03_B_i1_0397.webp',
        'P2_S2_K01_0376.webp','P2_S2_K01_0701.webp','P2_S2_K01_0841.webp',
        'P2_S3_K03_0482.webp','P2_S3_K03_B_02_0605.webp','P2_S3_K05_0026.webp',
        'P2_S3_K05_0477.webp'
      ];
      return `${IMG}/Radenci_prostorska_projekcija/${names[i]}`;
    }),
    layout: [
      { cols: 2, imgs: [0, 1] },
      { cols: 3, imgs: [2, 3, 4] },
      { cols: 2, imgs: [5, 6] },
      { cols: 3, imgs: [7, 8, 9] },
      { cols: 2, imgs: [10, 11] },
      { cols: 3, imgs: [12, 13, 14] },
      { cols: 2, imgs: [15, 16] },
      { cols: 3, imgs: [17, 18, 19] },
      { cols: 2, imgs: [20, 21] },
      { cols: 3, imgs: [22, 23, 24] },
    ]
  },
  lab: {
    name: 'Lab — Experiments',
    desc: ['Personal experiments, 3D explorations, and creative coding projects.'],
    tools: ['Cinema 4D', 'Houdini', 'Redshift'],
    images: [
      `${IMG}/Lab/Fly_fico.webm`,
      `${IMG}/Lab/Furry_jezik.webm`,
      `${IMG}/Lab/gold.webm`,
      `${IMG}/Lab/Particles2.webm`,
      `${IMG}/Lab/lab_comp.webm`,
      `${IMG}/Lab/lab_impol.webm`,
      `${IMG}/Lab/lab_sandunes.webm`,
      `${IMG}/Lab/Dream_01.webp`,
      `${IMG}/Lab/Dream_02.webp`,
      `${IMG}/Lab/Dream_03.webp`,
      `${IMG}/Lab/Dream_03-2.webp`,
      `${IMG}/Lab/Dream_04-2.webp`,
      `${IMG}/Lab/lab_kristal.webm`,
      `${IMG}/Lab/lab_kristal_story.webm`,
      `${IMG}/Lab/kristal0020.webp`,
      `${IMG}/Lab/kristal0025.webp`,
      `${IMG}/Lab/kristal0026.webp`,
      `${IMG}/Lab/qurtz0012.webp`,
      `${IMG}/Lab/qurtz0033.webp`,
      `${IMG}/Lab/testgoba_3.webp`,
      `${IMG}/Lab/take_3_0138.webp`,
      `${IMG}/Lab/Kersnikova_logo_take4_4.webp`,
      `${IMG}/Lab/end.webp`,
      `${IMG}/Lab/lm62ZTf.webp`,
    ],
    layout: [
      { cols: 2, imgs: [0, 1] },
      { cols: 2, imgs: [2, 4] },
      { cols: 1, imgs: [5] },
      { cols: 2, imgs: [3, 6] },
      { cols: 3, imgs: [7, 8, 9] },
      { cols: 2, imgs: [10, 11] },
      { cols: 1, imgs: [12] },
      { cols: 2, imgs: [13, 14] },
      { cols: 3, imgs: [15, 16, 17] },
      { cols: 2, imgs: [18, 19] },
      { cols: 1, imgs: [20] },
      { cols: 2, imgs: [21, 22] },
      { cols: 2, imgs: [23, 24] },
    ]
  },
  poster: {
    name: 'Poster Design',
    year: 2020,
    desc: ['Various poster design work.'],
    tools: ['Photoshop', 'Illustrator'],
    images: [
      `${IMG}/Plakat-500x700-B2.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
    ]
  }
};

// ========== DOMINANT COLOR EXTRACTION ==========
function getDominantColor(img) {
  const canvas = document.createElement('canvas');
  const size = 50; // small sample for speed
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  // Bucket average — skip near-black/near-white pixels for better color signal
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
    const r = data[i], g = data[i+1], b = data[i+2];
    const brightness = (r + g + b) / 3;
    if (brightness > 20 && brightness < 235) {
      rSum += r; gSum += g; bSum += b; count++;
    }
  }

  if (count === 0) {
    // All pixels were near-black or near-white — check which
    let totalBright = 0, total = 0;
    for (let i = 0; i < data.length; i += 16) {
      totalBright += (data[i] + data[i+1] + data[i+2]) / 3;
      total++;
    }
    return (totalBright / total) < 128 ? 'black' : 'white';
  }

  const r = rSum / count, g = gSum / count, b = bSum / count;
  return classifyColor(r, g, b);
}

function classifyColor(r, g, b) {
  // Convert to HSL for easier classification
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  let h = 0;
  if (d !== 0) {
    if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) * 60;
    else if (max === gf) h = ((bf - rf) / d + 2) * 60;
    else h = ((rf - gf) / d + 4) * 60;
  }

  // Low saturation → achromatic
  if (s < 0.12) {
    if (l < 0.2) return 'black';
    if (l > 0.8) return 'white';
    return 'gray';
  }

  // Classify by hue
  if (h < 15 || h >= 345) return 'red';
  if (h < 40) return 'orange';
  if (h < 70) return 'yellow';
  if (h < 160) return 'green';
  if (h < 200) return 'cyan';
  if (h < 260) return 'blue';
  if (h < 310) return 'purple';
  return 'pink';
}

const COLOR_HEX = {
  red: '#e74c3c', orange: '#e67e22', yellow: '#f1c40f', green: '#2ecc71',
  cyan: '#00bcd4', blue: '#3498db', purple: '#9b59b6', pink: '#e91e8a',
  black: '#222222', white: '#e0e0e0', gray: '#888888',
};

// Build flat list of grid items: one per image, tagged with project/year
// Color gets filled in async after image loads
const gridItems = [];
for (const [projId, proj] of Object.entries(projects)) {
  for (const src of proj.images) {
    gridItems.push({
      src,
      project: projId,
      projectName: proj.name,
      year: proj.year,
      color: 'gray',
    });
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
shuffle(gridItems);

// ========== RENDER GRID ==========
const gridEl = document.getElementById('grid');

function renderGrid() {
  const frag = document.createDocumentFragment();
  for (const item of gridItems) {
    const div = document.createElement('div');
    const isVideo = item.src.endsWith('.webm') || item.src.endsWith('.mp4');
    const isAnim = item.src.includes('anim') || item.src.includes('Anim');

    div.className = 'grid-item loading';
    div.dataset.project = item.project;
    div.dataset.year = item.year;
    div.dataset.color = item.color;
    div.dataset.type = (isVideo || isAnim) ? 'video' : 'image';

    // On mobile: use tiny 300px images, on desktop: use thumbs for videos, full for images
    let gridSrc;
    if (isMobile) {
      if (isVideo) {
        gridSrc = item.src.replace(/\.(webm|mp4)$/, '_thumb.webp');
      } else {
        gridSrc = item.src.replace('Images/', 'Images/mobile/');
      }
    } else {
      gridSrc = isVideo ? item.src.replace(/\.(webm|mp4)$/, '_thumb.webp') : item.src;
    }

    const media = document.createElement('img');
    media.alt = item.projectName;
    media.decoding = 'async';
    media.dataset.src = gridSrc;
    div.appendChild(media);
    media.addEventListener('load', () => {
      div.classList.remove('loading');
      if (window.requestIdleCallback) {
        requestIdleCallback(() => extractColor(media, item, div));
      } else {
        setTimeout(() => extractColor(media, item, div), 100);
      }
    });

    // Video hover — desktop only
    if (isVideo && !isMobile) {
      let vid = null;
      div.addEventListener('mouseenter', () => {
        if (!vid) {
          vid = document.createElement('video');
          vid.src = item.src;
          vid.muted = true;
          vid.loop = true;
          vid.playsInline = true;
          vid.preload = 'none';
          vid.className = 'hover-video';
          div.appendChild(vid);
        }
        vid.play().catch(() => {});
        vid.style.opacity = '1';
      });
      div.addEventListener('mouseleave', () => {
        if (vid) {
          vid.pause();
          vid.style.opacity = '0';
        }
      });
    }

    const label = document.createElement('span');
    label.className = 'item-label';
    label.textContent = item.projectName;
    div.appendChild(label);

    div.addEventListener('click', () => openProject(item.project));

    frag.appendChild(div);
  }
  gridEl.innerHTML = '';
  gridEl.appendChild(frag);
}

const isMobile = window.innerWidth < 768;

function extractColor(media, item, div) {
  if (isMobile) return; // skip heavy canvas work on mobile
  try {
    const color = getDominantColor(media);
    item.color = color;
    div.dataset.color = color;
  } catch (e) {}
  rebuildColorDropdown();
}

renderGrid();

// ========== TRUE LAZY LOAD ==========
const lazyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target.querySelector('img[data-src]');
      if (img) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
      lazyObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: isMobile ? '400px' : '200px' });

document.querySelectorAll('.grid-item').forEach(item => lazyObserver.observe(item));

// ========== FILTERS ==========
let activeFilters = { project: null, year: null, color: null, type: null };

function buildDropdowns() {
  // Project dropdown
  const projMenu = document.getElementById('menu-project');
  const projNames = [...new Set(gridItems.map(i => i.project))].sort();
  for (const id of projNames) {
    const btn = document.createElement('button');
    btn.className = 'proj-filter-btn';
    btn.dataset.value = id;

    const thumb = document.createElement('img');
    const firstSrc = projects[id].images[0];
    const isVid = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4');
    thumb.src = isVid ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;
    thumb.alt = projects[id].name;
    thumb.className = 'proj-filter-thumb';
    btn.appendChild(thumb);

    const label = document.createElement('span');
    label.textContent = projects[id].name;
    btn.appendChild(label);

    btn.addEventListener('click', () => setFilter('project', id));
    projMenu.appendChild(btn);
  }


  // Color dropdown built dynamically after images load
  rebuildColorDropdown();
}

let colorRebuildTimer = null;
function rebuildColorDropdown() {
  clearTimeout(colorRebuildTimer);
  colorRebuildTimer = setTimeout(_rebuildColorDropdown, 300);
}

function _rebuildColorDropdown() {
  const colorMenu = document.getElementById('menu-color');
  colorMenu.innerHTML = '';
  colorMenu.classList.add('color-grid');
  const colors = [...new Set(gridItems.map(i => i.color))].sort();
  for (const name of colors) {
    const hex = COLOR_HEX[name] || '#888';
    const btn = document.createElement('button');
    btn.className = 'color-swatch-btn';
    btn.dataset.value = name;
    btn.style.background = hex;
    btn.title = name;
    if (activeFilters.color === name) btn.classList.add('active');
    btn.addEventListener('click', () => setFilter('color', name));
    colorMenu.appendChild(btn);
  }
}

buildDropdowns();

// Type filter buttons
document.getElementById('filterImages').addEventListener('click', (e) => { e.stopPropagation(); setFilter('type', 'image'); });
document.getElementById('filterVideos').addEventListener('click', (e) => { e.stopPropagation(); setFilter('type', 'video'); });

function setFilter(type, value) {
  if (activeFilters[type] === value) {
    activeFilters[type] = null;
  } else {
    activeFilters[type] = value;
  }
  applyFilters();
  closeAllDropdowns();
}

function applyFilters() {
  const items = gridEl.querySelectorAll('.grid-item');
  items.forEach(item => {
    let show = true;
    if (activeFilters.project && item.dataset.project !== activeFilters.project) show = false;
    if (activeFilters.year && item.dataset.year !== String(activeFilters.year)) show = false;
    if (activeFilters.color && item.dataset.color !== activeFilters.color) show = false;
    if (activeFilters.type && item.dataset.type !== activeFilters.type) show = false;

    if (show) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });

  // Show/hide no results
  const visibleCount = gridEl.querySelectorAll('.grid-item:not(.hidden)').length;
  document.getElementById('noResults').classList.toggle('visible', visibleCount === 0);

  // Update toggle button states (skip nav)
  document.querySelectorAll('.bar-toggle').forEach(btn => {
    const menu = btn.dataset.menu;
    if (menu === 'nav') return;
    btn.classList.toggle('has-filter', activeFilters[menu] !== null);
  });

  // Update dropdown active states
  document.querySelectorAll('.bar-dropdown button').forEach(btn => {
    const parent = btn.closest('.bar-dropdown');
    const type = parent.id.replace('menu-', '');
    btn.classList.toggle('active', String(activeFilters[type]) === String(btn.dataset.value));
  });
}

// Reset
document.getElementById('resetFilters').addEventListener('click', () => {
  activeFilters = { project: null, year: null, color: null, type: null };
  applyFilters();
  closeAllDropdowns();
});

// ========== DROPDOWN TOGGLE ==========
function closeAllDropdowns() {
  document.querySelectorAll('.bar-dropdown').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.bar-toggle').forEach(b => b.classList.remove('active'));
}

document.querySelectorAll('.bar-toggle').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const menuType = btn.dataset.menu;

    // On mobile, open fullscreen list for project filter
    if (isMobile && menuType === 'project') {
      closeAllDropdowns();
      openMobileProjectList();
      return;
    }

    const menuId = 'menu-' + menuType;
    const menu = document.getElementById(menuId);
    const isOpen = menu.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) {
      menu.classList.add('open');
      btn.classList.add('active');
    }
  });
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.bottom-bar')) closeAllDropdowns();
});

// ========== DROPDOWN MOUSE TILT ==========
document.querySelectorAll('.bar-dropdown').forEach(dropdown => {
  dropdown.addEventListener('mousemove', (e) => {
    if (!dropdown.classList.contains('open')) return;
    const rect = dropdown.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const tiltX = y * -4;
    const tiltY = x * 4;
    dropdown.style.transform = `translateX(-50%) scale(1) translateY(0) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  dropdown.addEventListener('mouseleave', () => {
    if (!dropdown.classList.contains('open')) return;
    dropdown.style.transform = '';
  });
});

// ========== PROJECT OVERLAY ==========
const overlay = document.getElementById('overlay');
const overlayInner = document.getElementById('overlayInner');
const overlayClose = document.getElementById('overlayClose');

const loremPool = [
  'The creative process began with extensive research into the brand\'s visual language, exploring how motion and form could communicate the core message.',
  'Every detail was carefully considered — from color grading to timing — ensuring each frame contributed to a cohesive narrative.',
  'The project pushed the boundaries of what\'s possible with real-time rendering, combining procedural techniques with hand-crafted animation.',
  'Working closely with the client, we iterated through multiple visual directions before arriving at a concept that felt both fresh and authentic.',
  'Typography and motion were treated as equal partners in the design, each reinforcing the other to create a unified visual experience.',
  'The final deliverables included a full suite of animated assets optimized for social media, web, and large-format display.',
];

function mediaTag(src, alt) {
  if (src.endsWith('.webm') || src.endsWith('.mp4')) {
    return `<video src="${src}" autoplay muted loop playsinline></video>`;
  }
  return `<img src="${src}" alt="${alt || ''}" loading="lazy" />`;
}

function openProject(projId) {
  const proj = projects[projId];
  if (!proj) return;

  const isLab = projId === 'lab';

  if (isLab) {
    // Lab keeps simple gallery layout
    let html = `<div class="proj-hero-dark"><div class="proj-hero-content">`;
    html += `<h1 class="proj-title">${proj.name}</h1>`;
    if (proj.desc) proj.desc.forEach(p => html += `<p class="proj-desc">${p}</p>`);
    if (proj.tools) {
      html += '<div class="proj-tools">';
      proj.tools.forEach(t => html += `<span class="proj-tag">${t}</span>`);
      html += '</div>';
    }
    html += '</div></div>';
    html += '<div class="proj-white-sheet"><div class="proj-gallery">';
    for (const row of proj.layout) {
      html += `<div class="gallery-row row-${row.cols}">`;
      for (const idx of row.imgs) {
        if (proj.images[idx]) html += mediaTag(proj.images[idx], proj.name);
      }
      html += '</div>';
    }
    html += '</div></div>';
    overlayInner.innerHTML = html;
  } else {
    // Hero section — dark with main image
    const heroSrc = proj.images[0];
    let html = `<div class="proj-hero-dark">`;
    html += `<div class="proj-hero-media">${mediaTag(heroSrc, proj.name)}</div>`;
    html += `<div class="proj-hero-content">`;
    html += `<h1 class="proj-title">${proj.name}</h1>`;
    html += '<div class="proj-meta">';
    if (proj.client) html += `<div><strong>Client</strong>${proj.client}</div>`;
    if (proj.collab) html += `<div><strong>Collaboration</strong>${proj.collab}</div>`;
    if (proj.year) html += `<div><strong>Year</strong>${proj.year}</div>`;
    if (proj.location) html += `<div><strong>Location</strong>${proj.location}</div>`;
    if (proj.theme) html += `<div><strong>Theme</strong>${proj.theme}</div>`;
    if (proj.type) html += `<div><strong>Type</strong>${proj.type}</div>`;
    if (proj.award) html += `<div><strong>Award</strong>${proj.award}</div>`;
    html += '</div></div></div>';

    // White sheet — alternating image/text sections
    html += '<div class="proj-white-sheet">';

    // Intro text block
    const descTexts = proj.desc && proj.desc.length > 0 ? proj.desc : [loremPool[0], loremPool[1]];
    html += '<div class="proj-intro">';
    descTexts.forEach(p => html += `<p>${p}</p>`);
    if (proj.link) {
      html += `<p><a href="${proj.link}" target="_blank" rel="noopener noreferrer">${proj.link} ↗</a></p>`;
    }
    if (proj.tools) {
      html += '<div class="proj-tools-white">';
      proj.tools.forEach(t => html += `<span>${t}</span>`);
      html += '</div>';
    }
    html += '</div>';

    // Alternating image-text rows (skip first image, used as hero)
    const remaining = proj.images.slice(1);
    let loremIdx = 0;
    for (let i = 0; i < remaining.length; i++) {
      const src = remaining[i];
      const isLeft = i % 2 === 0;
      const text = proj.desc && proj.desc[i + 1]
        ? proj.desc[i + 1]
        : loremPool[loremIdx % loremPool.length];
      loremIdx++;

      if (i < remaining.length - 1 && remaining.length > 2) {
        // Alternating layout
        html += `<div class="proj-row ${isLeft ? 'img-left' : 'img-right'}">`;
        html += `<div class="proj-row-media">${mediaTag(src, proj.name)}</div>`;
        html += `<div class="proj-row-text"><p>${text}</p></div>`;
        html += '</div>';
      } else {
        // Full-width for last image or small sets
        html += `<div class="proj-row-full">${mediaTag(src, proj.name)}</div>`;
      }
    }

    html += '</div>';
    overlayInner.innerHTML = html;
  }

  // Wire up lightbox on all clickable media
  lightboxItems = proj.images;
  const allMedia = overlayInner.querySelectorAll('.proj-row-media img, .proj-row-media video, .proj-row-full img, .proj-row-full video, .proj-gallery img, .proj-gallery video');
  allMedia.forEach((el) => {
    const src = el.src;
    const idx = proj.images.indexOf(src);
    el.addEventListener('click', () => openLightbox(idx >= 0 ? idx : 0));
  });

  overlay.classList.add('open');
  overlayClose.classList.add('visible');
  document.body.style.overflow = 'hidden';
  overlay.scrollTop = 0;
}

// ========== MOBILE PROJECT LIST ==========
const mobileProjList = document.getElementById('mobileProjList');
const mobileProjScroll = document.getElementById('mobileProjScroll');
const mobileProjClose = document.getElementById('mobileProjClose');

function openMobileProjectList() {
  mobileProjScroll.innerHTML = '';

  // "All" option
  const allItem = document.createElement('div');
  allItem.className = 'mobile-proj-item' + (activeFilters.project === null ? ' active' : '');
  allItem.innerHTML = '<div class="mobile-proj-item-inner"><div class="mobile-proj-name">All Projects</div></div>';
  allItem.addEventListener('click', () => {
    setFilter('project', null);
    activeFilters.project = null;
    applyFilters();
    closeMobileList();
  });
  mobileProjScroll.appendChild(allItem);

  const projIds = Object.keys(projects);
  projIds.forEach(id => {
    const proj = projects[id];
    const item = document.createElement('div');
    item.className = 'mobile-proj-item';
    if (activeFilters.project === id) item.classList.add('active');

    const inner = document.createElement('div');
    inner.className = 'mobile-proj-item-inner';

    const name = document.createElement('div');
    name.className = 'mobile-proj-name';
    name.textContent = proj.name;
    inner.appendChild(name);

    if (proj.year) {
      const year = document.createElement('div');
      year.className = 'mobile-proj-year';
      year.textContent = proj.year;
      inner.appendChild(year);
    }

    item.appendChild(inner);
    item.addEventListener('click', () => {
      setFilter('project', id);
      closeMobileList();
    });

    mobileProjScroll.appendChild(item);
  });

  // Add spacers top/bottom so first/last can center
  const topSpacer = document.createElement('div');
  topSpacer.className = 'mobile-proj-spacer';
  mobileProjScroll.prepend(topSpacer);
  const bottomSpacer = document.createElement('div');
  bottomSpacer.className = 'mobile-proj-spacer';
  mobileProjScroll.appendChild(bottomSpacer);

  mobileProjList.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Track center item on scroll
  let scrollTick = false;
  mobileProjScroll.addEventListener('scroll', () => {
    if (!scrollTick) {
      requestAnimationFrame(() => {
        updateCenterItem();
        scrollTick = false;
      });
      scrollTick = true;
    }
  });

  // Scroll to active item
  requestAnimationFrame(() => {
    const active = mobileProjScroll.querySelector('.active');
    if (active) active.scrollIntoView({ block: 'center', behavior: 'instant' });
    updateCenterItem();
  });
}

function updateCenterItem() {
  const items = mobileProjScroll.querySelectorAll('.mobile-proj-item');
  const center = window.innerHeight / 2;
  let closest = null;
  let closestDist = Infinity;

  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    const itemCenter = rect.top + rect.height / 2;
    const dist = Math.abs(itemCenter - center);
    item.classList.remove('center');
    if (dist < closestDist) {
      closestDist = dist;
      closest = item;
    }
  });

  if (closest) closest.classList.add('center');
}

function closeMobileList() {
  mobileProjList.classList.remove('open');
  document.body.style.overflow = '';
}

mobileProjClose.addEventListener('click', closeMobileList);

function closeOverlay() {
  overlay.classList.remove('open');
  overlayClose.classList.remove('visible');
  document.body.style.overflow = '';
}

overlayClose.addEventListener('click', closeOverlay);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeOverlay();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (lightbox.classList.contains('open')) closeLightbox();
    else if (mobileProjList.classList.contains('open')) closeMobileList();
    else if (overlay.classList.contains('open')) closeOverlay();
  }
});

// ========== LIGHTBOX ==========
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxCounter = document.getElementById('lightboxCounter');
let lightboxItems = [];
let lightboxIndex = 0;

function openLightbox(index) {
  lightboxIndex = index;
  renderLightbox();
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxContent.innerHTML = '';
}

function renderLightbox() {
  const src = lightboxItems[lightboxIndex];
  const isVid = src.endsWith('.webm') || src.endsWith('.mp4');
  if (isVid) {
    lightboxContent.innerHTML = `<video src="${src}" autoplay muted loop playsinline></video>`;
  } else {
    lightboxContent.innerHTML = `<img src="${src}" />`;
  }
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.getElementById('lightboxPrev').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
  renderLightbox();
});

document.getElementById('lightboxNext').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
  renderLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') { lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; renderLightbox(); }
  if (e.key === 'ArrowLeft') { lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; renderLightbox(); }
});

// ========== GRID SIZE SLIDER ==========
window.scrollTo(0, 0);
const _mobile = window.innerWidth < 768;
const gridSlider = document.getElementById('gridSlider');
gridSlider.value = _mobile ? 3 : 5;
const sliderDotsEl = document.getElementById('sliderDots');
const sliderMin = parseInt(gridSlider.min);
const sliderMax = parseInt(gridSlider.max);
const sliderSteps = sliderMax - sliderMin + 1;

// Create dots
for (let i = 0; i < sliderSteps; i++) {
  const dot = document.createElement('div');
  dot.className = 'slider-dot';
  sliderDotsEl.appendChild(dot);
}

function updateSlider() {
  const val = parseInt(gridSlider.value);
  gridEl.style.gridTemplateColumns = `repeat(${val}, 1fr)`;

  // Fill dots and track
  const pct = ((val - sliderMin) / (sliderMax - sliderMin)) * 100;
  gridSlider.style.background = `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.2) ${pct}%)`;

  const dots = sliderDotsEl.querySelectorAll('.slider-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i <= val - sliderMin);
  });
}

gridSlider.addEventListener('input', updateSlider);
updateSlider();
