// === 落地页粒子背景特效 ===
// 星空/粒子漂浮效果，适配亮/暗主题

(function () {
  const canvas = document.querySelector('.landing-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let mouseX = -1000;
  let mouseY = -1000;

  const PARTICLE_COUNT = 60;
  const CONNECTION_DIST = 150;
  const PARTICLE_SPEED = 0.25;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function isDarkTheme() {
    return document.documentElement.classList.contains('theme--dark') ||
           document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED,
        radius: Math.random() * 2.5 + 0.5,
        alpha: Math.random() * 0.6 + 0.2,
        alphaDir: Math.random() > 0.5 ? 0.002 : -0.002,
      });
    }
  }

  createParticles();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dark = isDarkTheme();
    const particleColor = dark ? '160, 190, 255' : '80, 100, 160';
    const lineColor = dark ? '120, 150, 220' : '100, 120, 180';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      p.alpha += p.alphaDir;
      if (p.alpha > 0.8 || p.alpha < 0.1) p.alphaDir *= -1;

      // 鼠标轻微吸引
      if (mouseX > 0 && mouseY > 0) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += (dx / dist) * 0.015;
          p.vy += (dy / dist) * 0.015;
          p.vx *= 0.996;
          p.vy *= 0.996;
        }
      }

      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > PARTICLE_SPEED * 2) {
        p.vx = (p.vx / speed) * PARTICLE_SPEED * 2;
        p.vy = (p.vy / speed) * PARTICLE_SPEED * 2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${lineColor}, ${lineAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(animate);
  }

  animate();
})();
