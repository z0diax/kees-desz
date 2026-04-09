document.addEventListener('DOMContentLoaded', function() {
    const createPetalOverlay = () => {
        if (!document.body || document.querySelector('.petal-overlay')) {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const petalOverlay = document.createElement('div');
        const petalCount = window.innerWidth <= 560 ? 7 : window.innerWidth <= 900 ? 10 : 14;

        petalOverlay.className = 'petal-overlay';
        petalOverlay.setAttribute('aria-hidden', 'true');

        for (let index = 0; index < petalCount; index += 1) {
            const petal = document.createElement('span');
            const size = 10 + Math.random() * 12;
            const duration = 11 + Math.random() * 9;
            const drift = `${(Math.random() * 18 - 9).toFixed(2)}vw`;
            const left = `${(Math.random() * 100).toFixed(2)}%`;
            const delay = `${(-Math.random() * duration).toFixed(2)}s`;
            const opacity = (0.22 + Math.random() * 0.24).toFixed(2);
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

    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    const sealCircle = document.querySelector('.seal-circle');
    const footerText = document.querySelector('.footer-text');
    const introContainer = document.querySelector('.intro-container');
    let isOpened = false;

    if (!envelopeWrapper || !sealCircle || !footerText || !introContainer) {
        return;
    }

    const openInvitation = () => {
        if (isOpened) {
            return;
        }

        isOpened = true;

        // Add opened class to trigger animation
        envelopeWrapper.classList.add('opened');

        // Hide footer text
        footerText.classList.add('hidden');

        // After envelope opens, start page exit
        setTimeout(function() {
            introContainer.classList.add('exit-page');
        }, 1500);

        // Redirect to homepage
        setTimeout(function() {
            sessionStorage.setItem('autoplayMusic', '1');
            window.location.href = 'home.html';
        }, 2300);
    };

    // Click on seal to open envelope
    sealCircle.addEventListener('click', function(e) {
        e.stopPropagation();
        openInvitation();
    });

    sealCircle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openInvitation();
        }
    });

    // Add hover effects
    sealCircle.addEventListener('mouseenter', function() {
        if (!isOpened) {
            this.style.cursor = 'pointer';
        }
    });

    // Add active state feedback
    sealCircle.addEventListener('mousedown', function() {
        if (!isOpened) {
            this.style.transform = 'scale(0.92)';
        }
    });

    sealCircle.addEventListener('mouseup', function() {
        if (!isOpened) {
            this.style.transform = 'scale(1.1) translateY(-5px)';
        }
    });

    sealCircle.addEventListener('mouseleave', function() {
        if (!isOpened) {
            this.style.transform = '';
        }
    });
});
