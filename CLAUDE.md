# Luka Grcar Portfolio — Project Guide

## Stack
- Pure HTML/CSS/JS — no framework, no build system, no bundler
- GitHub Pages hosting (repo: xpayn3/Personal-website)
- Three.js r138 (UMD build via CDN) + DRACOLoader for 3D GameBoy on about page
- Google Fonts: Inter, Instrument Sans, Press Start 2P
- Remixicon for icons (async loaded)
- Web3Forms for contact form submissions
- Google Analytics: G-RXZ65KVMCQ

## Pages
- `index.html` / `home.css` / `home.js` — Landing page with hero video carousel + scroll showcase
- `grid.html` / `style.css` / `script.js` — Filterable image grid of all projects (~20 projects, 130+ media files)
- `about.html` / `about.css` / `gameboy.js` — About page with interactive 3D GameBoy + split layout

## Shared CSS
- `tokens.css` — Design tokens (colors, spacing, radii, shadows, transitions) with `.theme-dark` variant
- `bar.css` — Bottom navigation bar + floating contact button (shared across all pages)
- `footer.css` — CTA footer with social links (shared across home + grid)

## File Conventions
- Images live in `Images/` with mobile versions in `Images/mobile/` (300px wide)
- Video thumbnails: `filename_thumb.webp` alongside `.webm` files
- Tool icons in `Images/tools/` — real software logos (SVG/PNG)
- GameBoy assets in `gameboy/` — Draco-compressed GLTF, WebP textures, .bin geometry buffers
- All textures optimized: 4096 source -> 1024px WebP at quality 85
- No build/deploy pipeline — user deploys manually via `git push`

## Key Architecture Decisions

### Grid Page (script.js)
- `mediaTag(src, alt, fullRes)` handles video vs image, mobile vs desktop, lazy loading
- `fullRes=true` for project overlays so mobile gets high-res images
- Category filter system: Motion, 3D, Print, Branding, Photogrammetry, Lab
- Project/color/category dropdowns, scale slider with fill gradient + tick marks
- Lab items scramble letter case on hover (setInterval 250ms)
- Tool icons with real software logos in project overlay + about page
- Floating title pill with SVG scroll progress ring appears when scrolling past header
- Swipe-down-to-close lightbox with "Swipe to close" hint text
- Mouse wheel navigation in lightbox
- Hover video wraps in clip div for rounded corners
- "No matches found yet" with "Clear filters" button, footer hides when no results

### Home Page (home.js)
- Hero carousel with swipe/drag, 5 looping videos
- Smooth scroll physics (desktop only) with idle detection
- RAF loop stops when velocity < 0.1
- Videos use `data-src` and load on demand

### GameBoy (gameboy.js) — Major Feature
Architecture:
- IIFE wrapping everything, exposes `window.gbSelectCartridge` and `window.gbEjectCartridge`
- Three.js scene with Draco-compressed GLTF model loading (9.9MB→230KB)
- Canvas-based screen UI (320x288, Press Start 2P font)
- **4 swappable cartridges** with custom boot animations + sounds:
  - Portfolio: rainbow diamond sparkle boot, victory fanfare
  - Snake: grid lines + snake slithering, rattlesnake clicks
  - Breakout: brick wall building, arcade coin sound
  - Frogger: water ripples + frog hopping, ribbit chirps
- Named mesh parts: screen, glass, body-body, body-light, A, B, joystick, reset, power, casette

Cartridge system:
- `cartridges` object: portfolio, snake, breakout, frogger — each with label, header, menuItems, autoStart flag
- `selectCartridge(cartId)` — sets activeCart + calls pressButton('a')
- HTML cart picker on right panel syncs via CustomEvents: `gb-inserted`, `gb-ejected`
- Cart buttons: spinner during loading, eject SVG arrow when inserted, disabled when another cart is in
- `cartBusy` flag prevents click spam (3.5s insert lockout, 1.2s eject lockout)
- Game carts skip menu and auto-start after 4.0s boot (portfolio: 4.6s)

Screen UI states:
- `insert` — "INSERT CARTRIDGE" with blinking prompt
- `boot` — cart-specific animation (portfolio: diamond/rainbow, snake: grid+slither, breakout: bricks, frogger: ripples+hop)
- `menu` — scrollable list with inverted highlight bars (dynamic per cart)
- `detail` — scrollable content with cursor
- `snake` — constant speed (0.16s/tick), no acceleration
- `breakout` — black background, colored bricks, white paddle/ball
- `frogger` — 11x11 grid, road lanes with cars, water lanes with logs, lily pad goals, 3 lives
- `projScreen` — project image viewer
- `trophyScreen` — achievement unlock screen

