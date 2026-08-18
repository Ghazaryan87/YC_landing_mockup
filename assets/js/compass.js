/* ============================================================
   INTELLIGENT CORE — compass animation
   Ported from the temp_anim prototype and adapted for in-page use:
   scoped to .ic-stage, scaled off the stage box rather than the
   viewport, paused while off-screen, and wired to the pillar cards.
   ============================================================ */
(function () {
  'use strict';

  var stage = document.querySelector('[data-compass]');
  if (!stage) return;

  // ---------- Config ----------
  var PAL = ['#6774ff', '#5fdcf5'];          // accent gradient (primary, secondary)
  var AUTO_ROTATE = true;                    // sweep to next sector every DWELL seconds
  var DWELL = 5.0;                           // seconds per sector
  var HOVER_LABEL = 'EXPLORE WITH US';       // needle hover tooltip
  var PILLARS = [
    { n: '01', title: 'Agentic AI',         a: 0,   x: 960,  y: 90  },
    { n: '02', title: 'Observability',      a: 90,  x: 1560, y: 540 },
    { n: '03', title: 'Enterprise Systems', a: 180, x: 960,  y: 990 },
    { n: '04', title: 'Managed Operations', a: 270, x: 360,  y: 540 }
  ];
  var W = 1920, H = 1080, CX = 960, CY = 540;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Helpers ----------
  var NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  function outE(x) { return 1 - Math.pow(1 - x, 3); }
  function inoutE(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function hexRgb(h) { h = h.replace('#', ''); var n = parseInt(h, 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; }
  function rgba(c, a) { return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }
  function mix(c1, c2, k) { return 'rgb(' + Math.round(c1.r + (c2.r - c1.r) * k) + ',' + Math.round(c1.g + (c2.g - c1.g) * k) + ',' + Math.round(c1.b + (c2.b - c1.b) * k) + ')'; }
  function dirX(a) { return Math.sin(a * Math.PI / 180); }
  function dirY(a) { return -Math.cos(a * Math.PI / 180); }
  var A = hexRgb(PAL[0]), B = hexRgb(PAL[1]);
  var dimTxt = hexRgb('#aab1cf'), briTxt = hexRgb('#f6f8ff');

  // ---------- State ----------
  var t = 0, ang = 0, vel = 0, target = 0, spun = false, active = -1, hover = -1;
  var levels = [0.34, 0.34, 0.34, 0.34], visited = [false, false, false, false], hovLvl = [0, 0, 0, 0];
  var pingT = [-9, -9, -9, -9], nextAdvance = DWELL + 0.2, arrivedFlag = false;
  var mx = 0, my = 0, smx = 0, smy = 0, scale = 0.5;
  var angLag = 0, lastAdv = 0, blips = [], blipNext = 4, blipCount = 0;
  var ndlHover = false, ndlLvl = 0, rawX = -100, rawY = -100;

  // ---------- Build scene ----------
  var box = stage.querySelector('.ic-box');
  var scaler = stage.querySelector('.ic-scaler');
  var aur1 = document.createElement('div'); aur1.className = 'ic-aura';
  aur1.style.cssText = 'left:-140px;top:60px;width:980px;height:760px;background:radial-gradient(ellipse at 50% 50%, ' + rgba(A, 0.10) + ' 0%, ' + rgba(A, 0) + ' 62%)';
  scaler.appendChild(aur1);
  var aur2 = document.createElement('div'); aur2.className = 'ic-aura';
  aur2.style.cssText = 'right:-160px;bottom:-40px;width:900px;height:820px;background:radial-gradient(ellipse at 50% 50%, ' + rgba(B, 0.08) + ' 0%, ' + rgba(B, 0) + ' 62%)';
  scaler.appendChild(aur2);
  var svg1 = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' }, scaler);
  // drifting ambient particles
  var gParts = el('g', {}, svg1);
  var parts = [];
  for (var qi = 0; qi < 30; qi++) {
    parts.push({ x: Math.random() * W, y: Math.random() * H, sp: 5 + Math.random() * 13, ph: Math.random() * 6.283, sw: 8 + Math.random() * 22, o: 0.1 + Math.random() * 0.2, el: el('circle', { r: 0.9 + Math.random() * 1.5, fill: '#cdd6ff', opacity: 0 }, gParts) });
  }

  var gAxes = el('g', {}, svg1);
  el('line', { x1: CX - 345, y1: CY, x2: CX + 345, y2: CY, stroke: 'rgba(255,255,255,0.26)', 'stroke-width': 1, 'stroke-dasharray': '2 9' }, gAxes);
  el('line', { x1: CX, y1: CY - 345, x2: CX, y2: CY + 345, stroke: 'rgba(255,255,255,0.26)', 'stroke-width': 1, 'stroke-dasharray': '2 9' }, gAxes);
  [45, 135, 225, 315].forEach(function (a) {
    el('line', { x1: CX + 126 * dirX(a), y1: CY + 126 * dirY(a), x2: CX + 343 * dirX(a), y2: CY + 343 * dirY(a), stroke: 'rgba(255,255,255,0.15)', 'stroke-width': 1, 'stroke-dasharray': '2 9' }, gAxes);
  });

  var gRose = el('g', {}, svg1);
  [0, 45, 90, 135, 180, 225, 270, 315].forEach(function (a) {
    var card = a % 90 === 0;
    var g = el('g', { transform: 'rotate(' + a + ' ' + CX + ' ' + CY + ')' }, gRose);
    el('polygon', { points: CX + ',' + (CY - (card ? 176 : 140)) + ' ' + (CX + (card ? 11 : 8)) + ',' + (CY - 46) + ' ' + (CX - (card ? 11 : 8)) + ',' + (CY - 46), fill: card ? rgba(A, 0.24) : 'rgba(255,255,255,0.1)', stroke: card ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.16)', 'stroke-width': 0.9 }, g);
  });
  [['N', 0], ['E', 90], ['S', 180], ['W', 270]].forEach(function (d) {
    var txt = el('text', { x: CX + 272 * dirX(d[1]), y: CY + 272 * dirY(d[1]), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: rgba(dimTxt, 0.95), 'font-size': 17, 'font-weight': 600, 'font-family': "'IBM Plex Mono',monospace", 'letter-spacing': '0.1em' }, gRose);
    txt.textContent = d[0];
  });
  [45, 135, 225, 315].forEach(function (a) {
    var txt = el('text', { x: CX + 272 * dirX(a), y: CY + 272 * dirY(a), 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: 'rgba(255,255,255,0.55)', 'font-size': 10.5, 'font-family': "'IBM Plex Mono',monospace" }, gRose);
    txt.textContent = ('00' + a).slice(-3);
  });

  function ring(r, stroke, sw, dash) {
    var attrs = { cx: CX, cy: CY, r: r, fill: 'none', stroke: stroke, 'stroke-width': sw, pathLength: 1 };
    if (dash) attrs['stroke-dasharray'] = dash; else { attrs['stroke-dasharray'] = '0 1'; attrs.transform = 'rotate(-90 ' + CX + ' ' + CY + ')'; }
    return el('circle', attrs, svg1);
  }
  var ring1 = ring(345, 'rgba(255,255,255,0.22)', 1.4);
  var ring2 = ring(300, rgba(A, 0.6), 1.4, '0.0028 0.0361');
  var ring3 = ring(210, 'rgba(255,255,255,0.24)', 1, '0.0028 0.0278');
  var ring4 = ring(120, 'rgba(255,255,255,0.18)', 1);
  // outer ring stack — layered counter-rotating outlines
  var ringX1 = ring(362, rgba(B, 0.35), 1, '0.002 0.014');            // fine dotted, counter-rotates
  var ringX2 = ring(382, 'rgba(255,255,255,0.28)', 1.2, '0.11 0.14'); // 4 long arcs
  var ringX3 = ring(382, rgba(B, 0.8), 2, '0.055 0.945');            // bright scanner arc, opposite way
  var ringX4 = ring(408, rgba(dimTxt, 0.5), 1.1, '0.0012 0.0388');   // big dotted orbit, own rotation
  var ringX5 = ring(430, 'rgba(255,255,255,0.12)', 1);                // outermost hairline
  var ringX6 = ring(430, rgba(A, 0.5), 1.6, '0.075 0.425');           // twin accent arcs on outermost
  var gMicro = el('g', { opacity: 0 }, svg1);                         // rotating micro-tick band
  for (var mi = 0; mi < 36; mi++) {
    var ma = mi * 10;
    el('line', { x1: CX + 414 * dirX(ma), y1: CY + 414 * dirY(ma), x2: CX + 420 * dirX(ma), y2: CY + 420 * dirY(ma), stroke: 'rgba(255,255,255,0.3)', 'stroke-width': mi % 9 === 0 ? 1.4 : 0.8 }, gMicro);
  }
  var gBr = el('g', { opacity: 0 }, svg1);                            // diagonal chevron brackets
  [45, 135, 225, 315].forEach(function (ba) {
    var bg = el('g', { transform: 'rotate(' + ba + ' ' + CX + ' ' + CY + ')' }, gBr);
    el('line', { x1: CX - 8, y1: CY - 417, x2: CX, y2: CY - 424, stroke: rgba(B, 0.55), 'stroke-width': 1.2 }, bg);
    el('line', { x1: CX + 8, y1: CY - 417, x2: CX, y2: CY - 424, stroke: rgba(B, 0.55), 'stroke-width': 1.2 }, bg);
  });
  // premium layers: needle echo arc, sector progress arc, rotating + markers, orbit satellites, radar blips
  var echoArc = el('circle', { cx: CX, cy: CY, r: 322, fill: 'none', stroke: rgba(B, 0.5), 'stroke-width': 1.6, pathLength: 360, 'stroke-dasharray': '26 334', 'stroke-linecap': 'round', opacity: 0 }, svg1);
  var progArc = el('circle', { cx: CX, cy: CY, r: 354, fill: 'none', stroke: rgba(B, 0.55), 'stroke-width': 2, pathLength: 360, 'stroke-dasharray': '0 360', 'stroke-linecap': 'round', opacity: 0 }, svg1);
  var gPlus = el('g', { opacity: 0 }, svg1);
  for (var pk = 0; pk < 8; pk++) {
    var pa = pk * 45 + 22.5, ppx = CX + 395 * dirX(pa), ppy = CY + 395 * dirY(pa);
    el('line', { x1: ppx - 5, y1: ppy, x2: ppx + 5, y2: ppy, stroke: 'rgba(255,255,255,0.34)', 'stroke-width': 1 }, gPlus);
    el('line', { x1: ppx, y1: ppy - 5, x2: ppx, y2: ppy + 5, stroke: 'rgba(255,255,255,0.34)', 'stroke-width': 1 }, gPlus);
  }
  var gSats = el('g', { opacity: 0 }, svg1);
  var satDef = [[408, -2.4, 0, 3, rgba(B, 0.95)], [408, -2.4, 180, 2.2, rgba(A, 0.95)], [382, -10, 90, 2.4, '#eaf6ff']];
  var satEls = satDef.map(function (s) { return el('circle', { r: s[3], fill: s[4] }, gSats); });
  var satHalo = el('circle', { r: 7.5, fill: 'none', stroke: rgba(B, 0.3), 'stroke-width': 1 }, gSats);
  var blipEls = [];
  for (var bk = 0; bk < 6; bk++) blipEls.push({ dot: el('circle', { r: 2.2, opacity: 0 }, svg1), ring: el('circle', { fill: 'none', 'stroke-width': 1, opacity: 0 }, svg1) });

  var gTicks = el('g', {}, svg1);
  var tickEls = [];
  for (var i = 0; i < 72; i++) {
    var a = i * 5, major = i % 9 === 0, r1 = major ? 334 : 338, r2 = major ? 350 : 346;
    tickEls.push(el('line', { x1: CX + r1 * dirX(a), y1: CY + r1 * dirY(a), x2: CX + r2 * dirX(a), y2: CY + r2 * dirY(a), 'stroke-width': major ? 1.6 : 1, opacity: 0 }, gTicks));
    tickEls[i]._major = major;
    tickEls[i].setAttribute('stroke', major ? rgba(dimTxt, 1) : 'rgba(255,255,255,1)');
  }

  var conns = PILLARS.map(function (p) {
    var x1 = CX + 356 * dirX(p.a), y1 = CY + 356 * dirY(p.a), x2 = CX + 404 * dirX(p.a), y2 = CY + 404 * dirY(p.a);
    var g = el('g', {}, svg1);
    return {
      base: el('line', { x1: x1, y1: y1, x2: x2, y2: y2, 'stroke-width': 1.2, opacity: 0 }, g),
      dash: el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: rgba(B, 0.9), 'stroke-width': 1.6, 'stroke-dasharray': '4 8', opacity: 0 }, g)
    };
  });

  var beam = document.createElement('div');
  beam.className = 'ic-beam';
  scaler.appendChild(beam);

  var svg2 = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' }, scaler);
  var defs = el('defs', {}, svg2);
  var lg = el('linearGradient', { id: 'icNdl', x1: 0, y1: -298, x2: 0, y2: 20, gradientUnits: 'userSpaceOnUse' }, defs);
  el('stop', { offset: 0, 'stop-color': PAL[1] }, lg);
  el('stop', { offset: 0.45, 'stop-color': PAL[0] }, lg);
  el('stop', { offset: 1, 'stop-color': rgba(A, 0.05) }, lg);
  var rg1 = el('radialGradient', { id: 'icCore' }, defs);
  el('stop', { offset: 0.55, 'stop-color': '#141a33' }, rg1);
  el('stop', { offset: 1, 'stop-color': '#0a0f22' }, rg1);
  var rg2 = el('radialGradient', { id: 'icHalo' }, defs);
  el('stop', { offset: 0.3, 'stop-color': rgba(A, 0.22) }, rg2);
  el('stop', { offset: 1, 'stop-color': rgba(A, 0) }, rg2);

  var nodes = PILLARS.map(function (p) {
    var px = CX + 345 * dirX(p.a), py = CY + 345 * dirY(p.a);
    var g = el('g', {}, svg2);
    return {
      x: px, y: py,
      dot: el('circle', { cx: px, cy: py, r: 3.6, opacity: 0 }, g),
      p1: el('circle', { cx: px, cy: py, r: 6, fill: 'none', opacity: 0 }, g),
      p2: el('circle', { cx: px, cy: py, r: 6, fill: 'none', opacity: 0 }, g)
    };
  });

  var coreG = el('g', {}, svg2);
  var halo = el('circle', { cx: CX, cy: CY, r: 165, fill: 'url(#icHalo)', opacity: 0 }, coreG);
  var pulse1 = el('circle', { cx: CX, cy: CY, fill: 'none', 'stroke-width': 1.2 }, coreG);
  var pulse2 = el('circle', { cx: CX, cy: CY, fill: 'none', 'stroke-width': 1.2 }, coreG);
  var coreC = el('circle', { cx: CX, cy: CY, r: 96, fill: 'url(#icCore)', 'stroke-width': 1.2, opacity: 0 }, coreG);
  var dashA = el('circle', { cx: CX, cy: CY, r: 105, fill: 'none', stroke: rgba(B, 0.55), 'stroke-width': 1.4, pathLength: 360, 'stroke-dasharray': '80 280' }, coreG);
  var dashB = el('circle', { cx: CX, cy: CY, r: 111, fill: 'none', stroke: rgba(A, 0.4), 'stroke-width': 1, pathLength: 360, 'stroke-dasharray': '44 316' }, coreG);

  var needleG = el('g', { opacity: 0 }, svg2);
  var ndlGlow = el('polygon', { points: '0,-298 13,-54 0,-22 -13,-54', fill: rgba(B, 0.3), opacity: 0 }, needleG);
  el('polygon', { points: '0,-298 7,-54 0,-30 -7,-54', fill: 'url(#icNdl)' }, needleG);
  el('polygon', { points: '0,208 6,118 0,106 -6,118', fill: '#232b4a', stroke: 'rgba(255,255,255,0.22)', 'stroke-width': 0.6 }, needleG);
  var tipDot = el('circle', { cx: 0, cy: -298, r: 3, fill: PAL[1], opacity: 0 }, needleG);
  el('circle', { cx: 0, cy: 0, r: 5, fill: '#10162e', stroke: rgba(B, 0.65), 'stroke-width': 1.2 }, needleG);
  var ndlHit = el('polygon', { points: '-16,-300 16,-300 16,40 -16,40', fill: 'transparent' }, needleG);
  ndlHit.style.pointerEvents = 'auto'; ndlHit.style.cursor = 'pointer';
  ndlHit.addEventListener('mouseenter', function () { ndlHover = true; });
  ndlHit.addEventListener('mouseleave', function () { ndlHover = false; });
  var tip = stage.querySelector('.ic-tip');
  tip.textContent = HOVER_LABEL;

  var coreText = document.createElement('div');
  coreText.className = 'ic-core-text';
  coreText.innerHTML = '<div class="ic-core-title">THE<br>INTELLIGENT<br>CORE</div>';
  coreText.style.opacity = 0;
  scaler.appendChild(coreText);

  /* the pillar cards below the compass highlight in step with the live sector */
  var practices = document.querySelectorAll('.practice');

  var labels = PILLARS.map(function (p, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.className = 'ic-label';
    d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; d.style.opacity = 0;
    d.setAttribute('aria-pressed', 'false');
    d.innerHTML = '<span class="ic-chip">' + p.n + '</span><span class="ic-title">' + p.title + '</span>';
    d.addEventListener('click', function () { goTo(i); });
    d.addEventListener('mouseenter', function () { hover = i; });
    d.addEventListener('mouseleave', function () { if (hover === i) hover = -1; });
    d.addEventListener('focus', function () { hover = i; });
    d.addEventListener('blur', function () { if (hover === i) hover = -1; });
    scaler.appendChild(d);
    return { root: d, chip: d.firstChild, title: d.lastChild };
  });

  function setLive(i) {
    labels.forEach(function (L, j) { L.root.setAttribute('aria-pressed', String(i === j)); });
    practices.forEach(function (p, j) { p.classList.toggle('is-live', i === j); });
  }

  /* ---------- compact layout ----------
     Below 920px the labels leave the scaled coordinate space and become a
     grid under the compass; the rose then scales to its own content box
     instead of the full 1920x1080 frame, so it fills a phone screen. */
  var labelHost = stage.querySelector('.ic-labels');
  var compactMQ = window.matchMedia('(max-width: 919px)');
  var compact = false;

  function applyLayout() {
    compact = compactMQ.matches;
    stage.classList.toggle('ic-stage--compact', compact);
    labels.forEach(function (L, i) {
      (compact ? labelHost : scaler).appendChild(L.root);
      if (compact) {
        L.root.style.left = '';
        L.root.style.top = '';
        L.root.style.transform = '';
        L.root.style.opacity = '';
      } else {
        L.root.style.left = PILLARS[i].x + 'px';
        L.root.style.top = PILLARS[i].y + 'px';
      }
    });
  }
  applyLayout();
  if (compactMQ.addEventListener) compactMQ.addEventListener('change', applyLayout);
  else compactMQ.addListener(applyLayout);

  /* every radius in this file lives in the 1920x1080 design space, so the
     overall size of the rose is set here rather than by touching the ~40
     hardcoded radii — SIZE trims the fitted scale uniformly, keeping rings,
     ticks, labels and core text in proportion. */
  var SIZE = 0.8;

  function fitScale() {
    // compact fits the rose itself (~980 units across); wide fits the whole frame
    var fw = compact ? 980 : W, fh = compact ? 980 : H;
    /* .ic-stage is SIZE shorter in CSS so the gaps above and below the rose
       stay tight rather than growing by whatever SIZE trims. The fit is
       height-bound at most viewport sizes, so divide that back out here —
       otherwise the shorter box would shrink the rose a second time and the
       reduction would compound to SIZE squared. */
    var bw = box.offsetWidth, bh = box.offsetHeight / SIZE;
    return Math.min(bw / fw, bh / fh) * (compact ? 0.98 : 0.94) * SIZE;
  }

  document.addEventListener('mousemove', function (e) {
    rawX = e.clientX; rawY = e.clientY;
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function goTo(i) {
    var want = PILLARS[i].a;
    var delta = ((want - ((target % 360) + 360) % 360) + 360) % 360;
    if (delta === 0 && active !== i) delta = 360;
    target += delta; active = i; arrivedFlag = false; nextAdvance = t + DWELL + 0.5; lastAdv = t;
    setLive(i);
  }

  // ---------- Animation loop ----------
  var last = performance.now();
  var running = false, rafId = 0;

  function tick(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    scale = fitScale();

    if (!spun && t > 1.3) { spun = true; target = 360; active = 0; lastAdv = t; setLive(0); }
    if (spun && AUTO_ROTATE && hover < 0 && !ndlHover && t > nextAdvance) {
      active = (active + 1) % 4; target += 90; nextAdvance = t + DWELL; arrivedFlag = false; lastAdv = t; setLive(active);
    }
    vel += (target - ang) * 19 * dt;
    vel *= Math.exp(-8 * dt);
    ang += vel * dt;
    var arrived = Math.abs(target - ang) < 6 && Math.abs(vel) < 40;
    if (arrived && !arrivedFlag && active >= 0) { arrivedFlag = true; visited[active] = true; pingT[active] = t; }
    for (var i = 0; i < 4; i++) {
      var goal = i === active ? (arrivedFlag ? 1 : 0.5) : (visited[i] ? 0.56 : 0.34);
      levels[i] += (goal - levels[i]) * Math.min(1, dt * 6.5);
      hovLvl[i] += ((hover === i ? 1 : 0) - hovLvl[i]) * Math.min(1, dt * 9);
    }
    smx += (mx - smx) * Math.min(1, dt * 3.5);
    smy += (my - smy) * Math.min(1, dt * 3.5);
    angLag += (ang - angLag) * Math.min(1, dt * 2.6);
    ndlLvl += ((ndlHover ? 1 : 0) - ndlLvl) * Math.min(1, dt * 8);
    if (spun && t > blipNext) {
      blips.push({ a: Math.random() * 360, r: 150 + Math.random() * 170, t0: t, slot: blipCount++ % 6 });
      if (blips.length > 6) blips.shift();
      blipNext = t + 1.6 + Math.random() * 2.4;
    }
    render();
    if (running) rafId = requestAnimationFrame(tick);
  }

  function prog(start, dur) { return clamp01((t - start) / dur); }

  function render() {
    var angle = ang + (spun ? 0.6 * Math.sin(t * 1.1) : 0);
    var glow = clamp01(Math.abs(vel) / 130);
    var coreIn = outE(prog(0.15, 0.9)), textIn = outE(prog(0.95, 0.8));
    var tickIn = inoutE(prog(0.55, 1.3)), axesIn = inoutE(prog(0.8, 1));
    var needleIn = outE(prog(1.3, 0.6));
    var p1 = (t * 0.3) % 1, p2 = (t * 0.3 + 0.5) % 1;
    var act01 = levels.map(function (l) { return clamp01((l - 0.56) / 0.44); });
    var seen01 = levels.map(function (l) { return clamp01((l - 0.34) / 0.22); });

    scaler.style.transform = 'translate(-50%,-50%) translate(' + (smx * 10) + 'px,' + (smy * 8) + 'px) scale(' + scale + ')';

    var intro = t < 4.5;
    if (intro) {
      gAxes.setAttribute('opacity', axesIn * 0.8);
      gRose.setAttribute('opacity', tickIn);
      [ring1, ring2, ring3, ring4].forEach(function (r, k) {
        var pg = inoutE(prog(0.35 + 0.22 * k, 0.9));
        if (k === 0 || k === 3) r.setAttribute('stroke-dasharray', pg + ' 1');
        else r.style.opacity = pg;
      });
      [ringX1, ringX2, ringX3, ringX4].forEach(function (r, j) { r.style.opacity = inoutE(prog(0.6 + 0.18 * j, 0.8)); });
      ringX5.setAttribute('stroke-dasharray', inoutE(prog(0.9, 0.9)) + ' 1');
      ringX6.style.opacity = inoutE(prog(1.05, 0.8));
      gMicro.setAttribute('opacity', inoutE(prog(1.1, 0.8)) * 0.8);
      gBr.setAttribute('opacity', inoutE(prog(1.2, 0.8)) * 0.9);
      coreC.setAttribute('opacity', coreIn);
      coreC.setAttribute('stroke', rgba(A, 0.4 * coreIn));
      coreText.style.opacity = textIn;
      coreText.style.transform = 'translate(-50%,-50%) scale(' + (0.9 + 0.1 * textIn) + ')';
      needleG.setAttribute('opacity', needleIn);
    }
    ring2.setAttribute('transform', 'rotate(' + (t * 1.4) + ' ' + CX + ' ' + CY + ')');
    ring3.setAttribute('transform', 'rotate(' + (-t * 1.0) + ' ' + CX + ' ' + CY + ')');
    // ambient background drift
    aur1.style.transform = 'translate(' + (Math.sin(t * 0.11) * 90) + 'px,' + (Math.cos(t * 0.13) * 70) + 'px) scale(' + (1 + 0.08 * Math.sin(t * 0.17)) + ')';
    aur2.style.transform = 'translate(' + (Math.cos(t * 0.09) * 110) + 'px,' + (Math.sin(t * 0.15) * 80) + 'px) scale(' + (1 + 0.1 * Math.cos(t * 0.12)) + ')';
    for (var q = 0; q < parts.length; q++) {
      var pt = parts[q];
      pt.el.setAttribute('cx', pt.x + Math.sin(t * 0.3 + pt.ph) * pt.sw);
      pt.el.setAttribute('cy', ((pt.y - t * pt.sp) % H + H) % H);
      pt.el.setAttribute('opacity', pt.o * (0.5 + 0.5 * Math.sin(t * 0.9 + pt.ph * 2)));
    }
    // tick glint follows the needle
    var naDeg = ((angle % 360) + 360) % 360;
    for (var q2 = 0; q2 < 72; q2++) {
      var mj = tickEls[q2]._major;
      var base = clamp01((tickIn - q2 / 72) * 8) * (mj ? 0.8 : 0.42);
      var dna = Math.abs(q2 * 5 - naDeg); dna = Math.min(dna, 360 - dna);
      tickEls[q2].setAttribute('opacity', Math.min(1, base + Math.max(0, 1 - dna / 16) * 0.5 * needleIn));
    }
    // core breathing + title glow pulse
    coreG.setAttribute('transform', 'translate(' + CX + ' ' + CY + ') scale(' + ((0.6 + 0.4 * coreIn) * (1 + 0.014 * Math.sin(t * 1.3))) + ') translate(' + (-CX) + ' ' + (-CY) + ')');
    var gp = 0.5 + 0.5 * Math.sin(t * 1.5);
    coreText.firstChild.style.textShadow = '0 0 ' + (16 + 14 * gp) + 'px ' + rgba(B, 0.25 + 0.3 * gp) + ', 0 0 ' + (40 + 20 * gp) + 'px ' + rgba(A, 0.15 + 0.15 * gp);
    ringX1.setAttribute('transform', 'rotate(' + (-t * 6) + ' ' + CX + ' ' + CY + ')');
    ringX2.setAttribute('transform', 'rotate(' + (t * 3) + ' ' + CX + ' ' + CY + ')');
    ringX3.setAttribute('transform', 'rotate(' + (-t * 10) + ' ' + CX + ' ' + CY + ')');
    ringX4.setAttribute('transform', 'rotate(' + (-t * 2.4) + ' ' + CX + ' ' + CY + ')');
    ringX6.setAttribute('transform', 'rotate(' + (t * 1.8) + ' ' + CX + ' ' + CY + ')');
    gMicro.setAttribute('transform', 'rotate(' + (-t * 2.4) + ' ' + CX + ' ' + CY + ')');
    gBr.setAttribute('transform', 'rotate(' + (2.5 * Math.sin(t * 0.7)) + ' ' + CX + ' ' + CY + ')');
    echoArc.setAttribute('transform', 'rotate(' + (angLag - 116) + ' ' + CX + ' ' + CY + ')');
    echoArc.setAttribute('opacity', needleIn * (0.2 + 0.6 * glow));
    var frac = spun ? clamp01((t - lastAdv) / Math.max(0.1, nextAdvance - lastAdv)) : 0;
    progArc.setAttribute('stroke-dasharray', (frac * 86) + ' ' + (360 - frac * 86));
    progArc.setAttribute('transform', 'rotate(' + ((active >= 0 ? PILLARS[active].a : 0) - 133) + ' ' + CX + ' ' + CY + ')');
    progArc.setAttribute('opacity', needleIn * 0.55);
    var xin3 = inoutE(prog(1.14, 0.8));
    gPlus.setAttribute('transform', 'rotate(' + (-t * 1.2) + ' ' + CX + ' ' + CY + ')');
    gPlus.setAttribute('opacity', xin3 * 0.6);
    gSats.setAttribute('opacity', xin3);
    satDef.forEach(function (sd, k) {
      var sa = sd[1] * t + sd[2], sx = CX + sd[0] * dirX(sa), sy = CY + sd[0] * dirY(sa);
      satEls[k].setAttribute('cx', sx); satEls[k].setAttribute('cy', sy);
      if (k === 0) { satHalo.setAttribute('cx', sx); satHalo.setAttribute('cy', sy); }
    });
    blipEls.forEach(function (b) { b.dot.setAttribute('opacity', 0); b.ring.setAttribute('opacity', 0); });
    blips.forEach(function (b) {
      var life = (t - b.t0) / 1.4; if (life <= 0 || life >= 1) return;
      var bx = CX + b.r * dirX(b.a), by = CY + b.r * dirY(b.a), sl = blipEls[b.slot];
      sl.dot.setAttribute('cx', bx); sl.dot.setAttribute('cy', by); sl.dot.setAttribute('fill', rgba(B, (1 - life) * 0.9)); sl.dot.setAttribute('opacity', 1);
      sl.ring.setAttribute('cx', bx); sl.ring.setAttribute('cy', by); sl.ring.setAttribute('r', 3 + 26 * life); sl.ring.setAttribute('stroke', rgba(B, (1 - life) * 0.5)); sl.ring.setAttribute('opacity', 1);
    });

    beam.style.opacity = needleIn * (0.22 + 0.55 * glow);
    beam.style.background = 'conic-gradient(from ' + (angle - 104) + 'deg at 50% 50%, rgba(0,0,0,0) 0deg, ' + rgba(B, 0) + ' 20deg, ' + rgba(B, 0.04) + ' 56deg, ' + rgba(B, 0.12) + ' 88deg, ' + rgba(B, 0.3) + ' 102deg, rgba(0,0,0,0) 104deg)';

    halo.setAttribute('opacity', coreIn * (0.55 + 0.18 * Math.sin(t * 1.9)));
    pulse1.setAttribute('r', 96 + 68 * p1); pulse1.setAttribute('stroke', rgba(A, (1 - p1) * 0.3 * coreIn));
    pulse2.setAttribute('r', 96 + 68 * p2); pulse2.setAttribute('stroke', rgba(A, (1 - p2) * 0.3 * coreIn));
    dashA.setAttribute('transform', 'rotate(' + (t * 24) + ' ' + CX + ' ' + CY + ')');
    dashB.setAttribute('transform', 'rotate(' + (-t * 17) + ' ' + CX + ' ' + CY + ')');

    needleG.setAttribute('transform', 'translate(' + CX + ' ' + CY + ') rotate(' + angle + ')');
    tipDot.setAttribute('opacity', Math.max(glow, ndlLvl));
    ndlGlow.setAttribute('opacity', ndlLvl * 0.9);
    tip.style.left = rawX + 'px'; tip.style.top = rawY + 'px'; tip.style.opacity = ndlLvl;

    var bord = hexRgb('#2a3050'), chipB = hexRgb('#3a4266');
    for (var i = 0; i < 4; i++) {
      var inV = outE(prog(1.15 + 0.14 * i, 0.6));
      var act = act01[i], lvl = levels[i], hv = hovLvl[i];
      conns[i].base.setAttribute('stroke', 'rgba(255,255,255,' + (0.24 + 0.2 * seen01[i]) + ')');
      conns[i].base.setAttribute('opacity', outE(prog(1.15 + 0.14 * i, 0.5)));
      conns[i].dash.setAttribute('stroke-dashoffset', -t * 26);
      conns[i].dash.setAttribute('opacity', 0.85 * act);
      var nd = nodes[i];
      nd.dot.setAttribute('fill', mix(hexRgb('#4a5478'), B, Math.max(act, seen01[i] * 0.5)));
      nd.dot.setAttribute('opacity', outE(prog(1.15 + 0.14 * i, 0.5)) * (0.7 + 0.3 * act));
      var pv = clamp01((t - pingT[i]) / 0.85);
      if (pv > 0 && pv < 1) { nd.p1.setAttribute('r', 6 + 44 * pv); nd.p1.setAttribute('stroke', rgba(B, (1 - pv) * 0.8)); nd.p1.setAttribute('stroke-width', 0.5 + 1.8 * (1 - pv)); nd.p1.setAttribute('opacity', 1); }
      else nd.p1.setAttribute('opacity', 0);
      var pv2 = clamp01((t - pingT[i] - 0.22) / 0.85);
      if (pv2 > 0 && pv2 < 1) { nd.p2.setAttribute('r', 6 + 32 * pv2); nd.p2.setAttribute('stroke', rgba(B, (1 - pv2) * 0.6)); nd.p2.setAttribute('stroke-width', 1); nd.p2.setAttribute('opacity', 1); }
      else nd.p2.setAttribute('opacity', 0);

      var L = labels[i], p = PILLARS[i];
      var st = L.root.style;
      if (!compact) {
        var dx = dirX(p.a) * -30 * (1 - inV), dy = dirY(p.a) * -30 * (1 - inV);
        st.transform = 'translate(-50%,-50%) translate(' + dx + 'px,' + dy + 'px) scale(' + (1 + 0.055 * act + 0.025 * hv) + ')';
        st.opacity = inV * (0.35 + 0.65 * Math.max(lvl, 0.34 + 0.3 * hv));
      }
      st.borderColor = mix(bord, B, Math.max(act, hv * 0.55));
      st.boxShadow = '0 18px 44px rgba(0,0,0,0.5), 0 0 ' + (46 * Math.max(act, hv * 0.4)) + 'px ' + rgba(B, 0.22 * Math.max(act, hv * 0.5)) + ', inset 0 1px 0 rgba(255,255,255,0.05)';
      var cs = L.chip.style;
      cs.borderColor = mix(chipB, B, act);
      cs.background = act > 0.02 ? rgba(B, act) : 'rgba(255,255,255,0.03)';
      cs.color = act > 0.55 ? '#081120' : mix(dimTxt, B, act);
      L.title.style.color = mix(dimTxt, briTxt, 0.25 + 0.75 * Math.max(act, hv * 0.5));
    }
  }

  /* reduced motion: settle the scene on sector 01 and draw it once */
  if (reduce) {
    AUTO_ROTATE = false;
    t = 6; spun = true; active = 0; arrivedFlag = true; visited[0] = true;
    ang = target = 0; levels[0] = 1;
    scale = fitScale();
    setLive(0);
    render();
    window.addEventListener('resize', function () {
      scale = fitScale();
      render();
    });
    return;
  }

  /* the loop only burns frames while the compass is actually on screen */
  function start() { if (running) return; running = true; last = performance.now(); rafId = requestAnimationFrame(tick); }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) start(); else stop();
    }, { rootMargin: '120px' }).observe(stage);
  } else {
    start();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop();
    else if (stage.getBoundingClientRect().bottom > 0 && stage.getBoundingClientRect().top < window.innerHeight) start();
  });
})();
