// ========== IMAGE & PROJECT DATA ==========
const IMG = 'Images';

const projects = {
  cestel: {
    color: 'blue',
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
    color: 'orange',
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
      `${IMG}/Grounded_2022/GR_main_1.webm`,
      `${IMG}/Grounded_2022/GR_main_vertical.webm`,
      `${IMG}/Grounded_2022/Projection_CD.webm`,
      `${IMG}/Grounded_2022/najava_landscape.webm`,
      `${IMG}/Grounded_2022/najava_square.webm`,
      `${IMG}/Grounded_2022/najava_vertical.webm`,
      `${IMG}/Grounded_2022/card_holo.webm`,
    ],
    layout: [
      { cols: 1, imgs: [8] },
      { cols: 2, imgs: [0, 1] },
      { cols: 3, imgs: [2, 3, 4] },
      { cols: 2, imgs: [5, 6] },
      { cols: 1, imgs: [10] },
      { cols: 2, imgs: [7, 9] },
      { cols: 2, imgs: [11, 12] },
      { cols: 1, imgs: [13] },
      { cols: 1, imgs: [14] },
    ]
  },
  grounded2021: {
    color: 'purple',
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
      `${IMG}/Grounded_2021/Grounded_2021_IG.webm`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 3, imgs: [3, 4, 5] },
      { cols: 2, imgs: [6, 7] },
      { cols: 1, imgs: [8] },
      { cols: 1, imgs: [9] },
    ]
  },
  taf: {
    color: 'red',
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
    color: 'cyan',
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
    color: 'pink',
    name: 'Festival Grounded 2018',
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
    color: 'green',
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
    color: 'yellow',
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
    color: 'black',
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
    color: 'black',
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
    color: 'gray',
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
    color: 'white',
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
    color: 'green',
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
    color: 'red',
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
    color: 'blue',
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
    color: 'gray',
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
  kersnikova: {
    color: 'purple',
    name: 'Kersnikova',
    year: 2021,
    desc: ['Visual identity and print design for Kersnikova.'],
    tools: ['Photoshop', 'Illustrator', 'InDesign'],
    images: [
      `${IMG}/Kersnikova/Plakat-500x700-B2.webp`,
      `${IMG}/Kersnikova/slika nova.webp`,
      `${IMG}/Kersnikova/zlozenka2.webp`,
      `${IMG}/Kersnikova/zvocnik_finished.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 1, imgs: [3] },
    ]
  },
  natureta_renders: {
    color: 'green',
    name: 'Natureta Product Renders',
    year: 2023,
    desc: ['3D product renders and visualization for Natureta.'],
    tools: ['Cinema 4D', 'Redshift', 'Photoshop'],
    images: [
      `${IMG}/Natureta product renders/izdelki.webp`,
      `${IMG}/Natureta product renders/Mockup_2.webp`,
      `${IMG}/Natureta product renders/float_2.webp`,
      `${IMG}/Natureta product renders/kumarica.webp`,
      `${IMG}/Natureta product renders/vsi_2.webp`,
      `${IMG}/Natureta product renders/ETA_animacija_FINAL_2_2.webp`,
      `${IMG}/Natureta product renders/Kozarec_eta0001.webp`,
      `${IMG}/Natureta product renders/Kozarec_eta0013.webp`,
      `${IMG}/Natureta product renders/Kozarec_eta0015.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
      { cols: 2, imgs: [3, 4] },
      { cols: 1, imgs: [5] },
      { cols: 3, imgs: [6, 7, 8] },
    ]
  },
  natureta: {
    color: 'green',
    name: 'Natureta 100 Let',
    year: 2023,
    desc: ['Product photography and visual design for Natureta.'],
    tools: ['Photoshop', 'Cinema 4D'],
    images: [
      `${IMG}/Natureta/Prebranec-Natureta-657f495f8b596.webp`,
      `${IMG}/Natureta/Prebranec-1-65708119051a5.webp`,
      `${IMG}/Natureta/Prebranec-2-657081193738f.webp`,
    ],
    layout: [
      { cols: 1, imgs: [0] },
      { cols: 2, imgs: [1, 2] },
    ]
  },
};

