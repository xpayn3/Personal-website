# Design System — Luka Grčar Portfolio

Quick reference for consistent styling. All values live in `tokens.css` as CSS custom properties — always reference via `var(--token)`, don't hardcode.

## Theme
Two themes selected by body class:
- **Light** (default) — home, grid. White bg, near-black text.
- **Dark** — about page, via `<body class="theme-dark">`. `#0a0a0a` bg, light text.

## Colors
```css
/* Light */
--color-bg: #ffffff;
--color-text: #111;
--color-text-dim: #666;
--color-text-muted: #999;
--color-text-faint: #aaa;
--color-accent: #0066ff;
--color-border: rgba(0,0,0,0.06);
--color-border-strong: rgba(0,0,0,0.1);
--color-hover: rgba(0,0,0,0.05);
--color-hover-strong: rgba(0,0,0,0.08);
--color-surface: rgba(255,255,255,0.6);  /* glass cards */
--color-overlay: rgba(0,0,0,0.5);

/* Dark */
--color-bg: #0a0a0a;
--color-text: #f0f0f0;
--color-text-dim: rgba(255,255,255,0.45);
--color-text-muted: rgba(255,255,255,0.3);
--color-accent: #0a2fff;
--color-surface: rgba(255,255,255,0.06);
```

## Typography

### Font stack
- `--font-body: 'Inter', sans-serif` — UI, buttons, body copy
- `--font-display: 'Instrument Sans', sans-serif` — headings, hero CTA, info-pill names
- `--font-pixel: 'Press Start 2P', monospace` — **GameBoy canvas only**

### Scale
| Token | Value |
|-------|-------|
| `--text-xs` | `0.65rem` — tiny meta, counters |
| `--text-sm` | `0.75rem` — secondary labels |
| `--text-base` | `0.9rem` — UI default |
| `--text-md` | `0.95rem` — links |
| `--text-lg` | `1.2rem` — card titles |
| `--text-xl` | `clamp(2rem, 5vw, 4rem)` — section titles |
| `--text-2xl` | `clamp(3rem, 8vw, 6rem)` — hero / project block title |

### Weight conventions
- Body: 400–500
- UI buttons: 500
- Display / titles: 700–800
- Never go below 400 on dark backgrounds (anti-aliasing gets crunchy)

## Spacing
8-ish-unit scale. Gap, padding, margin all pull from this.

| Token | Pixels |
|-------|--------|
| `--space-xs` | 4 |
| `--space-sm` | 8 |
| `--space-md` | 12 |
| `--space-lg` | 16 |
| `--space-xl` | 24 |
| `--space-2xl` | 32 |
| `--space-3xl` | 48 |
| `--space-4xl` | 80 |

## Radii
| Token | Pixels | Used for |
|-------|--------|----------|
| `--radius-sm` | 6 | Small tags |
| `--radius-md` | 8 | Thumbnails, chips |
| `--radius-lg` | 12 | Cards, modals |
| `--radius-xl` | 16 | Grid items, info pill |
| `--radius-pill` | 999 | Pills, buttons, bar dropdowns |

