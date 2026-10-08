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
    icon: 'Images/apps/meshoptimiser-icon.svg',
    cover: 'Images/apps/meshoptimiser-viewer.webp',
    shots: [
      ['Images/apps/meshoptimiser-viewer.webp', 'A 1,583-part, 5.4-million-triangle assembly: the tree on the left, the scene’s totals on the right'],
      ['Images/apps/meshoptimiser-library.webp', 'The library drawer: a pillow block and a handwheel placed, and a stepper motor on its way in, shown where it will stand'],
      ['Images/apps/meshoptimiser-bolt-nut.webp', 'A hex bolt that carries its own nut: size, length and the nut’s distance from the head are all parameters'],
      ['Images/apps/meshoptimiser-blocks.webp', 'Smart fit with Blocks on every part: 16,812 triangles down to 3,048, the outline kept'],
      ['Images/apps/meshoptimiser-smart-fit.webp', 'Smart fit: box, turned box, cylinder, a few boxes, or blocks at the detail you choose'],
      ['Images/apps/meshoptimiser-report.webp', 'The optimisation report: the scene as it was opened beside the scene now'],
      ['Images/apps/meshoptimiser-select-hidden.webp', 'Select hidden parts: the command panel beside the viewport'],
      ['Images/apps/meshoptimiser-select-hidden-result.webp', '878 of 1,583 parts cannot be seen from outside: 2.4 million triangles, selected in one step'],
      ['Images/apps/meshoptimiser-isolate.webp', 'Those hidden parts on their own, isolated'],
      ['Images/apps/meshoptimiser-fill-holes.webp', 'Fill holes: closes bolt holes, slots and pockets in flat faces and leaves the rest alone'],
      ['Images/apps/meshoptimiser-split.webp', 'Split: recovers the separate solids of a mesh that was fused on export'],
      ['Images/apps/meshoptimiser-align.webp', 'Align to floor: turn the model in steps and choose which side of it sits at zero'],
      ['Images/apps/meshoptimiser-clay.webp', 'Clay: every part in one plain material, so only the form is left'],
      ['Images/apps/meshoptimiser-xray.webp', 'X-ray: the whole assembly as translucent shells'],
      ['Images/apps/meshoptimiser-wireframe.webp', 'Wireframe: every edge of every part'],
      ['Images/apps/meshoptimiser-heatmap.webp', 'Heatmap: parts coloured by how dense their triangles are'],
      ['Images/apps/meshoptimiser-exploded.webp', 'Exploded view, with a slider for each axis'],
      ['Images/apps/meshoptimiser-inspect.webp', 'One part selected: its triangles, its share of the scene and its rank by weight'],
      ['Images/apps/meshoptimiser-search.webp', 'Search for “bolt”: the parts in the scene by name, and the bolts in the library ready to add'],
      ['Images/apps/meshoptimiser-search-sum.webp', 'The search works out a sum or a length; Enter copies the answer'],
      ['Images/apps/meshoptimiser-context-menu.webp', 'Right-click a part to frame, isolate, select similar, copy or delete'],
      ['Images/apps/meshoptimiser-materials.webp', 'The materials dock: every material in the scene, with how many parts use it'],
      ['Images/apps/meshoptimiser-export.webp', 'Export to GLB, glTF, FBX, USDZ, OBJ, STL, PLY, or a parts list'],
      ['Images/apps/meshoptimiser-tabs.webp', 'Scene tabs: drag them into order; the dot on the icon is yellow while there are unsaved changes'],
      ['Images/apps/meshoptimiser-settings-performance.webp', 'Settings › Performance: the renderer, quality, and what a moving view gives up'],
      ['Images/apps/meshoptimiser-settings-general.webp', 'Settings › General'],
      ['Images/apps/meshoptimiser-shortcuts.webp', 'The keyboard shortcuts overlay, with search'],
      ['Images/apps/meshoptimiser-start.webp', 'The start screen: drop a file, reopen a recent one, or start from a shape'],
    ],
    spotlights: [
      ['A drawer full of parts', 'Hex bolts, wing nuts, pillow blocks, I-beams, gears, a stepper motor: 86 parametric parts on six shelves. Drag one out and a see-through copy shows where it will stand, square to the face under the pointer. Let go and it is there.', 'Images/apps/meshoptimiser-library.webp', 'cube'],
      ['878 parts nobody will ever see', 'Select hidden parts looks at the model from every side and picks out what cannot be seen from any of them. On this assembly that is more than half the parts and 2.4 million of its 5.4 million triangles, selected in one step and ready to delete.', 'Images/apps/meshoptimiser-select-hidden-result.webp', 'cube'],
      ['82% lighter, still recognisable', 'Smart fit used to turn a bracket into a brick. Blocks rebuilds each part from a coarse grid, with its steps, arms and openings where they were. This drive unit went from 16,812 triangles to 3,048 in one command.', 'Images/apps/meshoptimiser-blocks.webp', 'cube'],
      ['A bolt that brings its own nut', 'Tick it on, choose the nut, and set how far from the head it sits. It is part of the bolt’s own shape, in the bolt’s thread: one part in the tree, one undo step, and it cannot run off the end.', 'Images/apps/meshoptimiser-bolt-nut.webp', 'cube'],
      ['Clay', 'One key and the colours are gone. Every part in the same plain material, lit by a headlight that follows the view, so edges, curvature and what stands in front of what are all that is left.', 'Images/apps/meshoptimiser-clay.webp', 'cube'],
      ['Search that finds everything', 'Type “bolt” and get the foot bolts in the scene and every bolt in the library. Enter selects and frames a part, or adds a new one. It also works out 12*25.4 and 2 in.', 'Images/apps/meshoptimiser-search.webp', 'command'],
      ['Tabs you can arrange', 'Every tab is a scene of its own. Drag them into order, save from the tab’s icon, and keep your sidebars where you put them from one scene to the next.', 'Images/apps/meshoptimiser-tabs.webp', 'tree'],
      ['It starts like an app', 'Installed, it opens in a window of its own with no address bar and no browser tabs. Drop a STEP, GLB, glTF, FBX, OBJ, 3MF or STL file on the start screen, or begin from a shape.', 'Images/apps/meshoptimiser-start.webp', 'upload'],
    ],
    clips: [
      ['Fill holes', 'Bolt holes, slots and pockets in flat faces close a few at a time; everything else is left as it was.', 'Images/apps/meshoptimiser-clip-fill-holes.webm'],
      ['Split', 'A mesh that was fused on export comes apart into the solids it was made of.', 'Images/apps/meshoptimiser-clip-split.webm'],
      ['Select hidden parts', 'The screws, bearings and brackets inside a housing light up: everything that cannot be seen from outside.', 'Images/apps/meshoptimiser-clip-select-hidden.webm'],
      ['Smart fit', 'A dense part becomes a box, a cylinder, a few boxes or blocks that keep its outline.', 'Images/apps/meshoptimiser-clip-smart-fit.webm'],
    ],
    stats: [['Version', '0.13.0'], ['Category', 'CAD tool'], ['Platform', 'Windows · macOS'], ['Runs', 'Locally']],
    about: [
      "A tool for getting heavy CAD assemblies into the browser.",
      "The problem it works on is a practical one. A real-world STEP file can hold 400 identical bolts, 80 duplicate brackets and half a million degenerate triangles, and a browser is still expected to draw it. MeshOptimiser reads the assembly, recognises the parts that are the same and keeps one mesh with a list of positions, re-tessellates the bad geometry, and drops what is too small to see.",
      "What comes out is a compressed GLB and a viewer to look at it in: the assembly tree, recolouring, mesh tools, a library of parts to add, export. It runs locally, with Python and a browser, as an open, self-hosted take on what preprocessors like Pixyz do.",
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
      ['GLB out', 'Open it in the built-in WebGPU viewer: inspect, recolour, reduce, tidy the hierarchy, and export.'],
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
        ['PBR, AO and environment', 'Studio lighting, ambient occlusion, screen-space reflections, fog.'],
        ['Readable dark parts', 'A studio to reflect on the plain backgrounds and a headlight that follows the view, so dark parts keep an edge and a sheen.'],
        ['Pixel-perfect picking', 'Hover, click and marquee-select, including on instanced meshes.'],
        ['Hide / Isolate / Solo', 'One key per mode: flatten the noise, focus on what matters.'],
        ['Recolour by group', 'Per-instance and per-material recolouring, with reset built in.'],
        ['Solid / Wireframe / X-ray / Heatmap / Clay', 'View modes switchable at any time. Clay draws every part in one plain material, to read the shape.'],
      ] },
      { title: 'Mesh tools', items: [
        ['Fill holes', 'Closes bolt holes, slots and pockets in flat faces and leaves the rest of the mesh alone. Options for through, blind and open holes, size and depth.'],
        ['Decimate', 'Reduces the selection by a percentage or to a triangle budget, keeping normals, UVs and vertex colours.'],
        ['Split', 'Recovers the separate solids of a mesh that was fused on export.'],
        ['Smart fit', 'Replaces parts with a low-poly stand-in: a box, a turned box, a cylinder, a handful of fitted boxes, or blocks that keep the outline.'],
        ['Fit to budget', 'A triangle target for the whole scene: the densest meshes are reduced first, with a preview and one undo step.'],
        ['Select hidden parts', 'Finds the parts that cannot be seen from outside and selects them, ready to delete.'],
        ['Align to floor', 'Turns a model that arrived on its side and stands it on the grid over the origin, as one undo step.'],
        ['Clean-up', 'Removes small, empty, duplicate and degenerate parts, and empty groups.'],
        ['What it saved', 'Every action shows the triangles it removed; each part remembers the count it arrived with.'],
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
        ['GLB / glTF', 'Draco and Meshopt compression toggles, optional embedded textures.'],
        ['FBX / USDZ / OBJ / STL', 'Common DCC and AR formats, with scale presets (mm, cm, m, in) or custom.'],
        ['Save Scene', 'A snapshot of view, selection and recolours in a sidecar .scene.json.'],
      ] },
      { title: 'Interface', items: [
        ['Welcome screen', 'Drag and drop, browse, or reopen recent files.'],
        ['Scene tabs', 'Each tab is a scene of its own. New and Open never replace a scene that has something in it.'],
        ['Command panels', 'A tool with settings opens as a panel beside the viewport: Enter runs it, Esc puts it away.'],
        ['Drag any number', 'Dimensions and limits are numbers you drag sideways, or click to type.'],
        ['One Settings window', 'General, viewport, camera, performance, scene and storage, with a search across all of them.'],
        ['Search (Ctrl / ⌘ + K)', 'Every action, part and library part, one keystroke away, with suggestions for what is selected.'],
        ['Object library', 'The left sidebar switches between the parts tree and a library of 86 parts to drag into the scene.'],
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
        { version: '0.13.0', latest: true,
          summary: 'It feels like an app. MeshOptimiser installs to the desktop with an icon of its own, opens in a window with no address bar, browser tabs or extension buttons, and can fold its title bar away. The scene tabs grew up with it, and a view that is moving gives up what you cannot see anyway.',
          items: [
            ['New', 'Install it: Chrome and Edge offer Install, and the app gets a desktop shortcut and a window to itself. start.bat opens that window directly, with nothing of the browser in it.'],
            ['New', 'Fold the title bar away in the installed app: the window’s buttons float over the corner and the app’s top bar becomes the title bar.'],
            ['New', 'Drag tabs into order. A tab rides with the pointer, the others slide over, and Esc puts it back.'],
            ['Polish', 'The tab, rearranged: a status dot on the icon’s corner (yellow unsaved, green saved), a click on the icon saves, and the close button sits at the right end.'],
            ['New', 'Same sidebars in every tab: switching scenes keeps the sidebar widths and the folded left sidebar. A switch under Settings turns it off.'],
            ['Perf', 'While the view moves, parts under about three pixels are skipped (570 of 1,583 with the test assembly zoomed out) and the resolution steps down only if frames are slow. Both come back the moment it stops.'],
            ['Polish', 'The renderer picker moved to Settings; the Menu button lost its arrow; the loading bar is one flat accent blue; Properties no longer jumps when a tag appears.'],
          ] },
        { version: '0.12.0',
          summary: 'The biggest release yet. Until now MeshOptimiser opened a model and made it lighter; from this version it also builds. A drawer of 86 real parts to drag onto the model, a file on its side stood up on the floor from one card, a whole scene brought down to the triangle budget you type, and dark parts that finally look like something.',
          items: [
            ['New', 'The library drawer: 86 parametric parts on six shelves. Hex bolts, Allen screws, carriage bolts and U-bolts; wing, castle, lock and T-slot nuts; pipe tees, elbows and flanges; I-beams, box tube and T-slot extrusion; gears, sprockets, bearings, pillow blocks, a linear rail and a stepper motor.'],
            ['New', 'Drag a part out of the drawer and a see-through copy follows the pointer, already standing where it will land: square to the face under it, or upright on the floor. Pick M6 × 24 once and every fastener comes out in it.'],
            ['New', 'A bolt that brings its own nut: tick it on, choose a wing nut or a castle nut, and set how far from the head it sits. One part, one undo step, and it cannot run off the end of the thread.'],
            ['New', 'Align to floor: files arrive anywhere and any way up. Turn the model in steps, say which side goes to zero on each axis, and watch it move. Switch it on for every file and never open a model lying down again.'],
            ['New', 'Select hidden parts finds the screws inside a housing and the board under a cover. Fit to budget takes a triangle count for the whole scene and reduces the densest meshes first, with a preview and Cancel.'],
            ['New', 'Smart fit learned shapes: Boxes turns a levelling foot into a slab and a bar; Blocks rebuilds a part from a coarse grid with its steps, arms and openings in place. A 16,812-triangle drive unit comes out at 3,048.'],
            ['New', 'Clay view (5) strips the colours so only form is left, in clay, porcelain, steel or red wax. A studio to reflect and a headlight that follows the view give dark parts an edge and a sheen.'],
            ['New', 'Search finds parts by name and library parts (“add flange”), and works out 12*25.4 or 2 in. Every number field drags. An optimisation report puts the scene as opened beside the scene now.'],
            ['Fix', 'Parts no longer show through thin covers when zoomed out: the camera’s near plane follows it away from the model.'],
            ['Polish', 'The right sidebar is grouped into Inspect, Clean up and Reduce; the selected row in the tree is easier to find. The section plane is removed.'],
          ] },
        { version: '0.11.0',
          summary: 'How the app is used changes: scenes open in tabs, tools appear as panels beside the viewport instead of sitting in a sidebar, every number can be dragged, and one Settings window replaces three places that held options.',
          items: [
            ['New', 'Scene tabs: every tab is its own scene with its own undo history. New and Open never replace a scene that has something in it; a spare tab is kept warm so a new one is there at once.'],
            ['New', 'Command panels: Split (X) and Fill holes (P) open beside the viewport. Enter runs, Esc puts the panel away before it clears the selection.'],
            ['New', 'Fill holes gains options (through, blind and open holes, a smallest size, a depth limit, a flatness tolerance) and was stress-tested on a 5.4-million-triangle assembly across nine option sets.'],
            ['New', 'Drag any number to change it; shape parameters take one line each. One Settings window with search. Every command behind “…”, and a shortcut map without conflicts.'],
            ['New', 'Properties is never empty: the scene’s totals with nothing selected, and for a selection the triangle count with what was saved, its share of the scene and its rank by weight.'],
            ['Fix', 'A hole fill can no longer leave a crack; material names follow their colour and the open editor follows presets and undo; scenes made of added shapes count their triangles.'],
            ['Polish', 'A darker, calmer interface in one tone; the GPU path tracer is removed and nothing is fetched from a CDN at start-up.'],
          ] },
        { version: '0.10.1', summary: 'The libraries the viewer needs are bundled, so the app starts without a CDN and works with no connection at all.' },
        { version: '0.10.0', summary: 'Fast, and with tools it did not have: a hole filler that tells a hole from a boss, a materials dock, a decimator that keeps normals and UVs, background workers, and a parts tree that keeps up with five million triangles.' },
        { version: '0.9.0', summary: 'Trustworthy: a self-test suite that runs inside the app, undo for every action, exports that match the scene, and a restyled interface.' },
        { version: '0.8.0',
          summary: 'The plumbing feels modern: a ray-marched floor grid, one keycap chip across every shortcut surface, undo rebuilt as a flat command registry, and all runtime-injected CSS lifted into the stylesheet.',
          items: [
            ['New', 'Ray-marched ground grid: no vertex precision loss at distance, no sub-pixel jitter under orbit, no coplanar Z-fight.'],
            ['New', 'Redesigned Shortcuts overlay: sticky search, category headers, two-column grid, multi-key combos as separate keycaps. Opens with ?.'],
            ['Polish', 'One shared keycap style on the hint strip, tooltips, command palette, brand menu and Shortcuts overlay.'],
            ['Polish', 'Smart fit and its caret merged into one control; its sliders now match the sidebar’s Threshold scrubber.'],
            ['Refactor', 'Eight runtime style injections (about 490 lines) moved into the stylesheet; eleven undo patches collapsed into one registry covering 21 operation types.'],
            ['Fix', 'Tree summary stuck at “1 parts” after delete, a stranded group origin dot, the group button asking for a name, path tracer errors on an empty scene, and confusing material-panel prompts.'],
          ] },
        { version: '0.7.0', summary: 'GPU path tracer with a sample-accumulating render window, a contextual hint strip, a long-hold add-primitive picker, a standalone Cloner you can drag parts into, and Revert to source.' },
        { version: '0.6.0', summary: 'A C4D-style live Cloner, a Ctrl-click measure tool, per-group origin markers, a two-panel Export window, simplification and Meshopt by default in the pipeline, and CAD-correct mouse mapping.' },
        { version: '0.5.0', summary: 'Scene management (New scene, Import-merge, Scene settings), parametric primitives with editable mm-snapped inputs, unit-aware transforms, banding-free dithered backgrounds, and a clean shutdown.' },
        { version: '0.4.0', summary: 'HDRI environment lighting, an infinite floor grid with fog, parametric primitive insertion, a camera-view pill with Ctrl / ⌘ + 1–4, a borderless popup language, and a blue accent refresh.' },
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
