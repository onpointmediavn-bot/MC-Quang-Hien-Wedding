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

    let isMuted = false; // Default to ON
    bgMusic.volume = 0.1; // 10% volume (reduced 50% from 20%)

    function playAudio() {
        bgMusic.play().then(() => {
            isMuted = false;
            document.body.classList.remove('audio-muted');
            audioToggle.querySelector('.audio-text').textContent = "SOUNDTRACK: ON";
        }).catch(err => {
            // If blocked, keep UI as ON but wait for first interaction
            isMuted = false;
            document.body.classList.remove('audio-muted');
            audioToggle.querySelector('.audio-text').textContent = "SOUNDTRACK: ON";
        });
    }

    audioToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            isMuted = false;
            document.body.classList.remove('audio-muted');
            audioToggle.querySelector('.audio-text').textContent = "SOUNDTRACK: ON";
        } else {
            bgMusic.pause();
            isMuted = true;
            document.body.classList.add('audio-muted');
            audioToggle.querySelector('.audio-text').textContent = "SOUNDTRACK: OFF";
        }
    });

    // Try playing immediately
    playAudio();

    // Browser security: play on first user interaction anywhere if still paused
    document.addEventListener('click', () => {
        if (bgMusic.paused && !isMuted) {
            bgMusic.play();
        }
    }, { once: true });

    document.addEventListener('touchstart', () => {
        if (bgMusic.paused && !isMuted) {
            bgMusic.play();
        }
    }, { once: true });

    // Ensure UI matches ON state initially
    document.body.classList.remove('audio-muted');
    audioToggle.querySelector('.audio-text').textContent = "SOUNDTRACK: ON";

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
