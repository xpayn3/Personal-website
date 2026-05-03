# Luka Grčar Portfolio — Project Guide

Static portfolio site served from GitHub Pages. 3 HTML pages, no build system, no bundler, no frameworks. Read this top-to-bottom before touching anything.

## Stack
- Pure HTML/CSS/JS — files ship as-is
- GitHub Pages hosting (repo: `xpayn3/Personal-website`, domain: `lukagrcar.com`)
- Three.js r138 UMD + DRACOLoader for the 3D GameBoy (CDN)
- GSAP 3.12.7 + ScrollTrigger + Lenis 1.1.18 for the project overlay (CDN) — loaded on grid AND home
- Google Fonts: Inter (body), Instrument Sans (display), Press Start 2P (GameBoy canvas)
- Remixicon for icons (async loaded)
- Web3Forms for contact submissions
- Google Analytics GA4: `G-RXZ65KVMCQ`
- JSON-LD `@graph`: `WebSite` + `Person` on homepage (for Google sitelinks)

## Pages
| Page | HTML | CSS | JS |
|------|------|-----|-----|
| Home | `index.html` | `home.css` + `overlay.css` | `projects.js` + `overlay.js` + `home.js` |
| Grid | `grid.html` | `style.css` + `overlay.css` | `projects.js` + `overlay.js` + `script.js` |
| About | `about.html` | `about.css` | `gameboy.js` |

All 3 pages also load `tokens.css`, `bar.css`, `footer.css` (home + grid), and the bottom nav bar.

## Shared modules (CRITICAL)
- **`projects.js`** — single source of truth for all project data. IIFE, exposes `window.projects`, `window.gridItems`, `window.COLOR_HEX`, `window.IMG`. 21 projects, 225 grid items. Don't duplicate this data anywhere else.
- **`overlay.js`** — project-detail overlay (slide-up), lightbox, mobile project list, scroll-lock system, Lenis parallax setup. Injects `#overlay`, `#lightbox`, `#mobileProjList` DOM into `<body>` if not present. Exposes `window.openProject(id)`, `window.closeOverlay()`, `window.openLightbox(idx)`, `window.setLightboxItems(items, isLab)`.
- **`overlay.css`** — all overlay + lightbox + mobile-list styles, plus the `html:has(body.scroll-locked) { overflow: hidden !important }` trick.