## Shadows
| Token | Value |
|-------|-------|
| `--shadow-sm` | `0 4px 20px rgba(0,0,0,0.06)` |
| `--shadow-md` | `0 8px 30px rgba(0,0,0,0.08)` (dark: `0 12px 40px rgba(0,0,0,0.4)`) |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,0.15)` |

Scatter images in home scroll showcase: layered `0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)` — these are hand-tuned, leave alone.

## Backdrop filter
- `--blur: blur(20px) saturate(1.4)` — default glassmorphic pill / dropdown
- `--blur-heavy: blur(24px) saturate(1.6)` — rarely used
- ALWAYS mirror with `-webkit-backdrop-filter:` on the same element

## Motion

### Easing
| Token | Curve | Use for |
|-------|-------|---------|
| `--ease-out` | `cubic-bezier(0.16,1,0.3,1)` | Default smooth — most transitions |
| `--ease-smooth` | `cubic-bezier(0.32,0.72,0,1)` | Longer UI changes, overlays |
| `--ease-bounce` | `cubic-bezier(0.34,1.56,0.64,1)` | Buttons, pills, cart insert, watermark letters |

### Duration
| Token | ms |
|-------|-----|
| `--duration-fast` | 0.2 |
| `--duration-normal` | 0.3 |
| `--duration-slow` | 0.5 |

Specific durations that matter:
- Overlay slide up/down — `0.5s ease-out`
- Lightbox swipe close threshold — 120px vertical drag
- Hero carousel — `0.45s (0.22,1,0.36,1)` snap after drag, 7s auto-advance
- Cart insert — 2.2s slide + 600ms pause + 4s boot = ~7s total
- Cart eject — 1s
- GameBoy LCD wipe — 180ms in + 60ms hold + 60ms out

## Components

### Glass pill / card
```css
background: var(--color-surface);
backdrop-filter: var(--blur);
-webkit-backdrop-filter: var(--blur);
border: 1px solid var(--color-border);
border-radius: var(--radius-pill);
padding: 10px 20px;
```

### Bottom nav bar
Fixed bottom, centered, pill-shaped, backdrop blur. Always present on every page. Dropdowns open upward, centered over their button.

### Home hero info pill (absolute in hero corner)
```css
background: rgba(0, 0, 0, 0.55);
backdrop-filter: blur(14px) saturate(140%);
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: 16px;
padding: 12px 18px 12px 12px;
```
Contains square thumb (sized by JS to match text column height) + year + name + "View project →". Fades in when hero covers the big title behind it.

### Project overlay (slide-up from bottom)
Full-screen fixed `top: 100%` → `top: 0`, `0.5s cubic-bezier(0.16,1,0.3,1)`. White sheet over a dark hero bg. Title + meta on left, thumbnail on right. Brief → description → tools → media grid → copyright. Floating title pill appears on scroll.

### Lightbox
Full-screen black bg, centered media. Counter pill (bottom center), prev/next buttons, strip thumbnails. Swipe-down-to-close on mobile. Mouse wheel navigates. Arrow keys navigate.

### GameBoy canvas UI (`gameboy.js`)
Pixel art. Press Start 2P font (never anti-aliased — `imageSmoothingEnabled = false`). 4-color palette: `C.bg`, `C.ink`, `C.dark`, `C.light`. PALETTE option swaps these (DMG green, Pocket gray, GBC Color, Berry, Grape, Dark).

## Layout rules

### Max widths
- Home hero carousel — full viewport (100vw, 100dvh)
- Home scroll-showcase hero — `max-width: 1100px`, 92% width, 16:9 aspect
- Overlay / grid — `max-width: 1800px`
- About page content — 50% split desktop, stacked mobile

### Breakpoints
- Mobile: `max-width: 768px` (single breakpoint; this site is mobile-first-ish)
- Grid columns: 5 default → JS slider can set 2–8

## Don'ts

- **Don't hardcode hex** anywhere except `gameboy.js` canvas (which has its own palette system) and the tokens file itself.
- **Don't introduce a build system**, bundler, framework, or npm dependency. The site ships files as-is.
- **Don't remove `-webkit-` prefixes** on `backdrop-filter`, `overflow-scrolling`, `user-select`, `touch-callout`, `mask-image`. Each targets a specific iOS Safari quirk.
- **Don't touch `100dvh` vs `100svh`** choices in home.css. They're load-bearing.
- **Don't change token values** without justifying — they're tuned across every page.
- **Don't add a framework font loader**. Google Fonts `<link>` is fine.
- **Don't introduce CSS-in-JS** or utility classes like Tailwind. Plain CSS + tokens.

## Adding a new component
1. Check if existing tokens cover what you need (99% of the time they do).
2. Add to the page's CSS file (`home.css` / `style.css` / `about.css`) or to `overlay.css` if it's shared.
3. Reference tokens, not raw values.
4. If you need a new token, justify it in `tokens.css` with a comment.
5. Mirror `backdrop-filter` with `-webkit-backdrop-filter`.
6. Test at mobile breakpoint (`max-width: 768px`).