const COLOR_HEX = {
  red: '#e74c3c', orange: '#e67e22', yellow: '#f1c40f', green: '#2ecc71',
  cyan: '#00bcd4', blue: '#3498db', purple: '#9b59b6', pink: '#e91e8a',
  black: '#222222', white: '#e0e0e0', gray: '#888888',
};

// Build flat list of grid items: one per image, tagged with project/year
// Color gets filled in async after image loads
const gridItems = [];
const gridExclude = /screenshot|zbrush|Mockup|larga_vida_screenshot/i;
for (const [projId, proj] of Object.entries(projects)) {
  for (const src of proj.images) {
    if (gridExclude.test(src)) continue;
    gridItems.push({
      src,
      project: projId,
      projectName: proj.name,
      year: proj.year,
      color: proj.color || 'gray',
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
    });

    // Video hover — desktop only, with preload-on-hover
    if (isVideo && !isMobile) {
      let vid = null;
      let hoverTimer = null;
      // Preload video element on hover with slight delay to avoid drive-by loads
      div.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          if (!vid) {
            vid = document.createElement('video');
            vid.src = item.src;
            vid.muted = true;
            vid.loop = true;
            vid.playsInline = true;
            vid.preload = 'metadata';
            vid.className = 'hover-video';
            div.appendChild(vid);
          }
          vid.play().catch(() => {});
          vid.style.opacity = '1';
        }, 150);
      });
      div.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        if (vid) {
          vid.pause();
          vid.currentTime = 0;
          vid.style.opacity = '0';
        }
      });
    }

    // Preload project images on hover (YouTube trick — fetch before click)
    if (!isMobile) {
      let preloaded = false;
      div.addEventListener('mouseenter', () => {
        if (preloaded) return;
        preloaded = true;
        const proj = projects[item.project];
        if (!proj) return;
        // Preload first 3 images of the project in background
        proj.images.slice(0, 3).forEach(src => {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = src;
          document.head.appendChild(link);
        });
      }, { once: true, passive: true });
    }

    const label = document.createElement('span');
    label.className = 'item-label' + (item.project === 'lab' ? ' lab-label' : '');
    if (item.project === 'lab') {
      label.innerHTML = 'L<span style="font-weight:300">a</span>B';
    } else {
      label.textContent = item.projectName;
    }
    div.appendChild(label);

    // Meta info for list view
    const ext = item.src.split('.').pop().toUpperCase();
    const meta = document.createElement('div');
    meta.className = 'item-meta';
    meta.innerHTML = `<span>${ext}</span><span>${item.projectName}</span>`;
    div.appendChild(meta);

    div.addEventListener('click', () => {
      if (gridEl.classList.contains('list-view')) {
        lightboxItems = [item.src];
        openLightbox(0);
      } else if (item.project === 'lab') {
        const labImages = projects.lab.images;
        lightboxItems = labImages;
        const idx = labImages.indexOf(item.src);
        openLightbox(idx >= 0 ? idx : 0);
      } else {
        openProject(item.project);
      }
    });

    frag.appendChild(div);
  }
  gridEl.innerHTML = '';
  gridEl.appendChild(frag);
}

const isMobile = window.innerWidth < 768;
const isSlowConnection = navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType === '2g' || navigator.connection.effectiveType === 'slow-2g');

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
}, { rootMargin: isSlowConnection ? '100px' : (isMobile ? '400px' : '200px') });

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


}

// Build color dropdown statically from project data
function buildColorDropdown() {
  const colorMenu = document.getElementById('menu-color');
  colorMenu.classList.add('color-grid');
  const colors = [...new Set(Object.values(projects).map(p => p.color).filter(Boolean))].sort();
  for (const name of colors) {
    const hex = COLOR_HEX[name] || '#888';
    const btn = document.createElement('button');
    btn.className = 'color-swatch-btn';
    btn.dataset.value = name;
    btn.style.background = hex;
    btn.title = name;
    btn.addEventListener('click', () => setFilter('color', name));
    colorMenu.appendChild(btn);
  }
}

