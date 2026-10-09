/* ===================================================================
   demo-shim.js — loaded first by the hosted demo (apps/meshoptimiser/demo/).

   The app is a web page that talks to a small local server for three
   things: a heartbeat, STEP conversion, and the inbox/ folder. On the site
   there is no server, so this file answers those requests itself:
     - /api/alive         404, so the app leaves the heartbeat alone
     - /api/convert       501 with a plain explanation of what the demo opens
     - /api/job, cancel   404
   and opens the sample model (inbox/GearboxAssy.glb) the first time the
   demo is opened in a tab. A small note at the top says where it is running
   and links to the download. Nothing is uploaded: the files stay in the page.
   =================================================================== */
(function () {
  'use strict';
  window.__MESHOPT_DEMO = true;

  var STEP_NOTE = 'STEP files are read by the full app, which runs on your computer. This demo opens GLB, glTF, FBX, OBJ, 3MF and STL files, and the sample model.';
  var json = function (status, body) { return new Response(JSON.stringify(body), { status: status, headers: { 'Content-Type': 'application/json' } }); };

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
    bar.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:12px;max-width:calc(100vw - 24px);padding:7px 8px 7px 14px;border-radius:999px;background:rgba(22,22,22,.92);box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);color:#bdbdbd;font:400 12px/1.3 Inter,system-ui,sans-serif;white-space:nowrap';
    bar.innerHTML = '<span style="overflow:hidden;text-overflow:ellipsis">Demo. It runs in your browser and nothing is uploaded.</span>' +
      '<a href="../download.html" style="color:#fff;background:#0d99ff;border-radius:999px;padding:5px 12px;text-decoration:none">Get the full app</a>' +
      '<button type="button" aria-label="Hide this note" style="all:unset;cursor:pointer;color:#8a8a8a;padding:2px 8px;font-size:16px;line-height:1">\u00d7</button>';
    bar.querySelector('button').addEventListener('click', function () { bar.remove(); try { sessionStorage.setItem('meshopt-demo-note', 'gone'); } catch (_) {} });
    document.body.appendChild(bar);
  });
})();
