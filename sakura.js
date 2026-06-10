/*  sakura.js — 樱花树枝装饰 + 轻柔飘落花瓣
 *  仅用于主页 (index.html)，营造淡雅樱花氛围
 *  可选配置：window.SAKURA_CONFIG = { petals: 20, opacity: 0.22 }
 */
(function () {
  "use strict";

  var CFG = window.SAKURA_CONFIG || {};
  var PETAL_COUNT = CFG.petals || 20;
  var TREE_OPACITY = CFG.opacity || 0.22;

  /* ========================================
     1. 樱花树枝 SVG 装饰
     ======================================== */
  var tree = document.createElement("div");
  tree.className = "sakura-tree-wrap";
  tree.setAttribute("aria-hidden", "true");
  tree.innerHTML =
    '<svg viewBox="0 0 600 520" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMaxYMin meet">' +
      '<defs>' +
        '<linearGradient id="sk-trunk" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#8B7B6B"/>' +
          '<stop offset="100%" stop-color="#6B5B4B"/>' +
        '</linearGradient>' +
        '<radialGradient id="sk-blos1" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="#FFD6E0" stop-opacity="0.9"/>' +
          '<stop offset="70%" stop-color="#FFB7C5" stop-opacity="0.6"/>' +
          '<stop offset="100%" stop-color="#FFB7C5" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<radialGradient id="sk-blos2" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="#FFE4EC" stop-opacity="0.85"/>' +
          '<stop offset="70%" stop-color="#FFD1DC" stop-opacity="0.5"/>' +
          '<stop offset="100%" stop-color="#FFD1DC" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<radialGradient id="sk-blos3" cx="50%" cy="50%" r="50%">' +
          '<stop offset="0%" stop-color="#FFF0F5" stop-opacity="0.8"/>' +
          '<stop offset="70%" stop-color="#FFE0EB" stop-opacity="0.4"/>' +
          '<stop offset="100%" stop-color="#FFE0EB" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +

      /* ── 主树干 ── */
      '<path d="M560,520 Q545,460 530,410 Q510,350 490,300 Q470,250 455,210 Q440,170 430,140 Q420,110 415,85" stroke="url(#sk-trunk)" stroke-width="14" fill="none" stroke-linecap="round"/>' +

      /* ── 树枝 ── */
      '<path d="M430,140 Q390,115 340,95 Q300,80 260,72" stroke="url(#sk-trunk)" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M340,95 Q315,65 285,45 Q260,30 235,22" stroke="url(#sk-trunk)" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M455,210 Q415,185 370,168 Q335,155 295,145" stroke="url(#sk-trunk)" stroke-width="6" fill="none" stroke-linecap="round"/>' +
      '<path d="M370,168 Q345,140 315,120 Q295,108 270,98" stroke="url(#sk-trunk)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M490,300 Q455,275 415,258 Q385,245 350,235" stroke="url(#sk-trunk)" stroke-width="5.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M415,258 Q395,230 370,215" stroke="url(#sk-trunk)" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M510,350 Q480,330 450,318" stroke="url(#sk-trunk)" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M415,85 Q400,60 380,42" stroke="url(#sk-trunk)" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +

      /* ── 细枝 ── */
      '<path d="M260,72 Q240,55 218,48" stroke="url(#sk-trunk)" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M295,145 Q275,130 255,122" stroke="url(#sk-trunk)" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M350,235 Q330,220 312,215" stroke="url(#sk-trunk)" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +

      /* ── 樱花簇 — 大团花 ── */
      '<circle cx="260" cy="68" r="38" fill="url(#sk-blos1)"/>' +
      '<circle cx="235" cy="22" r="32" fill="url(#sk-blos2)"/>' +
      '<circle cx="218" cy="48" r="25" fill="url(#sk-blos3)"/>' +
      '<circle cx="295" cy="140" r="35" fill="url(#sk-blos1)"/>' +
      '<circle cx="270" cy="95" r="28" fill="url(#sk-blos2)"/>' +
      '<circle cx="255" cy="122" r="22" fill="url(#sk-blos3)"/>' +
      '<circle cx="350" cy="230" r="32" fill="url(#sk-blos1)"/>' +
      '<circle cx="370" cy="212" r="26" fill="url(#sk-blos2)"/>' +
      '<circle cx="312" cy="215" r="24" fill="url(#sk-blos3)"/>' +
      '<circle cx="415" cy="80" r="30" fill="url(#sk-blos1)"/>' +
      '<circle cx="380" cy="42" r="28" fill="url(#sk-blos2)"/>' +
      '<circle cx="450" cy="315" r="28" fill="url(#sk-blos1)"/>' +
      '<circle cx="430" cy="135" r="26" fill="url(#sk-blos3)"/>' +

      /* ── 散花点缀 ── */
      '<circle cx="340" cy="92" r="18" fill="url(#sk-blos3)"/>' +
      '<circle cx="300" cy="78" r="15" fill="url(#sk-blos1)"/>' +
      '<circle cx="460" cy="205" r="20" fill="url(#sk-blos2)"/>' +
      '<circle cx="490" cy="295" r="22" fill="url(#sk-blos3)"/>' +
      '<circle cx="510" cy="345" r="18" fill="url(#sk-blos2)"/>' +

      /* ── 小花蕾 ── */
      '<circle cx="230" cy="60" r="4" fill="#FFB7C5" opacity="0.6"/>' +
      '<circle cx="250" cy="35" r="3.5" fill="#FFD1DC" opacity="0.55"/>' +
      '<circle cx="280" cy="110" r="4" fill="#FFB7C5" opacity="0.5"/>' +
      '<circle cx="310" cy="195" r="3.5" fill="#FFD1DC" opacity="0.55"/>' +
      '<circle cx="365" cy="175" r="3" fill="#FFB7C5" opacity="0.5"/>' +
      '<circle cx="400" cy="55" r="3.5" fill="#FFD1DC" opacity="0.5"/>' +
      '<circle cx="440" cy="295" r="3" fill="#FFB7C5" opacity="0.55"/>' +
    '</svg>';

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
    "rgba(255,183,197,0.5)", "rgba(255,209,220,0.45)",
    "rgba(255,228,236,0.4)", "rgba(255,192,203,0.45)",
    "rgba(255,240,245,0.35)", "rgba(250,218,221,0.4)"
  ];

  var petals = [];
  function createPetal() {
    return {
      x: Math.random() * W,
      y: -15 - Math.random() * H * 0.2,
      size: Math.random() * 7 + 3,
      speed: Math.random() * 0.6 + 0.2,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.015,
      swingPhase: Math.random() * Math.PI * 2,
      swingSpeed: Math.random() * 0.008 + 0.003,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: Math.random() * 0.25 + 0.2,
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
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.55, -s * 0.35, s * 0.45, s * 0.3, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.45, s * 0.3, -s * 0.55, -s * 0.35, 0, -s * 0.5);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (var i = petals.length - 1; i >= 0; i--) {
      var p = petals[i];
      p.life++;
      p.y += p.speed;
      p.x += Math.sin(p.swingPhase + p.life * p.swingSpeed) * 0.5;
      p.angle += p.spin;
      drawPetal(p);
      if (p.y > H + 20) {
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
