/*  sakura.js — 印象派樱花 · Canvas 全渲染
 *  分层：远景光斑(bokeh) → 中景树(tree) → 近景虚瓣(fg)
 *  风韵节奏：阵风4-6s → 静息8-12s → 循环
 *  景深：远枝模糊，近枝清晰
 *  用法：<script src="sakura.js"></script>
 *  配置：window.SAKURA_CONFIG = { petals: 8, opacity: 0.92 }
 */
(function () {
  "use strict";
  var CFG = window.SAKURA_CONFIG || {};
  var MAX_PETALS = CFG.petals || 8;
  var GLOBAL_ALPHA = CFG.opacity || 0.92;

  /* ═══════════ Canvas Setup ═══════════ */
  var C = document.createElement("canvas");
  C.id = "sakuraCanvas";
  C.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2;";
  document.body.appendChild(C);
  var X = C.getContext("2d");
  var W, H, dpr;

  // 逻辑坐标系（树基于此坐标设计）
  var LW = 700, LH = 600;
  var scale = 1, offX = 0, offY = 0;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    C.width = W * dpr;
    C.height = H * dpr;
    C.style.width = W + "px";
    C.style.height = H + "px";
    scale = Math.min(W * 0.55 / LW, H * 0.7 / LH);
    offX = W - LW * scale + 20;
    offY = -30;
  }
  resize();
  window.addEventListener("resize", resize);

  // 逻辑坐标 → Canvas像素
  function tx(x) { return (offX + x * scale) * dpr; }
  function ty(y) { return (offY + y * scale) * dpr; }
  function ts(s) { return s * scale * dpr; }

  /* ═══════════ 风韵节奏系统 ═══════════ */
  var wind = { gust: false, power: 0, timer: 0, nextAt: 180, phase: 0 };

  function updateWind() {
    wind.timer++;
    wind.phase += 0.02;
    if (!wind.gust && wind.timer > wind.nextAt) {
      wind.gust = true;
      wind.timer = 0;
      wind.nextAt = 240 + Math.random() * 180; // 静息 4-6s
    }
    if (wind.gust) {
      wind.power = Math.sin((wind.timer / wind.nextAt) * Math.PI) * 0.6;
      if (wind.timer > wind.nextAt) {
        wind.gust = false;
        wind.power = 0;
        wind.timer = 0;
        wind.nextAt = 480 + Math.random() * 240; // 阵风 8-12s
      }
    }
  }

  /* ═══════════ 树干数据 ═══════════ */
  var branches = [];
  function B(x1, y1, x2, y2, w, depth) {
    branches.push({
      x1: x1, y1: y1, x2: x2, y2: y2,
      w: w, depth: depth,
      ctrl1x: x1 + (x2 - x1) * 0.3 + (Math.random() - 0.5) * w * 2,
      ctrl1y: y1 + (y2 - y1) * 0.3 + (Math.random() - 0.5) * w,
      ctrl2x: x1 + (x2 - x1) * 0.7 + (Math.random() - 0.5) * w * 2,
      ctrl2y: y1 + (y2 - y1) * 0.7 + (Math.random() - 0.5) * w,
      phase: Math.random() * Math.PI * 2,
      flex: 0.3 + (3 - depth) * 0.6 // 末梢更柔
    });
  }

  // 主干
  B(640, 600, 600, 470, 14, 0);
  B(600, 470, 555, 340, 12, 0);
  B(555, 340, 520, 230, 10, 0);
  B(520, 230, 495, 150, 8, 0);
  B(495, 150, 478, 88, 7, 0);

  // 一级枝
  B(478, 88, 390, 48, 6, 1);
  B(390, 48, 280, 25, 5, 1);
  B(280, 25, 195, 18, 4, 1);
  B(520, 230, 430, 185, 5.5, 1);
  B(430, 185, 335, 155, 4.5, 1);
  B(335, 155, 250, 138, 3.5, 1);
  B(555, 340, 480, 298, 4.5, 1);
  B(480, 298, 405, 270, 3.5, 1);
  B(405, 270, 340, 255, 3, 1);

  // 二级枝
  B(390, 48, 335, 12, 3.5, 2);
  B(335, 12, 280, 0, 2.5, 2);
  B(280, 25, 228, 2, 2.5, 2);
  B(430, 185, 375, 142, 3, 2);
  B(375, 142, 320, 118, 2.5, 2);
  B(335, 155, 290, 122, 2.5, 2);
  B(480, 298, 435, 260, 3, 2);
  B(435, 260, 390, 240, 2, 2);
  B(478, 88, 440, 35, 3.5, 2);

  // 三级末梢
  B(195, 18, 155, 8, 1.8, 3);
  B(280, 0, 245, -2, 1.5, 3);
  B(228, 2, 200, -5, 1.2, 3);
  B(320, 118, 285, 102, 1.8, 3);
  B(290, 122, 260, 110, 1.5, 3);
  B(340, 255, 305, 245, 1.8, 3);
  B(390, 240, 358, 228, 1.5, 3);
  B(440, 35, 415, 15, 1.5, 3);

  /* ═══════════ 花朵数据 ═══════════ */
  var flowers = [];
  var clusterDefs = [
    // [cx, cy, baseSize, count, clarity(0-1)]
    [195, 18, 14, 5, 1], [155, 8, 11, 3, 0.9], [240, 20, 12, 4, 1],
    [280, 0, 13, 4, 0.85], [245, -2, 10, 3, 0.8], [335, 12, 12, 4, 0.9],
    [250, 138, 14, 5, 1], [290, 122, 12, 4, 0.95], [320, 118, 13, 4, 0.9],
    [285, 102, 10, 3, 0.85],
    [340, 255, 13, 4, 1], [305, 245, 11, 3, 0.9], [390, 240, 12, 4, 0.95],
    [365, 242, 10, 3, 0.85], [358, 228, 9, 3, 0.8],
    [440, 35, 12, 4, 1]
  ];

  var petalColors = ["#FFCDD8", "#FFD6E0", "#FFE0E8", "#FFBFC8", "#FFE8EE"];
  var deepColor = "#FF8A9F";
  var highlightColor = "#FFF0F4";

  clusterDefs.forEach(function (cl) {
    var cx = cl[0], cy = cl[1], bs = cl[2], cnt = cl[3], clarity = cl[4];
    for (var i = 0; i < cnt; i++) {
      var a = (i / cnt) * Math.PI * 2 + Math.random() * 0.6;
      var d = bs * 0.5 + Math.random() * bs * 0.9;
      flowers.push({
        x: cx + Math.cos(a) * d,
        y: cy + Math.sin(a) * d,
        size: bs * 0.5 + Math.random() * bs * 0.5,
        rot: Math.random() * Math.PI * 2,
        clarity: clarity * (0.7 + Math.random() * 0.3),
        variant: Math.floor(Math.random() * petalColors.length),
        phase: Math.random() * Math.PI * 2
      });
    }
    // 花蕾
    for (var j = 0; j < 2; j++) {
      var ba = Math.random() * Math.PI * 2;
      var bd = bs * 1.0 + Math.random() * bs * 0.5;
      flowers.push({
        x: cx + Math.cos(ba) * bd,
        y: cy + Math.sin(ba) * bd,
        size: bs * 0.3 + Math.random() * bs * 0.2,
        rot: Math.random() * Math.PI * 2,
        clarity: clarity * 0.6,
        variant: -1, // 花蕾标记
        phase: Math.random() * Math.PI * 2
      });
    }
  });

  // 沿途散花
  var scatterPos = [
    [350, 38, 9, 0.7], [420, 58, 8, 0.65], [380, 165, 8, 0.7],
    [460, 200, 7, 0.6], [430, 278, 7, 0.65], [510, 310, 6, 0.5]
  ];
  scatterPos.forEach(function (s) {
    flowers.push({
      x: s[0], y: s[1], size: s[2],
      rot: Math.random() * Math.PI * 2,
      clarity: s[3], variant: Math.floor(Math.random() * petalColors.length),
      phase: Math.random() * Math.PI * 2
    });
  });

  /* ═══════════ 光斑数据 (木漏れ日) ═══════════ */
  var bokeh = [];
  for (var bi = 0; bi < 12; bi++) {
    bokeh.push({
      x: Math.random() * W, y: Math.random() * H,
      r: 15 + Math.random() * 50,
      alpha: 0.02 + Math.random() * 0.04,
      dx: (Math.random() - 0.5) * 0.08,
      dy: (Math.random() - 0.5) * 0.05,
      phase: Math.random() * Math.PI * 2
    });
  }

  /* ═══════════ 飘落花瓣 ═══════════ */
  var fallingPetals = [];
  function spawnPetal() {
    return {
      x: Math.random() * W,
      y: -20 - Math.random() * 60,
      size: 4 + Math.random() * 6,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      speed: 0.3 + Math.random() * 0.5,
      swingAmp: 15 + Math.random() * 30,
      swingFreq: 0.008 + Math.random() * 0.01,
      swingPhase: Math.random() * Math.PI * 2,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      alpha: 0.25 + Math.random() * 0.25,
      pause: 0,
      paused: false,
      life: 0,
      trail: []
    };
  }

  for (var pi = 0; pi < MAX_PETALS; pi++) {
    var fp = spawnPetal();
    fp.y = Math.random() * H;
    fallingPetals.push(fp);
  }

  /* ═══════════ 近景虚化花瓣 ═══════════ */
  var fgPetals = [
    { x: 0.05, y: 0.85, size: 55, rot: 0.3, alpha: 0.06, drift: 0.0003 },
    { x: 0.92, y: 0.15, size: 40, rot: -0.5, alpha: 0.04, drift: -0.0002 },
    { x: 0.15, y: 0.1, size: 35, rot: 1.2, alpha: 0.035, drift: 0.0004 }
  ];

  /* ═══════════ 绘制函数 ═══════════ */

  // 5瓣樱花
  function drawFlower(px, py, sz, rot, clarity, variant) {
    X.save();
    X.translate(px, py);
    X.rotate(rot);

    if (clarity < 0.6) {
      // 远景：简化为柔粉圆
      var g = X.createRadialGradient(0, 0, 0, 0, 0, sz);
      g.addColorStop(0, "rgba(255,200,215," + (clarity * 0.7).toFixed(2) + ")");
      g.addColorStop(0.6, "rgba(255,210,220," + (clarity * 0.4).toFixed(2) + ")");
      g.addColorStop(1, "rgba(255,220,230,0)");
      X.fillStyle = g;
      X.beginPath();
      X.arc(0, 0, sz, 0, Math.PI * 2);
      X.fill();
    } else {
      // 近景：5瓣花
      var baseCol = petalColors[variant % petalColors.length];
      for (var i = 0; i < 5; i++) {
        X.save();
        X.rotate((i * Math.PI * 2) / 5);
        X.beginPath();
        X.moveTo(0, 0);
        X.bezierCurveTo(sz * 0.35, -sz * 0.12, sz * 0.48, -sz * 0.58, sz * 0.06, -sz);
        X.lineTo(0, -sz * 0.82);
        X.lineTo(-sz * 0.06, -sz);
        X.bezierCurveTo(-sz * 0.48, -sz * 0.58, -sz * 0.35, -sz * 0.12, 0, 0);
        X.fillStyle = baseCol;
        X.globalAlpha = 0.85 * clarity;
        X.fill();
        // 花瓣脉络
        X.strokeStyle = deepColor;
        X.globalAlpha = 0.12 * clarity;
        X.lineWidth = 0.3;
        X.beginPath();
        X.moveTo(0, -sz * 0.1);
        X.lineTo(0, -sz * 0.7);
        X.stroke();
        X.restore();
      }
      // 花蕊
      X.globalAlpha = 0.8 * clarity;
      X.fillStyle = "#FFA0B4";
      X.beginPath();
      X.arc(0, 0, sz * 0.12, 0, Math.PI * 2);
      X.fill();
      // 花粉点
      for (var j = 0; j < 5; j++) {
        var sa = (j * Math.PI * 2) / 5 + Math.PI / 5;
        X.fillStyle = deepColor;
        X.globalAlpha = 0.5 * clarity;
        X.beginPath();
        X.arc(Math.cos(sa) * sz * 0.2, Math.sin(sa) * sz * 0.2, sz * 0.035, 0, Math.PI * 2);
        X.fill();
      }
    }
    X.restore();
  }

  // 花蕾
  function drawBud(px, py, sz, rot, clarity) {
    X.save();
    X.translate(px, py);
    X.rotate(rot);
    X.globalAlpha = 0.6 * clarity;
    X.fillStyle = "#FFD0DA";
    X.beginPath();
    X.ellipse(0, 0, sz * 0.35, sz * 0.55, 0, 0, Math.PI * 2);
    X.fill();
    X.restore();
  }

  // 飘落花瓣形状
  function drawFallingPetal(p) {
    X.save();
    X.translate(p.x * dpr, p.y * dpr);
    X.rotate(p.angle);
    X.globalAlpha = p.alpha;
    X.fillStyle = p.color;
    var s = p.size * dpr;
    X.beginPath();
    X.moveTo(0, -s * 0.5);
    X.bezierCurveTo(s * 0.4, -s * 0.08, s * 0.32, s * 0.25, 0, s * 0.4);
    X.bezierCurveTo(-s * 0.32, s * 0.25, -s * 0.4, -s * 0.08, 0, -s * 0.5);
    X.fill();
    X.restore();
  }

  /* ═══════════ 主渲染循环 ═══════════ */
  var frame = 0;

  function render() {
    X.setTransform(1, 0, 0, 1, 0, 0);
    X.clearRect(0, 0, C.width, C.height);
    X.globalAlpha = GLOBAL_ALPHA;
    frame++;
    updateWind();

    // ── 层1: 光斑 (远景) ──
    bokeh.forEach(function (b) {
      b.x += b.dx;
      b.y += b.dy;
      b.phase += 0.005;
      if (b.x < -b.r) b.x = W + b.r;
      if (b.x > W + b.r) b.x = -b.r;
      if (b.y < -b.r) b.y = H + b.r;
      if (b.y > H + b.r) b.y = -b.r;
      var pulse = 1 + Math.sin(b.phase) * 0.2;
      var r = b.r * pulse * dpr;
      var g = X.createRadialGradient(b.x * dpr, b.y * dpr, 0, b.x * dpr, b.y * dpr, r);
      g.addColorStop(0, "rgba(255,240,220," + (b.alpha * 1.2).toFixed(3) + ")");
      g.addColorStop(0.4, "rgba(255,230,210," + (b.alpha * 0.6).toFixed(3) + ")");
      g.addColorStop(1, "rgba(255,230,210,0)");
      X.fillStyle = g;
      X.beginPath();
      X.arc(b.x * dpr, b.y * dpr, r, 0, Math.PI * 2);
      X.fill();
    });

    // ── 层2: 树干 + 花朵 (中景) ──
    // 树干（水墨风：多层半透明叠加）
    var trunkColors = ["#4A3B44", "#5A4A52", "#6A5A60"];
    branches.forEach(function (b) {
      // 风偏移：末梢更柔
      var windOff = wind.power * b.flex * Math.sin(wind.phase + b.phase) * 1.5;
      var cx2 = b.ctrl2x + windOff * 3;
      var ex = b.x2 + windOff * 5;

      // 3层描边叠加（水墨感）
      for (var li = 0; li < 3; li++) {
        X.beginPath();
        X.moveTo(tx(b.x1), ty(b.y1));
        X.bezierCurveTo(
          tx(b.ctrl1x), ty(b.ctrl1y),
          tx(cx2 + li * 0.3), ty(b.ctrl2y + li * 0.2),
          tx(ex + li * 0.5), ty(b.y2 + li * 0.3)
        );
        X.strokeStyle = trunkColors[li];
        X.lineWidth = ts(b.w * (1 - li * 0.2));
        X.globalAlpha = (0.6 - li * 0.15) * (0.5 + b.depth * 0.15);
        X.lineCap = "round";
        X.stroke();
      }
    });

    // 花朵
    flowers.forEach(function (f) {
      // 找到最近的枝，应用风偏移
      var windShift = wind.power * 0.8 * Math.sin(wind.phase + f.phase);
      var fx = tx(f.x + windShift * 3);
      var fy = ty(f.y);
      var fz = ts(f.size);
      var subtleRot = f.rot + wind.power * 0.05 * Math.sin(frame * 0.03 + f.phase);

      if (f.variant === -1) {
        drawBud(fx, fy, fz, subtleRot, f.clarity);
      } else {
        drawFlower(fx, fy, fz, subtleRot, f.clarity, f.variant);
      }
    });

    // 散落单瓣（远景虚化）
    var scatterPetals = [
      [180, 45], [310, 85], [265, 160], [415, 245],
      [475, 290], [540, 355], [300, 30], [450, 70]
    ];
    scatterPetals.forEach(function (sp, idx) {
      var sx = tx(sp[0] + wind.power * 2);
      var sy = ty(sp[1]);
      var sr = ts(4 + (idx % 3));
      X.save();
      X.translate(sx, sy);
      X.rotate(frame * 0.001 + idx);
      X.globalAlpha = 0.25;
      X.fillStyle = "#FFD0DA";
      X.beginPath();
      X.ellipse(0, 0, sr * 0.6, sr, 0, 0, Math.PI * 2);
      X.fill();
      X.restore();
    });

    // ── 层3: 飘落花瓣 ──
    fallingPetals.forEach(function (p, idx) {
      p.life++;
      // 偶尔暂停
      if (p.paused) {
        p.pause--;
        if (p.pause <= 0) p.paused = false;
      } else {
        p.y += p.speed * dpr;
        // S形曲线 + 风影响
        var swing = Math.sin(p.swingPhase + p.life * p.swingFreq) * p.swingAmp * 0.015;
        var windPush = wind.power * 0.5;
        p.x += (swing + windPush) * dpr;
        p.angle += p.spin + wind.power * 0.01;
        // 随机暂停
        if (Math.random() < 0.002 && !wind.gust) {
          p.paused = true;
          p.pause = 60 + Math.random() * 120;
        }
      }
      drawFallingPetal(p);
      // 超出屏幕重置
      if (p.y > H + 30) {
        var np = spawnPetal();
        fallingPetals[idx] = np;
      }
    });

    // ── 层4: 近景虚化花瓣 (前景) ──
    fgPetals.forEach(function (fg) {
      fg.rot += fg.drift;
      var fx = fg.x * W * dpr;
      var fy = fg.y * H * dpr;
      var fs = fg.size * dpr;
      X.save();
      X.translate(fx, fy);
      X.rotate(fg.rot);
      X.globalAlpha = fg.alpha;
      // 大花瓣形状
      X.fillStyle = "#FFD6E0";
      X.beginPath();
      X.moveTo(0, -fs * 0.5);
      X.bezierCurveTo(fs * 0.5, -fs * 0.1, fs * 0.4, fs * 0.3, 0, fs * 0.5);
      X.bezierCurveTo(-fs * 0.4, fs * 0.3, -fs * 0.5, -fs * 0.1, 0, -fs * 0.5);
      X.fill();
      // 脉络
      X.strokeStyle = "#FFB0C0";
      X.globalAlpha = fg.alpha * 0.3;
      X.lineWidth = 0.5;
      X.beginPath();
      X.moveTo(0, -fs * 0.35);
      X.lineTo(0, fs * 0.35);
      X.stroke();
      X.restore();
    });

    // ── 树影（投在背景上的淡粉阴影） ──
    X.save();
    X.globalAlpha = 0.02;
    X.fillStyle = "#FFB7C5";
    branches.forEach(function (b) {
      if (b.depth < 2) return; // 只画细枝的影
      var sx = tx(b.x2) + ts(20);
      var sy = ty(b.y2) + ts(40);
      X.beginPath();
      X.arc(sx, sy, ts(b.w * 3), 0, Math.PI * 2);
      X.fill();
    });
    X.restore();

    requestAnimationFrame(render);
  }

  render();

  window.addEventListener("resize", function () {
    bokeh.forEach(function (b) {
      b.x = Math.random() * W;
      b.y = Math.random() * H;
    });
  });
})();
