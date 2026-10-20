/* Background canvas: a drifting network topology. Nodes link to neighbours
   within range, and to the cursor. Pauses when the tab is hidden and draws a
   single still frame under prefers-reduced-motion. */

(function () {
  "use strict";

  var canvas = document.querySelector(".net");
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  var LINK = 140;        // max distance for node-to-node links
  var CURSOR_LINK = 190; // max distance for node-to-cursor links

  var dpr = 1;
  var width = 0;
  var height = 0;
  var nodes = [];
  var mouse = { x: -9999, y: -9999 };
  var frame = null;

  function makeNode() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.3 + 0.7,
      hot: Math.random() < 0.07 // a few highlighted "hosts"
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Density scales with area, capped so phones stay cheap.
    var target = Math.round(Math.min(105, (width * height) / 15500));
    if (width < 640) target = Math.min(target, 38);

    while (nodes.length < target) nodes.push(makeNode());
    nodes.length = target;
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = width + 20;
      if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      if (n.y > height + 20) n.y = -20;

      // Gentle pull toward the cursor.
      var dx = mouse.x - n.x;
      var dy = mouse.y - n.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < CURSOR_LINK * CURSOR_LINK && d2 > 1) {
        n.x += dx * 0.0025;
        n.y += dy * 0.0025;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;

    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];

      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          ctx.strokeStyle = "rgba(0, 240, 168, " + ((1 - d / LINK) * 0.28).toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      var mx = a.x - mouse.x;
      var my = a.y - mouse.y;
      var md = Math.sqrt(mx * mx + my * my);
      if (md < CURSOR_LINK) {
        ctx.strokeStyle = "rgba(34, 211, 238, " + ((1 - md / CURSOR_LINK) * 0.55).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      if (n.hot) {
        ctx.fillStyle = "rgba(139, 92, 246, 0.95)";
        ctx.shadowColor = "rgba(139, 92, 246, 0.9)";
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = "rgba(0, 240, 168, 0.75)";
        ctx.shadowBlur = 0;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.hot ? n.r + 0.9 : n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  function loop() {
    step();
    draw();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (reduced || frame) return;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      resize();
      if (reduced) draw();
    }, 150);
  });

  if (finePointer && !reduced) {
    window.addEventListener("pointermove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });
    document.addEventListener("pointerleave", function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  resize();
  if (reduced) draw();
  else start();
})();
