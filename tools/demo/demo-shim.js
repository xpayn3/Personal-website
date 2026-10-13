/* ===================================================================
   demo-shim.js — loaded first by the hosted demo (apps/meshoptimiser/demo/).

   The app is a web page that talks to a small local server for three
   things: a heartbeat, STEP conversion, and the inbox/ folder. On the site
   there is no server, so this file answers those requests itself:
     - /api/alive         404, so the app leaves the heartbeat alone
     - /api/convert       501 with a plain explanation of what the demo opens
     - /api/job, cancel   404
   and opens the sample model (inbox/GearboxAssy.glb) the first time the
   demo is opened in a tab. Nothing is uploaded: the files stay in the page.
   =================================================================== */
(function () {
  'use strict';
  window.__MESHOPT_DEMO = true;

  var STEP_NOTE = 'STEP files are read by the full app, which runs on your computer. The online version opens GLB, glTF, FBX, OBJ, 3MF and STL files, and the sample model.';
  var json = function (status, body) { return new Response(JSON.stringify(body), { status: status, headers: { 'Content-Type': 'application/json' } }); };

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var path = new URL(url, location.href).pathname;
      if (/\/api\/convert$/.test(path)) return Promise.resolve(json(501, { error: STEP_NOTE }));
      if (/\/api\/(alive|job\/|cancel\/|quit)/.test(path)) return Promise.resolve(json(404, { error: 'online' }));
    } catch (_) { /* fall through to the real fetch */ }
    return realFetch(input, init);
  };

  // the first time this tab opens the demo, open the sample model (the app removes ?file= again once it has loaded it)
  var top = window.top === window;
  var q = new URLSearchParams(location.search);
  if (top && !q.has('file') && !q.has('tab') && !q.has('selftest') && !q.has('safe')) {
    try {
      if (!sessionStorage.getItem('meshopt-demo-sample')) {
        sessionStorage.setItem('meshopt-demo-sample', '1');
        q.set('file', 'inbox/GearboxAssy.glb');
        history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
      }
    } catch (_) { /* storage blocked: the demo opens on the start screen */ }
  }

  // a small "Lite" mark beside the logo,
  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('btn-brand');
    if (btn) {
      var tag = document.createElement('span');
      tag.textContent = 'Lite';
      tag.title = 'The light version, in your browser. The full app runs on your computer.';
      tag.style.cssText = 'align-self:center;margin-left:2px;padding:0 6px;height:16px;display:inline-flex;align-items:center;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);color:#a8a8a8;font:400 9.5px/1 ui-monospace,Menlo,Consolas,monospace;letter-spacing:.09em;text-transform:uppercase;pointer-events:none;user-select:none';
      btn.parentNode.insertBefore(tag, btn.nextSibling);
    }
  });
})();
