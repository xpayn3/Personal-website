/* ===================================================================
   cursor.js — home page reticle.
   Replaces the mouse pointer with a hairline crosshair (which opens up
   and snaps corner brackets on, target-lock style, over anything
   clickable) and a tiny
   coordinate readout beside it (page position + a map reference that
   drifts around Ljubljana). Mouse only: touch and pen keep their
   native behaviour. Styles live in home.css (.reticle).
   =================================================================== */
(function () {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  // Ljubljana; the pointer nudges the last decimals
  var LAT = 46.0569, LON = 14.5058;
  var INTERACTIVE = 'a, button, input, textarea, select, label, .media-cell, .lightbox-strip-item';

  var el = document.createElement('div');
  el.className = 'reticle';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<i class="reticle-cross"></i><i class="reticle-lock"></i><span class="reticle-read"></span>';
  var read = el.lastChild;
  document.body.appendChild(el);
  document.body.classList.add('has-reticle');

  function pad(n) { return String(Math.max(0, Math.round(n))).padStart(4, '0'); }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var x = e.clientX, y = e.clientY;
    el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
    read.textContent =
      'X ' + pad(x) + '\n' +
      'Y ' + pad(y + window.scrollY) + '\n' +
      (LAT - (y + window.scrollY) * 1e-5).toFixed(5) + 'N\n' +
      (LON + x * 1e-5).toFixed(5) + 'E';
    el.classList.add('is-on');
    el.classList.toggle('is-link', !!(e.target.closest && e.target.closest(INTERACTIVE)));
  }, { passive: true });

  window.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') el.classList.add('is-down'); });
  window.addEventListener('pointerup', function () { el.classList.remove('is-down'); });
  document.documentElement.addEventListener('mouseleave', function () { el.classList.remove('is-on'); });
  window.addEventListener('blur', function () { el.classList.remove('is-on', 'is-down'); });
})();
