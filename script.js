const createPetalOverlay = () => {
    if (!document.body || document.querySelector('.petal-overlay')) {
        return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const petalOverlay = document.createElement('div');
    const petalCount = window.innerWidth <= 560 ? 8 : window.innerWidth <= 900 ? 12 : 16;

    petalOverlay.className = 'petal-overlay';
    petalOverlay.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < petalCount; index += 1) {
        const petal = document.createElement('span');
        const size = 10 + Math.random() * 12;
        const duration = 11 + Math.random() * 9;
        const drift = `${(Math.random() * 20 - 10).toFixed(2)}vw`;
        const left = `${(Math.random() * 100).toFixed(2)}%`;
        const delay = `${(-Math.random() * duration).toFixed(2)}s`;
        const opacity = (0.24 + Math.random() * 0.28).toFixed(2);
        const rotate = `${(Math.random() * 360).toFixed(2)}deg`;

        petal.className = 'petal';
        petal.style.setProperty('--petal-size', `${size.toFixed(2)}px`);
        petal.style.setProperty('--petal-duration', `${duration.toFixed(2)}s`);
        petal.style.setProperty('--petal-drift', drift);
        petal.style.setProperty('--petal-left', left);
        petal.style.setProperty('--petal-delay', delay);
        petal.style.setProperty('--petal-opacity', opacity);
        petal.style.setProperty('--petal-rotate', rotate);

        petalOverlay.appendChild(petal);
    }

    document.body.appendChild(petalOverlay);
};

createPetalOverlay();

const navbar = document.querySelector('.navbar');

// Navbar scroll effect
if (navbar) {
    const syncNavbarScrollState = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', syncNavbarScrollState);
    syncNavbarScrollState();
}

// Mobile navigation
const navToggleButton = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navbar && navToggleButton && navMenu) {
    const closeMobileMenu = () => {
        navbar.classList.remove('menu-open');
        document.body.classList.remove('menu-open');
        navToggleButton.setAttribute('aria-expanded', 'false');
    };

    navToggleButton.addEventListener('click', () => {
        const isOpen = navbar.classList.toggle('menu-open');
        document.body.classList.toggle('menu-open', isOpen);
        navToggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeMobileMenu();
        }
    });
}

// Active link highlighting
document.querySelectorAll('.nav-menu a').forEach(link => {
    if (link.href === window.location.href) {
        link.classList.add('active');
    }
});

