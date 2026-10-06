/* ===================================================================
   statement.js — wires the playful words in the About page's opening
   line (look and per-word behaviour: statement.css).
   - words marked data-letters are split into letters that can move
   - the switch after "interaction" turns every word on at once
   - on touch screens a tap turns a word on or off (there is no hover)
   - the cube beside "3D" and the "rotate" tag can be dragged
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
})();
