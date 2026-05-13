/**
 * ==========================================================================
 * MC TRỌNG KHANG — CINEMATIC ENGINE: LIGHTBOX MOVIE PLAYER MODULE
 * ==========================================================================
 * Manages closing/opening the high-fidelity theater popup window to stream YouTube videos.
 * Keeps soundtrack volume silent when streaming videos, and restores it on close.
 */

window.CinematicEngine = window.CinematicEngine || {};

window.CinematicEngine.initLightbox = function(audioController) {
    const videoLightbox = document.getElementById('videoLightbox');
    const lightboxIframe = document.getElementById('lightboxIframe');
    const lightboxClose = document.getElementById('lightboxClose');
    const triggerCards = document.querySelectorAll('.film-reel-card, .video-slot');

    if (!videoLightbox || !lightboxIframe) return;

    triggerCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoUrl = card.getAttribute('data-video');
            if (videoUrl) {
                // Check if vertical video (YouTube shorts or card with reel-vertical class)
                const isVertical = card.classList.contains('reel-vertical') || 
                                   (videoUrl && videoUrl.includes('/shorts/')) || 
                                   card.getAttribute('data-aspect') === 'vertical';
                
                if (isVertical) {
                    videoLightbox.classList.add('vertical-mode');
                } else {
                    videoLightbox.classList.remove('vertical-mode');
                }

                // Configure high-end YouTube options: autoplay, modestbranding, rel=0, controls=1
                const refinedUrl = `${videoUrl}?autoplay=1&modestbranding=1&rel=0&controls=1`;
                lightboxIframe.src = refinedUrl;
                videoLightbox.classList.add('active');
                
                // Mute background ambient music while video plays
                if (audioController && typeof audioController.pauseAmbient === 'function') {
                    audioController.pauseAmbient();
                }
            }
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeCinemaPlayer);
    }
    
    videoLightbox.addEventListener('click', (e) => {
        if (e.target === videoLightbox) closeCinemaPlayer();
    });

    function closeCinemaPlayer() {
        videoLightbox.classList.remove('active');
        videoLightbox.classList.remove('vertical-mode');
        // Stop playback entirely by wiping src
        lightboxIframe.src = "";
        
        // Resume background ambient music if it was active
        if (audioController && typeof audioController.resumeAmbient === 'function') {
            audioController.resumeAmbient();
        }
    }
};
