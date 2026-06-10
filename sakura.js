/*  sakura.js — 逼真樱花树枝装饰 + 轻柔飘落花瓣
 *  仅用于主页 (index.html)，营造淡雅樱花氛围
 *  可选配置：window.SAKURA_CONFIG = { petals: 18, opacity: 0.30 }
 */
(function () {
  "use strict";

  var CFG = window.SAKURA_CONFIG || {};
  var PETAL_COUNT = CFG.petals || 18;
  var TREE_OPACITY = CFG.opacity || 0.30;

  /* ========================================
     1. 逼真樱花树枝 SVG
     ======================================== */

  // 花朵生成器 — 真实5瓣樱花
  function flower(cx, cy, size, rot, variant) {
    var colors = [
      { petal: "#FFCDD8", inner: "#FFE8EE", center: "#FFA0B4", stamen: "#E8649E" },
      { petal: "#FFD6E0", inner: "#FFF0F4", center: "#FFB0C0", stamen: "#E8649E" },
      { petal: "#FFE0E8", inner: "#FFF5F8", center: "#FFC0D0", stamen: "#D4608A" }
    ];
    var c = colors[variant % colors.length];
    var svg = '<g transform="translate(' + cx + "," + cy + ") rotate(" + rot + ')">';

    for (var i = 0; i < 5; i++) {
      var a = i * 72;
      svg +=
        '<path d="M0,0 C' +
        (size * 0.35).toFixed(1) + "," + (-size * 0.12).toFixed(1) + " " +
        (size * 0.48).toFixed(1) + "," + (-size * 0.58).toFixed(1) + " " +
        (size * 0.06).toFixed(1) + "," + (-size).toFixed(1) +
        " L0," + (-size * 0.82).toFixed(1) +
        " L" + (-size * 0.06).toFixed(1) + "," + (-size).toFixed(1) +
        " C" + (-size * 0.48).toFixed(1) + "," + (-size * 0.58).toFixed(1) + " " +
        (-size * 0.35).toFixed(1) + "," + (-size * 0.12).toFixed(1) +
        ' 0,0Z" fill="' + c.petal + '" transform="rotate(' + a + ')" opacity="0.88"/>';
    }
    svg += '<circle r="' + (size * 0.13).toFixed(1) + '" fill="' + c.center + '"/>';
    for (var j = 0; j < 5; j++) {
      var sa = j * 72 + 36;
      var sx = Math.cos((sa * Math.PI) / 180) * size * 0.2;
      var sy = Math.sin((sa * Math.PI) / 180) * size * 0.2;
      svg +=
        '<circle cx="' + sx.toFixed(1) + '" cy="' + sy.toFixed(1) +
        '" r="' + (size * 0.04).toFixed(1) + '" fill="' + c.stamen + '" opacity="0.65"/>';
    }
    svg += "</g>";
    return svg;
  }

  // 花蕾 — 未开放的小花苞
  function bud(cx, cy, size, rot) {
    return (
      '<ellipse cx="' + cx + '" cy="' + cy +
      '" rx="' + (size * 0.35).toFixed(1) + '" ry="' + (size * 0.55).toFixed(1) +
      '" fill="#FFD0DA" opacity="0.7" transform="rotate(' + rot + " " + cx + " " + cy + ')"/>'
    );
  }

  // 花簇 — 在一个位置生成一组花（3-5朵 + 花蕾）
  function cluster(cx, cy, baseSize, count) {
    var svg = "";
    for (var i = 0; i < count; i++) {
      var angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      var dist = baseSize * 0.6 + Math.random() * baseSize * 0.8;
      var fx = cx + Math.cos(angle) * dist;
      var fy = cy + Math.sin(angle) * dist;
      var fs = baseSize * 0.6 + Math.random() * baseSize * 0.5;
      var fr = Math.random() * 360;
      svg += flower(fx, fy, fs, fr, i);
    }
    // 加 1-2 个花蕾
    for (var j = 0; j < 2; j++) {
      var ba = Math.random() * Math.PI * 2;
      var bd = baseSize * 1.0 + Math.random() * baseSize * 0.6;
      svg += bud(
        cx + Math.cos(ba) * bd,
        cy + Math.sin(ba) * bd,
        baseSize * 0.5 + Math.random() * baseSize * 0.3,
        Math.random() * 360
      );
    }
    return svg;
  }

  var svg =
    '<svg viewBox="0 0 700 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMin meet">' +
    "<defs>" +
      // 树干渐变 — 从深棕到浅褐
      '<linearGradient id="sk-bark" x1="0" y1="1" x2="0.3" y2="0">' +
        '<stop offset="0%" stop-color="#5A4A3A"/>' +
        '<stop offset="40%" stop-color="#7B6B5B"/>' +
        '<stop offset="100%" stop-color="#8B7B6B"/>' +
      "</linearGradient>" +
      // 树皮纹理滤镜
      '<filter id="sk-barkTex" x="-5%" y="-5%" width="110%" height="110%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="4" seed="3" result="noise"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>' +
      "</filter>" +
      // 柔和阴影
      '<filter id="sk-softShadow">' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="3"/>' +
        '<feOffset dx="2" dy="3"/>' +
        '<feComponentTransfer><feFuncA type="linear" slope="0.08"/></feComponentTransfer>' +
        '<feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>' +
      "</filter>" +
    "</defs>";

  // ── 树干（使用 filter 增加树皮纹理感） ──
  svg += '<g filter="url(#sk-barkTex)">';
  // 主树干 — 粗，从右下到右上
  svg +=
    '<path d="M640,600 Q620,530 600,470 Q575,400 555,340 Q535,280 520,230 Q505,185 495,150 Q485,115 478,88" ' +
    'stroke="url(#sk-bark)" stroke-width="16" fill="none" stroke-linecap="round"/>';
  // 树干右侧纹理线
  svg +=
    '<path d="M630,580 Q615,520 598,465" stroke="#6B5B4B" stroke-width="1.5" fill="none" opacity="0.3" stroke-linecap="round"/>';
  svg +=
    '<path d="M645,590 Q625,535 608,480" stroke="#7B6B5B" stroke-width="1" fill="none" opacity="0.25" stroke-linecap="round"/>';

  // ── 主树枝 ──
  // 枝1 — 左上主枝
  svg +=
    '<path d="M478,88 Q440,65 390,48 Q340,32 280,25 Q240,20 195,18" ' +
    'stroke="url(#sk-bark)" stroke-width="9" fill="none" stroke-linecap="round"/>';
  // 枝2 — 中部左伸
  svg +=
    '<path d="M520,230 Q478,205 430,185 Q385,168 335,155 Q295,145 250,138" ' +
    'stroke="url(#sk-bark)" stroke-width="7.5" fill="none" stroke-linecap="round"/>';
  // 枝3 — 下部左伸
  svg +=
    '<path d="M555,340 Q520,315 480,298 Q445,282 405,270 Q375,262 340,255" ' +
    'stroke="url(#sk-bark)" stroke-width="6" fill="none" stroke-linecap="round"/>';
  // 枝4 — 顶部短枝
  svg +=
    '<path d="M478,88 Q460,55 440,35" ' +
    'stroke="url(#sk-bark)" stroke-width="5" fill="none" stroke-linecap="round"/>';

  // ── 二级分枝 ──
  // 从枝1分出
  svg +=
    '<path d="M390,48 Q365,25 335,12 Q310,2 280,0" ' +
    'stroke="url(#sk-bark)" stroke-width="5" fill="none" stroke-linecap="round"/>';
  svg +=
    '<path d="M280,25 Q255,8 228,2" ' +
    'stroke="url(#sk-bark)" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  // 从枝2分出
  svg +=
    '<path d="M430,185 Q405,160 375,142 Q350,128 320,118" ' +
    'stroke="url(#sk-bark)" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
  svg +=
    '<path d="M335,155 Q315,135 290,122" ' +
    'stroke="url(#sk-bark)" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  // 从枝3分出
  svg +=
    '<path d="M480,298 Q460,275 435,260 Q415,248 390,240" ' +
    'stroke="url(#sk-bark)" stroke-width="4" fill="none" stroke-linecap="round"/>';
  svg +=
    '<path d="M405,270 Q388,252 365,242" ' +
    'stroke="url(#sk-bark)" stroke-width="3" fill="none" stroke-linecap="round"/>';

  // ── 细枝/末梢 ──
  svg +=
    '<path d="M195,18 Q175,10 155,8" stroke="url(#sk-bark)" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  svg +=
    '<path d="M280,0 Q262,-5 245,-2" stroke="url(#sk-bark)" stroke-width="2" fill="none" stroke-linecap="round"/>';
  svg +=
    '<path d="M320,118 Q302,108 285,102" stroke="url(#sk-bark)" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  svg +=
    '<path d="M340,255 Q322,248 305,245" stroke="url(#sk-bark)" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
  svg +=
    '<path d="M390,240 Q375,232 358,228" stroke="url(#sk-bark)" stroke-width="2" fill="none" stroke-linecap="round"/>';
  svg +=
    '<path d="M555,340 Q540,325 520,318" stroke="url(#sk-bark)" stroke-width="3" fill="none" stroke-linecap="round"/>';

  svg += "</g>"; // 结束树干 group

  // ── 花朵层（带柔和阴影） ──
  svg += '<g filter="url(#sk-softShadow)">';

  // 顶部花簇 — 枝1末端
  svg += cluster(195, 18, 14, 5);
  svg += cluster(155, 8, 11, 3);
  svg += cluster(240, 20, 12, 4);

  // 枝1二级分枝花簇
  svg += cluster(280, 0, 13, 4);
  svg += cluster(245, -2, 10, 3);
  svg += cluster(335, 12, 12, 4);

  // 枝1沿途散花
  svg += flower(350, 38, 10, 45, 0);
  svg += flower(420, 58, 9, 120, 1);
  svg += bud(460, 78, 7, 30);

  // 枝2花簇
  svg += cluster(250, 138, 14, 5);
  svg += cluster(290, 122, 12, 4);
  svg += cluster(320, 118, 13, 4);
  svg += cluster(285, 102, 10, 3);

  // 枝2沿途散花
  svg += flower(380, 165, 9, 200, 2);
  svg += flower(460, 200, 8, 80, 0);
  svg += bud(500, 218, 6, 45);

  // 枝3花簇
  svg += cluster(340, 255, 13, 4);
  svg += cluster(305, 245, 11, 3);
  svg += cluster(390, 240, 12, 4);
  svg += cluster(365, 242, 10, 3);
  svg += cluster(358, 228, 9, 3);

  // 枝3沿途散花
  svg += flower(430, 278, 8, 160, 1);
  svg += flower(510, 310, 7, 90, 2);
  svg += bud(520, 318, 6, 60);

  // 枝4（顶部短枝）花簇
  svg += cluster(440, 35, 12, 4);

  // 树干沿途零星花蕾
  svg += bud(495, 150, 5, 20);
  svg += bud(535, 280, 5, 70);
  svg += bud(575, 400, 4, 110);

  svg += "</g>"; // 结束花朵层

  // ── 散落单瓣（增加自然感） ──
  var singlePetalPositions = [
    [180, 45], [220, 55], [310, 85], [370, 130],
    [265, 160], [415, 245], [475, 290], [540, 355],
    [300, 30], [450, 70], [350, 200]
  ];
  for (var sp = 0; sp < singlePetalPositions.length; sp++) {
    var px = singlePetalPositions[sp][0];
    var py = singlePetalPositions[sp][1];
    var pr = Math.random() * 360;
    var ps = 4 + Math.random() * 3;
    svg +=
      '<path d="M0,' + (-ps).toFixed(1) + " C" + (ps * 0.4).toFixed(1) + "," + (-ps * 0.1).toFixed(1) + " " +
      (ps * 0.35).toFixed(1) + "," + (ps * 0.25).toFixed(1) + " 0," + (ps * 0.4).toFixed(1) +
      " C" + (-ps * 0.35).toFixed(1) + "," + (ps * 0.25).toFixed(1) + " " +
      (-ps * 0.4).toFixed(1) + "," + (-ps * 0.1).toFixed(1) + " 0," + (-ps).toFixed(1) +
      'Z" fill="#FFD0DA" opacity="0.4" transform="translate(' + px + "," + py + ") rotate(" + pr + ')"/>';
  }

  svg += "</svg>";

  var tree = document.createElement("div");
  tree.className = "sakura-tree-wrap";
  tree.setAttribute("aria-hidden", "true");
  tree.innerHTML = svg;
  tree.style.opacity = TREE_OPACITY;
  document.body.appendChild(tree);

  /* ========================================
     2. 轻柔飘落花瓣（Canvas）
     ======================================== */
  var canvas = document.createElement("canvas");
  canvas.id = "sakuraCanvas";
  canvas.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:2;";
  document.body.appendChild(canvas);

  var ctx = canvas.getContext("2d");
  var W, H;
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  var petalColors = [
    "rgba(255,195,210,0.45)", "rgba(255,215,225,0.40)",
    "rgba(255,230,238,0.35)", "rgba(255,200,215,0.40)",
    "rgba(255,240,245,0.30)", "rgba(250,220,228,0.35)"
  ];

  var petals = [];
  function createPetal() {
    return {
      x: Math.random() * W,
      y: -15 - Math.random() * H * 0.2,
      size: Math.random() * 7 + 3,
      speed: Math.random() * 0.5 + 0.15,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.012,
      swingPhase: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.006 + 0.002,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: Math.random() * 0.22 + 0.15,
      life: 0
    };
  }

  for (var i = 0; i < PETAL_COUNT; i++) {
    var p = createPetal();
    p.y = Math.random() * H;
    petals.push(p);
  }

  function drawPetal(petal) {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.angle);
    ctx.globalAlpha = petal.opacity;
    ctx.fillStyle = petal.color;

    var s = petal.size;
    // 真实花瓣形状
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.4, -s * 0.08, s * 0.32, s * 0.25, 0, s * 0.4);
    ctx.bezierCurveTo(-s * 0.32, s * 0.25, -s * 0.4, -s * 0.08, 0, -s * 0.5);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (var i = petals.length - 1; i >= 0; i--) {
      var pt = petals[i];
      pt.life++;
      pt.y += pt.speed;
      pt.x += Math.sin(pt.swingPhase + pt.life * pt.swingSpeed) * 0.4;
      pt.angle += pt.spin;
      drawPetal(pt);
      if (pt.y > H + 20) {
        petals[i] = createPetal();
      }
    }
    requestAnimationFrame(animate);
  }
  animate();

  window.addEventListener("resize", function () {
    for (var i = 0; i < petals.length; i++) {
      petals[i].x = Math.random() * W;
    }
  });
})();
