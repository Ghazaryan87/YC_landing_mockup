/* ============================================================
   YourCompass — homepage v4
   Vanilla port of the former dc-runtime component.
   ============================================================ */

(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- data ---------- */

  var OFFICES = [
    { flag: '🇦🇪', country: 'UAE', city: 'ABU DHABI', role: 'HQ & delivery hub — on-site in hours', lat: 24.45, lng: 54.38 },
    { flag: '🇸🇦', country: 'Saudi Arabia', city: 'CITY TBD', role: 'In-Kingdom presence — local compliance, local teams', lat: 24.71, lng: 46.68 },
    { flag: '🇨🇦', country: 'Canada', city: 'OTTAWA', role: 'North American coverage — one partner across regions', lat: 45.42, lng: -75.70 },
    { flag: '🇦🇲', country: 'Armenia', city: 'YEREVAN', role: 'Engineering center — delivery that never sleeps', lat: 40.18, lng: 44.51 }
  ];

  var BEARINGS = [
    { tag: 'N · FLAGSHIP', label: 'AI Business Solutions', x: '50%', y: '9%', desc: 'Agentic AI systems built for your operations — on-prem, sovereign, yours.', href: 'AI%20Solutions.dc.html', link: 'AI Business Solutions →' },
    { tag: 'SW', label: 'Advanced Observability', x: '18.5%', y: '80%', desc: 'AI that watches, diagnoses, and heals your systems before your team is paged.', href: 'AI%20Solutions.dc.html#architecture', link: 'Advanced Observability →' },
    { tag: 'SE', label: 'Enterprise Solutions', x: '81.5%', y: '80%', desc: 'Enterprise platforms designed, integrated, and run with AI in the loop.', href: 'AI%20Solutions.dc.html#build', link: 'Enterprise Solutions →' }
  ];

  var METHOD_STEPS = [
    { t: 'Discover', d: 'Map the estate — systems, data, owners, and the problems worth solving.' },
    { t: 'Assess', d: 'Score candidate use-cases by value, risk, and readiness. Pick the provable one.' },
    { t: 'Instrument', d: 'Wire in observability first — you can\'t automate what you can\'t see.' },
    { t: 'Design', d: 'Architect the agentic workflow — sovereign and on-prem by default.' },
    { t: 'Build', d: 'A working system against your real data. Not slides.' },
    { t: 'Deploy', d: 'Inside your perimeter, through your security and compliance gates.' },
    { t: 'Operate', d: 'Production duty with humans in the approval loop from day one.' },
    { t: 'Optimize', d: 'Tuned continuously from the Intelligent Observability Center.', meta: 'IOC' }
  ];

  var DEMO_FRAMES = {
    1: [
      'Flags a latency anomaly in live telemetry — before threshold alerting would have fired.',
      'Correlates across services, isolates the failing dependency, and drafts a diagnosis.',
      'Executes the approved remediation and files the incident report. Nobody was paged.'
    ],
    2: [
      'Reads the incoming request, checks policy, and opens the right workflow.',
      'Gathers records from three systems and prepares the resolution for sign-off.',
      'A human approves in one click; the agent completes, notifies, and documents.'
    ]
  };

  var REEL_CARDS = [
    { tag: 'OBSERVABILITY', len: '02:14', title: 'A P1 caught, diagnosed, and closed — nobody paged', sub: 'Government entity · UAE · identity stripped' },
    { tag: 'SERVICE OPS', len: '01:48', title: 'A service request handled end-to-end', sub: 'Banking client · GCC · identity stripped' },
    { tag: 'IOC', len: '03:02', title: 'Inside the Intelligent Observability Center', sub: 'Live operations wall · Abu Dhabi HQ' },
    { tag: 'AGENTIC WORKFLOW', len: '02:31', title: 'Humans approve. Agents execute.', sub: 'Approval-loop pattern · in production' },
    { tag: 'SOVEREIGN AI', len: '01:56', title: 'On-prem agentic AI, end to end', sub: 'Air-gapped deployment walkthrough' },
    { tag: 'ONBOARDING', len: '02:20', title: 'The 8-step onboarding in two minutes', sub: 'Discovery to IOC operations' }
  ];

  /* ---------- accent ---------- */

  function lighten(hex, amt) {
    var n = hex.replace('#', '').trim();
    var full = n.length === 3 ? n.split('').map(function (c) { return c + c; }).join('') : n;
    var v = parseInt(full, 16);
    if (isNaN(v)) return hex;
    var r = Math.min(255, (v >> 16) + amt);
    var g = Math.min(255, ((v >> 8) & 255) + amt);
    var b = Math.min(255, (v & 255) + amt);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function hexRgb(hex) {
    var n = (hex || '#2456D6').replace('#', '').trim();
    var f = n.length === 3 ? n.split('').map(function (c) { return c + c; }).join('') : n;
    var v = parseInt(f, 16);
    return isNaN(v) ? [36, 86, 214] : [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function currentSig() {
    return getComputedStyle(document.documentElement).getPropertyValue('--sig').trim() || '#2456D6';
  }

  // exposed so the accent can be swapped from the console without a rebuild
  window.setAccent = function (hex) {
    document.documentElement.style.setProperty('--sig', hex);
    document.documentElement.style.setProperty('--sig2', lighten(hex, 32));
  };

  /* ---------- hero ornament: generate the animated cell grids ---------- */

  function buildOrnCells() {
    $$('[data-orn-cells]').forEach(function (g) {
      var xs = g.dataset.x.split(',').map(Number);
      var ys = g.dataset.y.split(',').map(Number);
      var size = Number(g.dataset.size);
      var step = Number(g.dataset.step);
      ys.forEach(function (y, row) {
        xs.forEach(function (x, col) {
          var r = document.createElementNS(SVG_NS, 'rect');
          var accent = (row + col) % 2 === 0;
          r.setAttribute('class', 'orn-cell ' + (accent ? 'orn-cell--accent' : 'orn-cell--node'));
          r.setAttribute('x', x);
          r.setAttribute('y', y);
          r.setAttribute('width', size);
          r.setAttribute('height', size);
          r.setAttribute('rx', 3);
          r.style.animationDelay = ((row + col) * step).toFixed(2) + 's';
          g.appendChild(r);
        });
      });
    });
  }

  /* ---------- nav ---------- */

  function initNav() {
    var burger = $('[data-burger]');
    var panel = $('[data-mpanel]');
    if (!burger || !panel) return;

    var iconOpen = $('[data-burger-open]', burger);
    var iconClose = $('[data-burger-close]', burger);

    function set(open) {
      panel.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      iconOpen.hidden = open;
      iconClose.hidden = !open;
    }

    burger.addEventListener('click', function () {
      set(burger.getAttribute('aria-expanded') !== 'true');
    });

    $$('a', panel).forEach(function (a) {
      a.addEventListener('click', function () { set(false); });
    });

    // widening past the breakpoint leaves the panel orphaned; close it
    var mq = window.matchMedia('(min-width: 980px)');
    var onChange = function (e) { if (e.matches) set(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
  }

  /* ---------- hero draft switcher ---------- */

  function initHeroDrafts() {
    var chips = $$('[data-draft]');
    var heads = $$('[data-hero]');
    if (!chips.length) return;

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var key = chip.dataset.draft;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        heads.forEach(function (h) { h.hidden = h.dataset.hero !== key; });
      });
    });
  }

  /* ---------- compass bearings ---------- */

  function initBearings() {
    var host = $('[data-bearings]');
    var kicker = $('[data-bearing-kicker]');
    var desc = $('[data-bearing-desc]');
    var link = $('[data-bearing-link]');
    if (!host) return;

    var buttons = BEARINGS.map(function (b, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bearing';
      btn.style.left = b.x;
      btn.style.top = b.y;
      btn.setAttribute('aria-pressed', String(i === 0));
      btn.innerHTML =
        '<span class="bearing__tag"></span>' +
        '<span class="bearing__label"></span>';
      $('.bearing__tag', btn).textContent = b.tag;
      $('.bearing__label', btn).textContent = b.label;

      var select = function () { setBearing(i); };
      btn.addEventListener('click', select);
      btn.addEventListener('mouseenter', select);
      host.appendChild(btn);
      return btn;
    });

    function setBearing(i) {
      buttons.forEach(function (btn, j) { btn.setAttribute('aria-pressed', String(i === j)); });
      var b = BEARINGS[i];
      if (kicker) kicker.textContent = b.tag;
      if (desc) desc.textContent = b.desc;
      if (link) { link.textContent = b.link; link.href = b.href; }
    }

    setBearing(0);
  }

  /* ---------- method rail ---------- */

  function initMethod() {
    var list = $('[data-msteps]');
    var num = $('[data-method-num]');
    if (!list) return;

    var hold = 0;
    var current = 0;

    var buttons = METHOD_STEPS.map(function (s, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mstep';
      btn.setAttribute('aria-selected', String(i === 0));
      btn.innerHTML =
        '<span class="mstep__row">' +
          '<span class="mstep__num"></span>' +
          '<span class="mstep__title"></span>' +
          '<span class="mstep__meta"></span>' +
        '</span>' +
        '<span class="mstep__reveal"><span class="mstep__clip"><span class="mstep__desc"></span></span></span>';
      $('.mstep__num', btn).textContent = String(i + 1).padStart(2, '0');
      $('.mstep__title', btn).textContent = s.t;
      $('.mstep__meta', btn).textContent = s.meta || '';
      $('.mstep__desc', btn).textContent = s.d;

      var select = function () {
        hold = performance.now() + 8000;
        setStep(i);
      };
      btn.addEventListener('click', select);
      btn.addEventListener('mouseenter', select);
      list.appendChild(btn);
      return btn;
    });

    function setStep(i) {
      current = i;
      buttons.forEach(function (b, j) { b.setAttribute('aria-selected', String(i === j)); });
      if (num) num.textContent = String(i + 1).padStart(2, '0');
    }

    if (reduce) return;

    var hovering = false;
    list.addEventListener('mouseenter', function () { hovering = true; });
    list.addEventListener('mouseleave', function () { hovering = false; });
    list.addEventListener('touchstart', function () { hold = performance.now() + 9000; }, { passive: true });

    var iv = null;
    var tick = function () {
      if (!hovering && performance.now() >= hold) setStep((current + 1) % METHOD_STEPS.length);
    };
    var start = function () { if (!iv) iv = setInterval(tick, 3400); };
    var stop = function () { if (iv) { clearInterval(iv); iv = null; } };

    whenVisible(list, start, stop, '60px', 900);
  }

  /* ---------- demo slideshows ---------- */

  function initDemos() {
    $$('[data-demo]').forEach(function (article) {
      var frames = DEMO_FRAMES[article.dataset.demo];
      if (!frames) return;

      var note = $('[data-demo-note]', article);
      var count = $('[data-demo-count]', article);
      var dotHost = $('[data-demo-dots]', article);
      var next = $('[data-demo-next]', article);
      var idx = 0;

      var dots = frames.map(function (_, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'demo__dot';
        b.setAttribute('aria-label', 'Frame ' + (i + 1));
        b.addEventListener('click', function () { set(i); });
        dotHost.appendChild(b);
        return b;
      });

      function set(i) {
        idx = i;
        note.textContent = frames[i];
        count.textContent = 'FRAME ' + (i + 1) + ' / ' + frames.length;
        dots.forEach(function (d, j) { d.setAttribute('aria-current', String(i === j)); });
      }

      next.addEventListener('click', function () { set((idx + 1) % frames.length); });
      set(0);
    });
  }

  /* ---------- showcase reel ---------- */

  function initReel() {
    var strip = $('[data-reel]');
    var stage = $('[data-stage]');
    if (!strip || !stage) return;

    var meta = $('[data-stage-meta]');
    var bar = $('[data-stage-prog]');
    var tag = $('[data-stage-tag]');
    var len = $('[data-stage-len]');
    var title = $('[data-stage-title]');
    var sub = $('[data-stage-sub]');
    var numEl = $('[data-reel-num]');
    var totalEl = $('[data-reel-total]');

    var idx = 0;
    var progress = 0;
    var hold = 0;

    if (totalEl) totalEl.textContent = String(REEL_CARDS.length).padStart(2, '0');

    var thumbs = REEL_CARDS.map(function (c, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.setAttribute('aria-current', String(i === 0));
      btn.innerHTML =
        '<span class="thumb__frame">' +
          '<span class="thumb__tag"></span>' +
          '<span class="thumb__play">' +
            '<svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.2 L18 12 L9 17.8 Z" fill="#F2F5F7"></path></svg>' +
          '</span>' +
          '<span class="thumb__len"></span>' +
        '</span>' +
        '<span class="thumb__body"><span class="thumb__title"></span></span>';
      $('.thumb__tag', btn).textContent = c.tag;
      $('.thumb__len', btn).textContent = c.len;
      $('.thumb__title', btn).textContent = c.title;
      btn.addEventListener('click', function () { select(i, true); });
      strip.appendChild(btn);
      return btn;
    });

    function render() {
      var c = REEL_CARDS[idx];
      if (tag) tag.textContent = c.tag;
      if (len) len.textContent = c.len;
      if (title) title.textContent = c.title;
      if (sub) sub.textContent = c.sub;
      if (numEl) numEl.textContent = String(idx + 1).padStart(2, '0');
      thumbs.forEach(function (t, j) { t.setAttribute('aria-current', String(idx === j)); });
    }

    function select(i, user) {
      if (i === idx) return;
      progress = 0;
      if (user) hold = performance.now() + 9000;

      // Wrapping the ends (6 -> 1, or 1 -> 6) would smooth-scroll the whole
      // strip across every card. Cut straight there instead.
      var lastIdx = REEL_CARDS.length - 1;
      var wrapped = (idx === lastIdx && i === 0) || (idx === 0 && i === lastIdx);

      idx = i;
      render();

      // crossfade the stage meta and keep the active thumb in view
      if (meta && !reduce) {
        meta.style.animation = 'none';
        void meta.offsetWidth;
        meta.style.animation = 'ycStageIn .55s cubic-bezier(.16,.84,.44,1)';
      }
      var th = thumbs[idx];
      if (th) {
        var pad = parseFloat(getComputedStyle(strip).paddingLeft) || 24;
        strip.scrollTo({
          left: Math.max(0, th.offsetLeft - pad),
          behavior: (reduce || wrapped) ? 'auto' : 'smooth'
        });
      }
    }

    render();

    $('[data-reel-prev]').addEventListener('click', function () {
      select((idx + REEL_CARDS.length - 1) % REEL_CARDS.length, true);
    });
    $('[data-reel-next]').addEventListener('click', function () {
      select((idx + 1) % REEL_CARDS.length, true);
    });

    if (reduce) return;

    var hovering = false;
    [stage, strip].forEach(function (el) {
      el.addEventListener('mouseenter', function () { hovering = true; });
      el.addEventListener('mouseleave', function () { hovering = false; });
      el.addEventListener('touchstart', function () { hold = performance.now() + 9000; }, { passive: true });
    });

    var DUR = 7000;
    var last = 0, raf = 0, running = false;

    function step(ts) {
      if (!running) return;
      if (!last) last = ts;
      var dt = Math.min(80, ts - last);
      last = ts;
      if (!hovering && performance.now() >= hold) {
        progress += dt / DUR;
        if (progress >= 1) {
          progress = 0;
          select((idx + 1) % REEL_CARDS.length, false);
        }
      }
      if (bar) bar.style.width = (Math.min(1, progress) * 100).toFixed(2) + '%';
      raf = requestAnimationFrame(step);
    }

    var start = function () { if (!running) { running = true; last = 0; raf = requestAnimationFrame(step); } };
    var stop = function () { running = false; if (raf) cancelAnimationFrame(raf); };

    whenVisible(stage, start, stop, '80px', 900);
  }

  /* ---------- offices + globe ---------- */

  function initOffices(focusOffice) {
    var host = $('[data-offices]');
    if (!host) return;

    OFFICES.forEach(function (o, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'office';
      btn.innerHTML =
        '<div class="office__row">' +
          '<span class="office__flag"></span>' +
          '<span class="office__country"></span>' +
          '<span class="office__city"></span>' +
        '</div>' +
        '<div class="office__role"></div>';
      $('.office__flag', btn).textContent = o.flag;
      $('.office__country', btn).textContent = o.country;
      $('.office__city', btn).textContent = o.city;
      $('.office__role', btn).textContent = o.role;
      btn.addEventListener('click', function () { focusOffice(i); });
      host.appendChild(btn);
    });
  }

  function initGlobe() {
    var canvas = $('[data-globe]');
    var card = $('[data-globe-card]');
    var noop = function () {};
    if (!canvas || !card) return { focus: noop, resize: noop };

    var wrap = canvas.parentElement;
    var ctx = canvas.getContext('2d');
    var D2R = Math.PI / 180;
    var TILT = -0.42;
    var cT = Math.cos(TILT), sT = Math.sin(TILT);

    // the globe is drawn on whatever surface the section carries, so it
    // reads its dot / ring colours from the tone tokens
    var wrapStyle = getComputedStyle(wrap);
    var dotRgb = (wrapStyle.getPropertyValue('--globe-dot-rgb').trim() || '146,178,200');
    var ringColor = (wrapStyle.getPropertyValue('--globe-ring').trim() || 'rgba(242,245,247,.08)');

    var GA = Math.PI * (3 - Math.sqrt(5));
    function fib(n) {
      var arr = [];
      for (var i = 0; i < n; i++) {
        var y = 1 - (i / (n - 1)) * 2;
        var r = Math.sqrt(Math.max(0, 1 - y * y));
        arr.push([Math.cos(GA * i) * r, y, Math.sin(GA * i) * r]);
      }
      return arr;
    }

    var dots = fib(1500);          // plain dotted sphere until land data arrives
    var N = dots.length;
    var isLand = false;
    var bgDots = fib(900);
    var redrawStatic = function () {};

    function loadLand() {
      fetch('assets/land-110m.json')
        .then(function (r) { return r.json(); })
        .then(function (topo) {
          var sc = topo.transform.scale, tl = topo.transform.translate;
          var arcs = topo.arcs.map(function (arc) {
            var ax = 0, ay = 0;
            return arc.map(function (d) { ax += d[0]; ay += d[1]; return [ax * sc[0] + tl[0], ay * sc[1] + tl[1]]; });
          });
          var ring = function (idxs) {
            var pts = [];
            idxs.forEach(function (ai) {
              var a = ai >= 0 ? arcs[ai] : arcs[~ai].slice().reverse();
              pts = pts.concat(pts.length ? a.slice(1) : a);
            });
            return pts;
          };
          var MW = 720, MH = 360;
          var mc = document.createElement('canvas');
          mc.width = MW; mc.height = MH;
          var mx = mc.getContext('2d');
          mx.fillStyle = '#fff';
          mx.beginPath();
          var geoms = topo.objects.land.geometries || [topo.objects.land];
          geoms.forEach(function (gm) {
            var polys = gm.type === 'Polygon' ? [gm.arcs] : gm.arcs;
            polys.forEach(function (poly) {
              poly.forEach(function (idxs) {
                ring(idxs).forEach(function (p, i) {
                  var px = (p[0] + 180) * 2, py = (90 - p[1]) * 2;
                  if (i === 0) mx.moveTo(px, py); else mx.lineTo(px, py);
                });
                mx.closePath();
              });
            });
          });
          mx.fill('evenodd');
          var img = mx.getImageData(0, 0, MW, MH).data;
          var R2D = 180 / Math.PI;
          var land = fib(9000).filter(function (p) {
            var lat = Math.asin(p[1]) * R2D;
            var lonp = Math.atan2(p[0], p[2]) * R2D;
            var xi = Math.min(MW - 1, Math.max(0, Math.round((lonp + 180) * 2)));
            var yi = Math.min(MH - 1, Math.max(0, Math.round((90 - lat) * 2)));
            return img[(yi * MW + xi) * 4 + 3] > 128;
          });
          if (land.length > 200) { dots = land; N = dots.length; isLand = true; redrawStatic(); }
        })
        .catch(function () { /* offline — keep the plain dotted sphere */ });
    }

    var mk = OFFICES.map(function (o) {
      return { sy: Math.sin(o.lat * D2R), cl: Math.cos(o.lat * D2R), lon: o.lng * D2R };
    });

    var W = 0, dpr = 1;
    function size() {
      var w = Math.max(240, wrap.clientWidth || 480);
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = w;
      canvas.width = w * dpr;
      canvas.height = w * dpr;
    }

    function norm(a) {
      a = a % (Math.PI * 2);
      if (a > Math.PI) a -= Math.PI * 2;
      if (a < -Math.PI) a += Math.PI * 2;
      return a;
    }

    var screens = [];

    // a marker flares white the moment it becomes the highlighted one,
    // then falls back to its steady pulse over FLASH_MS
    var FLASH_MS = 620;
    var flashAt = [];

    // progress 0→1 through the flash, or -1 when this marker isn't flaring.
    // 0 is a live value (the brightest frame), so it can't double as "off".
    function flashOf(m, time) {
      var at = flashAt[m];
      if (at == null) return -1;
      var p = (time - at) / FLASH_MS;
      if (p < 0 || p >= 1) return -1;
      return p;
    }

    function draw(rot, time, litAll) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, W);
      var c = W / 2, R = W * 0.415;
      var rgb = hexRgb(currentSig());
      var sr = rgb[0], sg = rgb[1], sb = rgb[2];

      ctx.beginPath();
      ctx.arc(c, c, R + 8, 0, 6.2832);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      var cR = Math.cos(rot), sR = Math.sin(rot);
      var plot = function (p, dim) {
        var x1 = p[0] * cR + p[2] * sR;
        var z1 = p[2] * cR - p[0] * sR;
        var y2 = p[1] * cT - z1 * sT, z2 = p[1] * sT + z1 * cT;
        if (z2 < -0.1) return;
        var a = dim ? 0.06 + 0.17 * Math.max(0, z2) : (isLand ? 0.22 + 0.62 * Math.max(0, z2) : 0.10 + 0.46 * Math.max(0, z2));
        ctx.fillStyle = 'rgba(' + dotRgb + ',' + a.toFixed(3) + ')';
        var s2 = (isLand && !dim) ? 1.8 : 1.5;
        ctx.fillRect(c + x1 * R, c - y2 * R, s2, s2);
      };

      if (isLand) { for (var b = 0; b < bgDots.length; b++) plot(bgDots[b], true); }
      for (var i = 0; i < N; i++) plot(dots[i], false);

      screens.length = 0;
      for (var m = 0; m < mk.length; m++) {
        var o = mk[m];
        var x1 = o.cl * Math.sin(o.lon + rot);
        var z1 = o.cl * Math.cos(o.lon + rot);
        var y2 = o.sy * cT - z1 * sT, z2 = o.sy * sT + z1 * cT;
        var px = c + x1 * R, py = c - y2 * R;
        var front = z2 > 0.06;
        screens.push({ x: px, y: py, front: front || litAll });

        if (front || litAll) {
          var pulse = 0.5 + 0.5 * Math.sin(time / 520 + m * 1.7);

          // p runs 0→1 across the flash; blast decays fast, shock ring expands
          var p = flashOf(m, time);
          var lit = p >= 0;
          var blast = lit ? (1 - p) * (1 - p) : 0;

          var gr = (9 + 5 * pulse) * (1 + 1.7 * blast);
          var g = ctx.createRadialGradient(px, py, 0, px, py, gr);
          g.addColorStop(0, 'rgba(' + sr + ',' + sg + ',' + sb + ',' + (0.5 + 0.5 * blast).toFixed(3) + ')');
          g.addColorStop(1, 'rgba(' + sr + ',' + sg + ',' + sb + ',0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(px, py, gr, 0, 6.2832); ctx.fill();

          // expanding shockwave, only while the flash is alive
          if (lit) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.5 * (1 - p)).toFixed(3) + ')';
            ctx.lineWidth = 1.6 * (1 - p) + 0.4;
            ctx.beginPath(); ctx.arc(px, py, 5 + 34 * p, 0, 6.2832); ctx.stroke();
          }

          ctx.fillStyle = 'rgb(' + sr + ',' + sg + ',' + sb + ')';
          ctx.beginPath(); ctx.arc(px, py, 3.2 + 2.4 * blast, 0, 6.2832); ctx.fill();

          // white-hot core at the peak of the blast
          if (blast > 0.01) {
            ctx.fillStyle = 'rgba(255,255,255,' + (0.9 * blast).toFixed(3) + ')';
            ctx.beginPath(); ctx.arc(px, py, 2.2 + 1.8 * blast, 0, 6.2832); ctx.fill();
          }

          ctx.strokeStyle = 'rgba(' + sr + ',' + sg + ',' + sb + ',' + (0.25 + 0.35 * pulse + 0.4 * blast).toFixed(2) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, 6.5 + 3 * pulse, 0, 6.2832); ctx.stroke();
        } else if (z2 > -0.4) {
          ctx.fillStyle = 'rgba(' + dotRgb + ',.45)';
          ctx.beginPath(); ctx.arc(px, py, 1.8, 0, 6.2832); ctx.fill();
        }
      }
    }

    function showCard(i) {
      var o = OFFICES[i], s = screens[i];
      if (!o || !s) return;
      $('[data-gc-flag]', card).textContent = o.flag;
      $('[data-gc-name]', card).textContent = o.country + ' — ' + o.city;
      $('[data-gc-role]', card).textContent = o.role;
      card.style.left = Math.max(112, Math.min(W - 112, s.x)) + 'px';
      card.style.top = Math.max(84, s.y - 14) + 'px';
      card.style.opacity = '1';
    }
    function hideCard() { card.style.opacity = '0'; }

    size();
    loadLand();

    if (reduce) {
      var sRot = -mk[0].lon;
      redrawStatic = function () { draw(sRot, 0, true); };
      redrawStatic();
      showCard(0);
      return {
        focus: function (i) { sRot = -mk[i].lon; draw(sRot, 0, true); showCard(i); },
        resize: function () { size(); draw(sRot, 0, true); }
      };
    }

    var CRUISE = 0.16;
    var rot = -mk[0].lon - 0.7, vel = CRUISE, last = 0;
    var pauseUntil = 0, active = -1, prevActive = -1, hover = -1, rotTarget = null, targetIdx = -1;
    var running = false, raf = 0;
    redrawStatic = function () { if (!running) draw(rot, 0, false); };

    function step(ts) {
      if (!running) return;
      if (!last) last = ts;
      var dt = Math.min(0.05, (ts - last) / 1000);
      last = ts;
      var now = performance.now();

      if (rotTarget !== null) {
        var diff = norm(rotTarget - rot);
        rot += diff * Math.min(1, dt * 4);
        if (Math.abs(diff) < 0.015) {
          rot = rotTarget; rotTarget = null; vel = 0;
          pauseUntil = now + 2400; active = targetIdx;
        }
      } else {
        // steady spin, west→east like the real Earth; pauses only for hover/tap
        var tv = (hover >= 0 || now < pauseUntil) ? 0 : CRUISE;
        vel += (tv - vel) * Math.min(1, dt * 5);
        rot += vel * dt;
        if (hover >= 0) {
          active = hover;
        } else if (now >= pauseUntil) {
          var bd = Infinity, bi = -1;
          for (var i = 0; i < mk.length; i++) {
            var d = Math.abs(norm(mk[i].lon + rot));
            if (d < bd) { bd = d; bi = i; }
          }
          active = bd < 0.22 ? bi : -1;
        }
      }

      // the frame a marker takes over the highlight, set it off
      if (active !== prevActive) {
        if (active >= 0) flashAt[active] = ts;
        prevActive = active;
      }

      draw(rot, ts, false);
      if (active >= 0 && screens[active] && screens[active].front) showCard(active);
      else hideCard();
      raf = requestAnimationFrame(step);
    }

    function hit(e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      for (var i = 0; i < screens.length; i++) {
        var s = screens[i];
        if (s && s.front && (x - s.x) * (x - s.x) + (y - s.y) * (y - s.y) < 340) return i;
      }
      return -1;
    }

    canvas.addEventListener('mousemove', function (e) {
      hover = hit(e);
      canvas.style.cursor = hover >= 0 ? 'pointer' : '';
    });
    canvas.addEventListener('mouseleave', function () { hover = -1; });
    canvas.addEventListener('click', function (e) {
      var i = hit(e);
      // re-fire even if this marker is already the active one
      if (i >= 0) { active = i; prevActive = i; flashAt[i] = performance.now(); pauseUntil = performance.now() + 2600; }
    });

    draw(rot, 0, false); // static frame before the loop starts

    var start = function () { if (!running) { running = true; last = 0; raf = requestAnimationFrame(step); } };
    var stop = function () { running = false; if (raf) cancelAnimationFrame(raf); };

    whenVisible(canvas, start, stop, '120px', 700);

    return {
      focus: function (i) { targetIdx = i; rotTarget = -mk[i].lon; },
      resize: function () { size(); if (!running) draw(rot, 0, false); }
    };
  }

  /* ---------- motion helpers ---------- */

  // run `start` while `el` is on screen, `stop` when it leaves.
  // Some embeds never fire IO callbacks — fall back to always-on.
  function whenVisible(el, start, stop, rootMargin, fallbackMs) {
    var fired = false;
    var io = new IntersectionObserver(function (entries) {
      fired = true;
      entries.forEach(function (en) { if (en.isIntersecting) start(); else stop(); });
    }, { rootMargin: rootMargin });
    io.observe(el);
    setTimeout(function () { if (!fired) { io.disconnect(); start(); } }, fallbackMs);
  }

  function initReveals() {
    if (reduce) return;
    var els = $$('[data-reveal]');
    if (!els.length) return;

    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .85s cubic-bezier(.16,.84,.44,1), transform .85s cubic-bezier(.16,.84,.44,1)';
      if (el.dataset.d) el.style.transitionDelay = el.dataset.d + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      els.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
    }, 3500);
  }

  function initWordSplit() {
    if (reduce) return;
    $$('[data-wordsplit]').forEach(function (el) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
          if (ch.nodeType === 3 && ch.textContent.trim()) {
            var frag = document.createDocumentFragment();
            ch.textContent.split(/(\s+)/).forEach(function (tok) {
              if (!tok) return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(tok)); return; }
              var s = document.createElement('span');
              s.textContent = tok;
              s.setAttribute('data-w', '');
              s.style.cssText = 'display:inline-block; opacity:0; transform:translateY(16px); filter:blur(6px); transition:opacity .6s ease, transform .6s ease, filter .6s ease; transition-delay:' + (i * 30) + 'ms;';
              i++;
              frag.appendChild(s);
            });
            node.replaceChild(frag, ch);
          } else if (ch.nodeType === 1) {
            walk(ch);
          }
        });
      })(el);

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          $$('[data-w]', e.target).forEach(function (w) {
            w.style.opacity = '1'; w.style.transform = 'none'; w.style.filter = 'none';
          });
          io.unobserve(e.target);
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });

    setTimeout(function () {
      $$('[data-w]').forEach(function (w) { w.style.opacity = '1'; w.style.transform = 'none'; w.style.filter = 'none'; });
    }, 4500);
  }

  function initParallax() {
    if (reduce) return;
    var plx = $$('[data-plx]');
    if (!plx.length) return;

    var ticking = false;
    function apply() {
      var y = window.scrollY || 0;
      plx.forEach(function (el) {
        var s = parseFloat(el.dataset.plx) || 0;
        el.style.transform = 'translate3d(0,' + (y * s).toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  }

  function initCounters() {
    if (reduce) return;
    var nums = $$('[data-count]');
    if (!nums.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count')) || 0;
        var t0 = performance.now();
        var dur = 1400;
        var tick = function (ts) {
          var p = Math.min(1, (ts - t0) / dur);
          var ease = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * ease));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- boot ---------- */

  function boot() {
    buildOrnCells();
    initNav();
    initHeroDrafts();
    initBearings();
    initMethod();
    initDemos();
    initReel();

    var globe = initGlobe();
    initOffices(globe.focus);
    window.addEventListener('resize', globe.resize, { passive: true });

    initReveals();
    initWordSplit();
    initParallax();
    initCounters();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
