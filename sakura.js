/*  sakura.js — 印象派樱花 · Canvas 全渲染
 *  分层：远景光斑(bokeh) → 中景树(tree) → 近景虚瓣(fg)
 *  风韵节奏：阵风4-6s → 静息8-12s → 循环
 *  景深：远枝模糊，近枝清晰
 *  用法：<script src="sakura.js"></script>
 *  配置：window.SAKURA_CONFIG = { petals: 50, opacity: 1.0 }
 */
(function () {
  "use strict";
  var CFG = window.SAKURA_CONFIG || {};
  var MAX_PETALS = CFG.petals || 50;
  var GLOBAL_ALPHA = CFG.opacity || 1.0;

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
    scale = Math.min(W * 0.78 / LW, H * 0.95 / LH);
    offX = W - LW * scale;
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

  /* ═══════════ 水面系统 (一期一会 · 花见水面) ═══════════ */
  var waterLine = 0.42; // 水面区域：左侧42%屏幕宽度
  var ripples = [];
  var floatingPetals = [];
  var waveLines = 22;

  function spawnRipple(rx, ry, strength) {
    if (ripples.length > 15) ripples.shift();
    ripples.push({
      x: rx, y: ry, r: 0, maxR: (60 + Math.random() * 60) * (strength || 1),
      alpha: 0.50 + Math.random() * 0.20, speed: 0.15 + Math.random() * 0.10, phase: 0
    });
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

  // 额外分叉 & 更多末梢
  B(155, 8, 130, -5, 1.2, 3);      // 左上延伸
  B(245, -2, 225, -15, 1, 3);
  B(335, 12, 315, -5, 1.5, 3);
  B(478, 88, 460, 45, 2, 2);       // 主干顶部额外枝
  B(460, 45, 425, 20, 1.5, 3);
  B(285, 102, 260, 82, 1.5, 3);
  B(260, 110, 235, 95, 1.2, 3);
  B(358, 228, 330, 215, 1.2, 3);
  B(305, 245, 278, 238, 1.5, 3);
  B(520, 230, 500, 180, 3, 2);     // 主干中段额外枝
  B(500, 180, 465, 148, 2, 3);
  B(555, 340, 540, 300, 2.5, 2);
  B(540, 300, 520, 268, 1.5, 3);
  B(250, 138, 225, 128, 2, 2);
  B(225, 128, 200, 120, 1.2, 3);
  B(600, 470, 560, 430, 5, 1);     // 主干中下额外主枝
  B(560, 430, 500, 400, 3.5, 2);
  B(500, 400, 450, 385, 2, 3);
  B(500, 400, 470, 370, 2, 3);

  /* ═══════════ 花朵数据 ═══════════ */
  var flowers = [];
  var clusterDefs = [
    // [cx, cy, baseSize, count, clarity(0-1)]
    [195, 18, 16, 7, 1], [155, 8, 14, 6, 0.9], [240, 20, 15, 6, 1],
    [130, -5, 11, 5, 0.85], [225, -15, 10, 4, 0.75],
    [280, 0, 15, 6, 0.85], [245, -2, 13, 5, 0.8], [335, 12, 15, 6, 0.9],
    [315, -5, 11, 5, 0.85], [425, 20, 10, 4, 0.9],
    [250, 138, 16, 7, 1], [290, 122, 14, 6, 0.95], [320, 118, 15, 6, 0.9],
    [285, 102, 13, 5, 0.85], [260, 82, 11, 4, 0.85], [235, 95, 9, 3, 0.8],
    [200, 120, 10, 4, 0.85],
    [340, 255, 15, 6, 1], [305, 245, 13, 5, 0.9], [390, 240, 14, 5, 0.95],
    [365, 242, 12, 4, 0.85], [358, 228, 12, 4, 0.8],
    [330, 215, 9, 3, 0.8], [278, 238, 10, 4, 0.85],
    [440, 35, 14, 5, 1], [415, 15, 12, 4, 0.9],
    [465, 148, 11, 4, 0.85], [450, 385, 12, 4, 0.8],
    [470, 370, 10, 3, 0.75], [520, 268, 10, 4, 0.8]
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
    [350, 38, 10, 0.7], [420, 58, 9, 0.65], [380, 165, 9, 0.7],
    [460, 200, 8, 0.6], [430, 278, 8, 0.65], [510, 310, 7, 0.5],
    [465, 148, 8, 0.7], [500, 180, 7, 0.65], [540, 300, 7, 0.6],
    [460, 45, 8, 0.75], [425, 20, 7, 0.7]
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
      size: 3 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
      speed: 0.3 + Math.random() * 0.5,
      swingAmp: 15 + Math.random() * 30,
      swingFreq: 0.008 + Math.random() * 0.01,
      swingPhase: Math.random() * Math.PI * 2,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      alpha: 0.70 + Math.random() * 0.20,
      pause: 0,
      paused: false,
      life: 0,
      trail: [],
      onWater: false,
      fadeTimer: 0
    };
  }

  for (var pi = 0; pi < MAX_PETALS; pi++) {
    var fp = spawnPetal();
    fp.y = Math.random() * H;
    fallingPetals.push(fp);
  }

  /* ═══════════ 近景虚化花瓣 ═══════════ */
  var fgPetals = [
    { x: 0.05, y: 0.85, size: 55, rot: 0.3, alpha: 0.20, drift: 0.0003 },
    { x: 0.92, y: 0.15, size: 40, rot: -0.5, alpha: 0.15, drift: -0.0002 },
    { x: 0.15, y: 0.1, size: 35, rot: 1.2, alpha: 0.18, drift: 0.0004 }
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

  // 飘落花瓣形状（含白边增强对比度）
  function drawFallingPetal(p) {
    X.save();
    X.translate(p.x * dpr, p.y * dpr);
    X.rotate(p.angle);
    X.globalAlpha = p.alpha;
    var s = p.size * dpr;
    // 淡阴影（增加立体感）
    X.shadowColor = "rgba(180,140,155,0.35)";
    X.shadowBlur = 2.5 * dpr;
    X.shadowOffsetX = 1 * dpr;
    X.shadowOffsetY = 1 * dpr;
    X.fillStyle = p.color;
    X.beginPath();
    X.moveTo(0, -s * 0.5);
    X.bezierCurveTo(s * 0.4, -s * 0.08, s * 0.32, s * 0.25, 0, s * 0.4);
    X.bezierCurveTo(-s * 0.32, s * 0.25, -s * 0.4, -s * 0.08, 0, -s * 0.5);
    X.fill();
    // 白边描边
    X.shadowColor = "transparent";
    X.strokeStyle = "rgba(255,255,255,0.55)";
    X.lineWidth = 0.6 * dpr;
    X.stroke();
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

    // ── 层0: 水面色洗 (白色透明 · 水的本质) ──
    var washDefs = [
      [W * 0.10, H * 0.22, W * 0.44, "245,250,252", 0.08],  // 极淡白蓝
      [W * 0.18, H * 0.55, W * 0.40, "242,248,250", 0.07],  // 极淡冰白
      [W * 0.06, H * 0.82, W * 0.36, "248,252,250", 0.06],  // 极淡白绿
      [W * 0.22, H * 0.08, W * 0.30, "245,250,248", 0.05],  // 极淡白青
      [W * 0.02, H * 0.45, W * 0.32, "250,252,253", 0.05]   // 近白
    ];
    washDefs.forEach(function (w) {
      var wg = X.createRadialGradient(w[0] * dpr, w[1] * dpr, 0, w[0] * dpr, w[1] * dpr, w[2] * dpr);
      wg.addColorStop(0, "rgba(" + w[3] + "," + w[4].toFixed(2) + ")");
      wg.addColorStop(0.5, "rgba(" + w[3] + "," + (w[4] * 0.4).toFixed(3) + ")");
      wg.addColorStop(1, "rgba(" + w[3] + ",0)");
      X.fillStyle = wg;
      X.beginPath();
      X.arc(w[0] * dpr, w[1] * dpr, w[2] * dpr, 0, Math.PI * 2);
      X.fill();
    });

    // ── 层1: 水面效果 (波纹线 + 光带 + 环境光斑) ──
    var wlPx = W * waterLine * dpr;
    var t = frame * 0.012;
    // 波纹横线 — 多层正弦叠加
    for (var wi = 0; wi < waveLines; wi++) {
      var wy = (wi / waveLines) * H;
      var wyBase = wy * dpr;
      var wAlpha = 0.04 + Math.sin(t * 0.4 + wi * 0.4) * 0.025;
      X.beginPath();
      for (var wx = 0; wx < wlPx; wx += 3 * dpr) {
        var wyOff = Math.sin(wx / (80 * dpr) + t + wi * 0.6) * 1.5 * dpr
                  + Math.sin(wx / (40 * dpr) + t * 1.7 + wi * 0.3) * 0.7 * dpr;
        if (wx === 0) X.moveTo(wx, wyBase + wyOff);
        else X.lineTo(wx, wyBase + wyOff);
      }
      X.strokeStyle = "rgba(160,210,218," + wAlpha.toFixed(3) + ")";
      X.lineWidth = (0.6 + Math.sin(t * 0.3 + wi) * 0.3) * dpr;
      X.stroke();
    }
    // 水面光带 — 水平渐变
    for (var si = 0; si < 4; si++) {
      var sy = (0.15 + si * 0.22 + Math.sin(t * 0.2 + si) * 0.03) * H;
      var sg = X.createLinearGradient(0, sy * dpr, wlPx * 0.85, sy * dpr);
      sg.addColorStop(0, "rgba(180,240,245,0)");
      sg.addColorStop(0.25, "rgba(180,240,245,0.08)");
      sg.addColorStop(0.55, "rgba(190,245,250,0.12)");
      sg.addColorStop(1, "rgba(180,240,245,0)");
      X.fillStyle = sg;
      X.fillRect(0, (sy - 10) * dpr, wlPx, 20 * dpr);
    }
    // 水面环境光斑（仅在左侧区域）
    bokeh.forEach(function (b) {
      if (b.x > W * waterLine) return;
      b.x += b.dx; b.y += b.dy; b.phase += 0.005;
      if (b.x < -b.r) b.x = W * waterLine + b.r;
      if (b.y < -b.r) b.y = H + b.r;
      if (b.y > H + b.r) b.y = -b.r;
      var pulse = 1 + Math.sin(b.phase) * 0.25;
      var r = b.r * pulse * dpr;
      var g = X.createRadialGradient(b.x * dpr, b.y * dpr, 0, b.x * dpr, b.y * dpr, r);
      g.addColorStop(0, "rgba(200,235,228," + (b.alpha * 0.8).toFixed(3) + ")");
      g.addColorStop(1, "rgba(200,235,228,0)");
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

    // ── 层3: 飘落花瓣 (含水面触碰 + 涟漪触发) ──
    fallingPetals.forEach(function (p, idx) {
      p.life++;
      if (p.onWater) {
        // 漂浮水面：极缓漂流 + 渐隐消融
        p.fadeTimer++;
        p.alpha -= 0.0008;
        p.y += 0.05 * dpr;
        p.x += Math.sin(frame * 0.015 + p.swingPhase) * 0.2 * dpr;
        p.angle += 0.002;
        if (Math.random() < 0.008 && ripples.length < 15) {
          spawnRipple(p.x, p.y, 0.4);
        }
        if (p.alpha <= 0.01 || p.fadeTimer > 400) {
          fallingPetals[idx] = spawnPetal();
          return;
        }
      } else if (p.paused) {
        p.pause--;
        if (p.pause <= 0) p.paused = false;
      } else {
        p.y += p.speed * dpr;
        var swing = Math.sin(p.swingPhase + p.life * p.swingFreq) * p.swingAmp * 0.015;
        var windPush = wind.power * 0.5;
        p.x += (swing + windPush) * dpr;
        p.angle += p.spin + wind.power * 0.01;
        if (Math.random() < 0.002 && !wind.gust) {
          p.paused = true;
          p.pause = 60 + Math.random() * 120;
        }
        // 进入左侧水面区域 → 一期一会
        if (p.x < W * waterLine && p.y > 30 && !p.onWater) {
          p.onWater = true;
          p.fadeTimer = 0;
          p.speed = 0.08;
          spawnRipple(p.x, p.y, 1);
        }
      }
      drawFallingPetal(p);
      if (p.y > H + 30 || p.x > W + 30 || p.x < -30) {
        fallingPetals[idx] = spawnPetal();
      }
    });

    // ── 涟漪（因果 · 一期一会） ──
    ripples.forEach(function (rp, ri) {
      rp.r += rp.speed * dpr;
      rp.phase++;
      var fade = 1 - (rp.r / (rp.maxR * dpr));
      if (fade <= 0) { ripples.splice(ri, 1); return; }
      // 主涟漪
      X.beginPath();
      X.arc(rp.x * dpr, rp.y * dpr, rp.r, 0, Math.PI * 2);
      X.strokeStyle = "rgba(70,200,215," + (rp.alpha * fade).toFixed(3) + ")";
      X.lineWidth = (2.0 * fade + 0.5) * dpr;
      X.stroke();
      // 内侧副涟漪
      if (rp.r > 6 * dpr) {
        X.beginPath();
        X.arc(rp.x * dpr, rp.y * dpr, rp.r * 0.55, 0, Math.PI * 2);
        X.strokeStyle = "rgba(90,215,225," + (rp.alpha * fade * 0.5).toFixed(3) + ")";
        X.lineWidth = 0.6 * dpr;
        X.stroke();
      }
      // 外侧幽灵涟漪
      if (rp.r > 12 * dpr) {
        X.beginPath();
        X.arc(rp.x * dpr, rp.y * dpr, rp.r * 1.25, 0, Math.PI * 2);
        X.strokeStyle = "rgba(60,190,205," + (rp.alpha * fade * 0.2).toFixed(3) + ")";
        X.lineWidth = 0.4 * dpr;
        X.stroke();
      }
    });

    // ── 浮水花瓣（物哀 · 美的消逝） ──
    fallingPetals.forEach(function (p) {
      if (!p.onWater || p.alpha < 0.01) return;
      X.save();
      X.translate(p.x * dpr, p.y * dpr);
      X.rotate(p.angle);
      X.globalAlpha = p.alpha * 0.35;
      // 水面倒影
      X.scale(1, -0.45);
      var s = p.size * dpr;
      X.fillStyle = p.color;
      X.beginPath();
      X.moveTo(0, -s * 0.5);
      X.bezierCurveTo(s * 0.4, -s * 0.08, s * 0.32, s * 0.25, 0, s * 0.4);
      X.bezierCurveTo(-s * 0.32, s * 0.25, -s * 0.4, -s * 0.08, 0, -s * 0.5);
      X.fill();
      X.restore();
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
