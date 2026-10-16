// ========== LAB APPS ==========
// Apps, small tools and web experiments. The Lab page lists them as a shelf
// of cards (lab.js) and each has a page of its own, apps/<id>.html, drawn
// from this same list by app-page.js. Look: apps.css.
//
// To add one: add an object here and copy apps/webtree.html to
// apps/<id>.html, changing the id, title and description in it.
//   id        file name of its page, and its handle everywhere
//   title, subtitle, category
//   stage     how finished it is, shown as a small tag by its name: 'Alpha',
//             'Beta', 'Experimental' (optional)
//   repo      GitHub link            url   where it runs (optional)
//   download  file the Download button fetches (optional; without it the
//             button gets the repo's current code as a zip)
//   icon      image URL (optional; without one the tile shows the initial)
//   stats     the strip under the header: [label, value] pairs
//   cover     wide picture for its post in the Lab feed
//   shots     screenshots: [image, caption] pairs (optional)
//   clips     short silent loops: [name, line, clip.webm] (optional); the poster is <clip>_thumb.webp
//   phone     screenshots taken on a phone, shown tall: [image, caption]
//             pairs (optional)
//   gallery   small square pictures: [image, caption] pairs, titled by
//             galleryTitle (optional)
//   spotlights  "a closer look": big cards, each [name, a line about it,
//             picture, icon name] (optional)
//   about     paragraphs
//   highlights  the headline cards: [big figure, a line about it] (optional)
//   steps     how it works, in order: [name, a line about it] (optional)
//   features  [name, a line about it] pairs, or for a long list
//   allFeatures    [{ title, items: ['Short name', …] }, …]  (every feature by name; the accordion on the features page; app sites only)
//   featureGroups  [{ title, note, items: [[name, line], …], more: [[name, line], …] }, …]
//                  (more: a plain list under the main ones, no icons; app sites only)
//   start     { text, commands: [[label, command], …] } (optional)
//   changelog { link, versions: [{ version, date, latest, summary,
//             items: [[tag, text], …] }, …] }, newest first (optional)
//   info      the table at the bottom: [label, value] pairs
window.labApps = [
  {
    id: 'webtree',
    title: 'Windy Tree',
    subtitle: 'A real-time procedural tree generator.',
    category: '3D tool',
    stage: 'Alpha',
    repo: 'https://github.com/xpayn3/webtree',
    url: 'https://xpayn3.github.io/webtree/',
    icon: 'https://xpayn3.github.io/webtree/icons/icon.svg',
    cover: 'Images/apps/windytree-editor.webp',
    shots: [
      ['Images/apps/windytree-editor.webp', 'The editor: a cherry tree with its trunk, shape and branching controls'],
      ['Images/apps/windytree-oak.webp', 'The oak preset'],
      ['Images/apps/windytree-japanese-maple-leaves.webp', 'Leaf count, size, season and material, on a red Japanese maple'],
      ['Images/apps/windytree-pine-conifer.webp', 'Conifers get their own crown and needle controls'],
      ['Images/apps/windytree-bark-closeup.webp', 'Procedural bark, from presets down to fissure depth'],
      ['Images/apps/windytree-leaf-closeup.webp', 'Close in on branches and individual leaves'],
      ['Images/apps/windytree-wind.webp', 'Wind: strength, gusts, direction and turbulence'],
      ['Images/apps/windytree-lighting-presets.webp', 'Eight lighting presets, here on moonlight'],
      ['Images/apps/windytree-light-theme-scale.webp', 'A light studio backdrop, with a 1.8 m figure for scale'],
      ['Images/apps/windytree-wireframe.webp', 'Wireframe view shows the generated mesh'],
      ['Images/apps/windytree-spline-view.webp', 'Spline view shows the branch skeleton'],
      ['Images/apps/windytree-command-palette.webp', 'Find any slider or command from the palette'],
      ['Images/apps/windytree-context-menu.webp', 'Right-click the canvas for quick actions'],
      ['Images/apps/windytree-export-mesh.webp', 'Export the tree as OBJ, STL, GLB or glTF'],
    ],
    galleryTitle: 'Species presets',
    stats: [['Category', '3D tool'], ['Platform', 'Web'], ['Presets', '35'], ['Engine', 'WebGPU']],
    gallery: ['oak', 'willow', 'palm', 'baobab', 'japanesemaple', 'birch', 'pine', 'cherry', 'olive', 'redwood', 'ginkgo', 'cypress']
      .map(name => [`https://xpayn3.github.io/webtree/presets/${name}.png`, name === 'japanesemaple' ? 'Japanese maple' : name]),
    about: [
      "An experiment in growing trees from numbers.",
      "Nothing in it is modelled by hand. Trunk, bark, branching, leaves, moss and vines all come from parameters, and a tree is shaped by changing them: pick a species, sculpt the branches, set the wind and the light. Every parameter can be found from a single search box.",
      "It is built on WebGPU and Three.js and runs in the browser. A finished tree can be exported.",
    ],
    highlights: [
      ['35', 'Species presets, in three families: broadleaf, conifer and bush.'],
      ['180+', 'Parameters, from trunk lean to leaf wax sheen, all searchable.'],
      ['4', 'Levels of detail per tree, exported together as one bundle.'],
      ['0', 'Things to install. Open the link in a WebGPU browser.'],
    ],
    spotlights: [
      ['Pick a species', 'Start from one of 35 presets, grouped into broadleaf, conifer and bush, or reopen a recent tree.', 'Images/apps/windytree-species.webp', 'leaf'],
      ['Sculpt mode', 'Reshape branches by hand with a right-drag. Wind and physics pause while you sculpt, and you can discard to undo everything in one go.', 'Images/apps/windytree-sculpt.webp', 'pointer'],
      ['LOD editor', 'Build lower-detail versions of the tree, see the triangle count of each, and export the chain as one .glb bundle.', 'Images/apps/windytree-lod.webp', 'layers'],
      ['Scene settings', 'Camera, environment and physics, renderer, shadows and post effects, plus your saved presets and mesh export.', 'Images/apps/windytree-scene.webp', 'sun'],
    ],
    steps: [
      ['Pick a species', 'Choose a preset to start from, or begin with a blank custom tree.'],
      ['Shape it', 'Tune the sliders for trunk, branching, foliage and bark, or switch to Sculpt and move branches by hand.'],
      ['Export', 'Save a mesh, a level-of-detail bundle, a screenshot, or the preset itself.'],
    ],
    featureGroups: [
      { title: 'The tree', items: [
        ['Trunk', 'Height, lean, twist, taper, root flare, buttresses and knots.', 'tree'],
        ['Branching levels', 'Each level has its own count, angles, forks, gravity and curve; add, copy or remove levels.', 'tree'],
        ['Bark', 'Procedural fissures, bands, patches and grain, with moss on top.', 'mesh'],
        ['Leaves and needles', 'Arrangement, size, droop and season, with a leaf material that has transmission and wax sheen.', 'leaf'],
        ['Fruits, flowers and vines', 'Optional extras, plus dead-wood stubs and canopy dieback to age a tree.', 'spark'],
        ['Crown and pruning', 'Crown silhouette, clean bole, pruning and gravity sag.', 'slice'],
      ] },
      { title: 'Shaping and motion', items: [
        ['Sculpt mode', 'Right-drag branches to reshape them by hand, with undo.', 'pointer'],
        ['Wind', 'Stiffness, damping, mass and wind response decide how each branch moves.', 'wind'],
        ['Regenerate', 'A variation seed and one key (R) give a new tree from the same settings.', 'refresh'],
        ['Your own leaves', 'Upload a leaf texture and use it on the tree.', 'upload'],
      ] },
      { title: 'Viewing', items: [
        ['Light and sky', 'Sun direction, an HDR sky, and light and dark themes.', 'sun'],
        ['Wireframe and spline views', 'See the mesh, or the tree as its underlying curves.', 'mesh'],
        ['Scale reference', 'A 1.8 m human figure to judge size against.', 'eye'],
        ['Command search', 'Fuzzy-search every parameter, species and action.', 'command'],
      ] },
      { title: 'Export', items: [
        ['Mesh export', 'OBJ, or GLB / glTF for the full mesh and scene.', 'download'],
        ['LOD bundle', 'A chain of lower-detail versions in one .glb.', 'layers'],
        ['Presets', 'Save your own with thumbnails, or copy a preset as JSON.', 'bookmark'],
        ['PNG screenshot', 'Save the current view as a picture.', 'aperture'],
        ['Installable', 'Ships a web app manifest, so it can be added to a device like an app.', 'phone'],
      ] },
    ],
    start: {
      text: 'Open the link in Chrome, Edge or Safari 18+, pick a species and start shaping. The controls:',
      commands: [
        ['Orbit', 'Drag'],
        ['Zoom', 'Scroll'],
        ['Bend a branch', 'Right-drag'],
        ['Regenerate', 'R'],
        ['Wireframe', 'W'],
        ['Leaves on / off', 'L'],
        ['Light / dark', 'T'],
        ['All controls', '?'],
      ],
    },
    info: [
      ['Platform', 'Chrome, Edge or Safari 18+ (needs WebGPU)'],
      ['Built with', 'WebGPU, Three.js'],
      ['Exports', 'OBJ, GLB / glTF, PNG, preset JSON'],
      ['First published', 'April 2026'],
      ['Source', 'github.com/xpayn3/webtree'],
    ],
  },
  {
    id: 'cycleiq',
    title: 'CycleIQ',
    subtitle: 'A cycling training dashboard, powered by intervals.icu.',
    category: 'Fitness',
    stage: 'Experimental',
    repo: 'https://github.com/xpayn3/cyclingHUB',
    url: 'https://xpayn3.github.io/cyclingHUB/',
    icon: 'https://xpayn3.github.io/cyclingHUB/icon-192.png',
    cover: 'Images/apps/cycleiq-workouts.webp',
    shots: [
      ['Images/apps/cycleiq-workouts.webp', 'Workout Builder: recommended, indoor and outdoor sessions'],
      ['Images/apps/cycleiq-routes.webp', 'Route Builder: plan a ride on a 3D terrain map'],
      ['Images/apps/cycleiq-workout-editor.webp', 'The workout editor: an interval session with its power profile'],
      ['Images/apps/cycleiq-workout-editor-light.webp', 'The same editor in the light theme'],
      ['Images/apps/cycleiq-weather-forecast.webp', 'Weather: saved locations, the hourly forecast and the temperature curve'],
      ['Images/apps/cycleiq-weather-ride-score.webp', '7-day forecast with a ride score for today, in the Tour de France theme'],
      ['Images/apps/cycleiq-weather-day-detail.webp', 'A forecast day opened: hourly wind, rain and the best window to ride'],
      ['Images/apps/cycleiq-tire-pressure.webp', 'The tire pressure calculator in My Garage'],
      ['Images/apps/cycleiq-themes.webp', 'Settings: app theme and map style'],
      ['Images/apps/cycleiq-accent-color.webp', 'Accent colour: twelve presets or any custom colour'],
    ],
    phone: [
      ['Images/apps/cycleiq-weather-phone.webp', 'Weather'],
      ['Images/apps/cycleiq-workout-editor-phone.webp', 'Workout editor'],
      ['Images/apps/cycleiq-badge-card-phone.webp', 'An achievement badge as a 3D card'],
      ['Images/apps/cycleiq-tire-pressure-phone.webp', 'Tire pressure calculator'],
    ],
    stats: [['Category', 'Fitness'], ['Platform', 'Web · installable'], ['Pages', '22'], ['Badges', '28']],
    about: [
      "A training dashboard for cycling, built on intervals.icu.",
      "It reads rides from intervals.icu (and Strava) and lays them out in one place: training load, power analysis, goals and streaks, weather, a garage for the bikes, and builders for workouts and routes.",
      "Everything runs in the browser, and the account details never leave it.",
    ],
    highlights: [
      ['22', 'Pages, from the dashboard to a lifetime heatmap of everywhere you have ridden.'],
      ['28', 'Achievement badges, each a holographic 3D card you can spin.'],
      ['Offline', 'Works without a connection after the first load, map tiles included.'],
      ['4', 'Themes: dark, light, editorial and custom.'],
    ],
    spotlights: [
      ['Workout Builder', 'Design intervals visually from warm-up, steady, interval, ramp and cool-down blocks, then export a Zwift .zwo file.', 'Images/apps/cycleiq-workouts.webp', 'pulse'],
      ['Route Builder', 'Click to add waypoints on a 3D terrain map, get auto-routing on the road network and an elevation profile, and export GPX or FIT.', 'Images/apps/cycleiq-routes.webp', 'globe'],
      ['Connect and sync', 'Link an intervals.icu account, use a setup link, or restore from a JSON backup. Only new activities are fetched after the first sync.', 'Images/apps/cycleiq-connect.webp', 'refresh'],
    ],
    featureGroups: [
      { title: 'Training', items: [
        ['Dashboard', 'Weekly stats, a fitness snapshot and recent rides in widgets you can reorder and hide.', 'grid'],
        ['Fitness and training load', 'CTL, ATL and TSB over any date range, FTP history, wellness insights and race prediction.', 'pulse'],
        ['Power analysis', 'Power curve, time in zones, a power profile radar and W′ balance.', 'spark'],
        ['Activity detail', 'A 3D terrain map with power, heart rate, cadence, speed and elevation charts, intervals and climbs detected.', 'globe'],
        ['Goals and streaks', 'Week, day and month streaks, a 52-week calendar heatmap, and targets with progress rings.', 'bookmark'],
        ['Compare', 'One period against another, side by side, with the change in each metric.', 'layers'],
      ] },
      { title: 'Planning', items: [
        ['Workout Builder', 'A visual interval designer with power and heart rate targets, exported as Zwift .zwo.', 'pulse'],
        ['Route Builder', 'Waypoints, auto-routing, gradient bands and GPX / FIT export.', 'globe'],
        ['Calendar', 'Month and week views with planned rides and training plans.', 'grid'],
        ['Weather', 'A 7-day forecast with ride-quality badges, an hourly breakdown and a wind rose.', 'sun'],
        ['What-if tools', 'A tapering wizard, a CTL simulator, race pacing and a fuelling plan.', 'spark'],
      ] },
      { title: 'Gear', items: [
        ['My Garage', 'Your bikes with photos, components, service history and wear.', 'cube'],
        ['Battery monitoring', 'Garmin, SRAM AXS and coin-cell batteries, with estimated drain.', 'pulse'],
        ['Tire pressure calculator', 'SRAM / Zipp, Silca and Berto models.', 'drop'],
      ] },
      { title: 'Under the hood', items: [
        ['Offline and installable', 'A service worker caches the app and up to 3,000 map tiles.', 'phone'],
        ['3D badge cards', 'Procedural cards with holographic materials, a moving spotlight and drag momentum.', 'cube'],
        ['Device sync', 'Peer-to-peer between your devices, paired with a QR code.', 'refresh'],
        ['Backup', 'Export and import everything as one JSON file.', 'download'],
        ['Design system', '150+ design tokens and four themes.', 'code'],
      ] },
    ],
    start: {
      text: 'CycleIQ needs an intervals.icu account for its data. Three steps to connect:',
      commands: [
        ['1', 'In intervals.icu, open Settings → API'],
        ['2', 'Copy your Athlete ID'],
        ['3', 'Show the API key, copy it, and paste both into CycleIQ'],
      ],
    },
    info: [
      ['Data', 'intervals.icu, Strava'],
      ['Also uses', 'Open-Meteo (weather and air quality), Nominatim (place names), MapLibre (maps)'],
      ['Platform', 'Any modern browser; installable as an app'],
      ['Privacy', 'Credentials are stored locally in your browser only'],
      ['First published', 'February 2026'],
      ['Source', 'github.com/xpayn3/cyclingHUB'],
    ],
  },
];

// The app's icon tile: its picture, or its initial when it has none.
window.labAppIcon = function (app) {
  const tile = document.createElement('span');
  tile.className = 'app-icon';
  if (app.icon) {
    const img = document.createElement('img');
    Object.assign(img, { src: app.icon, alt: '', decoding: 'async' });
    tile.appendChild(img);
  } else {
    tile.classList.add('is-letter');
    tile.textContent = app.title.charAt(0);
  }
  return tile;
};
