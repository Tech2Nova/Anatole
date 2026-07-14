// === 返回顶部按钮 ===
document.addEventListener('DOMContentLoaded', function () {
    // 创建按钮
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', '返回顶部');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);

    // 滚动监听
    function toggleVisibility() {
        if (window.scrollY > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', toggleVisibility, { passive: true });

    // 点击回顶
    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 初始检查
    toggleVisibility();

    // === 照片画廊初始化 ===
    initPhotoGalleries();
});

// === 照片画廊逻辑 ===
function initPhotoGalleries() {
    const galleries = document.querySelectorAll('.photo-gallery');
    if (!galleries.length) return;

    // 创建灯箱
    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.innerHTML = '<button class="gallery-lightbox-close" aria-label="关闭">&times;</button><img src="" alt="">';
    document.body.appendChild(lightbox);

    const lightboxImg = lightbox.querySelector('img');
    const lightboxClose = lightbox.querySelector('.gallery-lightbox-close');

    lightbox.addEventListener('click', function (e) {
        if (e.target !== lightboxImg) closeLightbox();
    });
    lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        // iOS Safari 兼容：同时锁定 html 和 body
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }

    galleries.forEach(function (gallery) {
        const trackWrapper = gallery.querySelector('.gallery-track-wrapper');
        const prevBtn = gallery.querySelector('.gallery-btn--prev');
        const nextBtn = gallery.querySelector('.gallery-btn--next');
        const dotsContainer = gallery.querySelector('.gallery-dots');
        const slides = gallery.querySelectorAll('.gallery-slide');

        if (!slides.length) {
            // 没有图片则隐藏整个画廊
            gallery.style.display = 'none';
            return;
        }

        // 如果只有一张图，隐藏按钮和指示点
        if (slides.length === 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            dotsContainer.style.display = 'none';
            return;
        }

        // 创建指示点
        slides.forEach(function (_, i) {
            const dot = document.createElement('button');
            dot.className = 'gallery-dot';
            dot.setAttribute('aria-label', '第 ' + (i + 1) + ' 张');
            dot.addEventListener('click', function () {
                scrollToSlide(trackWrapper, slides, i);
            });
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.gallery-dot');

        // 初始激活第一个点
        if (dots.length) dots[0].classList.add('active');

        // 左右按钮
        function getCurrentIndex() {
            const scrollLeft = trackWrapper.scrollLeft;
            const slideWidth = trackWrapper.clientWidth;
            return Math.round(scrollLeft / slideWidth);
        }

        function scrollToSlide(wrapper, slideList, index) {
            if (index < 0) index = slideList.length - 1;
            if (index >= slideList.length) index = 0;
            const target = slideList[index];
            wrapper.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
        }

        function updateDots(index) {
            dots.forEach(function (d, i) {
                d.classList.toggle('active', i === index);
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                const idx = getCurrentIndex();
                scrollToSlide(trackWrapper, slides, idx - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                const idx = getCurrentIndex();
                scrollToSlide(trackWrapper, slides, idx + 1);
            });
        }

        // 滚动时更新指示点
        let scrollTimeout;
        trackWrapper.addEventListener('scroll', function () {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () {
                const idx = getCurrentIndex();
                updateDots(idx);
            }, 100);
        }, { passive: true });

        // 点击图片放大（灯箱）
        slides.forEach(function (slide) {
            const img = slide.querySelector('img');
            if (img) {
                img.addEventListener('click', function () {
                    openLightbox(img.src);
                });
            }
        });

        // 键盘左右切换（当画廊在视口内时）
        document.addEventListener('keydown', function (e) {
            const rect = gallery.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (!inView || lightbox.classList.contains('active')) return;
            if (e.key === 'ArrowLeft') {
                const idx = getCurrentIndex();
                scrollToSlide(trackWrapper, slides, idx - 1);
            } else if (e.key === 'ArrowRight') {
                const idx = getCurrentIndex();
                scrollToSlide(trackWrapper, slides, idx + 1);
            }
        });
    });
}
