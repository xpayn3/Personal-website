/* ===================================================================
   smoke.js — home page smoke.
   A small WebGL2 fluid solver drawn on a fixed full-viewport canvas
   (#smoke) above the page content. Dragging lays down smoke that rises,
   curls and fades; it travels with the page on scroll. Elements marked
   [data-smoke] (max 2) are rasterised into the canvas so the smoke can
   dissolve them and let them reassemble.
   Falls back to 2D puff particles when WebGL2 float targets are missing.
   Open the page with ?controls to get the tuning panel.
   =================================================================== */
(() => {
  const root = document.documentElement;
  const isDark = () => root.dataset.theme === 'dark';
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---------- theme ----------
  // Light is the site default. The nav toggle flips <html data-theme> (page
  // colours live in smoke.css) and the nav's own palette (body.nav-light).
  const themeBtn = document.getElementById('themeToggle');
  function setTheme(theme) {
    root.dataset.theme = theme;
    const dark = theme === 'dark';
    document.body.classList.toggle('nav-light', !dark);
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(dark));
      themeBtn.textContent = dark ? 'Light' : 'Dark';
    }
    try { localStorage.setItem('lg-theme', theme); } catch (e) {}
  }
  try { if (localStorage.getItem('lg-theme') === 'dark') setTheme('dark'); } catch (e) {}
  if (themeBtn) themeBtn.addEventListener('click', () => setTheme(isDark() ? 'light' : 'dark'));

  // =====================================================================
  // Fluid smoke (WebGL2): a small Navier–Stokes solver. Smoke density is
  // carried by a velocity field that gets buoyancy, vorticity confinement
  // and a little ambient turbulence, then thins out and diffuses away.
  // =====================================================================
  // phones get a coarser simulation
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const TUNE = {
    simRes: COARSE ? 96 : 144,          // velocity grid, short side
    dyeRes: COARSE ? 384 : 640,          // smoke density grid, short side
    pressureIters: 18,
    curl: 2,             // vorticity confinement: how hard eddies curl up
    turbulence: 12.5,       // ambient churn applied where there is smoke
    buoyancy: 10,         // smoke rises
    velocityDecay: 1.2,   // per second; higher = pushes die out sooner
    dyeDecay: 1.5,        // per second, proportional thinning
    dyeFade: 0.03,        // per second, constant loss so wisps fully vanish
    dyeDiffuse: 0.2,     // per frame blur, softens edges as it dissipates
    dragForce: 0.08,      // how much pointer motion pushes the air
    flickForce: 0.33,      // extra shove along the stroke when released mid-motion
    fastSpeed: 1400,      // px/s treated as a "fast" drag
    size: 1,              // brush width multiplier
    density: 1,           // how much smoke each stroke lays down
    opacity: 1.5,         // how quickly density turns opaque
    shading: 0,           // fake side-lighting from the density gradient
    colorMode: 'ink',     // 'ink' (theme colour) | 'real' (grey smoke) | 'custom'
    edgeColor: [0.62, 0.62, 0.64], // custom: thin smoke
    coreColor: [0.2, 0.2, 0.22],   // custom: dense smoke
    textHeal: 0.9,        // per second; how fast the headline reassembles
    textFeed: 6,          // how quickly smoke eats into the headline
    patchy: 1,          // 0 = even fade, 1 = fades in random pockets
  };

  // ---------- control panel ----------
  // [key, label, min, max, step]
  const INK = { light: [0.043, 0.043, 0.047], dark: [0.957, 0.957, 0.961] }; // --ink in home.css
  // grey smoke: thin edges sit near the background, dense cores stand out from it
  const REAL = {
    light: { edge: [0.52, 0.52, 0.54], core: [0.2, 0.2, 0.22] },
    dark: { edge: [0.6, 0.61, 0.64], core: [0.93, 0.93, 0.95] },
  };
  function smokeGoal(part) { // part: 'edge' | 'core'
    const theme = isDark() ? 'dark' : 'light';
    if (TUNE.colorMode === 'real') return REAL[theme][part];
    if (TUNE.colorMode === 'custom') {
      // custom colours are picked against the light page; on the dark page the
      // roles swap so dense smoke is still the one that stands out
      const swapped = part === 'edge' ? 'core' : 'edge';
      return TUNE[(theme === 'dark' ? swapped : part) + 'Color'];
    }
    return INK[theme];
  }

  // strings are group headings; arrays are [key, label, min, max, step]
  const CONTROLS = [
    'Brush',
    ['size', 'Brush size', 0.2, 8, 0.05],
    ['density', 'Density', 0.1, 8, 0.05],
    'Motion',
    ['curl', 'Swirl', 0, 150, 1],
    ['turbulence', 'Turbulence', 0, 120, 0.5],
    ['buoyancy', 'Rise', -40, 80, 0.5],
    ['dragForce', 'Drag push', 0, 3, 0.01],
    ['flickForce', 'Flick', 0, 5, 0.01],
    ['velocityDecay', 'Air resistance', 0, 10, 0.05],
    'Fade',
    ['dyeDecay', 'Fade speed', 0, 5, 0.02],
    ['dyeFade', 'Wisp cutoff', 0, 0.5, 0.005],
    ['patchy', 'Patchy fade', 0, 2, 0.01],
    ['dyeDiffuse', 'Softness', 0, 0.6, 0.005],
    'Look',
    ['opacity', 'Opacity', 0.1, 6, 0.05],
    ['shading', 'Shading', 0, 2, 0.01],
    'Text',
    ['textFeed', 'Text dissolve', 0, 30, 0.5],
    ['textHeal', 'Text return', 0.05, 10, 0.05],
  ];
  const DEFAULTS = JSON.parse(JSON.stringify(TUNE));
  const panel = document.getElementById('panel');
  const syncs = []; // each re-reads TUNE into its control
  const sync = () => syncs.forEach((f) => f());
  const make = (tag, props) => Object.assign(document.createElement(tag), props);
  const toHex = (c) => '#' + c.map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
  const fromHex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

  function addSlider(key, label, min, max, step) {
    const wrap = make('label');
    const row = make('span', { className: 'row' });
    const out = make('output');
    const input = make('input', { type: 'range', min, max, step });
    const show = () => { out.textContent = (+input.value).toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0); };
    input.addEventListener('input', () => { TUNE[key] = +input.value; show(); });
    syncs.push(() => { input.value = TUNE[key]; show(); });
    row.append(make('span', { textContent: label }), out);
    wrap.append(row, input);
    panel.append(wrap);
  }

  function addColourControls() {
    const mode = make('select');
    for (const [value, text] of [['ink', 'Theme ink'], ['real', 'Realistic grey'], ['custom', 'Custom']]) {
      mode.append(make('option', { value, textContent: text }));
    }
    mode.addEventListener('change', () => {
      TUNE.colorMode = mode.value;
      // grey smoke reads as flat without some side-lighting
      if (mode.value === 'real' && TUNE.shading === 0) TUNE.shading = 0.8;
      // start custom from whatever is on screen now
      if (mode.value === 'custom') sync();
      sync();
    });
    const modeRow = make('label', { className: 'inline' });
    modeRow.append(make('span', { textContent: 'Colour' }), mode);
    panel.append(modeRow);

    for (const [part, text] of [['edge', 'Thin smoke'], ['core', 'Dense smoke']]) {
      const input = make('input', { type: 'color' });
      input.addEventListener('input', () => {
        // keep the other swatch as shown, then switch to custom
        if (TUNE.colorMode !== 'custom') {
          TUNE.edgeColor = smokeGoal('edge').slice();
          TUNE.coreColor = smokeGoal('core').slice();
          TUNE.colorMode = 'custom';
        }
        TUNE[part + 'Color'] = fromHex(input.value);
        sync();
      });
      syncs.push(() => { input.value = toHex(smokeGoal(part)); });
      const row = make('label', { className: 'inline' });
      row.append(make('span', { textContent: text }), input);
      panel.append(row);
    }
    syncs.push(() => { mode.value = TUNE.colorMode; });
  }

  // ---------- presets ----------
  const PRESETS = {
    // the page default: tall, fast-rising plumes that tear apart and vanish quickly
    'Original': {
      size: 1, density: 2.95, curl: 1, turbulence: 25, buoyancy: 66,
      dragForce: 0.08, flickForce: 0.84, velocityDecay: 1.2,
      dyeDecay: 4.2, dyeFade: 0.16, patchy: 2, dyeDiffuse: 0.6,
      opacity: 1, shading: 1.96, colorMode: 'custom',
      edgeColor: [0.8, 1, 0.95], coreColor: [0.02, 0.02, 0.12],
      textFeed: 6, textHeal: 0.9,
    },
    // a thin stream that rises fast, stays sharp, then curls and lingers
    'Candle wisp': {
      size: 0.6, density: 1.3, curl: 45, turbulence: 6, buoyancy: 26,
      dragForce: 0.1, flickForce: 0.3, velocityDecay: 0.6,
      dyeDecay: 0.22, dyeFade: 0.02, patchy: 0.5, dyeDiffuse: 0.02,
      opacity: 1.4, shading: 0.5, colorMode: 'real', textFeed: 6, textHeal: 0.9,
    },
    // a hair-thin, almost straight thread that barely spreads
    'Incense thread': {
      size: 0.4, density: 1.2, curl: 20, turbulence: 3, buoyancy: 34,
      dragForce: 0.04, flickForce: 0.15, velocityDecay: 0.4,
      dyeDecay: 0.15, dyeFade: 0.015, patchy: 0.3, dyeDiffuse: 0.01,
      opacity: 1, shading: 0.4, colorMode: 'real', textFeed: 6, textHeal: 0.9,
    },
    // heavy, rolling clouds with strong side-lighting
    'Thick billow': {
      size: 2.6, density: 2.5, curl: 60, turbulence: 30, buoyancy: 14,
      dragForce: 0.5, flickForce: 1, velocityDecay: 0.8,
      dyeDecay: 0.25, dyeFade: 0.02, patchy: 0.4, dyeDiffuse: 0.08,
      opacity: 2, shading: 1, colorMode: 'real', textFeed: 6, textHeal: 0.9,
    },
    // soft puffs that vanish quickly in patches
    'Soft puff': {
      size: 1, density: 1, curl: 2, turbulence: 12.5, buoyancy: 10,
      dragForce: 0.08, flickForce: 0.33, velocityDecay: 1.2,
      dyeDecay: 1.5, dyeFade: 0.03, patchy: 1, dyeDiffuse: 0.2,
      opacity: 1.5, shading: 0, colorMode: 'ink', textFeed: 6, textHeal: 0.9,
    },
    // flat theme-coloured swirls, like ink in water
    'Ink swirl': {
      size: 1, density: 1, curl: 30, turbulence: 14, buoyancy: 10,
      dragForce: 0.24, flickForce: 0.5, velocityDecay: 1,
      dyeDecay: 0.3, dyeFade: 0.03, patchy: 0.7, dyeDiffuse: 0.05,
      opacity: 1.5, shading: 0, colorMode: 'ink', textFeed: 6, textHeal: 0.9,
    },
  };
  const presetSel = make('select');
  for (const name in PRESETS) presetSel.append(make('option', { value: name, textContent: name }));
  const applyPreset = (name) => { Object.assign(TUNE, DEFAULTS, PRESETS[name]); sync(); };
  presetSel.addEventListener('change', () => applyPreset(presetSel.value));
  const presetRow = make('label', { className: 'inline' });
  presetRow.append(make('span', { textContent: 'Preset' }), presetSel);
  panel.append(presetRow);

  for (const c of CONTROLS) {
    if (typeof c === 'string') {
      panel.append(make('h3', { textContent: c }));
      if (c === 'Look') addColourControls();
    } else addSlider(...c);
  }
  const reset = make('button', { type: 'button', className: 'toggle', textContent: 'Reset' });
  reset.addEventListener('click', () => {
    applyPreset(presetSel.value);
  });
  panel.append(reset);
  applyPreset(presetSel.value); // the first preset is the page default
  // swatches show theme-dependent colours, so refresh them when the theme flips
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  panel.hidden = !/[?&]controls\b/.test(location.search);

  function createFluid(canvas) {
    const gl = canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
    });
    if (!gl) return null;
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) return null;

    const VERT = `
      attribute vec2 aPos;
      uniform vec2 texel;
      varying vec2 vUv, vL, vR, vT, vB;
      void main() {
        vUv = aPos * 0.5 + 0.5;
        vL = vUv - vec2(texel.x, 0.0);
        vR = vUv + vec2(texel.x, 0.0);
        vT = vUv + vec2(0.0, texel.y);
        vB = vUv - vec2(0.0, texel.y);
        gl_Position = vec4(aPos, 0.0, 1.0);
      }`;
    const HEAD = `precision highp float; precision highp sampler2D;
      varying vec2 vUv, vL, vR, vT, vB;`;

    const FRAG = {
      // adds a soft capsule (segment a→b) of `color` into the target
      splat: `${HEAD}
        uniform sampler2D uTarget;
        uniform float aspect, radius, uMax;
        uniform vec2 a, b;
        uniform vec3 color;
        void main() {
          vec2 asp = vec2(aspect, 1.0);
          vec2 pa = (vUv - a) * asp, ba = (b - a) * asp;
          float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
          vec2 d = pa - ba * h;
          vec3 base = texture2D(uTarget, vUv).xyz;
          vec3 res = base + exp(-dot(d, d) / radius) * color;
          gl_FragColor = vec4(clamp(res, -uMax, uMax), 1.0);
        }`,
      advect: `${HEAD}
        uniform sampler2D uVelocity, uSource;
        uniform vec2 simTexel, shift;
        uniform float dt, rate, fade, diffuse, patchy, time, aspect;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        void main() {
          vec2 coord = vUv - dt * texture2D(uVelocity, vUv - shift).xy * simTexel - shift;
          vec2 off = vUv - coord;
          vec4 c = texture2D(uSource, coord);
          // nothing flows in from beyond the viewport (also clears what scrolls off)
          if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) c = vec4(0.0);
          vec4 n = 0.25 * (texture2D(uSource, vL - off) + texture2D(uSource, vR - off)
                         + texture2D(uSource, vT - off) + texture2D(uSource, vB - off));
          c = mix(c, n, diffuse);

          // uneven erosion: slowly drifting noise makes some pockets vanish
          // several times faster than others, so the smoke tears into wisps
          float local = 1.0;
          if (patchy > 0.0) {
            vec2 p = vUv * vec2(aspect, 1.0);
            float f = 0.55 * noise(p * 5.0 + vec2(time * 0.11, -time * 0.17))
                    + 0.30 * noise(p * 13.0 + vec2(-time * 0.23, time * 0.19))
                    + 0.15 * noise(p * 31.0 + vec2(time * 0.37, time * 0.29));
            local = max(mix(1.0, 0.05 + 2.6 * smoothstep(0.38, 0.72, f), patchy), 0.0);
          }
          float decay = 1.0 / (1.0 + rate * local * dt);
          gl_FragColor = sign(c) * max(abs(c) * decay - fade * local, 0.0);
        }`,
      curl: `${HEAD}
        uniform sampler2D uVelocity;
        void main() {
          float L = texture2D(uVelocity, vL).y, R = texture2D(uVelocity, vR).y;
          float T = texture2D(uVelocity, vT).x, B = texture2D(uVelocity, vB).x;
          gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
        }`,
      // vorticity confinement + buoyancy + ambient turbulence
      forces: `${HEAD}
        uniform sampler2D uVelocity, uCurl, uDye;
        uniform float curl, dt, buoyancy, turbulence, time, aspect;
        void main() {
          float L = texture2D(uCurl, vL).x, R = texture2D(uCurl, vR).x;
          float T = texture2D(uCurl, vT).x, B = texture2D(uCurl, vB).x;
          float C = texture2D(uCurl, vUv).x;
          vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
          force /= length(force) + 1e-4;
          force *= curl * C;
          force.y *= -1.0;

          float d = min(texture2D(uDye, vUv).x, 1.5);
          vec2 p = vUv * vec2(aspect, 1.0);
          vec2 churn = vec2(
            sin(p.y * 19.0 + time * 1.3) + sin(p.y * 43.0 - time * 2.3 + p.x * 15.0) + 0.6 * sin(p.y * 91.0 + time * 3.1 - p.x * 37.0),
            sin(p.x * 23.0 - time * 1.1) + sin(p.x * 47.0 + time * 1.9 + p.y * 13.0) + 0.6 * sin(p.x * 97.0 - time * 2.7 + p.y * 41.0));

          vec2 vel = texture2D(uVelocity, vUv).xy;
          vel += (force + churn * turbulence * d + vec2(0.0, buoyancy * d)) * dt;
          gl_FragColor = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
        }`,
      divergence: `${HEAD}
        uniform sampler2D uVelocity;
        void main() {
          float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x;
          float T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y;
          gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
        }`,
      pressure: `${HEAD}
        uniform sampler2D uPressure, uDivergence;
        void main() {
          float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
          float div = texture2D(uDivergence, vUv).x;
          gl_FragColor = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
        }`,
      gradient: `${HEAD}
        uniform sampler2D uPressure, uVelocity;
        void main() {
          float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x;
          float T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
          vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
          gl_FragColor = vec4(vel, 0.0, 1.0);
        }`,
      // headline state: rg = how far the flow has carried the text (uv),
      // b = how dissolved it is. Both relax back to zero, which reassembles it.
      warp: `${HEAD}
        uniform sampler2D uVelocity, uWarp, uDye;
        uniform vec2 simTexel, shift;
        uniform float dt, heal, feed;
        void main() {
          vec2 step = dt * texture2D(uVelocity, vUv).xy * simTexel;
          vec2 coord = vUv - step - shift;
          vec4 w = texture2D(uWarp, coord);
          if (coord.x < 0.0 || coord.x > 1.0 || coord.y < 0.0 || coord.y > 1.0) w = vec4(0.0);
          // only reasonably dense smoke eats text, so the effect stays under the smoke
          float s = min(w.z + max(texture2D(uDye, vUv).x - 0.12, 0.0) * feed * dt, 1.3);
          s = max(s / (1.0 + heal * dt) - 0.04 * dt, 0.0);
          vec2 d = (w.xy + step) / (1.0 + 1.5 * heal * dt);
          gl_FragColor = vec4(d, s, 1.0);
        }`,
      display: `${HEAD}
        uniform sampler2D uDye, uWarp, uText0, uText1;
        uniform vec3 ink, edgeCol, coreCol;
        uniform float opacity, shading;
        uniform vec4 textRect0, textRect1; // left, top, width, height as fractions of the viewport
        uniform float aspect, time, hasText;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        float layer(sampler2D tx, vec4 rc, vec2 uv) {
          vec2 t = (vec2(uv.x, 1.0 - uv.y) - rc.xy) / rc.zw;
          if (t.x < 0.0 || t.x > 1.0 || t.y < 0.0 || t.y > 1.0) return 0.0;
          return texture2D(tx, vec2(t.x, 1.0 - t.y)).a;
        }
        float textAt(vec2 uv) {
          return max(layer(uText0, textRect0, uv), layer(uText1, textRect1, uv));
        }
        void main() {
          float d = texture2D(uDye, vUv).x;
          float a = 1.0 - exp(-d * opacity);

          // thin smoke takes the edge colour, thick smoke the core colour
          vec3 smoke = mix(edgeCol, coreCol, smoothstep(0.1, 0.9, a));
          if (shading > 0.0) {
            // light from the upper left: the side where density falls away
            // towards the light is brightened, the far side darkened
            vec2 ox = (vR - vUv) * 3.0, oy = (vT - vUv) * 3.0;
            // work on opacity rather than raw density so thick smoke doesn't band
            vec4 nb = vec4(texture2D(uDye, vUv + ox).x, texture2D(uDye, vUv - ox).x,
                           texture2D(uDye, vUv + oy).x, texture2D(uDye, vUv - oy).x);
            nb = 1.0 - exp(-nb * opacity);
            float lit = clamp(-dot(vec2(nb.x - nb.y, nb.z - nb.w), vec2(-0.6, 0.8)) * 1.6, -1.0, 1.0);
            smoke = clamp(smoke + lit * shading * 0.22, 0.0, 1.0);
          }

          float textA = 0.0;
          if (hasText > 0.5) {
            vec4 w = texture2D(uWarp, vUv);
            float s = w.z;
            vec2 inv = vec2(1.0 / aspect, 1.0);
            vec2 p = vUv * vec2(aspect, 1.0);
            // letters ripple along with the air, easing back as they heal
            vec2 base = vUv - w.xy * smoothstep(0.2, 0.7, s);
            // blur grows with dissolve so letters soften into puffs
            float r = smoothstep(0.15, 0.8, s) * 0.016;
            float t = textAt(base);
            for (int i = 0; i < 8; i++) {
              float fi = float(i);
              float ang = fi * 2.39996 + hash(gl_FragCoord.xy) * 6.2832;
              t += textAt(base + vec2(cos(ang), sin(ang)) * sqrt((fi + 0.5) / 8.0) * r * inv);
            }
            t /= 9.0;
            // erode in uneven patches rather than all at once
            // break up as fine mist: soft patches, finer wisps, and a faint
            // per-pixel twinkle so the edge reads as drifting dust
            float grain = hash(floor(gl_FragCoord.xy / 1.5) + floor(time * 10.0));
            float n = 0.4 * noise(p * 14.0 + time * 0.2) + 0.3 * noise(p * 70.0 - time * 0.5) + 0.3 * grain;
            float keep = 1.0 - smoothstep(0.0, 1.0, (s - 0.25 - 0.7 * n) / 0.45);
            textA = t * keep;
          }

          // smoke over text, premultiplied
          vec3 rgb = smoke * a + ink * textA * (1.0 - a);
          float outA = a + textA * (1.0 - a);
          // dither to keep the soft falloff free of banding
          outA += (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 255.0;
          outA = clamp(outA, 0.0, 1.0);
          gl_FragColor = vec4(min(rgb, vec3(outA)), outA);
        }`,
    };

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    }
    let P;
    try {
      const vs = compile(gl.VERTEX_SHADER, VERT);
      P = {};
      for (const name in FRAG) {
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG[name]));
        gl.bindAttribLocation(prog, 0, 'aPos');
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
        const u = {};
        const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) {
          const info = gl.getActiveUniform(prog, i);
          u[info.name] = gl.getUniformLocation(prog, info.name);
        }
        P[name] = { prog, u };
      }
    } catch (e) {
      console.warn('Fluid smoke unavailable, using particles:', e);
      return null;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disable(gl.BLEND);

    function fbo(w, h) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.viewport(0, 0, w, h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      return { tex, fb, w, h, ok, texel: [1 / w, 1 / h] };
    }
    function pair(w, h) {
      const p = { read: fbo(w, h), write: fbo(w, h) };
      p.swap = () => { const t = p.read; p.read = p.write; p.write = t; };
      return p;
    }
    function free(...list) {
      for (const f of list) if (f) { gl.deleteTexture(f.tex); gl.deleteFramebuffer(f.fb); }
    }

    let velocity, dye, pressure, curl, divergence, warp, aspect = 1, W = 1, H = 1;

    // Each [data-smoke] element is rasterised from the real DOM into a texture,
    // so the canvas version lines up with (and replaces) the HTML text.
    // The display shader has two text layers, so at most two elements.
    const texts = [...document.querySelectorAll('[data-smoke]')].slice(0, 2)
      .map((el) => ({ el, tex: gl.createTexture(), box: null, until: 0, live: false }));
    function buildText() { texts.forEach(buildLayer); }
    function buildLayer(layer) {
      const hero = layer.el;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const r = hero.getBoundingClientRect();
      const pad = Math.ceil(parseFloat(getComputedStyle(hero).fontSize) * 0.3);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round((r.width + pad * 2) * dpr));
      c.height = Math.max(1, Math.round((r.height + pad * 2) * dpr));
      const g = c.getContext('2d');
      g.scale(dpr, dpr);
      g.fillStyle = g.strokeStyle = '#fff';
      g.textBaseline = 'alphabetic';
      g.lineJoin = 'round';
      const walker = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT);
      const range = document.createRange();
      for (let node; (node = walker.nextNode());) {
        if (!node.textContent.trim()) continue;
        const cs = getComputedStyle(node.parentElement);
        g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        const ascent = g.measureText('M').fontBoundingBoxAscent;
        const outline = parseFloat(cs.webkitTextStrokeWidth) || 0;
        g.lineWidth = outline;
        // place each glyph where the browser laid it out, so spacing, kerning
        // and line wraps match the DOM exactly
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          if (!text[i].trim()) continue;
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const box = range.getClientRects()[0];
          if (!box) continue;
          const x = box.left - r.left + pad, y = box.top - r.top + pad + ascent;
          if (outline > 0) g.strokeText(text[i], x, y);
          else g.fillText(text[i], x, y);
        }
      }
      gl.bindTexture(gl.TEXTURE_2D, layer.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      layer.box = { pad, w: c.width / dpr, h: c.height / dpr, dpr };
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildText);

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      // layout viewport, i.e. excluding the scrollbar, to match the canvas's CSS box
      const w = root.clientWidth, h = root.clientHeight;
      // mobile browsers resize the viewport as the address bar slides in and
      // out; keep the existing buffers (and the smoke in them) through that
      const keep = velocity && w === W && Math.abs(h - H) < 160;
      W = w; H = h;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      if (keep) { buildText(); return true; }
      aspect = W / H;
      const res = (r) => aspect >= 1 ? [Math.round(r * aspect), r] : [r, Math.round(r / aspect)];
      const [sw, sh] = res(TUNE.simRes), [dw, dh] = res(TUNE.dyeRes);
      if (velocity) free(velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, curl, divergence, warp.read, warp.write);
      warp = pair(...res(TUNE.simRes * 2));
      buildText();
      velocity = pair(sw, sh);
      pressure = pair(sw, sh);
      curl = fbo(sw, sh);
      divergence = fbo(sw, sh);
      dye = pair(dw, dh);
      return velocity.read.ok && dye.read.ok;
    }
    if (!resize()) return null;

    let cur;
    function use(p, target, texel) {
      cur = p;
      gl.useProgram(p.prog);
      if (p.u.texel) gl.uniform2fv(p.u.texel, texel || target.texel);
    }
    function tex(name, f, unit) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, f.tex);
      gl.uniform1i(cur.u[name], unit);
    }
    function draw(target) {
      if (target) { gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb); gl.viewport(0, 0, target.w, target.h); }
      else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, canvas.width, canvas.height); }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    const queue = [];
    let scrolled = 0; // css px the page moved since the last frame
    const ink = INK[isDark() ? 'dark' : 'light'].slice();
    const edge = smokeGoal('edge').slice(), core = smokeGoal('core').slice();

    function splat(target, s, color, radius, max) {
      use(P.splat, target.write);
      tex('uTarget', target.read, 0);
      gl.uniform1f(cur.u.aspect, aspect);
      gl.uniform1f(cur.u.radius, radius * radius);
      gl.uniform1f(cur.u.uMax, max);
      gl.uniform2f(cur.u.a, s.ax, s.ay);
      gl.uniform2f(cur.u.b, s.bx, s.by);
      gl.uniform3f(cur.u.color, color[0], color[1], color[2]);
      draw(target.write);
      target.swap();
    }

    return {
      resize,
      scroll(dy) { scrolled += dy; },
      busy() { return texts.some((t) => t.live); },
      clear() {
        for (const f of [velocity.read, velocity.write, dye.read, dye.write, pressure.read, pressure.write, warp.read, warp.write]) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, f.fb);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
      },
      // pointer travelled a→b (css px) at v (px/s) over dt seconds
      stroke(ax, ay, bx, by, vx, vy, dt) {
        const k = velocity.read.h / H * TUNE.dragForce; // px/s → sim texels/s
        const speed = Math.hypot(vx, vy);
        // 0 = lingering, 1 = fast: fast strokes are wider, thinner and more ragged
        const fast = Math.min(speed / TUNE.fastSpeed, 1);
        const j = 8 + 34 * fast;
        queue.push({
          ax: ax / W, ay: 1 - ay / H, bx: bx / W, by: 1 - by / H,
          vx: vx * k + rand(-j, j), vy: -vy * k + rand(-j, j),
          amount: Math.min(0.22 + 5 * dt, 0.6) * (1 - 0.45 * fast) * TUNE.density,
          dyeR: 0.011 * (1 + 1.4 * fast) * rand(0.8, 1.25) * TUNE.size,
          velR: 0.028 * (1 + fast),
        });
        if (queue.length > 64) queue.shift();

        // Text stays ordinary DOM text (which scrolls perfectly in step with
        // the page) until smoke is drawn near it; only then does the canvas
        // take it over, for long enough to dissolve and reassemble.
        const hold = Math.min(30, 6 / TUNE.textHeal + 4 / (TUNE.dyeDecay + 0.2)) * 1000;
        for (const t of texts) {
          if (!t.box) continue;
          const r = t.el.getBoundingClientRect();
          // generous below, since smoke rises into the text
          if (bx > r.left - 150 && bx < r.right + 150 && by > r.top - 150 && by < r.bottom + 400) {
            t.until = performance.now() + hold;
          }
        }
      },
      // released while moving at v (px/s): a gust that carries the smoke onward
      flick(x, y, vx, vy) {
        const k = velocity.read.h / H * TUNE.flickForce;
        const reach = 0.09; // seconds of travel the gust is laid along
        queue.push({
          ax: x / W, ay: 1 - y / H, bx: (x + vx * reach) / W, by: 1 - (y + vy * reach) / H,
          vx: vx * k, vy: -vy * k, amount: 0, dyeR: 0.01, velR: 0.07,
        });
      },
      frame(dt, now, idle) {
        const time = now / 1000;
        const simTexel = velocity.read.texel;
        for (const t of texts) {
          const live = now < t.until;
          if (live !== t.live) { t.live = live; t.el.classList.toggle('smoke-live', live); }
        }

        if (!idle) {
          for (const s of queue) {
            splat(velocity, s, [s.vx, s.vy, 0], s.velR, 1000);
            if (s.amount > 0) splat(dye, s, [s.amount, 0, 0], s.dyeR, 6);
          }
          queue.length = 0;

          use(P.curl, curl);
          tex('uVelocity', velocity.read, 0);
          draw(curl);

          use(P.forces, velocity.write);
          tex('uVelocity', velocity.read, 0);
          tex('uCurl', curl, 1);
          tex('uDye', dye.read, 2);
          gl.uniform1f(cur.u.curl, TUNE.curl);
          gl.uniform1f(cur.u.buoyancy, TUNE.buoyancy);
          gl.uniform1f(cur.u.turbulence, TUNE.turbulence);
          gl.uniform1f(cur.u.time, time);
          gl.uniform1f(cur.u.aspect, aspect);
          gl.uniform1f(cur.u.dt, dt);
          draw(velocity.write);
          velocity.swap();

          use(P.divergence, divergence);
          tex('uVelocity', velocity.read, 0);
          draw(divergence);

          use(P.pressure, pressure.write);
          tex('uDivergence', divergence, 1);
          for (let i = 0; i < TUNE.pressureIters; i++) {
            tex('uPressure', pressure.read, 0);
            draw(pressure.write);
            pressure.swap();
          }

          use(P.gradient, velocity.write);
          tex('uPressure', pressure.read, 0);
          tex('uVelocity', velocity.read, 1);
          draw(velocity.write);
          velocity.swap();

          use(P.advect, velocity.write);
          tex('uVelocity', velocity.read, 0);
          tex('uSource', velocity.read, 1);
          gl.uniform2fv(cur.u.simTexel, simTexel);
          gl.uniform1f(cur.u.dt, dt);
          gl.uniform2f(cur.u.shift, 0, scrolled / H);
          gl.uniform1f(cur.u.rate, TUNE.velocityDecay);
          gl.uniform1f(cur.u.fade, 0);
          gl.uniform1f(cur.u.diffuse, 0);
          gl.uniform1f(cur.u.patchy, 0);
          draw(velocity.write);
          velocity.swap();

          use(P.advect, dye.write);
          tex('uVelocity', velocity.read, 0);
          tex('uSource', dye.read, 1);
          gl.uniform2fv(cur.u.simTexel, simTexel);
          gl.uniform1f(cur.u.dt, dt);
          gl.uniform2f(cur.u.shift, 0, scrolled / H);
          gl.uniform1f(cur.u.rate, TUNE.dyeDecay);
          gl.uniform1f(cur.u.fade, TUNE.dyeFade * dt);
          gl.uniform1f(cur.u.diffuse, TUNE.dyeDiffuse);
          gl.uniform1f(cur.u.patchy, TUNE.patchy);
          gl.uniform1f(cur.u.time, time);
          gl.uniform1f(cur.u.aspect, aspect);
          draw(dye.write);
          dye.swap();

          use(P.warp, warp.write);
          tex('uVelocity', velocity.read, 0);
          tex('uWarp', warp.read, 1);
          tex('uDye', dye.read, 2);
          gl.uniform2fv(cur.u.simTexel, simTexel);
          gl.uniform2f(cur.u.shift, 0, scrolled / H);
          gl.uniform1f(cur.u.dt, dt);
          gl.uniform1f(cur.u.heal, TUNE.textHeal);
          gl.uniform1f(cur.u.feed, TUNE.textFeed);
          draw(warp.write);
          warp.swap();
          scrolled = 0;
        }

        // ease the smoke colour across theme changes
        const goal = INK[isDark() ? 'dark' : 'light'], goalEdge = smokeGoal('edge'), goalCore = smokeGoal('core');
        const e = 1 - Math.exp(-dt * 7);
        for (let i = 0; i < 3; i++) {
          ink[i] += (goal[i] - ink[i]) * e;
          edge[i] += (goalEdge[i] - edge[i]) * e;
          core[i] += (goalCore[i] - core[i]) * e;
        }

        use(P.display, null, dye.read.texel);
        tex('uDye', dye.read, 0);
        tex('uWarp', warp.read, 1);
        gl.uniform1f(cur.u.hasText, texts.some((t) => t.live) ? 1 : 0);
        for (let i = 0; i < 2; i++) {
          const layer = texts[i];
          const r = layer && layer.box && layer.live && layer.el.getBoundingClientRect();
          // unused or off-screen layers get a rect outside the viewport
          if (!r || r.bottom < -H || r.top > 2 * H) { gl.uniform4f(cur.u['textRect' + i], 2, 2, 1, 1); continue; }
          tex('uText' + i, layer, 2 + i);
          const b = layer.box, q = b.dpr;
          const left = Math.round((r.left - b.pad) * q) / q;
          const top = Math.round((r.top - b.pad) * q) / q;
          gl.uniform4f(cur.u['textRect' + i], left / W, top / H, b.w / W, b.h / H);
        }
        gl.uniform1f(cur.u.aspect, aspect);
        gl.uniform1f(cur.u.time, time);
        gl.uniform3fv(cur.u.ink, ink);
        gl.uniform3fv(cur.u.edgeCol, edge);
        gl.uniform3fv(cur.u.coreCol, core);
        gl.uniform1f(cur.u.opacity, TUNE.opacity);
        gl.uniform1f(cur.u.shading, TUNE.shading);
        gl.clearColor(0, 0, 0, 0);
        draw(null);
      },
    };
  }

  // =====================================================================
  // Fallback when WebGL2 float targets aren't available: 2D puff particles
  // =====================================================================
  function createParticles(canvas) {
    const ctx = canvas.getContext('2d');
    let dpr = 1;
    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(root.clientWidth * dpr);
      canvas.height = Math.round(root.clientHeight * dpr);
    }
    resize();

    const SPRITE = 128, VARIANTS = 4, MAX = 1600;
    function makeSprites(rgb) {
      const out = [];
      for (let v = 0; v < VARIANTS; v++) {
        const c = document.createElement('canvas');
        c.width = c.height = SPRITE;
        const g = c.getContext('2d');
        for (let i = 0; i < 7; i++) {
          const a = Math.random() * Math.PI * 2, d = Math.random() * 20;
          const x = SPRITE / 2 + Math.cos(a) * d, y = SPRITE / 2 + Math.sin(a) * d;
          const r = 26 + Math.random() * 16;
          const grad = g.createRadialGradient(x, y, 0, x, y, r);
          grad.addColorStop(0, `rgba(${rgb}, 0.32)`);
          grad.addColorStop(0.5, `rgba(${rgb}, 0.12)`);
          grad.addColorStop(1, `rgba(${rgb}, 0)`);
          g.fillStyle = grad;
          g.fillRect(0, 0, SPRITE, SPRITE);
        }
        out.push(c);
      }
      return out;
    }
    const sprites = { light: makeSprites('18, 18, 20'), dark: makeSprites('240, 240, 245') };
    const particles = [];

    function emit(x, y, vx, vy) {
      if (particles.length >= MAX) particles.shift();
      particles.push({
        x: x + rand(-4, 4), y: y + rand(-4, 4),
        vx: vx * 0.12 + rand(-18, 18), vy: vy * 0.12 + rand(-18, 18) - 8,
        size: rand(14, 30), grow: rand(22, 50),
        rot: rand(0, Math.PI * 2), spin: rand(-0.6, 0.6),
        age: 0, life: rand(1.8, 3.6), sprite: (Math.random() * VARIANTS) | 0,
      });
    }

    return {
      resize,
      clear() { particles.length = 0; },
      scroll(dy) { for (const p of particles) p.y -= dy; },
      flick() {},
      busy() { return false; },
      stroke(ax, ay, bx, by, vx, vy) {
        const steps = Math.max(1, Math.floor(Math.hypot(bx - ax, by - ay) / 5));
        for (let i = 1; i <= steps; i++) {
          const k = i / steps;
          emit(ax + (bx - ax) * k, ay + (by - ay) * k, vx, vy);
        }
      },
      frame(dt, now) {
        const time = now / 1000;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const set = sprites[isDark() ? 'dark' : 'light'];
        const damp = Math.max(0, 1 - 1.3 * dt);
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.age += dt;
          if (p.age >= p.life) { particles.splice(i, 1); continue; }
          const a = Math.sin(p.x * 0.006 + time * 0.6) * Math.cos(p.y * 0.006 - time * 0.4) * Math.PI * 2;
          p.vx = (p.vx + Math.cos(a) * 34 * dt) * damp;
          p.vy = (p.vy + Math.sin(a) * 34 * dt - 30 * dt) * damp;
          p.x += p.vx * dt; p.y += p.vy * dt;
          p.size += p.grow * dt; p.rot += p.spin * dt;
          const t = p.age / p.life;
          const alpha = Math.min(t * 8, 1) * Math.pow(1 - t, 1.6);
          if (alpha <= 0.003) continue;
          const cos = Math.cos(p.rot) * dpr, sin = Math.sin(p.rot) * dpr;
          ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
          ctx.globalAlpha = alpha;
          ctx.drawImage(set[p.sprite], -p.size, -p.size, p.size * 2, p.size * 2);
        }
        ctx.globalAlpha = 1;
      },
    };
  }

  // ---------- pick an engine ----------
  let canvas = document.getElementById('smoke');
  let engine = createFluid(canvas);
  if (!engine) {
    // a canvas that already handed out a WebGL context can't give a 2D one
    const fresh = canvas.cloneNode();
    canvas.replaceWith(fresh);
    canvas = fresh;
    engine = createParticles(canvas);
  }
  addEventListener('resize', () => engine.resize());

  // ---------- pointer ----------
  const pointer = { down: false, x: 0, y: 0, vx: 0, vy: 0, svx: 0, svy: 0, t: 0 };
  const clampV = (v) => Math.max(-1600, Math.min(1600, v));

  addEventListener('pointerdown', (e) => {
    if (e.target.closest?.('a, button, input, textarea, select, label, .smoke-panel, .hc-overlay, #overlay, #lightbox, #mobileProjList, .mobile-menu')) return;
    pointer.down = true;
    document.body.classList.add('smoke-dragging'); // no text selection mid-stroke
    pointer.x = e.clientX; pointer.y = e.clientY;
    pointer.vx = pointer.vy = pointer.svx = pointer.svy = 0;
    pointer.t = performance.now();
    engine.stroke(pointer.x, pointer.y, pointer.x, pointer.y, 0, 0, 0.03);
  });

  addEventListener('pointermove', (e) => {
    if (!pointer.down) return;
    // use every sub-frame sample so fast strokes stay curved, not polygonal
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    const list = events.length ? events : [e];
    const now = performance.now();
    const dt = Math.max(now - pointer.t, 1) / 1000 / list.length;
    for (const ev of list) {
      const dx = ev.clientX - pointer.x, dy = ev.clientY - pointer.y;
      pointer.vx = clampV(dx / dt); pointer.vy = clampV(dy / dt);
      // smoothed velocity: a steadier read of the stroke's direction for flicks
      pointer.svx += (pointer.vx - pointer.svx) * 0.35;
      pointer.svy += (pointer.vy - pointer.svy) * 0.35;
      engine.stroke(pointer.x, pointer.y, ev.clientX, ev.clientY, pointer.vx, pointer.vy, dt);
      pointer.x = ev.clientX; pointer.y = ev.clientY;
    }
    pointer.t = now;
  });

  const release = () => { pointer.down = false; document.body.classList.remove('smoke-dragging'); };
  addEventListener('pointerup', () => {
    const moving = performance.now() - pointer.t < 80;
    if (pointer.down && moving && Math.hypot(pointer.svx, pointer.svy) > 300) {
      engine.flick(pointer.x, pointer.y, pointer.svx, pointer.svy);
    }
    release();
  });
  addEventListener('pointercancel', release);
  addEventListener('blur', release);

  // ---------- loop ----------
  let last = performance.now();
  let lastScroll = scrollY;
  let lastActive = last;
  // long enough for the slowest smoke and the text to settle before the solver rests
  const idleAfter = () => Math.min(60, Math.max(6, 10 / (TUNE.dyeDecay + 0.05))) * 1000;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    // carry the smoke with the page so it stays attached to what it was drawn on
    if (scrollY !== lastScroll) { engine.scroll(scrollY - lastScroll); lastScroll = scrollY; lastActive = now; }
    if (pointer.down) lastActive = now;
    // holding still keeps the source smouldering
    if (pointer.down && now - pointer.t > 40) {
      pointer.vx = pointer.vy = 0;
      engine.stroke(pointer.x, pointer.y, pointer.x, pointer.y, 0, 0, dt);
    }
    engine.frame(dt, now, now - lastActive > idleAfter() && !engine.busy());
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
