// ========== INTERACTIVE 3D GAMEBOY — ABOUT PAGE ==========
(function () {
  const container = document.getElementById('gameboyContainer');
  if (!container) return;

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

  // Studio lighting — cinematic product setup
  scene.add(new THREE.AmbientLight(0xfff5ee, 0.3));

  // Key — warm, slightly above-right
  const key = new THREE.DirectionalLight(0xffeedd, 1.5);
  key.position.set(25, 45, 35);
  scene.add(key);

  // Fill — cool blue, opposite side, softer
  const fill = new THREE.DirectionalLight(0xdde8ff, 0.4);
  fill.position.set(-35, 10, 30);
  scene.add(fill);

  // Rim — strong cool edge from behind for separation
  const rim = new THREE.DirectionalLight(0x99bbff, 0.9);
  rim.position.set(-20, 25, -35);
  scene.add(rim);

  // Top softbox
  const topL = new THREE.DirectionalLight(0xffffff, 0.25);
  topL.position.set(0, 60, 5);
  scene.add(topL);

  // Warm bounce from below
  const bounce = new THREE.PointLight(0xffddaa, 0.15, 80);
  bounce.position.set(0, -30, 20);
  scene.add(bounce);

  // Subtle colored accent from the side
  const accent = new THREE.PointLight(0xff8844, 0.1, 60);
  accent.position.set(40, 0, 10);
  scene.add(accent);

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

  let glowMat = null;
  let interactiveObjs = [];

  // Named mesh references
  const parts = {};

  // === LOAD GLTF ===
  const loader = new THREE.GLTFLoader();
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
    console.log('Parts found:', Object.keys(parts).join(', '));

    gb.add(model);

    // Get scaled bounds
    const sBox = new THREE.Box3().setFromObject(model);
    const sSize = sBox.getSize(new THREE.Vector3());
    console.log('Model size:', sSize.x.toFixed(1), sSize.y.toFixed(1), sSize.z.toFixed(1));

    // === SCREEN: canvas UI, renders behind the glass ===
    if (parts.screen) {
      screenTex.flipY = true;
      screenTex.encoding = THREE.sRGBEncoding;
      screenTex.needsUpdate = true;
      parts.screen.material = new THREE.MeshBasicMaterial({ map: screenTex });
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
      [baseT, normT, roughT, metalT, aoT].forEach(t => { t.flipY = false; });
      baseT.encoding = THREE.sRGBEncoding;

      bodyMesh.material = new THREE.MeshStandardMaterial({
        map: baseT,
        normalMap: normT,
        roughnessMap: roughT,
        metalnessMap: metalT,
        aoMap: aoT,
        roughness: 1,
        metalness: 1,
      });
    }

    // Glass: GLTF loads tex_0.png which now has Pikachu + baked alpha
    if (parts.glass) {
      const glassMat = parts.glass.material;
      glassMat.transparent = true;
      glassMat.depthWrite = false;
      glassMat.needsUpdate = true;
      parts.glass.renderOrder = 1;

      // Toggle glass visibility with G key
      window.addEventListener('keydown', (e) => {
        if (e.key === 'g' || e.key === 'G') {
          parts.glass.visible = !parts.glass.visible;
          console.log('Glass visible:', parts.glass.visible);
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
        new THREE.BoxGeometry(cSize.x, cSize.y * 0.5, cSize.z * 2),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      slotHit.position.set(cCenter.x, cCenter.y + cSize.y * 0.6, cCenter.z);
      slotHit.userData.action = 'insertCart';
      model.add(slotHit);
      interactiveObjs.push(slotHit);

      // Minimal text hint on back
      const hintCvs = document.createElement('canvas');
      hintCvs.width = 256; hintCvs.height = 64;
      const hC = hintCvs.getContext('2d');
      hC.fillStyle = 'rgba(255,255,255,0.7)';
      hC.font = '18px monospace';
      hC.textAlign = 'center';
      hC.fillText('click to insert', 128, 28);
      hC.fillText('\u25BC', 128, 52);
      const hintTex = new THREE.CanvasTexture(hintCvs);
      const hint = new THREE.Mesh(
        new THREE.PlaneGeometry(cSize.x * 0.9, cSize.y * 0.25),
        new THREE.MeshBasicMaterial({ map: hintTex, transparent: true, side: THREE.DoubleSide })
      );
      hint.position.set(cCenter.x, cCenter.y + cSize.y * 0.3, cCenter.z - cSize.z * 0.6);
      hint.rotation.y = Math.PI;
      model.add(hint);

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

      // Get world position of joystick
      const worldPos = new THREE.Vector3();
      parts.joystick.getWorldPosition(worldPos);
      // Transform to gb group local space
      gb.worldToLocal(worldPos.clone());

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
  const C = { bg: '#9BBC0F', light: '#8BAC0F', dark: '#306230', ink: '#0F380F' };
  const menuItems = ['ABOUT', 'SKILLS', 'TOOLS', 'CLIENTS', 'AWARDS', 'CONTACT'];
  let screen = 'insert'; // starts waiting for cartridge
  let cursor = 0;
  let scroll = 0;
  let bootTimer = 0;
  let cartInserted = false;

  const details = {
    ABOUT: ['3D generalist &','UX graphic designer','','Ljubljana, Slovenia','','Crafting visual','experiences through','3D animation, motion','design & brand','strategy.','','Every project starts','with understanding','your vision.'],
    SKILLS: ['* 3D Animation','* Motion Graphics','* Product Viz','* Visual Identity','* Creative Dir.','* UX/UI Design','* Projection Map','* Social Content'],
    TOOLS: ['# Cinema 4D','# Houdini','# Redshift','# After Effects','# Photoshop','# Illustrator','# InDesign','# ZBrush','# Figma','# Resolume'],
    CLIENTS: ['Festival Grounded',"Athlete's Foot",'Cestel','Natureta','LargaVida','NewEdge Magazine','Kersnikova','Pritlicje','Studio ENKI'],
    AWARDS: ['WEBSI Prvak  2022','Netko        2022','Diggit Zlata 2022','Awwwards HM  2022','CSSDA 7xKudo 2022','CSSREEL 2xFD 2022','BestCSS 2xSD 2022','WEBSI Prvak  2021','Netko 2xFOTD 2021','Awwwards HM  2021','CSSDA 2xKudo 2021'],
    CONTACT: ['','Email:','luka.grcar@me.com','','Instagram:','@lukakluka','','Behance:','/lukagrcar'],
  };

  function drawScreen() {
    const ctx = sCtx, w = SCR_W, h = SCR_H;
    ctx.save();
    ctx.translate(0, h);
    ctx.scale(1, -1);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingEnabled = false;

    // Black bezel border (large margin so content stays inside glass window)
    const bz = 50;
    const bzBottom = 60;
    const shiftUp = 15;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, bz - shiftUp);
    ctx.fillRect(0, h - bzBottom - shiftUp, w, bzBottom + shiftUp);
    ctx.fillRect(0, 0, bz, h);
    ctx.fillRect(w - bz, 0, bz, h);

    // Content area inside bezel (shifted up, shorter)
    const cx = bz, cy = bz - shiftUp, cw = w - bz * 2, ch = h - bz - bzBottom - shiftUp;
    ctx.fillStyle = C.bg;
    ctx.fillRect(cx, cy, cw, ch);

    // Derive spacing from content height
    const headerH = 20;
    const hintH = 14;
    const menuItemH = Math.floor((ch - headerH - hintH - 10) / menuItems.length);
    const detailLineH = Math.floor((ch - headerH - hintH - 10) / 6);
    const detailVisible = Math.min(6, Math.floor((ch - headerH - hintH - 10) / detailLineH));

    if (screen === 'insert') {
      ctx.fillStyle = C.dark;
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO CARTRIDGE', cx + cw / 2, cy + ch / 2 - 16);
      ctx.fillStyle = C.ink;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('INSERT CART', cx + cw / 2, cy + ch / 2 + 4);
      ctx.fillText('TO PLAY', cx + cw / 2, cy + ch / 2 + 20);
      ctx.fillStyle = C.dark;
      ctx.font = '9px monospace';
      // Blinking arrow
      if (Math.floor(Date.now() / 500) % 2 === 0) {
        ctx.fillText('\u25BC \u25BC \u25BC', cx + cw / 2, cy + ch / 2 + 38);
      }
      ctx.textAlign = 'left';
    } else if (screen === 'boot') {
      ctx.textAlign = 'center';
      const now = Date.now();
      const elapsed = bootTimer * 1000;

      // Phase 1: Screen flicker on (0-300ms)
      if (elapsed < 300) {
        const flicker = Math.random() > 0.3;
        if (flicker) {
          ctx.fillStyle = C.bg;
          ctx.fillRect(cx, cy, cw, ch);
        } else {
          ctx.fillStyle = '#0F380F';
          ctx.fillRect(cx, cy, cw, ch);
        }
      }
      // Phase 2: Logo drops in with trail (300-1200ms)
      else if (elapsed < 1200) {
        const t = (elapsed - 300) / 900;
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const logoY = cy - 20 + (ch / 2 - 6 + 20) * ease;

        // Trail effect
        for (let i = 3; i >= 0; i--) {
          const trailY = logoY - i * 8;
          const alpha = (1 - i / 4) * ease;
          ctx.globalAlpha = alpha * 0.3;
          ctx.fillStyle = C.dark;
          ctx.font = 'bold 28px monospace';
          ctx.fillText('LUKA', cx + cw / 2, trailY);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.ink;
        ctx.font = 'bold 28px monospace';
        ctx.fillText('LUKA', cx + cw / 2, logoY);
      }
      // Phase 3: "PORTFOLIO" types in letter by letter (1200-2000ms)
      else if (elapsed < 2000) {
        ctx.fillStyle = C.ink;
        ctx.font = 'bold 28px monospace';
        ctx.fillText('LUKA', cx + cw / 2, cy + ch / 2 - 6);

        const typeT = (elapsed - 1200) / 800;
        const chars = Math.floor(typeT * 9);
        const text = 'PORTFOLIO'.substring(0, chars);
        ctx.font = '13px monospace';
        ctx.fillText(text, cx + cw / 2, cy + ch / 2 + 14);

        // Blinking cursor
        if (chars < 9 && Math.floor(now / 150) % 2 === 0) {
          const measured = ctx.measureText(text).width;
          ctx.fillRect(cx + cw / 2 + measured / 2 + 2, cy + ch / 2 + 5, 6, 10);
        }
      }
      // Phase 4: Full logo + loading bar (2000-3000ms)
      else {
        ctx.fillStyle = C.ink;
        ctx.font = 'bold 28px monospace';
        ctx.fillText('LUKA', cx + cw / 2, cy + ch / 2 - 6);
        ctx.font = '13px monospace';
        ctx.fillText('PORTFOLIO', cx + cw / 2, cy + ch / 2 + 14);

        // Loading bar
        const barW = cw * 0.6;
        const barH = 6;
        const barX = cx + (cw - barW) / 2;
        const barY = cy + ch / 2 + 32;
        ctx.fillStyle = C.dark;
        ctx.fillRect(barX, barY, barW, barH);
        const loadT = Math.min(1, (elapsed - 2000) / 1000);
        ctx.fillStyle = C.ink;
        ctx.fillRect(barX, barY, barW * loadT, barH);
      }
      ctx.textAlign = 'left';
    } else if (screen === 'menu') {
      ctx.textAlign = 'left';
      ctx.fillStyle = C.ink;
      ctx.font = 'bold 14px monospace';
      ctx.fillText('LUKA GRCAR', cx + 30, cy + 14);
      ctx.fillStyle = C.dark;
      ctx.fillRect(cx + 6, cy + headerH, cw - 12, 1);
      ctx.font = 'bold 13px monospace';
      for (let i = 0; i < menuItems.length; i++) {
        const y = cy + headerH + 6 + i * menuItemH + menuItemH * 0.7;
        if (i === cursor) {
          ctx.fillStyle = C.light;
          ctx.fillRect(cx + 6, y - menuItemH * 0.6, cw - 12, menuItemH * 0.85);
          ctx.fillStyle = C.ink;
          ctx.fillText('\u25B6', cx + 8, y);
        }
        ctx.fillStyle = C.ink;
        ctx.fillText(menuItems[i], cx + 24, y);
      }
      ctx.fillStyle = C.dark;
      ctx.font = '10px monospace';
      ctx.fillText('A=SELECT  \u25B2\u25BC=MOVE', cx + 20, cy + ch + 8);
    } else if (screen === 'detail') {
      ctx.textAlign = 'left';
      const item = menuItems[cursor];
      ctx.fillStyle = C.ink;
      ctx.font = 'bold 13px monospace';
      ctx.fillText('\u25C0 ' + item, cx + 6, cy + 14);
      ctx.fillStyle = C.dark;
      ctx.fillRect(cx + 6, cy + headerH, cw - 12, 1);
      ctx.font = '12px monospace';
      const lines = details[item] || [];
      for (let i = 0; i < detailVisible && (scroll + i) < lines.length; i++) {
        ctx.fillStyle = C.ink;
        ctx.fillText(lines[scroll + i], cx + 10, cy + headerH + 8 + i * detailLineH + detailLineH * 0.7);
      }
      ctx.font = '13px monospace';
      if (lines.length > detailVisible) {
        ctx.fillStyle = C.dark;
        if (scroll > 0) ctx.fillText('\u25B2', cx + cw - 14, cy + headerH + 10);
        if (scroll + detailVisible < lines.length) ctx.fillText('\u25BC', cx + cw - 14, cy + ch - hintH - 4);
      }
      ctx.fillStyle = C.dark;
      ctx.font = '9px monospace';
      ctx.fillText('B=BACK  \u25C0\u25B6=PREV/NEXT', cx + 8, cy + ch + 8);
    }
    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (let y = cy; y < cy + ch; y += 3) ctx.fillRect(cx, y, cw, 1);
    ctx.restore();
    screenTex.needsUpdate = true;
  }

  // ========== BUTTON ACTIONS ==========
  function pressButton(action) {
    if (screen === 'insert') return; // no input until cartridge inserted
    if (screen === 'boot') { screen = 'menu'; drawScreen(); return; }
    if (screen === 'menu') {
      if (action === 'up') cursor = (cursor - 1 + menuItems.length) % menuItems.length;
      else if (action === 'down') cursor = (cursor + 1) % menuItems.length;
      else if (action === 'a') { screen = 'detail'; scroll = 0; }
    } else if (screen === 'detail') {
      const lines = details[menuItems[cursor]] || [];
      if (action === 'up') scroll = Math.max(0, scroll - 1);
      else if (action === 'down') scroll = Math.min(Math.max(0, lines.length - 6), scroll + 1);
      else if (action === 'b') screen = 'menu';
      else if (action === 'left') { cursor = (cursor - 1 + menuItems.length) % menuItems.length; scroll = 0; }
      else if (action === 'right') { cursor = (cursor + 1) % menuItems.length; scroll = 0; }
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

      // Cartridge insert
      if (obj.userData.action === 'insertCart') {
        if (cartInserted) return true;
        cartInserted = true;
        autoRotate = false;

        const cart = parts.casette;
        if (!cart) return true;

        // Show cartridge far above, then slide it in from top of canvas
        const baseY = cart.userData.baseY;
        const startY = baseY + 80;
        cart.position.y = startY;
        cart.visible = true;

        const animStart = performance.now();
        const slideDur = 1400;  // slide in ms
        const pauseDur = 600;   // pause before rotate
        const totalDur = slideDur + pauseDur + 200;

        function cartAnim(now) {
          const elapsed = now - animStart;

          if (elapsed < slideDur) {
            // Slide in with easeOutBack
            const t = elapsed / slideDur;
            const c1 = 1.2;
            const ease = 1 + c1 * Math.pow(t - 1, 3) + Math.pow(t - 1, 2);
            cart.position.y = startY + (baseY - startY) * Math.min(1, ease);
            requestAnimationFrame(cartAnim);
          } else if (elapsed < slideDur + pauseDur) {
            cart.position.y = baseY;
            // Rotate to front
            if (elapsed >= slideDur + 100) {
              const frontY = Math.round(targetRot.y / (Math.PI * 2)) * Math.PI * 2;
              targetRot.y = frontY;
              targetRot.x = 0.1;
            }
            requestAnimationFrame(cartAnim);
          } else {
            cart.position.y = baseY;
            screen = 'boot';
            bootTimer = 0;
            drawScreen();
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

      // Body reaction — nudge the whole gameboy
      const nudge = 0.04;
      const action = obj.userData.action;
      const nudgeX = action === 'left' ? nudge : action === 'right' ? -nudge :
                     action === 'a' ? -nudge * 0.5 : action === 'b' ? nudge * 0.5 : 0;
      const nudgeY = action === 'up' ? -nudge : action === 'down' ? nudge : 0;
      targetRot.x += nudgeY;
      targetRot.y += nudgeX;

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
        if (!obj.userData.baseZ) obj.userData.baseZ = obj.position.z;
        clearTimeout(obj.userData.pressTimer);
        obj.position.z = obj.userData.baseZ - 0.3;
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

  renderer.domElement.addEventListener('pointerdown', (e) => {
    isDragging = true; dragMoved = false;
    prev = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    targetRot.y += dx * 0.008;
    targetRot.x += dy * 0.004;
    targetRot.x = Math.max(-0.6, Math.min(0.6, targetRot.x));
    prev = { x: e.clientX, y: e.clientY };
    autoRotate = false;
  });
  window.addEventListener('pointerup', (e) => {
    if (isDragging && !dragMoved) raycast(e.clientX, e.clientY);
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
    if (e.key === 'ArrowUp') pressButton('up');
    else if (e.key === 'ArrowDown') pressButton('down');
    else if (e.key === 'ArrowLeft') pressButton('left');
    else if (e.key === 'ArrowRight') pressButton('right');
    else if (e.key === 'Enter' || e.key === 'z') pressButton('a');
    else if (e.key === 'Escape' || e.key === 'x') pressButton('b');
  });

  // ========== ANIMATION ==========
  let t = 0, isVisible = true;
  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;
    t += 0.016;
    if (screen === 'insert') { drawScreen(); } // redraw for blinking arrows
    else if (screen === 'boot') { bootTimer += 0.016; drawScreen(); if (bootTimer > 3.2) { screen = 'menu'; drawScreen(); } }
    gb.position.y = Math.sin(t * 0.8) * 0.3;

    if (autoRotate) targetRot.y += 0.003;
    gb.rotation.y += (targetRot.y - gb.rotation.y) * 0.06;
    gb.rotation.x += (targetRot.x - gb.rotation.x) * 0.06;
    renderer.render(scene, camera);
  }

  // ========== VISIBILITY & RESIZE ==========
  const visObs = new IntersectionObserver((e) => { isVisible = e[0].isIntersecting; }, { threshold: 0.05 });
  visObs.observe(container);
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);
  drawScreen();
  animate();
})();
