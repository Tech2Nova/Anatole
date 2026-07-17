// === 侧边栏动态特效 ===
// 包含：打字机效果、拉布拉多犬动态形象、头像光晕

document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  // ========== 1. 打字机效果 ==========
  initTypewriter(sidebar);

  // ========== 2. 拉布拉多犬动态形象 ==========
  initLabrador(sidebar);

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

  descEl.textContent = '';
  descEl.style.minHeight = descEl.style.minHeight || '1.8em';

  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.textContent = '|';
  descEl.appendChild(cursor);

  let charIndex = 0;
  const typingSpeed = 60;
  const startDelay = 800;

  function typeChar() {
    if (charIndex < fullText.length) {
      const textNode = document.createTextNode(fullText[charIndex]);
      descEl.insertBefore(textNode, cursor);
      charIndex++;
      setTimeout(typeChar, typingSpeed + Math.random() * 40);
    }
  }

  setTimeout(typeChar, startDelay);
}

// ==========================================
// 拉布拉多犬动态形象（真实图片 + 左右移动）
// ==========================================
function initLabrador(sidebar) {
  // 移动端跳过
  if (window.innerWidth < 961) return;

  // 找到插入位置：sidebar__list（社交媒体）之后、welcome-text（引言）之前
  const socialList = sidebar.querySelector('.sidebar__list');
  if (!socialList) return;

  const container = document.createElement('div');
  container.className = 'sidebar-labrador';
  container.setAttribute('aria-hidden', 'true');
  container.innerHTML = `
    <div class="labrador-walk-area">
      <img
        class="labrador-dog"
        src="/img/labrador.png"
        alt="labrador"
        draggable="false"
      />
    </div>
  `;

  // 插入到社交媒体列表之后
  socialList.insertAdjacentElement('afterend', container);

  // 左右移动（仅在博客列表页，文章详情页保持静止）
  const dog = container.querySelector('.labrador-dog');
  if (!dog) return;

  // 判断是否为博客列表页（/blog/ 或 /blog/page/N/），文章详情页不移动
  const isBlogList = /^\/blog(\/page\/\d+\/?)?\/?$/.test(window.location.pathname);
  if (!isBlogList) return;

  let direction = 1; // 1 = 向右, -1 = 向左
  let currentLeft = 50; // 起始位置百分比

  function updatePosition() {
    // 随机改变方向（20% 概率）
    if (Math.random() < 0.2) {
      direction *= -1;
    }

    // 每次移动 8% ~ 20% 的大幅度
    currentLeft += direction * (8 + Math.random() * 12);

    // 边界检测
    if (currentLeft > 85) {
      currentLeft = 85;
      direction = -1;
    } else if (currentLeft < 15) {
      currentLeft = 15;
      direction = 1;
    }

    // 根据方向翻转图片
    dog.style.transform = direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';

    dog.style.left = currentLeft + '%';

    // 每 1 秒移动一次
    setTimeout(updatePosition, 1000);
  }

  // 立即开始移动
  updatePosition();
}

// ==========================================
// 头像光晕脉动效果
// ==========================================
function initAvatarGlow(sidebar) {
  const avatar = sidebar.querySelector('.sidebar__introduction-profileimage');
  if (!avatar) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'avatar-glow-wrapper';
  avatar.parentNode.insertBefore(wrapper, avatar);
  wrapper.appendChild(avatar);
}