buildDropdowns();
buildColorDropdown();

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
  setTimeout(() => window.scrollTo(0, 0), 50);
}

function applyFilters() {
  const items = gridEl.querySelectorAll('.grid-item');
  const toShow = [];
  const toHide = [];

  items.forEach(item => {
    let show = true;
    if (activeFilters.project && item.dataset.project !== activeFilters.project) show = false;
    if (activeFilters.year && item.dataset.year !== String(activeFilters.year)) show = false;
    if (activeFilters.color && item.dataset.color !== activeFilters.color) show = false;
    if (activeFilters.type && item.dataset.type !== activeFilters.type) show = false;

    const isHidden = item.classList.contains('hidden');
    if (show && isHidden) toShow.push(item);
    else if (!show && !isHidden) toHide.push(item);
  });

  // Hide items instantly
  toHide.forEach(item => {
    item.classList.add('hidden');
    item.classList.remove('hiding', 'showing');
  });

  // Show items with staggered bounce
  toShow.forEach((item, i) => {
    item.classList.remove('hidden');
    item.classList.add('showing');
    item.style.animationDelay = Math.min(i * 20, 300) + 'ms';
    item.addEventListener('animationend', () => {
      item.classList.remove('showing');
      item.style.animationDelay = '';
    }, { once: true });
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

  // Update project button text + thumbnail
  const projToggleText = document.getElementById('projToggleText');
  const projToggleThumb = document.getElementById('projToggleThumb');
  if (activeFilters.project) {
    const proj = projects[activeFilters.project];
    const name = proj.name;
    const maxLen = isMobile ? 10 : 18;
    projToggleText.textContent = name.length > maxLen ? name.slice(0, maxLen) + '...' : name;
    const firstSrc = proj.images[0];
    const isVid = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4');
    projToggleThumb.src = isVid ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;
    projToggleThumb.classList.add('visible');
  } else {
    projToggleText.textContent = 'Project';
    projToggleThumb.classList.remove('visible');
  }

  // Update type button text
  const typeToggle = document.getElementById('typeToggle');
  if (activeFilters.type) {
    typeToggle.textContent = activeFilters.type === 'image' ? 'Images' : 'Videos';
  } else {
    typeToggle.textContent = 'Type';
  }

  // Show/hide "All" reset button
  const hasAnyFilter = Object.values(activeFilters).some(v => v !== null);
  document.getElementById('resetFilters').style.display = hasAnyFilter ? 'flex' : 'none';

  // Update color indicator
  const indicator = document.getElementById('colorIndicator');
  if (activeFilters.color) {
    indicator.style.background = COLOR_HEX[activeFilters.color] || '#888';
    indicator.classList.add('visible');
    indicator.style.animation = 'colorPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both';
  } else if (indicator.classList.contains('visible')) {
    indicator.style.animation = 'colorPop 0.3s cubic-bezier(0.32,0.72,0,1) reverse forwards';
    setTimeout(() => {
      indicator.classList.remove('visible');
      indicator.style.animation = '';
    }, 300);
  }
}

// Clear color via indicator click
document.getElementById('colorIndicator').addEventListener('click', (e) => {
  e.stopPropagation();
  activeFilters.color = null;
  applyFilters();
});

// Reset
document.getElementById('resetFilters').addEventListener('click', (e) => {
  const btn = e.currentTarget;
  btn.style.animation = 'barItemOut 0.3s cubic-bezier(0.32,0.72,0,1) forwards';
  setTimeout(() => {
    activeFilters = { project: null, year: null, color: null, type: null };
    applyFilters();
    closeAllDropdowns();
    btn.style.animation = '';
  }, 250);
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
    if (!dropdown.classList.contains('open') || isMobile) return;
    const rect = dropdown.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const tiltX = y * -4;
    const tiltY = x * 4;
    dropdown.style.transform = `translateX(-50%) scale(1) translateY(0) perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  dropdown.addEventListener('mouseleave', () => {
    if (!dropdown.classList.contains('open') || isMobile) return;
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
    return `<video data-src="${src}" muted loop playsinline preload="none"></video>`;
  }
  return `<img src="${src}" alt="${alt || ''}" loading="lazy" decoding="async" />`;
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
    html += '<div class="lab-splash" id="labSplash">L<span>a</span>B</div>';
    overlayInner.innerHTML = html;
    setTimeout(() => {
      const splash = document.getElementById('labSplash');
      if (splash) splash.classList.add('fade-out');
    }, 2500);
  } else {
    // Hero section — dark with main image only
    const heroSrc = proj.images[0];
    let html = `<div class="proj-hero-dark">`;
    html += `<div class="proj-hero-media">${mediaTag(heroSrc, proj.name)}</div>`;
    html += '</div>';

    // White sheet — title, meta, description, then images
    html += '<div class="proj-white-sheet">';

    html += `<h1 class="proj-title-white">${proj.name}</h1>`;
    html += '<div class="proj-meta-white">';
    if (proj.client) html += `<span>${proj.client}</span>`;
    if (proj.year) html += `<span>${proj.year}</span>`;
    if (proj.collab) html += `<span>${proj.collab}</span>`;
    if (proj.location) html += `<span>${proj.location}</span>`;
    if (proj.theme) html += `<span>${proj.theme}</span>`;
    if (proj.type) html += `<span>${proj.type}</span>`;
    if (proj.award) html += `<span>${proj.award}</span>`;
    html += '</div>';

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

    // Dynamic 2-column grid layout with white space
    const remaining = proj.images.slice(1);
    html += '<div class="proj-media-grid">';
    // Pattern: left, right, left, full, right, left, right, full...
    const pattern = ['left', 'right', 'left', 'full', 'right', 'left', 'right', 'full'];
    for (let i = 0; i < remaining.length; i++) {
      const pos = pattern[i % pattern.length];
      html += `<div class="media-cell ${pos}">${mediaTag(remaining[i], proj.name)}</div>`;
    }
    html += '</div>';

    html += '</div>';
    overlayInner.innerHTML = html;
  }

  // Lazy-load overlay videos when they scroll into view (YouTube trick)
  const overlayVideoObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const vid = entry.target;
      if (entry.isIntersecting) {
        if (!vid.src && vid.dataset.src) {
          vid.src = vid.dataset.src;
        }
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, { root: overlay, rootMargin: '200px' });

  overlayInner.querySelectorAll('video[data-src]').forEach(vid => overlayVideoObs.observe(vid));

  // Wire up lightbox on all clickable media
  lightboxItems = proj.images;
  const allMedia = overlayInner.querySelectorAll('.media-cell img, .media-cell video, .proj-row-full img, .proj-row-full video, .proj-gallery img, .proj-gallery video');
  allMedia.forEach((el) => {
    const src = el.src || el.dataset.src;
    const idx = proj.images.indexOf(src);
    el.addEventListener('click', () => openLightbox(idx >= 0 ? idx : 0));
  });

  // Build project nav bar
  buildProjNav(projId);
  document.getElementById('projNav').classList.add('visible');

  overlay.classList.add('open');
  overlayClose.classList.add('visible');
  document.body.style.overflow = 'hidden';
  overlay.scrollTop = 0;
}

function buildProjNav(activeProjId) {
  const nav = document.getElementById('projNav');
  nav.innerHTML = '';
  const projIds = Object.keys(projects);

  projIds.forEach(id => {
    const proj = projects[id];
    const btn = document.createElement('button');
    btn.className = 'proj-nav-item' + (id === activeProjId ? ' active' : '');

    const firstSrc = proj.images[0];
    const isVid = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4');
    const thumbSrc = isVid ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;

    const thumb = document.createElement('img');
    thumb.className = 'proj-nav-thumb';
    thumb.src = isMobile ? thumbSrc.replace('Images/', 'Images/mobile/') : thumbSrc;
    thumb.alt = proj.name;
    btn.appendChild(thumb);

    const label = document.createElement('span');
    label.textContent = proj.name;
    btn.appendChild(label);

    btn.addEventListener('click', () => {
      if (id === activeProjId) return;
      // Update nav immediately
      nav.querySelectorAll('.proj-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      btn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      // Fade content
      overlayInner.style.transition = 'opacity 0.2s ease';
      overlayInner.style.opacity = '0';
      setTimeout(() => {
        overlay.scrollTop = 0;
        openProject(id);
        overlayInner.style.opacity = '1';
      }, 200);
    });

    nav.appendChild(btn);
  });

  // Horizontal scroll with mouse wheel — amplified for responsiveness
  nav.addEventListener('wheel', (e) => {
    e.preventDefault();
    nav.scrollLeft += e.deltaY * 3;
  }, { passive: false });

  // Scroll active item into view smoothly
  requestAnimationFrame(() => {
    const active = nav.querySelector('.active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  });
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
    item.dataset.projId = id;
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

const mobileProjBg = document.getElementById('mobileProjBg');
let currentBgProjId = null;

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

  if (closest) {
    closest.classList.add('center');
    const projId = closest.dataset.projId;
    if (projId && projId !== currentBgProjId && projects[projId]) {
      currentBgProjId = projId;
      const proj = projects[projId];
      const firstSrc = proj.images[0];
      const isVid = firstSrc.endsWith('.webm') || firstSrc.endsWith('.mp4');
      const src = isVid ? firstSrc.replace(/\.(webm|mp4)$/, '_thumb.webp') : firstSrc;
      const mobileSrc = isMobile ? src.replace('Images/', 'Images/mobile/') : src;
      mobileProjBg.innerHTML = `<img src="${mobileSrc}" alt="" />`;
      mobileProjBg.classList.add('visible');
    } else if (!projId) {
      mobileProjBg.classList.remove('visible');
      currentBgProjId = null;
    }
  }
}

function closeMobileList() {
  mobileProjList.classList.remove('open');
  document.body.style.overflow = '';
}

mobileProjClose.addEventListener('click', closeMobileList);

function closeOverlay() {
  overlay.classList.remove('open');
  overlayClose.classList.remove('visible');
  document.getElementById('projNav').classList.remove('visible');
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
let lbFrameRAF = null;
let lbDirection = 'init';

function drawHistogram(source, canvas) {
  try {
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;

    // Sample source to small canvas
    const tmp = document.createElement('canvas');
    tmp.width = 100; tmp.height = 100;
    const tctx = tmp.getContext('2d', { willReadFrequently: true });
    tctx.drawImage(source, 0, 0, 100, 100);
    const data = tctx.getImageData(0, 0, 100, 100).data;

    // Build RGB histograms
    const rHist = new Uint32Array(256);
    const gHist = new Uint32Array(256);
    const bHist = new Uint32Array(256);

    for (let i = 0; i < data.length; i += 4) {
      rHist[data[i]]++;
      gHist[data[i + 1]]++;
      bHist[data[i + 2]]++;
    }

    // Find max for scaling
    let max = 1;
    for (let i = 0; i < 256; i++) {
      max = Math.max(max, rHist[i], gHist[i], bHist[i]);
    }

    // Draw
    ctx.clearRect(0, 0, w, h);
    const barW = w / 256;

    // Draw each channel
    function drawChannel(hist, color) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let i = 0; i < 256; i++) {
        const x = i * barW;
        const barH = (hist[i] / max) * h;
        ctx.lineTo(x, h - barH);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'screen';
    drawChannel(rHist, 'rgba(255,60,60,0.6)');
    drawChannel(gHist, 'rgba(60,255,60,0.6)');
    drawChannel(bHist, 'rgba(60,60,255,0.6)');
    ctx.globalCompositeOperation = 'source-over';
  } catch (e) {
    // canvas tainted — skip
  }
}

const lightboxStrip = document.getElementById('lightboxStrip');

function buildLightboxStrip() {
  lightboxStrip.innerHTML = '';
  lightboxItems.forEach((src, i) => {
    const isVid = src.endsWith('.webm') || src.endsWith('.mp4');
    const thumbSrc = isVid ? src.replace(/\.(webm|mp4)$/, '_thumb.webp') : src;
    const item = document.createElement('div');
    item.className = 'lightbox-strip-item' + (i === lightboxIndex ? ' active' : '') + (isVid ? ' is-film' : '');
    item.innerHTML = `<img src="${thumbSrc}" alt="" />`;
    item.addEventListener('click', () => {
      lbDirection = i > lightboxIndex ? 'right' : 'left';
      lightboxIndex = i;
      renderLightbox();
      updateStripActive();
    });
    lightboxStrip.appendChild(item);
  });
}

function updateStripActive() {
  const items = lightboxStrip.querySelectorAll('.lightbox-strip-item');
  items.forEach((item, i) => {
    item.classList.toggle('active', i === lightboxIndex);
  });
  const active = lightboxStrip.querySelector('.active');
  if (active) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
}

function openLightbox(index) {
  lightboxIndex = index;
  lbDirection = 'init';
  buildLightboxStrip();
  renderLightbox();
  lightbox.classList.add('open');
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxContent.innerHTML = '';
  if (lbFrameRAF) cancelAnimationFrame(lbFrameRAF);
}

function renderLightbox() {
  const src = lightboxItems[lightboxIndex];
  const isVid = src.endsWith('.webm') || src.endsWith('.mp4');
  lightboxContent.className = 'lightbox-content slide-' + lbDirection;
  if (isVid) {
    lightboxContent.innerHTML = `<video src="${src}" autoplay muted loop playsinline></video>`;
  } else {
    lightboxContent.innerHTML = `<img src="${src}" />`;
  }
  lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;

  // File info
  const info = document.getElementById('lightboxInfo');
  const filename = src.split('/').pop();
  const ext = filename.split('.').pop().toUpperCase();
  const folder = src.split('/').slice(-2, -1)[0] || '';
  const isVidFile = ext === 'WEBM' || ext === 'MP4';
  info.innerHTML = `${filename}<br>${ext} ${isVidFile ? '· VIDEO' : '· IMAGE'}<br>${folder}`;

  // Frame counter for videos
  if (lbFrameRAF) cancelAnimationFrame(lbFrameRAF);
  if (isVidFile) {
    const vid = lightboxContent.querySelector('video');
    if (vid) {
      const fps = 24;
      function updateFrameCount() {
        const current = Math.floor(vid.currentTime * fps);
        const total = Math.floor((vid.duration || 0) * fps);
        info.innerHTML = `${filename}<br>${ext} · VIDEO<br>${folder}<br>F ${current} / ${total}`;
        lbFrameRAF = requestAnimationFrame(updateFrameCount);
      }
      vid.addEventListener('loadeddata', updateFrameCount, { once: true });
      if (vid.readyState >= 2) updateFrameCount();
    }
  }

  // Draw histogram
  const histCanvas = document.getElementById('lightboxHistogram');
  if (!isVidFile) {
    const imgEl = lightboxContent.querySelector('img');
    if (imgEl) {
      const drawHist = () => drawHistogram(imgEl, histCanvas);
      if (imgEl.complete) drawHist();
      else imgEl.addEventListener('load', drawHist, { once: true });
    }
  } else {
    const vid = lightboxContent.querySelector('video');
    if (vid) {
      vid.addEventListener('loadeddata', () => drawHistogram(vid, histCanvas), { once: true });
    }
  }

  updateStripActive();
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.getElementById('lightboxPrev').addEventListener('click', () => {
  lbDirection = 'left';
  lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length;
  renderLightbox();
});

document.getElementById('lightboxNext').addEventListener('click', () => {
  lbDirection = 'right';
  lightboxIndex = (lightboxIndex + 1) % lightboxItems.length;
  renderLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowRight') { lbDirection = 'right'; lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; renderLightbox(); }
  if (e.key === 'ArrowLeft') { lbDirection = 'left'; lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; renderLightbox(); }
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
  gridSlider.style.background = `linear-gradient(to right, #fff ${pct}%, rgba(0,0,0,0.1) ${pct}%)`;

  const dots = sliderDotsEl.querySelectorAll('.slider-dot');
  dots.forEach((dot, i) => {
    dot.classList.toggle('filled', i <= val - sliderMin);
  });
}

gridSlider.addEventListener('input', updateSlider);
updateSlider();

// ========== MOBILE TOP SLIDER ==========
const mobileSlider = document.getElementById('mobileGridSlider');
const mobileDotsEl = document.getElementById('mobileSliderDots');
if (mobileSlider && mobileDotsEl) {
  const mMin = parseInt(mobileSlider.min);
  const mMax = parseInt(mobileSlider.max);
  for (let i = 0; i <= mMax - mMin; i++) {
    const dot = document.createElement('div');
    dot.className = 'slider-dot';
    mobileDotsEl.appendChild(dot);
  }
  mobileSlider.value = _mobile ? 3 : 5;

  function updateMobileSlider() {
    const val = parseInt(mobileSlider.value);
    gridEl.style.gridTemplateColumns = `repeat(${val}, 1fr)`;
    const pct = ((val - mMin) / (mMax - mMin)) * 100;
    mobileSlider.style.background = `linear-gradient(to right, #fff ${pct}%, rgba(0,0,0,0.1) ${pct}%)`;
    mobileDotsEl.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('filled', i <= val - mMin);
    });
  }

  mobileSlider.addEventListener('input', updateMobileSlider);
  if (_mobile) updateMobileSlider();
}

// ========== LIST VIEW TOGGLE ==========
const layoutGridBtn = document.getElementById('layoutGrid');
const layoutListBtn = document.getElementById('layoutList');

function switchLayout(toList) {
  gridEl.style.opacity = '0';
  gridEl.style.pointerEvents = 'none';
  gridEl.classList.add('switching');
  setTimeout(() => {
    gridEl.style.transition = 'none';
    if (toList) {
      gridEl.classList.add('list-view');
      gridEl.style.gridTemplateColumns = '';
      layoutListBtn.classList.add('active');
      layoutGridBtn.classList.remove('active');
    } else {
      gridEl.classList.remove('list-view');
      updateSlider();
      layoutGridBtn.classList.add('active');
      layoutListBtn.classList.remove('active');
    }
    gridEl.offsetHeight;
    gridEl.style.transition = 'opacity 0.25s ease';
    gridEl.style.opacity = '1';
    gridEl.style.pointerEvents = '';
    setTimeout(() => gridEl.classList.remove('switching'), 300);
  }, 250);
}

layoutGridBtn.addEventListener('click', () => {
  if (!gridEl.classList.contains('list-view')) return;
  switchLayout(false);
});

layoutListBtn.addEventListener('click', () => {
  if (gridEl.classList.contains('list-view')) return;
  switchLayout(true);
});

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

// ========== HIDE NAVBAR ON SCROLL DOWN (mobile only) ==========
let navLastScroll = 0;
const navBar = document.getElementById('bottomBar');
if (isMobile && navBar) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const pill = document.getElementById('mobileSliderPill');
    if (scrollY > navLastScroll && scrollY > 100) {
      navBar.classList.add('bar-hidden');
      if (pill) pill.classList.add('pill-hidden');
    } else {
      navBar.classList.remove('bar-hidden');
      if (pill) pill.classList.remove('pill-hidden');
    }
    navLastScroll = scrollY;
  }, { passive: true });
}

// ========== AUTO-OPEN FROM HASH ==========
const hashMatch = location.hash.match(/project=(\w+)/);
if (hashMatch) {
  setTimeout(() => openProject(hashMatch[1]), 100);
}
