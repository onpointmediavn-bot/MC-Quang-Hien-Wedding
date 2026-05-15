/* ==========================================================================
   MC TRỌNG KHANG — CINEMATIC INTERACTIVE ENGINE (MAIN ORCHESTRATOR)
   ========================================================================== */

// Khóa tính năng Pull-to-Refresh (kéo để làm mới) trên iOS Safari / Android
document.addEventListener('touchmove', (e) => {
    const targetScene = e.target.closest('.film-scene');
    if (!targetScene) return;

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const diffY = currentY - (window._startY || 0);
    const diffX = currentX - (window._startX || 0);

    // Chỉ can thiệp nếu vuốt DỌC mạnh hơn vuốt NGANG (để không làm kẹt chuyển cảnh)
    if (Math.abs(diffY) > Math.abs(diffX)) {
        // Nếu đang ở đỉnh section và vuốt xuống -> chặn Pull-to-Refresh
        if (targetScene.scrollTop <= 0 && diffY > 0) {
            if (e.cancelable) e.preventDefault();
        }
    }
}, { passive: false });

document.addEventListener('touchstart', (e) => {
    window._startY = e.touches[0].clientY;
    window._startX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
    // 1. REGISTER GSAP PLUGINS
    // ScrollToPlugin is loaded on the page to animate smooth scrolling coordinates on nav dot clicks.
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // Safeguard CinematicEngine namespace
    const Engine = window.CinematicEngine || {};

    // 2. INITIALIZE MODULES IN SCIENTIFIC, DEPENDENCY-AWARE ORDER
    
    // A. Visual effects (Cursor bloom)
    if (typeof Engine.initCursor === 'function') {
        Engine.initCursor();
    }

    // B. Atmospheric soundtrack controller (Audio)
    let audioController = null;
    if (typeof Engine.initAudio === 'function') {
        audioController = Engine.initAudio();
    }

    // C. Horizontal pinning scroll mechanics & Parallax layers (Scroll)
    if (typeof Engine.initScroll === 'function') {
        Engine.initScroll();
    }

    // D. Expandable media lightbox player (Lightbox popup, coupled with Audio)
    if (typeof Engine.initLightbox === 'function') {
        Engine.initLightbox(audioController);
    }
});
