// ========== INTERACTIVE 3D GAMEBOY — ABOUT PAGE ==========
(function () {
  const container = document.getElementById('gameboyContainer');
  if (!container) return;

  // === RETRO SOUND ENGINE (Web Audio API) ===
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    loadClicks();
  }

  function playTone(freq, dur, type, vol) {
    if (!audioCtx) return;
    if (typeof soundMuted !== 'undefined' && soundMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  }

  // Button click samples — 7 distinct recordings in gameboy/sound/. Decoded
  // once into an array and picked at random per press.
  const CLICK_FILES = [
    'gameboy/sound/Button_sound_01.mp4',
    'gameboy/sound/Button_sound_02.mp3',
    'gameboy/sound/Button_sound_03.mp4',
    'gameboy/sound/Button_sound_04.mp4',
    'gameboy/sound/Button_sound_05.mp4',
    'gameboy/sound/Button_sound_06.mp4',
    'gameboy/sound/Button_sound_07.mp4',
  ];
  let clickBuffers = [];
  let clickLoading = false;
  function loadClicks() {
    if (clickBuffers.length || clickLoading || !audioCtx) return;
    clickLoading = true;
    Promise.all(CLICK_FILES.map(url =>
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(buf => new Promise((res, rej) => audioCtx.decodeAudioData(buf, res, rej)))
        .catch(() => null)
    )).then(bufs => {
      clickBuffers = bufs.filter(Boolean);
      clickLoading = false;
    });
  }
  function playClick(vol) {
    if (!audioCtx || soundMuted) return;
    if (!clickBuffers.length) { loadClicks(); return; }
    const buf = clickBuffers[Math.floor(Math.random() * clickBuffers.length)];
    const src = audioCtx.createBufferSource();
    const gain = audioCtx.createGain();
    gain.gain.value = vol || 0.28;
    src.playbackRate.value = 0.94 + Math.random() * 0.12;
    src.buffer = buf;
    src.connect(gain);
    gain.connect(audioCtx.destination);
    src.start();
  }

  const sfx = {
    navigate: () => playClick(0.22),
    select: () => playClick(0.32),
    back: () => playClick(0.22),
    cartIn: () => {
      if (!audioCtx) return;
      // Slide friction — filtered noise
      const slide = audioCtx.createBufferSource();
      const slideBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.3, audioCtx.sampleRate);
      const sd = slideBuf.getChannelData(0);
      for (let i = 0; i < sd.length; i++) sd[i] = (Math.random() * 2 - 1) * 0.4 * Math.exp(-i / (sd.length * 0.5));
      slide.buffer = slideBuf;
      const lp = audioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 800;
      const sg = audioCtx.createGain();
      sg.gain.value = 0.12;
      slide.connect(lp);
      lp.connect(sg);
      sg.connect(audioCtx.destination);
      slide.start();

      // Heavy snap/click at the end
      setTimeout(() => {
        const snap = audioCtx.createBufferSource();
        const snapBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.04, audioCtx.sampleRate);
        const sn = snapBuf.getChannelData(0);
        for (let i = 0; i < sn.length; i++) sn[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sn.length * 0.05));
        snap.buffer = snapBuf;
        const g2 = audioCtx.createGain();
        g2.gain.value = 0.25;
        snap.connect(g2);
        g2.connect(audioCtx.destination);
        snap.start();
        // Low thud
        playTone(80, 0.08, 'triangle', 0.15);
        playTone(60, 0.12, 'sine', 0.1);
      }, 250);

    },
    cartOut: () => {
      if (!audioCtx) return;
      // Short friction slide
      setTimeout(() => {
        const pop = audioCtx.createBufferSource();
        const popBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
        const pd = popBuf.getChannelData(0);
        for (let i = 0; i < pd.length; i++) pd[i] = (Math.random() * 2 - 1) * Math.exp(-i / (pd.length * 0.04));
        pop.buffer = popBuf;
        const g = audioCtx.createGain();
        g.gain.value = 0.2;
        pop.connect(g);
        g.connect(audioCtx.destination);
        pop.start();
        playTone(100, 0.06, 'triangle', 0.12);
      }, 50);
    },
    boot: () => {
      if (!audioCtx || soundMuted) return;
      // Portfolio cart power-on — playful 8-bit jingle. Square-wave lead
      // with a triangle bass underneath.
      const start = 220;
      const melody = [
        [784,  0.09, 0],
        [1047, 0.09, 90],
        [1319, 0.09, 180],
        [1568, 0.22, 270],
        [1397, 0.10, 500],
        [1568, 0.10, 610],
        [1319, 0.10, 720],
        [1047, 0.32, 830],
      ];
      melody.forEach(([f, d, delay]) => {
        setTimeout(() => playTone(f, d + 0.03, 'square', 0.06), start + delay);
      });
      setTimeout(() => playTone(131, 0.5, 'triangle', 0.09), start);
      setTimeout(() => playTone(196, 0.4, 'triangle', 0.08), start + 500);
      setTimeout(() => playTone(131, 0.5, 'triangle', 0.10), start + 830);
      setTimeout(() => playTone(2093, 0.06, 'square', 0.05), start + 1160);
      setTimeout(() => playTone(2637, 0.06, 'square', 0.05), start + 1220);
      setTimeout(() => playTone(3136, 0.12, 'square', 0.05), start + 1280);
    },
    bootSnake: () => {
      // Rattlesnake rattle — rapid ascending clicks
      for (let i = 0; i < 12; i++) {
        setTimeout(() => playTone(200 + i * 50, 0.03, 'square', 0.04), i * 40);
      }
      // Hiss — filtered noise burst
      setTimeout(() => playTone(120, 0.3, 'sawtooth', 0.05), 500);
      // Dramatic low thud
      setTimeout(() => playTone(60, 0.4, 'triangle', 0.1), 800);
      // Final strike — two sharp notes
      setTimeout(() => playTone(880, 0.08, 'square', 0.07), 1000);
      setTimeout(() => playTone(1100, 0.15, 'square', 0.07), 1080);
    },
    bootFrogger: () => {
      // Ribbit sounds — ascending chirps
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          playTone(300 + i * 100, 0.06, 'square', 0.05);
          setTimeout(() => playTone(500 + i * 100, 0.08, 'square', 0.05), 60);
        }, i * 200);
      }
      // Splash
      setTimeout(() => playTone(150, 0.15, 'triangle', 0.06), 900);
      setTimeout(() => playTone(100, 0.2, 'triangle', 0.05), 1000);
      // Ready hop
      setTimeout(() => playTone(440, 0.08, 'square', 0.05), 1400);
      setTimeout(() => playTone(660, 0.08, 'square', 0.05), 1500);
      setTimeout(() => playTone(880, 0.15, 'square', 0.06), 1600);
    },
    bootBreakout: () => {
      // Arcade coin insert sound
      playTone(988, 0.06, 'square', 0.06);
      setTimeout(() => playTone(1319, 0.12, 'square', 0.06), 80);
      // Bricks loading in — staccato clicks ascending
      for (let i = 0; i < 8; i++) {
        setTimeout(() => playTone(300 + i * 80, 0.02, 'square', 0.04), 400 + i * 60);
      }
      // Power-up whoosh
      setTimeout(() => {
        for (let i = 0; i < 20; i++) {
          setTimeout(() => playTone(200 + i * 40, 0.02, 'sine', 0.03), i * 20);
        }
      }, 900);
      // Ready tone
      setTimeout(() => playTone(523, 0.15, 'square', 0.06), 1400);
      setTimeout(() => playTone(659, 0.15, 'square', 0.06), 1500);
      setTimeout(() => playTone(784, 0.25, 'square', 0.06), 1600);
    },
  };

  // === THREE.JS SETUP ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 500);
  camera.position.set(0, 5, 160);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
    stencil: false,
    depth: true,
  });
  // Cap at 1.5 — 2× costs ~78% more shader work for negligible visible gain on
  // a small canvas with already-AA'd edges.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputEncoding = THREE.sRGBEncoding;
  container.appendChild(renderer.domElement);

  // Procedural studio environment map
  const envScene = new THREE.Scene();
  const envCam = new THREE.CubeCamera(0.1, 100, new THREE.WebGLCubeRenderTarget(128));
  // Gradient sphere simulating a soft studio
  const envGeo = new THREE.SphereGeometry(50, 32, 32);
  const envMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0xd8d0c2) },
      midColor: { value: new THREE.Color(0xb8ad9c) },
      bottomColor: { value: new THREE.Color(0x88806f) },
      hotspot1: { value: new THREE.Vector3(0.5, 0.7, 0.5) },
      hotspot2: { value: new THREE.Vector3(-0.6, 0.3, 0.4) },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vWorldPos = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor, midColor, bottomColor;
      uniform vec3 hotspot1, hotspot2;
      varying vec3 vWorldPos;
      void main() {
        float y = vWorldPos.y * 0.5 + 0.5;
        vec3 col = mix(bottomColor, midColor, smoothstep(0.0, 0.4, y));
        col = mix(col, topColor, smoothstep(0.4, 1.0, y));
        // Soft light hotspots
        float h1 = pow(max(0.0, dot(normalize(vWorldPos), normalize(hotspot1))), 16.0);
        float h2 = pow(max(0.0, dot(normalize(vWorldPos), normalize(hotspot2))), 24.0);
        col += vec3(1.0, 0.95, 0.9) * h1 * 0.6;
        col += vec3(0.85, 0.9, 1.0) * h2 * 0.3;
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  envScene.add(new THREE.Mesh(envGeo, envMat));
  envCam.update(renderer, envScene);
  scene.environment = envCam.renderTarget.texture;

  // Upgrade to a real HDRI when RGBELoader is available — gives proper IBL
  // reflections on the plastic + glass. Falls back to the procedural env if
  // the HDRI fails to load.
  let hdrEnvMap = null;
  function applyHdrEnv() {
    if (!hdrEnvMap) return;
    const bm = parts['body-body'] && parts['body-body'].material;
    if (bm) { bm.envMap = hdrEnvMap; bm.needsUpdate = true; }
  }
  if (THREE.RGBELoader) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    new THREE.RGBELoader()
      .setDataType(THREE.HalfFloatType)
      .load(
        'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr',
        (hdrTex) => {
          hdrEnvMap = pmrem.fromEquirectangular(hdrTex).texture;
          scene.environment = hdrEnvMap;
          hdrTex.dispose();
          pmrem.dispose();
          applyHdrEnv();
        },
        undefined,
        () => { /* keep procedural env as fallback */ }
      );
  }

  // IBL from HDRI now does most of the work — direct lights are accents only.
  scene.add(new THREE.HemisphereLight(0xfaf2e4, 0xbfb5a5, 0.1));
  scene.add(new THREE.AmbientLight(0xfaf2e4, 0.03));

  // Key — soft warm daylight from top-right
  const key = new THREE.DirectionalLight(0xfff0d8, 0.45);
  key.position.set(20, 40, 40);
  scene.add(key);

  // Fill — very gentle cool neutral from the shadow side
  const fill = new THREE.DirectionalLight(0xd6e4f0, 0.15);
  fill.position.set(-40, 5, 30);
  scene.add(fill);

  // Rim — subtle cool edge from behind-left
  const rim = new THREE.DirectionalLight(0xaac2d8, 0.22);
  rim.position.set(-30, 10, -40);
  scene.add(rim);

  // Second rim — soft warm edge from behind-right
  const rim2 = new THREE.DirectionalLight(0xffd8a8, 0.15);
  rim2.position.set(25, 8, -35);
  scene.add(rim2);

  // Front spotlight — subtle warm pool hits the face when viewed from +Z
  const frontSpot = new THREE.SpotLight(0xfff2d8, 0.6, 260, Math.PI / 7, 0.55, 1.5);
  frontSpot.position.set(55, 30, 100);
  frontSpot.target.position.set(25, 0, 0);
  scene.add(frontSpot);
  scene.add(frontSpot.target);

  // === GAMEBOY GROUP ===
  const gb = new THREE.Group();
  scene.add(gb);

  // === SCREEN CANVAS ===
  const SCR_W = 320, SCR_H = 288;
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = SCR_W;
  screenCanvas.height = SCR_H;
  const sCtx = screenCanvas.getContext('2d');
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.magFilter = THREE.NearestFilter;
  screenTex.minFilter = THREE.NearestFilter;
  screenTex.flipY = false;

  let interactiveObjs = [];

  // Named mesh references
  const parts = {};

  // === LOAD GLTF ===
  const dracoLoader = new THREE.DRACOLoader();
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.138.0/examples/js/libs/draco/');
  const loader = new THREE.GLTFLoader();
  loader.setDRACOLoader(dracoLoader);
  loader.load('gameboy/gameboy.gltf', (gltf) => {
    const model = gltf.scene;

    // Center model
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.set(-center.x, -center.y, -center.z);

    // Collect named parts
    model.traverse((child) => {
      if (child.isMesh && child.name) {
        parts[child.name] = child;
      }
    });

    // Hide the whole gameboy until every texture is loaded — otherwise meshes
    // pop in one-by-one as their async textures resolve, which looks cheap.
    // We still run the rest of init (cart slot, buttons, hit-zones) so by the
    // time the reveal happens everything is wired up.
    gb.add(model);
    model.visible = false;

    // Get scaled bounds
    const sBox = new THREE.Box3().setFromObject(model);
    const sSize = sBox.getSize(new THREE.Vector3());

    // === SCREEN: canvas UI, renders behind the glass ===
    if (parts.screen) {
      screenTex.flipY = true;
      screenTex.encoding = THREE.sRGBEncoding;
      screenTex.needsUpdate = true;
      parts.screen.material = new THREE.MeshStandardMaterial({
        map: screenTex,
        emissiveMap: screenTex,
        emissive: 0xffffff,
        emissiveIntensity: 1.0,
        roughness: 0.9,
        metalness: 0,
      });
      parts.screen.renderOrder = 0;

    }

    // Body + glass textures — load in parallel, apply once all resolve, then
    // reveal the model and drop the skeleton loader in one shot.
    const tl = new THREE.TextureLoader();
    const texPaths = [
      'gameboy/body_Base_Color.webp',
      'gameboy/body_Normal.webp',
      'gameboy/body_Roughness.webp',
      'gameboy/body_Metallic.webp',
      'gameboy/body_Mixed_AO.webp',
      'gameboy/body_Height.webp',
      'gameboy/screen_Roughness.webp',
    ];
    const texPromises = texPaths.map(p => new Promise((resolve) => tl.load(p, resolve, undefined, () => resolve(null))));
    Promise.all(texPromises).then(([baseT, normT, roughT, metalT, aoT, bumpT, glassRoughT]) => {
      const allBody = [baseT, normT, roughT, metalT, aoT, bumpT].filter(Boolean);
      allBody.forEach(t => { t.flipY = false; });

      // Gamma-lift the base color a touch (<1 brightens)
      if (baseT && baseT.image) {
        const img = baseT.image;
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const cx = c.getContext('2d');
        cx.drawImage(img, 0, 0);
        const data = cx.getImageData(0, 0, c.width, c.height);
        const g = 0.82;
        const contrast = 1.12; // pivot around 0.5
        for (let i = 0; i < data.data.length; i += 4) {
          let r = Math.pow(data.data[i]   / 255, g);
          let gC = Math.pow(data.data[i+1] / 255, g);
          let b = Math.pow(data.data[i+2] / 255, g);
          r = Math.min(1, Math.max(0, 0.5 + (r - 0.5) * contrast));
          gC = Math.min(1, Math.max(0, 0.5 + (gC - 0.5) * contrast));
          b = Math.min(1, Math.max(0, 0.5 + (b - 0.5) * contrast));
          data.data[i]   = 255 * r;
          data.data[i+1] = 255 * gC;
          data.data[i+2] = 255 * b;
        }
        cx.putImageData(data, 0, 0);
        const lifted = new THREE.CanvasTexture(c);
        lifted.flipY = false;
        lifted.encoding = THREE.sRGBEncoding;
        lifted.anisotropy = baseT.anisotropy || 1;
        lifted.needsUpdate = true;
        baseT = lifted;
      } else if (baseT) {
        baseT.encoding = THREE.sRGBEncoding;
      }

      const bodyMesh = parts['body-body'];
      if (bodyMesh && baseT) {
        bodyMesh.material = new THREE.MeshStandardMaterial({
          map: baseT,
          normalMap: normT || null,
          roughnessMap: roughT || null,
          metalnessMap: metalT || null,
          aoMap: aoT || null,
          bumpMap: bumpT || null,
          bumpScale: 0.3,
          roughness: 1,
          metalness: 1,
          envMap: envCam.renderTarget.texture,
          envMapIntensity: 0.4,
        });
      }

      if (parts.glass && glassRoughT) {
        glassRoughT.flipY = false;
        parts.glass.material.roughnessMap = glassRoughT;
        parts.glass.material.roughness = 1;
        parts.glass.material.needsUpdate = true;
      }

      // All materials in place — reveal everything at once and clear loader.
      model.visible = true;
      const skel = document.getElementById('gbSkeleton');
      if (skel) skel.remove();
    });

    // Light: red translucent LED — glass housing with light passing through
    const lightMesh = parts['body-light'];
    if (lightMesh) {
      lightMesh.material = new THREE.MeshPhysicalMaterial({
        color: 0xff2020,
        emissive: 0xff0000,
        emissiveIntensity: 0.6,
        roughness: 0.05,
        metalness: 0.0,
        transmission: 1.0,       // let light pass through the housing
        ior: 1.5,                // glass refraction
        thickness: 0.6,          // volume inside the lens
        attenuationColor: 0xff3030,
        attenuationDistance: 0.4,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        transparent: true,
      });
      // Red point light — starts off
      const ledBox = new THREE.Box3().setFromObject(lightMesh);
      const ledCenter = ledBox.getCenter(new THREE.Vector3());
      const ledGlow = new THREE.PointLight(0xff0000, 0, 8);
      ledGlow.position.copy(ledCenter);
      model.add(ledGlow);
      // Store refs to turn on during boot
      lightMesh.userData.ledGlow = ledGlow;
    }

    // Glass: GLTF loads tex_0 + transparency; roughness map is applied in
    // the Promise.all above so it lands at the same moment as the body maps.
    if (parts.glass) {
      const glassMat = parts.glass.material;
      glassMat.transparent = true;
      glassMat.depthWrite = false;
      parts.glass.renderOrder = 1;

      // Toggle glass visibility with G key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'g' || e.key === 'G') {
          parts.glass.visible = !parts.glass.visible;
        }
      });
    }

    // === CARTRIDGE: hidden on start, click slot to insert ===
    if (parts.casette) {
      parts.casette.userData.baseY = parts.casette.position.y;
      parts.casette.visible = false; // hidden on load
      // Match the body brightness — saturated yellow was being pumped by the
      // HDRI. Darken the color and cut env reflections.
      if (parts.casette.material) {
        parts.casette.material = parts.casette.material.clone();
        const cm = parts.casette.material;
        if (cm.color) cm.color.multiplyScalar(0.8);
        if ('envMapIntensity' in cm) cm.envMapIntensity = 0.45;
        cm.needsUpdate = true;
        // Remember the baseline tint so per-cart color swaps are composable.
        if (cm.color) parts.casette.userData.baseColor = cm.color.clone();
        // Cache the plastic material + build a dedicated gold material for
        // the portfolio cart (swapped in by applyCartTint).
        parts.casette.userData.plasticMat = cm;
        parts.casette.userData.goldMat = new THREE.MeshStandardMaterial({
          color: 0xc9a24a,
          metalness: 1.0,
          roughness: 0.26,
          envMapIntensity: 1.0,
        });
      }

      // Create invisible hit zone where cartridge slot is (on the back)
      const cBox = new THREE.Box3().setFromObject(parts.casette);
      const cSize = cBox.getSize(new THREE.Vector3());
      const cCenter = cBox.getCenter(new THREE.Vector3());
      const slotHit = new THREE.Mesh(
        new THREE.BoxGeometry(cSize.x * 2, cSize.y * 1.5, 0.5),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      slotHit.position.set(cCenter.x, cCenter.y, cCenter.z - cSize.z * 0.5);
      slotHit.userData.action = 'insertCart';
      model.add(slotHit);
      interactiveObjs.push(slotHit);

      // Minimal text hint on back
      const hintCvs = document.createElement('canvas');
      hintCvs.width = 256; hintCvs.height = 64;
      const hC = hintCvs.getContext('2d');
      hC.fillStyle = 'rgba(255,255,255,0.7)';
      hC.font = '12px "Press Start 2P", monospace';
      hC.textAlign = 'center';
      hC.fillText('click to insert', 128, 28);
      hC.fillText('\u25BC', 128, 48);
      const hintTex = new THREE.CanvasTexture(hintCvs);
      const hint = new THREE.Mesh(
        new THREE.PlaneGeometry(cSize.x * 0.9, cSize.y * 0.25),
        new THREE.MeshBasicMaterial({ map: hintTex, transparent: true, side: THREE.DoubleSide })
      );
      hint.position.set(cCenter.x, cCenter.y + cSize.y * 0.3, cCenter.z - cSize.z * 0.6);
      hint.rotation.y = Math.PI;
      model.add(hint);

      // Store original positions for re-creation after eject
      parts.casette.userData.hintPos = hint.position.clone();
      parts.casette.userData.hintGeoW = cSize.x * 0.9;
      parts.casette.userData.hintGeoH = cSize.y * 0.25;
      slotHit.userData.hint = hint;

    }

    // === BUTTON INTERACTION ===
    const btnNames = {
      'A': 'a',
      'B': 'b',
      'joystick': 'up',
      'reset': 'a',
      'power': 'b',
    };

    for (const [meshName, action] of Object.entries(btnNames)) {
      if (parts[meshName]) {
        parts[meshName].userData.action = action;
        interactiveObjs.push(parts[meshName]);
      }
    }


    // Add invisible hit zones on the joystick for directional input
    if (parts.joystick) {
      const jBox = new THREE.Box3().setFromObject(parts.joystick);
      const jCenter = jBox.getCenter(new THREE.Vector3());
      const jSize = jBox.getSize(new THREE.Vector3());
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hs = Math.max(jSize.x, jSize.y) * 0.35;

      function addDpadHit(ox, oy, action, tiltX, tiltY) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(hs, hs, hs * 2), hitMat);
        const pos = jCenter.clone();
        pos.x += ox;
        pos.y += oy;
        pos.z += jSize.z * 0.5;
        m.position.copy(pos);
        m.userData.action = action;
        m.userData.isJoystick = true;
        m.userData.tiltX = tiltX;
        m.userData.tiltY = tiltY;
        model.add(m);
        return m;
      }

      const step = hs * 1.2;
      const tiltAngle = 0.2;
      const dUp = addDpadHit(0, step, 'up', -tiltAngle, 0);
      const dDown = addDpadHit(0, -step, 'down', tiltAngle, 0);
      const dLeft = addDpadHit(-step, 0, 'left', 0, -tiltAngle);
      const dRight = addDpadHit(step, 0, 'right', 0, tiltAngle);
      interactiveObjs.push(dUp, dDown, dLeft, dRight);

      // Remove the generic joystick hit since we have directional ones
      const jIdx = interactiveObjs.indexOf(parts.joystick);
      if (jIdx !== -1) interactiveObjs.splice(jIdx, 1);
    }

    // === A / B buttons — realistic matte plastic + letter decal ===
    function styleButton(mesh, letter) {
      if (!mesh) return;
      // Match the D-pad plastic — share the joystick's material
      if (parts.joystick && parts.joystick.material) {
        mesh.material = parts.joystick.material;
      }

      gb.updateMatrixWorld(true);
      const wBox = new THREE.Box3().setFromObject(mesh);
      const wSize = wBox.getSize(new THREE.Vector3());
      const wCenter = wBox.getCenter(new THREE.Vector3());
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 256;
      const ctx = canvas.getContext('2d');
      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = bumpCanvas.height = 256;
      const bCtx = bumpCanvas.getContext('2d');
      function drawLetter() {
        ctx.clearRect(0, 0, 256, 256);
        ctx.font = '700 170px "Jost", "Futura", "Helvetica Neue", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#242424';
        ctx.fillText(letter, 128, 131);
        tex.needsUpdate = true;

        // Bump map — black letter on white (engraved = low), softly blurred
        bCtx.fillStyle = '#ffffff';
        bCtx.fillRect(0, 0, 256, 256);
        bCtx.filter = 'blur(2.5px)';
        bCtx.fillStyle = '#000000';
        bCtx.font = '700 170px "Jost", "Futura", "Helvetica Neue", Arial, sans-serif';
        bCtx.textAlign = 'center';
        bCtx.textBaseline = 'middle';
        bCtx.fillText(letter, 128, 131);
        bCtx.filter = 'none';
        bumpTex.needsUpdate = true;
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 8;
      tex.encoding = THREE.sRGBEncoding;
      const bumpTex = new THREE.CanvasTexture(bumpCanvas);
      bumpTex.anisotropy = 8;
      drawLetter();
      if (document.fonts && document.fonts.load) {
        document.fonts.load('700 170px Jost').then(drawLetter).catch(() => {});
      }
      const size = Math.max(wSize.x, wSize.y) * 0.7;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(size, size),
        new THREE.MeshStandardMaterial({
          map: tex, bumpMap: bumpTex, bumpScale: 0.08,
          roughness: 0.65, metalness: 0,
          envMap: envCam.renderTarget.texture, envMapIntensity: 0.15,
          transparent: true, alphaTest: 0.02, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
        })
      );
      // Raycast down onto the dome top and sink the flat plane slightly into
      // the dome so its edges don't float above the curved surface.
      const bRay = new THREE.Raycaster();
      bRay.set(new THREE.Vector3(wCenter.x, wCenter.y, wBox.max.z + 1), new THREE.Vector3(0, 0, -1));
      const hits = bRay.intersectObject(mesh, true);
      const peakZ = hits.length ? hits[0].point.z : wBox.max.z;
      // Sink by a fraction of the button radius so edges merge flush into dome
      const sink = Math.max(wSize.x, wSize.y) * -0.005;
      plane.position.set(wCenter.x, wCenter.y, peakZ - sink);
      plane.raycast = () => {};
      scene.add(plane);
      mesh.attach(plane);

      // Glow overlay — a second plane with a white letter + halo, fades in
      // on press (flashLetterGlow).
      const gCanvas = document.createElement('canvas');
      gCanvas.width = gCanvas.height = 256;
      const gCtx = gCanvas.getContext('2d');
      // A glows green, B glows red. Halo + core colors per letter.
      const glowColors = {
        A: { halo: 'rgba(60, 255, 120, 0.95)', core: '#b6ffca' },
        B: { halo: 'rgba(255, 60, 70, 0.95)',  core: '#ffc8c8' },
      };
      const gcol = glowColors[letter] || { halo: 'rgba(255,255,255,0.95)', core: '#ffffff' };
      function drawGlow() {
        gCtx.clearRect(0, 0, 256, 256);
        gCtx.font = '700 170px "Jost", "Futura", "Helvetica Neue", Arial, sans-serif';
        gCtx.textAlign = 'center';
        gCtx.textBaseline = 'middle';
        gCtx.shadowColor = gcol.halo;
        gCtx.shadowBlur = 34;
        gCtx.fillStyle = gcol.core;
        gCtx.fillText(letter, 128, 131);
        gCtx.shadowBlur = 10;
        gCtx.fillText(letter, 128, 131);
        gTex.needsUpdate = true;
      }
      const gTex = new THREE.CanvasTexture(gCanvas);
      gTex.anisotropy = 8;
      gTex.encoding = THREE.sRGBEncoding;
      drawGlow();
      if (document.fonts && document.fonts.load) {
        document.fonts.load('700 170px Jost').then(drawGlow).catch(() => {});
      }
      const glowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(size * 1.15, size * 1.15),
        new THREE.MeshBasicMaterial({
          map: gTex, transparent: true, opacity: 0, depthWrite: false,
          blending: THREE.AdditiveBlending,
          polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
        })
      );
      glowPlane.position.set(wCenter.x, wCenter.y, peakZ - sink + 0.01);
      glowPlane.raycast = () => {};
      scene.add(glowPlane);
      mesh.attach(glowPlane);
      mesh.userData.glowPlane = glowPlane;
    }

    function flashLetterGlow(action) {
      let plane = null;
      if (action === 'a' && parts.A && parts.A.userData.glowPlane) plane = parts.A.userData.glowPlane;
      else if (action === 'b' && parts.B && parts.B.userData.glowPlane) plane = parts.B.userData.glowPlane;
      else if (parts.joystick && parts.joystick.userData.arrowGlows) {
        plane = parts.joystick.userData.arrowGlows[action];
      }
      if (!plane) return;
      const mat = plane.material;
      const start = performance.now();
      const dur = 280;
      mat.opacity = 1;
      (function tick(now) {
        const t = Math.min(1, (now - start) / dur);
        mat.opacity = 1 - t;
        if (t < 1) requestAnimationFrame(tick);
        else mat.opacity = 0;
      })(performance.now());
    }
    // Expose for pressButton
    window._gbFlashLetter = flashLetterGlow;
    // Darken the shared button plastic a touch (A, B + D-pad), keep it shiny
    // but add a procedural fingerprint/smudge roughness map so light moving
    // across the surface reveals soft oily patches where a thumb would sit.
    if (parts.joystick && parts.joystick.material) {
      parts.joystick.material = parts.joystick.material.clone();
      const m = parts.joystick.material;
      if (m.color) m.color.multiplyScalar(0.55);
      if ('roughness' in m) m.roughness = 0.5;
      if ('metalness' in m) m.metalness = 0.45;
      if ('envMapIntensity' in m) m.envMapIntensity = 0.8;

      // Build a fingerprint/smudge roughness texture
      const rSize = 256;
      const rC = document.createElement('canvas');
      rC.width = rC.height = rSize;
      const rx = rC.getContext('2d');
      rx.fillStyle = '#d9d9d9'; // baseline high roughness (~0.85)
      rx.fillRect(0, 0, rSize, rSize);
      // A handful of soft oily blobs — darker = smoother touched spots
      for (let i = 0; i < 7; i++) {
        const x = Math.random() * rSize;
        const y = Math.random() * rSize;
        const r = 34 + Math.random() * 70;
        const grad = rx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, 'rgba(70, 70, 70, 0.55)');
        grad.addColorStop(1, 'rgba(70, 70, 70, 0)');
        rx.fillStyle = grad;
        rx.fillRect(0, 0, rSize, rSize);
      }
      // Fine grain for skin texture
      const imgData = rx.getImageData(0, 0, rSize, rSize);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const n = (Math.random() - 0.5) * 18;
        imgData.data[i]     = Math.min(255, Math.max(0, imgData.data[i]     + n));
        imgData.data[i + 1] = Math.min(255, Math.max(0, imgData.data[i + 1] + n));
        imgData.data[i + 2] = Math.min(255, Math.max(0, imgData.data[i + 2] + n));
      }
      rx.putImageData(imgData, 0, 0);
      const rMap = new THREE.CanvasTexture(rC);
      rMap.wrapS = rMap.wrapT = THREE.RepeatWrapping;
      rMap.anisotropy = 4;
      rMap.needsUpdate = true;
      m.roughnessMap = rMap;
      m.needsUpdate = true;
    }
    styleButton(parts.A, 'A');
    styleButton(parts.B, 'B');

    // === D-pad direction arrows (subtle triangle decals) ===
    if (parts.joystick) {
      gb.updateMatrixWorld(true);
      const jBox = new THREE.Box3().setFromObject(parts.joystick);
      const jSize = jBox.getSize(new THREE.Vector3());
      const jCenter = jBox.getCenter(new THREE.Vector3());

      function makeArrowMaps(rotationRad) {
        function triPath(ctx2) {
          ctx2.beginPath();
          ctx2.moveTo(0, -30);
          ctx2.lineTo(26, 18);
          ctx2.lineTo(-26, 18);
          ctx2.closePath();
        }
        // Color map — dark triangle with dust-rim highlight inside
        const cCanvas = document.createElement('canvas');
        cCanvas.width = cCanvas.height = 128;
        const cCtx = cCanvas.getContext('2d');
        cCtx.translate(64, 64);
        cCtx.rotate(rotationRad);
        cCtx.fillStyle = '#242424';
        triPath(cCtx);
        cCtx.fill();
        cCtx.save();
        cCtx.globalCompositeOperation = 'source-atop';
        cCtx.lineWidth = 1.6;
        cCtx.strokeStyle = 'rgba(230, 215, 185, 0.3)';
        triPath(cCtx);
        cCtx.stroke();
        cCtx.restore();

        // Bump map — black triangle on white (engraved = low), softly blurred
        const bCanvas = document.createElement('canvas');
        bCanvas.width = bCanvas.height = 128;
        const bCtx2 = bCanvas.getContext('2d');
        bCtx2.fillStyle = '#ffffff';
        bCtx2.fillRect(0, 0, 128, 128);
        bCtx2.translate(64, 64);
        bCtx2.rotate(rotationRad);
        bCtx2.filter = 'blur(2px)';
        bCtx2.fillStyle = '#000000';
        triPath(bCtx2);
        bCtx2.fill();
        bCtx2.filter = 'none';

        const tex = new THREE.CanvasTexture(cCanvas);
        tex.anisotropy = 8;
        tex.encoding = THREE.sRGBEncoding;
        const bumpTex = new THREE.CanvasTexture(bCanvas);
        bumpTex.anisotropy = 8;
        return { tex, bumpTex };
      }

      const armLen = Math.max(jSize.x, jSize.y) * 0.29;
      const triSize = Math.max(jSize.x, jSize.y) * 0.28;
      // Raycast down onto the joystick at each arm position so the triangle
      // sits on the actual plastic surface instead of the overall bbox top.
      const dRay = new THREE.Raycaster();
      const downDir = new THREE.Vector3(0, 0, -1);
      function surfaceZ(x, y) {
        dRay.set(new THREE.Vector3(x, y, jBox.max.z + 1), downDir);
        const hits = dRay.intersectObject(parts.joystick, true);
        return hits.length ? hits[0].point.z + 0.002 : jBox.max.z;
      }
      function makeArrowGlowTex(rotationRad) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 128);
        ctx.save();
        ctx.translate(64, 64);
        ctx.rotate(rotationRad);
        ctx.shadowColor = 'rgba(255,255,255,0.95)';
        ctx.shadowBlur = 28;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(26, 18);
        ctx.lineTo(-26, 18);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        const tex = new THREE.CanvasTexture(canvas);
        tex.anisotropy = 8;
        tex.encoding = THREE.sRGBEncoding;
        tex.needsUpdate = true;
        return tex;
      }

      const dirs = [
        ['up',    0,  armLen, 0],
        ['down',  0, -armLen, Math.PI],
        ['left', -armLen, 0, -Math.PI / 2],
        ['right', armLen, 0,  Math.PI / 2],
      ];
      const arrowGlows = {};
      for (const [name, dx, dy, rot] of dirs) {
        const wx = jCenter.x + dx, wy = jCenter.y + dy;
        const sz = surfaceZ(wx, wy);
        const { tex: aTex, bumpTex: aBumpTex } = makeArrowMaps(rot);
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(triSize, triSize),
          new THREE.MeshStandardMaterial({
            map: aTex, bumpMap: aBumpTex, bumpScale: 0.07,
            roughness: 0.65, metalness: 0,
            envMap: envCam.renderTarget.texture, envMapIntensity: 0.15,
            transparent: true, alphaTest: 0.02, depthWrite: false,
            polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
          })
        );
        plane.position.set(wx, wy, sz);
        plane.raycast = () => {};
        scene.add(plane);
        parts.joystick.attach(plane);

        // Glow overlay — additive blend, opacity 0 until flashLetterGlow fires
        const glowPlane = new THREE.Mesh(
          new THREE.PlaneGeometry(triSize * 1.25, triSize * 1.25),
          new THREE.MeshBasicMaterial({
            map: makeArrowGlowTex(rot), transparent: true, opacity: 0, depthWrite: false,
            blending: THREE.AdditiveBlending,
            polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
          })
        );
        glowPlane.position.set(wx, wy, sz + 0.01);
        glowPlane.raycast = () => {};
        scene.add(glowPlane);
        parts.joystick.attach(glowPlane);
        arrowGlows[name] = glowPlane;
      }
      parts.joystick.userData.arrowGlows = arrowGlows;
    }

    // === START / RESET labels on the body plastic under the small buttons ===
    function addBodyLabel(btnMesh, labelText) {
      if (!btnMesh) return;
      const bodyMesh = parts['body-body'];
      if (!bodyMesh) return;
      gb.updateMatrixWorld(true);
      const bBox = new THREE.Box3().setFromObject(btnMesh);
      const bCenter = bBox.getCenter(new THREE.Vector3());
      const bSize = bBox.getSize(new THREE.Vector3());

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Pick a font size that keeps ~30px side padding for the longest label.
        let fontPx = 62;
        ctx.font = `700 ${fontPx}px "Jost", "Futura", "Helvetica Neue", Arial, sans-serif`;
        const maxTextW = canvas.width - 60;
        let measured = ctx.measureText(labelText).width;
        while (measured > maxTextW && fontPx > 24) {
          fontPx -= 2;
          ctx.font = `700 ${fontPx}px "Jost", "Futura", "Helvetica Neue", Arial, sans-serif`;
          measured = ctx.measureText(labelText).width;
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        // Embossed yellow plastic — same hue as the body, shadow for raised look
        ctx.fillStyle = 'rgba(120, 80, 10, 0.55)';
        ctx.fillText(labelText, cx, cy + 4);
        ctx.fillStyle = '#c9a12a';
        ctx.fillText(labelText, cx, cy - 2);
        tex.needsUpdate = true;
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 8;
      tex.encoding = THREE.sRGBEncoding;
      draw();
      if (document.fonts && document.fonts.load) {
        document.fonts.load('700 62px Jost').then(draw).catch(() => {});
      }

      const labelW = bSize.x * 2.6;
      const labelH = labelW * 0.25;
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(labelW, labelH),
        new THREE.MeshBasicMaterial({
          map: tex, transparent: true, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
        })
      );
      // Place below the button, raycast down to land on body plastic surface
      const labelY = bCenter.y - bSize.y * 1.4;
      const bRay = new THREE.Raycaster();
      bRay.set(new THREE.Vector3(bCenter.x, labelY, bBox.max.z + 1), new THREE.Vector3(0, 0, -1));
      const hits = bRay.intersectObject(bodyMesh, true);
      const surfZ = hits.length ? hits[0].point.z + 0.06 : bBox.max.z - bSize.z * 0.3;
      plane.position.set(bCenter.x, labelY, surfZ);
      plane.raycast = () => {};
      scene.add(plane);
      bodyMesh.attach(plane);
    }
    addBodyLabel(parts.reset, 'START');
    addBodyLabel(parts.power, 'SELECT');

    drawScreen();
  }, undefined, (err) => {
    console.error('GLTF load error:', err);
  });

  // ========== SCREEN UI ==========
  // GBC — high contrast, punchy colors
  const C = { bg: '#f0f0e8', light: '#d0d8c0', dark: '#404040', ink: '#000000' };
  // Cartridge data — two swappable carts
  const cartridges = {
    portfolio: {
      label: 'PORTFOLIO',
      header: 'LUKA GRCAR',
      menuItems: ['ABOUT ME', 'STATS', 'LOADOUT', 'ALLIES', 'TROPHIES', 'PING ME', 'QUESTS', 'OPTIONS'],
    },
    snake: {
      label: 'SNAKE',
      header: 'SNAKE',
      menuItems: ['PLAY', 'HIGH SCORES', 'SOUND TEST', 'CHEATS', 'ERASE SAVE'],
      autoStart: false,
    },
    breakout: {
      label: 'BREAKOUT',
      header: 'BREAKOUT',
      menuItems: ['PLAY', 'HIGH SCORES', 'SOUND TEST', 'CHEATS', 'ERASE SAVE'],
      autoStart: false,
    },
    frogger: {
      label: 'FROGGER',
      header: 'FROGGER',
      menuItems: ['PLAY', 'HIGH SCORES', 'SOUND TEST', 'CHEATS', 'ERASE SAVE'],
      autoStart: false,
    }
  };
  let activeCart = null; // 'portfolio' or 'games'
  let currentMenuItems = cartridges.portfolio.menuItems;
  let currentHeader = cartridges.portfolio.header;

  let screen = 'insert'; // starts waiting for cartridge
  let cursor = 0;
  let scroll = 0;
  let detailCursor = 0; // cursor within detail list
  let bootTimer = 0;
  let cartInserted = false;
  let lastInteraction = 0;
  let screenOff = false;
  let screenSaver = false;
  let ssX = 0.3, ssY = 0.3, ssDx = 0.2, ssDy = 0.15;
  let ssHue = 0;
  let detailVisibleCount = 5; // updated by drawScreen
  let lcdTransition = false;
  let lcdPhase = 0;       // 0=wipe-in, 1=hold, 2=wipe-out
  let lcdProgress = 0;
  let lcdStart = 0;
  let lcdPendingFn = null;

  const LCD_WIPE_IN = 180;
  const LCD_HOLD = 60;
  const LCD_WIPE_OUT = 200;
  const LCD_STRIPS = 12;

  function lcdFlash(fn) {
    if (lcdTransition) { fn(); drawScreen(); return; }
    lcdTransition = true;
    lcdPhase = 0;
    lcdProgress = 0;
    lcdStart = performance.now();
    lcdPendingFn = fn;
    requestAnimationFrame(lcdAnimate);
  }

  function lcdAnimate(now) {
    const elapsed = now - lcdStart;
    if (lcdPhase === 0) {
      lcdProgress = Math.min(1, elapsed / LCD_WIPE_IN);
      if (lcdProgress >= 1) { lcdPhase = 1; lcdStart = now; if (lcdPendingFn) { lcdPendingFn(); lcdPendingFn = null; } }
    } else if (lcdPhase === 1) {
      lcdProgress = 1;
      if (elapsed >= LCD_HOLD) { lcdPhase = 2; lcdStart = now; }
    } else {
      lcdProgress = Math.min(1, elapsed / LCD_WIPE_OUT);
      if (lcdProgress >= 1) { lcdTransition = false; drawScreen(); return; }
    }
    drawScreen();
    if (lcdTransition) requestAnimationFrame(lcdAnimate);
  }

  const details = {
    'ABOUT ME': ['3D generalist &','UX designer','','Ljubljana, Slovenia','','Crafting visual','experiences through','3D animation, motion','design & brand','strategy.','','[bike]','','Giant Propel','Advanced Pro 1','','When not pushing','pixels, pushing','pedals.','','[photo]'],
    'STATS': ['3D Anim|92','Motion GFX|88','Product Viz|85','Identity|78','Creative Dir|74','UX/UI|70','Projection|82','Social|65'],
    'LOADOUT': ['Cinema 4D','Houdini','Redshift','After Effects','Photoshop','Illustrator','InDesign','ZBrush','Figma','','AI','ChatGPT','Midjourney','Claude','Stable Diffusion','DALL-E','Runway','Sora','ComfyUI','Cursor'],
    'ALLIES': ['Festival Grounded',"Athlete's Foot",'Cestel','Natureta','LargaVida','NewEdge Magazine','Kersnikova','Pritlicje','Studio ENKI'],
    'TROPHIES': ['WEBSI Prvak|2022','Netko|2022','Diggit Zlata|2022','Awwwards HM|2022','CSSDA 7xKudo|2022','CSSREEL 2xFD|2022','BestCSS 2xSD|2022','WEBSI Prvak|2021','Netko 2xFOTD|2021','Awwwards HM|2021','CSSDA 2xKudo|2021'],
    'PING ME': ['','Email:','luka.grcar@me.com','','Instagram:','@lukakluka','','Behance:','/lukagrcar'],
    'QUESTS': ['CESTEL','Grounded 22','Grounded 21',"Athletes Foot",'Grounded 20','Grounded 18','TamTam','AppointMENT','Halloween','Black Friday','LargaVida','NewEdge','Grounded 23','Grounded 25','Grounded 24','Lab','Kersnikova','Natureta Renders','Natureta 100'],
    'OPTIONS': ['PALETTE','CONTRAST','SOUND','BATTERY','LINK CABLE','CREDITS','DIP SWITCHES','SERIAL NO.','DEV MODE'],
  };

  // ============ OPTIONS STATE ============
  const palettes = [
    { id: 'DMG',    bg: '#9bbc0f', ink: '#0f380f', dark: '#306230', light: '#8bac0f' }, // classic DMG green
    { id: 'POCKET', bg: '#c4cfa1', ink: '#1a1a1a', dark: '#555555', light: '#8a8e63' }, // Pocket gray-green
    { id: 'COLOR',  bg: '#f0f0e8', light: '#d0d8c0', dark: '#404040', ink: '#000000' }, // GBC default (current)
    { id: 'BERRY',  bg: '#f8c4c4', ink: '#3a1010', dark: '#8a2a2a', light: '#e08080' },
    { id: 'GRAPE',  bg: '#c8b0e8', ink: '#2a1040', dark: '#5a3090', light: '#9870d0' },
    { id: 'DARK',   bg: '#101014', ink: '#cfcfcf', dark: '#505058', light: '#8a8a90' }, // night mode
  ];
  let paletteIdx = 2; // start on COLOR (matches original scheme)
  const applyPalette = () => {
    const p = palettes[paletteIdx];
    C.bg = p.bg; C.ink = p.ink; C.dark = p.dark; C.light = p.light;
  };
  applyPalette();

  let contrastLevel = 5; // 0–9, drives screen emissive dimming
  let soundMuted = false;
  const batteryStart = performance.now();
  const dipSwitches = [
    { label: 'TURBO',    on: false },
    { label: 'INVERT',   on: false },
    { label: 'EXTRA LIVES', on: false },
    { label: 'DEMO MODE', on: false },
  ];
  let dipCursor = 0;
  let soundTestCursor = 0;
  const soundTestTracks = [
    { label: '01 NAV',    play: () => sfx.navigate() },
    { label: '02 SELECT', play: () => sfx.select() },
    { label: '03 BACK',   play: () => sfx.back() },
    { label: '04 CARTIN', play: () => sfx.cartIn() },
    { label: '05 CARTOUT',play: () => sfx.cartOut() },
    { label: '06 BOOT',   play: () => sfx.boot() },
    { label: '07 SNAKE',  play: () => sfx.bootSnake() },
    { label: '08 BRK',    play: () => sfx.bootBreakout() },
    { label: '09 FROG',   play: () => sfx.bootFrogger() },
  ];
  let cheatSeq = []; // last 8 button presses for cheat codes
  let cheatUnlocked = false;
  let creditScroll = 0;
  const creditsText = [
    '== LUKAGRCAR.COM ==',
    '', 'DIRECTOR', 'LUKA GRCAR', '',
    'CODE', 'LUKA GRCAR', 'CLAUDE CODE', '',
    '3D & MOTION', 'LUKA GRCAR', '',
    'MUSIC', 'WEB AUDIO API', '',
    'SPECIAL THANKS', 'COFFEE', 'NIGHTS', 'PIXELS', '',
    'MADE IN', 'LJUBLJANA','SLOVENIA','',
    '(C) 2025','ALL RIGHTS','RESERVED','',
    'INSERT COIN TO','CONTINUE ><',
    '', '', '',
  ];
  let currentOption = null;
  let optCursor = 0;
  // Helper: dim factor 0.2–1.0 from contrastLevel
  const contrastFactor = () => 0.08 + (contrastLevel / 9) * 1.82;

  const projDescs = [
    'Bridge weigh-in-motion animation for Cestel',
    'Full visual identity for Grounded 2022',
    'Poster series & social for Grounded 2021',
    '3D sneaker animation for The Athletes Foot',
    'Visual identity for Grounded: Truth',
    'Identity for Grounded 2018',
    'City Poster of the Year — TamTam 2018',
    'Visual identity for AppointMENT 4.0',
    'Halloween 3D universe for Athletes Foot',
    'Black Friday campaign — Athletes Foot',
    'LargaVida limited edition packaging',
    'Editorial design for NewEdge Magazine',
    '3D animation & motion for Grounded 2023',
    'Motion design for Grounded 2025',
    'Visual identity for Grounded 2024',
    'Personal 3D experiments & explorations',
    'Visual identity for Kersnikova',
    'Photorealistic product renders for Natureta',
    '100 years of Natureta campaign',
  ];

  const projImgCounts = [3,3,3,3,3,2,1,1,3,2,1,3,3,2,3,3,2,2,2];

  // Preload project thumbnails (multiple per project)
  const projThumbs = [];
  for (let i = 0; i < 19; i++) {
    const imgs = [];
    for (let j = 0; j < projImgCounts[i]; j++) {
      const img = new Image();
      img.src = 'gameboy/thumbs/' + i + '_' + j + '.webp';
      imgs.push(img);
    }
    projThumbs.push(imgs);
  }

  // About me images
  const aboutPhotos = {};
  const photoImg = new Image(); photoImg.src = 'gameboy/photo_2026-04-16_22-04-39.jpg';
  photoImg.onload = () => { aboutPhotos.photo = photoImg; drawScreen(); };
  const bikeImg = new Image(); bikeImg.src = 'gameboy/photo_2026-04-16_22-04-23.jpg';
  bikeImg.onload = () => { aboutPhotos.bike = bikeImg; drawScreen(); };

  // Project detail screen state
  let projScreen = false;
  let trophyScreen = false;

  // === SNAKE GAME ===
  const SNAKE_COLS = 18, SNAKE_ROWS = 14;
  let snake = [], snakeDir = {x:1,y:0}, snakeNextDir = {x:1,y:0};
  let snakeFood = null, snakeScore = 0, snakeAlive = false, snakeStarted = false;
  let snakeTickTimer = 0, snakeSpeed = 0.16; // seconds per tick

  function snakeReset() {
    const midX = Math.floor(SNAKE_COLS / 2);
    const midY = Math.floor(SNAKE_ROWS / 2);
    snake = [{x:midX,y:midY},{x:midX-1,y:midY},{x:midX-2,y:midY}];
    snakeDir = {x:1,y:0};
    snakeNextDir = {x:1,y:0};
    snakeScore = 0;
    snakeAlive = true;
    snakeStarted = true;
    snakeSpeed = 0.16;
    snakePlaceFood();
  }

  function snakePlaceFood() {
    let pos;
    do {
      pos = {x: Math.floor(Math.random() * SNAKE_COLS), y: Math.floor(Math.random() * SNAKE_ROWS)};
    } while (snake.some(s => s.x === pos.x && s.y === pos.y));
    snakeFood = pos;
  }

  function snakeTick() {
    if (!snakeAlive) return;
    snakeDir = snakeNextDir;
    const head = {x: snake[0].x + snakeDir.x, y: snake[0].y + snakeDir.y};

    // Wall collision
    if (head.x < 0 || head.x >= SNAKE_COLS || head.y < 0 || head.y >= SNAKE_ROWS) {
      snakeAlive = false;
      sfx.back();
      return;
    }
    // Self collision
    if (snake.some(s => s.x === head.x && s.y === head.y)) {
      snakeAlive = false;
      sfx.back();
      return;
    }

    snake.unshift(head);

    // Eat food
    if (snakeFood && head.x === snakeFood.x && head.y === snakeFood.y) {
      snakeScore++;
      sfx.select();
      snakePlaceFood();
      // constant speed — no acceleration
    } else {
      snake.pop();
    }
  }
  let projImgIdx = 0; // which image within a project

  // === BREAKOUT GAME ===
  let brk = { started: false, alive: false, score: 0, lives: 3 };
  let brkPadX = 0, brkBall = {x:0,y:0,dx:0,dy:0}, brkBricks = [];
  const BRK_COLS = 9, BRK_ROWS = 5, BRK_PAD_W = 30, BRK_PAD_H = 4;
  const brkColors = ['#dd3333','#dd8800','#ddcc00','#33aa33','#3388dd'];

  function brkReset() {
    brk.started = true;
    brk.alive = true;
    brk.score = 0;
    brk.lives = 3;
    brkBricks = [];
    for (let r = 0; r < BRK_ROWS; r++) {
      for (let c = 0; c < BRK_COLS; c++) {
        brkBricks.push({ r, c, alive: true });
      }
    }
    brkServeBall();
  }

  function brkServeBall() {
    brkPadX = 0.5;
    brkBall = { x: 0.5, y: 0.8, dx: (Math.random() - 0.5) * 0.02, dy: -0.015 };
  }

  function brkTick() {
    if (!brk.alive) return;
    const b = brkBall;
    b.x += b.dx;
    b.y += b.dy;

    // Wall bounces
    if (b.x <= 0 || b.x >= 1) b.dx = -b.dx;
    if (b.y <= 0) b.dy = -b.dy;

    // Bottom — lose life
    if (b.y >= 1) {
      brk.lives--;
      if (brk.lives <= 0) {
        brk.alive = false;
        sfx.back();
      } else {
        brkServeBall();
      }
      return;
    }

    // Paddle bounce
    const padL = brkPadX - 0.1, padR = brkPadX + 0.1;
    if (b.y >= 0.88 && b.y <= 0.92 && b.x >= padL && b.x <= padR) {
      b.dy = -Math.abs(b.dy);
      // Angle based on where ball hits paddle
      b.dx = (b.x - brkPadX) * 0.04;
      sfx.navigate();
    }

    // Brick collision
    const brkH = 0.35; // brick area height (top 35%)
    const brickW = 1 / BRK_COLS;
    const brickH = brkH / BRK_ROWS;
    for (const brick of brkBricks) {
      if (!brick.alive) continue;
      const bl = brick.c * brickW;
      const bt = brick.r * brickH + 0.02;
      if (b.x >= bl && b.x <= bl + brickW && b.y >= bt && b.y <= bt + brickH) {
        brick.alive = false;
        b.dy = -b.dy;
        brk.score++;
        sfx.select();
        // Speed up slightly
        b.dy *= 1.02;
        break;
      }
    }

    // Win check
    if (brkBricks.every(b => !b.alive)) {
      brk.alive = false;
    }
  }

  // ========== FROGGER GAME ==========
  const FROG_COLS = 11, FROG_ROWS = 11;
  let frog = { started: false, alive: false, score: 0, lives: 3, best: 0 };
  let frogX = 5, frogY = 10; // grid position (bottom = 10, top = 0)
  let frogLanes = []; // each lane: { type, items: [{x, w}], speed, dir }

  function frogReset() {
    frog = { started: true, alive: true, score: 0, lives: 3, best: 0 };
    frogX = 5; frogY = 10;
    frogLanes = [];
    // Row 0: safe zone (goal)
    // Rows 1-4: water with logs
    // Row 5: safe median
    // Rows 6-9: road with cars
    // Row 10: start (safe)
    for (let r = 0; r < FROG_ROWS; r++) {
      if (r === 0 || r === 5 || r === 10) {
        frogLanes.push({ type: 'safe', items: [], speed: 0, dir: 1 });
      } else if (r >= 1 && r <= 4) {
        // Water lanes with logs
        const dir = r % 2 === 0 ? 1 : -1;
        const speed = 0.3 + r * 0.08;
        const logW = 2 + (r % 2);
        const items = [];
        for (let i = 0; i < 3; i++) {
          items.push({ x: i * (FROG_COLS / 3) + (r * 1.5) % 3, w: logW });
        }
        frogLanes.push({ type: 'water', items, speed, dir });
      } else {
        // Road lanes with cars
        const dir = r % 2 === 0 ? 1 : -1;
        const speed = 0.4 + (r - 5) * 0.1;
        const carW = 1.5;
        const items = [];
        for (let i = 0; i < 3; i++) {
          items.push({ x: i * (FROG_COLS / 3) + (r * 2) % 4, w: carW });
        }
        frogLanes.push({ type: 'road', items, speed, dir });
      }
    }
  }

  function frogTick(dt) {
    if (!frog.alive || !frog.started) return;
    // Move lane items
    for (const lane of frogLanes) {
      for (const item of lane.items) {
        item.x += lane.speed * lane.dir * dt;
        // Wrap around
        if (item.x > FROG_COLS + 2) item.x = -item.w;
        if (item.x + item.w < -2) item.x = FROG_COLS;
      }
    }
    // Check collision
    const lane = frogLanes[frogY];
    if (lane.type === 'road') {
      for (const car of lane.items) {
        if (frogX >= car.x - 0.3 && frogX <= car.x + car.w + 0.3) {
          frogDie(); return;
        }
      }
    } else if (lane.type === 'water') {
      let onLog = false;
      for (const log of lane.items) {
        if (frogX >= log.x - 0.3 && frogX <= log.x + log.w - 0.7) {
          onLog = true;
          frogX += lane.speed * lane.dir * dt; // ride the log
          break;
        }
      }
      if (!onLog) { frogDie(); return; }
      // Fell off screen
      if (frogX < -1 || frogX > FROG_COLS + 1) { frogDie(); return; }
    }
    // Reached top
    if (frogY === 0) {
      frog.score += 10;
      frog.best = Math.max(frog.best, frog.score);
      sfx.select();
      frogX = 5; frogY = 10;
    }
  }

  function frogDie() {
    frog.lives--;
    sfx.back();
    if (frog.lives <= 0) {
      frog.alive = false;
    } else {
      frogX = 5; frogY = 10;
    }
  }

  function drawScreen() {
    const ctx = sCtx, w = SCR_W, h = SCR_H;
    ctx.save();
    ctx.translate(0, h);
    ctx.scale(1, -1);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;

    // LCD transition is drawn as overlay after content — skip early return

    // Black bezel border (large margin so content stays inside glass window)
    const bzV = 50;
    const bzH = 45;
    const bzBottom = 60;
    const shiftUp = 15;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, bzV - shiftUp);
    ctx.fillRect(0, h - bzBottom - shiftUp, w, bzBottom + shiftUp);
    ctx.fillRect(0, 0, bzH, h);
    ctx.fillRect(w - bzH, 0, bzH, h);

    // Content area inside bezel (shifted up, shorter)
    const cx = bzH, cy = bzV - shiftUp, cw = w - bzH * 2, ch = h - bzV - bzBottom - shiftUp;
    ctx.fillStyle = C.bg;
    ctx.fillRect(cx, cy, cw, ch);

    // Derive spacing from content height
    const headerH = 20;
    const hintH = 14;
    const menuItemH = Math.floor((ch - headerH - hintH - 10) / currentMenuItems.length);
    const detailLineH = Math.floor((ch - headerH - hintH - 10) / 6);
    const detailVisible = Math.min(6, Math.floor((ch - headerH - hintH - 10) / detailLineH));
    detailVisibleCount = detailVisible;

    if (screen === 'insert') {
      ctx.fillStyle = C.dark;
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO CARTRIDGE', cx + cw / 2, cy + ch / 2 - 24);
      ctx.fillStyle = C.ink;
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText('INSERT CART', cx + cw / 2, cy + ch / 2 - 6);
      ctx.fillText('TO PLAY', cx + cw / 2, cy + ch / 2 + 10);

      // Blinking select option
      const blinkon = Math.floor(Date.now() / 500) % 2 === 0;
      if (blinkon) {
        ctx.fillStyle = C.ink;
        ctx.fillRect(cx + 20, cy + ch / 2 + 22, cw - 40, 20);
      }
      ctx.fillStyle = blinkon ? C.bg : C.ink;
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText('INSERT CARTRIDGE', cx + cw / 2 + 6, cy + ch / 2 + 36);
      ctx.fillText('\u25B6', cx + cw / 2 - 62, cy + ch / 2 + 35);

      ctx.fillStyle = C.dark;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('A = INSERT', cx + cw / 2, cy + ch + 8);
      ctx.textAlign = 'left';
    } else if (screen === 'boot') {
      ctx.textAlign = 'center';
      const elapsed = bootTimer * 1000;
      const midX = cx + cw / 2;
      const midY = cy + ch / 2;
      const rc = ['#dd3333','#dd8800','#ddcc00','#33aa33','#3388dd','#6633cc','#dd3388','#dd5500','#3399aa'];
      function drawRainbow(text, x, y, font) {
        ctx.font = font;
        const tw = ctx.measureText(text).width;
        let rx = x - tw / 2;
        ctx.textAlign = 'left';
        for (let i = 0; i < text.length; i++) {
          ctx.fillStyle = rc[i % rc.length];
          ctx.fillText(text[i], rx, y);
          rx += ctx.measureText(text[i]).width;
        }
        ctx.textAlign = 'center';
      }

      // === SNAKE BOOT ===
      // Scary pit-viper head emerges from the dark, eyes first, then strikes
      // at the camera showing fangs + forked tongue, then retracts for title.
      if (activeCart === 'snake') {
        ctx.fillStyle = '#000';
        ctx.fillRect(cx, cy, cw, ch + 30);
        const snakeGreen = '#33dd33';

        // Helper: draw a menacing pixel-art viper head at (hx,hy) with unit px
        const drawViper = (hx, hy, px, mouthOpen, eyePulse) => {
          // Head silhouette — trapezoid widest at top narrowing to snout
          // Build in rows of pixels for a chunky retro look
          const rows = [
            // [w-in-px-units, shade]  ; shade: 1=dark outline, 2=mid body, 3=light scales
            { w: 14, sh: 1, off: 0 },     // row 0 - top outline
            { w: 18, sh: 2, off: 0 },     // row 1
            { w: 20, sh: 2, off: 0 },     // row 2
            { w: 20, sh: 3, off: 0 },     // row 3 (scales)
            { w: 18, sh: 2, off: 0 },     // row 4 - eye row will overlay
            { w: 18, sh: 2, off: 0 },     // row 5
            { w: 16, sh: 2, off: 0 },     // row 6
            { w: 14, sh: 3, off: 0 },     // row 7 (belly)
            { w: 10, sh: 2, off: 0 },     // row 8
            { w: 8,  sh: 1, off: 0 },     // row 9 - snout
          ];
          const shades = { 1: '#063a06', 2: '#0f6f0f', 3: '#22a622' };
          for (let r = 0; r < rows.length; r++) {
            const { w, sh } = rows[r];
            ctx.fillStyle = shades[sh];
            ctx.fillRect(hx - (w * px) / 2, hy - 6 * px + r * px, w * px, px);
          }
          // Hood spikes (rising from top corners) — makes it look alert/menacing
          ctx.fillStyle = shades[1];
          ctx.fillRect(hx - 9 * px, hy - 9 * px, px, 3 * px);
          ctx.fillRect(hx + 8 * px, hy - 9 * px, px, 3 * px);
          ctx.fillRect(hx - 5 * px, hy - 10 * px, px, 4 * px);
          ctx.fillRect(hx + 4 * px, hy - 10 * px, px, 4 * px);

          // Eye sockets (dark pits)
          ctx.fillStyle = '#000';
          ctx.fillRect(hx - 7 * px, hy - 3 * px, 4 * px, 2 * px);
          ctx.fillRect(hx + 3 * px, hy - 3 * px, 4 * px, 2 * px);
          // Eyes — glowing red slits with yellow core (pulse strength variable)
          const g = Math.floor(40 - eyePulse * 30);
          ctx.fillStyle = `rgb(255,${g},${g})`;
          ctx.fillRect(hx - 7 * px, hy - 2 * px, 4 * px, px);
          ctx.fillRect(hx + 3 * px, hy - 2 * px, 4 * px, px);
          ctx.fillStyle = '#ffe04a';
          ctx.fillRect(hx - 6 * px, hy - 2 * px, px, px);
          ctx.fillRect(hx + 5 * px, hy - 2 * px, px, px);
          // Nostril slits
          ctx.fillStyle = '#022002';
          ctx.fillRect(hx - 2 * px, hy + 2 * px, px, px);
          ctx.fillRect(hx + 1 * px, hy + 2 * px, px, px);

          // Mouth + fangs
          if (mouthOpen) {
            // Gaping maw
            ctx.fillStyle = '#000';
            ctx.fillRect(hx - 5 * px, hy + 3 * px, 10 * px, 5 * px);
            ctx.fillStyle = '#4a0808';
            ctx.fillRect(hx - 4 * px, hy + 4 * px, 8 * px, 3 * px);
            // Fangs — white with shadow
            ctx.fillStyle = '#f5f5d5';
            ctx.fillRect(hx - 4 * px, hy + 3 * px, px, 4 * px);
            ctx.fillRect(hx + 3 * px, hy + 3 * px, px, 4 * px);
            // Fang tips
            ctx.fillRect(hx - 4 * px, hy + 7 * px, px, px);
            ctx.fillRect(hx + 3 * px, hy + 7 * px, px, px);
          }

          // Forked tongue flicking in and out
          const flickPhase = (performance.now() % 600) / 600;
          const flickLen = mouthOpen ? 6 : (flickPhase < 0.5 ? 3 + flickPhase * 4 : 0);
          if (flickLen > 0) {
            ctx.fillStyle = '#ff3355';
            ctx.fillRect(hx - 0.5 * px, hy + 4 * px, px, flickLen * px);
            // Fork
            ctx.fillRect(hx - 2.5 * px, hy + (4 + flickLen) * px, px, 2 * px);
            ctx.fillRect(hx + 1.5 * px, hy + (4 + flickLen) * px, px, 2 * px);
          }
        };

        // Always show faint scanline grid
        ctx.strokeStyle = 'rgba(51,221,51,0.08)';
        ctx.lineWidth = 1;
        for (let gy = cy; gy < cy + ch; gy += 4) { ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx + cw, gy); ctx.stroke(); }

        if (elapsed < 700) {
          // Phase 1: darkness, two distant red pinpoints fade in (eyes approaching)
          const t = elapsed / 700;
          const a = Math.max(0, (t - 0.25) / 0.75);
          ctx.fillStyle = `rgba(255,30,30,${a})`;
          ctx.fillRect(midX - 10, midY - 2, 3, 2);
          ctx.fillRect(midX + 7, midY - 2, 3, 2);
        } else if (elapsed < 2000) {
          // Phase 2: head materializes and grows — scale 0.4 → 1.1
          const t = (elapsed - 700) / 1300;
          const scale = 0.4 + t * 0.7;
          ctx.globalAlpha = Math.min(1, t * 2.5);
          drawViper(midX, midY + 8, scale * 3, false, Math.sin(elapsed * 0.012) * 0.5 + 0.5);
          ctx.globalAlpha = 1;
        } else if (elapsed < 2900) {
          // Phase 3: STRIKE — head lunges forward, mouth opens wide, red flash
          const t = (elapsed - 2000) / 900;
          const scale = 1.1 + Math.sin(t * Math.PI) * 1.1; // push forward, pull back
          // Flash frame on strike impact
          if (t > 0.2 && t < 0.35) {
            ctx.fillStyle = 'rgba(180,30,30,0.35)';
            ctx.fillRect(cx, cy, cw, ch);
          }
          drawViper(midX, midY + 8, scale * 3, t > 0.15, 1);
        } else if (elapsed < 3600) {
          // Phase 4: retract + SNAKE title slashes in
          const t = (elapsed - 2900) / 700;
          const scale = 1.2 - t * 0.4;
          ctx.globalAlpha = 1 - t * 0.4;
          drawViper(midX, midY - 8, scale * 3, false, 0.8);
          ctx.globalAlpha = 1;
          ctx.fillStyle = snakeGreen;
          ctx.font = 'bold 20px "Press Start 2P", monospace';
          ctx.globalAlpha = Math.min(1, t * 2);
          const slashOff = (1 - Math.min(1, t * 2)) * 80;
          ctx.fillText('SNAKE', midX + slashOff, cy + ch - 30);
          ctx.globalAlpha = 1;
        } else {
          // Phase 5: hold — small head silhouette + title + blinking prompt
          drawViper(midX, midY - 18, 2, false, Math.sin(elapsed * 0.01) * 0.5 + 0.5);
          ctx.fillStyle = snakeGreen;
          ctx.font = 'bold 20px "Press Start 2P", monospace';
          ctx.fillText('SNAKE', midX, cy + ch - 30);
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#88ff88';
          if (Math.floor(elapsed / 400) % 2) ctx.fillText('PRESS A TO START', midX, cy + ch - 12);
        }
      }
      // === BREAKOUT BOOT ===
      else if (activeCart === 'breakout') {
        ctx.fillStyle = '#111';
        ctx.fillRect(cx, cy, cw, ch + 30);
        const brkColors = ['#ff4444','#ff8800','#ffcc00','#44dd44','#4488ff'];

        if (elapsed < 1200) {
          // Phase 1: Bricks build in row by row
          const t = elapsed / 1200;
          const rows = 5, cols = 9;
          const bw = (cw - 20) / cols, bh = 8;
          const startY = cy + 20;
          for (let r = 0; r < rows; r++) {
            const rowT = Math.max(0, Math.min(1, t * rows - r));
            if (rowT <= 0) continue;
            for (let c = 0; c < cols; c++) {
              const colT = Math.max(0, Math.min(1, rowT * cols - c * 0.3));
              ctx.globalAlpha = colT;
              ctx.fillStyle = brkColors[r % brkColors.length];
              ctx.fillRect(cx + 10 + c * bw + 1, startY + r * (bh + 2), bw - 2, bh);
            }
          }
          ctx.globalAlpha = 1;
        } else if (elapsed < 2800) {
          // Phase 2: Ball bouncing, breaking bricks
          const rows = 5, cols = 9;
          const bw = (cw - 20) / cols, bh = 8;
          const startY = cy + 20;
          const bt = (elapsed - 1200) / 1600;
          const broken = Math.floor(bt * 8);

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (r === 0 && c < broken) continue;
              ctx.fillStyle = brkColors[r % brkColors.length];
              ctx.fillRect(cx + 10 + c * bw + 1, startY + r * (bh + 2), bw - 2, bh);
            }
          }
          // Ball
          const ballX = cx + 20 + (bt * cw * 3) % cw;
          const ballY = cy + ch * 0.4 + Math.abs(Math.sin(bt * 12)) * (ch * 0.4);
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(ballX, ballY, 3, 0, Math.PI * 2);
          ctx.fill();
          // Paddle
          ctx.fillStyle = '#fff';
          ctx.fillRect(midX - 15, cy + ch - 12, 30, 4);
        } else if (elapsed < 3600) {
          // Phase 3: Title
          const t = (elapsed - 2800) / 800;
          ctx.globalAlpha = Math.min(1, t * 2);
          ctx.fillStyle = '#ff8800';
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillText('BREAKOUT', midX, midY - 8);
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#ffcc00';
          ctx.fillText('PRESS A TO START', midX, midY + 20);
          ctx.globalAlpha = 1;
        } else {
          // Phase 4: Hold + blink
          ctx.fillStyle = '#ff8800';
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillText('BREAKOUT', midX, midY - 8);
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#ffcc00';
          if (Math.floor(elapsed / 400) % 2) ctx.fillText('PRESS A TO START', midX, midY + 20);
          const dots = Math.floor((elapsed - 3600) / 200) % 4;
          ctx.fillStyle = '#ff8800';
          ctx.fillText('.'.repeat(dots), midX, midY + 40);
        }
      }
      // === FROGGER BOOT ===
      else if (activeCart === 'frogger') {
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx, cy, cw, ch + 30);

        if (elapsed < 1000) {
          // Phase 1: Water ripples appear
          const t = elapsed / 1000;
          ctx.strokeStyle = `rgba(68,136,255,${t * 0.3})`;
          ctx.lineWidth = 1;
          for (let y = cy + 10; y < cy + ch / 2; y += 12) {
            const wave = Math.sin(y * 0.1 + elapsed * 0.003) * 8;
            ctx.beginPath(); ctx.moveTo(cx, y);
            for (let x = cx; x < cx + cw; x += 4) { ctx.lineTo(x, y + Math.sin(x * 0.05 + wave) * 3); }
            ctx.stroke();
          }
          // Road lines at bottom
          ctx.fillStyle = `rgba(100,100,100,${t * 0.4})`;
          for (let y = cy + ch * 0.55; y < cy + ch; y += 14) {
            ctx.fillRect(cx, y, cw, 1);
          }
        } else if (elapsed < 2400) {
          // Phase 2: Frog hops across
          const t = (elapsed - 1000) / 1400;
          // Background
          ctx.fillStyle = '#224488'; ctx.fillRect(cx, cy, cw, ch / 2);
          ctx.fillStyle = '#333'; ctx.fillRect(cx, cy + ch / 2, cw, ch / 2);
          // Frog hopping
          const hopCount = Math.floor(t * 5);
          const hopProgress = (t * 5) % 1;
          const frogBX = midX;
          const frogBY = cy + ch - 20 - hopCount * (ch / 6);
          const jumpH = Math.sin(hopProgress * Math.PI) * 12;
          ctx.fillStyle = '#33dd33';
          ctx.fillRect(frogBX - 5, frogBY - jumpH - 5, 10, 10);
          // Eyes
          ctx.fillStyle = '#fff';
          ctx.fillRect(frogBX - 4, frogBY - jumpH - 7, 3, 3);
          ctx.fillRect(frogBX + 1, frogBY - jumpH - 7, 3, 3);
        } else if (elapsed < 3200) {
          // Phase 3: Title
          const t = (elapsed - 2400) / 800;
          ctx.globalAlpha = Math.min(1, t * 2);
          ctx.fillStyle = '#33dd33';
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillText('FROGGER', midX, midY - 8);
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#88ff88';
          ctx.fillText('PRESS A TO PLAY', midX, midY + 20);
          ctx.globalAlpha = 1;
        } else {
          ctx.fillStyle = '#33dd33';
          ctx.font = 'bold 16px "Press Start 2P", monospace';
          ctx.fillText('FROGGER', midX, midY - 8);
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#88ff88';
          if (Math.floor(elapsed / 400) % 2) ctx.fillText('PRESS A TO PLAY', midX, midY + 20);
        }
      }
      // === PORTFOLIO BOOT ===
      // CRT-style scan reveal: Luka's photo fills the screen, building from
      // top to bottom with a glowing scanline. Ahead of the scan is a chunky
      // pixelated preview that sharpens as the scanline passes over it.
      // Helper: overlay RGB subpixel stripes to emulate an old TFT matrix.
      else {
        const drawTftRgbOverlay = (tctx, dx, dy, dw, dh) => {
          tctx.save();
          tctx.globalCompositeOperation = 'multiply';
          // Per-column R / G / B tint, 1px stripes looping every 3 cols
          for (let x = dx; x < dx + dw; x++) {
            const col = (x - dx) % 3;
            tctx.fillStyle = col === 0 ? '#ffb2b2' : col === 1 ? '#b2ffb2' : '#b2b2ff';
            tctx.fillRect(x, dy, 1, dh);
          }
          tctx.globalCompositeOperation = 'source-over';
          // Slight dark seam between "subpixel triplets" every 3 cols for extra texture
          tctx.fillStyle = 'rgba(0,0,0,0.12)';
          for (let x = dx; x < dx + dw; x += 3) tctx.fillRect(x, dy, 1, dh);
          tctx.restore();
        };
        // Full boot area = content + hint strip below, so there's no light/dark
        // seam between them during the CRT animation.
        const bootH = ch + 30;
        ctx.fillStyle = '#000';
        ctx.fillRect(cx, cy, cw, bootH);

        const img = aboutPhotos.photo;

        // Helper — draw image with object-fit:cover into a rect
        const drawPhotoCover = (targetCtx, targetCanvasOrImg, dx, dy, dw, dh) => {
          const src = targetCanvasOrImg;
          const iw = src.naturalWidth || src.width;
          const ih = src.naturalHeight || src.height;
          if (!iw || !ih) return;
          const ir = iw / ih, dr = dw / dh;
          let sx = 0, sy = 0, sw = iw, sh = ih;
          if (ir > dr) { sw = ih * dr; sx = (iw - sw) / 2; }
          else { sh = iw / dr; sy = (ih - sh) / 2; }
          targetCtx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
        };

        // Cache a chunky low-res version of the photo (built once) so the
        // pre-scan preview zone can be pixelated without re-downsampling.
        if (img && img.complete && !gb.userData._portBootCache) {
          const chunky = document.createElement('canvas');
          chunky.width = Math.max(12, Math.floor(cw / 6));
          chunky.height = Math.max(12, Math.floor(ch / 6));
          const chCtx = chunky.getContext('2d');
          drawPhotoCover(chCtx, img, 0, 0, chunky.width, chunky.height);
          const mid = document.createElement('canvas');
          mid.width = Math.max(18, Math.floor(cw / 3));
          mid.height = Math.max(18, Math.floor(ch / 3));
          const mCtx = mid.getContext('2d');
          drawPhotoCover(mCtx, img, 0, 0, mid.width, mid.height);
          // Pixel-art cache — low-res photo quantized to the GameBoy 4-tone
          // palette. Used for the final boot image so it reads as 8-bit art.
          const pixel = document.createElement('canvas');
          pixel.width = Math.max(40, Math.floor(cw * 0.28));
          pixel.height = Math.max(40, Math.floor(ch * 0.28));
          const pCtx = pixel.getContext('2d');
          drawPhotoCover(pCtx, img, 0, 0, pixel.width, pixel.height);
          const hexToRgb = (hex) => {
            const h = hex.replace('#', '');
            return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
          };
          const pal = [hexToRgb(C.ink), hexToRgb(C.dark), hexToRgb(C.light), hexToRgb(C.bg)];
          const pd = pCtx.getImageData(0, 0, pixel.width, pixel.height);
          for (let i = 0; i < pd.data.length; i += 4) {
            const lum = (pd.data[i] * 0.299 + pd.data[i + 1] * 0.587 + pd.data[i + 2] * 0.114) / 255;
            // Bayer-ish threshold for dithering to avoid flat posterization
            const x = (i / 4) % pixel.width, y = Math.floor((i / 4) / pixel.width);
            const jitter = ((x ^ y) & 1) * 0.06 - 0.03;
            const idx = Math.max(0, Math.min(3, Math.floor((lum + jitter) * 4)));
            pd.data[i] = pal[idx][0];
            pd.data[i + 1] = pal[idx][1];
            pd.data[i + 2] = pal[idx][2];
          }
          pCtx.putImageData(pd, 0, 0);
          gb.userData._portBootCache = { chunky, mid, pixel };
        }
        const cache = gb.userData._portBootCache;

        // Phase 1 — CRT power-on (0-450ms): horizontal beam expands vertically
        if (elapsed < 450) {
          const t = elapsed / 450;
          const bandH = Math.max(2, t * bootH);
          ctx.fillStyle = 'rgba(230,240,255,0.85)';
          ctx.fillRect(cx, cy + bootH / 2 - bandH / 2, cw, bandH);
          // Bright horizontal core
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx, cy + bootH / 2 - 1, cw, 2);
        }
        // Phase 2 — scan reveal (450-3000ms): row-by-row build with glowing scanline
        else if (elapsed < 3000) {
          const t = (elapsed - 450) / 2550;
          const scanY = cy + t * bootH;

          ctx.imageSmoothingEnabled = false;

          // Crisp zone (already scanned) — pixel-art version so the reveal
          // and final resting frame match instead of jumping resolution.
          const crispBottom = scanY - 4;
          if (crispBottom > cy) {
            const crispSrc = (cache && cache.pixel) ? cache.pixel : img;
            if (crispSrc && (crispSrc.complete !== false)) {
              ctx.save();
              ctx.beginPath();
              ctx.rect(cx, cy, cw, crispBottom - cy);
              ctx.clip();
              drawPhotoCover(ctx, crispSrc, cx, cy, cw, bootH);
              ctx.restore();
            }
          }

          // Mid-quality zone — just beneath crisp, a bit blocky
          if (cache) {
            const midTop = Math.max(cy, scanY - 4);
            const midBottom = Math.min(cy + bootH, scanY + 8);
            if (midBottom > midTop) {
              ctx.save();
              ctx.beginPath();
              ctx.rect(cx, midTop, cw, midBottom - midTop);
              ctx.clip();
              drawPhotoCover(ctx, cache.pixel || cache.mid, cx, cy, cw, bootH);
              ctx.restore();
            }
          }

          // Chunky preview zone — below the scanline, strongly pixelated + noise
          if (cache) {
            const chunkyTop = Math.min(cy + bootH, scanY + 8);
            const chunkyBottom = Math.min(cy + bootH, scanY + 40);
            if (chunkyBottom > chunkyTop) {
              ctx.save();
              ctx.beginPath();
              ctx.rect(cx, chunkyTop, cw, chunkyBottom - chunkyTop);
              ctx.clip();
              ctx.globalAlpha = 0.8;
              drawPhotoCover(ctx, cache.pixel || cache.chunky, cx, cy, cw, bootH);
              // Digital static / dither
              for (let n = 0; n < 60; n++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`;
                const nx = cx + Math.floor(Math.random() * (cw / 4)) * 4;
                const ny = chunkyTop + Math.floor(Math.random() * ((chunkyBottom - chunkyTop) / 3)) * 3;
                ctx.fillRect(nx, ny, 3, 3);
              }
              ctx.globalAlpha = 1;
              ctx.restore();
            }
          }

          // TFT subpixel overlay on the whole painted region (above + chunky
          // zone ahead of the scan) — so the effect appears as the image
          // builds, not only after it's fully drawn.
          const tftBottom = Math.min(cy + bootH, scanY + 40);
          if (tftBottom > cy) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(cx, cy, cw, tftBottom - cy);
            ctx.clip();
            drawTftRgbOverlay(ctx, cx, cy, cw, bootH);
            ctx.restore();
          }

          // Horizontal scanline glow (thick + fading edges)
          ctx.fillStyle = 'rgba(255,255,255,1)';
          ctx.fillRect(cx, scanY - 1, cw, 2);
          ctx.fillStyle = 'rgba(180,220,255,0.55)';
          ctx.fillRect(cx, scanY - 4, cw, 3);
          ctx.fillRect(cx, scanY + 2, cw, 3);
          ctx.fillStyle = 'rgba(120,180,255,0.25)';
          ctx.fillRect(cx, scanY - 9, cw, 5);
          ctx.fillRect(cx, scanY + 5, cw, 7);

          // Progress indicator
          ctx.fillStyle = 'rgba(200,220,255,0.9)';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText(Math.floor(t * 100) + '%', midX, cy + bootH - 6);
        }
        // Phase 3 — image fully resolved with CRT scanline overlay (3000-3400ms)
        else if (elapsed < 3400) {
          ctx.imageSmoothingEnabled = false;
          if (cache && cache.pixel) drawPhotoCover(ctx, cache.pixel, cx, cy, cw, bootH);
          else if (img && img.complete) drawPhotoCover(ctx, img, cx, cy, cw, bootH);
          drawTftRgbOverlay(ctx, cx, cy, cw, bootH);

          // CRT scanline pattern
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          for (let ly = cy; ly < cy + bootH; ly += 3) ctx.fillRect(cx, ly, cw, 1);

          // Occasional flicker
          if (Math.random() < 0.08) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12})`;
            ctx.fillRect(cx, cy, cw, bootH);
          }
        }
        // Phase 4 — title + loading bar overlay (3400-4600ms)
        else {
          ctx.imageSmoothingEnabled = false;
          if (cache && cache.pixel) drawPhotoCover(ctx, cache.pixel, cx, cy, cw, bootH);
          else if (img && img.complete) drawPhotoCover(ctx, img, cx, cy, cw, bootH);
          drawTftRgbOverlay(ctx, cx, cy, cw, bootH);

          // Scanline overlay
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          for (let ly = cy; ly < cy + bootH; ly += 3) ctx.fillRect(cx, ly, cw, 1);

          const fade = Math.min(1, (elapsed - 3400) / 500);
          // Full-screen fade to black so the loading screen reads as its own UI
          ctx.fillStyle = `rgba(0,0,0,${0.88 * fade})`;
          ctx.fillRect(cx, cy, cw, bootH);

          // Title
          ctx.globalAlpha = fade;
          drawRainbow(activeCart ? cartridges[activeCart].label : 'PORTFOLIO', midX, cy + ch * 0.62, 'bold 14px "Press Start 2P", monospace');
          ctx.globalAlpha = 1;

          // Loading bar — keep inside content area so it isn't clipped by the
          // bezel at the very bottom of the boot canvas.
          const barW = cw * 0.55;
          const barH = 5;
          const barX = midX - barW / 2;
          const barY = cy + ch - 22;
          ctx.strokeStyle = 'rgba(255,255,255,0.65)';
          ctx.lineWidth = 1;
          ctx.strokeRect(barX, barY, barW, barH);
          const loadT = Math.min(1, (elapsed - 3400) / 1200);
          const blocks = Math.floor(loadT * 14);
          const blockW = barW / 14;
          ctx.fillStyle = 'rgba(255,255,255,0.95)';
          for (let b = 0; b < blocks; b++) {
            ctx.fillRect(barX + b * blockW + 1, barY + 1, blockW - 2, barH - 2);
          }
          ctx.fillStyle = 'rgba(255,255,255,0.75)';
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText('LOADING...', midX, barY + 20);
        }
      } // end portfolio boot
      ctx.textAlign = 'left';
    } else if (screen === 'menu') {
      ctx.textAlign = 'left';
      ctx.fillStyle = C.ink;
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText(currentHeader, cx + 30, cy + 14);
      ctx.fillStyle = C.dark;
      ctx.fillRect(cx + 6, cy + headerH, cw - 12, 1);
      ctx.font = '9px "Press Start 2P", monospace';
      const rowH = 18;
      const menuTop = cy + headerH + 6;
      const menuVisible = Math.floor((ch - headerH - 10) / rowH);
      // Auto-scroll menu if cursor is past visible area
      if (!gb.userData.menuScroll) gb.userData.menuScroll = 0;
      if (cursor < gb.userData.menuScroll) gb.userData.menuScroll = cursor;
      if (cursor >= gb.userData.menuScroll + menuVisible) gb.userData.menuScroll = cursor - menuVisible + 1;
      const mScroll = gb.userData.menuScroll;
      for (let i = 0; i < menuVisible && (mScroll + i) < currentMenuItems.length; i++) {
        const idx = mScroll + i;
        const y = menuTop + i * rowH;
        const midY = y + rowH / 2 + 2;
        ctx.textBaseline = 'middle';
        if (idx === cursor) {
          ctx.fillStyle = C.ink;
          ctx.fillRect(cx + 6, y + 1, cw - 12, rowH - 2);
          ctx.fillStyle = C.bg;
          ctx.fillText('\u25B6', cx + 8, midY);
          ctx.fillText(currentMenuItems[idx], cx + 22, midY);
        } else {
          ctx.fillStyle = C.ink;
          ctx.fillText(currentMenuItems[idx], cx + 22, midY);
        }
        ctx.textBaseline = 'alphabetic';
      }
      // Scroll indicators
      if (currentMenuItems.length > menuVisible) {
        ctx.fillStyle = C.dark;
        ctx.font = '12px "Press Start 2P", monospace';
        if (mScroll > 0) ctx.fillText('\u25B2', cx + cw - 16, menuTop + 8);
        if (mScroll + menuVisible < currentMenuItems.length) ctx.fillText('\u25BC', cx + cw - 16, menuTop + menuVisible * rowH);
      }
      ctx.fillStyle = C.dark;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('A=SELECT  \u25B2\u25BC=MOVE', cx + 20, cy + ch + 8);
    } else if (screen === 'detail') {
      ctx.textAlign = 'left';
      const item = currentMenuItems[cursor];

      if (trophyScreen && item === 'TROPHIES') {
        // Achievement unlock screen
        const award = details['TROPHIES'][detailCursor] || '';
        const [awardName, awardYear] = award.split('|');

        // Header
        ctx.fillStyle = C.ink;
        ctx.fillRect(cx + 6, cy + 2, cw - 12, headerH - 2);
        ctx.fillStyle = C.bg;
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText('\u25C0 UNLOCKED!', cx + 8, cy + 14);
        ctx.fillStyle = C.dark;
        ctx.fillRect(cx + 6, cy + headerH, cw - 12, 1);

        // Trophy icon (pixel art)
        const tX = cx + cw / 2;
        const tY = cy + headerH + 20;
        ctx.fillStyle = '#ddaa00';
        // Cup body
        ctx.fillRect(tX - 14, tY, 28, 20);
        // Cup rim
        ctx.fillRect(tX - 16, tY - 2, 32, 4);
        // Handles
        ctx.fillRect(tX - 20, tY + 2, 6, 12);
        ctx.fillRect(tX + 14, tY + 2, 6, 12);
        // Handle curves
        ctx.fillRect(tX - 20, tY + 14, 8, 3);
        ctx.fillRect(tX + 12, tY + 14, 8, 3);
        // Cup taper
        ctx.fillStyle = '#cc9900';
        ctx.fillRect(tX - 10, tY + 18, 20, 4);
        ctx.fillRect(tX - 6, tY + 22, 12, 3);
        // Stem
        ctx.fillStyle = '#ddaa00';
        ctx.fillRect(tX - 3, tY + 25, 6, 8);
        // Base
        ctx.fillRect(tX - 10, tY + 33, 20, 4);
        ctx.fillRect(tX - 12, tY + 37, 24, 3);
        // Star on cup
        ctx.fillStyle = '#fff';
        ctx.fillRect(tX - 2, tY + 5, 4, 4);
        ctx.fillRect(tX - 4, tY + 7, 8, 2);
        ctx.fillRect(tX - 1, tY + 3, 2, 2);
        ctx.fillRect(tX - 1, tY + 10, 2, 2);

        // Award name
        ctx.fillStyle = C.ink;
        ctx.textAlign = 'center';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText(awardName, tX, tY + 50);
        // Year
        ctx.fillStyle = C.dark;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText(awardYear, tX, tY + 62);
        // Achievement text
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText('ACHIEVEMENT UNLOCKED', tX, tY + 76);
        ctx.textAlign = 'left';

        // Hint
        ctx.fillStyle = C.dark;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('B=BACK  \u25C0\u25B6=BROWSE', cx + 8, cy + ch + 8);

      } else if (projScreen && item === 'QUESTS') {
        // Project detail: name, description, image gallery
        const thumbs = projThumbs[detailCursor] || [];
        const thumb = thumbs[projImgIdx];
        const projName = details['QUESTS'][detailCursor] || '';
        const desc = projDescs[detailCursor] || '';

        // Header
        ctx.fillStyle = C.ink;
        ctx.fillRect(cx + 6, cy + 2, cw - 12, headerH - 2);
        ctx.fillStyle = C.bg;
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText('\u25C0 ' + projName, cx + 8, cy + 14);
        ctx.fillStyle = C.dark;
        ctx.fillRect(cx + 6, cy + headerH, cw - 12, 1);

        // Description text (word-wrapped)
        ctx.fillStyle = C.ink;
        ctx.font = '8px "Press Start 2P", monospace';
        const words = desc.split(' ');
        let line = '', lineY = cy + headerH + 12;
        for (const word of words) {
          const test = line + (line ? ' ' : '') + word;
          if (ctx.measureText(test).width > cw - 20) {
            ctx.fillText(line, cx + 8, lineY);
            line = word;
            lineY += 11;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line, cx + 8, lineY);

        // Image below description
        const imgTop = lineY + 8;
        const imgArea = cy + ch - imgTop - 10;
        if (thumb && thumb.complete && thumb.naturalWidth && imgArea > 20) {
          const imgSize = Math.min(cw - 20, imgArea);
          const ix = cx + (cw - imgSize) / 2;

          ctx.drawImage(thumb, ix, imgTop, imgSize, imgSize);

          // Image counter
          if (thumbs.length > 1) {
            ctx.fillStyle = C.dark;
            ctx.font = '9px "Press Start 2P", monospace';
            ctx.fillText((projImgIdx + 1) + '/' + thumbs.length, ix + imgSize - 18, imgTop + imgSize - 4);
          }
        }

        ctx.fillStyle = C.dark;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('B=BACK  \u25C0\u25B6=IMAGES', cx + 8, cy + ch + 8);
      } else {
        // Normal detail list view
        // Highlight header bar
        ctx.fillStyle = C.ink;
        ctx.fillRect(cx + 6, cy + 2, cw - 12, headerH - 2);
        ctx.fillStyle = C.bg;
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText('\u25C0 ' + item, cx + 8, cy + 14);
        ctx.fillStyle = C.dark;
        ctx.fillRect(cx + 6, cy + headerH, cw - 12, 1);
        const lines = details[item] || [];
        const isStats = item === 'STATS';

        if (isStats) {
          // Pokemon-style stats page — scrollable
          ctx.font = '9px "Press Start 2P", monospace';
          const statH = 28;
          const visibleStats = Math.floor((ch - headerH - 4) / statH);
          detailVisibleCount = visibleStats; // sync for scroll logic
          for (let i = 0; i < visibleStats && (scroll + i) < lines.length; i++) {
            const lineIdx = scroll + i;
            const [name, val] = lines[lineIdx].split('|');
            const stat = parseInt(val) || 0;
            const ly = cy + headerH + 8 + i * statH;
            const barY = ly + 17;
            const barH = 4;
            const barMaxW = cw - 16;

            // Highlight current
            const isSel = lineIdx === detailCursor;
            if (isSel) {
              ctx.fillStyle = C.ink;
              ctx.fillRect(cx + 4, ly, cw - 8, statH - 2);
            }

            // Stat name
            ctx.fillStyle = isSel ? C.bg : C.ink;
            ctx.fillText(name, cx + 12, ly + 11);
            if (isSel) ctx.fillText('\u25B6', cx + 2, ly + 10);

            // Stat number
            ctx.textAlign = 'right';
            ctx.fillText(val, cx + cw - 8, ly + 11);
            ctx.textAlign = 'left';

            // Bar background
            ctx.fillStyle = C.dark;
            ctx.fillRect(cx + 8, barY, barMaxW, barH);

            // Bar fill — vivid color based on stat value
            const pct = stat / 100;
            if (pct > 0.7) ctx.fillStyle = '#22cc44';
            else if (pct > 0.4) ctx.fillStyle = '#ddaa00';
            else ctx.fillStyle = '#dd3322';
            ctx.fillRect(cx + 8, barY, barMaxW * pct, barH);

            // Bar border
            ctx.strokeStyle = C.ink;
            ctx.lineWidth = 1;
            ctx.strokeRect(cx + 8, barY, barMaxW, barH);
          }
          // Scroll indicators
          if (lines.length > visibleStats) {
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillStyle = C.dark;
            if (scroll > 0) ctx.fillText('\u25B2', cx + cw - 14, cy + headerH + 10);
            if (scroll + visibleStats < lines.length) ctx.fillText('\u25BC', cx + cw - 14, cy + ch - 4);
          }
        } else if (item === 'ABOUT ME') {
          // Custom layout with inline images
          ctx.font = '9px "Press Start 2P", monospace';
          const imgH = 6; // image takes 6 line slots
          // Build virtual rows: each line = 1 slot, images = imgH slots
          const slots = [];
          for (let li = 0; li < lines.length; li++) {
            if (lines[li] === '[photo]' || lines[li] === '[bike]') {
              for (let s = 0; s < imgH; s++) slots.push({ type: 'img', key: lines[li] === '[photo]' ? 'photo' : 'bike', line: li, sub: s });
            } else {
              slots.push({ type: 'text', line: li });
            }
          }
          detailVisibleCount = Math.floor((ch - headerH - 20) / detailLineH);
          const visSlots = detailVisibleCount;
          const contentTop = cy + headerH + 8;
          const clipTop = cy + headerH;
          const clipBot = cy + ch - hintH;

          // Set up clip for all content
          ctx.save();
          ctx.beginPath();
          ctx.rect(cx, clipTop, cw, clipBot - clipTop);
          ctx.clip();

          // Draw text lines
          for (let i = 0; i < visSlots && (scroll + i) < slots.length; i++) {
            const slot = slots[scroll + i];
            if (slot.type === 'text') {
              const sy = contentTop + i * detailLineH;
              const ly = sy + detailLineH * 0.7;
              ctx.fillStyle = C.ink;
              ctx.fillText(lines[slot.line], cx + 10, ly);
            }
          }

          // Draw images — compute position from their sub=0 slot absolute index
          const drawn = {};
          for (let i = 0; i < visSlots && (scroll + i) < slots.length; i++) {
            const slot = slots[scroll + i];
            if (slot.type === 'img' && !drawn[slot.key]) {
              drawn[slot.key] = true;
              const photo = aboutPhotos[slot.key];
              if (photo && photo.complete) {
                const totalImgH = imgH * detailLineH - 4;
                const imgW = cw - 24;
                const aspect = photo.width / photo.height;
                let dw = imgW, dh = imgW / aspect;
                if (dh > totalImgH) { dh = totalImgH; dw = dh * aspect; }
                const ix = cx + (cw - dw) / 2;
                // slot at visible index i has sub offset — compute where sub=0 would be
                const imgTopY = contentTop + (i - slot.sub) * detailLineH;
                ctx.drawImage(photo, ix, imgTopY, dw, dh);
                ctx.strokeStyle = C.dark;
                ctx.lineWidth = 1;
                ctx.strokeRect(ix, imgTopY, dw, dh);
              }
            }
          }

          ctx.restore();

          // Scroll indicators
          ctx.font = '12px "Press Start 2P", monospace';
          if (slots.length > visSlots) {
            ctx.fillStyle = C.dark;
            if (scroll > 0) ctx.fillText('\u25B2', cx + cw - 18, cy + headerH + 12);
            if (scroll + visSlots < slots.length) ctx.fillText('\u25BC', cx + cw - 18, cy + ch - hintH - 4);
          }
        } else {
          // Normal list — same layout as menu
          ctx.font = '9px "Press Start 2P", monospace';
          const rowH = 18;
          const listTop = cy + headerH + 6;
          ctx.textBaseline = 'middle';
          for (let i = 0; i < detailVisible && (scroll + i) < lines.length; i++) {
            const lineIdx = scroll + i;
            const y = listTop + i * rowH;
            const midRow = y + rowH / 2 + 2;
            const isSel = lineIdx === detailCursor;
            const lineText = lines[lineIdx];
            if (isSel) {
              ctx.fillStyle = C.ink;
              ctx.fillRect(cx + 6, y + 1, cw - 12, rowH - 2);
              ctx.fillStyle = C.bg;
              ctx.fillText('\u25B6', cx + 8, midRow);
              if (lineText.includes('|')) {
                const [name, year] = lineText.split('|');
                ctx.fillText(name, cx + 22, midRow);
                ctx.textAlign = 'right';
                ctx.fillText(year, cx + cw - 8, midRow);
                ctx.textAlign = 'left';
              } else {
                ctx.fillText(lineText, cx + 22, midRow);
              }
            } else {
              ctx.fillStyle = C.ink;
              if (lineText.includes('|')) {
                const [name, year] = lineText.split('|');
                ctx.fillText(name, cx + 22, midRow);
                ctx.textAlign = 'right';
                ctx.fillText(year, cx + cw - 8, midRow);
                ctx.textAlign = 'left';
              } else {
                ctx.fillText(lineText, cx + 22, midRow);
              }
            }
          }
          ctx.textBaseline = 'alphabetic';
        }
        ctx.font = '12px "Press Start 2P", monospace';
        if (lines.length > detailVisible) {
          ctx.fillStyle = C.dark;
          if (scroll > 0) ctx.fillText('\u25B2', cx + cw - 18, cy + headerH + 12);
          if (scroll + detailVisible < lines.length) ctx.fillText('\u25BC', cx + cw - 18, cy + ch - hintH - 4);
        }
        ctx.fillStyle = C.dark;
        ctx.font = '8px "Press Start 2P", monospace';
        const hint = (item === 'QUESTS' || item === 'TROPHIES') ? 'A=VIEW  B=BACK  \u25B2\u25BC' : (item === 'OPTIONS' ? 'A=OPEN  B=BACK  \u25B2\u25BC' : 'B=BACK  \u25C0\u25B6=PREV/NEXT');
        ctx.fillText(hint, cx + 8, cy + ch + 8);
      }
    } else if (screen === 'optView') {
      // === OPTIONS: individual option screen ===
      const midX = cx + cw / 2;
      const midY = cy + ch / 2;
      ctx.textAlign = 'left';
      // Header bar
      ctx.fillStyle = C.ink;
      ctx.fillRect(cx + 6, cy + 2, cw - 12, headerH - 2);
      ctx.fillStyle = C.bg;
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.fillText('\u25C0 ' + (currentOption || ''), cx + 8, cy + 14);
      ctx.fillStyle = C.dark;
      ctx.fillRect(cx + 6, cy + headerH, cw - 12, 1);

      const bodyX = cx + 10;
      const bodyY = cy + headerH + 14;
      ctx.fillStyle = C.ink;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'left';

      let hint = 'B=BACK';

      if (currentOption === 'PALETTE') {
        const p = palettes[paletteIdx];
        ctx.fillText('THEME:', bodyX, bodyY);
        ctx.fillText(p.id, bodyX + 68, bodyY);
        // Color swatches
        const swY = bodyY + 18;
        const keys = ['bg','light','ink','dark'];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = p[keys[i]];
          ctx.fillRect(bodyX + i * 20, swY, 16, 16);
          ctx.strokeStyle = C.dark;
          ctx.lineWidth = 1;
          ctx.strokeRect(bodyX + i * 20, swY, 16, 16);
        }
        ctx.fillStyle = C.dark;
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText((paletteIdx + 1) + '/' + palettes.length, bodyX, swY + 28);
        hint = '\u25C0\u25B6=SWAP  B=BACK';
      }
      else if (currentOption === 'CONTRAST') {
        ctx.fillText('LEVEL:', bodyX, bodyY);
        ctx.fillText(String(contrastLevel), bodyX + 68, bodyY);
        // Slider
        const sX = bodyX, sY = bodyY + 18, sW = cw - 28, sH = 8;
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(sX, sY, sW, sH);
        ctx.fillStyle = C.ink;
        ctx.fillRect(sX + 1, sY + 1, (sW - 2) * (contrastLevel / 9), sH - 2);
        // Ticks
        ctx.fillStyle = C.dark;
        for (let i = 0; i <= 9; i++) {
          ctx.fillRect(sX + (sW * i / 9) - 0.5, sY + sH + 2, 1, 3);
        }
        hint = '\u25C0\u25B6=ADJUST  B=BACK';
      }
      else if (currentOption === 'SOUND') {
        ctx.fillText('STATUS:', bodyX, bodyY);
        ctx.fillStyle = soundMuted ? '#c03030' : C.ink;
        ctx.fillText(soundMuted ? 'MUTED' : 'ON', bodyX + 78, bodyY);
        // Toggle switch
        const tX = bodyX, tY = bodyY + 20, tW = 40, tH = 14;
        ctx.strokeStyle = C.ink;
        ctx.strokeRect(tX, tY, tW, tH);
        ctx.fillStyle = soundMuted ? C.dark : C.ink;
        ctx.fillRect(tX + (soundMuted ? 2 : tW / 2), tY + 2, tW / 2 - 2, tH - 4);
        hint = 'A=TOGGLE  B=BACK';
      }
      else if (currentOption === 'BATTERY') {
        const mins = (performance.now() - batteryStart) / 60000;
        const pct = Math.max(0, Math.min(100, 100 - mins * 2.5)); // drops ~2.5%/min
        const contentH = 72;
        const contentTop = cy + headerH + (ch - headerH - contentH) / 2;
        // Battery icon — centered horizontally
        const bW = 80, bH = 28;
        const bX = midX - bW / 2 - 2; // shift left a hair for the nub
        const bY = contentTop + 22;
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(bX, bY, bW, bH);
        // Nub
        ctx.fillStyle = C.ink;
        ctx.fillRect(bX + bW, bY + 8, 4, bH - 16);
        // Fill — color by level
        const fillW = (bW - 6) * pct / 100;
        ctx.fillStyle = pct < 15 ? '#c02020' : pct < 40 ? '#c0a020' : '#20a040';
        ctx.fillRect(bX + 3, bY + 3, fillW, bH - 6);

        // Label above — centered
        ctx.textAlign = 'center';
        ctx.fillStyle = C.ink;
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText('CHARGE  ' + Math.round(pct) + '%', midX, contentTop + 12);
        // Warning below when low — centered + blinking
        if (pct < 15 && Math.floor(performance.now() / 500) % 2) {
          ctx.fillStyle = '#c02020';
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.fillText('LOW BATTERY!', midX, contentTop + contentH - 2);
        }
        ctx.textAlign = 'left';
        hint = 'B=BACK';
      }
      else if (currentOption === 'HIGH SCORES') {
        const s = {
          SNAKE:    parseInt(localStorage.getItem('gb_high_snake')    || '0'),
          BREAKOUT: parseInt(localStorage.getItem('gb_high_breakout') || '0'),
          FROGGER:  parseInt(localStorage.getItem('gb_high_frogger')  || '0'),
        };
        const entries = Object.entries(s);
        ctx.font = '9px "Press Start 2P", monospace';
        for (let i = 0; i < entries.length; i++) {
          const [name, val] = entries[i];
          ctx.fillStyle = C.ink;
          ctx.fillText(name, bodyX, bodyY + i * 14);
          ctx.textAlign = 'right';
          ctx.fillText(val ? String(val).padStart(6, '0') : '------', cx + cw - 10, bodyY + i * 14);
          ctx.textAlign = 'left';
        }
        if (entries.every(([,v]) => !v)) {
          ctx.fillStyle = C.dark;
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText('NO DATA YET', bodyX, bodyY + 56);
        }
        hint = 'B=BACK';
      }
      else if (currentOption === 'ERASE SAVE') {
        if (optCursor === 1) {
          ctx.fillStyle = '#20a040';
          ctx.font = '9px "Press Start 2P", monospace';
          ctx.fillText('DATA ERASED', bodyX, bodyY);
          ctx.fillStyle = C.dark;
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText('high scores cleared', bodyX, bodyY + 16);
        } else {
          ctx.fillStyle = '#c02020';
          ctx.font = 'bold 10px "Press Start 2P", monospace';
          ctx.fillText('ARE YOU SURE?', bodyX, bodyY);
          ctx.fillStyle = C.ink;
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillText('this will wipe', bodyX, bodyY + 18);
          ctx.fillText('all high scores.', bodyX, bodyY + 30);
          ctx.fillStyle = C.dark;
          ctx.fillText('no going back.', bodyX, bodyY + 44);
        }
        hint = 'A=ERASE  B=CANCEL';
      }
      else if (currentOption === 'LINK CABLE') {
        ctx.fillText('SEARCHING...', bodyX, bodyY);
        // Scan animation
        const dots = Math.floor(performance.now() / 300) % 4;
        ctx.fillText('.'.repeat(dots), bodyX + 110, bodyY);
        // Two GB icons with cable between — animated
        const y = bodyY + 18;
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 2;
        ctx.strokeRect(bodyX, y, 22, 30);          // self
        ctx.strokeRect(bodyX + cw - 50, y, 22, 30); // other (dim)
        ctx.fillStyle = C.ink;
        ctx.fillRect(bodyX + 4, y + 4, 14, 10);    // self screen
        ctx.fillStyle = C.dark;
        ctx.fillRect(bodyX + cw - 46, y + 4, 14, 10);
        // Cable (dashed, animated)
        ctx.strokeStyle = C.dark;
        ctx.setLineDash([4, 4]);
        ctx.lineDashOffset = -performance.now() * 0.02;
        ctx.beginPath();
        ctx.moveTo(bodyX + 22, y + 15);
        ctx.lineTo(bodyX + cw - 50, y + 15);
        ctx.stroke();
        ctx.setLineDash([]);
        // Result
        ctx.fillStyle = '#c02020';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText('NO PARTNER FOUND', bodyX, bodyY + 60);
        hint = 'B=BACK';
      }
      else if (currentOption === 'SOUND TEST') {
        const visible = 5;
        ctx.font = '8px "Press Start 2P", monospace';
        for (let i = 0; i < Math.min(visible, soundTestTracks.length); i++) {
          const idx = (soundTestCursor + i - 2 + soundTestTracks.length) % soundTestTracks.length;
          const y = bodyY + i * 12;
          if (idx === soundTestCursor) {
            ctx.fillStyle = C.ink;
            ctx.fillRect(bodyX - 2, y - 8, cw - 16, 11);
            ctx.fillStyle = C.bg;
            ctx.fillText('\u25B6 ' + soundTestTracks[idx].label, bodyX, y);
          } else {
            ctx.fillStyle = C.dark;
            ctx.fillText('  ' + soundTestTracks[idx].label, bodyX, y);
          }
        }
        hint = '\u25B2\u25BC=PICK  A=PLAY  B=BACK';
      }
      else if (currentOption === 'CHEATS') {
        ctx.fillText('ENTER CODE:', bodyX, bodyY);
        ctx.fillStyle = C.dark;
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText('UP UP DOWN DOWN', bodyX, bodyY + 14);
        ctx.fillText('L R L R', bodyX, bodyY + 24);
        // Draw last 8 button presses
        ctx.fillStyle = C.ink;
        ctx.font = '10px "Press Start 2P", monospace';
        const symMap = { up: '\u25B2', down: '\u25BC', left: '\u25C0', right: '\u25B6', a: 'A', b: 'B' };
        const seq = cheatSeq.map(s => symMap[s] || '?').join(' ');
        ctx.fillText(seq, bodyX, bodyY + 46);
        if (cheatUnlocked) {
          ctx.fillStyle = '#20a040';
          ctx.font = 'bold 9px "Press Start 2P", monospace';
          ctx.fillText('UNLOCKED!', bodyX, bodyY + 62);
        }
        hint = 'B=BACK';
      }
      else if (currentOption === 'CREDITS') {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx + 4, cy + headerH + 4, cw - 8, ch - headerH - 18);
        ctx.clip();
        // Auto-scroll + manual
        const autoOff = (performance.now() / 40) + creditScroll;
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        for (let i = 0; i < creditsText.length; i++) {
          const y = cy + ch - autoOff + i * 14;
          if (y < cy + headerH || y > cy + ch) continue;
          ctx.fillStyle = (i % 4 === 0) ? C.ink : C.dark;
          ctx.fillText(creditsText[i], midX, y);
        }
        ctx.restore();
        ctx.textAlign = 'left';
        hint = '\u25B2\u25BC=SCRUB  B=BACK';
      }
      else if (currentOption === 'DIP SWITCHES') {
        ctx.font = '8px "Press Start 2P", monospace';
        for (let i = 0; i < dipSwitches.length; i++) {
          const y = bodyY + i * 16;
          const sel = i === dipCursor;
          if (sel) {
            ctx.fillStyle = C.ink;
            ctx.fillRect(bodyX - 2, y - 9, cw - 16, 14);
            ctx.fillStyle = C.bg;
          } else {
            ctx.fillStyle = C.ink;
          }
          ctx.fillText((sel ? '\u25B6 ' : '  ') + dipSwitches[i].label, bodyX, y);
          // Switch indicator
          const toggleX = cx + cw - 32;
          ctx.strokeStyle = sel ? C.bg : C.ink;
          ctx.lineWidth = 1;
          ctx.strokeRect(toggleX, y - 7, 20, 10);
          ctx.fillStyle = dipSwitches[i].on ? (sel ? C.bg : C.ink) : C.dark;
          ctx.fillRect(toggleX + (dipSwitches[i].on ? 11 : 1), y - 6, 8, 8);
        }
        hint = '\u25B2\u25BC=PICK  A=FLIP  B=BACK';
      }
      else if (currentOption === 'SERIAL NO.') {
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = C.ink;
        ctx.fillText('MODEL:  DMG-LGR-SI', bodyX, bodyY);
        ctx.fillText('S/N:    00-2025-0001', bodyX, bodyY + 14);
        ctx.fillText('FW:     v1.0.4', bodyX, bodyY + 28);
        ctx.fillText('CPU:    SHARP LR35902', bodyX, bodyY + 42);
        ctx.fillText('MEMORY: 8KB RAM', bodyX, bodyY + 56);
        ctx.fillStyle = C.dark;
        ctx.fillText('MADE IN LJUBLJANA', bodyX, bodyY + 74);
        hint = 'B=BACK';
      }
      else if (currentOption === 'DEV MODE') {
        const uptime = Math.floor((performance.now() - batteryStart) / 1000);
        const mm = String(Math.floor(uptime / 60)).padStart(2, '0');
        const ss = String(uptime % 60).padStart(2, '0');
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillStyle = '#20c020';
        ctx.fillText('FPS:    ' + (gb.userData.fps || 60), bodyX, bodyY);
        ctx.fillText('UPTIME: ' + mm + ':' + ss, bodyX, bodyY + 14);
        ctx.fillText('SCREEN: ' + SCR_W + 'x' + SCR_H, bodyX, bodyY + 28);
        ctx.fillText('INPUTS: ' + cheatSeq.length, bodyX, bodyY + 42);
        ctx.fillText('PALETTE: ' + palettes[paletteIdx].id, bodyX, bodyY + 56);
        // Fake hex dump
        ctx.fillStyle = '#108810';
        const addr = Math.floor(performance.now() / 100);
        for (let row = 0; row < 3; row++) {
          let line = (0xA000 + row * 16 + addr * 16).toString(16).toUpperCase().slice(-4) + ': ';
          for (let b = 0; b < 8; b++) {
            line += ((addr * 7 + row * 13 + b * 3) % 256).toString(16).padStart(2, '0') + ' ';
          }
          ctx.fillText(line, bodyX, bodyY + 74 + row * 10);
        }
        hint = 'B=BACK';
      }

      ctx.fillStyle = C.dark;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(hint, cx + 8, cy + ch + 8);
    } else if (screen === 'snake') {
      ctx.textAlign = 'left';
      const cellW = Math.floor(cw / SNAKE_COLS);
      const cellH = Math.floor(ch / SNAKE_ROWS);
      const gridX = cx + (cw - cellW * SNAKE_COLS) / 2;
      const gridY = cy + (ch - cellH * SNAKE_ROWS) / 2;

      if (!snakeStarted) {
        // Start screen
        ctx.fillStyle = C.ink;
        ctx.textAlign = 'center';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.fillText('SNAKE', cx + cw / 2, cy + ch / 2 - 16);
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = C.dark;
        ctx.fillText('A = START', cx + cw / 2, cy + ch / 2 + 6);
        ctx.fillText('B = BACK', cx + cw / 2, cy + ch / 2 + 20);
        ctx.textAlign = 'left';
      } else if (!snakeAlive) {
        // Game over
        // Draw final state
        ctx.fillStyle = C.dark;
        for (const s of snake) ctx.fillRect(gridX + s.x * cellW, gridY + s.y * cellH, cellW - 1, cellH - 1);
        ctx.fillStyle = C.light;
        ctx.fillRect(cx + 6, cy + ch / 2 - 40, cw - 12, 90);
        ctx.strokeStyle = C.ink;
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 6, cy + ch / 2 - 40, cw - 12, 90);
        ctx.fillStyle = C.ink;
        ctx.textAlign = 'center';
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillText('GAME OVER', cx + cw / 2, cy + ch / 2 - 26);
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText('SCORE: ' + snakeScore, cx + cw / 2, cy + ch / 2 - 12);
        ctx.fillStyle = C.dark;
        ctx.font = '6px "Press Start 2P", monospace';
        const jokes = [
          ['Need a designer?', 'I dont bite'],
          ['Hire me before', 'the snake does'],
          ['My pixels are', 'better than this'],
          ['I design better', 'than you play'],
          ['This snake has better', 'UX than your site'],
        ];
        const joke = jokes[snakeScore % jokes.length];
        ctx.fillText(joke[0], cx + cw / 2, cy + ch / 2 + 4);
        ctx.fillText(joke[1], cx + cw / 2, cy + ch / 2 + 14);
        ctx.fillStyle = C.ink;
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillText('A=RETRY  B=MENU', cx + cw / 2, cy + ch / 2 + 34);
        ctx.textAlign = 'left';
      } else {
        // Playing — draw grid border
        ctx.strokeStyle = C.dark;
        ctx.lineWidth = 1;
        ctx.strokeRect(gridX - 1, gridY - 1, cellW * SNAKE_COLS + 2, cellH * SNAKE_ROWS + 2);

        // Draw food
        if (snakeFood) {
          ctx.fillStyle = '#cc2222';
          ctx.fillRect(gridX + snakeFood.x * cellW, gridY + snakeFood.y * cellH, cellW - 1, cellH - 1);
        }

        // Draw snake
        for (let i = 0; i < snake.length; i++) {
          ctx.fillStyle = i === 0 ? C.ink : C.dark;
          ctx.fillRect(gridX + snake[i].x * cellW, gridY + snake[i].y * cellH, cellW - 1, cellH - 1);
        }

        // Score
        ctx.fillStyle = C.ink;
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillText('SCORE:' + snakeScore, cx + 4, cy + ch + 8);
      }
    } else if (screen === 'breakout') {
      // Black background for breakout
      ctx.fillStyle = '#000';
      ctx.fillRect(cx, cy, cw, ch + 30);
      ctx.textAlign = 'center';

      if (!brk.started) {
        // Start screen
        ctx.fillStyle = '#ff8800';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.fillText('BREAKOUT', cx + cw / 2, cy + ch / 2 - 16);
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('A = START', cx + cw / 2, cy + ch / 2 + 6);
        ctx.fillText('B = BACK', cx + cw / 2, cy + ch / 2 + 20);
      } else if (!brk.alive) {
        // Game over or win
        const won = brkBricks.every(b => !b.alive);
        const brickW = cw / BRK_COLS;
        const brickH = (ch * 0.35) / BRK_ROWS;
        for (const brick of brkBricks) {
          if (!brick.alive) continue;
          ctx.fillStyle = brkColors[brick.r % brkColors.length];
          ctx.fillRect(cx + brick.c * brickW + 1, cy + brick.r * brickH + 4, brickW - 2, brickH - 2);
        }
        // Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(cx + 6, cy + ch / 2 - 40, cw - 12, 90);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + 6, cy + ch / 2 - 40, cw - 12, 90);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillText(won ? 'YOU WIN!' : 'GAME OVER', cx + cw / 2, cy + ch / 2 - 26);
        ctx.font = '6px "Press Start 2P", monospace';
        ctx.fillText('SCORE: ' + brk.score, cx + cw / 2, cy + ch / 2 - 12);
        ctx.fillStyle = '#888';
        ctx.font = '6px "Press Start 2P", monospace';
        const brkJokes = won ? [
          ['Not bad for a', 'designer right?'],
          ['Now imagine what', 'I do with pixels'],
          ['Broke all the bricks', 'and the competition'],
        ] : [
          ['Even my layouts', 'have fewer breaks'],
          ['My CSS never', 'breaks like this'],
          ['At least my designs', 'dont fall apart'],
        ];
        const bj = brkJokes[brk.score % brkJokes.length];
        ctx.fillText(bj[0], cx + cw / 2, cy + ch / 2 + 4);
        ctx.fillText(bj[1], cx + cw / 2, cy + ch / 2 + 14);
        ctx.fillStyle = '#aaa';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillText('A=RETRY  B=MENU', cx + cw / 2, cy + ch / 2 + 34);
      } else {
        // Playing
        const brickW = cw / BRK_COLS;
        const brickH = (ch * 0.35) / BRK_ROWS;

        for (const brick of brkBricks) {
          if (!brick.alive) continue;
          ctx.fillStyle = brkColors[brick.r % brkColors.length];
          ctx.fillRect(cx + brick.c * brickW + 1, cy + brick.r * brickH + 4, brickW - 2, brickH - 2);
        }

        // Paddle
        const padW = cw * 0.2;
        const padX = cx + brkPadX * cw - padW / 2;
        const padY = cy + ch * 0.88;
        ctx.fillStyle = '#fff';
        ctx.fillRect(padX, padY, padW, BRK_PAD_H);

        // Ball
        const ballX = cx + brkBall.x * cw;
        const ballY = cy + brkBall.y * ch;
        ctx.fillStyle = '#fff';
        ctx.fillRect(ballX - 2, ballY - 2, 4, 4);

        // Score + lives
        ctx.fillStyle = '#fff';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SCORE:' + brk.score, cx + 4, cy + ch + 8);
        ctx.textAlign = 'right';
        const hearts = '\u2665'.repeat(brk.lives);
        ctx.fillStyle = '#dd3333';
        ctx.fillText(hearts, cx + cw - 4, cy + ch + 8);
      }
      ctx.textAlign = 'left';
    } else if (screen === 'frogger') {
      ctx.textAlign = 'center';
      const cellW = cw / FROG_COLS, cellH = ch / FROG_ROWS;

      if (!frog.started) {
        ctx.fillStyle = '#0a1a0a';
        ctx.fillRect(cx, cy, cw, ch + 30);
        ctx.fillStyle = '#33dd33';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.fillText('FROGGER', cx + cw / 2, cy + ch / 2 - 16);
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#888';
        ctx.fillText('A = START', cx + cw / 2, cy + ch / 2 + 6);
        ctx.fillText('B = BACK', cx + cw / 2, cy + ch / 2 + 20);
      } else if (!frog.alive) {
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(cx, cy, cw, ch + 30);
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.fillText('SPLAT!', cx + cw / 2, cy + ch / 2 - 20);
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillText('SCORE: ' + frog.score, cx + cw / 2, cy + ch / 2);
        ctx.fillStyle = '#888';
        ctx.font = '6px "Press Start 2P", monospace';
        const frogJokes = [
          ['Why did the frog', 'cross the road?'],
          ['Ribbit in peace', ''],
          ['My layouts cross', 'better than this'],
        ];
        const fj = frogJokes[frog.score % frogJokes.length];
        ctx.fillText(fj[0], cx + cw / 2, cy + ch / 2 + 18);
        ctx.fillText(fj[1], cx + cw / 2, cy + ch / 2 + 28);
        ctx.fillStyle = '#aaa';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.fillText('A=RETRY  B=MENU', cx + cw / 2, cy + ch / 2 + 46);
      } else {
        // Draw lanes
        for (let r = 0; r < FROG_ROWS; r++) {
          const lane = frogLanes[r];
          const ly = cy + r * cellH;

          if (lane.type === 'safe') {
            ctx.fillStyle = r === 0 ? '#1a4a1a' : '#2a2a1a';
            ctx.fillRect(cx, ly, cw, cellH + 1);
            if (r === 0) {
              // Goal lilypads
              ctx.fillStyle = '#33aa33';
              for (let p = 1; p < FROG_COLS; p += 3) {
                ctx.beginPath();
                ctx.arc(cx + p * cellW + cellW / 2, ly + cellH / 2, cellW * 0.35, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          } else if (lane.type === 'water') {
            ctx.fillStyle = '#1a3366';
            ctx.fillRect(cx, ly, cw, cellH + 1);
            // Logs
            ctx.fillStyle = '#8B4513';
            for (const log of lane.items) {
              ctx.fillRect(cx + log.x * cellW, ly + 2, log.w * cellW, cellH - 4);
              ctx.fillStyle = '#A0522D';
              ctx.fillRect(cx + log.x * cellW + 2, ly + 3, log.w * cellW - 4, cellH - 6);
              ctx.fillStyle = '#8B4513';
            }
          } else if (lane.type === 'road') {
            ctx.fillStyle = '#333';
            ctx.fillRect(cx, ly, cw, cellH + 1);
            // Lane markings
            ctx.fillStyle = '#555';
            ctx.fillRect(cx, ly, cw, 1);
            // Cars
            for (const car of lane.items) {
              ctx.fillStyle = ['#dd3333','#3388dd','#ddaa00','#dd55aa'][r % 4];
              ctx.fillRect(cx + car.x * cellW, ly + 2, car.w * cellW, cellH - 4);
              // Windshield
              ctx.fillStyle = '#88ccff';
              const wx = lane.dir > 0 ? cx + (car.x + car.w * 0.6) * cellW : cx + car.x * cellW + 2;
              ctx.fillRect(wx, ly + 3, car.w * cellW * 0.25, cellH - 6);
            }
          }
        }

        // Frog
        const fx = cx + frogX * cellW + cellW / 2;
        const fy = cy + frogY * cellH + cellH / 2;
        ctx.fillStyle = '#33dd33';
        ctx.fillRect(fx - cellW * 0.35, fy - cellH * 0.35, cellW * 0.7, cellH * 0.7);
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.fillRect(fx - cellW * 0.25, fy - cellH * 0.35, 3, 3);
        ctx.fillRect(fx + cellW * 0.1, fy - cellH * 0.35, 3, 3);

        // HUD
        ctx.fillStyle = '#fff';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText('SCORE:' + frog.score, cx + 4, cy + ch + 8);
        ctx.textAlign = 'right';
        const hearts = '\u2665'.repeat(frog.lives);
        ctx.fillStyle = '#dd3333';
        ctx.fillText(hearts, cx + cw - 4, cy + ch + 8);
      }
      ctx.textAlign = 'left';
    }
    // LCD pixel grid effect — covers full green area
    const gx = bzH, gy = bzV - shiftUp, gw = w - bzH * 2, gh = h - bzV - (bzV - shiftUp);
    ctx.fillStyle = 'rgba(0,0,0,0.025)';
    for (let y = gy; y < gy + gh; y += 2) ctx.fillRect(gx, y, gw, 1);
    for (let x = gx; x < gx + gw; x += 2) ctx.fillRect(x, gy, 1, gh);

    // Subtle vignette on screen edges
    const vGrad = ctx.createRadialGradient(gx + gw/2, gy + gh/2, gh * 0.3, gx + gw/2, gy + gh/2, gh * 0.8);
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = vGrad;
    ctx.fillRect(gx, gy, gw, gh);

    // LCD wipe overlay — horizontal strips cascade down
    if (lcdTransition) {
      const stripH = h / LCD_STRIPS;
      for (let i = 0; i < LCD_STRIPS; i++) {
        const delay = i / LCD_STRIPS;
        let alpha;
        if (lcdPhase === 0) {
          // Wipe in: strips cascade down, covering screen
          const t = Math.max(0, Math.min(1, (lcdProgress - delay * 0.6) / 0.4));
          alpha = t * t;
        } else if (lcdPhase === 1) {
          alpha = 1;
        } else {
          // Wipe out: strips cascade down, revealing new screen
          const t = Math.max(0, Math.min(1, (lcdProgress - delay * 0.6) / 0.4));
          alpha = 1 - t * t;
        }
        if (alpha > 0) {
          ctx.fillStyle = `rgba(10, 26, 10, ${alpha})`;
          ctx.fillRect(0, i * stripH, w, stripH);
        }
      }
    }

    ctx.restore();
    screenTex.needsUpdate = true;
  }

  // ========== BUTTON ACTIONS ==========
  // Power LED state helpers — keep color/emissive/glow in sync.
  function setLedActive() {
    const lm = parts['body-light'];
    if (!lm) return;
    lm.material.color.set(0xff1a1a);
    lm.material.emissive.set(0xff0000);
    lm.material.emissiveIntensity = 1.0;
    lm.material.needsUpdate = true;
    if (lm.userData.ledGlow) lm.userData.ledGlow.intensity = 0.1;
  }
  function setLedInactive() {
    const lm = parts['body-light'];
    if (!lm) return;
    lm.material.color.set(0x992020);
    lm.material.emissive.set(0x330000);
    lm.material.emissiveIntensity = 0.25;
    lm.material.needsUpdate = true;
    if (lm.userData.ledGlow) lm.userData.ledGlow.intensity = 0;
  }
  // Cart-specific boot jingle
  function playBootSoundFor(cartId) {
    if (cartId === 'snake') sfx.bootSnake();
    else if (cartId === 'breakout') sfx.bootBreakout();
    else if (cartId === 'frogger') sfx.bootFrogger();
    else sfx.boot();
  }
  // Quick mechanical dip used when a cart is slotted in
  function cartPushDip() {
    setTimeout(() => {
      gb.userData.pushOffset = -1.2;
      setTimeout(() => { gb.userData.pushOffset = -0.5; }, 80);
      setTimeout(() => { gb.userData.pushOffset = 0; }, 160);
    }, 200);
  }
  // Wake the screen from dim/screensaver on any interaction
  function wakeScreen() {
    screenOff = false;
    screenSaver = false;
    if (parts.screen) {
      parts.screen.material.emissiveIntensity = 1.0;
      parts.screen.material.color.set(0xffffff);
    }
  }

  // Per-cart tint multipliers on top of the baked yellow base texture.
  const CART_TINTS = {
    portfolio: [1.00, 1.00, 1.00],  // original yellow
    snake:     [0.45, 1.00, 0.55],  // green
    breakout:  [0.55, 0.85, 1.25],  // blue
    frogger:   [1.20, 0.70, 1.10],  // magenta / pink
  };
  function applyCartTint(cartId) {
    const mesh = parts.casette;
    if (!mesh || !mesh.userData.plasticMat) return;
    if (cartId === 'portfolio' && mesh.userData.goldMat) {
      mesh.material = mesh.userData.goldMat;
      return;
    }
    mesh.material = mesh.userData.plasticMat;
    if (!mesh.material || !mesh.userData.baseColor) return;
    const tint = CART_TINTS[cartId] || CART_TINTS.portfolio;
    const base = mesh.userData.baseColor;
    mesh.material.color.setRGB(base.r * tint[0], base.g * tint[1], base.b * tint[2]);
    mesh.material.needsUpdate = true;
  }

  // Reusable: select and insert a cartridge by ID
  function selectCartridge(cartId) {
    if (screen !== 'insert') return;
    activeCart = cartId;
    currentMenuItems = cartridges[cartId].menuItems;
    currentHeader = cartridges[cartId].header;
    applyCartTint(cartId);
    // Wake screen if sleeping, then insert
    if (screenOff) wakeScreen();
    lastInteraction = performance.now();
    pressButton('a', false);
  }

  function pressButton(action, fromPhysical = true) {
    initAudio();
    lastInteraction = performance.now();
    if (screenOff) {
      wakeScreen();
      drawScreen();
      return;
    }
    // Play click sound only for physical presses on the 3D gameboy — not for
    // keyboard/scroll/HTML-panel navigation.
    if (fromPhysical) {
      if (action === 'a') sfx.select();
      else if (action === 'b') sfx.back();
      else sfx.navigate(); // up/down/left/right
    }

    if (screen === 'insert') {
      if (action === 'a') {
        // Default to portfolio if no cart selected
        if (!activeCart) {
          activeCart = 'portfolio';
          currentMenuItems = cartridges.portfolio.menuItems;
          currentHeader = cartridges.portfolio.header;
        }
        // Original insert logic
        const slotHit = interactiveObjs.find(o => o.userData.action === 'insertCart');
        if (slotHit) {
          // Fire the insert logic
          cartInserted = true;
          autoRotate = false;
          sfx.cartIn();
          // Delay boot so cart is visibly sliding first
          window.dispatchEvent(new CustomEvent('gb-inserted', { detail: activeCart }));
          setTimeout(() => {
            screen = 'boot';
            bootTimer = 0;
            playBootSoundFor(activeCart);
            targetCamZ = 130;
            setLedActive();
          }, 800);
          cartPushDip();
          const cart = parts.casette;
          if (cart) {
            const baseY = cart.userData.baseY;
            const startY = baseY + 160;
            cart.position.y = startY;
            cart.visible = true;
            cart.userData.rotStarted = false;
            const animStart = performance.now();
            const slideDur = 2200, pauseDur = 600;
            function cartAnimFromScreen(now) {
              const elapsed = now - animStart;
              if (elapsed > slideDur * 0.4 && !cart.userData.rotStarted) {
                cart.userData.rotStarted = true;
                const frontY = Math.round(targetRot.y / (Math.PI * 2)) * Math.PI * 2;
                targetRot.y = frontY;
                targetRot.x = 0.1;
              }
              if (elapsed < slideDur) {
                const t = elapsed / slideDur;
                const c1 = 1.2;
                const ease = 1 + c1 * Math.pow(t - 1, 3) + Math.pow(t - 1, 2);
                cart.position.y = startY + (baseY - startY) * Math.min(1, ease);
                requestAnimationFrame(cartAnimFromScreen);
              } else if (elapsed < slideDur + pauseDur) {
                cart.position.y = baseY;
                requestAnimationFrame(cartAnimFromScreen);
              } else {
                cart.position.y = baseY;
                cart.userData.action = 'ejectCart';
                cart.userData.animating = false;
                const eBox = new THREE.Box3().setFromObject(cart);
                const eSize = eBox.getSize(new THREE.Vector3());
                const eCenter = eBox.getCenter(new THREE.Vector3());
                const ejectHit = new THREE.Mesh(
                  new THREE.BoxGeometry(eSize.x, eSize.y * 0.8, 0.5),
                  new THREE.MeshBasicMaterial({ visible: false })
                );
                ejectHit.position.set(eCenter.x, eCenter.y, eCenter.z - eSize.z * 0.5);
                ejectHit.userData.action = 'ejectCart';
                ejectHit.userData.animating = false;
                ejectHit.userData.baseY = cart.userData.baseY;
                gb.children[0].add(ejectHit);
                interactiveObjs.push(ejectHit);
              }
            }
            requestAnimationFrame(cartAnimFromScreen);
            // Remove slot + hint
            const idx = interactiveObjs.indexOf(slotHit);
            if (idx !== -1) interactiveObjs.splice(idx, 1);
            slotHit.visible = false;
            if (slotHit.userData.hint) slotHit.userData.hint.visible = false;
          }
        }
      }
      return;
    }
    if (screen === 'boot') return; // can't skip boot animation
    if (screen === 'menu') {
      if (action === 'up') cursor = (cursor - 1 + currentMenuItems.length) % currentMenuItems.length;
      else if (action === 'down') cursor = (cursor + 1) % currentMenuItems.length;
      else if (action === 'a') {
        const mi = currentMenuItems[cursor];
        // PLAY — launch the active cart's game
        if (mi === 'PLAY') {
          if (activeCart === 'snake')      lcdFlash(() => { screen = 'snake';    snakeStarted = false; snakeAlive = false; });
          else if (activeCart === 'breakout') lcdFlash(() => { screen = 'breakout'; brk.started = false; brk.alive = false; });
          else if (activeCart === 'frogger')  lcdFlash(() => { screen = 'frogger';  frog.started = false; frog.alive = false; });
        }
        // Game-cart settings: jump straight into optView
        else if (mi === 'HIGH SCORES' || mi === 'SOUND TEST' || mi === 'CHEATS' || mi === 'ERASE SAVE') {
          currentOption = mi;
          optCursor = 0;
          soundTestCursor = 0;
          lcdFlash(() => { screen = 'optView'; });
        }
        // Legacy single-button carts (pre-refactor)
        else if (mi === 'SNAKE') {
          lcdFlash(() => { screen = 'snake'; snakeStarted = false; snakeAlive = false; });
        } else if (mi === 'BREAKOUT') {
          lcdFlash(() => { screen = 'breakout'; brk.started = false; brk.alive = false; });
        } else if (mi === 'FROGGER') {
          lcdFlash(() => { screen = 'frogger'; frog.started = false; frog.alive = false; });
        } else {
          lcdFlash(() => { screen = 'detail'; scroll = 0; detailCursor = 0; });
        }
      }
    } else if (screen === 'detail') {
      const isProjects = currentMenuItems[cursor] === 'QUESTS';
      const lines = details[currentMenuItems[cursor]] || [];

      const isTrophies = currentMenuItems[cursor] === 'TROPHIES';

      if (trophyScreen && isTrophies) {
        if (action === 'b') { trophyScreen = false; }
        else if (action === 'left') {
          detailCursor = (detailCursor - 1 + lines.length) % lines.length;
          if (detailCursor < scroll) scroll = detailCursor;
        }
        else if (action === 'right') {
          detailCursor = (detailCursor + 1) % lines.length;
          if (detailCursor >= scroll + detailVisibleCount) scroll = detailCursor - detailVisibleCount + 1;
        }
      } else if (projScreen && isProjects) {
        // Viewing project detail with images
        const imgCount = projImgCounts[detailCursor] || 1;
        if (action === 'b') { projScreen = false; trophyScreen = false; projImgIdx = 0; }
        else if (action === 'left') {
          projImgIdx = (projImgIdx - 1 + imgCount) % imgCount;
        }
        else if (action === 'right') {
          projImgIdx = (projImgIdx + 1) % imgCount;
        }
      } else if (currentMenuItems[cursor] === 'ABOUT ME') {
        // ABOUT ME uses slot-based scrolling (images take multiple slots)
        const imgH = 6;
        let totalSlots = 0;
        for (const l of lines) { totalSlots += (l === '[photo]' || l === '[bike]') ? imgH : 1; }
        if (action === 'up') { scroll = Math.max(0, scroll - 1); }
        else if (action === 'down') { scroll = Math.min(Math.max(0, totalSlots - detailVisibleCount), scroll + 1); }
        else if (action === 'b') { lcdFlash(() => { screen = 'menu'; projScreen = false; trophyScreen = false; }); }
        else if (action === 'left') { lcdFlash(() => { cursor = (cursor - 1 + currentMenuItems.length) % currentMenuItems.length; scroll = 0; detailCursor = 0; projScreen = false; trophyScreen = false; }); }
        else if (action === 'right') { lcdFlash(() => { cursor = (cursor + 1) % currentMenuItems.length; scroll = 0; detailCursor = 0; projScreen = false; trophyScreen = false; }); }
      } else {
        // Normal detail list
        if (action === 'up') {
          detailCursor = Math.max(0, detailCursor - 1);
          if (detailCursor < scroll) scroll = detailCursor;
        } else if (action === 'down') {
          detailCursor = Math.min(lines.length - 1, detailCursor + 1);
          if (detailCursor >= scroll + detailVisibleCount) scroll = detailCursor - detailVisibleCount + 1;
        } else if (action === 'a' && isTrophies) {
          trophyScreen = true;
        } else if (action === 'a' && currentMenuItems[cursor] === 'PING ME') {
          const contactLinks = {
            '@lukakluka': 'https://www.instagram.com/lukakluka/',
            '/lukagrcar': 'https://www.behance.net/lukagrcar',
          };
          const line = (details['PING ME'][detailCursor] || '').trim();
          if (line === 'luka.grcar@me.com') {
            const overlay = document.getElementById('contactOverlay');
            if (overlay) overlay.classList.add('open');
          } else if (contactLinks[line]) {
            window.open(contactLinks[line], '_blank');
          }
        } else if (action === 'a' && isProjects) {
          projScreen = true;
          projImgIdx = 0;
        } else if (action === 'a' && currentMenuItems[cursor] === 'OPTIONS') {
          // Enter a specific option view
          currentOption = lines[detailCursor];
          optCursor = 0;
          creditScroll = 0;
          dipCursor = 0;
          soundTestCursor = 0;
          lcdFlash(() => { screen = 'optView'; });
        } else if (action === 'b') {
          lcdFlash(() => { screen = 'menu'; projScreen = false; trophyScreen = false; });
        }
        else if (action === 'left') { lcdFlash(() => { cursor = (cursor - 1 + currentMenuItems.length) % currentMenuItems.length; scroll = 0; detailCursor = 0; projScreen = false; trophyScreen = false; }); }
        else if (action === 'right') { lcdFlash(() => { cursor = (cursor + 1) % currentMenuItems.length; scroll = 0; detailCursor = 0; projScreen = false; trophyScreen = false; }); }
      }
    } else if (screen === 'optView') {
      // Individual option screen routing. Most track in cheatSeq for cheat code.
      cheatSeq.push(action);
      if (cheatSeq.length > 8) cheatSeq.shift();
      if (cheatSeq.join(',') === 'up,up,down,down,left,right,left,right') {
        cheatUnlocked = true;
      }
      if (action === 'b') {
        // Game-cart options came straight from the cart menu; portfolio
        // options went through a 'detail' listing first.
        const backTo = (activeCart === 'snake' || activeCart === 'breakout' || activeCart === 'frogger') ? 'menu' : 'detail';
        lcdFlash(() => { screen = backTo; currentOption = null; });
        return;
      }
      switch (currentOption) {
        case 'PALETTE':
          if (action === 'left')  { paletteIdx = (paletteIdx - 1 + palettes.length) % palettes.length; applyPalette(); }
          else if (action === 'right') { paletteIdx = (paletteIdx + 1) % palettes.length; applyPalette(); }
          break;
        case 'CONTRAST':
          if (action === 'left')  contrastLevel = Math.max(0, contrastLevel - 1);
          else if (action === 'right') contrastLevel = Math.min(9, contrastLevel + 1);
          if (parts.screen) parts.screen.material.emissiveIntensity = contrastFactor();
          break;
        case 'SOUND':
          if (action === 'a' || action === 'left' || action === 'right') soundMuted = !soundMuted;
          break;
        case 'ERASE SAVE':
          if (action === 'a') {
            try {
              localStorage.removeItem('gb_high_snake');
              localStorage.removeItem('gb_high_breakout');
              localStorage.removeItem('gb_high_frogger');
            } catch (e) {}
            optCursor = 1; // show "DATA ERASED" flag
          }
          break;
        case 'SOUND TEST':
          if (action === 'up') soundTestCursor = (soundTestCursor - 1 + soundTestTracks.length) % soundTestTracks.length;
          else if (action === 'down') soundTestCursor = (soundTestCursor + 1) % soundTestTracks.length;
          else if (action === 'a') soundTestTracks[soundTestCursor].play();
          break;
        case 'DIP SWITCHES':
          if (action === 'up') dipCursor = (dipCursor - 1 + dipSwitches.length) % dipSwitches.length;
          else if (action === 'down') dipCursor = (dipCursor + 1) % dipSwitches.length;
          else if (action === 'a' || action === 'left' || action === 'right') dipSwitches[dipCursor].on = !dipSwitches[dipCursor].on;
          break;
        case 'CREDITS':
          if (action === 'up') creditScroll = Math.max(0, creditScroll - 10);
          else if (action === 'down') creditScroll += 10;
          break;
      }
    } else if (screen === 'snake') {
      if (!snakeStarted || !snakeAlive) {
        if (action === 'a') snakeReset();
        else if (action === 'b') lcdFlash(() => { screen = 'menu'; });
      } else {
        // Direction controls — prevent 180 turns
        if (action === 'up' && snakeDir.y !== 1) snakeNextDir = {x:0, y:-1};
        else if (action === 'down' && snakeDir.y !== -1) snakeNextDir = {x:0, y:1};
        else if (action === 'left' && snakeDir.x !== 1) snakeNextDir = {x:-1, y:0};
        else if (action === 'right' && snakeDir.x !== -1) snakeNextDir = {x:1, y:0};
      }
    } else if (screen === 'breakout') {
      if (!brk.started || !brk.alive) {
        if (action === 'a') brkReset();
        else if (action === 'b') lcdFlash(() => { screen = 'menu'; });
      } else {
        if (action === 'left') brkPadX = Math.max(0.1, brkPadX - 0.08);
        else if (action === 'right') brkPadX = Math.min(0.9, brkPadX + 0.08);
      }
    } else if (screen === 'frogger') {
      if (!frog.started || !frog.alive) {
        if (action === 'a') frogReset();
        else if (action === 'b') lcdFlash(() => { screen = 'menu'; });
      } else {
        if (action === 'up' && frogY > 0) { frogY--; frog.score++; sfx.navigate(); }
        else if (action === 'down' && frogY < FROG_ROWS - 1) { frogY++; sfx.navigate(); }
        else if (action === 'left' && frogX > 0) { frogX--; sfx.navigate(); }
        else if (action === 'right' && frogX < FROG_COLS - 1) { frogX++; sfx.navigate(); }
      }
    }
    drawScreen();
  }

  // ========== RAYCASTING ==========
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function raycast(cx, cy) {
    if (!interactiveObjs.length) return false;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((cx - r.left) / r.width) * 2 - 1;
    pointer.y = -((cy - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactiveObjs, true);
    if (hits.length && hits[0].object.userData.action) {
      const obj = hits[0].object;
      wakeScreen();
      lastInteraction = performance.now();


      // Cartridge eject (click on inserted cartridge) — only from back
      if (obj.userData.action === 'ejectCart') {
        // Normalize rotation to 0..2PI range, only allow eject when viewing the back
        const normY = ((gb.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (normY < Math.PI * 0.6 || normY > Math.PI * 1.4) return true;
        if (obj.userData.animating) return true;
        initAudio();
        obj.userData.animating = true;
        sfx.cartOut();
        targetCamZ = 180; // zoom back out
        const cart = parts.casette;
        const baseY = cart.userData.baseY;
        const ejectY = baseY + 160;
        const ejectStart = performance.now();
        const ejectDur = 1000;

        // Turn off LED — keep a faint red tint so it doesn't look dead black
        setLedInactive();

        // Screen off
        screen = 'insert';
        cartInserted = false;
        scroll = 0; detailCursor = 0; cursor = 0;
        projScreen = false; trophyScreen = false;
        drawScreen();

        function ejectAnim(now) {
          const elapsed = now - ejectStart;
          if (elapsed < ejectDur) {
            const t = elapsed / ejectDur;
            const ease = t * t;
            cart.position.y = baseY + (ejectY - baseY) * ease;
            requestAnimationFrame(ejectAnim);
          } else {
            cart.visible = false;
            cart.position.y = baseY;
            obj.userData.animating = false;
            // Re-add insert hit zone
            const slotHit = interactiveObjs.find(o => o.userData.action === 'insertCart');
            if (!slotHit) {
              // Recreate slot hit
              const cBox = new THREE.Box3().setFromObject(cart);
              const cSize = cBox.getSize(new THREE.Vector3());
              const cCenter = cBox.getCenter(new THREE.Vector3());
              const hitMat = new THREE.MeshBasicMaterial({ visible: false });
              const newSlot = new THREE.Mesh(
                new THREE.BoxGeometry(cSize.x * 2, cSize.y * 1.5, 0.5), hitMat
              );
              newSlot.position.set(cCenter.x, cCenter.y, cCenter.z - cSize.z * 0.5);
              newSlot.userData.action = 'insertCart';
              // Recreate hint text at stored position
              const hintCvs = document.createElement('canvas');
              hintCvs.width = 256; hintCvs.height = 64;
              const hC = hintCvs.getContext('2d');
              hC.fillStyle = 'rgba(255,255,255,0.7)';
              hC.font = '12px "Press Start 2P", monospace';
              hC.textAlign = 'center';
              hC.fillText('click to insert', 128, 28);
              hC.fillText('\u25BC', 128, 48);
              const hintTex = new THREE.CanvasTexture(hintCvs);
              const cd = parts.casette.userData;
              const hint = new THREE.Mesh(
                new THREE.PlaneGeometry(cd.hintGeoW, cd.hintGeoH),
                new THREE.MeshBasicMaterial({ map: hintTex, transparent: true, side: THREE.DoubleSide })
              );
              hint.position.copy(cd.hintPos);
              hint.rotation.y = Math.PI;
              gb.children[0].add(hint);
              newSlot.userData.hint = hint;

              gb.children[0].add(newSlot);
              interactiveObjs.push(newSlot);
            }
            // Remove eject hit zone from interactive
            const idx = interactiveObjs.indexOf(obj);
            if (idx !== -1) interactiveObjs.splice(idx, 1);
            if (obj.parent) obj.parent.remove(obj);
            activeCart = null;
            autoRotate = true;
            window.dispatchEvent(new Event('gb-ejected'));
          }
        }
        requestAnimationFrame(ejectAnim);
        return true;
      }

      // Cartridge insert (slot click) — only when viewing the back, same as eject
      if (obj.userData.action === 'insertCart') {
        const normYi = ((gb.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        if (normYi < Math.PI * 0.6 || normYi > Math.PI * 1.4) return true;
        if (cartInserted) return true;
        initAudio();
        cartInserted = true;
        autoRotate = false;
        sfx.cartIn();
        window.dispatchEvent(new CustomEvent('gb-inserted', { detail: activeCart }));
        setTimeout(() => {
          screen = 'boot';
          bootTimer = 0;
          playBootSoundFor(activeCart);
          targetCamZ = 130;
          setLedActive();
        }, 800);
        cartPushDip();

        const cart = parts.casette;
        if (!cart) return true;

        // Show cartridge far above, then slide it in from top of canvas
        const baseY = cart.userData.baseY;
        const startY = baseY + 160;
        cart.position.y = startY;
        cart.visible = true;

        const animStart = performance.now();
        const slideDur = 2200;  // slide in ms
        const pauseDur = 600;   // pause before rotate


        cart.userData.rotStarted = false;
        function cartAnim(now) {
          const elapsed = now - animStart;

          // Start rotating to front early
          if (elapsed > slideDur * 0.4 && !cart.userData.rotStarted) {
            cart.userData.rotStarted = true;
            const frontY = Math.round(targetRot.y / (Math.PI * 2)) * Math.PI * 2;
            targetRot.y = frontY;
            targetRot.x = 0.1;
          }

          if (elapsed < slideDur) {
            // Slide in with easeOutBack
            const t = elapsed / slideDur;
            const c1 = 1.2;
            const ease = 1 + c1 * Math.pow(t - 1, 3) + Math.pow(t - 1, 2);
            cart.position.y = startY + (baseY - startY) * Math.min(1, ease);
            requestAnimationFrame(cartAnim);
          } else if (elapsed < slideDur + pauseDur) {
            cart.position.y = baseY;
            requestAnimationFrame(cartAnim);
          } else {
            cart.position.y = baseY;

            // Add thin eject hit zone on the back of cartridge
            cart.userData.animating = false;
            const eBox = new THREE.Box3().setFromObject(cart);
            const eSize = eBox.getSize(new THREE.Vector3());
            const eCenter = eBox.getCenter(new THREE.Vector3());
            const ejectHit = new THREE.Mesh(
              new THREE.BoxGeometry(eSize.x, eSize.y * 0.8, 0.5),
              new THREE.MeshBasicMaterial({ visible: false })
            );
            ejectHit.position.set(eCenter.x, eCenter.y, eCenter.z - eSize.z * 0.5);
            ejectHit.userData.action = 'ejectCart';
            ejectHit.userData.animating = false;
            ejectHit.userData.baseY = cart.userData.baseY;
            gb.children[0].add(ejectHit);
            interactiveObjs.push(ejectHit);
          }
        }
        requestAnimationFrame(cartAnim);

        // Remove slot hit zone and hint
        const idx = interactiveObjs.indexOf(obj);
        if (idx !== -1) interactiveObjs.splice(idx, 1);
        obj.visible = false;
        if (obj.userData.hint) obj.userData.hint.visible = false;

        return true;
      }

      pressButton(obj.userData.action);

      // Glow flash only for the real A/B buttons and D-pad (not START/SELECT
      // which happen to share the same action codes internally).
      if (window._gbFlashLetter) {
        if (obj.name === 'A' || obj.name === 'B' || obj.userData.isJoystick) {
          window._gbFlashLetter(obj.userData.action);
        }
      }

      // Body reaction — nudge then spring back
      // Body reaction — uses separate nudge offset that auto-decays
      const nudge = 0.08;
      const action = obj.userData.action;
      gb.userData.nudgeX = (action === 'up' ? -nudge : action === 'down' ? nudge : 0);
      gb.userData.nudgeY = (action === 'left' ? nudge : action === 'right' ? -nudge :
                     action === 'a' ? -nudge * 0.5 : action === 'b' ? nudge * 0.5 : 0);

      if (obj.userData.isJoystick && parts.joystick) {
        const js = parts.joystick;
        if (js.userData.baseInit === undefined) {
          js.userData.baseInit = true;
          js.userData.baseRx = js.rotation.x;
          js.userData.baseRy = js.rotation.y;
          js.userData.tilting = false;
        }
        // Always snap back to base before tilting
        clearTimeout(js.userData.tiltTimer);
        js.rotation.x = js.userData.baseRx;
        js.rotation.y = js.userData.baseRy;
        // Apply tilt
        js.rotation.x += obj.userData.tiltX;
        js.rotation.y += obj.userData.tiltY;
        js.userData.tiltTimer = setTimeout(() => {
          js.rotation.x = js.userData.baseRx;
          js.rotation.y = js.userData.baseRy;
        }, 150);
      } else {
        // Press-in animation — always reset to base first
        if (obj.userData.baseZ === undefined) obj.userData.baseZ = obj.position.z;
        clearTimeout(obj.userData.pressTimer);
        obj.position.z = obj.userData.baseZ - 0.8;
        obj.userData.pressTimer = setTimeout(() => {
          obj.position.z = obj.userData.baseZ;
        }, 120);
      }

      return true;
    }
    return false;
  }

  // ========== DRAG TO ROTATE ==========
  let isDragging = false, dragMoved = false;
  let prev = { x: 0, y: 0 };
  let targetRot = { x: 0.1, y: 0 }; // start facing front
  let autoRotate = true;
  let targetCamZ = 180; // default zoom

  // === BUTTON HOVER ===
  let hoveredBtn = null;
  function updateHover(cx, cy) {
    if (!interactiveObjs.length) return;
    const r = renderer.domElement.getBoundingClientRect();
    pointer.x = ((cx - r.left) / r.width) * 2 - 1;
    pointer.y = -((cy - r.top) / r.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(interactiveObjs, true);
    const hit = hits.length && hits[0].object.userData.action ? hits[0].object : null;
    // Map the raw hit to the mesh we actually want to glow.
    let btn = null;
    if (hit) {
      if (hit.material && hit.material.visible !== false) {
        btn = hit;
      } else if (hit.userData.isJoystick && parts.joystick) {
        btn = parts.joystick;
      } else if ((hit.userData.action === 'ejectCart' || hit.userData.action === 'insertCart') && parts.casette && parts.casette.visible) {
        btn = parts.casette;
      }
    }
    if (btn === hoveredBtn) return;
    if (hoveredBtn && hoveredBtn.material && hoveredBtn.material.emissive) {
      hoveredBtn.material.emissive.set(hoveredBtn.userData._origEmissive || 0x000000);
      hoveredBtn.material.emissiveIntensity = hoveredBtn.userData._origEmissiveInt || 0;
    }
    hoveredBtn = btn;
    if (btn && btn.material && btn.material.emissive) {
      if (btn.userData._origEmissive === undefined) {
        btn.userData._origEmissive = btn.material.emissive.getHex();
        btn.userData._origEmissiveInt = btn.material.emissiveIntensity;
      }
      const col = btn.material.color || new THREE.Color(0xffffff);
      btn.material.emissive.copy(col);
      btn.material.emissiveIntensity = 0.35;
    }
    renderer.domElement.style.cursor = hit ? 'pointer' : '';
  }

  // LEFT click + drag = rotate. Click without drag = raycast (button press).
  // Touch handles its own drag flow below.
  let leftDown = false;
  let leftDragging = false;
  let leftStart = { x: 0, y: 0 };

  // Sensitivity — 2:1 yaw:pitch ratio matches the convention that users
  // rotate horizontally more than vertically.
  const DRAG_SENS_Y = 0.0075;
  const DRAG_SENS_X = 0.0038;
  // ~70° pitch clamp — wider than the prior 34° but still avoids the model
  // flipping upside-down.
  const PITCH_CLAMP = 1.2;

  // Rolling velocity samples for flick-release inertia. Last 3 frames keeps
  // the inertia close to the user's actual final motion without amplifying
  // a stale earlier peak.
  const VEL_SAMPLES = 3;
  const FLICK_SCALE = 0.7;
  const velY = [], velX = [];

  renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

  renderer.domElement.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    leftDown = true;
    leftDragging = false;
    dragMoved = false;
    leftStart = { x: e.clientX, y: e.clientY };
    prev = { x: e.clientX, y: e.clientY };
    velY.length = 0; velX.length = 0;
    // Cancel any in-flight flick-inertia from a prior release.
    gb.userData._flickActive = false;
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (leftDown) {
      const distX = e.clientX - leftStart.x;
      const distY = e.clientY - leftStart.y;
      if (!leftDragging && Math.hypot(distX, distY) > 4) {
        leftDragging = true;
        dragMoved = true;
        autoRotate = false;
      }
      if (leftDragging) {
        const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
        const dragDY = dx * DRAG_SENS_Y;
        const dragDX = dy * DRAG_SENS_X;
        targetRot.y += dragDY;
        targetRot.x += dragDX;
        targetRot.x = Math.max(-PITCH_CLAMP, Math.min(PITCH_CLAMP, targetRot.x));
        // Record this frame's delta into the rolling buffer.
        velY.push(dragDY); if (velY.length > VEL_SAMPLES) velY.shift();
        velX.push(dragDX); if (velX.length > VEL_SAMPLES) velX.shift();
        prev = { x: e.clientX, y: e.clientY };
        return;
      }
    }
    updateHover(e.clientX, e.clientY);
    if (!autoRotate) {
      const r = renderer.domElement.getBoundingClientRect();
      const mx = (e.clientX - r.left) / r.width - 0.5;
      const my = (e.clientY - r.top) / r.height - 0.5;
      gb.userData.nudgeY = mx * 0.08;
      gb.userData.nudgeX = my * 0.06;
    }
  });
  // Flick-inertia state — advanced inside animate() so it stays in lockstep
  // with the rotation lerp (no two-rAF interleaving jitter).
  gb.userData._flickY = 0;
  gb.userData._flickX = 0;

  window.addEventListener('pointerup', (e) => {
    if (e.button !== 0 || !leftDown) return;
    leftDown = false;
    if (!leftDragging) {
      if (e.pointerType === 'mouse') raycast(e.clientX, e.clientY);
      return;
    }
    leftDragging = false;
    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const flickY = avg(velY) * FLICK_SCALE;
    const flickX = avg(velX) * FLICK_SCALE;
    velY.length = 0; velX.length = 0;
    // Skip inertia for slow / stationary releases — it lands cleanly.
    if (Math.abs(flickY) < 0.0008 && Math.abs(flickX) < 0.0008) {
      gb.userData._flickY = 0;
      gb.userData._flickX = 0;
      return;
    }
    gb.userData._flickY = flickY;
    gb.userData._flickX = flickX;
  });

  // Touch
  let touchStartX = 0, touchStartY = 0, touchRotating = false;
  renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY;
    touchRotating = false;
    prev = { x: touchStartX, y: touchStartY };
  }, { passive: true });
  renderer.domElement.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartX;
    const dy = e.touches[0].clientY - touchStartY;
    if (!touchRotating && Math.abs(dx) > 15 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      touchRotating = true; autoRotate = false;
    }
    if (touchRotating) {
      e.preventDefault();
      targetRot.y += (e.touches[0].clientX - prev.x) * 0.008;
      prev = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: false });
  renderer.domElement.addEventListener('touchend', (e) => {
    if (!touchRotating) {
      const t = e.changedTouches[0];
      if (Math.abs(t.clientX - touchStartX) < 10 && Math.abs(t.clientY - touchStartY) < 10)
        raycast(t.clientX, t.clientY);
    }
    touchRotating = false;
  });

  // Keyboard — arrows + Enter/Escape (and z/x alts) drive menu nav silently.
  const KEY_ACTIONS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    Enter: 'a', z: 'a', Escape: 'b', x: 'b',
  };
  window.addEventListener('keydown', (e) => {
    if (!isVisible || screen === 'insert') return;
    const action = KEY_ACTIONS[e.key];
    if (!action) return;
    e.preventDefault();
    pressButton(action, false);
    if (window._gbFlashLetter) window._gbFlashLetter(action);
  });

  // Mouse wheel navigation — disabled during gameplay and on the insert screen
  const WHEEL_BLOCKED = new Set(['insert', 'snake', 'breakout', 'frogger']);
  renderer.domElement.addEventListener('wheel', (e) => {
    if (WHEEL_BLOCKED.has(screen)) return;
    e.preventDefault();
    if (e.deltaY > 0) pressButton('down', false);
    else if (e.deltaY < 0) pressButton('up', false);
  }, { passive: false });

  // ========== ANIMATION ==========
  let t = 0, isVisible = true, lastTime = 0, lastBlink = 0;
  let rafId = null;
  function scheduleFrame() {
    if (rafId === null) rafId = requestAnimationFrame(animate);
  }
  function animate(now) {
    rafId = null;
    // Skip work entirely when tab is backgrounded or gameboy is off-screen.
    // Re-scheduling stops, so RAF overhead drops to zero until wakeUp().
    if (document.hidden || !isVisible) { lastTime = now; return; }
    scheduleFrame();
    const dt = Math.min((now - (lastTime || now)) / 1000, 0.05); // cap at 50ms
    lastTime = now;
    t += dt;
    // Cheap rolling FPS for the DEV MODE option
    gb.userData.fps = Math.round(1 / Math.max(0.001, dt));
    // Keep optView redrawing while on it (animated options like Credits/Link/Battery)
    if (screen === 'optView') { drawScreen(); }
    if (screen === 'insert') {
      // Only redraw on blink change (2x/sec)
      const blink = Math.floor(now / 500);
      if (blink !== lastBlink) { lastBlink = blink; drawScreen(); }
    }
    else if (screen === 'snake' && snakeAlive && snakeStarted) {
      snakeTickTimer += dt;
      if (snakeTickTimer >= snakeSpeed) {
        snakeTickTimer = 0;
        snakeTick();
        drawScreen();
      }
    }
    else if (screen === 'breakout' && brk.alive && brk.started) {
      brkTick();
      drawScreen();
    }
    else if (screen === 'frogger' && frog.alive && frog.started) {
      frogTick(dt);
      drawScreen();
    }
    else if (screen === 'boot') {
      bootTimer += dt; drawScreen();
      const bootEnd = (activeCart && cartridges[activeCart].autoStart) ? 4.0 : 4.6;
      if (bootTimer > bootEnd) {
        if (activeCart && cartridges[activeCart].autoStart) {
          // Game carts boot straight into play; other carts (portfolio) land in the menu.
          screen = activeCart;
        } else {
          screen = 'menu';
        }
        drawScreen();
        // Settle LED to its steady "powered on" intensity after boot pulse ends
        const lmDone = parts['body-light'];
        if (lmDone) {
          lmDone.material.emissiveIntensity = 1.0;
          if (lmDone.userData.ledGlow) lmDone.userData.ledGlow.intensity = 0.1;
        }
      }
    }
    // Power LED — authentic to real Nintendo hardware: solid red when the
    // cart is in, gradually dims over a long idle period to fake battery
    // drain. Any interaction resets to full brightness.
    if (cartInserted) {
      const lm = parts['body-light'];
      if (lm && lastInteraction > 0) {
        const idleSec = (now - lastInteraction) / 1000;
        // Full brightness for first 30s, then slow fade to 0.45 over ~3 min
        const fade = Math.max(0, Math.min(1, (idleSec - 30) / 180));
        lm.material.emissiveIntensity = 1.0 - fade * 0.55;
        if (lm.userData.ledGlow) lm.userData.ledGlow.intensity = 0.1 * (1 - fade * 0.6);
      }
    }

    // Smooth push offset with lerp
    const targetPush = gb.userData.pushOffset || 0;
    gb.userData.currentPush = (gb.userData.currentPush || 0) + (targetPush - (gb.userData.currentPush || 0)) * 0.25;
    gb.position.y = Math.sin(t * 0.8) * 0.3 + gb.userData.currentPush;

    if (autoRotate) targetRot.y += 0.003;
    // Decay nudge offset
    gb.userData.nudgeX = (gb.userData.nudgeX || 0) * 0.85;
    gb.userData.nudgeY = (gb.userData.nudgeY || 0) * 0.85;
    // Flick-inertia advanced in-loop so it stays in phase with rotation.
    if (!leftDragging && (gb.userData._flickY || gb.userData._flickX)) {
      gb.userData._flickY *= 0.92;
      gb.userData._flickX *= 0.92;
      targetRot.y += gb.userData._flickY;
      targetRot.x += gb.userData._flickX;
      targetRot.x = Math.max(-PITCH_CLAMP, Math.min(PITCH_CLAMP, targetRot.x));
      if (Math.abs(gb.userData._flickY) < 0.0003) gb.userData._flickY = 0;
      if (Math.abs(gb.userData._flickX) < 0.0003) gb.userData._flickX = 0;
    }

    // Single follow lerp regardless of state — no abrupt rate change at
    // release, no "catch-up" jolt. During drag the buffer is small (one
    // frame's pointer delta) so it still feels responsive.
    gb.rotation.y += (targetRot.y + (gb.userData.nudgeY || 0) - gb.rotation.y) * 0.22;
    gb.rotation.x += (targetRot.x + (gb.userData.nudgeX || 0) - gb.rotation.x) * 0.24;
    camera.position.z += (targetCamZ - camera.position.z) * 0.03;

    // Screen sleep after 8s of no interaction. The DVD screensaver stage is
    // skipped on the insert screen so the "insert cartridge" prompt remains
    // readable; the dim-off state still applies. Options views are always
    // live-updating (battery, credits, link cable) — don't dim them.
    if (screen !== 'boot' && screen !== 'optView' && lastInteraction > 0) {
      const idle = now - lastInteraction;
      if (!screenOff && idle > 8000) {
        screenOff = true;
        if (parts.screen) {
          parts.screen.material.emissiveIntensity = 0;
          parts.screen.material.color.set(0x222222);
        }
      }
      if (!screenSaver && screen !== 'insert' && idle > 13000) {
        screenSaver = true;
        if (parts.screen) {
          parts.screen.material.emissiveIntensity = 0.4;
          parts.screen.material.color.set(0x111111);
        }
      }
    }
    // DVD screensaver — bouncing photo
    if (screenSaver && parts.screen) {
      const sctx = sCtx, sw = SCR_W, sh = SCR_H;
      sctx.save();
      sctx.translate(0, sh);
      sctx.scale(1, -1);
      sctx.fillStyle = '#000';
      sctx.fillRect(0, 0, sw, sh);

      const imgW = 75, imgH = 75;
      // Match the screen content area (same bezels as drawScreen)
      const ssBzH = 45, ssBzV = 50, ssBzBottom = 58, ssShift = 15;
      const ssAreaX = ssBzH;
      const ssAreaY = ssBzV - ssShift;
      const ssAreaW = sw - ssBzH * 2 - imgW;
      const ssAreaH = sh - ssBzV - ssBzBottom - imgH;
      ssX += ssDx * dt;
      ssY += ssDy * dt;
      if (ssX <= 0 || ssX >= 1) { ssDx *= -1; ssX = Math.max(0, Math.min(1, ssX)); ssHue = (ssHue + 60) % 360; }
      if (ssY <= 0 || ssY >= 1) { ssDy *= -1; ssY = Math.max(0, Math.min(1, ssY)); ssHue = (ssHue + 60) % 360; }

      const drawX = ssAreaX + ssX * ssAreaW;
      const drawY = ssAreaY + ssY * ssAreaH;

      if (aboutPhotos.photo) {
        // Draw image cropped to square + monochrome + hue tint
        const img = aboutPhotos.photo;
        const cropSize = Math.min(img.width, img.height);
        const sx = (img.width - cropSize) / 2;
        const sy = (img.height - cropSize) / 2;
        sctx.drawImage(img, sx, sy, cropSize, cropSize, drawX, drawY, imgW, imgH);
        // Desaturate with grayscale overlay
        sctx.globalCompositeOperation = 'saturation';
        sctx.fillStyle = '#888';
        sctx.fillRect(drawX, drawY, imgW, imgH);
        // Apply hue tint
        sctx.globalCompositeOperation = 'multiply';
        sctx.fillStyle = `hsl(${ssHue}, 70%, 60%)`;
        sctx.fillRect(drawX, drawY, imgW, imgH);
        sctx.globalCompositeOperation = 'source-over';
      } else {
        sctx.fillStyle = '#fff';
        sctx.font = 'bold 8px "Press Start 2P", monospace';
        sctx.textAlign = 'center';
        sctx.fillText('LG', drawX + imgW / 2, drawY + imgH / 2 + 3);
      }

      sctx.restore();
      screenTex.needsUpdate = true;
    }
    renderer.render(scene, camera);
  }

  // ========== VISIBILITY & RESIZE ==========
  function wakeUp() { lastTime = performance.now(); scheduleFrame(); }
  const visObs = new IntersectionObserver((e) => {
    isVisible = e[0].isIntersecting;
    if (isVisible) wakeUp();
  }, { threshold: 0.05 });
  visObs.observe(container);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) wakeUp();
  });
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);
  lastInteraction = performance.now();
  drawScreen();
  scheduleFrame();

  // Expose cart swap for HTML UI
  window.gbSelectCartridge = selectCartridge;
  window.gbSetMuted = (m) => { soundMuted = !!m; };
  window.gbIsMuted = () => soundMuted;
  window.gbEjectCartridge = function() {
    if (!cartInserted) {
      // Already ejected — still signal so any HTML lockout can release.
      window.dispatchEvent(new Event('gb-ejected'));
      return;
    }
    const cart = parts.casette;
    if (!cart) {
      window.dispatchEvent(new Event('gb-ejected'));
      return;
    }
    initAudio();
    autoRotate = false;
    // Spin to the back-facing orientation first so the cart slide-out is
    // visible, THEN run the eject animation. Inject small randomness so
    // the flip reads hand-held rather than servo-perfect.
    const curY = targetRot.y;
    const twoPi = Math.PI * 2;
    const backBase = Math.round((curY - Math.PI) / twoPi) * twoPi + Math.PI;
    const yJitter = (Math.random() - 0.5) * 0.28;
    const xJitter = (Math.random() - 0.5) * 0.14;
    const overshoot = (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.12);
    const backY = backBase + yJitter;
    const baseTargetX = targetRot.x || 0;
    targetRot.y = backY + overshoot;
    targetRot.x = baseTargetX + xJitter;
    setTimeout(() => {
      targetRot.y = backY;
      targetRot.x = baseTargetX + xJitter * 0.3;
    }, 260);

    function doEject() {
      sfx.cartOut();
      targetCamZ = 180;
      const baseY = cart.userData.baseY;
      const ejectY = baseY + 160;
      const ejectStart = performance.now();
      const ejectDur = 1000;
      setLedInactive();
      screen = 'insert'; cartInserted = false; activeCart = null;
      scroll = 0; detailCursor = 0; cursor = 0; projScreen = false; trophyScreen = false;
      drawScreen();
      const ejectIdx = interactiveObjs.findIndex(o => o.userData.action === 'ejectCart');
      if (ejectIdx !== -1) { const e = interactiveObjs[ejectIdx]; if (e.parent) e.parent.remove(e); interactiveObjs.splice(ejectIdx, 1); }
      function ejectAnim(now) {
        const elapsed = now - ejectStart;
        if (elapsed < ejectDur) {
          cart.position.y = baseY + (ejectY - baseY) * (elapsed / ejectDur) * (elapsed / ejectDur);
          requestAnimationFrame(ejectAnim);
        } else {
          cart.visible = false; cart.position.y = baseY; autoRotate = true;
          if (!interactiveObjs.find(o => o.userData.action === 'insertCart')) {
            const cBox = new THREE.Box3().setFromObject(cart);
            const cSize = cBox.getSize(new THREE.Vector3());
            const cCenter = cBox.getCenter(new THREE.Vector3());
            const newSlot = new THREE.Mesh(
              new THREE.BoxGeometry(cSize.x * 2, cSize.y * 1.5, 0.5),
              new THREE.MeshBasicMaterial({ visible: false })
            );
            newSlot.position.set(cCenter.x, cCenter.y, cCenter.z - cSize.z * 0.5);
            newSlot.userData.action = 'insertCart';
            gb.children[0].add(newSlot);
            interactiveObjs.push(newSlot);
          }
          // Dispatch only when the slide-out animation has fully completed
          // so HTML-side lockouts release exactly when the cart is gone.
          window.dispatchEvent(new Event('gb-ejected'));
        }
      }
      requestAnimationFrame(ejectAnim);
    }

    // Wait until gb.rotation.y lands near the back target, then eject.
    const spinStart = performance.now();
    const maxSpinWait = 1600;
    function waitForBack(now) {
      const delta = Math.abs(((gb.rotation.y - backY) % twoPi + twoPi + Math.PI) % twoPi - Math.PI);
      if (delta < 0.12 || (now - spinStart) > maxSpinWait) {
        doEject();
      } else {
        requestAnimationFrame(waitForBack);
      }
    }
    requestAnimationFrame(waitForBack);
  };
})();
