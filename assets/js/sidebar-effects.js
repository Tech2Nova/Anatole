// === 侧边栏动态特效 ===
// 包含：打字机效果、粒子背景、头像光晕

document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // ========== 1. 打字机效果 ==========
  initTypewriter(sidebar);

  // ========== 2. 粒子/星光背景 ==========
  initParticles(sidebar);

  // ========== 3. 头像光晕脉动 ==========
  initAvatarGlow(sidebar);
});

// ==========================================
// 打字机效果
// ==========================================
function initTypewriter(sidebar) {
  const descEl = sidebar.querySelector('.sidebar__introduction-description p');
  if (!descEl) return;

  const fullText = descEl.textContent.trim();
  if (!fullText) return;

  // 清空并逐字打印
  descEl.textContent = '';
  descEl.style.minHeight = descEl.style.minHeight || '1.8em';

  // 添加光标元素
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.textContent = '|';
  descEl.appendChild(cursor);

  let charIndex = 0;
  const typingSpeed = 60;   // 打字速度(ms)
  const startDelay = 800;   // 开始延迟

  function typeChar() {
    if (charIndex < fullText.length) {
      // 在当前字符前插入（光标始终在末尾）
      const textNode = document.createTextNode(fullText[charIndex]);
      descEl.insertBefore(textNode, cursor);
      charIndex++;
      setTimeout(typeChar, typingSpeed + Math.random() * 40);
    }
  }

  setTimeout(typeChar, startDelay);
}

// ==========================================
// 粒子/星光背景（Canvas实现，性能优异）
// ==========================================
function initParticles(sidebar) {
  // 移动端跳过粒子效果以节省性能
  if (window.innerWidth < 961) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'sidebar-particles';
  canvas.setAttribute('aria-hidden', 'true');
  sidebar.insertBefore(canvas, sidebar.firstChild);

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;
  let mouseX = -1000;
  let mouseY = -1000;

  // 粒子配置
  const PARTICLE_COUNT = 35;
  const CONNECTION_DIST = 120;
  const PARTICLE_SPEED = 0.3;

  function resize() {
    const rect = sidebar.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  resize();
  window.addEventListener('resize', resize);

  // 鼠标移动跟踪（粒子轻微跟随）
  sidebar.addEventListener('mousemove', function (e) {
    const rect = sidebar.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  sidebar.addEventListener('mouseleave', function () {
    mouseX = -1000;
    mouseY = -1000;
  });

  // 检测暗色主题
  function isDarkTheme() {
    return document.documentElement.classList.contains('theme--dark') ||
           document.documentElement.getAttribute('data-theme') === 'dark';
  }

  // 初始化粒子
  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED,
        radius: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        alphaDir: Math.random() > 0.5 ? 0.003 : -0.003,
      });
    }
  }

  createParticles();

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dark = isDarkTheme();
    const particleColor = dark ? '180, 200, 255' : '100, 120, 180';
    const lineColor = dark ? '140, 160, 220' : '120, 140, 200';

    // 更新并绘制粒子
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 移动
      p.x += p.vx;
      p.y += p.vy;

      // 边界反弹
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      // 透明度呼吸
      p.alpha += p.alphaDir;
      if (p.alpha > 0.7 || p.alpha < 0.15) p.alphaDir *= -1;

      // 鼠标吸引（轻微）
      if (mouseX > 0 && mouseY > 0) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.vx += (dx / dist) * 0.02;
          p.vy += (dy / dist) * 0.02;
          // 阻尼
          p.vx *= 0.995;
          p.vy *= 0.995;
        }
      }

      // 限速
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > PARTICLE_SPEED * 1.5) {
        p.vx = (p.vx / speed) * PARTICLE_SPEED * 1.5;
        p.vy = (p.vy / speed) * PARTICLE_SPEED * 1.5;
      }

      // 绘制粒子
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
      ctx.fill();

      // 绘制连线（仅连接近距离粒子）
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          const lineAlpha = (1 - dist / CONNECTION_DIST) * 0.25;
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

  // 主题切换时重建粒子颜色会自动适配（通过 isDarkTheme 实时检测）
}

// ==========================================
// 头像光晕脉动效果
// ==========================================
function initAvatarGlow(sidebar) {
  const avatar = sidebar.querySelector('.sidebar__introduction-profileimage');
  if (!avatar) return;

  // 包裹头像以添加光晕
  const wrapper = document.createElement('div');
  wrapper.className = 'avatar-glow-wrapper';
  avatar.parentNode.insertBefore(wrapper, avatar);
  wrapper.appendChild(avatar);
}
