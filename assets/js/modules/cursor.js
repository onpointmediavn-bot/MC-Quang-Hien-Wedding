/**
 * ==========================================================================
 * MC TRỌNG KHANG — CINEMATIC ENGINE: CURSOR MODULE
 * ==========================================================================
 * Handles the animated lens bloom custom mouse cursor and hover expansions.
 */

window.CinematicEngine = window.CinematicEngine || {};

window.CinematicEngine.initCursor = function() {
    const cursor = document.getElementById('bloomCursor');
    if (!cursor) return;

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let cursorPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Dampened follow effect using GSAP ticker (60FPS smooth interpolation)
    gsap.ticker.add(() => {
        cursorPos.x += (mouse.x - cursorPos.x) * 0.08;
        cursorPos.y += (mouse.y - cursorPos.y) * 0.08;
        gsap.set(cursor, { x: cursorPos.x, y: cursorPos.y });
    });

    // Cursor size expansion on interactive hovers
    const interactiveElements = document.querySelectorAll('a, button, .film-reel-card, .env-gallery-item, .audio-control, input, textarea');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hovering');
        });
    });
};
