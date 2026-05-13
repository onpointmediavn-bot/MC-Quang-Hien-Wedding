/**
 * ==========================================================================
 * MC QUANG HIỂN — CINEMATIC ENGINE: ATMOSPHERIC SOUNDTRACK MODULE
 * ==========================================================================
 * Handles playing/muting/resuming the ambient audio soundtrack on the page.
 * Uses native, high-performance HTML5 Audio element for 100% offline compatibility,
 * rapid load speed, and full support across all desktop/mobile web browsers.
 */

window.CinematicEngine = window.CinematicEngine || {};

window.CinematicEngine.initAudio = function() {
    const bgMusic = document.getElementById('bgMusic');
    const audioToggle = document.getElementById('audioToggle');
    if (!bgMusic || !audioToggle) return null;

    let isMuted = true;
    bgMusic.volume = 0.35; // 35% volume is ideal for elegant, atmospheric background music

    audioToggle.addEventListener('click', () => {
        if (isMuted) {
            bgMusic.play().then(() => {
                isMuted = false;
                document.body.classList.remove('audio-muted');
                audioToggle.querySelector('.audio-text').textContent = "SOUNDTRACK: ON";
            }).catch(err => {
                console.log("Audio play blocked by browser security rules", err);
            });
        } else {
            bgMusic.pause();
            isMuted = true;
            document.body.classList.add('audio-muted');
            audioToggle.querySelector('.audio-text').textContent = "SOUNDTRACK: OFF";
        }
    });

    // Handle initial browser security muted state
    document.body.classList.add('audio-muted');
    audioToggle.querySelector('.audio-text').textContent = "SOUNDTRACK: OFF";

    // Export interface functions to orchestrate sound with other components
    return {
        pauseAmbient: () => {
            if (!isMuted) bgMusic.pause();
        },
        resumeAmbient: () => {
            if (!isMuted) bgMusic.play().catch(err => console.log("Audio play blocked on resume", err));
        },
        getIsMuted: () => isMuted
    };
};
