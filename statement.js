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
  // A round lens follows the pointer across the word. Inside it is a second
  // set of the word's letters, drawn about twice the size around the point
  // under the pointer, the way a magnifying glass shows them. They are also
  // bent like glass bends them (barrel distortion): each letter is placed and
  // stretched by pushing its edges through the lens's curve, so letters are
  // biggest in the middle and get squeezed and curved in towards the rim.
  // The word itself underneath is not touched. On touch screens (a tap) and
  // with the switch on, the lens rests on the middle of the word.
  var zoom = line.querySelector('.pw-zoom');
  if (zoom && zoom.querySelector('i')) {
    var glyphs = [].slice.call(zoom.querySelectorAll('i'));
    var lens = document.createElement('span');
    lens.className = 'pw-lens';
    lens.setAttribute('aria-hidden', 'true');
    var copies = glyphs.map(function (g) {
      var copy = document.createElement('span');
      copy.textContent = g.textContent;
      lens.appendChild(copy);
      return copy;
    });
    zoom.appendChild(lens);

    var POWER = 2.1;                      // magnification at the centre of the lens
    var BEND = 0.12;                      // how strongly the picture curves in towards the rim
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var boxes = [], radius = 1, reach = 1, edge = 0, mid = [0, 0];
    var at = [0, 0], goal = [0, 0];       // where the lens is, and where it is heading
    var amount = 0, wanted = 0;           // how far "on" it is, 0 to 1
    var hovering = false, frame = 0;

    var measure = function () {
      radius = lens.offsetWidth / 2 || 1;
      edge = lens.clientLeft;                               // its border: the copies sit inside it
      reach = 0.36 * parseFloat(getComputedStyle(zoom).fontSize);   // half a letter's visible height
      boxes = glyphs.map(function (g, i) {
        var w = g.offsetWidth, h = g.offsetHeight;
        copies[i].style.width = w + 'px';
        copies[i].style.height = h + 'px';
        copies[i].style.lineHeight = h + 'px';
        return { x: g.offsetLeft + w / 2, y: g.offsetTop + h / 2, w: w, h: h };
      });
      mid = [zoom.offsetWidth / 2, zoom.offsetHeight / 2];
    };
    var held = function () { return zoom.classList.contains('is-on') || line.classList.contains('is-live'); };

    // Where a point of the word shows up through the lens.
    var through = function (px, py) {
      var dx = px - at[0], dy = py - at[1];
      var r = Math.sqrt(dx * dx + dy * dy);
      if (r < 0.001) return [at[0], at[1]];
      var u = POWER * r / radius;                           // magnified, in lens radii
      var bent = u < 1.6 ? u * (1 - BEND * u * u) : 1.11 + (u - 1.6) * 0.5;   // past 1 it is outside the glass
      var k = bent * radius / r;
      return [at[0] + dx * k, at[1] + dy * k];
    };

    var draw = function () {
      var left = at[0] - radius + edge, top = at[1] - radius + edge;
      boxes.forEach(function (b, i) {
        var l = through(b.x - b.w / 2, b.y), r = through(b.x + b.w / 2, b.y);
        var t = through(b.x, b.y - reach), d = through(b.x, b.y + reach);
        var cx = (l[0] + r[0]) / 2, cy = (t[1] + d[1]) / 2;
        var sx = (r[0] - l[0]) / b.w, sy = (d[1] - t[1]) / (2 * reach);
        copies[i].style.transform = 'translate(' + (cx - b.w / 2 - left).toFixed(2) + 'px,' + (cy - b.h / 2 - top).toFixed(2) + 'px) ' +
          'scale(' + sx.toFixed(3) + ',' + sy.toFixed(3) + ')';
      });
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
