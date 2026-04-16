# Luka Grcar Portfolio — Project Guide

## Stack
- Pure HTML/CSS/JS — no framework, no build system, no bundler
- GitHub Pages hosting (repo: xpayn3/Personal-website)
- Three.js r138 (UMD build via CDN) for 3D GameBoy on about page
- Google Fonts: Inter, Instrument Sans, Press Start 2P
- Remixicon for icons
- Web3Forms for contact form submissions
- Google Analytics: G-RXZ65KVMCQ

## Pages
- `index.html` / `home.css` / `home.js` — Landing page with hero video carousel + scroll showcase
- `grid.html` / `style.css` / `script.js` — Filterable image grid of all projects (~20 projects, 130+ media files)
- `about.html` / `about.css` / `gameboy.js` — About page with interactive 3D GameBoy + split layout

## File Conventions
- Images live in `Images/` with mobile versions in `Images/mobile/` (300px wide)
- Video thumbnails: `filename_thumb.webp` alongside `.webm` files
- GameBoy assets in `gameboy/` — GLTF model, WebP textures, .bin geometry buffers, project thumbnails in `gameboy/thumbs/`
- All textures optimized: 4096 source -> 1024px WebP at quality 85
- No build/deploy pipeline — user deploys manually via `git push`

## Key Architecture Decisions

### Grid Page (script.js)
- `mediaTag()` function handles video vs image, mobile vs desktop, lazy loading
- Videos use `data-src` + IntersectionObserver for lazy loading
- Scroll lock uses `position: fixed` + `touchmove preventDefault` for iOS Safari
- Grid items use `data-src` lazy loading via IntersectionObserver
- Overlay/lightbox system with `cleanupOverlay()` for proper cleanup
- Mobile detection: `const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent)`

### Home Page (home.js)
- Hero carousel with swipe/drag, 5 looping videos
- Smooth scroll physics (desktop only) with idle detection
- RAF loop stops when velocity < 0.1
- Videos use `data-src` and load on demand

### GameBoy (gameboy.js) — Major Feature
Architecture:
- IIFE wrapping everything
- Three.js scene with GLTF model loading
- Canvas-based screen UI (320x288, Press Start 2P font)
- State machine: insert -> boot -> menu -> detail/snake/breakout
- Named mesh parts: screen, glass, body-body, body-light, A, B, joystick, reset, power, casette

Screen UI states:
- `insert` — "INSERT CARTRIDGE" with blinking prompt, screen sleeps after 8s
- `boot` — 5-phase animation (scan, rainbow diamond, flash, rainbow PORTFOLIO typing, loading bar)
- `menu` — scrollable list with inverted black/white highlight bars
- `detail` — scrollable content with cursor, awards have right-aligned years
- `snake` — classic Snake game
- `breakout` — Breakout with colored bricks, lives, paddle physics
- `projScreen` — project image viewer with color thumbnails
- `trophyScreen` — achievement unlock screen with pixel trophy icon

Key patterns:
- `drawScreen()` renders everything to canvas, sets `screenTex.needsUpdate = true`
- Canvas is vertically flipped: `ctx.translate(0, h); ctx.scale(1, -1)` — all coordinates are inverted
- `pressButton(action)` handles all input routing through state machine
- Raycasting for button clicks: `pointerup` only for mouse (`e.pointerType === 'mouse'`), `touchend` for touch — prevents mobile double-tap
- Frame-rate independent: uses `performance.now()` delta, capped at 50ms
- Nudge animation uses separate `nudgeX/nudgeY` with 0.85 decay per frame — no accumulation
- Camera zoom: `targetCamZ` lerps (180 default, 130 when cart inserted)
- Screen sleep: `lastInteraction` timer, screen dims after 8s, any button press wakes
- Cart insert from both screen (A button) and back (click slot) — both trigger same boot sequence with 800ms delay

Texture handling:
- GLTF references `tex_0.webp` (glass), `tex_1.webp` (casette), `tex_2.webp` (body) — these are auto-loaded
- Glass texture (`tex_0.webp`): RGB from base color + inverted opacity baked into alpha channel
- Body textures loaded via JS: base color, normal, roughness, metallic, AO, height (bump) maps
- Screen mesh material replaced with `MeshStandardMaterial` using canvas texture as both `map` and `emissiveMap`
- Glass material: keep GLTF original + set `transparent: true, depthWrite: false`, add roughness map
- `flipY = false` for GLTF-loaded textures, `flipY = true` for canvas screen texture

Lighting:
- Cinematic teal & orange color grading
- Key (warm amber) from top-right, fill (cool teal) from left
- Dual rim lights: teal behind-left + warm behind-right
- Procedural env map: gradient sphere with warm/cool hotspots, 128px cubemap

Sound (Web Audio API):
- `playTone(freq, dur, type, vol)` — oscillator-based
- Navigate: short blip, Select: ascending two-tone, Back: descending
- Cart insert: noise burst slide + snap + latch click
- Cart eject: latch release + pop
- Boot: victory fanfare melody (G-G-G-C, Bb-C-D-G) + bass

### About Page Layout
- Desktop: fixed left 50% (GameBoy) + scrollable right 50% (content)
- Mobile: stacked vertically, GameBoy full screen height first
- Contact form popup with Web3Forms (key: d40b8189-988b-4e6f-83db-6c8b8b386e8e)
- Form fields: name, email, company, website, project type chips, budget chips, timeline chips, message

## Common Gotchas
- **Browser caching**: bump `?v=N` on gameboy.js script tag and GLTF image URIs when changing textures
- **iOS Safari**: `overflow: hidden` alone doesn't prevent background scroll — need `position: fixed` + `touchmove preventDefault`
- **Three.js r138 UMD**: no ES module imports, everything on `THREE.*` global. FBXLoader needs fflate, GLTFLoader works standalone
- **Canvas texture flipY**: GLTF UVs expect `flipY=false`, but canvas screen needs `flipY=true`
- **Glass transparency**: alpha in RGBA texture controls it, must set `transparent: true` and `depthWrite: false` on material, render order matters
- **Opacity map inversion**: the opacity PNG has white=opaque bezel, black=transparent — must INVERT for alpha channel (0=transparent, 255=opaque)
- **Mobile double-tap**: `pointerup` and `touchend` both fire on mobile — only use `pointerup` for `e.pointerType === 'mouse'`
- **Font baseline**: Press Start 2P has weird baseline — use `textBaseline = 'middle'` + manual 2px offset for centering
- **Cart hit zone**: thin (0.5 depth) on back face + rotation angle check to prevent front-side triggers
- **Nudge accumulation**: never use setTimeout to restore rotation — use auto-decaying offset
- **drawScreen in animation loop**: throttle boot/insert redraws, only redraw snake/breakout on tick

## Git Workflow
- User says "push" = commit all + push to main, no questions asked
- Don't amend commits, always create new
- Commit messages: short, descriptive, include Co-Authored-By
- Don't push unless explicitly told to

## Optimization Checklist (for new assets)
1. Images: 4096 -> 1024, PNG -> WebP quality 85
2. Textures: extract from GLTF base64, save as external .webp files
3. GLTF: extract embedded buffers to .bin files, images to .webp
4. Geometry: body-body is 18MB, casette is 8MB — need decimation in 3D software
5. Project thumbnails: 80x80 WebP, full color, ~1-2KB each
