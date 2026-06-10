/*  sakura.js — 樱花飘落粒子动画 + 精致 BGM 播放器重设计
 *  用法：<script src="sakura.js"></script>
 *  会自动：
 *    1. 创建 Canvas 绘制樱花花瓣飘落动画
 *    2. 隐藏 starfield-bgm.js 的简陋播放器，创建精致新播放器
 *  可选配置：window.SAKURA_CONFIG = { petalCount: 40, darkMode: false }
 */
(function () {
  "use strict";

  var CFG = window.SAKURA_CONFIG || {};
  var PETAL_COUNT = CFG.petalCount || 40;
  var DARK = CFG.darkMode !== undefined ? CFG.darkMode : false;

  /* ========================================
     1. 樱花飘落粒子动画
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

  // 花瓣颜色池 — 柔和的粉白色系
  var petalColors = [
    "#FFB7C5", "#FFC0CB", "#FFD1DC", "#FFDDE6",
    "#FFF0F5", "#FFE4E9", "#FADADD", "#F8C8D8",
    "#E8B4C8", "#F5D0D8", "#FFE0EB", "#FFD6E0"
  ];

  var petals = [];

  function createPetal() {
    return {
      x: Math.random() * W,
      y: -20 - Math.random() * H * 0.3,
      size: Math.random() * 10 + 5,
      speed: Math.random() * 1.0 + 0.4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.03,
      swingAmp: Math.random() * 30 + 10,
      swingSpeed: Math.random() * 0.015 + 0.005,
      swingPhase: Math.random() * Math.PI * 2,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      opacity: Math.random() * 0.35 + 0.45,
      life: 0
    };
  }

  for (var i = 0; i < PETAL_COUNT; i++) {
    var p = createPetal();
    p.y = Math.random() * H; // 初始分布在整个屏幕
    petals.push(p);
  }

  function drawPetal(petal) {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate(petal.angle);
    ctx.globalAlpha = petal.opacity;

    var s = petal.size;
    ctx.fillStyle = petal.color;

    // 绘制花瓣形状（椭圆 + 尖端）
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.6, -s * 0.4, s * 0.5, s * 0.3, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.5, s * 0.3, -s * 0.6, -s * 0.4, 0, -s * 0.5);
    ctx.fill();

    // 花瓣脉络（细线）
    ctx.strokeStyle = petal.color;
    ctx.globalAlpha = petal.opacity * 0.3;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.35);
    ctx.lineTo(0, s * 0.35);
    ctx.stroke();

    ctx.restore();
  }

  function animateSakura() {
    ctx.clearRect(0, 0, W, H);

    for (var i = petals.length - 1; i >= 0; i--) {
      var p = petals[i];
      p.life++;

      // 下落 + 水平摆动
      p.y += p.speed;
      p.x += Math.sin(p.swingPhase + p.life * p.swingSpeed) * 0.8;
      p.angle += p.spin;

      drawPetal(p);

      // 超出屏幕底部 → 重置
      if (p.y > H + 30) {
        petals[i] = createPetal();
      }
    }

    requestAnimationFrame(animateSakura);
  }
  animateSakura();

  window.addEventListener("resize", function () {
    for (var i = 0; i < petals.length; i++) {
      petals[i].x = Math.random() * W;
    }
  });

  /* ========================================
     2. 精致 BGM 播放器重设计
     ======================================== */

  // 等待 DOM 和 starfield-bgm.js 播放器就绪
  function initPlayer() {
    var sfPlayer = document.querySelector(".sf-player");
    var audio = document.getElementById("sfAudio");
    var sfBtn = document.getElementById("sfBtn");

    // 隐藏原始简陋播放器
    if (sfPlayer) {
      sfPlayer.style.cssText = "display:none!important;";
    }
    if (sfBtn) {
      sfBtn.style.cssText = "display:none!important;";
    }

    if (!audio) return; // 没有 audio 元素就不创建播放器

    // 读取配置
    var sfConfig = window.SF_CONFIG || {};
    var songTitle = sfConfig.title || "BGM";
    var songArtist = sfConfig.artist || "";

    // ── 创建精致播放器 HTML ──
    var player = document.createElement("div");
    player.className = "sakura-player";
    player.innerHTML =
      '<div class="sp-album">' +
        '<div class="sp-disc" id="spDisc">' +
          '<div class="sp-disc-hole"></div>' +
        '</div>' +
      '</div>' +
      '<div class="sp-info">' +
        '<div class="sp-title-row">' +
          '<span class="sp-title">' + songTitle + '</span>' +
          '<div class="sp-visualizer" id="spViz">' +
            '<span></span><span></span><span></span><span></span><span></span>' +
          '</div>' +
        '</div>' +
        '<div class="sp-artist">' + songArtist + '</div>' +
        '<div class="sp-controls">' +
          '<button class="sp-play-btn" id="spPlayBtn">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>' +
          '</button>' +
          '<div class="sp-progress-wrap">' +
            '<div class="sp-progress-bar" id="spProgress"></div>' +
          '</div>' +
          '<button class="sp-vol-btn" id="spVolBtn">' +
            '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.47 4.47 0 002.5-3.5z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(player);

    // ── 获取元素引用 ──
    var disc = document.getElementById("spDisc");
    var playBtn = document.getElementById("spPlayBtn");
    var vizBars = document.querySelectorAll("#spViz span");
    var progressBar = document.getElementById("spProgress");
    var volBtn = document.getElementById("spVolBtn");

    // SVG 图标
    var playIcon = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>';
    var pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    var volOnIcon = '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 8.5v7a4.47 4.47 0 002.5-3.5z"/></svg>';
    var volOffIcon = '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M16.5 12A4.5 4.5 0 0014 8.5v2.09l2.41 2.41c.06-.31.09-.63.09-.97zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

    var isPlaying = false;
    var isMuted = true; // 初始静音（和 starfield-bgm.js 一致）

    function updatePlayState(playing) {
      isPlaying = playing;
      playBtn.innerHTML = playing ? pauseIcon : playIcon;
      if (playing) {
        player.classList.add("is-playing");
      } else {
        player.classList.remove("is-playing");
      }
    }

    // ── 播放/暂停 ──
    playBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (audio.paused) {
        audio.muted = false;
        isMuted = false;
        volBtn.innerHTML = volOnIcon;
        audio.play().then(function () {
          updatePlayState(true);
        }).catch(function () {});
      } else {
        audio.pause();
        updatePlayState(false);
      }
    });

    // ── 音量切换 ──
    volBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (audio.muted || isMuted) {
        audio.muted = false;
        isMuted = false;
        volBtn.innerHTML = volOnIcon;
      } else {
        audio.muted = true;
        isMuted = true;
        volBtn.innerHTML = volOffIcon;
      }
    });

    // ── 进度条更新 ──
    audio.addEventListener("timeupdate", function () {
      if (audio.duration) {
        var pct = (audio.currentTime / audio.duration) * 100;
        progressBar.style.width = pct + "%";
      }
    });

    // ── 音频事件 ──
    audio.addEventListener("play", function () {
      updatePlayState(true);
    });
    audio.addEventListener("pause", function () {
      updatePlayState(false);
    });

    // ── 首次点击取消静音（兼容 starfield-bgm.js 逻辑） ──
    function firstUnmute() {
      if (audio.muted) {
        audio.muted = false;
        isMuted = false;
        volBtn.innerHTML = volOnIcon;
        if (audio.paused) {
          audio.play().then(function () {
            updatePlayState(true);
          }).catch(function () {});
        }
      }
      document.removeEventListener("click", firstUnmute);
      document.removeEventListener("touchstart", firstUnmute);
    }
    document.addEventListener("click", firstUnmute);
    document.addEventListener("touchstart", firstUnmute);
  }

  // 延迟初始化，确保 starfield-bgm.js 已执行
  if (document.readyState === "complete") {
    setTimeout(initPlayer, 100);
  } else {
    window.addEventListener("load", function () {
      setTimeout(initPlayer, 100);
    });
  }
})();
