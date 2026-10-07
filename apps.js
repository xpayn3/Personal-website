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
//   gallery   small square pictures: [image, caption] pairs, titled by
//             galleryTitle (optional)
//   spotlights  "a closer look": big cards, each [name, a line about it,
//             picture, icon name] (optional)
//   about     paragraphs
//   highlights  the headline cards: [big figure, a line about it] (optional)
//   steps     how it works, in order: [name, a line about it] (optional)
//   features  [name, a line about it] pairs, or for a long list
//   featureGroups  [{ title, note, items: [[name, line], …] }, …]
//   start     { text, commands: [[label, command], …] } (optional)
//   changelog { link, versions: [{ version, date, latest, summary,
//             items: [[tag, text], …] }, …] }, newest first (optional)
//   info      the table at the bottom: [label, value] pairs
window.labApps = [
  {
    id: 'meshoptimiser',
    title: 'MeshOptimiser',
    subtitle: 'From bloated CAD to browser-ready, locally.',
    category: 'CAD tool',
    stage: 'Beta',
    repo: 'https://github.com/xpayn3/MeshOptimiser',
    cover: 'Images/apps/meshoptimiser-viewer.webp',
    shots: [
      ['Images/apps/meshoptimiser-viewer.webp', 'The viewer: assembly tree, viewport, properties and actions'],
    ],
    spotlights: [
      ['Command palette', 'Every action in the app, searchable, with its shortcut beside it. Open it with Ctrl / ⌘ + K.', 'Images/apps/meshoptimiser-palette.webp', 'command'],
      ['Parametric shapes and fasteners', 'Add cubes, tori and capsules, or DIN bolts, nuts, screws and washers, each with editable dimensions.', 'Images/apps/meshoptimiser-add.webp', 'cube'],
      ['Open almost anything', 'Drop a STEP, GLB, GLTF, FBX, OBJ, 3MF or STL file, or start from an empty scene.', 'Images/apps/meshoptimiser-open.webp', 'upload'],
      ['Tree, viewport, properties', 'Parts on the left, the model in the middle, and what is selected on the right: triangles, size, volume, shape parameters.', 'Images/apps/meshoptimiser-viewer.webp', 'tree'],
    ],
    stats: [['Version', '0.8.0'], ['Category', 'CAD tool'], ['Platform', 'Windows · macOS'], ['Runs', 'Locally']],
    about: [
      "A tool for getting heavy CAD assemblies into the browser.",
      "The problem it works on is a practical one. A real-world STEP file can hold 400 identical bolts, 80 duplicate brackets and half a million degenerate triangles, and a browser is still expected to draw it. MeshOptimiser reads the assembly, recognises the parts that are the same and keeps one mesh with a list of positions, re-tessellates the bad geometry, and drops what is too small to see.",
      "What comes out is a compressed GLB and a viewer to look at it in: the assembly tree, section cuts, recolouring, export. It runs locally, with Python and a browser, as an open, self-hosted take on what preprocessors like Pixyz do.",
    ],
    highlights: [
      ['320 MB → 11 MB', 'The README’s example: a STEP assembly down to a Meshopt-compressed GLB.'],
      ['~10×', 'Smaller GLBs with Meshopt compression through gltfpack.'],
      ['1 mesh, N transforms', 'Identical parts are found at any rotation or position and drawn once.'],
      ['10K+ nodes', 'The assembly tree stays live and searchable at that size.'],
    ],
    steps: [
      ['STEP in', 'Drop a .step or .stp file on the welcome screen, or run the converter from the command line.'],
      ['Convert', 'OCCT reads the full assembly tree with names and colours; duplicate parts are instanced, surfaces tessellated adaptively, tiny parts culled, then the result is compressed.'],
      ['GLB out', 'Open it in the built-in WebGPU viewer: inspect, section, recolour, tidy the hierarchy, and export.'],
    ],
    featureGroups: [
      { title: 'Pipeline', note: 'STEP → GLB', items: [
        ['XCAF reader', 'Per-solid colours, names and the full assembly tree pulled straight out of OCCT.'],
        ['PCA pose-normalized hash', 'The same shape at any rotation or translation becomes one GPU mesh and N transforms.'],
        ['Adaptive tessellation', 'Absolute, or relative to the bounding-box diagonal, with size culling for the tiny stuff.'],
        ['Meshopt + Draco', 'Optional EXT_meshopt_compression through gltfpack, for roughly 10× smaller GLBs.'],
        ['One-click launch', 'start.bat / start.command sets up the Python environment and opens the browser.'],
        ['Background jobs', 'Long conversions run as server jobs with live progress streamed to the UI.'],
      ] },
      { title: 'Viewer & rendering', items: [
        ['Dual renderer', 'WebGPU by default, with a hot-swap to WebGL2 from the toolbar.'],
        ['Section / clip planes', 'Live cross-sections with true GPU clipping, not fake plane meshes.'],
        ['PBR, AO and environment', 'Studio lighting, ambient occlusion, screen-space reflections, fog.'],
        ['Pixel-perfect picking', 'Hover, click and marquee-select, including on instanced meshes.'],
        ['Hide / Isolate / Solo', 'One key per mode: flatten the noise, focus on what matters.'],
        ['Recolour by group', 'Per-instance and per-material recolouring, with reset built in.'],
        ['Wireframe / Shaded / Matcap', 'Three viewport modes, switchable at any time.'],
        ['Path tracer', 'A GPU path tracer that accumulates a finished render while the live viewport keeps responding (since 0.7).'],
      ] },
      { title: 'Hierarchy editing', items: [
        ['Live tree', '10K+ nodes, virtualised, with a sticky right column.'],
        ['Search + filters', 'Fuzzy name search and “highlight small parts” tinting.'],
        ['Flatten / Dissolve', 'Collapse single-child chains, dissolve groups, ungroup scopes.'],
        ['Batch rename (F2)', 'Token templates, regex find and replace, presets.'],
        ['Undo / Redo', 'Tree edits, recolours, renames and flattens on a single timeline.'],
        ['Right-click menu', 'Hide, isolate, recolour, rename and focus the camera in one click.'],
      ] },
      { title: 'Export', items: [
        ['GLB / GLTF', 'Draco and Meshopt compression toggles, optional embedded textures.'],
        ['FBX / USDZ / OBJ / STL', 'Common DCC and AR formats, with scale presets (mm, cm, m, in) or custom.'],
        ['Save Scene', 'A snapshot of view, selection and recolours in a sidecar .scene.json.'],
      ] },
      { title: 'Interface', items: [
        ['Welcome screen', 'Drag and drop, browse, or reopen recent files.'],
        ['Command palette (⌘K)', 'Every menu item, one keystroke away.'],
        ['Shortcuts overlay', 'A searchable cheatsheet with live key bindings.'],
        ['Resumable sessions', 'File handles and saved scenes persist across reloads.'],
        ['Non-destructive', 'Original geometry is never changed until you export.'],
        ['No build step', 'Vanilla JS, native ES modules, CSS design tokens. Edit a file, refresh, done.'],
      ] },
    ],
    start: {
      text: 'The first run sets up its Python environment, pulls the dependencies and opens the viewer; after that it starts in about a second.',
      commands: [
        ['Windows', 'start.bat'],
        ['macOS', './start.command'],
        ['Command line', 'python step2glb.py input.step --meshopt'],
      ],
    },
    changelog: {
      link: 'https://github.com/xpayn3/MeshOptimiser/blob/main/CHANGELOG.md',
      versions: [
        { version: '0.8.0', latest: true,
          summary: 'The plumbing feels modern: a ray-marched floor grid, one keycap chip across every shortcut surface, undo rebuilt as a flat command registry, and all runtime-injected CSS lifted into the stylesheet.',
          items: [
            ['New', 'Ray-marched ground grid: no vertex precision loss at distance, no sub-pixel jitter under orbit, no coplanar Z-fight.'],
            ['New', 'Redesigned Shortcuts window: sticky search, category headers, two-column grid, multi-key combos as separate keycaps. Opens with ?.'],
            ['Polish', 'One shared keycap style on the hint strip, tooltips, command palette, brand menu and Shortcuts window.'],
            ['Polish', 'Smart fit and its caret merged into one control; its sliders now match the sidebar’s Threshold scrubber.'],
            ['Refactor', 'Eight runtime style injections (about 490 lines) moved into the stylesheet; eleven undo patches collapsed into one registry covering 21 operation types.'],
            ['Fix', 'Tree summary stuck at “1 parts” after delete, a stranded group origin dot, the group button asking for a name, path tracer errors on an empty scene, and confusing material-panel prompts.'],
          ] },
        { version: '0.7.0', summary: 'GPU path tracer with a sample-accumulating render window, a contextual hint strip, a long-hold add-primitive picker, a standalone Cloner you can drag parts into, and Revert to source.' },
        { version: '0.6.0', summary: 'A C4D-style live Cloner, a Ctrl-click measure tool, per-group origin markers, a two-panel Export window, simplification and Meshopt by default in the pipeline, and CAD-correct mouse mapping.' },
        { version: '0.5.0', summary: 'Scene management (New scene, Import-merge, Scene settings), parametric primitives with editable mm-snapped inputs, unit-aware transforms, banding-free dithered backgrounds, and a clean shutdown.' },
        { version: '0.4.0', summary: 'HDRI environment lighting, an infinite floor grid with fog, parametric primitive insertion, a camera-view pill with Ctrl/⌘ + 1–4, a borderless popup language, and a blue accent refresh.' },
        { version: '0.3.0', summary: 'A full material editor with shader-ball previews, a scale gizmo with Shift-snap and a live HUD, screenshots at custom resolutions, orthographic Top / Front / Side views, and FBX legacy rescue.' },
        { version: '0.2.0', summary: 'The editing surface: welcome screen, command palette, shortcuts overlay, settings, section planes, renderer hot-swap, batch rename, flatten / dissolve / ungroup, undo and redo, Save Scene. Tree expand and collapse on 10K+ nodes went from about a second to under 10 ms.' },
        { version: '0.1.0', date: '5 May 2026', summary: 'First public commit: the STEP → GLB pipeline, the WebGPU viewer with tree, picking, hide / isolate and per-group colouring, the local server, one-click launchers, and vendored Draco and Assimp decoders.' },
      ],
    },
    info: [
      ['Status', 'Pre-1.0, breaking changes expected'],
      ['Platform', 'Windows, macOS'],
      ['Requires', 'Python 3.10 – 3.12, a WebGPU-capable browser, about 2 GB free for the first install'],
      ['Built with', 'cadquery-ocp, trimesh, numpy, Draco, Assimp (WASM), WebGPU, vanilla JS'],
      ['Licence', 'MIT'],
      ['First published', '5 May 2026'],
      ['Source', 'github.com/xpayn3/MeshOptimiser'],
    ],
  },
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
        ['Mesh export', 'OBJ, or GLB / GLTF for the full mesh and scene.', 'download'],
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
      ['Exports', 'OBJ, GLB / GLTF, PNG, preset JSON'],
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
        ['Dashboard', 'Weekly stats, a fitness snapshot and recent rides in widgets you can reorder, hide and rearrange.', 'grid'],
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
