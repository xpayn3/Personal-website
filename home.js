// ========== COVER: HIGH-DENSITY FLOW FIELD ==========
// Thousands of fine 1px particles drifting through a 3D curl-noise vector
// field. Sharp dots, no glow, no additive blending. Particles that exit
// the bounding sphere are recycled back near the center on a new flow
// trajectory — endless emission.

(function () {
  const canvas = document.getElementById('coverCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  // Mobile / coarse-pointer detection — fewer particles, no input handlers.
  const IS_MOBILE = (window.matchMedia && (
    window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  ));
  const COUNT = IS_MOBILE ? 1500 : 7000;
  const FIELD_R = 1;       // bounding sphere radius (in normalized field units)
  // Defaults — match the "base" preset below so the live values + their
  // lerp targets agree at startup.
  const BASE_NOISE_SCALE = 1.4;
  const BASE_FLOW_SPEED = 0.26;
  const BASE_TIME_DRIFT = 0.14;
  const BASE_SWIRL = 0.10;
  // Live, eased values — flow presets retarget these and they lerp toward
  // their targets each frame so the swarm reshapes smoothly between modes.
  let NOISE_SCALE = BASE_NOISE_SCALE;
  let FLOW_SPEED = BASE_FLOW_SPEED;
  let TIME_DRIFT = BASE_TIME_DRIFT;
  let SWIRL = BASE_SWIRL;
  let RADIAL = 0;      // radial outward push (negative = pulled inward)
  let JITTER = 0;      // per-frame random kick (chaos)
  let WIND_X = 0;      // uniform horizontal sweep velocity
  let WIND_Y = 0;      // uniform vertical sweep velocity
  // Targets driven by __coverFlow() — current values lerp toward these.
  const flowTarget = {
    noiseScale: BASE_NOISE_SCALE,
    flowSpeed: BASE_FLOW_SPEED,
    timeDrift: BASE_TIME_DRIFT,
    swirl: BASE_SWIRL,
    radial: 0,
    jitter: 0,
    windX: 0,
    windY: 0,
  };
  // Named presets — each gives a distinct swarm character. All non-chaotic
  // (no jitter), so transitions read as elegant flow shifts, not noise.
  const FLOW_PRESETS = {
    // Default state — designed to be a showcase: bigger noise sweeps, a
    // touch of continuous swirl so the cloud rotates slowly, and a faster
    // time drift so the flow field constantly reshapes itself.
    base:      { noiseScale: 1.4,  flowSpeed: 0.26, timeDrift: 0.14, swirl: 0.10,  radial: 0,     jitter: 0, windX: 0,    windY: 0 },
    // Energetic wide flow — bigger sweeps, faster but still smooth.
    energetic: { noiseScale: 1.2,  flowSpeed: 0.30, timeDrift: 0.10, swirl: 0,     radial: 0,     jitter: 0, windX: 0,    windY: 0 },
    // Motion design — particles streak across the screen in a strong
    // directional sweep with bendy noise paths. Reads as fast kinetic motion.
    kinetic:   { noiseScale: 1.5,  flowSpeed: 0.55, timeDrift: 0.18, swirl: 0,     radial: 0,     jitter: 0, windX: 0.55, windY: 0 },
    // Calm wide flow — broad slow sweeps.
    smooth:    { noiseScale: 0.9,  flowSpeed: 0.22, timeDrift: 0.04, swirl: 0,     radial: 0,     jitter: 0, windX: 0,    windY: 0 },
    // Tight identity field — slow and structural.
    structural:{ noiseScale: 0.55, flowSpeed: 0.08, timeDrift: 0.02, swirl: 0,     radial: 0,     jitter: 0, windX: 0,    windY: 0 },
    // Fine-grain detail — high freq noise but still gentle.
    pixelated: { noiseScale: 4.5,  flowSpeed: 0.10, timeDrift: 0.05, swirl: 0,     radial: 0,     jitter: 0, windX: 0,    windY: 0 },
    // Spiral / web — strong tangential rotation.
    swirl:     { noiseScale: 1.3,  flowSpeed: 0.18, timeDrift: 0.06, swirl: 0.55,  radial: 0,     jitter: 0, windX: 0,    windY: 0 },
    // Pulsing outward radial breath.
    pulse:     { noiseScale: 1.1,  flowSpeed: 0.14, timeDrift: 0.10, swirl: 0,     radial: 0.18, jitter: 0, windX: 0,    windY: 0 },
    // Inward gravity — particles drift toward center with a soft curl.
    implode:   { noiseScale: 1.8,  flowSpeed: 0.18, timeDrift: 0.10, swirl: 0.18,  radial: -0.22,jitter: 0, windX: 0,    windY: 0 },
    // Slow drifting current — meditative, soft direction change.
    drift:     { noiseScale: 0.7,  flowSpeed: 0.12, timeDrift: 0.03, swirl: 0.08,  radial: 0,     jitter: 0, windX: 0,    windY: 0 },
  };
  function setCoverFlow(name) {
    const preset = FLOW_PRESETS[name] || FLOW_PRESETS.base;
    flowTarget.noiseScale = preset.noiseScale;
    flowTarget.flowSpeed  = preset.flowSpeed;
    flowTarget.timeDrift  = preset.timeDrift;
    flowTarget.swirl      = preset.swirl;
    flowTarget.radial     = preset.radial;
    flowTarget.jitter     = preset.jitter;
  }
  window.__coverFlow = (name) => setCoverFlow(name || 'base');

  let W = 0, H = 0, DPR = 1, cx = 0, cy = 0;
  const particles = [];

  // Camera state — slow auto-orbit only (no cursor tilt).
  const cam = { yaw: 0, pitch: 0.18 };

  // Repulsion params — spring-physics push for weight + bounce.
  // Lower stiffness + higher damping means particles drift back to home
  // slowly instead of springing the moment force is removed.
  const REPEL_RADIUS = 240;        // CSS pixels (hover)
  const REPEL_STRENGTH = 32;       // peak radial push (pixels)
  // Tuned closer to critical damping — slow, smooth return with no
  // visible overshoot/bounce.
  const REPEL_STIFF = 0.07;        // very soft spring
  const REPEL_DAMP = 0.78;         // dissipates velocity faster → no springy oscillation
  const REPEL_WAKE = 0.22;         // cursor-velocity wake while hovering
  const REPEL_SIZE_BOOST = 0.55;   // extra size factor at peak push

  // Drag mode — fluid-push interaction. Held mouse with motion = sustained
  // wider, stronger force in the cursor's direction.
  const DRAG_RADIUS = 380;         // CSS pixels while drag is held
  const DRAG_STRENGTH = 48;        // stronger radial push while dragging
  const DRAG_WAKE = 0.65;          // much stronger directional carry

  // ----- Cheap 3D value noise + curl ---------------------------------------
  // Hash → pseudo-random unit vector at integer 3D lattice point.
  function hash3(x, y, z) {
    let h = x * 374761393 + y * 668265263 + z * 2147483647;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function fade(t) { return t * t * (3 - 2 * t); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function noise3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = fade(xf), v = fade(yf), w = fade(zf);
    const c000 = hash3(xi,     yi,     zi);
    const c100 = hash3(xi + 1, yi,     zi);
    const c010 = hash3(xi,     yi + 1, zi);
    const c110 = hash3(xi + 1, yi + 1, zi);
    const c001 = hash3(xi,     yi,     zi + 1);
    const c101 = hash3(xi + 1, yi,     zi + 1);
    const c011 = hash3(xi,     yi + 1, zi + 1);
    const c111 = hash3(xi + 1, yi + 1, zi + 1);
    return lerp(
      lerp(lerp(c000, c100, u), lerp(c010, c110, u), v),
      lerp(lerp(c001, c101, u), lerp(c011, c111, u), v),
      w
    );
  }
  // Curl of a 3D scalar-noise field — divergence-free flow.
  const E = 0.08;
  function curl(x, y, z, t) {
    const n1 = noise3(x, y + E, z + t) - noise3(x, y - E, z + t);
    const n2 = noise3(x + E, y, z - t) - noise3(x - E, y, z - t);
    const n3 = noise3(x + t, y, z + E) - noise3(x + t, y, z - E);
    return [
      (n2 - n1) / (2 * E),
      (n3 - n2) / (2 * E),
      (n1 - n3) / (2 * E),
    ];
  }

  // ----- Setup -------------------------------------------------------------
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1 : 1.75);
    const rect = canvas.getBoundingClientRect();
    W = canvas.width  = Math.max(1, Math.round(rect.width  * DPR));
    H = canvas.height = Math.max(1, Math.round(rect.height * DPR));
    cx = W / 2;
    cy = H / 2;
  }

  function spawnInside(p) {
    // Random point inside a small core sphere — particles emerge from
    // somewhere near the middle, then flow outward via the field.
    const u = Math.random(), v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    // Vary the spawn-zone radius per particle so they don't all bunch at
    // exactly the same depth from center.
    const r = Math.cbrt(Math.random()) * FIELD_R * (0.18 + Math.random() * 0.30);
    p.x = r * Math.sin(phi) * Math.cos(theta);
    p.y = r * Math.sin(phi) * Math.sin(theta);
    p.z = r * Math.cos(phi);
    p.lifeFade = 0;
    // Long, varied per-particle lifetime — gives the flow field time to
    // trace genuine shapes before the particle is recycled.
    p.life = 0;
    p.maxLife = 6.0 + Math.random() * 14.0;    // 6 – 20 s
    p.fadeInRate = 1.0 + Math.random() * 2.0;  // 1.0 – 3.0 / s (gentler)
    // Most particles can reach the edge of the bounding sphere; some
    // travel past it before recycling.
    p.travelRadius = FIELD_R * (0.85 + Math.random() * 0.5); // 0.85 – 1.35
  }

  function build() {
    particles.length = 0;
    for (let i = 0; i < COUNT; i++) {
      const p = {
        x: 0, y: 0, z: 0,
        sx: 0, sy: 0, depth: 0,
        lifeFade: 0,
        // Spring-physics mouse repulsion: position + velocity.
        pushSx: 0, pushSy: 0, pushVX: 0, pushVY: 0,
        // Per-particle stiffness variance — keeps the field organic.
        stiff: REPEL_STIFF * (0.78 + Math.random() * 0.44),
      };
      spawnInside(p);
      p.lifeFade = Math.random();
      // Per-particle commitment to morph targets. Most fully snap (1.0),
      // but ~18% only partially commit (0.0 — 0.6), so the rendered word
      // has a "fuzzy halo" of free particles drifting around the edges.
      // ~10% partially commit (drift around the edges as a fuzzy halo);
      // the rest snap fully to the letter shape.
      p.commit = Math.random() < 0.10 ? 0.3 + Math.random() * 0.4 : 1;
      // ~5% of particles act as letter emitters: commit periodically dips,
      // releasing them into the flow then re-locking. Lower count = letters
      // stay readable while the form still breathes.
      p.emitter = Math.random() < 0.05;
      p.emitterPhase = Math.random() * Math.PI * 2;
      p.emitterFreq = 0.35 + Math.random() * 0.45;
      // Tiny per-particle flutter so anchored particles drift slightly
      // around their letter position. Small amplitude keeps glyphs sharp.
      p.fluttFreq = 0.6 + Math.random() * 1.2;
      p.fluttSeed = Math.random() * Math.PI * 2;
      p.fluttAmp = 0.002 + Math.random() * 0.004;
      // ~22% of particles are "fat" — drawn slightly bigger when locked
      // into a letter, so glyph strokes pop a touch over the field.
      p.fat = Math.random() < 0.22;
      // Per-particle window inside the global swap progress — wide stagger
      // so the swarm reorganizes in pronounced waves, not in lockstep.
      // Constrained so every particle's local window finishes by global
      // swap = 1 (delay + dur ≤ 1). Without this, slow-tail particles
      // freeze partway when prevPoints is cleared at swap=1 → looks like
      // the animation "doesn't complete".
      p.swapDelay = Math.random() * 0.30;
      p.swapDur = 0.55 + Math.random() * 0.20; // 0.55 – 0.75
      // Per-particle 3D control-point offset — turns each transition into
      // a unique curved trajectory through space (quadratic Bezier).
      // Magnitudes are large so paths visibly swoop, swirl, and overshoot.
      p.swapCtrlX = (Math.random() - 0.5) * 1.8; // perpendicular bend (XY)
      p.swapCtrlY = (Math.random() - 0.5) * 1.8;
      p.swapCtrlZ = (Math.random() - 0.5) * 1.4; // depth swing
      // Mid-path radial puff so the swarm bulges then collapses.
      p.swapBurst = 0.15 + Math.random() * 0.55;
      // Spin angle traversed mid-transition — particles rotate around the
      // path midpoint in addition to following the curve.
      p.swapSpin = (Math.random() - 0.5) * 1.4;
      // Release window — when the user unhovers, each particle peels off
      // the letter on its own schedule, with a small jiggle along the way.
      p.releaseDelay = Math.random() * 0.45;
      p.releaseDur = 0.45 + Math.random() * 0.35;
      p.jiggleSeed = Math.random() * Math.PI * 2;
      p.jiggleAmp = 0.005 + Math.random() * 0.012;
      particles.push(p);
    }
  }

  let pointerX = -9999, pointerY = -9999; // off-canvas by default = no repulsion
  let prevPointerX = -9999, prevPointerY = -9999;
  let ptrVX = 0, ptrVY = 0; // cursor velocity in pixels/frame, decays each frame
  if (!IS_MOBILE) {
    window.addEventListener('pointermove', (e) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) * DPR;
      const ny = (e.clientY - rect.top)  * DPR;
      if (prevPointerX > -1000) {
        ptrVX = nx - prevPointerX;
        ptrVY = ny - prevPointerY;
      }
      prevPointerX = pointerX = nx;
      prevPointerY = pointerY = ny;
    }, { passive: true });
    window.addEventListener('pointerout', () => {
      pointerX = pointerY = -9999;
      prevPointerX = prevPointerY = -9999;
      ptrVX = ptrVY = 0;
    }, { passive: true });
  }

  // Click shockwave — punches a radial impulse into the particle field.
  // Reuses the spring system: just shoves nearby pushVX/VY outward, the
  // springs ease it back over the next ~1s with their natural overshoot.
  const SHOCK_RADIUS = 380;     // CSS pixels
  const SHOCK_STRENGTH = 78;    // peak impulse
  function shockwave(clientX, clientY) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cxp = (clientX - rect.left) * DPR;
    const cyp = (clientY - rect.top)  * DPR;
    const R = SHOCK_RADIUS * DPR;
    const R2 = R * R;
    const strength = SHOCK_STRENGTH * DPR;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const dx = p.sx - cxp;
      const dy = p.sy - cyp;
      const d2 = dx * dx + dy * dy;
      if (d2 >= R2 || d2 < 0.001) continue;
      const d = Math.sqrt(d2);
      const t = 1 - d / R;
      // Sharper cubic falloff so the ring reads as a punch, not a fade.
      const falloff = t * t * t;
      const imp = falloff * strength;
      p.pushVX += (dx / d) * imp;
      p.pushVY += (dy / d) * imp;
    }
  }
  // Track drag state for the fluid-push mode. Held mouse = continuous
  // larger, stronger force biased toward the cursor's motion direction.
  // Mobile / coarse-pointer: skip all interaction so taps and scrolls
  // pass straight through.
  let isDragging = false;
  if (!IS_MOBILE) {
    canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 && e.button !== undefined) return;
      isDragging = true;
      shockwave(e.clientX, e.clientY);
    }, { passive: true });
    function endDrag() { isDragging = false; }
    window.addEventListener('pointerup', endDrag, { passive: true });
    window.addEventListener('pointercancel', endDrag, { passive: true });
    window.addEventListener('blur', endDrag, { passive: true });
  }

  let last = performance.now();
  let startTime = performance.now();
  let running = true;

  // ----- Morph state -------------------------------------------------------
  // When the user hovers a floating-nav link, particles get pulled toward
  // pixel positions of that word; on unhover, progress eases back to 0 and
  // they're released into the flow again.
  const morph = {
    text: null,            // currently displayed word (null = no morph)
    targetProgress: 0,     // 1 while hovering a link, 0 otherwise
    progress: 0,           // smoothed
    points: null,          // current target point cloud
    prevPoints: null,      // previous word's points — kept during a swap
    swap: 1,               // 0 → 1 progress through a word-to-word transition
    leaveTimer: null,      // delays the unhover so brief jumps don't flicker
    rotating: false,       // when true, points are regenerated each frame
    basePoints3D: null,    // un-rotated source for rotating shapes
    rotateMode: 'tumble',  // 'tumble' = X+Y; 'yaw' = Y only (rooms)
  };

  // Rasterize a word into a sample of {x,y} points in [-1, 1] range.
  function rasterizeWord(word) {
    const off = document.createElement('canvas');
    // Wide canvas so longer phrases ("ALL PROJECTS", "GET IN TOUCH") can
    // sit at a readable size instead of shrinking to a thin line.
    const W2 = 1100, H2 = 280;
    off.width = W2; off.height = H2;
    const c = off.getContext('2d');
    c.fillStyle = '#000';
    c.fillRect(0, 0, W2, H2);
    c.fillStyle = '#fff';
    let fontSize = 240;
    c.textBaseline = 'middle';
    c.textAlign = 'center';
    do {
      c.font = `900 ${fontSize}px Geist, system-ui, sans-serif`;
      if (c.measureText(word).width <= W2 * 0.92) break;
      fontSize -= 8;
    } while (fontSize > 40);
    c.fillText(word, W2 / 2, H2 / 2);

    const img = c.getImageData(0, 0, W2, H2).data;
    const pts = [];
    // Sample every Nth pixel for speed
    const STEP = 3;
    for (let y = 0; y < H2; y += STEP) {
      for (let x = 0; x < W2; x += STEP) {
        const i = (y * W2 + x) * 4;
        if (img[i] > 128) {
          // Canvas y grows down; in our world, positive Y also reads as
          // down (after the pitch transform). Don't flip — straight map.
          pts.push(
            (x / W2 - 0.5) * 2 * 0.9 + (Math.random() - 0.5) * 0.01,
            (y / H2 - 0.5) * 2 * 0.45 + (Math.random() - 0.5) * 0.01
          );
        }
      }
    }
    return pts;
  }

  // Procedural fractal tree — recursive branching, leaf clusters at tips.
  // Returns flat [x,y, x,y, ...] in [-1, 1] world units. Trunk at bottom
  // (positive Y), canopy at top (negative Y).
  function generateTreePoints() {
    const pts = [];
    function branch(x, y, angle, length, depth) {
      const ex = x + Math.cos(angle) * length;
      const ey = y + Math.sin(angle) * length;
      // Sample along the branch — extra thickness for trunk levels.
      const steps = Math.max(6, Math.floor(length * 90));
      const thick = 0.004 + depth * 0.0035;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = x + (ex - x) * t;
        const py = y + (ey - y) * t;
        const w = thick * (1 - t * 0.4); // slight taper
        // Multiple cross-points per step so the branch reads as a thick line
        const cross = Math.max(1, Math.round(depth * 1.2));
        for (let j = -cross; j <= cross; j++) {
          pts.push(px + (j / cross) * w, py + (Math.random() - 0.5) * 0.003);
        }
      }
      if (depth > 0 && length > 0.04) {
        const newLen = length * (0.65 + Math.random() * 0.1);
        const spread = 0.42 + Math.random() * 0.18;
        branch(ex, ey, angle - spread, newLen, depth - 1);
        branch(ex, ey, angle + spread, newLen, depth - 1);
        // Occasional middle branch for variety
        if (Math.random() < 0.35 && depth > 1) {
          branch(ex, ey, angle + (Math.random() - 0.5) * 0.3, newLen * 0.85, depth - 1);
        }
      } else {
        // Leaf cluster at the tip — small disk
        const leafR = 0.05 + Math.random() * 0.03;
        const leafCount = 70;
        for (let i = 0; i < leafCount; i++) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.sqrt(Math.random()) * leafR;
          pts.push(ex + Math.cos(a) * r, ey + Math.sin(a) * r);
        }
      }
    }
    // Trunk grows upward from y=0.45 (bottom) to negative Y
    branch(0, 0.45, -Math.PI / 2, 0.26, 5);
    return pts;
  }

  // 3D torus — major radius R, minor radius r. One sample per particle so
  // the torus reads as a dense surface that can be rotated each frame.
  function generateTorusPoints() {
    const N = particles.length;
    const out = new Float32Array(N * 3);
    const R = 0.55, r = 0.18;
    for (let i = 0; i < N; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const cu = Math.cos(u), su = Math.sin(u);
      const cv = Math.cos(v), sv = Math.sin(v);
      out[i * 3 + 0] = (R + r * cv) * cu;
      out[i * 3 + 1] = r * sv;
      out[i * 3 + 2] = (R + r * cv) * su;
    }
    return out;
  }

  // 3D cube — particles spread evenly across the 6 faces. Reads as a
  // projection-mapped surface as it rotates.
  function generateCubePoints() {
    const N = particles.length;
    const out = new Float32Array(N * 3);
    const S = 0.36; // half-edge (smaller than before)
    for (let i = 0; i < N; i++) {
      const face = i % 6;
      // Two uniform coords on the face plane.
      const u = (Math.random() - 0.5) * 2 * S;
      const v = (Math.random() - 0.5) * 2 * S;
      let x, y, z;
      switch (face) {
        case 0: x =  S; y = u; z = v; break; // +X
        case 1: x = -S; y = u; z = v; break; // -X
        case 2: x = u; y =  S; z = v; break; // +Y
        case 3: x = u; y = -S; z = v; break; // -Y
        case 4: x = u; y = v; z =  S; break; // +Z
        default: x = u; y = v; z = -S;       // -Z
      }
      out[i * 3 + 0] = x;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = z;
    }
    return out;
  }

  // 3D room — wireframe one-point-perspective architectural room. The
  // camera sits at the open front, looking into a deep interior. Particles
  // trace the 12 edges of the room + a floor grid + a framed back wall,
  // so it reads unmistakably as a 3D space, not a cube.
  function generateRoomPoints() {
    const N = particles.length;
    const out = new Float32Array(N * 3);
    // Half-extents. The room is long (deep z) and centered at origin
    // along x/y; z ranges from -HZ (open front, near camera) to +HZ
    // (back wall, far). The viewer's eye sits a bit in front of -HZ.
    const HX = 0.85;
    const HY = 0.55;
    const HZ = 0.90;

    // 12 edges of the box, each parameterized so a sample t∈[0,1] picks
    // a point along the edge. Each edge is a triple of axis-aligned
    // start/end. We pick edges proportionally to their length so longer
    // edges get more particles.
    const edges = [
      // Floor square (4 edges, on the floor at y = -HY)
      ['x', -HX, -HY, -HZ, +HX, -HY, -HZ],   // floor front
      ['x', -HX, -HY, +HZ, +HX, -HY, +HZ],   // floor back
      ['z', -HX, -HY, -HZ, -HX, -HY, +HZ],   // floor left
      ['z', +HX, -HY, -HZ, +HX, -HY, +HZ],   // floor right
      // Ceiling square (4 edges)
      ['x', -HX, +HY, -HZ, +HX, +HY, -HZ],
      ['x', -HX, +HY, +HZ, +HX, +HY, +HZ],
      ['z', -HX, +HY, -HZ, -HX, +HY, +HZ],
      ['z', +HX, +HY, -HZ, +HX, +HY, +HZ],
      // Vertical corner pillars (4 edges from floor to ceiling)
      ['y', -HX, -HY, -HZ, -HX, +HY, -HZ],   // front-left
      ['y', +HX, -HY, -HZ, +HX, +HY, -HZ],   // front-right
      ['y', -HX, -HY, +HZ, -HX, +HY, +HZ],   // back-left
      ['y', +HX, -HY, +HZ, +HX, +HY, +HZ],   // back-right
    ];
    function edgeLen(e) {
      const dx = e[4] - e[1], dy = e[5] - e[2], dz = e[6] - e[3];
      return Math.hypot(dx, dy, dz);
    }
    let totalLen = 0;
    const cumLen = [];
    for (const e of edges) { totalLen += edgeLen(e); cumLen.push(totalLen); }

    // Particle budget breakdown:
    //   38% — the 12 wall edges (room structure)
    //   18% — floor grid lines
    //   10% — framed back wall grid
    //   24% — interior props: pedestal cube, sphere on top, picture frame
    //         on back wall, ceiling spotlight cone
    //   10% — sparse wall fill (no front wall)
    const N_EDGE   = Math.floor(N * 0.38);
    const N_FLOOR  = Math.floor(N * 0.18);
    const N_BACK   = Math.floor(N * 0.10);
    const N_PROPS  = Math.floor(N * 0.24);
    const N_FILL   = N - N_EDGE - N_FLOOR - N_BACK - N_PROPS;

    let idx = 0;
    function push(x, y, z) {
      out[idx * 3 + 0] = x;
      out[idx * 3 + 1] = y;
      out[idx * 3 + 2] = z;
      idx++;
    }

    // ---- 1. Edges ----------------------------------------------------------
    for (let i = 0; i < N_EDGE; i++) {
      const r = Math.random() * totalLen;
      let ei = 0;
      for (; ei < cumLen.length; ei++) if (r <= cumLen[ei]) break;
      const e = edges[ei];
      const t = Math.random();
      // tiny per-axis jitter so dots aren't a hairline.
      const j = 0.005;
      push(
        e[1] + (e[4] - e[1]) * t + (Math.random() - 0.5) * j,
        e[2] + (e[5] - e[2]) * t + (Math.random() - 0.5) * j,
        e[3] + (e[6] - e[3]) * t + (Math.random() - 0.5) * j
      );
    }

    // ---- 2. Floor grid -----------------------------------------------------
    // 5 lines along z (cross-room) at fixed x, plus 7 lines along x at fixed z.
    const xLinesAtZ = 7;
    const zLinesAtX = 5;
    const N_FLOOR_X = Math.floor(N_FLOOR * 0.55);
    const N_FLOOR_Z = N_FLOOR - N_FLOOR_X;
    for (let i = 0; i < N_FLOOR_X; i++) {
      // x-direction line at some z.
      const li = i % xLinesAtZ;
      const z = -HZ + ((li + 0.5) / xLinesAtZ) * (2 * HZ);
      const t = Math.random();
      const x = -HX + t * (2 * HX);
      push(x, -HY + 0.001, z);
    }
    for (let i = 0; i < N_FLOOR_Z; i++) {
      const li = i % zLinesAtX;
      const x = -HX + ((li + 0.5) / zLinesAtX) * (2 * HX);
      const t = Math.random();
      const z = -HZ + t * (2 * HZ);
      push(x, -HY + 0.001, z);
    }

    // ---- 3. Back wall frame + grid -----------------------------------------
    // Outline rectangle bias + horizontal/vertical lines.
    for (let i = 0; i < N_BACK; i++) {
      const k = Math.random();
      let x, y;
      if (k < 0.5) {
        // Inset horizontal lines.
        const ny = 4;
        const li = i % ny;
        y = -HY + ((li + 1) / (ny + 1)) * (2 * HY);
        x = -HX + Math.random() * (2 * HX);
      } else {
        // Inset vertical lines.
        const nx = 5;
        const li = i % nx;
        x = -HX + ((li + 1) / (nx + 1)) * (2 * HX);
        y = -HY + Math.random() * (2 * HY);
      }
      push(x, y, HZ - 0.001);
    }

    // ---- 3b. Interior props ------------------------------------------------
    // (a) pedestal cube on the floor mid-room
    // (b) sphere sitting on top of the pedestal
    // (c) picture frame mounted on the back wall
    // (d) ceiling spotlight cone shining down on the prop
    {
      const PED_HX = 0.16, PED_HZ = 0.16; // pedestal footprint half-extents
      const PED_BOTTOM = -HY;
      const PED_TOP = -HY + 0.32;        // pedestal height
      const PED_CZ = 0.10;                // pedestal pushed slightly into the room
      const SPHERE_R = 0.13;
      const SPHERE_CY = PED_TOP + SPHERE_R;
      const SPHERE_CZ = PED_CZ;
      const FRAME_HX = 0.30, FRAME_HY = 0.22;
      const FRAME_CY = 0.05;              // frame center on back wall
      const SPOT_FROM_Y = HY;             // ceiling
      const SPOT_TO_R = 0.30;             // bottom radius of cone at floor level

      // Allocations within the props budget.
      const N_PED    = Math.floor(N_PROPS * 0.34); // pedestal box
      const N_SPHERE = Math.floor(N_PROPS * 0.26); // sphere on top
      const N_FRAME  = Math.floor(N_PROPS * 0.20); // picture frame
      const N_SPOT   = N_PROPS - N_PED - N_SPHERE - N_FRAME;

      // (a) pedestal — box wireframe (edges + sparse face dots)
      for (let i = 0; i < N_PED; i++) {
        const r = Math.random();
        let x, y, z;
        if (r < 0.55) {
          // 4 vertical edges
          const corner = i % 4;
          x = PED_CZ + 0; // placeholder, override per corner
          const sx = (corner === 0 || corner === 3) ? -PED_HX : PED_HX;
          const sz = (corner === 0 || corner === 1) ? -PED_HZ : PED_HZ;
          x = sx;
          z = PED_CZ + sz;
          y = PED_BOTTOM + Math.random() * (PED_TOP - PED_BOTTOM);
        } else if (r < 0.78) {
          // top rim
          const t = Math.random();
          if (Math.random() < 0.5) {
            x = -PED_HX + t * (2 * PED_HX);
            z = PED_CZ + (Math.random() < 0.5 ? -PED_HZ : PED_HZ);
          } else {
            x = (Math.random() < 0.5 ? -PED_HX : PED_HX);
            z = PED_CZ + (-PED_HZ + t * (2 * PED_HZ));
          }
          y = PED_TOP;
        } else {
          // sparse top-face fill
          x = -PED_HX + Math.random() * (2 * PED_HX);
          z = PED_CZ + (-PED_HZ + Math.random() * (2 * PED_HZ));
          y = PED_TOP + 0.001;
        }
        push(x, y, z);
      }

      // (b) sphere on the pedestal — surface points
      for (let i = 0; i < N_SPHERE; i++) {
        const u = Math.random(), v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
        const r = SPHERE_R + (Math.random() - 0.5) * 0.005;
        push(
          0 + r * Math.sin(phi) * Math.cos(theta),
          SPHERE_CY + r * Math.cos(phi),
          SPHERE_CZ + r * Math.sin(phi) * Math.sin(theta)
        );
      }

      // (c) picture frame on back wall — outline rectangle
      for (let i = 0; i < N_FRAME; i++) {
        const side = i % 4;
        const t = Math.random();
        let fx, fy;
        if (side === 0) { fx = -FRAME_HX + t * (2 * FRAME_HX); fy = FRAME_CY + FRAME_HY; }
        else if (side === 1) { fx = -FRAME_HX + t * (2 * FRAME_HX); fy = FRAME_CY - FRAME_HY; }
        else if (side === 2) { fx = -FRAME_HX; fy = (FRAME_CY - FRAME_HY) + t * (2 * FRAME_HY); }
        else { fx = FRAME_HX; fy = (FRAME_CY - FRAME_HY) + t * (2 * FRAME_HY); }
        push(fx, fy, HZ - 0.002);
      }

      // (d) ceiling spotlight — narrow cone of points from a point on the
      // ceiling down to a circular pool on the floor in front of the prop.
      const SPOT_FROM_Z = SPHERE_CZ;
      for (let i = 0; i < N_SPOT; i++) {
        const tParam = Math.random();
        const radius = tParam * SPOT_TO_R;
        const angle = Math.random() * Math.PI * 2;
        const yPos = SPOT_FROM_Y - tParam * (SPOT_FROM_Y - PED_BOTTOM);
        push(
          radius * Math.cos(angle),
          yPos,
          SPOT_FROM_Z + radius * Math.sin(angle)
        );
      }
    }

    // ---- 4. Sparse wall fill ----------------------------------------------
    // Distribute across left, right, ceiling, back, floor (no front).
    for (let i = 0; i < N_FILL; i++) {
      const wall = Math.floor(Math.random() * 5);
      let x, y, z;
      switch (wall) {
        case 0: x = -HX; y = (Math.random() - 0.5) * 2 * HY; z = (Math.random() - 0.5) * 2 * HZ; break;
        case 1: x =  HX; y = (Math.random() - 0.5) * 2 * HY; z = (Math.random() - 0.5) * 2 * HZ; break;
        case 2: x = (Math.random() - 0.5) * 2 * HX; y =  HY; z = (Math.random() - 0.5) * 2 * HZ; break;
        case 3: x = (Math.random() - 0.5) * 2 * HX; y = -HY; z = (Math.random() - 0.5) * 2 * HZ; break;
        default: x = (Math.random() - 0.5) * 2 * HX; y = (Math.random() - 0.5) * 2 * HY; z = HZ;
      }
      push(x, y, z);
    }

    // Single-pass post-process:
    //  - flip Y (render maps +Y to bottom of screen; generator uses up=+Y)
    //  - scale entire room down so it sits comfortably in the canvas
    const ROOM_SCALE = 0.7;
    for (let i = 0; i < N; i++) {
      out[i * 3 + 0] *= ROOM_SCALE;
      out[i * 3 + 1] *= -ROOM_SCALE;
      out[i * 3 + 2] *= ROOM_SCALE;
    }

    return out;
  }

  function buildMorphTargets(spec) {
    // Reset rotating state — only re-enabled by 3D shapes.
    morph.rotating = false;
    morph.basePoints3D = null;
    morph.rotateMode = 'tumble';

    // 3D rotating torus — store base points; render loop rotates them live.
    if (spec && typeof spec === 'object' && spec.shape === 'torus') {
      const base = generateTorusPoints();
      morph.basePoints3D = base;
      morph.rotating = true;
      morph.points = new Float32Array(base);
      return;
    }
    // 3D rotating cube — particles tile the 6 faces; rotates each frame.
    if (spec && typeof spec === 'object' && spec.shape === 'cube') {
      const base = generateCubePoints();
      morph.basePoints3D = base;
      morph.rotating = true;
      morph.points = new Float32Array(base);
      return;
    }
    // 3D rotating room — interior surfaces with edge density. Yaw only
    // so the floor stays down + ceiling stays up while the camera orbits.
    if (spec && typeof spec === 'object' && spec.shape === 'room') {
      const base = generateRoomPoints();
      morph.basePoints3D = base;
      morph.rotating = true;
      morph.rotateMode = 'yaw';
      morph.points = new Float32Array(base);
      return;
    }

    let flat = null;
    if (spec && typeof spec === 'object' && spec.shape === 'tree') {
      flat = generateTreePoints();
    } else if (typeof spec === 'string' && spec.length) {
      flat = rasterizeWord(spec.toUpperCase());
    }
    if (!flat) { morph.points = null; return; }
    const sampleCount = flat.length / 2;
    if (sampleCount === 0) { morph.points = null; return; }
    // Assign each particle a target (cycled through samples)
    const out = new Float32Array(particles.length * 3);
    for (let i = 0; i < particles.length; i++) {
      const sIdx = (i % sampleCount) * 2;
      out[i * 3 + 0] = flat[sIdx];
      out[i * 3 + 1] = flat[sIdx + 1];
      // Tiny z scatter so the form reads with a hint of depth
      out[i * 3 + 2] = (Math.random() - 0.5) * 0.08;
    }
    morph.points = out;
  }

  // Spec can be: a string (word), null (release), or { shape: 'tree' }.
  function setMorphTarget(spec) {
    const key = !spec ? null : (typeof spec === 'string' ? spec : `__shape:${spec.shape}`);
    if (morph.text === key) return;

    // Cancel any pending unhover — moving from one link directly to another
    // should never dip through the "no morph" state.
    if (morph.leaveTimer != null) {
      clearTimeout(morph.leaveTimer);
      morph.leaveTimer = null;
    }

    if (spec) {
      // Word-to-word (or shape) swap: capture the visual state as the new
      // prevPoints. If we're mid-swap, blend prev → current at the current
      // swap progress so the next animation starts EXACTLY where the eyes
      // see — no jump back to the un-blended previous form.
      if (morph.points && morph.text) {
        if (morph.prevPoints && morph.swap < 1) {
          const len = morph.points.length;
          const snap = new Float32Array(len);
          const s = morph.swap;
          for (let i = 0; i < len; i++) {
            snap[i] = morph.prevPoints[i] + (morph.points[i] - morph.prevPoints[i]) * s;
          }
          morph.prevPoints = snap;
        } else {
          morph.prevPoints = morph.points;
        }
        morph.swap = 0;
      } else {
        morph.prevPoints = null;
        morph.swap = 1;
      }
      morph.text = key;
      buildMorphTargets(spec);
      morph.targetProgress = 1;
    } else {
      // Brief delay before releasing — gives the user a chance to land on
      // an adjacent link without the particles flashing back to free flow.
      morph.leaveTimer = setTimeout(() => {
        morph.leaveTimer = null;
        morph.text = null;
        morph.targetProgress = 0;
      }, 220);
    }
  }
  // Public API for the floating-nav hover listeners below.
  // - __coverMorph(text|null): word morph (also accepts null to release)
  // - __coverShape(name|null): special shape (e.g. 'tree')
  window.__coverMorph = setMorphTarget;
  window.__coverShape = (name) => setMorphTarget(name ? { shape: name } : null);

  // ----- Particle coordinate labels --------------------------------------
  // Always-on debug overlay: a handful of particles carry a small live
  // coordinate readout in a random color, drifting along with the flow.
  let labelsActive = true;
  let labelIndices = [];
  let labelHues = [];     // one hue per labeled particle, stable
  function setCoverLabels(on) {
    labelsActive = on !== false; // default to enabled
    // Mobile: skip label rendering entirely (saves a lot of text fillText
    // ops per frame).
    if (IS_MOBILE) labelsActive = false;
    if (!labelsActive) { labelIndices = []; labelHues = []; return; }
    labelIndices = [];
    labelHues = [];
    const want = 50;
    const seen = new Set();
    while (labelIndices.length < want && seen.size < particles.length) {
      const i = (Math.random() * particles.length) | 0;
      if (seen.has(i)) continue;
      seen.add(i);
      labelIndices.push(i);
      labelHues.push((Math.random() * 360) | 0);
    }
  }
  window.__coverLabels = setCoverLabels;

  // Service tags — small mono labels attached to a handful of particles
  // (numbered 01..N · LABEL), shown while a service item is hovered.
  let serviceTagIndices = [];
  let serviceTagLabels = [];
  function setCoverServiceTags(arr) {
    if (!arr || !arr.length) {
      serviceTagIndices = [];
      serviceTagLabels = [];
      return;
    }
    serviceTagLabels = arr.slice();
    serviceTagIndices = [];
    const seen = new Set();
    while (serviceTagIndices.length < serviceTagLabels.length && seen.size < particles.length) {
      const i = (Math.random() * particles.length) | 0;
      if (seen.has(i)) continue;
      seen.add(i);
      serviceTagIndices.push(i);
    }
  }
  window.__coverServiceTags = setCoverServiceTags;

  function frame(now) {
    if (!running) return;
    const dt = Math.min(now - last, 50) / 1000; // seconds
    last = now;
    const elapsed = (now - startTime) / 1000;

    // Slow auto-yaw. No cursor-driven tilt — cursor only repels particles.
    cam.yaw += dt * 0.05;

    // Hard black wash so dots stay sharp (no trails)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const baseR = Math.min(W, H) * 0.45;
    const yawCos = Math.cos(cam.yaw);
    const yawSin = Math.sin(cam.yaw);
    const pitchCos = Math.cos(cam.pitch);
    const pitchSin = Math.sin(cam.pitch);

    // Drag mode boosts radius / strength / wake.
    const activeR = (isDragging ? DRAG_RADIUS : REPEL_RADIUS) * DPR;
    const activeStrength = (isDragging ? DRAG_STRENGTH : REPEL_STRENGTH) * DPR;
    const activeWake = isDragging ? DRAG_WAKE : REPEL_WAKE;
    const activeR2 = activeR * activeR;
    const cursorActive = pointerX > -1000;
    // Decay cursor velocity each frame so the wake fades naturally. While
    // dragging we let it persist longer so a held drag keeps pushing.
    const ptrDecay = isDragging ? 0.92 : 0.82;
    ptrVX *= ptrDecay;
    ptrVY *= ptrDecay;

    // Ease live flow params toward their targets so preset switches feel
    // organic, not abrupt.
    const flowLerp = 0.06;
    // Subtle ambient breathing — when no preset wind is active, gently
    // modulate wind/swirl on long sine cycles so the default state still
    // feels alive instead of static.
    const ambientWind = (flowTarget.windX === 0 && flowTarget.windY === 0)
      ? { x: Math.sin(elapsed * 0.11) * 0.05,
          y: Math.cos(elapsed * 0.083) * 0.025 }
      : { x: 0, y: 0 };
    const ambientSwirlBoost = (flowTarget.swirl !== 0)
      ? Math.sin(elapsed * 0.07) * 0.04
      : 0;

    NOISE_SCALE += (flowTarget.noiseScale - NOISE_SCALE) * flowLerp;
    FLOW_SPEED  += (flowTarget.flowSpeed  - FLOW_SPEED)  * flowLerp;
    TIME_DRIFT  += (flowTarget.timeDrift  - TIME_DRIFT)  * flowLerp;
    SWIRL       += (flowTarget.swirl + ambientSwirlBoost - SWIRL) * flowLerp;
    RADIAL      += (flowTarget.radial     - RADIAL)      * flowLerp;
    JITTER      += (flowTarget.jitter     - JITTER)      * flowLerp;
    WIND_X      += ((flowTarget.windX || 0) + ambientWind.x - WIND_X) * flowLerp;
    WIND_Y      += ((flowTarget.windY || 0) + ambientWind.y - WIND_Y) * flowLerp;

    const tNoise = elapsed * TIME_DRIFT;

    // Smooth morph progress toward target — eased so transitions feel soft.
    // Slower decay when releasing so the per-particle stagger reads.
    const easeRate = morph.targetProgress > morph.progress ? 0.08 : 0.04;
    morph.progress += (morph.targetProgress - morph.progress) * easeRate;
    if (morph.swap < 1) {
      // Slow global swap so per-particle stagger + arcs read clearly.
      morph.swap = Math.min(1, morph.swap + dt * 0.65); // ~1.55s swap
      if (morph.swap >= 1) morph.prevPoints = null;
    }

    // Live-rotate the 3D shape's base points into morph.points each frame.
    if (morph.rotating && morph.basePoints3D && morph.points) {
      const yawOnly = morph.rotateMode === 'yaw';
      const rotY = elapsed * (yawOnly ? 0.35 : 0.6);
      const rotX = yawOnly ? 0 : elapsed * 0.32;
      const cyR = Math.cos(rotY), syR = Math.sin(rotY);
      const cxR = Math.cos(rotX), sxR = Math.sin(rotX);
      const src = morph.basePoints3D;
      const dst = morph.points;
      const n = src.length;
      if (yawOnly) {
        // Pure Y rotation — floor stays down, ceiling stays up.
        for (let i = 0; i < n; i += 3) {
          const x0 = src[i], z0 = src[i + 2];
          dst[i] = x0 * cyR + z0 * syR;
          dst[i + 1] = src[i + 1];
          dst[i + 2] = -x0 * syR + z0 * cyR;
        }
      } else {
        for (let i = 0; i < n; i += 3) {
          const x0 = src[i], y0 = src[i + 1], z0 = src[i + 2];
          const x1 = x0 * cyR + z0 * syR;
          const z1 = -x0 * syR + z0 * cyR;
          const y2 = y0 * cxR - z1 * sxR;
          const z2 = y0 * sxR + z1 * cxR;
          dst[i] = x1;
          dst[i + 1] = y2;
          dst[i + 2] = z2;
        }
      }
    }
    if (morph.progress < 0.001 && morph.targetProgress === 0) {
      morph.progress = 0;
      morph.points = null;
      morph.prevPoints = null;
    }
    const mp = morph.progress;
    const hasTargets = mp > 0.001 && morph.points;

    // Render directly via fillRect on a 1×1 footprint — sharp pixel dots.
    // Group fillStyle changes via simple alpha bucketing for perf.
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Sample curl field at this particle's position
      const [vx, vy, vz] = curl(
        p.x * NOISE_SCALE,
        p.y * NOISE_SCALE,
        p.z * NOISE_SCALE,
        tNoise
      );

      // Move along the flow
      p.x += vx * FLOW_SPEED * dt;
      p.y += vy * FLOW_SPEED * dt;
      p.z += vz * FLOW_SPEED * dt;

      // Preset-driven extra forces.
      if (SWIRL !== 0) {
        // Tangential rotation around z-axis — particles orbit the center.
        p.x += -p.y * SWIRL * dt;
        p.y +=  p.x * SWIRL * dt;
      }
      if (RADIAL !== 0) {
        const rd = Math.hypot(p.x, p.y) + 1e-5;
        p.x += (p.x / rd) * RADIAL * dt;
        p.y += (p.y / rd) * RADIAL * dt;
      }
      if (JITTER !== 0) {
        p.x += (Math.random() - 0.5) * JITTER;
        p.y += (Math.random() - 0.5) * JITTER;
      }
      if (WIND_X !== 0 || WIND_Y !== 0) {
        p.x += WIND_X * dt;
        p.y += WIND_Y * dt;
      }

      // Recycle when either the per-particle travel radius is exceeded or
      // its lifetime runs out — staggered deaths instead of one big purge
      // at the bounding sphere.
      p.life += dt;
      const dist2 = p.x * p.x + p.y * p.y + p.z * p.z;
      const tr = p.travelRadius || FIELD_R;
      if (dist2 > tr * tr || p.life >= p.maxLife) {
        spawnInside(p);
      }

      // Per-particle fade-in rate (varies, set in spawnInside).
      p.lifeFade = Math.min(1, p.lifeFade + dt * (p.fadeInRate || 2.0));
      // Fade out toward end of lifetime — last 30% of life dims out.
      const ageK = p.maxLife > 0 ? p.life / p.maxLife : 0;
      const ageFade = ageK > 0.7 ? Math.max(0, 1 - (ageK - 0.7) / 0.3) : 1;
      p.alphaMul = p.lifeFade * ageFade;

      // Flow path: apply full camera transform (yaw + pitch + perspective).
      const focal = baseR * 1.8;
      const flx = p.x * baseR;
      const fly = p.y * baseR;
      const flz = p.z * baseR;
      const fcx = flx * yawCos - flz * yawSin;
      const fcz = flx * yawSin + flz * yawCos;
      const fcy = fly * pitchCos - fcz * pitchSin;
      const fcz3 = fly * pitchSin + fcz * pitchCos;
      const fpersp = focal / (focal + fcz3);
      const flowSx = cx + fcx * fpersp;
      const flowSy = cy + fcy * fpersp;
      const flowDepth = fpersp;

      let sx = flowSx, sy = flowSy, depth = flowDepth;
      p.morphCommit = 0;

      if (hasTargets) {
        const ti = i * 3;
        let tx, ty, tz;
        if (morph.prevPoints && morph.swap < 1) {
          // Per-particle stagger window
          const local = (morph.swap - (p.swapDelay || 0)) / (p.swapDur || 1);
          const t = local <= 0 ? 0 : (local >= 1 ? 1 : local);
          // Ease-in-out cubic — accelerates into motion, decelerates into shape
          const eio = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          // Bell that peaks mid-transition (used for spin + radial puff)
          const bell = Math.sin(t * Math.PI);

          const px = morph.prevPoints[ti], py = morph.prevPoints[ti + 1], pz = morph.prevPoints[ti + 2];
          const nx = morph.points[ti],     ny = morph.points[ti + 1],     nz = morph.points[ti + 2];
          // Build a per-particle 3D control point offset perpendicular-ish
          // from the old→new line, plus a depth swing. Quadratic Bezier
          // through (prev, ctrl, new) gives each particle its own swooping
          // curved trajectory rather than a tween straight line.
          const dx = nx - px, dy = ny - py;
          const cx0 = (px + nx) * 0.5;
          const cy0 = (py + ny) * 0.5;
          const cz0 = (pz + nz) * 0.5;
          // Mix a perpendicular bend (rotated direction) with a free random
          // offset — combination keeps paths organic rather than uniform.
          const perpScale = (p.swapCtrlX || 0);
          const ctrlX = cx0 + (-dy) * perpScale + (p.swapCtrlX || 0) * 0.25;
          const ctrlY = cy0 + ( dx) * perpScale + (p.swapCtrlY || 0) * 0.25;
          const ctrlZ = cz0 + (p.swapCtrlZ || 0) * 0.5;

          // Quadratic Bezier evaluation in 3D
          const u = 1 - eio;
          let bx = u * u * px + 2 * u * eio * ctrlX + eio * eio * nx;
          let by = u * u * py + 2 * u * eio * ctrlY + eio * eio * ny;
          const bz = u * u * pz + 2 * u * eio * ctrlZ + eio * eio * nz;

          // Mid-transition spin around the path midpoint — adds rotational
          // dynamism so paths twist around each other.
          const ang = bell * (p.swapSpin || 0);
          if (ang !== 0) {
            const cs = Math.cos(ang), sn = Math.sin(ang);
            const ox = bx - cx0, oy = by - cy0;
            bx = cx0 + ox * cs - oy * sn;
            by = cy0 + ox * sn + oy * cs;
          }

          // Outward radial puff from origin — swarm bulges then converges.
          const mLen = Math.hypot(cx0, cy0) + 1e-6;
          const burst = bell * (p.swapBurst || 0);
          tx = bx + (cx0 / mLen) * burst;
          ty = by + (cy0 / mLen) * burst;
          tz = bz;
        } else {
          tx = morph.points[ti];
          ty = morph.points[ti + 1];
          tz = morph.points[ti + 2];
        }
        // Target screen position — map directly with no yaw/pitch so the
        // text always reads frontal regardless of camera orbit.
        const tpersp = focal / (focal + tz * baseR);
        const targetSx = cx + tx * baseR * tpersp;
        const targetSy = cy + ty * baseR * tpersp;
        const targetDepth = tpersp;

        // Cap committed particles at <1 so the live flow always bleeds
        // through. Particles never fully freeze — they breathe along the
        // curl flow at their target position, while still reading as text.
        // Slightly under 1 so letters keep a hint of motion.
        const COMMIT_CAP = 0.95;
        const personalCommit = p.commit != null ? p.commit : 1;
        // Emitter cycle — periodically drops this particle's commit to 0
        // so it drifts off into the flow then snaps back to its anchor.
        let emitterMul = 1;
        if (p.emitter) {
          const ph = Math.sin(elapsed * p.emitterFreq + p.emitterPhase);
          if (ph > 0.4) emitterMul = Math.max(0, 1 - (ph - 0.4) * 1.7);
        }

        // While releasing (mp falling, intent is 0), each particle peels
        // off on its own staggered window so they don't all let go at once.
        let perParticleMp = mp;
        if (morph.targetProgress === 0 && mp < 1) {
          const releaseT = 1 - mp;
          const localR = (releaseT - (p.releaseDelay || 0)) / (p.releaseDur || 1);
          const cR = localR <= 0 ? 0 : (localR >= 1 ? 1 : localR);
          const easedR = 1 - Math.pow(1 - cR, 3);
          perParticleMp = 1 - easedR;
        }

        const commit = perParticleMp * COMMIT_CAP * personalCommit * emitterMul;
        // Anchored particles still flutter along low-frequency sine drifts
        // around their letter position so the form reads as alive, not frozen.
        let flutterX = 0, flutterY = 0;
        if (commit > 0.2) {
          const f = elapsed * p.fluttFreq + p.fluttSeed;
          flutterX = Math.sin(f) * p.fluttAmp * baseR;
          flutterY = Math.cos(f * 1.3 + 1.0) * p.fluttAmp * baseR;
        }
        sx = flowSx + (targetSx + flutterX - flowSx) * commit;
        sy = flowSy + (targetSy + flutterY - flowSy) * commit;
        depth = flowDepth + (targetDepth - flowDepth) * commit;
        p.morphCommit = commit;

        // Juggle: small sinusoidal jiggle that peaks mid-release and
        // tapers at both ends. Only audible while particles are letting go.
        if (morph.targetProgress === 0 && mp > 0.001 && mp < 1) {
          const jt = 1 - mp; // 0..1 release timeline
          const env = Math.sin(jt * Math.PI); // bell curve
          const wob = Math.sin(now * 0.018 + p.jiggleSeed) * p.jiggleAmp * env * baseR;
          const wob2 = Math.cos(now * 0.022 + p.jiggleSeed * 1.7) * p.jiggleAmp * env * baseR;
          sx += wob;
          sy += wob2;
        }
      }

      // Mouse repulsion — spring physics with cursor-velocity wake.
      let targetPushX = 0, targetPushY = 0;
      let falloff = 0;
      if (cursorActive) {
        const ddx = sx - pointerX;
        const ddy = sy - pointerY;
        const d2 = ddx * ddx + ddy * ddy;
        if (d2 < activeR2 && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const t = 1 - d / activeR;
          const ease = t * t * (3 - 2 * t);
          falloff = ease * ease; // soft cubic ramp
          const push = falloff * activeStrength;
          targetPushX = (ddx / d) * push;
          targetPushY = (ddy / d) * push;
        }
      }
      // Spring step toward target push — soft return so released
      // particles glide back instead of snapping.
      const fx = (targetPushX - p.pushSx) * p.stiff;
      const fy = (targetPushY - p.pushSy) * p.stiff;
      p.pushVX = (p.pushVX + fx) * REPEL_DAMP;
      p.pushVY = (p.pushVY + fy) * REPEL_DAMP;
      // Cursor-velocity wake — particles in range get nudged in the
      // cursor's motion direction. Stronger while dragging (fluid push).
      if (falloff > 0.001) {
        p.pushVX += ptrVX * falloff * activeWake;
        p.pushVY += ptrVY * falloff * activeWake;
      }
      p.pushSx += p.pushVX;
      p.pushSy += p.pushVY;
      p.repelFalloff = falloff;

      p.sx = sx + p.pushSx;
      p.sy = sy + p.pushSy;
      p.depth = depth;
    }

    // Two-pass render: back layer first, then bright foreground. Bucketing
    // by depth into 4 alpha tiers avoids per-particle fillStyle thrash.
    const tiers = [
      { min: 0.45, max: 0.7,  alpha: 0.18, size: 1 },
      { min: 0.7,  max: 0.95, alpha: 0.42, size: 1 },
      { min: 0.95, max: 1.2,  alpha: 0.72, size: 1 },
      { min: 1.2,  max: 5.0,  alpha: 1.0,  size: 1 },
    ];

    for (let tier = 0; tier < tiers.length; tier++) {
      const T = tiers[tier];
      ctx.fillStyle = `rgba(255,255,255,${T.alpha})`;
      const baseSz = T.size * DPR;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.depth < T.min || p.depth >= T.max) continue;
        if (p.sx < -2 || p.sy < -2 || p.sx > W + 2 || p.sy > H + 2) continue;
        const am = p.alphaMul != null ? p.alphaMul : p.lifeFade;
        if (am < 1 && Math.random() > am) continue;
        // Pushed particles swell slightly — gives the field weight as the
        // cursor moves through it.
        let sz = baseSz;
        if (p.repelFalloff > 0) sz *= 1 + p.repelFalloff * REPEL_SIZE_BOOST;
        // Fat particles bulk up while heavily committed to a letter.
        if (p.fat && (p.morphCommit || 0) > 0.5) sz *= 1.7;
        ctx.fillRect((p.sx - sz / 2) | 0, (p.sy - sz / 2) | 0, Math.max(1, sz), Math.max(1, sz));
      }
    }

    // Single-number coordinate labels — random-colored mono digits drift
    // alongside a small subset of particles for a debug-overlay vibe.
    if (labelsActive && labelIndices.length) {
      const fontPx = Math.max(8, Math.round(9 * DPR));
      ctx.font = `${fontPx}px ui-monospace, Menlo, Consolas, monospace`;
      ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(1, DPR * 0.4);
      const offX = 8 * DPR;
      for (let li = 0; li < labelIndices.length; li++) {
        const idx = labelIndices[li];
        const p = particles[idx];
        if (!p) continue;
        if (p.sx < 0 || p.sy < 0 || p.sx > W || p.sy > H) continue;
        const am = p.alphaMul != null ? p.alphaMul : 1;
        if (am < 0.2) continue;
        const txt = (p.sx / DPR).toFixed(0).padStart(4, ' ');
        const tx = p.sx + offX;
        const ty = p.sy;
        const hue = labelHues[li] || 0;
        // Bright, fully opaque label — number only, no leader/dash.
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.fillText(txt, tx, ty);
      }
    }

    // Service tags — green index + white keyword next to a handful of
    // particles. Drift along with their flow until the service is unhovered.
    if (serviceTagIndices.length) {
      const fontPx = Math.max(11, Math.round(12 * DPR));
      ctx.font = `500 ${fontPx}px ui-monospace, Menlo, Consolas, monospace`;
      ctx.textBaseline = 'middle';
      const offX = 10 * DPR;
      for (let li = 0; li < serviceTagIndices.length; li++) {
        const idx = serviceTagIndices[li];
        const p = particles[idx];
        if (!p) continue;
        if (p.sx < 0 || p.sy < 0 || p.sx > W || p.sy > H) continue;
        const am = p.alphaMul != null ? p.alphaMul : 1;
        if (am < 0.25) continue;
        const num = String(li + 1).padStart(2, '0');
        const lab = serviceTagLabels[li] || '';
        const tx = p.sx + offX;
        const ty = p.sy;
        ctx.fillStyle = '#4ade80';
        ctx.fillText(num, tx, ty);
        const numW = ctx.measureText(num).width;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(' ' + lab, tx + numW, ty);
      }
    }

    requestAnimationFrame(frame);
  }

  function start() {
    resize();
    build();
    // Pick the random subset of particles that carry coordinate labels.
    setCoverLabels(true);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    last = performance.now();
    startTime = last;
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => { resize(); build(); setCoverLabels(true); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  start();
})();

// Cover is just 100vh, footer follows in normal flow — no scroll JS needed.
// IntersectionObserver toggles `body.footer-visible` so footer.css can fire
// its content fade-in when the user actually reaches the footer.
(function () {
  const footerEl = document.querySelector('.site-footer');
  if (!footerEl || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    document.body.classList.toggle('footer-visible', entries[0].isIntersecting);
  }, { threshold: 0.05 });
  io.observe(footerEl);
})();