// Smooth scroll for buttons
document.querySelectorAll('a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// RSVP form submission
const rsvpForm = document.querySelector('#rsvpForm');

if (rsvpForm) {
    const rsvpSubmitButton = rsvpForm.querySelector('.submit-btn');
    const rsvpSubmitLabel = rsvpForm.querySelector('.submit-btn-label');
    const rsvpStatus = rsvpForm.querySelector('#rsvpStatus');
    const rsvpLoadingModal = document.querySelector('#rsvpLoadingModal');
    const defaultSubmitLabel = rsvpSubmitLabel ? rsvpSubmitLabel.textContent : 'Submit RSVP';

    const setRsvpStatus = (type, message = '') => {
        if (!rsvpStatus) {
            return;
        }

        rsvpStatus.textContent = message;
        rsvpStatus.className = 'form-status';

        if (type) {
            rsvpStatus.classList.add(`is-${type}`);
        }
    };

    const setRsvpLoadingState = isLoading => {
        if (rsvpSubmitButton) {
            rsvpSubmitButton.disabled = isLoading;
            rsvpSubmitButton.classList.toggle('is-loading', isLoading);

            if (isLoading) {
                rsvpSubmitButton.setAttribute('aria-busy', 'true');
            } else {
                rsvpSubmitButton.removeAttribute('aria-busy');
            }
        }

        if (rsvpSubmitLabel) {
            rsvpSubmitLabel.textContent = isLoading ? 'Submitting...' : defaultSubmitLabel;
        }

        if (rsvpLoadingModal) {
            rsvpLoadingModal.classList.toggle('is-visible', isLoading);
            rsvpLoadingModal.setAttribute('aria-hidden', isLoading ? 'false' : 'true');
        }
    };

    const collectRsvpPayload = form => {
        const formData = new FormData(form);

        return {
            fullname: String(formData.get('fullname') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            attendance: String(formData.get('attendance') || '').trim(),
            dietary: String(formData.get('dietary') || '').trim(),
            website: String(formData.get('website') || '').trim()
        };
    };

    rsvpForm.addEventListener('submit', async event => {
        event.preventDefault();
        setRsvpStatus();

        if (!rsvpForm.checkValidity()) {
            rsvpForm.reportValidity();
            setRsvpStatus('error', 'Please complete the required fields before sending your RSVP.');
            return;
        }

        setRsvpLoadingState(true);

        try {
            const response = await fetch('/api/rsvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(collectRsvpPayload(rsvpForm))
            });

            let result = {};

            try {
                result = await response.json();
            } catch (error) {
                result = {};
            }

            if (!response.ok || result.ok === false) {
                throw new Error(result.message || 'Unable to save your RSVP right now. Please try again.');
            }

            rsvpForm.reset();
            setRsvpStatus(
                'success',
                result.message || 'Thank you for your RSVP! We look forward to celebrating with you.'
            );
        } catch (error) {
            setRsvpStatus(
                'error',
                error instanceof Error
                    ? error.message
                    : 'Unable to save your RSVP right now. Please try again.'
            );
        } finally {
            setRsvpLoadingState(false);
        }
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Gallery lightbox
const galleryLightbox = document.querySelector('#galleryLightbox');
const galleryLightboxImage = galleryLightbox ? galleryLightbox.querySelector('.lightbox-image') : null;
const galleryLightboxClose = galleryLightbox ? galleryLightbox.querySelector('.lightbox-close') : null;
const galleryLightboxPrev = galleryLightbox ? galleryLightbox.querySelector('.lightbox-prev') : null;
const galleryLightboxNext = galleryLightbox ? galleryLightbox.querySelector('.lightbox-next') : null;
const galleryImages = Array.from(document.querySelectorAll('.gallery-grid .gallery-image'));

if (galleryLightbox && galleryLightboxImage && galleryImages.length) {
    let currentImageIndex = 0;

    const renderLightboxImage = index => {
        const normalizedIndex = (index + galleryImages.length) % galleryImages.length;
        currentImageIndex = normalizedIndex;
        const image = galleryImages[currentImageIndex];
        galleryLightboxImage.src = image.src;
        galleryLightboxImage.alt = image.alt || 'Enlarged gallery image';
    };

    const openLightbox = index => {
        renderLightboxImage(index);
        galleryLightbox.classList.add('is-open');
        galleryLightbox.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');
    };

    const closeLightbox = () => {
        galleryLightbox.classList.remove('is-open');
        galleryLightbox.setAttribute('aria-hidden', 'true');
        galleryLightboxImage.src = '';
        galleryLightboxImage.alt = '';
        document.body.classList.remove('menu-open');
    };

    const showNextImage = () => renderLightboxImage(currentImageIndex + 1);
    const showPrevImage = () => renderLightboxImage(currentImageIndex - 1);

    galleryImages.forEach((image, index) => {
        image.style.cursor = 'zoom-in';
        image.addEventListener('click', () => openLightbox(index));
    });

    if (galleryLightboxClose) {
        galleryLightboxClose.addEventListener('click', closeLightbox);
    }

    if (galleryLightboxNext) {
        galleryLightboxNext.addEventListener('click', event => {
            event.stopPropagation();
            showNextImage();
        });
    }

    if (galleryLightboxPrev) {
        galleryLightboxPrev.addEventListener('click', event => {
            event.stopPropagation();
            showPrevImage();
        });
    }

    const handleNavTouch = (event, navigateFn) => {
        event.preventDefault();
        event.stopPropagation();
        navigateFn();
    };

    if (galleryLightboxNext) {
        galleryLightboxNext.addEventListener('touchstart', event => handleNavTouch(event, showNextImage), { passive: false });
    }

    if (galleryLightboxPrev) {
        galleryLightboxPrev.addEventListener('touchstart', event => handleNavTouch(event, showPrevImage), { passive: false });
    }

    galleryLightbox.addEventListener('click', event => {
        if (event.target === galleryLightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', event => {
        if (!galleryLightbox.classList.contains('is-open')) {
            return;
        }

        if (event.key === 'Escape') {
            closeLightbox();
        } else if (event.key === 'ArrowRight') {
            showNextImage();
        } else if (event.key === 'ArrowLeft') {
            showPrevImage();
        }
    });
}

// Navbar music control
const musicToggleButton = document.querySelector('.music-toggle');
const backgroundMusic = document.querySelector('#bgMusic');

if (musicToggleButton && backgroundMusic) {
    const musicLabel = musicToggleButton.querySelector('.music-label');
    const autoplayRequested = sessionStorage.getItem('autoplayMusic') === '1';
    const savedMusicState = sessionStorage.getItem('musicPlaying');

    const updateMusicButton = isPlaying => {
        musicToggleButton.classList.toggle('is-playing', isPlaying);
        musicToggleButton.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
        musicToggleButton.setAttribute(
            'aria-label',
            isPlaying ? 'Pause background music' : 'Play background music'
        );
        if (musicLabel) {
            musicLabel.textContent = isPlaying ? 'Pause' : 'Play';
        }
    };

    const playMusic = async () => {
        try {
            await backgroundMusic.play();
            sessionStorage.setItem('musicPlaying', '1');
            updateMusicButton(true);
        } catch (error) {
            sessionStorage.setItem('musicPlaying', '0');
            updateMusicButton(false);
        }
    };

    const pauseMusic = () => {
        backgroundMusic.pause();
        sessionStorage.setItem('musicPlaying', '0');
        updateMusicButton(false);
    };

    if (autoplayRequested || savedMusicState === '1') {
        playMusic();
    } else {
        updateMusicButton(false);
    }

    if (autoplayRequested) {
        sessionStorage.removeItem('autoplayMusic');
    }

    musicToggleButton.addEventListener('click', () => {
        if (backgroundMusic.paused) {
            playMusic();
        } else {
            pauseMusic();
        }
    });
}

// Home hero countdown
const heroCountdown = document.querySelector('.hero-countdown');

if (heroCountdown) {
    const targetDate = new Date(heroCountdown.dataset.countdownTarget);
    const countdownDays = heroCountdown.querySelector('[data-unit="days"]');
    const countdownHours = heroCountdown.querySelector('[data-unit="hours"]');
    const countdownMinutes = heroCountdown.querySelector('[data-unit="minutes"]');
    const countdownSeconds = heroCountdown.querySelector('[data-unit="seconds"]');
    let countdownInterval;

    const formatCountdownUnit = value => String(value).padStart(2, '0');

    const updateHeroCountdown = () => {
        const remainingMs = Math.max(targetDate.getTime() - Date.now(), 0);
        const totalSeconds = Math.floor(remainingMs / 1000);

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        countdownDays.textContent = formatCountdownUnit(days);
        countdownHours.textContent = formatCountdownUnit(hours);
        countdownMinutes.textContent = formatCountdownUnit(minutes);
        countdownSeconds.textContent = formatCountdownUnit(seconds);

        if (remainingMs === 0) {
            clearInterval(countdownInterval);
        }
    };

    updateHeroCountdown();
    countdownInterval = window.setInterval(updateHeroCountdown, 1000);
}
