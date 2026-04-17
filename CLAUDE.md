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

### Home (`home.js`)
- **Hero carousel** — 3 hardcoded Grounded videos (`IG_story_02`, `Grounded_2023_01`, `card_holo`), NOT derived from shared projects. Each slide preloaded (`preload="auto"`), autoplay muted loop. Live finger-following drag with axis lock (h/v), velocity snap, rubber-band at edges. Auto-advance 7s. Pauses on tab background (`visibilitychange`).
- **Local `projects` array** — 12 projects with hand-picked `hero` + `floats` per project. Do NOT regenerate from `window.projects`; the custom selections are intentional (e.g. `gr2025cover.webp` hero, `IG_story_01.webm`/`IG_story_03.webm` floats for Grounded 2025). Sort by year, splice(5) = top 5 most recent shown.
- **Scroll showcase** — each project block = sticky `.title-layer` (big name) + `.image-layer` with sticky `.hero-scatter` + flowing `.side-scatter` images.
- **Info pill** (`.hero-info-tag`) — absolute bottom-left of hero. Contains square thumb + year + project name + "View project →". Thumb height = text column height via `syncInfoTagThumbs` + fontsReady + resize listener. Fades in when `titleProgress > 0.6` (title mostly covered).
- **Hero scale-on-scroll** — hero scatter scales `0.82 → 1.0` across block travel (desktop only; mobile path skips `updateParallax`).
- **Floats capped at 3** — `proj.floats.slice(0, 3)`. Taller media gets `.side-scatter-tall` via JS on load (aspect-ratio check), CSS crops to 1:1.
- **Image layer** — `padding: 40vh 24px 0; background: transparent` — gives big title breathing room and lets sticky title show through gaps.
- **Bottom bar** hides below 30px scroll (`onCarousel`), slides up from 180% translateY.
- **Click handler** — `imageLayer.addEventListener('click', () => window.openProject(proj.id))`. Uses shared overlay.
- **Smooth scroll physics** (desktop) — RAF loop with FRICTION 0.92, LERP 0.08, self-stops when idle.
- **Watermark letters** rotate on scroll delta via shared `rotateWatermarkLetters` helper (desktop + mobile paths).

### Grid (`script.js`)
- 225 `gridItems` (built from `window.projects`), shuffled on load.
- Lazy-loaded via IntersectionObserver, `data-src` pattern.
- Hover videos — load `preload=metadata`, play on hover, pause on leave. Wrapped in `.hover-video-wrap` for rounded corners.
- Lab items: letter-case scramble on hover (setInterval 250ms, cleared on leave).
- Filters: project / color / category / year. Reset button. URL-independent state.
- Floating title pill with SVG stroke-dashoffset scroll progress ring when scrolling past header.
- `#project=X` URL hash auto-opens that project on load.
- List view vs grid view — `.grid-item.hidden { display: none !important }` (specificity workaround for `display: grid` on list-view parent).

### About (`gameboy.js`) — biggest piece
IIFE wrapping everything, exposes `window.gbSelectCartridge` and `window.gbEjectCartridge`.

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
- **Extracted shared modules** — `projects.js` + `overlay.js` + `overlay.css`. Iframe overlay on home is GONE; home and grid share the same native slide-up overlay.
- **GameBoy OPTIONS submenu** — 9 system options under Portfolio cart; game-specific options (HIGH SCORES, SOUND TEST, CHEATS, ERASE SAVE) moved to each game cart's post-boot menu.
- **N64 click samples** — `clicks.ogg`, random slice per raycast button press, pitch-varied. Keyboard/scroll/HTML-panel navigation is silent.
- **Translucent LED** — MeshPhysicalMaterial with `transmission: 1.0`, slow Nintendo-style dim over idle, faint red tint when off.
- **CRT photo portfolio boot** — Luka's photo scan-reveals with TFT RGB subpixel overlay.
- **Scary snake boot** — pit-viper head with fangs + tongue + red strike.
- **Home info pill + hero scale-on-scroll + side-scatter-tall crop + 40vh breathing room** — see Home section.
- **Texture preloading** — gameboy model hidden until all textures resolve.
- **Portfolio button pulse hint** on first load of about page, cleared on first interaction.
- **Hero carousel** — 3 hardcoded Grounded videos (was 5 derived), drag follows finger live, 100dvh carousel.
- **JSON-LD WebSite + SearchAction** for Google sitelinks.
