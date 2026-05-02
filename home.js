// ========== COVER: HIGH-DENSITY FLOW FIELD ==========
// Thousands of fine 1px particles drifting through a 3D curl-noise vector
// field. Sharp dots, no glow, no additive blending. Particles that exit
// the bounding sphere are recycled back near the center on a new flow
// trajectory — endless emission.

(function () {
  const canvas = document.getElementById('coverCanvas');
  if (!canvas) return;
  // WebGL2 — orders of magnitude faster on machines with a real iGPU,
  // but materially SLOWER than the SoA Canvas 2D path when the browser
  // falls back to software rasterization (SwiftShader/llvmpipe). Probe
  // the unmasked renderer string on a throwaway canvas before deciding,
  // so users on software-WebGL machines stay on the 2D path.
  function probeWebGL2Renderer() {
    try {
      const probe = document.createElement('canvas');
      const g = probe.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
      if (!g) return { ok: false };
      const dbg = g.getExtension('WEBGL_debug_renderer_info');
      const renderer = dbg ? (g.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
      const r = renderer.toLowerCase();
      const software = !renderer ||
        r.includes('swiftshader') ||
        r.includes('software') ||
        r.includes('llvmpipe') ||
        r.includes('basic render') ||
        r.includes('microsoft basic') ||
        r.includes('apple software') ||
        r.indexOf('angle (software') !== -1;
      return { ok: !software, renderer };
    } catch {
      return { ok: false };
    }
  }
  // Manual override for debugging: localStorage.setItem('cover-no-webgl','1')
  // forces the 2D fallback even on hardware-accelerated browsers.
  let force2D = false;
  try { force2D = localStorage.getItem('cover-no-webgl') === '1'; } catch {}
  const probe = force2D ? { ok: false } : probeWebGL2Renderer();
  // Note: desynchronized:true caused stutter on some Windows/ANGLE/G-Sync
  // setups even on fast GPUs. Letting the browser sync normally fixes it.
  const gl = probe.ok ? canvas.getContext('webgl2', {
    alpha: false, antialias: false, premultipliedAlpha: false,
    preserveDrawingBuffer: false,
  }) : null;
  const useWebGL = !!gl;
  if (typeof console !== 'undefined' && console.log) {
    console.log('[cover] renderer:', useWebGL ? `WebGL2 (${probe.renderer || 'unknown'})` : '2D fallback' + (force2D ? ' (forced)' : ''));
  }
  let ctx;            // 2D context — main canvas in fallback, sibling overlay in WebGL mode.
  let overlayCanvas;  // sibling 2D canvas for constellation/labels/tags when WebGL is active.
  if (useWebGL) {
    overlayCanvas = document.createElement('canvas');
    overlayCanvas.className = 'cover-media-overlay';
    overlayCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block;';
    if (canvas.parentNode) canvas.parentNode.insertBefore(overlayCanvas, canvas.nextSibling);
    ctx = overlayCanvas.getContext('2d', { alpha: true });
  } else {
    ctx = canvas.getContext('2d', { alpha: false });
  }
  if (!ctx) return;

  // Mobile / coarse-pointer detection — fewer particles, no input handlers.
  const IS_MOBILE = (window.matchMedia && (
    window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  ));
  // Hard cap. Render path iterates `activeCount` (≤ COUNT) so the
  // FPS throttle below can shrink the effective swarm without
  // re-allocating any of the typed-array storage.
  const COUNT = IS_MOBILE ? 2000 : 38000;
  let activeCount = COUNT;
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
  // Struct-of-Arrays particle storage — typed arrays for the entire
  // hot path. Lets V8 keep everything in monomorphic, contiguous,
  // indexable memory and avoids per-particle object property lookups.
  const pX        = new Float32Array(COUNT);
  const pY        = new Float32Array(COUNT);
  const pZ        = new Float32Array(COUNT);
  const pSx       = new Float32Array(COUNT);
  const pSy       = new Float32Array(COUNT);
  const pDepth    = new Float32Array(COUNT);
  const pLifeFade = new Float32Array(COUNT);
  const pAlphaMul = new Float32Array(COUNT);
  const pLife     = new Float32Array(COUNT);
  const pMaxLife  = new Float32Array(COUNT);
  const pFadeRate = new Float32Array(COUNT);
  const pTravelR  = new Float32Array(COUNT);
  const pAlphaPh  = new Float32Array(COUNT);
  const pPushSx   = new Float32Array(COUNT);
  const pPushSy   = new Float32Array(COUNT);
  const pPushVX   = new Float32Array(COUNT);
  const pPushVY   = new Float32Array(COUNT);
  const pStiff    = new Float32Array(COUNT);
  const pCommit   = new Float32Array(COUNT);
  const pEmitPh   = new Float32Array(COUNT);
  const pEmitFq   = new Float32Array(COUNT);
  const pFluttFq  = new Float32Array(COUNT);
  const pFluttSd  = new Float32Array(COUNT);
  const pFluttAm  = new Float32Array(COUNT);
  const pSwpDel   = new Float32Array(COUNT);
  const pSwpDur   = new Float32Array(COUNT);
  const pSwpCX    = new Float32Array(COUNT);
  const pSwpCY    = new Float32Array(COUNT);
  const pSwpCZ    = new Float32Array(COUNT);
  const pSwpBur   = new Float32Array(COUNT);
  const pSwpSpn   = new Float32Array(COUNT);
  const pRelDel   = new Float32Array(COUNT);
  const pRelDur   = new Float32Array(COUNT);
  const pJigSd    = new Float32Array(COUNT);
  const pJigAm    = new Float32Array(COUNT);
  const pMorphCm  = new Float32Array(COUNT);
  const pRepelF   = new Float32Array(COUNT);
  const pFat      = new Uint8Array(COUNT);
  const pEmitter  = new Uint8Array(COUNT);
  // Stub array kept only so existing `particles.length` references
  // resolve to COUNT without a sweeping rename. No object stored.
  const particles = { length: COUNT };

  // ---- WebGL2 renderer (active when useWebGL = true) ---------------
  // Single instanced POINT draw per frame: CPU populates a packed Float32
  // buffer (x, y, size, alpha) per particle and uploads it; GPU rasterises
  // all 11k+ points in one call. Replaces 11k Canvas2D fillRects/frame.
  const particleBuf = useWebGL ? new Float32Array(COUNT * 4) : null;
  let glProgram = null;
  let glPosBuffer = null;
  let glVAO = null;
  let glLocRes = null;
  function compileShader(src, type) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn('[cover] shader compile failed:', gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }
  function initWebGL() {
    if (!useWebGL) return;
    const vsSrc = `#version 300 es
      in vec2 a_pos;
      in float a_size;
      in float a_alpha;
      uniform vec2 u_res;
      out float v_alpha;
      void main() {
        vec2 p = (a_pos / u_res) * 2.0 - 1.0;
        p.y = -p.y;
        gl_Position = vec4(p, 0.0, 1.0);
        gl_PointSize = a_size;
        v_alpha = a_alpha;
      }`;
    const fsSrc = `#version 300 es
      precision mediump float;
      in float v_alpha;
      out vec4 outColor;
      void main() {
        outColor = vec4(1.0, 1.0, 1.0, v_alpha);
      }`;
    const vs = compileShader(vsSrc, gl.VERTEX_SHADER);
    const fs = compileShader(fsSrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[cover] program link failed:', gl.getProgramInfoLog(prog));
      return;
    }
    glProgram = prog;
    glLocRes = gl.getUniformLocation(prog, 'u_res');
    const locPos   = gl.getAttribLocation(prog, 'a_pos');
    const locSize  = gl.getAttribLocation(prog, 'a_size');
    const locAlpha = gl.getAttribLocation(prog, 'a_alpha');
    glPosBuffer = gl.createBuffer();
    glVAO = gl.createVertexArray();
    gl.bindVertexArray(glVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, glPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particleBuf.byteLength, gl.DYNAMIC_DRAW);
    const stride = 16; // 4 floats × 4 bytes
    gl.enableVertexAttribArray(locPos);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, stride, 0);
    gl.enableVertexAttribArray(locSize);
    gl.vertexAttribPointer(locSize, 1, gl.FLOAT, false, stride, 8);
    gl.enableVertexAttribArray(locAlpha);
    gl.vertexAttribPointer(locAlpha, 1, gl.FLOAT, false, stride, 12);
    gl.bindVertexArray(null);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  }

  // Camera state — slow auto-orbit; gyroscope on mobile overrides
  // the auto-orbit when permission is granted and a tilt is detected.
  const cam = {
    yaw: 0, pitch: 0.18,
    gyroActive: false,
    gyroBaseA: null, gyroBaseB: null,
    gyroYaw: 0, gyroPitch: 0,
  };

  // Repulsion params — spring-physics push for weight + bounce. Tuned
  // very soft so the particle field reads as fluid: long-lasting decay
  // with minimal initial punch, particles glide rather than snap.
  const REPEL_RADIUS = 240;        // CSS pixels (hover)
  const REPEL_STRENGTH = 22;       // peak radial push (pixels) — softer hover
  // Spring tuned just past critical damping: smooth glide back to home,
  // no visible oscillation/jiggle when the cursor lifts.
  const REPEL_STIFF = 0.055;       // soft spring
  const REPEL_DAMP = 0.74;         // strong friction → no overshoot ringing
  const REPEL_WAKE = 0.14;         // cursor-velocity wake while hovering
  const REPEL_SIZE_BOOST = 0.55;   // extra size factor at peak push

  // Drag mode — fluid-push interaction. Wider but much gentler than
  // before; the wake carries the cloud like a slow current instead of
  // a hard shove.
  const DRAG_RADIUS = 360;         // CSS pixels while drag is held
  const DRAG_STRENGTH = 22;        // matches hover so dragging feels continuous
  const DRAG_WAKE = 0.28;          // soft directional carry (was 0.65)

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
  // Writes into a shared 3-element buffer instead of allocating a new array
  // on every call (this runs N×60 times per second).
  const E = 0.08;
  const _curlOut = new Float32Array(3);
  function curl(x, y, z, t) {
    const n1 = noise3(x, y + E, z + t) - noise3(x, y - E, z + t);
    const n2 = noise3(x + E, y, z - t) - noise3(x - E, y, z - t);
    const n3 = noise3(x + t, y, z + E) - noise3(x + t, y, z - E);
    _curlOut[0] = (n2 - n1) / (2 * E);
    _curlOut[1] = (n3 - n2) / (2 * E);
    _curlOut[2] = (n1 - n3) / (2 * E);
    return _curlOut;
  }

  // ----- Setup -------------------------------------------------------------
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1 : 1.75);
    const rect = canvas.getBoundingClientRect();
    W = canvas.width  = Math.max(1, Math.round(rect.width  * DPR));
    H = canvas.height = Math.max(1, Math.round(rect.height * DPR));
    cx = W / 2;
    cy = H / 2;
    if (overlayCanvas) {
      overlayCanvas.width = W;
      overlayCanvas.height = H;
    }
  }

  function spawnInside(i) {
    // Random point inside a small core sphere — particles emerge from
    // somewhere near the middle, then flow outward via the field.
    const u = Math.random(), v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = Math.cbrt(Math.random()) * FIELD_R * (0.18 + Math.random() * 0.30);
    pX[i] = r * Math.sin(phi) * Math.cos(theta);
    pY[i] = r * Math.sin(phi) * Math.sin(theta);
    pZ[i] = r * Math.cos(phi);
    pLifeFade[i] = 0;
    pLife[i] = 0;
    pMaxLife[i]  = 6.0 + Math.random() * 14.0;
    pFadeRate[i] = 1.0 + Math.random() * 2.0;
    pTravelR[i]  = FIELD_R * (0.85 + Math.random() * 0.5);
  }

  function build() {
    for (let i = 0; i < COUNT; i++) {
      pSx[i] = 0; pSy[i] = 0; pDepth[i] = 0;
      pPushSx[i] = 0; pPushSy[i] = 0; pPushVX[i] = 0; pPushVY[i] = 0;
      pAlphaMul[i] = 0; pMorphCm[i] = 0; pRepelF[i] = 0;
      pStiff[i] = REPEL_STIFF * (0.78 + Math.random() * 0.44);
      spawnInside(i);
      // Stagger initial fade so they don't all pop in together.
      pLifeFade[i] = Math.random();
      pCommit[i]  = Math.random() < 0.05 ? 0.55 + Math.random() * 0.30 : 1;
      pEmitter[i] = Math.random() < 0.03 ? 1 : 0;
      pEmitPh[i]  = Math.random() * Math.PI * 2;
      pEmitFq[i]  = 0.35 + Math.random() * 0.45;
      pFluttFq[i] = 0.6 + Math.random() * 1.2;
      pFluttSd[i] = Math.random() * Math.PI * 2;
      pFluttAm[i] = 0.0008 + Math.random() * 0.0018;
      pFat[i]     = Math.random() < 0.22 ? 1 : 0;
      pAlphaPh[i] = Math.random();
      pSwpDel[i]  = Math.random() * 0.30;
      pSwpDur[i]  = 0.55 + Math.random() * 0.20;
      pSwpCX[i]   = (Math.random() - 0.5) * 1.8;
      pSwpCY[i]   = (Math.random() - 0.5) * 1.8;
      pSwpCZ[i]   = (Math.random() - 0.5) * 1.4;
      pSwpBur[i]  = 0.15 + Math.random() * 0.55;
      pSwpSpn[i]  = (Math.random() - 0.5) * 1.4;
      pRelDel[i]  = Math.random() * 0.45;
      pRelDur[i]  = 0.45 + Math.random() * 0.35;
      pJigSd[i]   = Math.random() * Math.PI * 2;
      pJigAm[i]   = 0.005 + Math.random() * 0.012;
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

  // Track drag state for the fluid-push mode. Held mouse = continuous
  // larger, stronger force biased toward the cursor's motion direction.
  // Mobile / coarse-pointer: skip all interaction so taps and scrolls
  // pass straight through.
  let isDragging = false;
  // Right-mouse-drag orientation control for the projection-mapping
  // room shape. Lets the visitor look around inside the wireframe room.
  let rightDragging = false;
  let rightDragLastX = 0;
  let rightDragLastY = 0;

  // ----- Sculpt-with-decay -------------------------------------------
  // Left-drag drops a chain of line segments along the cursor path.
  // Each segment pulls particles toward the closest point ON THE LINE
  // (not just an endpoint), so the trail reads as a continuous brush
  // stroke rather than a string of blobs. Segments fade over ~6s and
  // the spring system glides particles back to free flow naturally.
  const sculptAnchors = [];           // {x1,y1, x2,y2, life, maxLife}
  const SCULPT_MAX = 80;
  const SCULPT_LIFE = 6.0;
  const SCULPT_R_CSS = 95;            // wider radius softens the line
  const SCULPT_PULL = 0.45;           // gentler pull → no blob clumps
  const SCULPT_SPACING_CSS = 14;      // tighter spacing → smoother line
  let sculptLastX = 0, sculptLastY = 0;
  let sculptDist = 0;
  let sculptHasPrev = false;
  function addSculptSegment(prevClientX, prevClientY, clientX, clientY) {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x1 = (prevClientX - rect.left) * DPR;
    const y1 = (prevClientY - rect.top) * DPR;
    const x2 = (clientX - rect.left) * DPR;
    const y2 = (clientY - rect.top) * DPR;
    // Cache the segment's AABB so the per-particle force loop can reject
    // far-away particles with four scalar compares.
    const minX = (x1 < x2 ? x1 : x2);
    const maxX = (x1 > x2 ? x1 : x2);
    const minY = (y1 < y2 ? y1 : y2);
    const maxY = (y1 > y2 ? y1 : y2);
    sculptAnchors.push({
      x1, y1, x2, y2, minX, maxX, minY, maxY,
      life: SCULPT_LIFE, maxLife: SCULPT_LIFE,
    });
    if (sculptAnchors.length > SCULPT_MAX) sculptAnchors.shift();
  }
  if (!IS_MOBILE) {
    canvas.addEventListener('pointerdown', (e) => {
      // Right mouse → orientation drag (only meaningful while a rotating
      // shape is mounted). Suppress the context menu via contextmenu
      // listener below.
      if (e.button === 2) {
        if (morph.rotating && morph.shapeName) {
          rightDragging = true;
          rightDragLastX = e.clientX;
          rightDragLastY = e.clientY;
          morph.manualActive = true;
        }
        return;
      }
      if (e.button !== 0 && e.button !== undefined) return;
      isDragging = true;
      // Sculpt path: record the start point. Segments only emit once the
      // cursor actually moves — plain click leaves nothing behind.
      sculptLastX = e.clientX;
      sculptLastY = e.clientY;
      sculptDist = 0;
      sculptHasPrev = true;
    }, { passive: true });

    // Sculpt path while left-drag is held — emit a SEGMENT from the
    // last point to a new one every SCULPT_SPACING_CSS pixels travelled.
    canvas.addEventListener('pointermove', (e) => {
      if (!isDragging || !sculptHasPrev) return;
      const dx = e.clientX - sculptLastX;
      const dy = e.clientY - sculptLastY;
      sculptDist += Math.hypot(dx, dy);
      if (sculptDist >= SCULPT_SPACING_CSS) {
        addSculptSegment(sculptLastX, sculptLastY, e.clientX, e.clientY);
        sculptLastX = e.clientX;
        sculptLastY = e.clientY;
        sculptDist = 0;
      }
    }, { passive: true });

    canvas.addEventListener('pointermove', (e) => {
      if (!rightDragging) return;
      const dx = e.clientX - rightDragLastX;
      const dy = e.clientY - rightDragLastY;
      rightDragLastX = e.clientX;
      rightDragLastY = e.clientY;
      // Pixel → radians. ~360px ≈ a full turn. Drag works on every axis
      // regardless of shape (room can now be tumbled too).
      morph.manualYaw += dx * 0.012;
      morph.manualPitch += dy * 0.012;
    }, { passive: true });

    function endDrag() { isDragging = false; sculptHasPrev = false; }
    function endRightDrag() {
      if (!rightDragging) return;
      rightDragging = false;
      morph.manualActive = false;
    }
    window.addEventListener('pointerup', (e) => {
      if (e.button === 2) endRightDrag(); else endDrag();
    }, { passive: true });
    window.addEventListener('pointercancel', () => { endDrag(); endRightDrag(); }, { passive: true });
    window.addEventListener('blur', () => { endDrag(); endRightDrag(); }, { passive: true });
    // Suppress the browser context menu while a rotating shape is active
    // so right-drag doesn't pop the OS menu.
    canvas.addEventListener('contextmenu', (e) => {
      if (morph.rotating && morph.shapeName) e.preventDefault();
    });
  } else {
    // ---- Mobile: gyroscope tilts the swarm ---------------------------
    // beta  = front-back tilt (-180..180), gamma = left-right tilt (-90..90).
    // We treat the first reading as the rest pose and feed deltas into
    // cam.gyroYaw/Pitch. The frame loop lerps cam.yaw/pitch toward those
    // targets and skips the auto-orbit while gyroActive is set.
    function onOrient(e) {
      if (e.beta == null || e.gamma == null) return;
      if (cam.gyroBaseA == null) {
        cam.gyroBaseA = e.gamma;
        cam.gyroBaseB = e.beta;
      }
      cam.gyroActive = true;
      const D = Math.PI / 180;
      // Cap each axis so extreme tilts don't spin the cloud wildly.
      const dY = Math.max(-1.4, Math.min(1.4, (e.gamma - cam.gyroBaseA) * D * 1.3));
      const dP = Math.max(-1.0, Math.min(1.0, (e.beta - cam.gyroBaseB) * D * 0.9));
      cam.gyroYaw = dY;
      cam.gyroPitch = 0.18 + dP;
    }
    function attachGyro() {
      window.addEventListener('deviceorientation', onOrient, { passive: true });
    }
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+: permission gate. Request on first user touch.
      const onceTap = () => {
        document.removeEventListener('touchend', onceTap);
        DeviceOrientationEvent.requestPermission()
          .then((state) => { if (state === 'granted') attachGyro(); })
          .catch(() => {});
      };
      document.addEventListener('touchend', onceTap, { passive: true });
    } else {
      attachGyro();
    }
  }

  let last = performance.now();
  let startTime = performance.now();
  let running = true;

  // ----- Auto FPS throttle ------------------------------------------
  // Watch frame durations on a rolling window. If the page is slipping
  // below ~45fps for ~2s, halve activeCount (down to a sane floor).
  // Once-only — never grows back to avoid oscillation when the user
  // hovers/drags (which spikes per-particle work). The floor matches
  // the old hard-coded count so behaviour at floor matches the prior
  // build for low-spec machines.
  const FPS_WIN = 60;          // sample window (frames)
  const FPS_MIN = 45;          // throttle trigger
  const FPS_LOW_DUR = 2.0;     // seconds at sub-FPS_MIN before action
  const FLOOR = IS_MOBILE ? 1500 : 11000;
  const fpsBuf = new Float32Array(FPS_WIN);
  let fpsBufI = 0, fpsBufFilled = 0;
  let lowSecs = 0;
  function recordFps(dtSeconds) {
    if (dtSeconds <= 0 || dtSeconds > 0.25) return;   // skip warmup spikes
    fpsBuf[fpsBufI] = 1 / dtSeconds;
    fpsBufI = (fpsBufI + 1) % FPS_WIN;
    if (fpsBufFilled < FPS_WIN) fpsBufFilled++;
    if (fpsBufFilled < FPS_WIN || activeCount <= FLOOR) return;
    let sum = 0;
    for (let i = 0; i < fpsBufFilled; i++) sum += fpsBuf[i];
    const avg = sum / fpsBufFilled;
    if (avg < FPS_MIN) {
      lowSecs += dtSeconds;
      if (lowSecs >= FPS_LOW_DUR) {
        const next = Math.max(FLOOR, Math.floor(activeCount * 0.5));
        if (typeof console !== 'undefined') {
          console.log(`[cover] fps throttle: ${activeCount} → ${next} (avg ${avg.toFixed(1)}fps)`);
        }
        activeCount = next;
        lowSecs = 0;
        fpsBufFilled = 0;        // reset window so next decision is fresh
      }
    } else {
      lowSecs = 0;
    }
  }

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
    shapeName: null,       // 'torus' | 'cube' | 'room' | 'tree' | 'portrait'
    manualYaw: 0,          // user right-mouse-drag yaw delta
    manualPitch: 0,        // user right-mouse-drag pitch delta
    manualActive: false,   // true while right-mouse drag is engaged
    accAutoYaw: 0,         // accumulated auto yaw — paused while dragging
    accAutoPitch: 0,       // accumulated auto pitch — paused while dragging
    fast: false,           // typewriter mode: skip swap theatrics for speed
    straight: false,       // text morphs: linear lerp + moderate swap; no
                           // bezier/spin/burst so rapid hover doesn't glitch
  };

  // Rasterize a word into a sample of {x,y} points in [-1, 1] range.
  function rasterizeWord(word) {
    const off = document.createElement('canvas');
    const W2 = 1100, H2 = 280;
    off.width = W2; off.height = H2;
    const c = off.getContext('2d');
    c.fillStyle = '#000';
    c.fillRect(0, 0, W2, H2);
    c.fillStyle = '#fff';
    c.textBaseline = 'middle';
    c.textAlign = 'left';

    // Manual glyph-by-glyph layout with explicit tracking — guarantees
    // visible spacing between letters regardless of canvas API support.
    // Smaller TRACK_FRACTION + wider usable ratio so long words don't
    // get shrunk to a tiny size when the canvas still has horizontal room.
    const TRACK_FRACTION = 0.08;
    const USE_WIDTH = W2 * 0.96;
    let fontSize = 230;
    // Blackletter — UnifrakturMaguntia. Very distinctive medieval gothic
    // shapes, reads beautifully with mixed case (the lowercase glyphs
    // carry the most personality, so callers should NOT uppercase).
    const FONT_STACK = '"UnifrakturMaguntia", "Times New Roman", serif';
    function measureLine(size) {
      c.font = `400 ${size}px ${FONT_STACK}`;
      const gap = size * TRACK_FRACTION;
      let w = 0;
      for (let i = 0; i < word.length; i++) {
        w += c.measureText(word[i]).width;
        if (i < word.length - 1) w += gap;
      }
      return w;
    }
    while (fontSize > 110 && measureLine(fontSize) > USE_WIDTH) fontSize -= 6;

    c.font = `400 ${fontSize}px ${FONT_STACK}`;
    const gap = fontSize * TRACK_FRACTION;
    const lineW = measureLine(fontSize);
    let x = (W2 - lineW) / 2;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      c.fillText(ch, x, H2 / 2);
      x += c.measureText(ch).width + gap;
    }

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

  // ----- 3D skull point cloud ---------------------------------------------
  // Procedural skull silhouette (cranium + eye sockets + nasal cavity +
  // jaw + tooth row). Lazy-built on first portrait request — saves the
  // ~3.5k point allocation when the visitor never hovers About.
  let portraitPoints = null;
  function getPortraitPoints() {
    if (!portraitPoints) portraitPoints = procSkull();
    return portraitPoints;
  }

  function procSkull() {
    const pts = [];
    // Cranium — slightly back-elongated ellipsoid
    const A = 0.40, B = 0.46, C = 0.44;
    for (let i = 0; i < 1800; i++) {
      const u = Math.random(), v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const x = A * Math.sin(phi) * Math.cos(theta);
      const y = B * Math.cos(phi) - 0.10; // shift up
      const z = C * Math.sin(phi) * Math.sin(theta);
      // Skip the "front face" cap — that area is replaced with explicit
      // sockets / nasal / mandible features below for a real skull look.
      if (z > 0.18 && y > -0.12 && y < 0.14 && Math.abs(x) < 0.32) continue;
      pts.push(x, y, z);
    }
    // Brow ridge — thick horizontal bar across the forehead
    for (let i = 0; i < 240; i++) {
      const t = Math.random() * 2 - 1;
      pts.push(t * 0.34, -0.20 + Math.abs(t) * 0.03, 0.36);
    }
    // Eye-socket rims — large oval rings
    const EYE_X = 0.16, EYE_Y = -0.10, EYE_Z = 0.34, ER = 0.10;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 320; i++) {
        const a = Math.random() * Math.PI * 2;
        // Ring (annulus) — sample on rim
        pts.push(
          side * EYE_X + Math.cos(a) * ER * 0.95,
          EYE_Y + Math.sin(a) * ER * 0.85,
          EYE_Z + (Math.random() - 0.5) * 0.04
        );
      }
    }
    // Cheekbones — diagonal ridges below the eyes
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 160; i++) {
        const t = Math.random();
        pts.push(
          side * (0.20 + t * 0.10),
          0.02 + t * 0.06,
          0.30 - t * 0.08
        );
      }
    }
    // Nasal cavity — inverted teardrop hole, sample the rim
    for (let i = 0; i < 260; i++) {
      const t = Math.random();
      const yy = 0.02 + t * 0.18;
      const half = (1 - t) * 0.06 + 0.01;
      const x = (Math.random() < 0.5 ? -1 : 1) * (half + (Math.random() - 0.5) * 0.01);
      pts.push(x, yy, 0.38 - t * 0.04);
    }
    // Maxilla (upper teeth row) — small dense bumps
    for (let i = 0; i < 180; i++) {
      const idx = (Math.random() * 8) | 0;
      const xx = -0.13 + (idx + 0.5) * (0.26 / 8) + (Math.random() - 0.5) * 0.012;
      pts.push(xx, 0.24, 0.30);
    }
    // Mandible (jaw) — wide U
    for (let i = 0; i < 380; i++) {
      const t = Math.random() * 2 - 1;
      const xx = t * 0.30;
      const yy = 0.32 + t * t * 0.13;
      const zz = 0.26 - t * t * 0.10;
      pts.push(xx, yy, zz);
    }
    // Lower teeth row
    for (let i = 0; i < 160; i++) {
      const idx = (Math.random() * 8) | 0;
      const xx = -0.13 + (idx + 0.5) * (0.26 / 8) + (Math.random() - 0.5) * 0.012;
      pts.push(xx, 0.32, 0.27);
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
    // Reset rotating state — only re-enabled by 3D shapes. Switching
    // shapes also clears any user-applied manual orientation.
    morph.rotating = false;
    morph.basePoints3D = null;
    morph.rotateMode = 'tumble';
    morph.shapeName = (spec && typeof spec === 'object' && spec.shape) || null;
    morph.manualYaw = 0;
    morph.manualPitch = 0;
    morph.manualActive = false;
    morph.accAutoYaw = 0;
    morph.accAutoPitch = 0;

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

    // Portrait — generic 3D head; tumble in space like the torus/cube.
    if (spec && typeof spec === 'object' && spec.shape === 'portrait') {
      const flat3 = getPortraitPoints();
      if (!flat3 || !flat3.length) { morph.points = null; return; }
      const samples = flat3.length / 3;
      const base = new Float32Array(particles.length * 3);
      for (let i = 0; i < particles.length; i++) {
        const s = ((Math.random() * samples) | 0) * 3;
        base[i * 3 + 0] = flat3[s];
        base[i * 3 + 1] = flat3[s + 1];
        base[i * 3 + 2] = flat3[s + 2];
      }
      morph.basePoints3D = base;
      morph.rotating = true;
      morph.points = new Float32Array(base);
      return;
    }

    let flat = null;
    if (spec && typeof spec === 'object' && spec.shape === 'tree') {
      flat = generateTreePoints();
    } else if (typeof spec === 'string' && spec.length) {
      flat = rasterizeWord(spec);
    }
    if (!flat) { morph.points = null; return; }
    const sampleCount = flat.length / 2;
    if (sampleCount === 0) { morph.points = null; return; }
    // Assign each particle a *random* sample. Cycling top-to-bottom
    // through the pixel list left long words covered only along the
    // upper rows when sampleCount > particles.length; random sampling
    // gives even coverage across the whole glyph regardless of length.
    const out = new Float32Array(particles.length * 3);
    for (let i = 0; i < particles.length; i++) {
      const sIdx = ((Math.random() * sampleCount) | 0) * 2;
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
        // Defensive: only snapshot-blend if both arrays are the same
        // length (a particle rebuild between calls could desync them).
        if (morph.prevPoints && morph.swap < 1
            && morph.prevPoints.length === morph.points.length) {
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
      // Text morphs (nav-link words) skip the bezier/spin/burst flair so
      // rapid hover-switching doesn't visibly jump — particles just
      // straight-lerp prev→new. Shape morphs keep the dynamic flair.
      morph.straight = (typeof spec === 'string');
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

  // ----- Idle greetings ---------------------------------------------
  // Every minute or so, when nothing else is happening, the swarm
  // briefly assembles into a short word ("hello", "hej", etc.) at
  // partial commit so it reads as a soft suggestion rather than text.
  // Defers if the user is hovering a link, typing, dragging, or sculpting.
  const GREETINGS = ['hello', 'hej', 'ahoj', 'bok', 'ciao', 'moin', 'aloha', 'salut', 'howdy', 'welcome', 'hi'];
  // First greeting fires ~5s after page load (welcomes the visitor),
  // then subsequent ones space out to 25-70s.
  let nextGreetAt = performance.now() + 5000;
  let greetUntil = 0;
  let greetActive = false;
  let greetKey = null;
  function maybeGreet(now) {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (sculptAnchors.length || rightDragging || isDragging) return;
    if (typed && typed.length) return;

    if (greetActive) {
      // If our morph was overridden (user hovered a link), give up
      // ownership without yanking the new morph.
      if (morph.text !== greetKey) {
        greetActive = false;
        greetKey = null;
        morph.greet = false;
        nextGreetAt = now + 45000 + Math.random() * 30000;
        return;
      }
      if (now >= greetUntil) {
        greetActive = false;
        greetKey = null;
        setMorphTarget(null);
        // Keep morph.greet on through the slow fade-out; cleared once
        // progress reaches ~0 in the morph drop block.
        nextGreetAt = now + 25000 + Math.random() * 45000; // 25 – 70 s
      }
      return;
    }
    if (morph.text) return; // some other morph is already mounted
    if (now < nextGreetAt) return;

    const word = GREETINGS[(Math.random() * GREETINGS.length) | 0];
    greetKey = word;
    greetActive = true;
    greetUntil = now + 2800 + Math.random() * 1000; // a touch longer hold
    setMorphTarget(word);
    // Loose commit + slow ramp — feels like a faint attractor turning
    // on, rather than a hard snap to text.
    morph.targetProgress = 0.32;
    morph.greet = true;
  }

  // ----- Scroll-driven "projects" morph ----------------------------
  // Scrolling reveals the swarm's "projects" word, which is also a
  // clickable link to the index page. Builds smoothly with scroll
  // progress; releases on scroll-up.
  const PROJECTS_WORD = 'projects';
  let scrollMorphActive = false;
  let scrollProgress = 0;       // 0..1 across the runway
  let projectsClickable = false;
  function recomputeScrollProgress() {
    // Cover is sticky for the full 50dvh runway. Word formation
    // maps to the first ~25dvh; remaining 25dvh is dwell time so the
    // user can read + click before the cover unsticks.
    const dist = window.innerHeight * 0.25;
    scrollProgress = Math.max(0, Math.min(1, window.scrollY / dist));
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', recomputeScrollProgress, { passive: true });
    window.addEventListener('resize', recomputeScrollProgress, { passive: true });
    recomputeScrollProgress();
  }
  function updateScrollMorph() {
    // While dragging / sculpting / hovering nav / typing — defer.
    const userOwnsMorph = morph.text && morph.text !== PROJECTS_WORD && !greetActive;
    const blocked = sculptAnchors.length || rightDragging || isDragging ||
                    (typed && typed.length) || userOwnsMorph;

    if (blocked || scrollProgress < 0.04) {
      if (scrollMorphActive) {
        scrollMorphActive = false;
        projectsClickable = false;
        if (canvas) canvas.style.cursor = '';
        if (morph.text === PROJECTS_WORD) setMorphTarget(null);
      }
      return;
    }

    if (!scrollMorphActive) {
      // If a greeting is currently mounted, abandon ownership of it
      // so the new projects morph cleanly takes over.
      if (greetActive) {
        greetActive = false;
        greetKey = null;
      }
      scrollMorphActive = true;
      setMorphTarget(PROJECTS_WORD);
      morph.greet = true; // reuse the slow-attractor lerp
    }
    // Map scroll → commit. Cap at 0.92. Steeper ramp so the word is
    // legible early in the scroll instead of forming late.
    morph.targetProgress = Math.min(0.92, scrollProgress * 2.4);
    const wasClickable = projectsClickable;
    // Activate clickability as soon as the word has any meaningful
    // presence — first ~15% of the scroll budget.
    projectsClickable = scrollProgress > 0.12;
    if (projectsClickable !== wasClickable && canvas) {
      canvas.style.cursor = projectsClickable ? 'pointer' : '';
    }
  }
  // Document-level click capture so the navigation works even if some
  // overlay (footer, etc.) ends up over the canvas. We only navigate
  // when the projects morph is actively clickable.
  document.addEventListener('click', (e) => {
    if (!projectsClickable || !scrollMorphActive) return;
    // Skip clicks on real interactive elements (links, buttons, etc).
    let el = e.target;
    while (el && el !== document) {
      const t = el.tagName;
      if (t === 'A' || t === 'BUTTON' || t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      el = el.parentNode;
    }
    e.preventDefault();
    e.stopPropagation();
    window.location.href = 'grid.html';
  }, true);

  // ----- Typewriter ---------------------------------------------------
  // Type any letters / digits / punctuation on the keyboard and the
  // particles spell out the word in real time. Backspace deletes the
  // last char. Esc / Enter clears. Auto-clears 3.5 s after the last
  // keystroke if the user stops typing.
  let typed = '';
  let idleTimer = null;
  function isFormFocus() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
  }
  function pushTyped() {
    if (idleTimer) clearTimeout(idleTimer);
    if (typed) {
      morph.fast = true; // straight lerp + short swap window
      setMorphTarget(typed);
      idleTimer = setTimeout(() => {
        typed = '';
        morph.fast = false;
        setMorphTarget(null);
        idleTimer = null;
      }, 3500);
    } else {
      morph.fast = false;
      setMorphTarget(null);
    }
  }
  window.addEventListener('keydown', (e) => {
    // Ignore OS key-repeat (holding a key) so we don't spam the buffer.
    if (e.repeat) return;
    if (isFormFocus()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // Space normally scrolls the page — block that so the user can type
    // a space into the buffer without scrolling to the footer.
    if (e.key === ' ' || e.code === 'Space') e.preventDefault();
    if (e.key === 'Escape' || e.key === 'Enter') {
      typed = '';
      pushTyped();
      return;
    }
    if (e.key === 'Backspace') {
      typed = typed.slice(0, -1);
      pushTyped();
      return;
    }
    if (!e.key || e.key.length !== 1) return;
    // Cap length so we don't build infinite strings.
    if (typed.length >= 20) return;
    typed += e.key;
    pushTyped();
  });
  window.addEventListener('blur', () => {
    if (typed) {
      typed = '';
      if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
      setMorphTarget(null);
    }
  });

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

  // ---- Constellation links ------------------------------------------
  // A small pool of "anchor" particles draw 1-2 thin lines to their
  // nearest neighbors via a spatial hash. Cheap (~250 anchors), faint,
  // adds depth without obscuring the dots. Always-on.
  const ANCHOR_COUNT = IS_MOBILE ? 80 : 250;
  let anchorIndices = [];
  function rebuildAnchors() {
    anchorIndices = [];
    if (!particles.length) return;
    const want = Math.min(ANCHOR_COUNT, particles.length);
    const seen = new Set();
    while (anchorIndices.length < want && seen.size < particles.length) {
      const i = (Math.random() * particles.length) | 0;
      if (seen.has(i)) continue;
      seen.add(i);
      anchorIndices.push(i);
    }
  }
  // Counting-sort spatial bins — typed-array buffers reused frame to
  // frame, no per-frame Array allocations or GC churn.
  let _binCount = null;     // Int32Array(cols*rows): count per cell
  let _binStart = null;     // Int32Array(cols*rows + 1): cumulative offsets
  let _binData  = null;     // Int32Array(ANCHOR_COUNT): anchor idx sorted by cell
  let _anchorCells = null;  // Int32Array(ANCHOR_COUNT): per-anchor cell hash
  let _binsCols = 0, _binsRows = 0;
  function drawConstellation() {
    if (!anchorIndices.length || W < 2 || H < 2) return;
    const LINK_R = (IS_MOBILE ? 90 : 110) * DPR;
    const R2 = LINK_R * LINK_R;
    const cellSize = LINK_R;
    const cols = Math.max(1, Math.ceil(W / cellSize));
    const rows = Math.max(1, Math.ceil(H / cellSize));
    const cellTotal = cols * rows;
    if (!_binCount || _binsCols !== cols || _binsRows !== rows) {
      _binCount = new Int32Array(cellTotal);
      _binStart = new Int32Array(cellTotal + 1);
      _binsCols = cols; _binsRows = rows;
    } else {
      _binCount.fill(0);
    }
    if (!_binData || _binData.length < anchorIndices.length) {
      _binData = new Int32Array(anchorIndices.length);
    }
    if (!_anchorCells || _anchorCells.length < anchorIndices.length) {
      _anchorCells = new Int32Array(anchorIndices.length);
    }
    const anchorCells = _anchorCells;
    // Pass 1: count per cell + record each anchor's cell index.
    for (let i = 0; i < anchorIndices.length; i++) {
      const idx = anchorIndices[i];
      const sxi = pSx[idx], syi = pSy[idx];
      if (sxi < 0 || sxi > W || syi < 0 || syi > H) {
        anchorCells[i] = -1;
        continue;
      }
      const cx = (sxi / cellSize) | 0;
      const cy = (syi / cellSize) | 0;
      const k = cy * cols + cx;
      anchorCells[i] = k;
      _binCount[k]++;
    }
    // Pass 2: cumulative starts.
    let acc = 0;
    for (let k = 0; k < cellTotal; k++) {
      _binStart[k] = acc;
      acc += _binCount[k];
    }
    _binStart[cellTotal] = acc;
    // Pass 3: fill _binData with anchor indices grouped by cell. Reuse
    // _binCount as a per-cell write cursor.
    _binCount.fill(0);
    for (let i = 0; i < anchorIndices.length; i++) {
      const k = anchorCells[i];
      if (k < 0) continue;
      _binData[_binStart[k] + _binCount[k]] = anchorIndices[i];
      _binCount[k]++;
    }
    // Render: nearest 2 in 3x3 neighborhood for each anchor.
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = Math.max(0.5, DPR * 0.4);
    ctx.beginPath();
    for (let i = 0; i < anchorIndices.length; i++) {
      const k = anchorCells[i];
      if (k < 0) continue;
      const idx = anchorIndices[i];
      if (pAlphaMul[idx] < 0.4) continue;
      const psx = pSx[idx], psy = pSy[idx];
      const cx = k % cols;
      const cy = (k / cols) | 0;
      let nearest = -1, nearestD = Infinity;
      let next = -1, nextD = Infinity;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = cy + dy;
        if (ny < 0 || ny >= rows) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          if (nx < 0 || nx >= cols) continue;
          const cellK = ny * cols + nx;
          const start = _binStart[cellK];
          const end = _binStart[cellK + 1];
          for (let j = start; j < end; j++) {
            const j2 = _binData[j];
            if (j2 <= idx) continue;
            const ddx = pSx[j2] - psx, ddy = pSy[j2] - psy;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 > R2) continue;
            if (d2 < nearestD) { nextD = nearestD; next = nearest; nearestD = d2; nearest = j2; }
            else if (d2 < nextD) { nextD = d2; next = j2; }
          }
        }
      }
      if (nearest >= 0) {
        ctx.moveTo(psx, psy);
        ctx.lineTo(pSx[nearest], pSy[nearest]);
      }
      if (next >= 0) {
        ctx.moveTo(psx, psy);
        ctx.lineTo(pSx[next], pSy[next]);
      }
    }
    ctx.stroke();
  }

  // Depth → alpha buckets — hoisted out of the frame loop so it isn't
  // reallocated every frame.
  const TIERS = [
    { min: 0.45, max: 0.7,  alpha: 0.18, size: 1 },
    { min: 0.7,  max: 0.95, alpha: 0.42, size: 1 },
    { min: 0.95, max: 1.2,  alpha: 0.72, size: 1 },
    { min: 1.2,  max: 5.0,  alpha: 1.0,  size: 1 },
  ];

  function frame(now) {
    if (!running) return;
    const dt = Math.min(now - last, 50) / 1000; // seconds
    recordFps(dt);
    maybeGreet(now);
    updateScrollMorph();
    last = now;
    const elapsed = (now - startTime) / 1000;

    // Slow auto-yaw. Suspended when the gyroscope is driving the camera
    // — we ease cam.yaw/pitch toward the gyro deltas instead.
    if (cam.gyroActive) {
      cam.yaw += (cam.gyroYaw - cam.yaw) * 0.08;
      cam.pitch += (cam.gyroPitch - cam.pitch) * 0.08;
    } else {
      cam.yaw += dt * 0.05;
    }

    // Background wash. WebGL path: clear to opaque black via gl.clear.
    // 2D fallback: fillRect black on the same canvas. The overlay 2D
    // canvas (used in WebGL mode) is cleared transparent so labels +
    // constellation composite over the GPU-rendered dots.
    if (useWebGL) {
      ctx.clearRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
    }

    const baseR = Math.min(W, H) * 0.45;
    const yawCos = Math.cos(cam.yaw);
    const yawSin = Math.sin(cam.yaw);
    const pitchCos = Math.cos(cam.pitch);
    const pitchSin = Math.sin(cam.pitch);

    // Sculpt anchor housekeeping: age each anchor; cull dead ones from
    // the back of the array. Cache radius² for the per-particle loop.
    const _sculptR = SCULPT_R_CSS * DPR;
    const _sculptR2 = _sculptR * _sculptR;
    if (sculptAnchors.length) {
      for (let a = sculptAnchors.length - 1; a >= 0; a--) {
        sculptAnchors[a].life -= dt;
        if (sculptAnchors[a].life <= 0) {
          // Swap-pop for O(1) removal without preserving order.
          sculptAnchors[a] = sculptAnchors[sculptAnchors.length - 1];
          sculptAnchors.pop();
        }
      }
    }

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
    // feels alive instead of static. (Computed inline, no allocation.)
    const noPresetWind = (flowTarget.windX === 0 && flowTarget.windY === 0);
    const ambientWindX = noPresetWind ? Math.sin(elapsed * 0.11) * 0.05 : 0;
    const ambientWindY = noPresetWind ? Math.cos(elapsed * 0.083) * 0.025 : 0;
    const ambientSwirlBoost = (flowTarget.swirl !== 0)
      ? Math.sin(elapsed * 0.07) * 0.04
      : 0;

    NOISE_SCALE += (flowTarget.noiseScale - NOISE_SCALE) * flowLerp;
    FLOW_SPEED  += (flowTarget.flowSpeed  - FLOW_SPEED)  * flowLerp;
    TIME_DRIFT  += (flowTarget.timeDrift  - TIME_DRIFT)  * flowLerp;
    SWIRL       += (flowTarget.swirl + ambientSwirlBoost - SWIRL) * flowLerp;
    RADIAL      += (flowTarget.radial     - RADIAL)      * flowLerp;
    JITTER      += (flowTarget.jitter     - JITTER)      * flowLerp;
    WIND_X      += ((flowTarget.windX || 0) + ambientWindX - WIND_X) * flowLerp;
    WIND_Y      += ((flowTarget.windY || 0) + ambientWindY - WIND_Y) * flowLerp;

    const tNoise = elapsed * TIME_DRIFT;

    // Smooth morph progress toward target — eased so transitions feel soft.
    // Slower decay when releasing so the per-particle stagger reads.
    // Greetings ease MUCH slower than nav/text morphs — feels like a
    // faint attractor turning on rather than a snap. ~3-4× slower
    // both directions.
    const greetMode = !!morph.greet;
    const easeRate = morph.targetProgress > morph.progress
      ? (greetMode ? 0.022 : 0.08)
      : (greetMode ? 0.018 : 0.04);
    morph.progress += (morph.targetProgress - morph.progress) * easeRate;
    if (morph.swap < 1) {
      // Fast swap when typing (so adjacent letters don't overlap into
      // chaos), moderate swap for nav-text (smooth straight lerp), and
      // slower swap for shape morphs where the bezier theatrics need
      // visual room to read.
      const swapRate = morph.fast ? 3.0 : (morph.straight ? 1.4 : 0.65);
      morph.swap = Math.min(1, morph.swap + dt * swapRate);
      if (morph.swap >= 1) morph.prevPoints = null;
    }

    // Live-rotate the 3D shape's base points into morph.points each frame.
    if (morph.rotating && morph.basePoints3D && morph.points) {
      const yawOnly = morph.rotateMode === 'yaw';
      const autoYawSpeed = yawOnly ? 0.35 : 0.6;
      const autoPitchSpeed = yawOnly ? 0 : 0.32;
      // Auto rotation accumulates only when the user isn't right-dragging.
      // Manual offsets stack on top so release resumes seamlessly.
      if (!morph.manualActive) {
        morph.accAutoYaw += dt * autoYawSpeed;
        morph.accAutoPitch += dt * autoPitchSpeed;
      }
      const rotY = morph.accAutoYaw + morph.manualYaw;
      const rotX = morph.accAutoPitch + morph.manualPitch;
      const cyR = Math.cos(rotY), syR = Math.sin(rotY);
      const cxR = Math.cos(rotX), sxR = Math.sin(rotX);
      const src = morph.basePoints3D;
      const dst = morph.points;
      const n = src.length;
      // Always full-tumble (yaw then pitch) so right-drag can re-orient
      // on every axis, even on the room.
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
    if (morph.progress < 0.001 && morph.targetProgress === 0) {
      morph.progress = 0;
      morph.points = null;
      morph.prevPoints = null;
      morph.greet = false;
    }
    const mp = morph.progress;
    const hasTargets = mp > 0.001 && morph.points;

    // SoA hot loop — all field accesses go through typed-array index.
    const focal = baseR * 1.8;
    const COMMIT_CAP = 0.98;
    const fastSwap = !!morph.fast || !!morph.straight;
    const dynScale = fastSwap ? 0 : 1;
    const morphPts = morph.points;
    const morphPrev = morph.prevPoints;
    const swap = morph.swap;
    const morphActiveSwap = morphPrev && swap < 1
      && morphPts && morphPrev.length === morphPts.length;
    const releasing = morph.targetProgress === 0;
    const sculptN = sculptAnchors.length;

    for (let i = 0; i < activeCount; i++) {
      // Sample curl field at this particle's position.
      curl(pX[i] * NOISE_SCALE, pY[i] * NOISE_SCALE, pZ[i] * NOISE_SCALE, tNoise);
      const vx = _curlOut[0], vy = _curlOut[1], vz = _curlOut[2];

      // Move along the flow.
      let px_ = pX[i] + vx * FLOW_SPEED * dt;
      let py_ = pY[i] + vy * FLOW_SPEED * dt;
      let pz_ = pZ[i] + vz * FLOW_SPEED * dt;

      if (SWIRL !== 0) {
        const ox = px_, oy = py_;
        px_ += -oy * SWIRL * dt;
        py_ +=  ox * SWIRL * dt;
      }
      if (RADIAL !== 0) {
        const rd = Math.sqrt(px_ * px_ + py_ * py_) + 1e-5;
        px_ += (px_ / rd) * RADIAL * dt;
        py_ += (py_ / rd) * RADIAL * dt;
      }
      if (JITTER !== 0) {
        px_ += (Math.random() - 0.5) * JITTER;
        py_ += (Math.random() - 0.5) * JITTER;
      }
      if (WIND_X !== 0 || WIND_Y !== 0) {
        px_ += WIND_X * dt;
        py_ += WIND_Y * dt;
      }

      // Lifetime + recycle.
      let life = pLife[i] + dt;
      const dist2 = px_ * px_ + py_ * py_ + pz_ * pz_;
      const tr = pTravelR[i];
      if (dist2 > tr * tr || life >= pMaxLife[i]) {
        spawnInside(i);
        px_ = pX[i]; py_ = pY[i]; pz_ = pZ[i];
        life = 0;
      } else {
        pX[i] = px_; pY[i] = py_; pZ[i] = pz_;
        pLife[i] = life;
      }

      // Fade in / age fade.
      const lifeFade = Math.min(1, pLifeFade[i] + dt * pFadeRate[i]);
      pLifeFade[i] = lifeFade;
      const maxLife = pMaxLife[i];
      const ageK = maxLife > 0 ? life / maxLife : 0;
      const ageFade = ageK > 0.7 ? Math.max(0, 1 - (ageK - 0.7) / 0.3) : 1;
      pAlphaMul[i] = lifeFade * ageFade;

      // Camera transform.
      const flx = px_ * baseR;
      const fly = py_ * baseR;
      const flz = pz_ * baseR;
      const fcx = flx * yawCos - flz * yawSin;
      const fcz = flx * yawSin + flz * yawCos;
      const fcy = fly * pitchCos - fcz * pitchSin;
      const fcz3 = fly * pitchSin + fcz * pitchCos;
      const fpersp = focal / (focal + fcz3);
      const flowSx = cx + fcx * fpersp;
      const flowSy = cy + fcy * fpersp;
      const flowDepth = fpersp;

      let sx = flowSx, sy = flowSy, depth = flowDepth;
      let commit = 0;

      if (hasTargets) {
        const ti = i * 3;
        let tx, ty, tz;
        if (morphActiveSwap && ti + 2 < morphPrev.length) {
          const local = (swap - pSwpDel[i]) / pSwpDur[i];
          const t = local <= 0 ? 0 : (local >= 1 ? 1 : local);
          const eio = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const bell = Math.sin(t * Math.PI);
          const ppx = morphPrev[ti], ppy = morphPrev[ti + 1], ppz = morphPrev[ti + 2];
          const nx = morphPts[ti],   ny = morphPts[ti + 1],   nz = morphPts[ti + 2];
          const dx = nx - ppx, dy = ny - ppy;
          const cx0 = (ppx + nx) * 0.5;
          const cy0 = (ppy + ny) * 0.5;
          const cz0 = (ppz + nz) * 0.5;
          const swpCX = pSwpCX[i], swpCY = pSwpCY[i], swpCZ = pSwpCZ[i];
          const perpScale = swpCX * dynScale;
          const ctrlX = cx0 + (-dy) * perpScale + swpCX * 0.25 * dynScale;
          const ctrlY = cy0 + ( dx) * perpScale + swpCY * 0.25 * dynScale;
          const ctrlZ = cz0 + swpCZ * 0.5 * dynScale;
          const u = 1 - eio;
          let bx = u * u * ppx + 2 * u * eio * ctrlX + eio * eio * nx;
          let by = u * u * ppy + 2 * u * eio * ctrlY + eio * eio * ny;
          const bz = u * u * ppz + 2 * u * eio * ctrlZ + eio * eio * nz;
          const ang = bell * pSwpSpn[i] * dynScale;
          if (ang !== 0) {
            const cs = Math.cos(ang), sn = Math.sin(ang);
            const ox = bx - cx0, oy = by - cy0;
            bx = cx0 + ox * cs - oy * sn;
            by = cy0 + ox * sn + oy * cs;
          }
          const mLen = Math.sqrt(cx0 * cx0 + cy0 * cy0) + 1e-6;
          const burst = bell * pSwpBur[i] * dynScale;
          tx = bx + (cx0 / mLen) * burst;
          ty = by + (cy0 / mLen) * burst;
          tz = bz;
        } else {
          tx = morphPts[ti];
          ty = morphPts[ti + 1];
          tz = morphPts[ti + 2];
        }
        const tpersp = focal / (focal + tz * baseR);
        const targetSx = cx + tx * baseR * tpersp;
        const targetSy = cy + ty * baseR * tpersp;
        const targetDepth = tpersp;

        const personalCommit = pCommit[i];
        let emitterMul = 1;
        if (pEmitter[i]) {
          const ph = Math.sin(elapsed * pEmitFq[i] + pEmitPh[i]);
          if (ph > 0.4) emitterMul = Math.max(0, 1 - (ph - 0.4) * 1.7);
        }
        let perParticleMp = mp;
        if (releasing && mp < 1) {
          const releaseT = 1 - mp;
          const localR = (releaseT - pRelDel[i]) / pRelDur[i];
          const cR = localR <= 0 ? 0 : (localR >= 1 ? 1 : localR);
          const easedR = 1 - Math.pow(1 - cR, 3);
          perParticleMp = 1 - easedR;
        }
        commit = perParticleMp * COMMIT_CAP * personalCommit * emitterMul;
        let flutterX = 0, flutterY = 0;
        if (commit > 0.2) {
          const f = elapsed * pFluttFq[i] + pFluttSd[i];
          const amp = pFluttAm[i] * baseR;
          flutterX = Math.sin(f) * amp;
          flutterY = Math.cos(f * 1.3 + 1.0) * amp;
        }
        sx = flowSx + (targetSx + flutterX - flowSx) * commit;
        sy = flowSy + (targetSy + flutterY - flowSy) * commit;
        depth = flowDepth + (targetDepth - flowDepth) * commit;
        if (releasing && mp > 0.001 && mp < 1) {
          const jt = 1 - mp;
          const env = Math.sin(jt * Math.PI);
          const jSeed = pJigSd[i];
          const jAmp = pJigAm[i] * env * baseR;
          sx += Math.sin(now * 0.018 + jSeed) * jAmp;
          sy += Math.cos(now * 0.022 + jSeed * 1.7) * jAmp;
        }
      }
      pMorphCm[i] = commit;

      // Mouse repulsion (spring + wake).
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
          falloff = ease * ease;
          const push = falloff * activeStrength;
          targetPushX = (ddx / d) * push;
          targetPushY = (ddy / d) * push;
        }
      }
      let pushSx = pPushSx[i], pushSy = pPushSy[i];
      let pushVX = pPushVX[i], pushVY = pPushVY[i];
      const stiff = pStiff[i];
      const fx = (targetPushX - pushSx) * stiff;
      const fy = (targetPushY - pushSy) * stiff;
      pushVX = (pushVX + fx) * REPEL_DAMP;
      pushVY = (pushVY + fy) * REPEL_DAMP;
      if (falloff > 0.001) {
        pushVX += ptrVX * falloff * activeWake;
        pushVY += ptrVY * falloff * activeWake;
      }
      if (sculptN) {
        for (let a = 0; a < sculptN; a++) {
          const an = sculptAnchors[a];
          if (sx < an.minX - _sculptR) continue;
          if (sx > an.maxX + _sculptR) continue;
          if (sy < an.minY - _sculptR) continue;
          if (sy > an.maxY + _sculptR) continue;
          const ex = an.x2 - an.x1, ey = an.y2 - an.y1;
          const len2 = ex * ex + ey * ey;
          let acx, acy;
          if (len2 < 0.001) { acx = an.x1; acy = an.y1; }
          else {
            let t = ((sx - an.x1) * ex + (sy - an.y1) * ey) / len2;
            if (t < 0) t = 0; else if (t > 1) t = 1;
            acx = an.x1 + ex * t;
            acy = an.y1 + ey * t;
          }
          const adx = acx - sx;
          const ady = acy - sy;
          const ad2 = adx * adx + ady * ady;
          if (ad2 > _sculptR2) continue;
          const ad = Math.sqrt(ad2);
          if (ad < 0.001) continue;
          const lifeR = an.life / an.maxLife;
          const t2 = 1 - ad / _sculptR;
          const ease = t2 * t2;
          const pull = ease * SCULPT_PULL * lifeR * DPR;
          pushVX += (adx / ad) * pull;
          pushVY += (ady / ad) * pull;
        }
      }
      pushSx += pushVX;
      pushSy += pushVY;
      if (!isFinite(pushSx)) { pushSx = 0; pushVX = 0; }
      if (!isFinite(pushSy)) { pushSy = 0; pushVY = 0; }
      pPushSx[i] = pushSx; pPushSy[i] = pushSy;
      pPushVX[i] = pushVX; pPushVY[i] = pushVY;
      pRepelF[i] = falloff;

      let outSx = sx + pushSx;
      let outSy = sy + pushSy;
      let outDepth = depth;
      if (!isFinite(outSx) || !isFinite(outSy) || !isFinite(outDepth)) {
        outSx = flowSx;
        outSy = flowSy;
        outDepth = flowDepth;
        pMorphCm[i] = 0;
      }
      pSx[i] = outSx;
      pSy[i] = outSy;
      pDepth[i] = outDepth;
    }

    // Particles render path. WebGL = single GPU draw. Fallback = 2D tier loop.
    if (useWebGL && glProgram) {
      // Pack (x, y, size, alpha) per particle into the buffer. Size=0
      // for invisible particles → GPU skips them. Only active range is
      // packed; the GPU only draws activeCount points.
      const Wmax = W + 2, Hmax = H + 2;
      for (let i = 0; i < activeCount; i++) {
        const o = i * 4;
        const dpth = pDepth[i];
        const sxi = pSx[i];
        const syi = pSy[i];
        const am = pAlphaMul[i];
        let alpha = 0, size = 0;
        if (dpth >= 0.45 && sxi > -2 && sxi < Wmax && syi > -2 && syi < Hmax &&
            !(am < 1 && pAlphaPh[i] > am)) {
          // Continuous depth → alpha mapping (was 4 buckets for fillStyle batching).
          if (dpth < 0.7)       alpha = 0.18;
          else if (dpth < 0.95) alpha = 0.42;
          else if (dpth < 1.2)  alpha = 0.72;
          else                  alpha = 1.0;
          size = DPR;
          const rf = pRepelF[i];
          if (rf > 0) size *= 1 + rf * REPEL_SIZE_BOOST;
          if (pFat[i] && pMorphCm[i] > 0.5) size *= 1.7;
          if (size < 1) size = 1;
        }
        particleBuf[o] = sxi;
        particleBuf[o + 1] = syi;
        particleBuf[o + 2] = size;
        particleBuf[o + 3] = alpha;
      }
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(glProgram);
      gl.uniform2f(glLocRes, W, H);
      gl.bindVertexArray(glVAO);
      gl.bindBuffer(gl.ARRAY_BUFFER, glPosBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, particleBuf);
      gl.drawArrays(gl.POINTS, 0, activeCount);
      gl.bindVertexArray(null);
    }

    // Constellation lines on top of the dots (overlay 2D in WebGL mode).
    drawConstellation();

    if (!useWebGL) {
      // Pure 2D fallback tier render.
      for (let tier = 0; tier < TIERS.length; tier++) {
        const T = TIERS[tier];
        ctx.fillStyle = `rgba(255,255,255,${T.alpha})`;
        const baseSz = T.size * DPR;
        const tMin = T.min, tMax = T.max;
        const Wmax = W + 2, Hmax = H + 2;
        for (let i = 0; i < activeCount; i++) {
          const dpth = pDepth[i];
          if (dpth < tMin || dpth >= tMax) continue;
          const sxi = pSx[i];
          if (sxi < -2 || sxi > Wmax) continue;
          const syi = pSy[i];
          if (syi < -2 || syi > Hmax) continue;
          const am = pAlphaMul[i];
          if (am < 1 && pAlphaPh[i] > am) continue;
          let sz = baseSz;
          const rf = pRepelF[i];
          if (rf > 0) sz *= 1 + rf * REPEL_SIZE_BOOST;
          if (pFat[i] && pMorphCm[i] > 0.5) sz *= 1.7;
          const half = sz / 2;
          const w = sz < 1 ? 1 : sz;
          ctx.fillRect((sxi - half) | 0, (syi - half) | 0, w, w);
        }
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
        const sxi = pSx[idx], syi = pSy[idx];
        if (sxi < 0 || syi < 0 || sxi > W || syi > H) continue;
        if (pAlphaMul[idx] < 0.2) continue;
        const txt = (sxi / DPR).toFixed(0).padStart(4, ' ');
        const hue = labelHues[li] || 0;
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.fillText(txt, sxi + offX, syi);
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
        const sxi = pSx[idx], syi = pSy[idx];
        if (sxi < 0 || syi < 0 || sxi > W || syi > H) continue;
        if (pAlphaMul[idx] < 0.25) continue;
        const num = String(li + 1).padStart(2, '0');
        const lab = serviceTagLabels[li] || '';
        const tx = sxi + offX;
        ctx.fillStyle = '#4ade80';
        ctx.fillText(num, tx, syi);
        const numW = ctx.measureText(num).width;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(' ' + lab, tx + numW, syi);
      }
    }

    requestAnimationFrame(frame);
  }

  function start() {
    resize();
    build();
    setCoverLabels(true);
    rebuildAnchors();
    if (useWebGL) {
      initWebGL();
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      ctx.clearRect(0, 0, W, H);
    } else {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);
    }
    last = performance.now();
    startTime = last;
    requestAnimationFrame(frame);
  }

  // Resize: re-fit canvas + rebuild particle pool, but keep label
  // assignments so debug numbers don't all jump to new particles on every
  // viewport change. Debounced via rAF coalescing.
  let resizePending = false;
  window.addEventListener('resize', () => {
    if (resizePending) return;
    resizePending = true;
    requestAnimationFrame(() => {
      resizePending = false;
      resize();
      build();
      // Re-pick anchors since the particle array was rebuilt; preserve
      // labelIndices since the particle indices are still valid.
      rebuildAnchors();
    });
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      last = performance.now();
      requestAnimationFrame(frame);
    }
  });

  start();
})();

// Footer-visibility flag for legacy CSS — kept so the cover-overlay UI
// (services, recent-card, floating nav) fades when the user scrolls
// near the page bottom. No more slide-in animation: footer is just a
// regular block in normal flow below the (sticky) cover.
(function () {
  const footerEl = document.querySelector('.site-footer');
  if (!footerEl) return;
  let pending = false;
  function apply() {
    pending = false;
    const rect = footerEl.getBoundingClientRect();
    // Footer is "visible" once its top has crossed the upper 40% of
    // the viewport — i.e. user is well into reading it.
    const visible = rect.top < window.innerHeight * 0.4;
    document.body.classList.toggle('footer-visible', visible);
  }
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(apply);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', apply, { passive: true });
  apply();
})();
