// Main JavaScript file for Send The Light Ministries website

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navbar = document.querySelector('.navbar ul');
    
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', function(e) {
            navbar.classList.toggle('navbar-mobile');
            this.classList.toggle('fa-bars');
            this.classList.toggle('fa-times');
        });
    }

    // Smooth scroll for navigation links
    const scrollto = (el) => {
        const header = document.querySelector('#header');
        let offset = header.offsetHeight;

        const elementPos = document.querySelector(el).offsetTop;
        window.scrollTo({
            top: elementPos - offset,
            behavior: 'smooth'
        });
    };

    // Add event listeners to navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(navLink => {
        navLink.addEventListener('click', function(e) {
            if (document.querySelector('.navbar').classList.contains('navbar-mobile')) {
                e.preventDefault();
                this.nextElementSibling.classList.toggle('dropdown-active');
            }
            
            if (this.hash) {
                e.preventDefault();
                
                // Remove active class from all nav links
                document.querySelector('.navbar .active').classList.remove('active');
                
                // Add active class to current nav link
                this.classList.add('active');
                
                // Scroll to the section
                scrollto(this.hash);
            }
        });
    });

    // Scroll with offset on page load with hash links in the URL
    window.addEventListener('load', () => {
        if (window.location.hash) {
            if (document.querySelector(window.location.hash)) {
                scrollto(window.location.hash);
            }
        }
    });

    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        const toggleBacktotop = () => {
            if (window.scrollY > 100) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        };
        
        window.addEventListener('load', toggleBacktotop);
        document.addEventListener('scroll', toggleBacktotop);
        
        backToTop.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Replay button functionality
    const replayButton = document.querySelector('.btn-replay');
    if (replayButton) {
        replayButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Scroll to top of hero section
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Add animation effect (optional)
            const heroSection = document.querySelector('#hero');
            heroSection.style.opacity = 0;
            setTimeout(() => {
                heroSection.style.opacity = 1;
                heroSection.style.transition = 'opacity 1s ease-in-out';
            }, 100);
        });
    }

    // Initialize AOS (Animate On Scroll) if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
});
