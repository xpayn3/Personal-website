// ========== INTERACTIVE 3D GAMEBOY — ABOUT PAGE ==========
(function () {
  const container = document.getElementById('gameboyContainer');
  if (!container) return;

  // === RETRO SOUND ENGINE (Web Audio API) ===
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  function playTone(freq, dur, type, vol) {
    if (!audioCtx) return;
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

  const sfx = {
    navigate: () => playTone(800, 0.06, 'square', 0.06),
    select: () => {
      playTone(600, 0.08, 'square', 0.07);
      setTimeout(() => playTone(900, 0.1, 'square', 0.07), 60);
    },
    back: () => {
      playTone(500, 0.08, 'square', 0.06);
      setTimeout(() => playTone(350, 0.1, 'square', 0.06), 60);
    },
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

      // Latch click
      setTimeout(() => playTone(2000, 0.015, 'square', 0.08), 300);
    },
    cartOut: () => {
      if (!audioCtx) return;
      // Latch release click
      playTone(1800, 0.02, 'square', 0.08);
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
      // Victory-style startup fanfare
      const melody = [
        [392, 0.12], [392, 0.12], [392, 0.12], [523, 0.3],  // G G G C
        [466, 0.12], [523, 0.12], [587, 0.12], [784, 0.4],   // Bb C D G
      ];
      let t = 0;
      melody.forEach(([f, d]) => {
        setTimeout(() => playTone(f, d + 0.05, 'square', 0.06), t * 1000);
        t += d + 0.02;
      });
      // Bass chord underneath
      setTimeout(() => playTone(131, 0.8, 'triangle', 0.08), 200);
      setTimeout(() => playTone(196, 0.6, 'triangle', 0.06), 600);
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

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
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
      topColor: { value: new THREE.Color(0x334466) },
      midColor: { value: new THREE.Color(0x1a1a2e) },
      bottomColor: { value: new THREE.Color(0x0a0a12) },
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

  // Cinematic teal & orange — movie color grading
  scene.add(new THREE.AmbientLight(0x0a0a14, 0.1));

  // Key — warm orange/amber from top-right (the "sun" side)
  const key = new THREE.DirectionalLight(0xffcc88, 1.2);
  key.position.set(20, 40, 40);
  scene.add(key);

  // Fill — cool teal from the shadow side
  const fill = new THREE.DirectionalLight(0x446688, 0.3);
  fill.position.set(-40, 0, 30);
  scene.add(fill);

  // Rim — strong teal edge from behind-left
  const rim = new THREE.DirectionalLight(0x335566, 1.1);
  rim.position.set(-30, 10, -40);
  scene.add(rim);

  // Second rim — warm amber edge from behind-right
  const rim2 = new THREE.DirectionalLight(0xcc7733, 0.4);
  rim2.position.set(25, 8, -35);
  scene.add(rim2);

  // Top kicker — cool overhead for subtle highlights
  const topL = new THREE.DirectionalLight(0x8899aa, 0.15);
  topL.position.set(0, 60, 10);
  scene.add(topL);

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

    gb.add(model);

    // Remove skeleton loader
    const skel = document.getElementById('gbSkeleton');
    if (skel) skel.remove();

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

    // Body: apply full texture set
    const bodyMesh = parts['body-body'];
    if (bodyMesh) {
      const tl = new THREE.TextureLoader();
      const baseT = tl.load('gameboy/body_Base_Color.webp');
      const normT = tl.load('gameboy/body_Normal.webp');
      const roughT = tl.load('gameboy/body_Roughness.webp');
      const metalT = tl.load('gameboy/body_Metallic.webp');
      const aoT = tl.load('gameboy/body_Mixed_AO.webp');
      const bumpT = tl.load('gameboy/body_Height.webp');
      [baseT, normT, roughT, metalT, aoT, bumpT].forEach(t => { t.flipY = false; });
      baseT.encoding = THREE.sRGBEncoding;

      bodyMesh.material = new THREE.MeshStandardMaterial({
        map: baseT,
        normalMap: normT,
        roughnessMap: roughT,
        metalnessMap: metalT,
        aoMap: aoT,
        bumpMap: bumpT,
        bumpScale: 0.3,
        roughness: 1,
        metalness: 1,
        envMap: envCam.renderTarget.texture,
        envMapIntensity: 0.4,
      });
    }

    // Light: red emissive
    const lightMesh = parts['body-light'];
    if (lightMesh) {
      lightMesh.material = new THREE.MeshPhysicalMaterial({
        color: 0x440000,
        emissive: 0x110000,
        emissiveIntensity: 0.2,
        roughness: 0.1,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        transparent: true,
        opacity: 0.85,
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

    // Glass: GLTF loads tex_0 + add roughness map
    if (parts.glass) {
      const glassMat = parts.glass.material;
      glassMat.transparent = true;
      glassMat.depthWrite = false;
      const glassRough = new THREE.TextureLoader().load('gameboy/screen_Roughness.webp');
      glassRough.flipY = false;
      glassMat.roughnessMap = glassRough;
      glassMat.roughness = 1;
      glassMat.needsUpdate = true;
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
      menuItems: ['ABOUT ME', 'STATS', 'LOADOUT', 'ALLIES', 'TROPHIES', 'PING ME', 'QUESTS'],
    },
    snake: {
      label: 'SNAKE',
      header: 'SNAKE',
      menuItems: ['SNAKE'],
      autoStart: true,
    },
    breakout: {
      label: 'BREAKOUT',
      header: 'BREAKOUT',
      menuItems: ['BREAKOUT'],
      autoStart: true,
    },
    frogger: {
      label: 'FROGGER',
      header: 'FROGGER',
      menuItems: ['FROGGER'],
      autoStart: true,
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
  };

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
      if (activeCart === 'snake') {
        ctx.fillStyle = '#000';
        ctx.fillRect(cx, cy, cw, ch + 30);
        const snakeGreen = '#33dd33';

        if (elapsed < 800) {
          // Phase 1: Grid lines appear
          const t = elapsed / 800;
          ctx.strokeStyle = `rgba(51,221,51,${t * 0.15})`;
          ctx.lineWidth = 1;
          for (let gx = cx; gx < cx + cw; gx += 12) { ctx.beginPath(); ctx.moveTo(gx, cy); ctx.lineTo(gx, cy + ch); ctx.stroke(); }
          for (let gy = cy; gy < cy + ch; gy += 12) { ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx + cw, gy); ctx.stroke(); }
        } else if (elapsed < 2400) {
          // Phase 2: Snake slithers across screen
          ctx.strokeStyle = 'rgba(51,221,51,0.15)';
          ctx.lineWidth = 1;
          for (let gx = cx; gx < cx + cw; gx += 12) { ctx.beginPath(); ctx.moveTo(gx, cy); ctx.lineTo(gx, cy + ch); ctx.stroke(); }
          for (let gy = cy; gy < cy + ch; gy += 12) { ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx + cw, gy); ctx.stroke(); }

          const st = (elapsed - 800) / 1600;
          const segSize = 10;
          const segs = 12;
          for (let i = 0; i < segs; i++) {
            const progress = Math.max(0, Math.min(1, st * 2 - i * 0.06));
            const sx = cx + progress * (cw + segs * segSize) - i * segSize;
            const sy = midY + Math.sin((progress * 8 + i * 0.5)) * 20;
            ctx.fillStyle = i === 0 ? '#44ff44' : snakeGreen;
            ctx.fillRect(sx, sy - segSize / 2, segSize - 1, segSize - 1);
          }
          // Food dots
          ctx.fillStyle = '#ff4444';
          for (let f = 0; f < 5; f++) {
            const fx = cx + 30 + f * (cw / 5);
            const fy = midY + Math.sin(f * 2.1) * 25;
            if (st * (cw + segs * segSize) > fx - cx) continue;
            ctx.fillRect(fx - 3, fy - 3, 6, 6);
          }
        } else if (elapsed < 3200) {
          // Phase 3: Title reveal
          const t = (elapsed - 2400) / 800;
          ctx.fillStyle = snakeGreen;
          ctx.font = 'bold 18px "Press Start 2P", monospace';
          ctx.globalAlpha = Math.min(1, t * 2);
          ctx.fillText('SNAKE', midX, midY - 8);
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#88ff88';
          ctx.fillText('PRESS A TO START', midX, midY + 20);
          ctx.globalAlpha = 1;
        } else {
          // Phase 4: Hold title + loading
          ctx.fillStyle = snakeGreen;
          ctx.font = 'bold 18px "Press Start 2P", monospace';
          ctx.fillText('SNAKE', midX, midY - 8);
          ctx.font = '7px "Press Start 2P", monospace';
          ctx.fillStyle = '#88ff88';
          if (Math.floor(elapsed / 400) % 2) ctx.fillText('PRESS A TO START', midX, midY + 20);
          // Loading dots
          const dots = Math.floor((elapsed - 3200) / 200) % 4;
          ctx.fillStyle = snakeGreen;
          ctx.fillText('.'.repeat(dots), midX, midY + 40);
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
      // === PORTFOLIO BOOT (original) ===
      else {
      // Dark phases get black bg, light phases get normal bg
      if (elapsed < 1600) {
        ctx.fillStyle = '#000';
        ctx.fillRect(cx, cy, cw, ch + 30);
      }

      // Phase 1: Black screen power on (0-400ms)
      if (elapsed < 400) {
        ctx.fillStyle = '#000';
        ctx.fillRect(cx, cy, cw, ch);
        const scanY = cy + (ch * elapsed / 400);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(cx, scanY - 2, cw, 4);
      }
      // Phase 2: Logo diamond sparkle (400-1600ms)
      else if (elapsed < 1600) {
        ctx.fillStyle = '#000';
        ctx.fillRect(cx, cy, cw, ch);
        const t = (elapsed - 400) / 1200;
        const size = t * 30;
        const colors = ['#ff4444', '#ffaa00', '#44dd44', '#4488ff', '#aa44ff'];
        for (let c = colors.length - 1; c >= 0; c--) {
          const s = size * (1 - c * 0.15);
          if (s <= 0) continue;
          ctx.fillStyle = colors[c];
          ctx.beginPath();
          ctx.moveTo(midX, midY - s);
          ctx.lineTo(midX + s * 0.4, midY);
          ctx.lineTo(midX, midY + s);
          ctx.lineTo(midX - s * 0.4, midY);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = '#fff';
        const core = size * 0.2;
        ctx.fillRect(midX - core / 2, midY - core / 2, core, core);
        if (t > 0.3) {
          ctx.lineWidth = 2;
          const rayLen = size * 1.5 * Math.min(1, (t - 0.3) / 0.4);
          for (let a = 0; a < 8; a++) {
            ctx.strokeStyle = colors[a % colors.length];
            const angle = a * Math.PI / 4;
            ctx.beginPath();
            ctx.moveTo(midX + Math.cos(angle) * core, midY + Math.sin(angle) * core);
            ctx.lineTo(midX + Math.cos(angle) * rayLen, midY + Math.sin(angle) * rayLen);
            ctx.stroke();
          }
        }
      }
      // Phase 3: Flash to white, then logo appears (1600-2200ms)
      else if (elapsed < 2200) {
        const t = (elapsed - 1600) / 600;
        if (t < 0.25) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(cx, cy, cw, ch);
        } else {
          const fade = (t - 0.25) / 0.75;
          ctx.fillStyle = C.bg;
          ctx.fillRect(cx, cy, cw, ch);
          ctx.globalAlpha = fade;
          drawRainbow(activeCart ? cartridges[activeCart].label : 'PORTFOLIO', midX, midY - 4, 'bold 14px "Press Start 2P", monospace');
          ctx.globalAlpha = 1;
        }
      }
      // Phase 4: Logo + typing + loading bar together (2200-4600ms)
      else {
        drawRainbow(activeCart ? cartridges[activeCart].label : 'PORTFOLIO', midX, midY - 4, 'bold 14px "Press Start 2P", monospace');

        const phaseElapsed = elapsed - 2200;
        const phaseDur = 2400;

        // Typing
        const typeT = Math.min(1, phaseElapsed / 1600);
        const fullText = currentHeader;
        const chars = Math.floor(typeT * fullText.length);
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = C.dark;
        ctx.fillText('by', midX, midY + 14);
        ctx.fillStyle = C.ink;
        ctx.fillText(fullText.substring(0, chars), midX, midY + 26);

        // Cursor blink
        if (chars < fullText.length && Math.floor(Date.now() / 120) % 2 === 0) {
          const tw = ctx.measureText(fullText.substring(0, chars)).width;
          ctx.fillRect(midX + tw / 2 + 1, midY + 18, 4, 8);
        }

        // Loading bar
        const barW = cw * 0.5;
        const barH = 5;
        const barX = midX - barW / 2;
        const barY = midY + 40;
        ctx.strokeStyle = C.dark;
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);
        const loadT = Math.min(1, phaseElapsed / phaseDur);
        const blocks = Math.floor(loadT * 12);
        const blockW = barW / 12;
        ctx.fillStyle = C.ink;
        for (let b = 0; b < blocks; b++) {
          ctx.fillRect(barX + b * blockW + 1, barY + 1, blockW - 2, barH - 2);
        }

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = C.dark;
        ctx.fillText('LOADING...', midX, barY + 16);
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
        const hint = (item === 'QUESTS' || item === 'TROPHIES') ? 'A=VIEW  B=BACK  \u25B2\u25BC' : 'B=BACK  \u25C0\u25B6=PREV/NEXT';
        ctx.fillText(hint, cx + 8, cy + ch + 8);
      }
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
  // Reusable: select and insert a cartridge by ID
  function selectCartridge(cartId) {
    if (screen !== 'insert') return;
    activeCart = cartId;
    currentMenuItems = cartridges[cartId].menuItems;
    currentHeader = cartridges[cartId].header;
    // Wake screen if sleeping, then insert
    if (screenOff) {
      screenOff = false;
      screenSaver = false;
      if (parts.screen) {
        parts.screen.material.emissiveIntensity = 1.0;
        parts.screen.material.color.set(0xffffff);
      }
    }
    lastInteraction = performance.now();
    pressButton('a');
  }

  function pressButton(action) {
    initAudio();
    lastInteraction = performance.now();
    if (screenOff) {
      // Wake up screen
      screenOff = false;
      screenSaver = false;
      if (parts.screen) {
        parts.screen.material.emissiveIntensity = 1.0;
        parts.screen.material.color.set(0xffffff);
      }
      drawScreen();
      return; // consume this press just to wake up
    }
    // Play appropriate sound
    if (action === 'up' || action === 'down' || action === 'left' || action === 'right') sfx.navigate();
    else if (action === 'a') sfx.select();
    else if (action === 'b') sfx.back();

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
            if (activeCart === 'snake') sfx.bootSnake();
            else if (activeCart === 'breakout') sfx.bootBreakout();
            else if (activeCart === 'frogger') sfx.bootFrogger();
            else sfx.boot();
            targetCamZ = 130;
            const lm0 = parts['body-light'];
            if (lm0) {
              lm0.material.color.set(0xff1a1a);
              lm0.material.emissive.set(0xff0000);
              lm0.material.emissiveIntensity = 1.0;
              lm0.material.needsUpdate = true;
              if (lm0.userData.ledGlow) lm0.userData.ledGlow.intensity = 0.1;
            }
          }, 800);
          // Quick dip after 200ms delay
          setTimeout(() => {
            gb.userData.pushOffset = -1.2;
            setTimeout(() => { gb.userData.pushOffset = -0.5; }, 80);
            setTimeout(() => { gb.userData.pushOffset = 0; }, 160);
          }, 200);
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
        if (currentMenuItems[cursor] === 'SNAKE') {
          lcdFlash(() => { screen = 'snake'; snakeStarted = false; snakeAlive = false; });
        } else if (currentMenuItems[cursor] === 'BREAKOUT') {
          lcdFlash(() => { screen = 'breakout'; brk.started = false; brk.alive = false; });
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
        } else if (action === 'b') {
          lcdFlash(() => { screen = 'menu'; projScreen = false; trophyScreen = false; });
        }
        else if (action === 'left') { lcdFlash(() => { cursor = (cursor - 1 + currentMenuItems.length) % currentMenuItems.length; scroll = 0; detailCursor = 0; projScreen = false; trophyScreen = false; }); }
        else if (action === 'right') { lcdFlash(() => { cursor = (cursor + 1) % currentMenuItems.length; scroll = 0; detailCursor = 0; projScreen = false; trophyScreen = false; }); }
      }
    } else if (screen === 'snake') {
      if (!snakeStarted) {
        if (action === 'a') snakeReset();
        else if (action === 'b') lcdFlash(() => { screen = 'menu'; });
      } else if (!snakeAlive) {
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
      if (!brk.started) {
        if (action === 'a') brkReset();
        else if (action === 'b') lcdFlash(() => { screen = 'menu'; });
      } else if (!brk.alive) {
        if (action === 'a') brkReset();
        else if (action === 'b') lcdFlash(() => { screen = 'menu'; });
      } else {
        if (action === 'left') brkPadX = Math.max(0.1, brkPadX - 0.08);
        else if (action === 'right') brkPadX = Math.min(0.9, brkPadX + 0.08);
      }
    } else if (screen === 'frogger') {
      if (!frog.started) {
        if (action === 'a') frogReset();
        else if (action === 'b') lcdFlash(() => { screen = 'menu'; });
      } else if (!frog.alive) {
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
      // Wake from screensaver/dim on any interaction
      screenOff = false; screenSaver = false; lastInteraction = performance.now();
      if (parts.screen) { parts.screen.material.emissiveIntensity = 1.0; parts.screen.material.color.set(0xffffff); }


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

        // Turn off LED
        const lm = parts['body-light'];
        if (lm) {
          lm.material.color.set(0x330000);
          lm.material.emissive.set(0x000000);
          lm.material.emissiveIntensity = 0;
          lm.material.needsUpdate = true;
          if (lm.userData.ledGlow) lm.userData.ledGlow.intensity = 0;
        }

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
          sfx.boot();
          targetCamZ = 130;
          const lm1 = parts['body-light'];
          if (lm1) {
            lm1.material.color.set(0xff1a1a);
            lm1.material.emissive.set(0xff0000);
            lm1.material.emissiveIntensity = 1.0;
            lm1.material.needsUpdate = true;
            if (lm1.userData.ledGlow) lm1.userData.ledGlow.intensity = 0.1;
          }
        }, 800);
        // Quick dip
        setTimeout(() => {
          gb.userData.pushOffset = -1.2;
          setTimeout(() => { gb.userData.pushOffset = -0.5; }, 80);
          setTimeout(() => { gb.userData.pushOffset = 0; }, 160);
        }, 200);

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

            // Physical reaction — GB pushes down as cart slides in

            // Snap jolt when cart seats (last 10% of slide)

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
    let btn = hit && hit.material && hit.material.visible !== false ? hit :
              hit && hit.userData.isJoystick && parts.joystick ? parts.joystick :
              hit && (hit.userData.action === 'ejectCart' || hit.userData.action === 'insertCart') && parts.casette && parts.casette.visible ? parts.casette : null;
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

  renderer.domElement.addEventListener('pointerdown', (e) => {
    isDragging = true; dragMoved = false;
    prev = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isDragging) {
      updateHover(e.clientX, e.clientY);
      // Subtle tilt toward mouse position (only when not auto-rotating)
      if (!autoRotate) {
        const r = renderer.domElement.getBoundingClientRect();
        const mx = (e.clientX - r.left) / r.width - 0.5;
        const my = (e.clientY - r.top) / r.height - 0.5;
        gb.userData.nudgeY = mx * 0.08;
        gb.userData.nudgeX = my * 0.06;
      }
      return;
    }
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    targetRot.y += dx * 0.008;
    targetRot.x += dy * 0.004;
    targetRot.x = Math.max(-0.6, Math.min(0.6, targetRot.x));
    prev = { x: e.clientX, y: e.clientY };
    autoRotate = false;
  });
  window.addEventListener('pointerup', (e) => {
    if (isDragging && !dragMoved && e.pointerType === 'mouse') raycast(e.clientX, e.clientY);
    isDragging = false;
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

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (!isVisible || screen === 'insert') return;
    if (e.key === 'ArrowUp') { e.preventDefault(); pressButton('up'); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); pressButton('down'); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); pressButton('left'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); pressButton('right'); }
    else if (e.key === 'Enter' || e.key === 'z') { e.preventDefault(); pressButton('a'); }
    else if (e.key === 'Escape' || e.key === 'x') { e.preventDefault(); pressButton('b'); }
  });

  // Mouse wheel navigation
  renderer.domElement.addEventListener('wheel', (e) => {
    if (screen === 'insert' || screen === 'snake' || screen === 'breakout' || screen === 'frogger') return;
    e.preventDefault();
    if (e.deltaY > 0) pressButton('down');
    else if (e.deltaY < 0) pressButton('up');
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
          screen = activeCart === 'snake' ? 'snake' : activeCart === 'frogger' ? 'frogger' : 'breakout';
        } else {
          screen = 'menu';
        }
        drawScreen();
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
    gb.rotation.y += (targetRot.y + (gb.userData.nudgeY || 0) - gb.rotation.y) * 0.06;
    gb.rotation.x += (targetRot.x + (gb.userData.nudgeX || 0) - gb.rotation.x) * 0.06;
    camera.position.z += (targetCamZ - camera.position.z) * 0.03;

    // Screen sleep after 6s of no interaction
    if (screen !== 'boot' && lastInteraction > 0) {
      const idle = now - lastInteraction;
      if (!screenOff && idle > 8000) {
        screenOff = true;
        if (parts.screen) {
          parts.screen.material.emissiveIntensity = 0;
          parts.screen.material.color.set(0x222222);
        }
      }
      if (!screenSaver && idle > 13000) {
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
  window.gbEjectCartridge = function() {
    if (!cartInserted) return;
    const cart = parts.casette;
    if (!cart) return;
    initAudio();
    sfx.cartOut();
    targetCamZ = 180;
    const baseY = cart.userData.baseY;
    const ejectY = baseY + 160;
    const ejectStart = performance.now();
    const ejectDur = 1000;
    const lm = parts['body-light'];
    if (lm) { lm.material.color.set(0x330000); lm.material.emissive.set(0x000000); lm.material.emissiveIntensity = 0; lm.material.needsUpdate = true; if (lm.userData.ledGlow) lm.userData.ledGlow.intensity = 0; }
    screen = 'insert'; cartInserted = false; activeCart = null;
    scroll = 0; detailCursor = 0; cursor = 0; projScreen = false; trophyScreen = false;
    drawScreen();
    window.dispatchEvent(new Event('gb-ejected'));
    // Remove eject hit zone
    const ejectIdx = interactiveObjs.findIndex(o => o.userData.action === 'ejectCart');
    if (ejectIdx !== -1) { const e = interactiveObjs[ejectIdx]; if (e.parent) e.parent.remove(e); interactiveObjs.splice(ejectIdx, 1); }
    function ejectAnim(now) {
      const elapsed = now - ejectStart;
      if (elapsed < ejectDur) {
        cart.position.y = baseY + (ejectY - baseY) * (elapsed / ejectDur) * (elapsed / ejectDur);
        requestAnimationFrame(ejectAnim);
      } else {
        cart.visible = false; cart.position.y = baseY; autoRotate = true;
        // Recreate insert slot hit zone
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
      }
    }
    requestAnimationFrame(ejectAnim);
  };
})();