Both home and grid open the same native slide-up overlay (was an iframe earlier — **iframe architecture is gone**; don't reintroduce it).

## Design system

### Color tokens (`tokens.css`)
- Light theme (home + grid): white bg, near-black text, grayscale borders
- Dark theme (about, via `.theme-dark` on `<body>`): `#0a0a0a` bg, light-gray text
- Accent: `#0066ff` (light), `#0a2fff` (dark)
- Surface (glass cards): `rgba(255,255,255,0.6)` light / `rgba(255,255,255,0.06)` dark
- Always reference tokens via `var(--color-*)`. Don't hardcode colors unless inside gameboy.js canvas (which has its own palette system).

### Typography
- `--font-body: 'Inter'` — UI, buttons, paragraphs
- `--font-display: 'Instrument Sans'` — headings, hero CTA, info-tag project names
- `--font-pixel: 'Press Start 2P'` — GameBoy canvas ONLY
- Size scale: `--text-xs`, `sm`, `base`, `md`, `lg`, `xl` (clamp), `2xl` (clamp)

### Spacing / radii / shadows
- Space scale: `--space-xs` (4) → `--space-4xl` (80), 8-unit-ish rhythm
- Radii: `sm` (6) / `md` (8) / `lg` (12) / `xl` (16) / `pill` (999)
- Shadows: `sm` / `md` / `lg` — `--shadow-md` is dark-theme-aware
- `--blur` = `blur(20px) saturate(1.4)` for glassmorphic surfaces

### Motion
- `--ease-out` — default smooth, `cubic-bezier(0.16,1,0.3,1)`
- `--ease-smooth` — UI transitions, `(0.32,0.72,0,1)`
- `--ease-bounce` — buttons, pills, cart insert, `(0.34,1.56,0.64,1)`
- Durations: `fast` 0.2s / `normal` 0.3s / `slow` 0.5s

### Component patterns
- **Glass pills / cards**: `background: var(--color-surface); backdrop-filter: var(--blur); border: 1px solid var(--color-border); border-radius: var(--radius-pill);` + `-webkit-backdrop-filter` always mirrored.
- **Project info pill** (home hero): `rgba(0,0,0,0.55)` + `blur(14px) saturate(140%)`, white text, 16px radius. Thumb sized by JS (`syncInfoTagThumbs`) to match text column height.
- **Lightbox, overlay**: full-screen `position: fixed; top: 0/100%` slide, `0.5s cubic-bezier(0.16,1,0.3,1)`.
- **Bar dropdowns**: white bg, `rgba(0,0,0,0.06)` border, soft shadow, `translateX(-50%)` centered.

## File conventions
- Images: `Images/<Project>/<file>.webp` — mobile versions in `Images/mobile/` (300px wide)
- Video thumbnails: `<name>_thumb.webp` alongside `.webm`
- Tool icons: `Images/tools/` — real software logos (SVG/PNG)
- GameBoy assets: `gameboy/` — Draco GLTF + WebP textures + .bin buffers + photos + `clicks.ogg` (N64 button samples, 16 slices)
- Every asset referenced in code MUST exist. Broken refs are a deploy bug — run the link sweep (see Gotchas).

## Key architecture per page

### Home (`home.js`) — particle cover
The home page was rebuilt around a single full-viewport particle field.
The old "hero carousel + scroll showcase" architecture is gone; don't
reintroduce it.

**Layout**
- `<div.cover-wrap>` (`position: relative`, height 220dvh) wraps a
  `<section.cover>` that's `position: sticky; top:0; height:100dvh; z-index:550`.
  The wrap height minus the cover height = locked-scroll budget. Sticky
  releases automatically once the wrap is fully scrolled past, then the
  footer comes into view in normal block flow below.
- Cover z-index 550 sits ABOVE the footer (z 500) so the footer can't
  paint over the cover during the sticky window. Floating-nav (z 600)
  and Services pin (z 650) stay above the cover.
- Footer is a regular relative block (no slide-in animation, no
  `position: fixed`). Same markup across home / grid / lab.

**Renderer** — WebGL2 with Canvas2D fallback
- Probe `WEBGL_debug_renderer_info` at startup. If the unmasked renderer
  is software-rasterized (SwiftShader / llvmpipe / Microsoft Basic /
  ANGLE Software / Apple Software), bail to the 2D path — software
  WebGL is *slower* than the optimised SoA Canvas2D loop.
- WebGL mode adds a sibling `<canvas.cover-media-overlay>` for
  constellation lines, coordinate labels, and service tags (still 2D
  for crisp text).
- Single VBO with interleaved `{x, y, size, alpha}` per particle.
  Vertex shader maps screen-px → clip space + `gl_PointSize`. Fragment
  shader writes solid white × alpha. Standard alpha blending.
- Invisible particles get `size = 0` so the GPU early-discards them.
- `desynchronized: true` is OFF — caused stutter on Windows ANGLE / G-Sync setups.
- `localStorage.setItem('cover-no-webgl', '1')` forces the 2D path for debugging.

**Particle storage** — full SoA (Struct-of-Arrays)
- 38 typed arrays (Float32 + Uint8) for every per-particle field:
  `pX/Y/Z, pSx/Sy/Depth, pLife/MaxLife/FadeRate/TravelR, pLifeFade/AlphaMul/AlphaPh, pPushSx/Sy/VX/VY, pStiff, pCommit, pEmitter/EmitPh/EmitFq, pFluttFq/Sd/Am, pSwpDel/Dur/CX/CY/CZ/Bur/Spn, pRelDel/Dur, pJigSd/Am, pMorphCm, pRepelF, pFat`.
- `COUNT = IS_MOBILE ? 2000 : 38000` (hard cap). Hot loops iterate
  `activeCount ≤ COUNT` so the FPS throttle below can shrink the
  effective swarm without re-allocating.
- `particles = { length: COUNT }` is a stub kept only so legacy
  `particles.length` reads still resolve.

**Auto FPS throttle**
- 60-frame rolling FPS window. If avg < 45fps for 2s, halves
  `activeCount` (logged to console). Floor matches the prior build's
  count (11k desktop / 1.5k mobile) so worst-case behaviour matches the
  pre-bump baseline. Once-only — never grows back.

**Hot loop** — runs every frame on `activeCount` particles
1. Curl-noise sample at `(pX, pY, pZ) * NOISE_SCALE`. `curl()` writes
   into a shared `Float32Array(3)` `_curlOut` instead of allocating
   per call (saves ~420k allocations/sec at 38k×60fps).
2. Optional preset forces (swirl, radial, jitter, wind, ambient
   wind/swirl breath when no preset wind is set).
3. Lifetime + recycle (calls `spawnInside(i)` if dist² > travelR² OR life ≥ maxLife).
4. Fade-in (life-based) + age fade (last 30% of maxLife).
5. Camera transform → flow screen position (`flowSx/Sy`, perspective `fpersp`).
6. Morph blend (see Morph system below).
7. Spring-physics mouse repulsion + sculpt anchor force (AABB-culled).
8. NaN guard, write final `pSx/Sy/Depth`.

**Constellation links**
- 250 anchor particles (80 on mobile) get faint 1px white lines (alpha 0.07) to nearest 2 in-range neighbors.
- Spatial hash uses **typed-array counting-sort bins** (`_binCount`,
  `_binStart`, `_binData`, `_anchorCells`) — zero per-frame allocations.
- Skipped while `mp ≥ 0.4` (a morph is strongly committed) — lines
  would tangle between word particles.

**Morph system**
- `setMorphTarget(spec)` accepts:
  - `string` — a word, rasterised via `rasterizeWord(word, scale=1)` (UnifrakturMaguntia black-letter).
  - `{ word, scale }` — same as above with custom scale (greetings use 1.7×).
  - `{ shape: 'tree' | 'room' | 'torus' | 'portrait' }` — procedural shape generators (cube/portrait branches still in code; cube is reachable via `__coverShape('cube')` but no current caller).
  - `null` — release.
- `morph` state: `progress`, `targetProgress`, `points`, `prevPoints`,
  `swap`, `text`, `peakMp`, `rotating`, `basePoints3D`, `rotateMode`
  ('tumble' or 'yaw' for room), `colorStrings` (legacy unused), and
  flags `fast` (typewriter), `straight` (text/scroll/greet — straight lerp), `greet`, `scroll`.
- Per-particle bezier swap path (with control point + spin + radial puff) only fires for `!fastSwap` (i.e. shape morphs). For text/greet/scroll morphs the bezier is replaced by a linear lerp in the inner loop — saves ~25 multiplies plus sin/cos/sqrt per particle in the dominant path.
- `rasterizeWord` uses font stack `"UnifrakturMaguntia", "Times New Roman", serif` at 230px (auto-shrinks to fit) with 8% letter-tracking. Output samples scale to world coords `(±1.05 × scale, ±0.52 × scale)`.

**Idle greetings** (`maybeGreet`)
- Pool: `['hello','hej','ahoj','bok','ciao','moin','aloha','salut','howdy','welcome','hi']`.
- First fires ~5s after load; subsequent 12-30s apart. 4s hold per word.
- Rendered at 1.7× world scale via `setMorphTarget({word, scale:1.7})`.
- Slow Lissajous float on screen target while held (~42px X / ~26px Y, periods 16s & 22s, constant amplitude — NOT scaled by progress so the word doesn't visibly shrink as it fades).
- Commit holds flat at 0.65 (no shimmer / oscillation).
- Greet release uses LINEAR commit decay over 4.5s (not exponential lerp) so disintegration reads as uniform glide, not "fast then drag".
- Per-particle release window + sinusoidal jiggle skipped for greet/scroll modes (those used to snap on partial-peak releases).

**Scroll-driven word phases**
- `SCROLL_PHASES = [{word:'projects', href:'grid.html', start:0, end:0.5}, {word:'about', href:'about.html', start:0.5, end:1}]`.
- Word activity zone covers 200dvh of scroll (`recomputeScrollProgress` divides by `2 × innerHeight`). Sticky budget of 220dvh in CSS leaves a 20dvh tail of empty cover before unstick.
- `commitFromScroll(p)`: ramps 0→1 over the first 15% of scroll, then HOLDS at 1. Word switches at the 50% boundary use the morph snapshot blend; commit stays at 1 across the boundary so no dip back to noise.
- Scroll-mode lerp: 0.18 going up (commit tracks scroll responsively), 0.05 going down (slow glide back to noise). Linear decay on full release.
- Click anywhere on cover when `commit > 0.4` navigates to the active phase's `href` (capture-phase document listener; skips real `<a>/<button>/<input>` targets).

**Sculpt-with-decay** (left-drag)
- Each ≥14px of cursor travel emits a sculpt SEGMENT `{x1,y1,x2,y2,minX,maxX,minY,maxY,life,maxLife}`. AABB cached at creation.
- Each segment pulls particles toward the closest point on its line with a soft-quad falloff. Life ticks down over 6s; once ≤0 the segment is swap-popped from `sculptAnchors`.
- Hard cap of 80 active segments. AABB pre-check rejects 90%+ of inner work.
- Plain click (no movement) leaves no anchor. The old shockwave-on-click is gone.

**Mobile gyroscope**
- `deviceorientation` events drive `cam.gyroYaw/Pitch`. iOS 13+ permission gate fires on first `touchend`. First reading captured as rest pose; deltas clamped + lerped each frame. Auto-orbit suspends when gyro is active.

**Right-mouse drag**
- Rotates any active 3D shape (torus / room / portrait / tree) on both axes. Auto-rotation pauses while held; manual offsets stack so the swarm never snaps. `contextmenu` event suppressed over the canvas while a shape is mounted.

**Recent-card** (bottom-right)
- Slide-track of 4 swappable project cards, ~7s auto-cycle. Hover (or first tap on touch) expands to full preview with body video; second tap on touch opens the project overlay. Hides via `body.footer-visible`.

**Floating nav** (top-left, top-right Services)
- Wordmark + 5 nav links + Services pin. All `position:fixed`, z-index 600+ so they stay above the sticky cover (550) and footer (500).
- Services pin opens a click-toggle dropdown (NOT hover anymore). Dropdown content right-aligned, with terminal-style typewriter header, item cascade, and per-service inline color swatches. Hovering an item triggers a flow preset OR a 3D shape morph + animates the cover swarm. Selecting a service opens a side panel listing the related project archive (typewriter cascade).

### Grid / Index (`grid.html`, `script.js`, `style.css`)
- 225 `gridItems` (built from `window.projects`), shuffled on load. Black background.
- Lazy-loaded via IntersectionObserver, `data-src` pattern.
- Hover videos — load `preload=metadata`, play on hover, pause on leave. Wrapped in `.hover-video-wrap` for rounded corners.
- Lab items: letter-case scramble on hover (setInterval 250ms, cleared on leave).
- `#project=X` URL hash auto-opens that project on load.
- List view vs grid view — `.grid-item.hidden { display: none !important }` (specificity workaround for `display: grid` on list-view parent).

**Control panel** (`<aside.control-panel>` top-right, replaces the old bottom bar + mobile slider + floating layout-toggle)
- Single fixed mono-styled panel with corner ticks, green pulse status dot, dashed dividers.
- Sections (top → bottom): LAYOUT (grid / list icon toggle), COLS (slider with 8 tick dots, auto-hides in list view), FILTERS (Project / Color / Type / Year — Color is **inline swatches**, the others open dropdowns BELOW the trigger button right-aligned), SORT (Newest / Oldest / Random), SEARCH (mono input, `>` prompt, blinking cursor, ✕ clear).
- `data-menu` attributes mirror the legacy bar IDs (`menu-project`, `menu-color`, `menu-category`, `menu-year`) so existing `applyFilters()` wiring still works.
- Color filter has both an inline `#cpSwatches` swatch row AND a hidden `#menu-color` dropdown twin — the twin's buttons are the active-state tracker that `applyFilters` already iterates.
- Search shortcut: `/` or `Ctrl/Cmd-K` focuses the input. Debounced 80ms.
- Sort reorders `gridEl` children in place (DocumentFragment swap).
- `is-collapsed` morphs the panel down into the top-right corner via `clip-path: inset(...)` + scale, with a `.cp-handle` "CTRL" pill that scales/fades in from the same corner. Reverse on expand.
- The bottom bar / mobile slider / floating layout-toggle markup is GONE; their CSS lingers in `bar.css` + `style.css` as no-ops since elements don't exist.
- `bar.css` is no longer loaded on grid.html.

### About (`about.html`, `gameboy.js`, `about.css`) — biggest piece

**Boot loader** (`<div.boot-loader>`, top of `<body>`)
- Full-screen techy splash that hides the page until the GameBoy 3D
  model + textures finish loading. No card chrome (transparent
  background): mono terminal-style rows centered over the dark page.
- Rows: pulse dot + `SYS_INIT · v0.4` header with hex `0×NNNN` scrubber, animated step text (`> bootstrapping…` etc), white progress bar with 10 tick marks, `nnn / 100 PCT_LOADED` meter, 6-row task list (`cart_data, ram_alloc, model.glb, textures, audio.opus, boot_ok`) cycling `[ ]` → `[~]` → `[x]`.
- Driver script (inline at the bottom of `about.html`) eases progress smoothly toward a 90% soft cap; jumps to 100% on the `gameboyready` window event (or after a 9s safety timeout).
- `gameboy.js` dispatches `window.dispatchEvent(new CustomEvent('gameboyready'))` the moment the model + every body texture resolves and `model.visible` flips on (right after the texture `Promise.all`).
- On finish: loader gets `is-done` (fade), `body.is-booted` is set (so `.about-page` fades in via CSS), then loader is removed from DOM after the fade transition.

**GameBoy 3D scene** — the rest of about.html (everything below) is unchanged from the previous build. IIFE wrapping everything, exposes `window.gbSelectCartridge` and `window.gbEjectCartridge`.

**Cartridges (4)** — each has `label`, `header`, `menuItems`, `autoStart`:
- **Portfolio** — menu: ABOUT ME, STATS, LOADOUT, ALLIES, TROPHIES, PING ME, QUESTS, **OPTIONS**
- **Snake / Breakout / Frogger** — menu: PLAY, HIGH SCORES, SOUND TEST, CHEATS, ERASE SAVE (games don't auto-start — land on cart menu first)

**OPTIONS submenu** (portfolio-only, 9 options, rendered as `screen === 'optView'`):
1. PALETTE — 6 themes (DMG/Pocket/Color/Berry/Grape/Dark), swaps `C.bg/ink/dark/light` colors
2. CONTRAST — 0–9 slider, drives screen emissiveIntensity via `contrastFactor()`
3. SOUND — mute toggle (gates `playTone`)
4. BATTERY — fake drain icon, 2.5%/min, low-battery blink below 15%
5. LINK CABLE — searching animation, always fails ("NO PARTNER FOUND")
6. CREDITS — auto-scrolling retro credits
7. DIP SWITCHES — 4 arcade-style toggles
8. SERIAL NO. — fake GB model + SHARP LR35902 CPU
9. DEV MODE — live FPS, uptime, fake hex dump

**Game cart options** (reached from PLAY menu):
- HIGH SCORES, SOUND TEST (9 tracks), CHEATS (Konami code: ↑↑↓↓←→←→), ERASE SAVE

**Boot animations** (per cart):
- Portfolio — CRT photo reveal of Luka's photo, 5 phases (power-on band → scan reveal with chunky/mid/crisp zones → CRT + TFT RGB subpixel overlay → title + loading bar). Photo cached at 2 pixel densities in `gb.userData._portBootCache`.
- Snake — scary pit-viper head lunges forward, mouth opens, fangs + forked tongue, red strike flash
- Breakout — brick wall building + arcade coin sound
- Frogger — water ripples + frog hopping + ribbit chirps

**Screen rendering**:
- Canvas is 320×288, `flipY: true` texture
- Vertical flip: `ctx.translate(0, h); ctx.scale(1, -1)` at start of `drawScreen()`
- `screenTex.needsUpdate = true` at end
- Palette: `C = { bg, ink, dark, light }` — mutated by PALETTE option
- Font: `'Press Start 2P'` only

**Power LED** — real-Nintendo-authentic:
- Solid red when cart inserted (no flashing)
- Slowly dims over 3 min idle from 1.0 → 0.45 (fake battery drain)
- When off: faint red tint (`0x992020` + emissive `0x330000` at 0.25) — not pure black
- `setLedActive()` / `setLedInactive()` helpers

**Screen sleep**:
- 8s idle → screen dims (not on `insert` or `optView`)
- 13s idle → DVD screensaver (not on `insert` or `optView`)
- Any button/raycast/cart action wakes via `wakeScreen()`

**N64 click samples** (one shared opus file):
- `gameboy/clicks.ogg` — 37KB, 16 hardcoded `CLICK_STARTS` covering press/release snippets
- `playClick()` picks a random slice (160ms) with pitch variation 0.92–1.10×
- Plays ONLY for physical raycast clicks (`pressButton(action, fromPhysical)` — keyboard/wheel/HTML-panel set `fromPhysical=false`)

**Raycast interactions**:
- Buttons: A, B, joystick (4-way hit zones), reset (→ 'a'), power (→ 'b')
- Cart: invisible slotHit (insert) + ejectHit (eject) placed at model back
- Eject is gated: only when `gb.rotation.y` is within `π × 0.6–1.4` (user must view from back)
- `pressButton(action, fromPhysical = true)` routes to state machine

**HTML cart picker** (right panel, `about.html`):
- 4 cart buttons with emoji icons + labels
- `gbSelectCartridge(id)` triggers insert animation, `gbEjectCartridge()` ejects
- `cartBusy` flag + `htmlFlowOwned` flag prevent click spam during animation (1s eject lockout, 3.5s insert)
- `.pulse-hint` class on Portfolio button fades in attention glow on first load, cleared on first interaction
- Hover over inserted cart: swaps icon+label to eject glyph + "Eject" via absolute overlay (button width stays fixed)

**Visibility + perf**:
- IntersectionObserver pauses RAF loop when GB is off-screen
- `document.hidden` pauses RAF when tab backgrounded
- `scheduleFrame` / `wakeUp` gate the render loop — drops to 0fps when hidden

**Lighting**: cinematic teal + orange. Key (amber) top-right, fill (teal) left, dual rim lights. Procedural env cubemap (128px gradient sphere).

**Textures** — all body/glass textures loaded via `Promise.all` before revealing the model. `model.visible = false` until every texture resolves → no staggered mesh pop-in.

## iOS Safari quirks (battle-tested — don't refactor)
- **Scroll lock** — nested counter (`scrollLockCount`), `position: fixed` + `top: -scrollY` + `overflow: hidden` on body + html, `scroll-locked` class on body with `touch-action: none` on `.grid` / `.scroll-container` / `.site-footer`. Touchmove listener walks DOM for scrollable parents, blocks at boundaries. `pageshow` listener clears stale state (bfcache restores). `scrollTo({ behavior: 'instant' })` on unlock prevents visible jump.
- **Viewport units** — `100dvh` for the hero carousel (tracks Safari chrome), `100svh` for sticky layers like `.title-layer` / `.home-cta` (stable across chrome collapse, no mid-scroll jump). **Don't swap these** — each is load-bearing per comment.
- **`scrollbar-gutter: stable`** on `html` in home.css — reserves scrollbar space so locking body scroll when the overlay opens doesn't shift the page sideways.
- **`-webkit-` prefixes** — keep them on `backdrop-filter`, `overflow-scrolling`, `user-select`, `touch-callout`, `mask-image`. Needed on iOS.
- **Safari Advanced Privacy Protection** — strips unfamiliar `?query` params from iframe URLs. (Moot now — no iframes.)
- **Mobile contact form** — fullscreen below 768px (no rounded corners, max-height 100dvh).

## Common gotchas
- **NEVER delete user files** without confirmation. `rm` bypasses Recycle Bin on Windows.
- **Browser caching**: bump `?v=N` on `gameboy.js` script tag when changing code (because Three.js + asset load costs make cache busting essential).
- **Three.js r138 UMD**: no ES modules. Everything on `THREE.*` global. DRACOLoader decoder path MUST point to CDN before `GLTFLoader.load()`.
- **Canvas texture `flipY`**: GLTF UVs expect `flipY=false`, canvas screen needs `flipY=true`. Mismatch = upside-down render.
- **Glass transparency**: `transparent: true; depthWrite: false` on material.
- **EffectComposer + `alpha:true`** BREAKS lighting — don't use postprocessing with alpha renderer.
- **Mobile double-tap** — only fire click via raycast if `e.pointerType === 'mouse'` OR on `touchend`.
- **Cart insert slot** — must be recreated after programmatic eject (see `gbEjectCartridge`).
- **`midX` / `midY`** in gameboy.js — declared inside `screen === 'boot'` block AND inside `optView` block separately. If adding a new screen state, declare locally — they're not module-scoped.
- **`.scatter-img.hero-scatter img` specificity** — beats `.hero-info-tag .hero-info-thumb`. Use `.scatter-img.hero-scatter .hero-info-tag img.hero-info-thumb` for thumb rules.
- **CSS aspect-ratio + flex stretch + `width: auto`** creates a circular dependency. For the info-pill thumb we bailed on pure CSS and use JS (`syncInfoTagThumbs`) to measure text column height + set thumb size.
- **Template literal paths** (``` `${IMG}/... ``` ) — grep for broken links must resolve these:
  ```bash
  grep -ohE '\$\{IMG\}/[^`"]+\.(webp|webm|mp4|jpg|png|svg)' projects.js home.js gameboy.js
  ```
- **`window.projects` is read-only** from JS consumers — `projects.js` wraps its data in an IIFE. Don't try to mutate.
- **`home.js` local `projects` array** ≠ `window.projects`. They're intentionally separate (home has custom hero/floats).
- **Claude trace in credits** — "CLAUDE CODE" appears in GameBoy CREDITS scroll (OPTIONS → CREDITS). User is aware and fine with it.

## Accessibility notes
- Every `<img>` has an `alt` attribute (empty string `""` for decorative — scroll-showcase media, pill thumbs, lightbox viewer). Descriptive alt on hero carousel slides, grid items, tool icons, project filter thumbs.
- Keyboard nav works for GameBoy (arrows + Enter/Escape + z/x), overlay close (Escape), lightbox arrows.
- Contact form has `required` attributes + focusable inputs.
- Not yet: full aria-labels on icon-only buttons. Worth auditing before a big launch.

## Git workflow
- **User says "push"** = commit all + push to main. No questions.
- Never amend commits — always create new.
- Commit messages: short, descriptive, include `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- Never push unless explicitly told to.
- Never force-push, never `--no-verify` hooks.
- Destructive ops (reset --hard, branch -D, clean -f) require explicit user consent.

## Asset optimization checklist
1. Images: 4096 source → 1024px WebP at quality 85
2. Videos: MP4 → WebM (VP9, CRF 30 for near-lossless, CRF 38 for aggressive), 1080p max. Generate `_thumb.webp` first frame.
3. Mobile: create 300px WebP in `Images/mobile/`
4. GLTF: Draco compression via gltf-transform CLI (the GameBoy went 9.9MB → 230KB)
5. ALWAYS keep source files — never delete originals

## Pre-launch checklist
- [x] Every `<img>` has alt attribute
- [x] All 233 image refs in code resolve (broken-link sweep passes)
- [x] Sitemap.xml lists `/`, `/grid.html`, `/about.html`
- [x] JSON-LD `@graph` with WebSite + Person on homepage (sitelinks signal)
- [x] OG image + meta per page
- [x] 100dvh / 100svh / scrollbar-gutter configured
- [x] Mobile fullscreen contact form
- [x] GameBoy Safari Advanced Privacy Protection friendly (no iframe URL params)
- [ ] Submit sitemap to Google Search Console (manual user step)
- [ ] OG preview test (opengraph.xyz)
- [ ] Real iOS Safari test (not devtools emulation)
- [ ] Send test message through contact form → confirm Web3Forms delivery

## Recent architectural changes (latest session)
**Home cover — particle field rebuild**
- Old hero-carousel + scroll-showcase architecture is GONE. Home is a
  full-viewport WebGL2 particle field driven by SoA typed arrays.
  See `Home (home.js)` section above for the full architecture.
- Big systems: WebGL2 renderer with SwiftShader-aware fallback, FPS
  auto-throttle, curl-noise flow with optional preset forces (swirl /
  radial / wind / jitter), constellation lines via typed-array spatial
  hash, sculpt-with-decay segments, mobile gyroscope, right-mouse
  shape rotation, idle blackletter greetings, scroll-driven
  `projects → about → footer` word phases with click-to-navigate.
- Cover layout: `cover-wrap` 220dvh wraps a sticky 100dvh `cover` so
  the user has 120dvh of locked scroll for word morphs before the
  cover unsticks and the footer comes up in normal flow. Footer is
  no longer fixed/translated — it's a regular block.
- Font for word morphs: `UnifrakturMaguntia` (medieval blackletter).
  Greetings render at 1.7× scale; scroll/text morphs at 1.0×.
- Per-frame budget: SoA + bezier-fast-path + counting-sort
  constellation + zero-alloc curl noise = the whole hot loop is
  allocation-free.

**Index control panel rebuild**
- Bottom bar / mobile slider / floating layout-toggle removed.
  Replaced with a single fixed `<aside.control-panel>` top-right with
  layout toggle, columns slider, filters (Project/Color/Type/Year),
  sort (Newest/Oldest/Random), search (`/` and `Ctrl-K` shortcuts),
  inline color swatches, and a `clip-path` collapse-to-handle morph.

**About boot loader**
- Full-screen techy splash with progress bar + task list + hex
  scrubber. Hides the page until `gameboyready` fires (or 9s timeout).

**Other**
- `floating-nav.css` — fixed duplicate z-index on `.floating-nav`
  (was 600 then 100, second won → nav was hidden under the cover).
- `home.js` particle audit: removed dead `generateCubePoints` / cube
  branch + the GLB skull loader; lazily build `portraitPoints`; inline
  linear-lerp for fastSwap morphs; skip constellation while morph
  commit is high; AABB cull on sculpt segments; `Math.hypot` →
  inline `sqrt(x²+y²)`.
- **JSON-LD WebSite + SearchAction** for Google sitelinks.
