document.addEventListener('DOMContentLoaded', function () {
    const revealElements = document.querySelectorAll('.reveal, .reveal-fade, .reveal-slide-left, .reveal-slide-right, .reveal-zoom');
    let windowHeight = window.innerHeight;
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= windowHeight * 0.85 &&
            rect.bottom >= 0
        );
    }
    function throttle(func, delay) {
        let lastCall = 0;
        return function (...args) {
            const now = new Date().getTime();
            if (now - lastCall < delay) {
                return;
            }
            lastCall = now;
            return func(...args);
        };
    }
    const revealTargets = document.querySelectorAll('.reveal, .reveal-fade, .reveal-slide-left, .reveal-slide-right, .reveal-zoom');
    function revealCheck() {
        windowHeight = window.innerHeight;
        for (let i = 0; i < revealTargets.length; i++) {
            if (isInViewport(revealTargets[i])) {
                revealTargets[i].classList.add('active');
            }
        }
    }
    setTimeout(revealCheck, 100);
    window.addEventListener('scroll', throttle(revealCheck, 100));
    window.addEventListener('resize', throttle(function () {
        windowHeight = window.innerHeight;
        revealCheck();
    }, 100));
});
