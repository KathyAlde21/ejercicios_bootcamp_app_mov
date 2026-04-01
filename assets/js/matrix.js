/* ************************ */
// ANIMACION FONDO MATRIX
/* ************************ */
"use strict";

(function () {
  function startMatrixBackground({
    canvasId = "matrix-bg",
    color = "#00ff882d",
    fontSize = 16,
    fade = 0.05,
    speed = 0.35,
  } = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const chars = "アイウエオｱｲｳｴｵ01ABCDEFGHJKLMNPQRSTUVWXYZ";

    let width = 0;
    let height = 0;
    let cols = 0;
    let drops = [];
    let rafId = null;
    let lastTime = 0;
    let acc = 0;

    function sizeCanvas() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      width = w;
      height = h;
      cols = Math.max(1, Math.floor(width / fontSize));
      drops = Array(cols)
        .fill(0)
        .map(() => Math.floor(Math.random() * (height / fontSize)));

      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.fillRect(0, 0, width, height);
    }

    function drawFrame() {
      ctx.fillStyle = `rgba(0, 0, 0, ${fade})`;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i += 1) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] += 1;
        }
      }
    }

    function tick(ts) {
      if (!lastTime) lastTime = ts;
      const delta = ts - lastTime;
      lastTime = ts;
      acc += delta;

      const interval = 1000 / (20 * speed);

      if (acc >= interval) {
        drawFrame();
        acc = 0;
      }

      rafId = requestAnimationFrame(tick);
    }

    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", sizeCanvas);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    startMatrixBackground({
      canvasId: "matrix-bg",
      color: "#00ff8860",
      fontSize: 16,
      fade: 0.05,
      speed: 0.35,
    });
  });
})();
