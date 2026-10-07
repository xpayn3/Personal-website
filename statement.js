/* ===================================================================
   statement.js — wires the playful words in the About page's opening
   line (look and per-word behaviour: statement.css).
   - words marked data-letters are split into letters that can move
   - the switch after "interaction" turns every word on at once
   - on touch screens a tap turns a word on or off (there is no hover)
   - the cube beside "3D" and the "rotate" tag can be dragged
   - "legible" sits under a lens that follows the pointer and bends its letters
   =================================================================== */
(function () {
  var line = document.querySelector('.about-statement');
  if (!line) return;

  // ---- letters: drawn one by one, the whole word kept for screen readers
  line.querySelectorAll('[data-letters]').forEach(function (word) {
    var text = word.textContent;
    var whole = document.createElement('span');
    whole.className = 'pw-sr';
    whole.textContent = text;
    word.textContent = '';
    word.appendChild(whole);
    text.split('').forEach(function (ch, i) {
      var letter = document.createElement('i');
      letter.textContent = ch;
      letter.setAttribute('aria-hidden', 'true');
      letter.style.setProperty('--i', i);
      // where this letter is thrown when "complex" falls apart
      letter.style.setProperty('--x', ((i % 2 ? 1 : -1) * (0.04 + Math.random() * 0.14)).toFixed(3) + 'em');
      letter.style.setProperty('--y', ((Math.random() - 0.5) * 0.62).toFixed(3) + 'em');
      letter.style.setProperty('--r', ((Math.random() - 0.5) * 64).toFixed(1) + 'deg');
      word.appendChild(letter);
    });
  });

  // ---- the switch: everything on / off
  var toggle = line.querySelector('.pw-toggle');
  if (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var on = toggle.getAttribute('aria-checked') !== 'true';
      toggle.setAttribute('aria-checked', String(on));
      line.classList.toggle('is-live', on);
    });
  }

  // ---- touch screens: tap a word to turn it on, tap again to turn it off
  if (matchMedia('(hover: none)').matches) {
    line.querySelectorAll('.pw').forEach(function (word) {
      word.addEventListener('click', function () { word.classList.toggle('is-on'); });
    });
  }

  // ---- the cube: drag to spin; it goes back to turning by itself after a pause
  var cube = line.querySelector('.pw-cube');
  if (cube) {
    var rx = -24, ry = 32, last = null, resume = 0;
    cube.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      clearTimeout(resume);
      cube.setPointerCapture(e.pointerId);
      cube.classList.add('is-held');
      cube.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      last = [e.clientX, e.clientY];
    });
    cube.addEventListener('pointermove', function (e) {
      if (!last) return;
      ry += (e.clientX - last[0]) * 1.4;
      rx = Math.max(-80, Math.min(80, rx - (e.clientY - last[1]) * 1.4));
      last = [e.clientX, e.clientY];
      cube.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    var release = function () {
      if (!last) return;
      last = null;
      resume = setTimeout(function () {
        cube.classList.remove('is-held');
        cube.style.transform = '';
        rx = -24; ry = 32;
      }, 2200);
    };
    cube.addEventListener('pointerup', release);
    cube.addEventListener('pointercancel', release);
  }

  // ---- the "rotate" tag: grab it and turn it; let go and it springs back
  var tag = line.querySelector('.pw-rot');
  if (tag) {
    var start = null;
    var angleTo = function (e) {
      var box = tag.getBoundingClientRect();
      return Math.atan2(e.clientY - (box.top + box.height / 2), e.clientX - (box.left + box.width / 2)) * 180 / Math.PI;
    };
    tag.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      tag.setPointerCapture(e.pointerId);
      tag.classList.add('is-held');
      start = angleTo(e);
    });
    tag.addEventListener('pointermove', function (e) {
      if (start === null) return;
      tag.style.transform = 'rotate(' + (angleTo(e) - start).toFixed(1) + 'deg)';
    });
    var drop = function () {
      if (start === null) return;
      start = null;
      tag.classList.remove('is-held');
      tag.style.transform = '';
    };
    tag.addEventListener('pointerup', drop);
    tag.addEventListener('pointercancel', drop);
  }

  // ---- the lens: "legible" under a magnifying glass ------------------------
  // A round lens follows the pointer across the word. Inside it is a second,
  // enlarged copy of the word, placed so the point under the pointer sits at
  // the lens's centre. The glass itself is then simulated per pixel: a normal
  // map of a dome (drawn once on a canvas: red = how far the surface leans
  // sideways, green = how far it leans up or down) is fed to an SVG
  // displacement filter, which shifts every pixel of the enlarged copy by
  // what the map says. The middle of the dome is flat, so the centre is a
  // clean enlargement; the surface leans more and more towards the rim, so
  // the picture curves and crowds in there. (Red, green and blue can be bent
  // by slightly different amounts for a colour fringe at the rim; FRINGE is
  // 0, so they are not.)
  // What the glass magnifies is drawn as a screen seen up close: the enlarged
  // word is first broken into square pixels (a mosaic step at the start of
  // the same filter), so the letters come out blocky, as if zoomed far into a
  // display. There are no grid lines; only the letters' edges show it.
  // Where that filter is not dependable (Safari), each letter is instead
  // moved and stretched through the same kind of curve, which is coarser but
  // reads the same. The word itself underneath is never touched. On touch
  // screens (a tap) and with the switch on, the lens rests on the middle of
  // the word.
  var zoom = line.querySelector('.pw-zoom');
  if (zoom && zoom.querySelector('i')) {
    var glyphs = [].slice.call(zoom.querySelectorAll('i'));
    var lens = document.createElement('span');
    lens.className = 'pw-lens';
    lens.setAttribute('aria-hidden', 'true');
    var view = document.createElement('span');      // what the glass shows; the filter is applied to this
    view.className = 'pw-lens-view';
    var word = document.createElement('span');      // the enlarged copy of the word
    word.className = 'pw-lens-word';
    var copies = glyphs.map(function (g) {
      var copy = document.createElement('span');
      copy.textContent = g.textContent;
      word.appendChild(copy);
      return copy;
    });
    view.appendChild(word);
    lens.appendChild(view);
    zoom.appendChild(lens);

    var POWER = 2.4;                      // magnification at the centre of the lens
    var BEND = 0.12;                      // letter-by-letter fallback: how strongly the picture curves in towards the rim
    var DOME = 0.46;                      // filter: how far the rim pulls the picture in, as a share of the radius
    var FRINGE = 0;                       // filter: how differently red and blue bend (a colour fringe at the rim; off)
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ua = navigator.userAgent;
    var glass = !(/Safari\//.test(ua) && !/Chrom(e|ium)\//.test(ua)) && !!document.createElementNS;
    var boxes = [], radius = 1, reach = 1, edge = 0, mid = [0, 0], mapSize = 0;
    var at = [0, 0], goal = [0, 0];       // where the lens is, and where it is heading
    var amount = 0, wanted = 0;           // how far "on" it is, 0 to 1
    var hovering = false, frame = 0;

    // ---- the glass: a normal map of a dome, and the filter that applies it
    var SVG = 'http://www.w3.org/2000/svg';
    var mapImages = [], bends = [], mosaic = null, cell = 0, gridAt = [NaN, NaN];
    if (glass) {
      var svg = document.createElementNS(SVG, 'svg');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
      var filter = document.createElementNS(SVG, 'filter');
      filter.setAttribute('id', 'pw-lens-glass');
      filter.setAttribute('color-interpolation-filters', 'sRGB');
      filter.setAttribute('x', '0'); filter.setAttribute('y', '0');
      filter.setAttribute('width', '100%'); filter.setAttribute('height', '100%');
      var add = function (name, attrs) {
        var node = document.createElementNS(SVG, name);
        for (var k in attrs) node.setAttribute(k, attrs[k]);
        filter.appendChild(node);
        return node;
      };
      // the screen's pixels: keep one sample per cell, then grow it to fill the cell
      mosaic = {
        dot: add('feFlood', { 'flood-color': '#000', result: 'dot' }),
        cell: add('feComposite', { 'in': 'dot', in2: 'dot', operator: 'over', result: 'cell' }),
        tile: add('feTile', { 'in': 'cell', result: 'grid' }),
        pick: add('feComposite', { 'in': 'SourceGraphic', in2: 'grid', operator: 'in', result: 'samples' }),
        grow: add('feMorphology', { 'in': 'samples', operator: 'dilate', result: 'pixels' }),
      };
      mapImages.push(add('feImage', { result: 'map', x: 0, y: 0, preserveAspectRatio: 'none' }));
      // one bend per colour channel, each keeping only its own channel...
      [['r', '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'],
       ['g', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'],
       ['b', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0']].forEach(function (ch) {
        bends.push(add('feDisplacementMap', { 'in': 'pixels', in2: 'map', xChannelSelector: 'R', yChannelSelector: 'G', result: 'bent-' + ch[0] }));
        add('feColorMatrix', { 'in': 'bent-' + ch[0], type: 'matrix', values: ch[1], result: 'only-' + ch[0] });
      });
      // ...then added back together
      add('feComposite', { 'in': 'only-r', in2: 'only-g', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0, result: 'rg' });
      add('feComposite', { 'in': 'rg', in2: 'only-b', operator: 'arithmetic', k1: 0, k2: 1, k3: 1, k4: 0 });
      svg.appendChild(filter);
      document.body.appendChild(svg);
      lens.classList.add('is-glass');
    }
    // Draw the dome's normal map. The dome's height is a smooth bump that is
    // flat in the middle and steepest near the rim; each pixel stores which
    // way the surface leans there. The map covers the whole view, which is
    // twice the lens across so that pixels pulled in from beyond the rim have
    // something to come from; the dome sits in its middle and everything
    // around it is level (no shift).
    var drawMap = function (size) {
      var c = document.createElement('canvas');
      c.width = c.height = size;
      var g = c.getContext('2d');
      var img = g.createImageData(size, size), d = img.data;
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          var nx = ((x + 0.5) / size * 2 - 1) * 2, ny = ((y + 0.5) / size * 2 - 1) * 2;   // ±1 at the lens's rim
          var r = Math.sqrt(nx * nx + ny * ny), k = 0;
          if (r < 1 && r > 0) k = r * r * (1.35 - 0.35 * r) / r;       // lean: 0 in the middle, 1 at the rim
          var i = (y * size + x) * 4;
          d[i] = Math.round(128 + nx * k * 127);
          d[i + 1] = Math.round(128 + ny * k * 127);
          d[i + 2] = 128;
          d[i + 3] = 255;
        }
      }
      g.putImageData(img, 0, 0);
      return c.toDataURL('image/png');
    };

    var measure = function () {
      radius = lens.offsetWidth / 2 || 1;
      edge = lens.clientLeft;                               // its border: the copies sit inside it
      reach = 0.36 * parseFloat(getComputedStyle(zoom).fontSize);   // half a letter's visible height
      boxes = glyphs.map(function (g, i) {
        var w = g.offsetWidth, h = g.offsetHeight;
        copies[i].style.width = w + 'px';
        copies[i].style.height = h + 'px';
        copies[i].style.lineHeight = h + 'px';
        if (glass) { copies[i].style.left = g.offsetLeft + 'px'; copies[i].style.top = g.offsetTop + 'px'; }
        return { x: g.offsetLeft + w / 2, y: g.offsetTop + h / 2, w: w, h: h };
      });
      mid = [zoom.offsetWidth / 2, zoom.offsetHeight / 2];
      // one screen pixel, in css px: an odd number so a cell has a middle sample
      var px = Math.max(3, Math.round(parseFloat(getComputedStyle(zoom).fontSize) * 0.1));
      if (px % 2 === 0) px += 1;
      if (px !== cell) {
        cell = px;
        if (mosaic) {
          mosaic.dot.setAttribute('width', 1); mosaic.dot.setAttribute('height', 1);
          mosaic.cell.setAttribute('width', px); mosaic.cell.setAttribute('height', px);
          mosaic.grow.setAttribute('radius', (px - 1) / 2);
          gridAt = [NaN, NaN];                                // placed by draw()
        }
      }
      if (glass) {
        var size = Math.max(8, Math.round(view.offsetWidth));
        if (size !== mapSize) {                             // the type size changed: redraw the map to fit
          mapSize = size;
          var url = drawMap(size);
          mapImages.forEach(function (m) {
            m.setAttribute('width', size); m.setAttribute('height', size);
            m.setAttribute('href', url);
            m.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url);
          });
          var pull = radius * DOME * 2;                     // the filter moves a pixel by scale × (colour − ½)
          bends.forEach(function (b, n) { b.setAttribute('scale', (pull * (1 + (n - 1) * FRINGE)).toFixed(2)); });
        }
      }
    };
    var held = function () { return zoom.classList.contains('is-on') || line.classList.contains('is-live'); };

    // Fallback: where a point of the word shows up through the lens.
    var through = function (px, py) {
      var dx = px - at[0], dy = py - at[1];
      var r = Math.sqrt(dx * dx + dy * dy);
      if (r < 0.001) return [at[0], at[1]];
      var u = POWER * r / radius;                           // magnified, in lens radii
      var bent = u < 1.6 ? u * (1 - BEND * u * u) : 1.11 + (u - 1.6) * 0.5;   // past 1 it is outside the glass
      var k = bent * radius / r;
      return [at[0] + dx * k, at[1] + dy * k];
    };

    // The pixels belong to the screen being looked at, not to the glass: their
    // grid is anchored to the enlarged word, so each letter keeps the same
    // blocky shape as the lens moves over it instead of shimmering. `ox`,
    // `oy` is where the word's origin sits in the view; the grid starts there
    // (wrapped to one cell).
    var placeGrid = function (ox, oy) {
      if (!cell || !mosaic) return;
      var gx = ((ox % cell) + cell) % cell, gy = ((oy % cell) + cell) % cell;
      gx = Math.round(gx * 2) / 2; gy = Math.round(gy * 2) / 2;
      if (gx === gridAt[0] && gy === gridAt[1]) return;
      gridAt = [gx, gy];
      var half = (cell - 1) / 2;
      // The first cell must lie inside the picture (a cell that starts off
      // its edge has no sample and the whole view comes out empty); tiling
      // repeats it in every direction from there, so the edges are covered.
      mosaic.cell.setAttribute('x', gx); mosaic.cell.setAttribute('y', gy);
      mosaic.dot.setAttribute('x', gx + half); mosaic.dot.setAttribute('y', gy + half);
    };
    var draw = function () {
      if (glass) {
        // one move for the whole enlarged word: the point under the pointer goes to the lens's centre
        var c = view.offsetWidth / 2;                       // the view is centred on the lens
        var ox = c - at[0] * POWER, oy = c - at[1] * POWER;
        word.style.transform = 'translate(' + ox.toFixed(2) + 'px,' + oy.toFixed(2) + 'px) scale(' + POWER + ')';
        placeGrid(ox, oy);
      } else {
        var left = at[0] - radius + edge, top = at[1] - radius + edge;
        boxes.forEach(function (b, i) {
          var l = through(b.x - b.w / 2, b.y), r = through(b.x + b.w / 2, b.y);
          var t = through(b.x, b.y - reach), d = through(b.x, b.y + reach);
          var cx = (l[0] + r[0]) / 2, cy = (t[1] + d[1]) / 2;
          var sx = (r[0] - l[0]) / b.w, sy = (d[1] - t[1]) / (2 * reach);
          copies[i].style.transform = 'translate(' + (cx - b.w / 2 - left).toFixed(2) + 'px,' + (cy - b.h / 2 - top).toFixed(2) + 'px) ' +
            'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
        });
      }
      lens.style.opacity = amount.toFixed(3);
      lens.style.transform = 'translate(' + (at[0] - radius).toFixed(2) + 'px,' + (at[1] - radius).toFixed(2) + 'px) ' +
        'scale(' + (0.6 + 0.4 * amount).toFixed(3) + ')';
    };
    var tick = function () {
      var ease = still ? 1 : 0.22;
      at[0] += (goal[0] - at[0]) * ease;
      at[1] += (goal[1] - at[1]) * ease;
      amount += (wanted - amount) * (still ? 1 : 0.16);
      var resting = Math.abs(goal[0] - at[0]) + Math.abs(goal[1] - at[1]) < 0.1 && Math.abs(wanted - amount) < 0.002;
      if (resting) { at = goal.slice(); amount = wanted; }
      draw();
      frame = resting ? 0 : requestAnimationFrame(tick);
    };
    var run = function () { if (!frame) frame = requestAnimationFrame(tick); };

    // Aim the lens: at the pointer while it is over the word, at the middle
    // of the word while a tap or the switch holds it on, otherwise away.
    var aim = function (e) {
      var wasOff = wanted === 0 && amount < 0.02;
      if (wasOff) measure();
      if (hovering && e) {
        var box = zoom.getBoundingClientRect();
        goal = [e.clientX - box.left, e.clientY - box.top];
        wanted = 1;
      } else if (held()) {
        goal = mid.slice();
        wanted = 1;
      } else if (!hovering) {
        wanted = 0;
      }
      if (wasOff && wanted) { at = goal.slice(); draw(); }  // appear in place rather than sliding in from a corner
      run();
    };
    zoom.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovering = true; aim(e); } });
    zoom.addEventListener('pointermove', function (e) { if (hovering) aim(e); });
    zoom.addEventListener('pointerleave', function () { hovering = false; aim(); });
    // a tap (is-on) or the switch (is-live) changes a class: follow it
    new MutationObserver(function () { if (!hovering) aim(); })
      .observe(zoom, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(function () { if (!hovering) aim(); })
      .observe(line, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('resize', function () { if (wanted) { measure(); if (!hovering) aim(); } });
  }
})();
