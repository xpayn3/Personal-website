// ========== LAB APPS ==========
// Apps, small tools and web experiments. The Lab page lists them as a shelf
// of cards (lab.js) and each has a page of its own, apps/<id>.html, drawn
// from this same list by app-page.js. Look: apps.css.
//
// To add one: add an object here and copy apps/webtree.html to
// apps/<id>.html, changing the id, title and description in it.
//   id        file name of its page, and its handle everywhere
//   title, subtitle, category
//   repo      GitHub link            url   where it runs (optional)
//   icon      image URL (optional; without one the tile shows the initial)
//   stats     the strip under the header: [label, value] pairs
//   cover     wide picture for its post in the Lab feed
//   shots     screenshots: [image, caption] pairs (optional)
//   gallery   small square pictures: [image, caption] pairs, titled by
//             galleryTitle (optional)
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
    repo: 'https://github.com/xpayn3/MeshOptimiser',
    cover: 'Images/apps/meshoptimiser-viewer.webp',
    shots: [
      ['Images/apps/meshoptimiser-viewer.webp', 'The viewer: assembly tree, viewport, properties and actions'],
      ['Images/apps/meshoptimiser-add.webp', 'Add menu: parametric shapes and DIN fasteners'],
      ['Images/apps/meshoptimiser-open.webp', 'Open a model: STEP, GLB, GLTF, FBX, OBJ, 3MF or STL'],
    ],
    stats: [['Version', '0.8.0'], ['Category', 'CAD tool'], ['Platform', 'Windows · macOS'], ['Runs', 'Locally']],
    about: [
      'Drop a STEP file in. Get a Meshopt-compressed GLB and an interactive viewer out. A self-hosted take on the Pixyz preprocessor: Python and your browser, no licence server.',
      'CAD assemblies are big. A real-world STEP file might contain 400 identical bolts, 80 duplicate brackets and half a million degenerate triangles, and still expect your GPU to render it. The pipeline collapses what it can: identical parts become one mesh and a list of transforms, bad triangles are re-tessellated, and the tiny stuff is culled by size.',
      'A CAD preprocessor, viewer, hierarchy editor and exporter, in one local app.',
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
    repo: 'https://github.com/xpayn3/webtree',
    url: 'https://xpayn3.github.io/webtree/',
    icon: 'https://xpayn3.github.io/webtree/icons/icon.svg',
    cover: 'Images/apps/windytree-editor.webp',
    shots: [
      ['Images/apps/windytree-editor.webp', 'The editor: a cherry tree with its trunk, shape and branching controls'],
      ['Images/apps/windytree-species.webp', 'Pick a species to start from'],
    ],
    galleryTitle: 'Species presets',
    stats: [['Category', '3D tool'], ['Platform', 'Web'], ['Presets', '35'], ['Engine', 'WebGPU']],
    gallery: ['oak', 'willow', 'palm', 'baobab', 'japanesemaple', 'birch', 'pine', 'cherry', 'olive', 'redwood', 'ginkgo', 'cypress']
      .map(name => [`https://xpayn3.github.io/webtree/presets/${name}.png`, name === 'japanesemaple' ? 'Japanese maple' : name]),
    about: [
      'Windy Tree is a real-time procedural tree generator built on WebGPU and Three.js. Sculpt branches, swap species, tune wind, and export your tree.',
    ],
    features: [
      ['35 species presets', 'Start from acacia, baobab, birch, ginkgo, Japanese maple, oak, olive, palm, redwood, willow and more.'],
      ['Runs in the browser', 'Built on WebGPU and Three.js. Nothing to install: open the link.'],
      ['Installable', 'Ships a web app manifest, so it can be added to a device like an app.'],
    ],
    info: [
      ['Platform', 'A WebGPU-capable browser'],
      ['Built with', 'WebGPU, Three.js'],
      ['First published', 'April 2026'],
      ['Source', 'github.com/xpayn3/webtree'],
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
