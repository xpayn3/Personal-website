# Quirks & Edge Cases — Luka Grčar Portfolio

The things that took longest to figure out. Check here first before refactoring anything.

## iOS Safari

### `100vh` vs `100dvh` vs `100svh`
- `100vh` — LVH, assumes chrome collapsed (grows beyond visible area when chrome showing)
- `100dvh` — DYNAMIC, changes as chrome collapses → causes layout shifts when used on sticky elements
- `100svh` — SMALL, stable, always smallest possible viewport

**Where each is used (load-bearing, don't swap):**
- `.hero-carousel` — `100dvh` (so it tracks chrome, no white band below when chrome toggles)
- `.title-layer` (sticky) — `100svh` (stable, no mid-scroll jumps when chrome hides)
- `.home-cta` — `100svh`
- `.overlay` — `100dvh`
- `#homeProjFrame` — gone (iframe architecture removed)

### Scroll lock
Copy-paste-safe pattern in `overlay.js`:
```js
lockScroll() {
  savedScrollY = window.scrollY;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.width = '100%';
  document.body.classList.add('scroll-locked');
}
unlockScroll() {
  document.body.style.cssText = '';  // atomic clear
  window.scrollTo({ top: savedScrollY, behavior: 'instant' });
}
```
- Uses nested `scrollLockCount` counter — critical, overlay + lightbox can nest.
- `body.scroll-locked .grid { touch-action: none !important }` — blocks rubber-band scroll-through on iOS.
- `html:has(body.scroll-locked) { overflow: hidden !important }` — backup for edge cases.
- `touchmove` listener walks DOM for scrollable parent, blocks at boundaries.
- `pageshow` listener clears stale state — bfcache can restore a locked page.

### Safari Advanced Privacy Protection (formerly ITP)
- **Strips unfamiliar `?query` params** from iframe URLs → triggered the "may not display correctly" warning when we used `iframe.src = grid.html?embed=1&project=X`.
- Fix was to use `#hash` fragments, which Safari never strips. Moot now — we dropped iframes entirely.

### `scrollbar-gutter: stable`
- On `html` in `home.css`. Reserves the scrollbar gutter always so locking body scroll (when opening the project overlay) doesn't shift the page sideways.

### `touch-action`
- `.hero-carousel` has `touch-action: pan-y` — browser handles vertical scroll, JS owns horizontal (so swiping the carousel doesn't also scroll the page).
- Combined with **non-passive `touchmove`** listener that calls `e.preventDefault()` when horizontal axis locks. If passive, we can't prevent scroll.

### `-webkit-` prefixes
Keep them. Each is a specific Safari quirk:
- `-webkit-backdrop-filter` — iOS needs prefix even on recent versions
- `-webkit-overflow-scrolling: touch` — enables momentum scrolling
- `-webkit-user-select` — overriding blue highlight
- `-webkit-touch-callout` — blocks long-press menu
- `-webkit-mask-image` — needed on iOS Safari

### Mobile double-tap / click
- Use `pointerup` for mouse, `touchend` for touch. Mixing fires twice.
- In `gameboy.js` raycaster: `if (e.pointerType === 'mouse') { ... }` gate.

### iOS autoplay
- Hero carousel videos: `muted + playsInline + autoplay` attributes, and a `pointerdown` listener that re-calls `.play()` on first interaction (iOS sometimes blocks until gesture).

### Fullscreen mobile contact form
Below 768px: form takes full viewport (no rounded corners, max-height `100dvh`, no gap). Scrolling inside form body works via `overflow-y: auto`.

## GameBoy quirks

### Canvas texture flip
- GLTF UVs expect `flipY: false`
- Canvas screen texture needs `flipY: true`
- Mismatch = text/content upside down
- Inside `drawScreen()`, we counter-flip: `ctx.translate(0, h); ctx.scale(1, -1)`. All drawing coords are then "logical" (y grows upward in canvas space). Weird but it works.

### Three.js r138 UMD
- No ES modules. `THREE.*` global.
- DRACOLoader decoder path MUST be set BEFORE `GLTFLoader.load()`:
```js
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.138.0/examples/js/libs/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load('gameboy/gameboy.gltf', callback);
```

### Glass transparency
On `.glass` part material: `transparent: true; depthWrite: false`. Without depthWrite off, glass writes to depth buffer and causes z-fighting with the screen underneath.

### EffectComposer + alpha renderer breaks lighting
Don't use postprocessing when renderer has `alpha: true`. Either use solid bg + EffectComposer, or alpha renderer + no composer.

### Cart insert slot recreation
When user ejects cart via HTML panel (`gbEjectCartridge`), the insert slot hit-zone must be recreated in the `interactiveObjs` array. Otherwise next programmatic insert can't find the slot. (See `overlayAnim` end callback in `gbEjectCartridge`.)

### Nudge decay (button hover tilt)
Never use `setTimeout` to reset rotation. Use an auto-decaying offset:
```js
gb.userData.nudgeX = (gb.userData.nudgeX || 0) * 0.85;  // each frame
```
Accumulated setTimeouts stack and produce visible jitter.

### `updateCartUI()` must skip `.loading` buttons
Otherwise the spinner mid-animation gets replaced by the final icon, looks janky.

### `pressButton(action, fromPhysical)` second param
Default `true`. Raycast clicks omit it (→ plays N64 click sample). Keyboard/wheel/HTML-panel pass `false` (silent).

### `midX` / `midY` scope
Declared locally inside `screen === 'boot'` block AND inside `optView` block. Each is scoped to its branch. If you add a new screen state that needs them, declare locally.

### LED colors
- Active: `0xff1a1a` color + `0xff0000` emissive at 1.0 intensity + ledGlow at 0.1
- Inactive: `0x992020` color + `0x330000` emissive at 0.25 intensity + ledGlow at 0
- Helpers: `setLedActive()` / `setLedInactive()` — always use these, don't inline.
- Slow drain: over 3 min idle, `emissiveIntensity` fades 1.0 → 0.45 (real-hardware-authentic battery drain).

### Cache-bust gameboy.js
When editing `gameboy.js`, bump `?v=N` in `about.html`'s script tag. Otherwise users see stale code due to CDN/browser cache.

### RAF visibility gating
- IntersectionObserver on `#gameboyContainer` pauses animate loop when GB off-screen
- `document.visibilitychange` pauses when tab backgrounded
- `scheduleFrame()` / `wakeUp()` → drops to 0fps when hidden, wakes instantly

### Texture preloading
Model is hidden (`visible = false`) until `Promise.all` of all body + glass textures resolves. Prevents staggered mesh pop-in.

## Home quirks

### Info pill thumb sizing
Pure CSS `aspect-ratio: 1/1 + align-self: stretch + width: auto` creates a circular dependency (pill height depends on thumb, thumb depends on pill height → runaway). Solution: JS (`syncInfoTagThumbs`) measures text column height, sets thumb `width/height` explicitly. Runs on `requestAnimationFrame(requestAnimationFrame(...))` + `document.fonts.ready` + `resize` listener.

### Hero carousel hardcoded videos
Not derived from `window.projects`. Three specific Grounded videos (`IG_story_02`, `Grounded_2023_01`, `card_holo`) picked by hand. Reel is curated, don't auto-derive.

### `home.js` local `projects` array ≠ `window.projects`
Home has hand-picked `hero` + `floats` per project (e.g. Grounded 2025's `floats` use `IG_story_01.webm` and `IG_story_03.webm`, not what projects.js has). Don't merge these.

### Floats cap at 3
`proj.floats.slice(0, 3)` in the project-block build. Some projects have 4 floats in the local array — top 3 only shown.

### Portrait media square-crop
JS adds `.side-scatter-tall` class on media `load` / `loadedmetadata` if `naturalHeight > naturalWidth * 1.05`. CSS then forces 1:1 aspect via `aspect-ratio: 1 / 1; overflow: hidden` + `object-fit: cover`.

### Hero scale-on-scroll
`bd.heroImg.style.transform = translateY(-50%) scale(${0.82 + scaleProgress * 0.18})`. Scale goes 0.82 → 1.0 across block scroll travel. Desktop only (mobile `onMobileScroll` skips it).

### Bar hides on carousel
`scrollY < 30` → `.bottom-bar.hidden` class → `translateX(-50%) translateY(180%)` + opacity 0 + pointer-events none. Slides back in as soon as user scrolls.

### Smooth scroll idle-stop
Desktop RAF loop self-stops when `Math.abs(velocity) < 0.1 && Math.abs(target - smooth) < 0.5`. Wakes on wheel event.

### Scroll sync on scroll event
When browser fires native scroll (e.g. user pressed space), `scrollVelocity < 0.5` check syncs smoothScroll → scrollY. Without this, the RAF loop fights the browser.

### Touch-action pan-y + non-passive touchmove
Explained in iOS section. This is how horizontal carousel swipe works without accidentally scrolling the page.

### Image layer 40vh padding + transparent bg
Gives the big title breathing room and lets sticky title show through gaps. Previous `background: var(--bg)` would cover the title; transparent lets the sticky element peek through as hero scatter scrolls.

## Grid quirks

### `.grid-item.hidden { display: none !important }`
Specificity workaround. `.grid.list-view .grid-item { display: grid }` (0,2,1) beats `.grid-item.hidden { display: none }` (0,2,0). Without `!important`, filtering in list-view doesn't hide items. Keep it.

### Lab item letter scramble
`setInterval` on mouseenter (250ms), cleared on mouseleave. If left uncleared, runs forever → memory leak. Don't remove the `clearInterval` in mouseleave.

### Hover video preload
`preload: 'metadata'` only. Not `auto` (too heavy for 225 items). Plays on `mouseenter` after a 150ms delay (to avoid drive-by triggers while user moves cursor across grid).

### Project overlay scroll restore on close
Scroll position is `savedScrollY` captured at open. On close, `scrollTo({ top, behavior: 'instant' })` restores. If scroll-lock double-unlocks, position is wrong — hence the nested counter.

### `#project=X` auto-open
Reads on load, delays 100ms (so grid is rendered), then calls `openProject(id)`. Lab project param isn't handled — it'd open the lab project overlay but lab uses its own layout.

## Overlay.js quirks

### GSAP / Lenis / ScrollTrigger graceful fallback
If CDN scripts fail (offline dev?), `overlay.js` checks for `typeof Lenis` etc. and silently skips parallax init. Overlay still opens + closes — just no smooth scroll inside.

### `setLightboxItems` vs `lightboxItems`
`lightboxItems` + `lbIsLab` are module-scoped inside overlay.js. Script.js (grid) needs to set them before calling `openLightbox`. Hence `window.setLightboxItems(items, isLab)` exported.

### `window.activeFilters` re-expose after reset
Grid's reset button reassigns the object (not mutates). Script.js re-exposes `window.activeFilters = activeFilters` after each reassignment so overlay.js's mobile project list always sees the current object.

## Build / deploy

### No build system
Files deploy as-is. Anything you write is what ships. No minification, no tree-shake.

### GitHub Pages caching
- Browser caches aggressively for static hosts like GH Pages. Bump `?v=N` on `gameboy.js` when editing.
- Other JS files don't have cache-bust — relies on HTML-modified → browser re-fetches. Usually fine.

### CRLF/LF warnings
Windows + Git normalize line endings. The `warning: in the working copy of 'X', LF will be replaced by CRLF` messages are benign — repo stores LF.

## Google Search Console
- Sitemap lives at `/sitemap.xml` — listed on home + grid + about.
- For sitelinks to appear on Google: submit sitemap via Search Console, verify the domain, wait 2–8 weeks, ensure consistent traffic.
- JSON-LD `@graph` with `WebSite` + `Person` + `SearchAction` is on home page.

## Claude Code attribution
- Every commit this session has `Co-Authored-By: Claude Opus 4.7 (1M context)` trailer, visible in GitHub history.
- "CLAUDE CODE" string appears in GameBoy CREDITS easter egg (OPTIONS → CREDITS). User is aware and keeping it.
- `.gitignore` includes `.claude/` — the worktrees + memory are local-only.

## Things I got wrong (lessons)
- **Agent-delegated refactors lose uncommitted work.** The worktree branches from HEAD, not the working tree. If there's uncommitted work, brief the agent to preserve specific features OR commit first. Lost the info-pill/scale-on-scroll/40vh work once to an agent that worked off HEAD.
- **CSS aspect-ratio + flex stretch traps.** When you think "align-self: stretch + aspect-ratio: 1/1 + width: auto" will work — it won't. The browser can't resolve the circular size dependency. Fall back to JS measurement.
- **`scrollbar-gutter: stable`** prevents one specific bug — scrollbar-disappears-on-overlay-open causing layout shift. Not obvious until you see it.
- **`window.scrollTo` + smooth-scroll RAF fight each other.** The scroll listener in the smooth-scroll loop syncs `smoothScroll = window.scrollY` only when velocity < 0.5. Programmatic scrolls need to wait for RAF to settle.
- **Safari `?query` stripping on iframes** was a rabbit hole. Moving to `#hash` fragments fixed it. Iframe is gone anyway now.
- **Easing formulas matter.** `1 + c1*(t-1)^3 + (t-1)^2` with `c1 = 1.2` evaluates to `0.8` at `t=0` — not 0. If you want easeOutBack, use the spec formula with `c1 = 1.70158; c3 = c1 + 1;`. We used `1 - Math.pow(1 - t, 3)` easeOutCubic for the cart slide-in — simpler and correct.
