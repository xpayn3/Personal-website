/* ===================================================================
   demo-shim.js — loaded first by the hosted demo (apps/meshoptimiser/demo/).

   The app is a web page that talks to a small local server for three
   things: a heartbeat, STEP conversion, and the inbox/ folder. On the site
   there is no server, so this file answers those requests itself:
     - /api/alive         404, so the app leaves the heartbeat alone
     - /api/convert       501 with a plain explanation of what the demo opens
     - /api/job, cancel   404
   and opens a sample model (inbox/GearboxAssy.glb by default; the note has a picker
   for the others, all from Khronos's glTF-Sample-Models) the first time the
   demo is opened in a tab. A small note at the top says where it is running
   and links to the download. Nothing is uploaded: the files stay in the page.
   =================================================================== */
(function () {
  'use strict';
  window.__MESHOPT_DEMO = true;

  var STEP_NOTE = 'STEP files are read by the full app, which runs on your computer. This demo opens GLB, glTF, FBX, OBJ, 3MF and STL files, and the sample model.';
  var json = function (status, body) { return new Response(JSON.stringify(body), { status: status, headers: { 'Content-Type': 'application/json' } }); };

  var SAMPLES = [
    ['GearboxAssy', 'Gearbox assembly'],
    ['2CylinderEngine', 'Two-cylinder engine'],
    ['ReciprocatingSaw', 'Reciprocating saw']
  ];

  var realFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var path = new URL(url, location.href).pathname;
      if (/\/api\/convert$/.test(path)) return Promise.resolve(json(501, { error: STEP_NOTE }));
      if (/\/api\/(alive|job\/|cancel\/|quit)/.test(path)) return Promise.resolve(json(404, { error: 'demo' }));
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

  // the note
  if (!top) return;
  document.addEventListener('DOMContentLoaded', function () {
    try { if (sessionStorage.getItem('meshopt-demo-note') === 'gone') return; } catch (_) {}
    var bar = document.createElement('div');
    bar.setAttribute('role', 'note');
    bar.style.cssText = 'position:fixed;left:50%;top:6px;transform:translate(-50%,-14px);opacity:0;transition:transform .6s cubic-bezier(.2,.8,.2,1),opacity .4s ease;z-index:2147483000;display:flex;align-items:center;gap:14px;max-width:calc(100vw - 24px);height:32px;padding:0 4px 0 12px;border-radius:10px;background:#161616;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09),0 14px 36px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.4);color:#a8a8a8;font:400 12.5px/1 Inter,system-ui,sans-serif;white-space:nowrap';
    bar.innerHTML =
      '<span style="display:inline-flex;align-items:center;gap:8px;color:#e9e9e9;letter-spacing:.09em;font:400 10.5px/1 ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase">Demo</span>' +
      '<span style="width:1px;height:14px;background:rgba(255,255,255,.12)"></span>' +
      '<span style="overflow:hidden;text-overflow:ellipsis">Runs in your browser. Nothing is uploaded.</span>' +
      '<select aria-label="Open a sample model" style="height:24px;max-width:170px;padding:0 6px;border-radius:6px;border:0;background:#262626;color:#e9e9e9;font:400 12px/1 Inter,system-ui,sans-serif;box-shadow:inset 0 0 0 1px rgba(255,255,255,.09)"><option value="">Samples</option>' + SAMPLES.map(function (m) { return '<option value="' + m[0] + '">' + m[1] + '</option>'; }).join('') + '</select>' +
      '<a href="../download.html" style="display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:6px;background:#0d99ff;color:#fff;font-weight:500;text-decoration:none">Get the full app</a>' +
      '<button type="button" aria-label="Hide this note" style="all:unset;cursor:pointer;display:grid;place-items:center;width:24px;height:24px;border-radius:6px;color:#7d7d7d;"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true" style="display:block"><path d="M1.5 1.5l7 7M8.5 1.5l-7 7"/></svg></button>';
    bar.querySelector('select').addEventListener('change', function (e) {
      if (!e.target.value) return;
      var p = new URLSearchParams(location.search);
      p.set('file', 'inbox/' + e.target.value + '.glb');
      location.search = p.toString();
    });
    bar.querySelector('button').addEventListener('click', function () { bar.remove(); try { sessionStorage.setItem('meshopt-demo-note', 'gone'); } catch (_) {} });
    document.body.appendChild(bar);
    // it drifts down into place a moment after the app has drawn its first frame
    var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm) bar.style.transition = 'none';
    setTimeout(function () { bar.style.opacity = '1'; bar.style.transform = 'translate(-50%,0)'; }, calm ? 0 : 1200);
  });
})();
