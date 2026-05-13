/* ==========================================================================
   MC TRỌNG KHANG — CINEMATIC INTERACTIVE ENGINE (MAIN ORCHESTRATOR)
   ========================================================================== */

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
