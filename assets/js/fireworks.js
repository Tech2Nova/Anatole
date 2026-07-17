/* ==========================================
   彩色烟花 Canvas 动画 — blog 页面背景
   自适应亮/暗主题
   ========================================== */
(function () {
  const canvas = document.getElementById('fireworks-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let trailColor = 'rgba(255, 255, 255, 0.08)'; // 亮色主题默认

  const resize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  // 监听主题切换
  function updateTrailColor() {
    const html = document.documentElement;
    const isDark = html.classList.contains('theme--dark');
    trailColor = isDark
      ? 'rgba(0, 0, 0, 0.08)'
      : 'rgba(255, 255, 255, 0.08)';
  }
  updateTrailColor();

  // 观察 data-theme 属性变化
  const observer = new MutationObserver(updateTrailColor);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'class'],
  });

  // ── 粒子 ──
  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 5;
      this.vy = (Math.random() - 0.5) * 5 - 2;
      this.color = color;
      this.alpha = 1;
      this.decay = 0.012 + Math.random() * 0.022;
      this.size = 1.5 + Math.random() * 2.5;
    }

    draw() {
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    update() {
      this.vy += 0.04;
      this.vx *= 0.99;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }
  }

  // ── 烟花 ──
  const colors = [
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
    '#ff922b', '#cc5de8', '#20c997', '#f06595',
    '#fcc419', '#845ef7', '#ff8787', '#74c0fc',
  ];

  const particles = [];

  function burst(x, y) {
    const count = 40 + Math.floor(Math.random() * 60);
    const color = colors[Math.floor(Math.random() * colors.length)];
    const color2 = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < count; i++) {
      const c = Math.random() < 0.5 ? color : color2;
      particles.push(new Particle(x, y, c));
    }
  }

  // 每 1.2~2.5 秒放一次烟花
  let timer = 0;
  function schedule() {
    const delay = 1200 + Math.random() * 1800;
    timer = setTimeout(() => {
      const bx = width * 0.15 + Math.random() * width * 0.7;
      const by = height * 0.15 + Math.random() * height * 0.55;
      burst(bx, by);
      schedule();
    }, delay);
  }
  schedule();

  // ── 渲染循环 ──
  function loop() {
    ctx.globalAlpha = 1;
    ctx.fillStyle = trailColor;
    ctx.fillRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      } else {
        p.draw();
      }
    }
    requestAnimationFrame(loop);
  }
  loop();
})();