Screen sleep + screensaver:
- 8s idle: screen dims (emissive off, dark color)
- 13s idle: DVD-style screensaver — photo bounces across content area, monochrome + hue shift (60°) on each bounce
- Any interaction wakes (button press, raycast click, cart insert/eject)

Key patterns:
- `drawScreen()` renders everything to canvas, sets `screenTex.needsUpdate = true`
- Canvas is vertically flipped: `ctx.translate(0, h); ctx.scale(1, -1)`
- `pressButton(action)` routes through state machine
- Button hover: emissive glow in button's own color
- Mouse hover tilt: nudgeX/nudgeY when not auto-rotating
- Raycasting: `pointerup` for mouse, `touchend` for touch
- Frame-rate independent: `performance.now()` delta, capped at 50ms
- Nudge: 0.85 decay per frame, no accumulation

Texture handling:
- GLTF references `tex_0.webp` (glass), `tex_1.webp` (casette), `tex_2.webp` (body)
- Glass: RGB from base color + inverted opacity baked into alpha
- Body: base color, normal, roughness, metallic, AO, bump maps loaded via JS
- Screen: canvas texture as both `map` and `emissiveMap`
- `flipY = false` for GLTF textures, `flipY = true` for canvas

Lighting:
- Cinematic teal & orange color grading
- Key (warm amber) top-right, fill (cool teal) left
- Dual rim lights: teal behind-left + warm behind-right
- Procedural env map: gradient sphere with warm/cool hotspots, 128px cubemap

Sound (Web Audio API):
- `playTone(freq, dur, type, vol)` — oscillator-based
- Navigate: short blip, Select: ascending two-tone, Back: descending
- Cart in/out: noise bursts + latch clicks
- Boot: cart-specific (portfolio fanfare, snake rattle, breakout arcade, frogger ribbit)

### iOS Scroll Lock (battle-tested)
- Nested lock counter (`scrollLockCount`) — prevents double-unlock corruption
- `position: fixed` + `top: -scrollY` + `overflow: hidden` on both html and body
- `scroll-locked` CSS class adds `touch-action: none` on background content
- touchmove listener walks DOM to find scrollable parent, blocks at scroll boundaries
- `scrollTo({ behavior: 'instant' })` on unlock prevents visible jump
- `body.style.cssText = ''` clears all styles atomically

### About Page Layout
- Desktop: fixed left 50% (GameBoy) + scrollable right 50% (content)
- Cart picker section above intro text
- Mobile: stacked vertically, GameBoy full screen height first
- Contact form popup with Web3Forms
- Floating "Contact" button top-right (opens form on about, mailto on home)

## Common Gotchas
- **NEVER delete user files** without explicit confirmation — rm bypasses Recycle Bin
- **Browser caching**: bump `?v=N` on gameboy.js script tag when changing code
- **iOS Safari**: `overflow: hidden` alone doesn't prevent scroll — use the full lock system
- **Three.js r138 UMD**: no ES module imports, everything on `THREE.*` global
- **Draco**: DRACOLoader decoder path must point to CDN, set before GLTFLoader.load()
- **Canvas texture flipY**: GLTF UVs expect `flipY=false`, canvas screen needs `flipY=true`
- **Glass transparency**: `transparent: true`, `depthWrite: false` on material
- **EffectComposer + alpha:true**: BREAKS lighting — don't use postprocessing with alpha renderer
- **Mobile double-tap**: only use `pointerup` for `e.pointerType === 'mouse'`
- **Cart insert slot**: must be recreated after programmatic eject (gbEjectCartridge)
- **Nudge accumulation**: never use setTimeout to restore rotation — use auto-decaying offset
- **updateCartUI**: skip buttons with `.loading` class to preserve spinner

## Git Workflow
- User says "push" = commit all + push to main, no questions asked
- Don't amend commits, always create new
- Commit messages: short, descriptive, include Co-Authored-By
- Don't push unless explicitly told to

## Optimization Checklist (for new assets)
1. Images: 4096 -> 1024, PNG -> WebP quality 85
2. Videos: MP4 -> WebM (VP9, CRF 38, 1080p max), generate _thumb.webp
3. Mobile: create 300px WebP in Images/mobile/ subfolder
4. GLTF: Draco compression via gltf-transform CLI
5. Always keep originals — NEVER delete source files
