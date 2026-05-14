/**
 * ==========================================================================
 * MC TRỌNG KHANG — CINEMATIC ENGINE: SCROLL & PARALLAX MODULE
 * ==========================================================================
 * Orchestrates GSAP Horizontal Scroll, Hero parallax layers, and text subtitles.
 */

window.CinematicEngine = window.CinematicEngine || {};

window.CinematicEngine.initScroll = function() {
    const track = document.getElementById('filmStripTrack');
    const subtitleElement = document.getElementById('dynamicSubtitle');
    const navDots = document.querySelectorAll('.nav-dot');

    if (!track) return;

    // Check viewport (initialize horizontal GSAP on desktop & tablet in horizontal)
    let isDesktop = window.innerWidth > 768;
    let scrollTween;

    function initCinematicScroll() {
        if (isDesktop) {
            // Set up main vertical-to-horizontal pinning scroll timeline
            scrollTween = gsap.to(track, {
                x: () => -(track.scrollWidth - window.innerWidth),
                ease: 'none',
                scrollTrigger: {
                    trigger: '.scroll-container',
                    pin: true,
                    scrub: 0.3, // Ultra-responsive smooth scrolling momentum (eliminates sluggish lag)
                    start: 'top top',
                    end: () => `+=${track.scrollWidth - window.innerWidth}`,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        // Track current active section based on scroll progress
                        updateActiveDot(self.progress);
                    }
                }
            });

            // Parallax background landscape in Hero
            gsap.to('.bg-landscape', {
                x: -250,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.scene-hero',
                    containerAnimation: scrollTween,
                    start: 'left left',
                    end: 'right left',
                    scrub: true
                }
            });

            // Parallax portrait cutout (moves slightly faster)
            gsap.to('.portrait-wrapper', {
                x: -120,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.scene-hero',
                    containerAnimation: scrollTween,
                    start: 'left left',
                    end: 'right left',
                    scrub: true
                }
            });

            // Parallax text block (moves floating-ly)
            gsap.to('.hero-text-block', {
                x: -60,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.scene-hero',
                    containerAnimation: scrollTween,
                    start: 'left left',
                    end: 'right left',
                    scrub: true
                }
            });

            // About section visual drift
            gsap.fromTo('.about-frame', 
                { x: 50, rotate: -3 },
                { 
                    x: -50, 
                    rotate: 1,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.scene-about',
                        containerAnimation: scrollTween,
                        start: 'left right',
                        end: 'right left',
                        scrub: true
                    }
                }
            );

            // Subtitle Scene triggers: as camera pans past sections, update narrative subtitles
            const scenes = document.querySelectorAll('.film-scene');
            scenes.forEach((scene, index) => {
                const subtitleText = scene.getAttribute('data-subtitle');
                ScrollTrigger.create({
                    trigger: scene,
                    containerAnimation: scrollTween,
                    start: 'left 60%',
                    end: 'right 40%',
                    onEnter: () => {
                        triggerSubtitleUpdate(subtitleText);
                        updateDotByIndex(index);
                    },
                    onEnterBack: () => {
                        triggerSubtitleUpdate(subtitleText);
                        updateDotByIndex(index);
                    }
                });
            });

        } else {
            // Mobile touch horizontal scroll: trigger subtitle updates
            const scenes = document.querySelectorAll('.film-scene');
            scenes.forEach((scene, index) => {
                const subtitleText = scene.getAttribute('data-subtitle');
                ScrollTrigger.create({
                    trigger: scene,
                    scroller: '.scroll-container',
                    horizontal: true,
                    start: 'left 60%',
                    end: 'right 40%',
                    onEnter: () => {
                        triggerSubtitleUpdate(subtitleText);
                        updateDotByIndex(index);
                    },
                    onEnterBack: () => {
                        triggerSubtitleUpdate(subtitleText);
                        updateDotByIndex(index);
                    }
                });
            });
        }
    }

    initCinematicScroll();

    // Re-initialize on resize to prevent viewport glitches
    window.addEventListener('resize', () => {
        let currentMode = window.innerWidth > 768;
        if (currentMode !== isDesktop) {
            isDesktop = currentMode;
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
            gsap.set(track, { clearProps: "all" });
            gsap.set('.bg-landscape, .portrait-wrapper, .hero-text-block, .about-frame', { clearProps: "all" });
            initCinematicScroll();
        }
    });

    // POETIC SUBTITLE TRANSITION COUPLING
    function triggerSubtitleUpdate(text) {
        if (!subtitleElement) return;
        
        // Fade out
        gsap.to(subtitleElement, {
            opacity: 0,
            y: 5,
            duration: 0.3,
            onComplete: () => {
                subtitleElement.textContent = text;
                // Fade back in with typewriter/cinematic effect
                gsap.to(subtitleElement, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    ease: 'power1.out'
                });
            }
        });
    }

    // DETAILED DOT NAVIGATION COUPLING
    function updateActiveDot(progress) {
        if (!isDesktop) return;
        const totalScenes = navDots.length;
        const activeIndex = Math.min(Math.floor(progress * totalScenes), totalScenes - 1);
        
        navDots.forEach((dot, index) => {
            if (index === activeIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function updateDotByIndex(index) {
        navDots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Scroll directly to a specific horizontal scene when navigation dot is clicked
    navDots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(dot.getAttribute('data-index'));
            const totalScrollable = track.scrollWidth - window.innerWidth;
            const targetScrollY = (index / (navDots.length - 1)) * totalScrollable;
            
            // Standard scroll animation to absolute Y coordinate
            gsap.to(window, {
                scrollTo: targetScrollY,
                duration: 1.5,
                ease: 'power3.inOut'
            });
        });
    });
};
