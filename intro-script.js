document.addEventListener('DOMContentLoaded', function() {
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
