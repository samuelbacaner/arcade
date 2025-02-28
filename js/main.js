// IE11 compatible polyfill for smooth scrolling
function smoothScroll(target, duration) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Mobile navigation toggle
document.addEventListener('DOMContentLoaded', function() {
    var navToggle = document.querySelector('.nav-toggle');
    var mainNav = document.querySelector('.main-nav');
    var navLinks = document.querySelectorAll('.nav-link');

    // Show nav toggle button on mobile
    navToggle.hidden = false;

    // Toggle navigation
    navToggle.addEventListener('click', function() {
        mainNav.classList.toggle('is-active');
        var isExpanded = mainNav.classList.contains('is-active');
        navToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Handle navigation clicks
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove current page indicator from all links
            navLinks.forEach(function(link) {
                link.removeAttribute('aria-current');
            });
            
            // Set current page indicator
            this.setAttribute('aria-current', 'page');
            
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                mainNav.classList.remove('is-active');
                navToggle.setAttribute('aria-expanded', 'false');
            }

            // Smooth scroll to section
            var targetId = this.getAttribute('href');
            smoothScroll(targetId, 1000);
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        var isClickInside = navToggle.contains(e.target) || mainNav.contains(e.target);
        if (!isClickInside && mainNav.classList.contains('is-active')) {
            mainNav.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Set initial active state based on URL hash
    var hash = window.location.hash;
    if (hash) {
        var activeLink = document.querySelector('a[href="' + hash + '"]');
        if (activeLink) {
            activeLink.setAttribute('aria-current', 'page');
        }
    }
});
