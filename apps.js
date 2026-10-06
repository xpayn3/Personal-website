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
//   shots     previews: [image URL, caption] pairs (optional)
//   about     paragraphs
//   features  [name, a line about it] pairs
//   whatsNew  { version, text } (optional)
//   info      the table at the bottom: [label, value] pairs
window.labApps = [
  {
    id: 'meshoptimiser',
    title: 'MeshOptimiser',
    subtitle: 'From bloated CAD to browser-ready, locally.',
    category: 'CAD tool',
    repo: 'https://github.com/xpayn3/MeshOptimiser',
    stats: [['Version', '0.8.0'], ['Category', 'CAD tool'], ['Platform', 'Windows · macOS'], ['Runs', 'Locally']],
    about: [
      'Drop a STEP file in. Get a Meshopt-compressed GLB and an interactive viewer out. A self-hosted take on the Pixyz preprocessor: Python and your browser, no licence server.',
      'CAD assemblies are big. A real-world STEP file might contain 400 identical bolts, 80 duplicate brackets and half a million degenerate triangles, and still expect your GPU to render it. The pipeline collapses what it can: identical parts become one mesh and a list of transforms, bad triangles are re-tessellated, and the tiny stuff is culled by size.',
      'A CAD preprocessor, viewer, hierarchy editor and exporter, in one local app.',
    ],
    features: [
      ['Pose-normalized instancing', 'PCA-based hashing detects duplicate geometry regardless of position or rotation. One GPU mesh, N transforms.'],
      ['Editable assembly tree', 'Search, isolate, recolour, batch-rename, flatten, dissolve, ungroup. All undoable.'],
      ['Two renderers', 'WebGPU by default, or WebGL2. Hot-swap from the toolbar, no reload.'],
      ['GPU section planes', 'Live cross-sections with real GPU clipping, not a placeholder mesh.'],
      ['Export', 'GLB and GLTF with Draco and Meshopt compression, plus FBX, USDZ, OBJ and STL.'],
      ['No build step', 'Vanilla JS, native ES modules, CSS design tokens. Edit a file, refresh, done.'],
    ],
    whatsNew: {
      version: '0.8.0',
      text: 'A ray-marched floor grid with no plane mesh and no Z-fighting, a redesigned Shortcuts window with search, one keycap style across every shortcut surface, and the undo system rebuilt as a single command registry.',
    },
    info: [
      ['Status', 'Pre-1.0, breaking changes expected'],
      ['Platform', 'Windows, macOS'],
      ['Requires', 'Python 3.10 – 3.12 and a WebGPU-capable browser'],
      ['Built with', 'cadquery-ocp, trimesh, numpy, Draco, Assimp (WASM), WebGPU, vanilla JS'],
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
    stats: [['Category', '3D tool'], ['Platform', 'Web'], ['Presets', '35'], ['Engine', 'WebGPU']],
    shots: ['oak', 'willow', 'palm', 'baobab', 'japanesemaple', 'birch', 'pine', 'cherry', 'olive', 'redwood', 'ginkgo', 'cypress']
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
